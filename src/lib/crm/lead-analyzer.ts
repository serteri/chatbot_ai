/**
 * Lead Analyzer v2 — Scoring-Based Profiling Engine
 * 
 * Changes from v1:
 * - Scoring algorithm replaces if-else profiling (handles overlapping profiles)
 * - Priority hierarchy: Seller > Urgent Buyer > Investor > Renter > Undecided > Browser
 * - Dynamic heat: includes budget-location fit, not just timeline/preApproval
 * - "Data Completeness" replaces misleading "Data Confidence"
 * - Follow-up urgency timing added
 * - Mobile-responsive email HTML (no ━━ box chars, div+padding layout)
 */

// ─── Types ───────────────────────────────────────────────────────────────

export interface LeadAnalysis {
    profile: ProfileType
    profileLabel: { tr: string; en: string }
    profileScores: Record<ProfileType, number> // transparency: show all scores
    heat: 'hot' | 'warm' | 'cold'
    heatScore: number // 0-100 raw score
    heatEmoji: string
    situationAnalysis: { tr: string; en: string }
    criticalNote: { tr: string; en: string } | null
    recommendation: { tr: string; en: string }
    followUp: { tr: string; en: string }
    followUpUrgency: 'immediate' | 'today' | 'week'
    dataCompleteness: number // 0-100
}

type ProfileType = 'seller_candidate' | 'urgent_buyer' | 'investor' | 'renter' | 'undecided' | 'browser'

interface AnalyzerInput {
    intent?: string | null
    purpose?: string | null
    hasPropertyToSell?: string | null
    hasPreApproval?: boolean | null
    timeline?: string | null
    budget?: string | null
    budgetMin?: number | null
    budgetMax?: number | null
    propertyType?: string | null
    location?: string | null
    requirements?: {
        bedrooms?: string
        bathrooms?: string
        parking?: string
        features?: string[]
        propertySize?: string
        floorPreference?: string
        hasPropertyToSell?: string
        monthlyIncome?: number
        downPayment?: number
        calculatedMaxBudget?: number
        [key: string]: any
    } | null
    score?: number
    category?: string
}

// ─── Profile Labels ──────────────────────────────────────────────────────

const PROFILE_LABELS: Record<ProfileType, { tr: string; en: string }> = {
    seller_candidate: { tr: '🏠 Satıcı Adayı', en: '🏠 Seller Candidate' },
    urgent_buyer: { tr: '⚡ Acil Alıcı', en: '⚡ Urgent Buyer' },
    investor: { tr: '📊 Yatırımcı', en: '📊 Investor' },
    renter: { tr: '🔑 Kiracı', en: '🔑 Renter' },
    undecided: { tr: '🤔 Kararsız', en: '🤔 Undecided' },
    browser: { tr: '👀 Araştırmacı', en: '👀 Browser' },
}

// Priority tiebreaker: higher = wins when scores are close (within 10pts)
const PROFILE_PRIORITY: Record<ProfileType, number> = {
    seller_candidate: 60, // Highest LTV — double transaction potential
    urgent_buyer: 50,
    investor: 40,
    renter: 30,
    undecided: 20,
    browser: 10,
}

// ─── Main Entry Point ────────────────────────────────────────────────────

export function analyzeLeadData(data: AnalyzerInput): LeadAnalysis {
    const req = data.requirements || {}
    const hasPropertyToSell = req.hasPropertyToSell || data.hasPropertyToSell
    const needsToSell = checkNeedsToSell(hasPropertyToSell)

    // 1. Score every profile
    const profileScores = scoreAllProfiles(data, needsToSell)

    // 2. Pick winner with priority tiebreaker
    const profile = pickWinningProfile(profileScores)

    // 3. Dynamic heat scoring
    const heatScore = calculateHeatScore(data, needsToSell)
    const heat: 'hot' | 'warm' | 'cold' = heatScore >= 60 ? 'hot' : heatScore >= 30 ? 'warm' : 'cold'

    // 4. Analysis outputs
    const situationAnalysis = buildSituationAnalysis(profile, data, needsToSell)
    const criticalNote = identifyCriticalBlockers(data, needsToSell)
    const recommendation = buildRecommendation(profile, data, needsToSell)
    const { followUp, followUpUrgency } = buildFollowUp(heat)
    const dataCompleteness = calculateDataCompleteness(data)

    return {
        profile,
        profileLabel: PROFILE_LABELS[profile],
        profileScores,
        heat,
        heatScore,
        heatEmoji: heat === 'hot' ? '🔥' : heat === 'warm' ? '🟡' : '🔵',
        situationAnalysis,
        criticalNote,
        recommendation,
        followUp,
        followUpUrgency,
        dataCompleteness,
    }
}

// ─── Scoring Algorithm ───────────────────────────────────────────────────

function scoreAllProfiles(data: AnalyzerInput, needsToSell: boolean): Record<ProfileType, number> {
    const intent = (data.intent || '').toLowerCase()
    const purpose = (data.purpose || '').toLowerCase()
    const timeline = (data.timeline || '').toLowerCase()
    const hasPreApproval = data.hasPreApproval

    const isUrgentTimeline = timeline.includes('hemen') || timeline.includes('immediately') ||
        timeline.includes('bu ay') || timeline.includes('this month')
    const isSoonTimeline = timeline.includes('1-3') || timeline.includes('soon')
    const isBrowsingTimeline = timeline.includes('browsing') || timeline.includes('araştır') ||
        timeline.includes('later') || timeline.includes('sonra')

    const scores: Record<ProfileType, number> = {
        seller_candidate: 0,
        urgent_buyer: 0,
        investor: 0,
        renter: 0,
        undecided: 0,
        browser: 0,
    }

    // === Seller Candidate ===
    if (intent === 'sell' || intent === 'value') scores.seller_candidate += 80
    if (needsToSell) scores.seller_candidate += 30 // Has property to sell = potential listing
    if (intent === 'buy' && needsToSell) scores.seller_candidate += 20 // Sell-to-buy = double deal

    // === Urgent Buyer ===
    if (intent === 'buy') scores.urgent_buyer += 20
    if (isUrgentTimeline) scores.urgent_buyer += 35
    if (isSoonTimeline) scores.urgent_buyer += 20
    if (hasPreApproval === true) scores.urgent_buyer += 30
    if (data.budgetMax && data.budgetMax > 0) scores.urgent_buyer += 10
    if (needsToSell) scores.urgent_buyer -= 15 // Selling dependency slows urgency

    // === Investor ===
    if (purpose === 'investment' || purpose === 'yatırım') scores.investor += 60
    if (intent === 'buy' && purpose !== 'residence') scores.investor += 15
    if (data.budgetMax && data.budgetMax > 500000) scores.investor += 10 // Higher budget = investor signal

    // === Renter ===
    if (intent === 'rent' || intent === 'kiralık') scores.renter += 80

    // === Browser ===
    if (isBrowsingTimeline) scores.browser += 50
    if (!hasPreApproval && !isUrgentTimeline && !isSoonTimeline && intent === 'buy') scores.browser += 15
    if (!data.budget && !data.budgetMax) scores.browser += 10 // No budget info = less serious

    // === Undecided ===
    if (!intent || intent === '') scores.undecided += 30
    if (hasPreApproval === false && intent === 'buy') scores.undecided += 25
    if (!isUrgentTimeline && !isSoonTimeline && !isBrowsingTimeline) scores.undecided += 15

    return scores
}

function pickWinningProfile(scores: Record<ProfileType, number>): ProfileType {
    const TIEBREAKER_MARGIN = 10

    let bestProfile: ProfileType = 'undecided'
    let bestEffectiveScore = -1

    for (const [profile, score] of Object.entries(scores) as [ProfileType, number][]) {
        // Effective score = raw score + priority bonus (used only for tiebreaking)
        const effectiveScore = score + (PROFILE_PRIORITY[profile] / 10) // Priority adds max 6pts

        if (score > 0 && effectiveScore > bestEffectiveScore) {
            bestProfile = profile
            bestEffectiveScore = effectiveScore
        }
    }

    return bestProfile
}

// ─── Dynamic Heat Scoring ────────────────────────────────────────────────

function calculateHeatScore(data: AnalyzerInput, needsToSell: boolean): number {
    let score = 0
    const timeline = (data.timeline || '').toLowerCase()

    // Timeline (0-35 pts)
    if (timeline.includes('hemen') || timeline.includes('immediately') || timeline.includes('bu ay')) score += 35
    else if (timeline.includes('1-3') || timeline.includes('soon')) score += 22
    else if (timeline.includes('3-6') || timeline.includes('later')) score += 10
    else if (timeline.includes('browsing') || timeline.includes('araştır')) score += 2

    // Pre-approval (0-25 pts)
    if (data.hasPreApproval === true) score += 25
    else if (data.hasPreApproval === false) score += 3

    // Budget specificity (0-15 pts)
    if (data.budgetMax && data.budgetMax > 0) score += 10
    if (data.budget) score += 5

    // Intent signals (0-10 pts)
    if (data.intent === 'sell') score += 10
    if (data.intent === 'buy') score += 5

    // Contact completeness (0-5 pts)
    if (data.requirements?.bedrooms) score += 2
    if (data.requirements?.features?.length) score += 3

    // === PENALTIES (negative adjustments) ===

    // Selling dependency: slows everything
    if (needsToSell && data.intent === 'buy') score -= 12

    // Budget-location mismatch penalty
    // If budget seems very low for a buyer with aggressive timeline
    if (data.intent === 'buy' && data.budgetMax && data.budgetMax > 0) {
        // If they have a calculated max budget from mortgage calc, compare with stated
        const calc = data.requirements?.calculatedMaxBudget
        if (calc && data.budgetMax > calc * 1.3) {
            // Budget expectation 30%+ above what they qualify for
            score -= 10
        }
    }

    // Browsing penalty — even with high data, browsing = cold
    if (timeline.includes('browsing') || timeline.includes('araştır')) {
        score = Math.min(score, 28) // Cap at warm max
    }

    return Math.max(0, Math.min(100, score))
}

// ─── Situation Analysis ──────────────────────────────────────────────────

function buildSituationAnalysis(
    profile: ProfileType, data: AnalyzerInput, needsToSell: boolean
): { tr: string; en: string } {
    const hasBudget = !!(data.budget || data.budgetMax)
    const hasPreApproval = data.hasPreApproval

    switch (profile) {
        case 'seller_candidate':
            if (data.intent === 'buy' && needsToSell) {
                return {
                    tr: 'Hem satış hem alım potansiyeli — çift taraflı işlem fırsatı, emlakçı için yüksek LTV.',
                    en: 'Both sale and purchase potential — double transaction opportunity, high LTV for agent.'
                }
            }
            return {
                tr: 'Mülk satmak veya değerleme istiyor — listeleme fırsatı, hızlı aksiyon önemli.',
                en: 'Wants to sell or get valuation — listing opportunity, fast action matters.'
            }

        case 'urgent_buyer':
            if (hasPreApproval && hasBudget) {
                return {
                    tr: 'Kredi onaylı, bütçesi net, hızlı hareket etmek istiyor — öncelikli müşteri.',
                    en: 'Pre-approved, clear budget, wants to move fast — priority client.'
                }
            }
            if (hasPreApproval) {
                return {
                    tr: 'Kredi onaylı ve acil arıyor — bütçeye uygun seçenekleri hızla sunun.',
                    en: 'Pre-approved and looking urgently — present matching options quickly.'
                }
            }
            return {
                tr: 'Acil alıcı ama kredi onayı henüz yok — finansman sürecini paralel yürütün.',
                en: 'Urgent buyer but no pre-approval yet — run financing process in parallel.'
            }

        case 'investor':
            return {
                tr: 'Yatırım odaklı — getiri analizi, kira verimi ve değer artış projeksiyonu ile yaklaşın.',
                en: 'Investment-focused — approach with ROI analysis, rental yield, and value appreciation projections.'
            }

        case 'renter':
            return {
                tr: 'Kiralık arıyor — hızlı eşleştirme ve gösterim önceliği ile ilerleyin.',
                en: 'Looking for rental — proceed with quick matching and viewing priority.'
            }

        case 'browser':
            return {
                tr: 'Henüz araştırma aşamasında — baskı yapmadan bilgilendirici içerik ve uzun vadeli takip stratejisi.',
                en: 'Still in research phase — informational content without pressure, long-term nurture strategy.'
            }

        case 'undecided':
        default:
            if (!hasPreApproval && data.intent === 'buy') {
                return {
                    tr: 'Almak istiyor ama finansman belirsiz — kredi danışmanı yönlendirmesi ile güven inşa edin.',
                    en: 'Wants to buy but financing unclear — build trust with mortgage advisor referral.'
                }
            }
            return {
                tr: 'İlgileniyor ama henüz net bir karar yok — ihtiyaç analizi derinleştirilmeli.',
                en: 'Interested but no clear decision yet — needs deeper qualification.'
            }
    }
}

// ─── Critical Blockers ───────────────────────────────────────────────────

function identifyCriticalBlockers(
    data: AnalyzerInput, needsToSell: boolean
): { tr: string; en: string } | null {
    // Priority order: highest-impact blocker first
    if (data.intent === 'buy' && needsToSell) {
        return {
            tr: 'Mevcut mülkünü önce satması gerekiyor — alım süreci buna bağlı.',
            en: 'Needs to sell current property first — purchase timeline depends on this.'
        }
    }

    if (data.intent === 'buy' && data.hasPreApproval === false) {
        // Check if budget seems unrealistic
        const calc = data.requirements?.calculatedMaxBudget
        if (calc && data.budgetMax && data.budgetMax > calc * 1.3) {
            return {
                tr: 'Kredi onayı yok ve bütçe beklentisi hesaplanan kapasiteyi aşıyor — finansman engeli.',
                en: 'No pre-approval and budget expectation exceeds calculated capacity — financing blocker.'
            }
        }
        return {
            tr: 'Kredi ön onayı yok — finansman belirsizliği mevcut.',
            en: 'No mortgage pre-approval — financing uncertainty exists.'
        }
    }

    const timeline = (data.timeline || '').toLowerCase()
    if (data.intent === 'buy' && (timeline.includes('browsing') || timeline.includes('araştır'))) {
        return {
            tr: 'Sadece araştırma yapıyor — kısa vadede aksiyon beklemeyin.',
            en: 'Just browsing — don\'t expect action in the short term.'
        }
    }

    return null
}

// ─── Recommendation ──────────────────────────────────────────────────────

function buildRecommendation(
    profile: ProfileType, data: AnalyzerInput, needsToSell: boolean
): { tr: string; en: string } {
    switch (profile) {
        case 'seller_candidate':
            if (data.intent === 'buy' && needsToSell) {
                return {
                    tr: 'Mevcut mülkün durumunu sorun: ilan var mı, ekspertiz yapıldı mı? Çift taraflı hizmet teklif edin.',
                    en: 'Ask current property status: is it listed, appraised? Offer dual-service package.'
                }
            }
            return {
                tr: 'Ücretsiz mülk değerleme teklif edin, bölgedeki güncel satış verilerini paylaşın.',
                en: 'Offer free property valuation, share recent comparable sales data.'
            }

        case 'urgent_buyer':
            return {
                tr: 'Hemen gösterim için 2-3 uygun mülk hazırlayın, bugün/yarın randevu teklif edin.',
                en: 'Prepare 2-3 matching properties for immediate viewing, offer today/tomorrow appointment.'
            }

        case 'investor':
            return {
                tr: 'Bölgedeki kira getirisi ve değer artış verileriyle yaklaşın. Yatırım portföyü sunumu hazırlayın.',
                en: 'Approach with rental yield and capital growth data. Prepare investment portfolio presentation.'
            }

        case 'renter':
            return {
                tr: 'Taşınma tarihini ve mutlak gereksinimleri netleştirin, 3 uygun kiralık gönderin.',
                en: 'Clarify move-in date and must-have requirements, send 3 matching rentals.'
            }

        case 'browser':
            return {
                tr: 'Baskı yapmayın, bölge hakkında bilgi paylaşın. "İhtiyacınız olursa buradayım" mesajı verin.',
                en: 'Don\'t pressure. Share area insights. Convey "I\'m here when you\'re ready" message.'
            }

        case 'undecided':
        default:
            if (data.hasPreApproval === false && data.intent === 'buy') {
                return {
                    tr: 'Kredi danışmanına yönlendirin, bütçe netleşince tekrar konuşmayı planlayın.',
                    en: 'Refer to mortgage advisor, plan follow-up once budget is clarified.'
                }
            }
            return {
                tr: 'İhtiyaçlarını derinlemesine dinleyin, zaman çizelgesini ve motivasyonu netleştirin.',
                en: 'Deeply listen to needs, clarify timeline and underlying motivation.'
            }
    }
}

// ─── Follow-up Urgency ───────────────────────────────────────────────────

function buildFollowUp(heat: 'hot' | 'warm' | 'cold'): {
    followUp: { tr: string; en: string }
    followUpUrgency: 'immediate' | 'today' | 'week'
} {
    switch (heat) {
        case 'hot':
            return {
                followUp: {
                    tr: '⏰ Hemen arayın — ilk 15 dakika içinde iletişime geçin.',
                    en: '⏰ Call immediately — reach out within the first 15 minutes.'
                },
                followUpUrgency: 'immediate'
            }
        case 'warm':
            return {
                followUp: {
                    tr: '⏰ Bugün içinde arayın — iş saatlerinde iletişime geçin.',
                    en: '⏰ Call today — reach out during business hours.'
                },
                followUpUrgency: 'today'
            }
        case 'cold':
        default:
            return {
                followUp: {
                    tr: '⏰ Haftalık bültene ekleyin — 3 gün içinde takip araması yapın.',
                    en: '⏰ Add to weekly newsletter — follow up with a call within 3 days.'
                },
                followUpUrgency: 'week'
            }
    }
}

// ─── Data Completeness ───────────────────────────────────────────────────

function calculateDataCompleteness(data: AnalyzerInput): number {
    const fields = [
        !!data.intent,
        !!(data.budget || data.budgetMax),
        !!data.timeline,
        data.hasPreApproval !== null && data.hasPreApproval !== undefined,
        !!data.propertyType,
        !!data.location,
        !!data.requirements?.bedrooms,
        !!data.requirements?.bathrooms,
        !!data.requirements?.parking,
        !!(data.requirements?.features?.length),
        !!data.requirements?.propertySize,
    ]

    const filled = fields.filter(Boolean).length
    return Math.round((filled / fields.length) * 100)
}

// ─── Helpers ─────────────────────────────────────────────────────────────

function checkNeedsToSell(value: string | null | undefined): boolean {
    if (!value) return false
    const v = value.toLowerCase()
    return v.includes('evet') || v.includes('yes') || v.includes('satmam') || v === 'true'
}

// ─── Plain Text Format ──────────────────────────────────────────────────

export function formatAnalysisForAgent(analysis: LeadAnalysis, locale: 'tr' | 'en' = 'tr'): string {
    const lines: string[] = []

    lines.push(locale === 'tr' ? '-- HAREKETe GECİRİCİ ÖZET --' : '-- ACTIONABLE SUMMARY --')
    lines.push('')
    lines.push(`${analysis.heatEmoji} ${locale === 'tr' ? 'Profil' : 'Profile'}: ${analysis.profileLabel[locale]}`)
    lines.push(`${locale === 'tr' ? 'Durum' : 'Status'}: ${analysis.situationAnalysis[locale]}`)

    if (analysis.criticalNote) {
        lines.push(`${locale === 'tr' ? 'Kritik' : 'Critical'}: ${analysis.criticalNote[locale]}`)
    }

    lines.push(`${locale === 'tr' ? 'Tavsiye' : 'Advice'}: ${analysis.recommendation[locale]}`)
    lines.push(`${analysis.followUp[locale]}`)
    lines.push(`${locale === 'tr' ? 'Veri Tamlığı' : 'Data Completeness'}: %${analysis.dataCompleteness}`)

    return lines.join('\n')
}

// ─── Mobile-Responsive Email HTML ────────────────────────────────────────

export function formatAnalysisForEmail(analysis: LeadAnalysis, locale: 'tr' | 'en' = 'tr'): string {
    const heatColor = analysis.heat === 'hot' ? '#ef4444' : analysis.heat === 'warm' ? '#f59e0b' : '#3b82f6'
    const heatLabel = analysis.heat === 'hot'
        ? (locale === 'tr' ? 'SICAK' : 'HOT')
        : analysis.heat === 'warm'
            ? (locale === 'tr' ? 'ILIMAN' : 'WARM')
            : (locale === 'tr' ? 'SOĞUK' : 'COLD')

    const urgencyColor = analysis.followUpUrgency === 'immediate' ? '#dc2626'
        : analysis.followUpUrgency === 'today' ? '#f59e0b' : '#6b7280'

    return `
    <div style="margin: 16px 0; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
        <!-- Header -->
        <div style="background: ${heatColor}; color: white; padding: 12px 16px;">
            <div style="font-size: 13px; font-weight: 700; letter-spacing: 0.5px; margin: 0;">
                ${analysis.heatEmoji} ${locale === 'tr' ? 'HAREKETe GECİRİCİ ÖZET' : 'ACTIONABLE SUMMARY'}
                <span style="background: rgba(255,255,255,0.25); padding: 2px 8px; border-radius: 8px; font-size: 11px; margin-left: 6px;">${heatLabel}</span>
            </div>
        </div>
        <!-- Body -->
        <div style="padding: 0; background: #ffffff;">
            <!-- Profile -->
            <div style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9;">
                <div style="font-size: 11px; color: #94a3b8; margin-bottom: 2px;">
                    ${locale === 'tr' ? 'PROFİL' : 'PROFILE'}
                </div>
                <div style="font-size: 14px; font-weight: 600; color: #1e293b;">
                    ${analysis.profileLabel[locale]}
                </div>
            </div>
            <!-- Situation -->
            <div style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9;">
                <div style="font-size: 11px; color: #94a3b8; margin-bottom: 2px;">
                    ${locale === 'tr' ? 'DURUM ANALİZİ' : 'SITUATION'}
                </div>
                <div style="font-size: 13px; color: #334155; line-height: 1.5;">
                    ${analysis.situationAnalysis[locale]}
                </div>
            </div>
            ${analysis.criticalNote ? `
            <!-- Critical -->
            <div style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; background: #fef2f2;">
                <div style="font-size: 11px; color: #dc2626; font-weight: 600; margin-bottom: 2px;">
                    ${locale === 'tr' ? 'KRİTİK ENGEL' : 'CRITICAL BLOCKER'}
                </div>
                <div style="font-size: 13px; color: #991b1b; line-height: 1.5;">
                    ${analysis.criticalNote[locale]}
                </div>
            </div>` : ''}
            <!-- Recommendation -->
            <div style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; background: #f0fdf4;">
                <div style="font-size: 11px; color: #16a34a; font-weight: 600; margin-bottom: 2px;">
                    ${locale === 'tr' ? 'İLK ARAMADA' : 'FIRST CALL'}
                </div>
                <div style="font-size: 13px; color: #166534; line-height: 1.5;">
                    ${analysis.recommendation[locale]}
                </div>
            </div>
            <!-- Follow-up Timing -->
            <div style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; background: #fffbeb;">
                <div style="font-size: 11px; color: ${urgencyColor}; font-weight: 600; margin-bottom: 2px;">
                    ${locale === 'tr' ? 'TAKİP ZAMANI' : 'FOLLOW-UP TIMING'}
                </div>
                <div style="font-size: 13px; color: #92400e; line-height: 1.5;">
                    ${analysis.followUp[locale]}
                </div>
            </div>
            <!-- Data Completeness -->
            <div style="padding: 10px 16px; background: #f8fafc;">
                <div style="font-size: 11px; color: #94a3b8;">
                    ${locale === 'tr' ? 'Veri Tamlığı' : 'Data Completeness'}: ${analysis.dataCompleteness}% 
                    (${Math.round(analysis.dataCompleteness * 11 / 100)}/${11} ${locale === 'tr' ? 'alan dolduruldu' : 'fields filled'})
                </div>
            </div>
        </div>
    </div>`
}
