/**
 * Lead Analyzer — Actionable Summary Generator
 * 
 * Analyzes raw chatbot lead data and produces a strategic summary
 * for the real estate agent. Rules-based, no LLM needed.
 */

export interface LeadAnalysis {
    // Profile classification
    profile: 'urgent_buyer' | 'investor' | 'undecided' | 'seller_candidate' | 'renter' | 'browser'
    profileLabel: { tr: string; en: string }
    // Heat level
    heat: 'hot' | 'warm' | 'cold'
    heatEmoji: string
    // 1-sentence strategic comment
    situationAnalysis: { tr: string; en: string }
    // Critical blocker (if any)
    criticalNote: { tr: string; en: string } | null
    // First call recommendation
    recommendation: { tr: string; en: string }
    // Confidence score 0-100
    confidence: number
}

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

export function analyzeLeadData(data: AnalyzerInput): LeadAnalysis {
    const req = data.requirements || {}
    const intent = data.intent || 'buy'
    const hasPropertyToSell = req.hasPropertyToSell || data.hasPropertyToSell
    const hasPreApproval = data.hasPreApproval
    const timeline = data.timeline || ''
    const purpose = data.purpose

    // --- 1. Profile Classification ---
    const profile = classifyProfile(intent, purpose, timeline, hasPropertyToSell, hasPreApproval, data)

    // --- 2. Heat Level ---
    const heat = determineHeat(intent, timeline, hasPreApproval, hasPropertyToSell, data)

    // --- 3. Situation Analysis ---
    const situationAnalysis = buildSituationAnalysis(profile, intent, timeline, hasPreApproval, hasPropertyToSell, data)

    // --- 4. Critical Note ---
    const criticalNote = identifyCriticalBlocker(intent, hasPreApproval, hasPropertyToSell, timeline, req)

    // --- 5. Recommendation ---
    const recommendation = buildRecommendation(profile, intent, hasPreApproval, hasPropertyToSell, timeline, data)

    // --- 6. Confidence ---
    const confidence = calculateConfidence(data)

    return {
        profile: profile.id,
        profileLabel: profile.label,
        heat,
        heatEmoji: heat === 'hot' ? '🔥' : heat === 'warm' ? '🟡' : '🔵',
        situationAnalysis,
        criticalNote,
        recommendation,
        confidence,
    }
}

// --- Profile Classification ---

function classifyProfile(
    intent: string, purpose: string | null | undefined, timeline: string,
    hasPropertyToSell: string | null | undefined, hasPreApproval: boolean | null | undefined,
    data: AnalyzerInput
) {
    const timelineLC = timeline.toLowerCase()
    const isUrgent = timelineLC.includes('hemen') || timelineLC.includes('immediately') ||
        timelineLC.includes('bu ay') || timelineLC.includes('this month')
    const isSoon = timelineLC.includes('1-3') || timelineLC.includes('soon')
    const isBrowsing = timelineLC.includes('browsing') || timelineLC.includes('araştır') ||
        timelineLC.includes('later') || timelineLC.includes('sonra')

    if (intent === 'sell' || intent === 'value') {
        return { id: 'seller_candidate' as const, label: { tr: '🏠 Satıcı Adayı', en: '🏠 Seller Candidate' } }
    }

    if (intent === 'rent') {
        return { id: 'renter' as const, label: { tr: '🔑 Kiracı', en: '🔑 Renter' } }
    }

    if (purpose === 'investment') {
        return { id: 'investor' as const, label: { tr: '📊 Yatırımcı', en: '📊 Investor' } }
    }

    if ((isUrgent || isSoon) && hasPreApproval) {
        return { id: 'urgent_buyer' as const, label: { tr: '⚡ Acil Alıcı', en: '⚡ Urgent Buyer' } }
    }

    if (isBrowsing || (!hasPreApproval && !isUrgent)) {
        if (isBrowsing) {
            return { id: 'browser' as const, label: { tr: '👀 Araştırmacı', en: '👀 Browser' } }
        }
        return { id: 'undecided' as const, label: { tr: '🤔 Kararsız', en: '🤔 Undecided' } }
    }

    // Default: urgent if pre-approval + reasonable timeline
    if (hasPreApproval) {
        return { id: 'urgent_buyer' as const, label: { tr: '⚡ Acil Alıcı', en: '⚡ Urgent Buyer' } }
    }

    return { id: 'undecided' as const, label: { tr: '🤔 Kararsız', en: '🤔 Undecided' } }
}

// --- Heat Level ---

function determineHeat(
    intent: string, timeline: string, hasPreApproval: boolean | null | undefined,
    hasPropertyToSell: string | null | undefined, data: AnalyzerInput
): 'hot' | 'warm' | 'cold' {
    let heatScore = 0
    const timelineLC = timeline.toLowerCase()

    // Timeline
    if (timelineLC.includes('hemen') || timelineLC.includes('immediately') || timelineLC.includes('bu ay')) heatScore += 40
    else if (timelineLC.includes('1-3') || timelineLC.includes('soon')) heatScore += 25
    else if (timelineLC.includes('3-6') || timelineLC.includes('later')) heatScore += 10

    // Pre-approval
    if (hasPreApproval === true) heatScore += 30
    else if (hasPreApproval === false) heatScore += 5

    // Budget specificity
    if (data.budgetMax && data.budgetMax > 0) heatScore += 10

    // Intent
    if (intent === 'buy') heatScore += 5
    if (intent === 'sell') heatScore += 15

    // Property to sell blocker reduces heat
    if (hasPropertyToSell && (hasPropertyToSell.includes('Evet') || hasPropertyToSell.includes('Yes') || hasPropertyToSell.includes('satmam'))) {
        heatScore -= 10
    }

    if (heatScore >= 60) return 'hot'
    if (heatScore >= 30) return 'warm'
    return 'cold'
}

// --- Situation Analysis ---

function buildSituationAnalysis(
    profile: { id: string }, intent: string, timeline: string,
    hasPreApproval: boolean | null | undefined, hasPropertyToSell: string | null | undefined,
    data: AnalyzerInput
): { tr: string; en: string } {
    const budgetStr = data.budget || ''
    const location = data.location || ''
    const propertyType = data.propertyType || ''
    const needsToSell = hasPropertyToSell && (hasPropertyToSell.includes('Evet') || hasPropertyToSell.includes('Yes') || hasPropertyToSell.includes('satmam'))

    switch (profile.id) {
        case 'urgent_buyer':
            if (needsToSell) {
                return {
                    tr: `Acil alıcı ama önce mevcut mülkünü satması gerekiyor — çift taraflı işlem fırsatı.`,
                    en: `Urgent buyer but needs to sell current property first — double transaction opportunity.`
                }
            }
            return {
                tr: `Kredi onaylı ve hızlı hareket etmek istiyor — öncelikli müşteri.`,
                en: `Pre-approved and wants to move fast — priority client.`
            }

        case 'investor':
            return {
                tr: `Yatırım amaçlı arıyor${budgetStr ? `, bütçe ${budgetStr}` : ''} — getiri analizi ile yaklaşın.`,
                en: `Looking for investment${budgetStr ? `, budget ${budgetStr}` : ''} — approach with ROI analysis.`
            }

        case 'seller_candidate':
            return {
                tr: `Mülk satmak veya değerleme istiyor — listeleme fırsatı.`,
                en: `Wants to sell or get valuation — listing opportunity.`
            }

        case 'renter':
            return {
                tr: `Kiralık arıyor${location ? ` ${location} bölgesinde` : ''} — hızlı eşleştirme öncelikli.`,
                en: `Looking for rental${location ? ` in ${location}` : ''} — quick matching is priority.`
            }

        case 'browser':
            return {
                tr: `Henüz araştırma aşamasında — uzun vadeli takip ve bilgilendirme stratejisi uygulayın.`,
                en: `Still in research phase — apply long-term nurturing and information strategy.`
            }

        case 'undecided':
        default:
            if (!hasPreApproval) {
                return {
                    tr: `Kredi onayı yok, henüz bütçesini netleştirmemiş — finansman rehberliği ile güven kazanın.`,
                    en: `No pre-approval yet, budget unclear — build trust with financing guidance.`
                }
            }
            return {
                tr: `İlgileniyor ama henüz net bir zaman çizelgesi belirlenmemiş — ihtiyaç analizi derinleştirilmeli.`,
                en: `Interested but no clear timeline yet — needs deeper qualification.`
            }
    }
}

// --- Critical Blocker ---

function identifyCriticalBlocker(
    intent: string, hasPreApproval: boolean | null | undefined,
    hasPropertyToSell: string | null | undefined, timeline: string,
    req: Record<string, any>
): { tr: string; en: string } | null {
    const blockers: { tr: string; en: string }[] = []
    const needsToSell = hasPropertyToSell && (hasPropertyToSell.includes('Evet') || hasPropertyToSell.includes('Yes') || hasPropertyToSell.includes('satmam'))

    if (intent === 'buy' && needsToSell) {
        blockers.push({
            tr: '⚠️ Mevcut mülkünü önce satması gerekiyor — süreç buna bağlı.',
            en: '⚠️ Needs to sell current property first — timeline depends on this.'
        })
    }

    if (intent === 'buy' && hasPreApproval === false) {
        blockers.push({
            tr: '⚠️ Kredi ön onayı yok — finansman belirsizliği mevcut.',
            en: '⚠️ No mortgage pre-approval — financing uncertainty exists.'
        })
    }

    const timelineLC = timeline.toLowerCase()
    if (intent === 'buy' && (timelineLC.includes('browsing') || timelineLC.includes('araştır'))) {
        blockers.push({
            tr: '⚠️ Sadece araştırma yapıyor — acil aksiyon beklemeyin.',
            en: '⚠️ Just browsing — don\'t expect immediate action.'
        })
    }

    if (blockers.length === 0) return null

    // Return the most critical one
    return blockers[0]
}

// --- Recommendation ---

function buildRecommendation(
    profile: { id: string }, intent: string,
    hasPreApproval: boolean | null | undefined, hasPropertyToSell: string | null | undefined,
    timeline: string, data: AnalyzerInput
): { tr: string; en: string } {
    const needsToSell = hasPropertyToSell && (hasPropertyToSell.includes('Evet') || hasPropertyToSell.includes('Yes') || hasPropertyToSell.includes('satmam'))

    switch (profile.id) {
        case 'urgent_buyer':
            if (needsToSell) {
                return {
                    tr: '📞 İlk aramada mevcut mülkün durumunu sorun: ilan verildi mi, ekspertiz yapıldı mı? Çift taraflı hizmet teklif edin.',
                    en: '📞 First call: ask status of current property — is it listed, has it been appraised? Offer dual-service.'
                }
            }
            return {
                tr: '📞 İlk aramada: hemen gösterim için 2-3 uygun mülk hazırlayın, bugün veya yarın randevu teklif edin.',
                en: '📞 First call: prepare 2-3 matching properties for immediate viewing, offer appointment today/tomorrow.'
            }

        case 'investor':
            return {
                tr: '📞 İlk aramada: bölgedeki kira getirisi ve değer artış oranlarını paylaşın. Yatırım odaklı portföy sunumu hazırlayın.',
                en: '📞 First call: share rental yield and capital growth data for the area. Prepare investment-focused portfolio.'
            }

        case 'seller_candidate':
            return {
                tr: '📞 İlk aramada: ücretsiz mülk değerleme teklif edin ve bölgedeki güncel satış verilerini paylaşın.',
                en: '📞 First call: offer free property valuation and share recent comparable sales data.'
            }

        case 'renter':
            return {
                tr: '📞 İlk aramada: taşınma tarihini ve mutlak gereksinimleri netleştirin, 3 uygun kiralık gönderin.',
                en: '📞 First call: clarify move-in date and absolute requirements, send 3 matching rentals.'
            }

        case 'browser':
            return {
                tr: '📞 İlk aramada: baskı yapmayın, bölge hakkında bilgi paylaşın ve "ihtiyacınız olursa buradayım" mesajı verin. 2 hafta sonra takip edin.',
                en: '📞 First call: don\'t pressure, share area info and convey "I\'m here when you\'re ready". Follow up in 2 weeks.'
            }

        case 'undecided':
        default:
            if (!hasPreApproval && intent === 'buy') {
                return {
                    tr: '📞 İlk aramada: kredi danışmanı yönlendirmesi yapın, bütçe netleşince tekrar konuşmayı planlayın.',
                    en: '📞 First call: refer to mortgage advisor, plan follow-up once budget is clarified.'
                }
            }
            return {
                tr: '📞 İlk aramada: ihtiyaçlarını derinlemesine dinleyin, zaman çizelgesini ve motivasyonu netleştirin.',
                en: '📞 First call: deeply listen to needs, clarify timeline and motivation.'
            }
    }
}

// --- Confidence Score ---

function calculateConfidence(data: AnalyzerInput): number {
    let filled = 0
    let total = 10

    if (data.intent) filled++
    if (data.budget || data.budgetMax) filled++
    if (data.timeline) filled++
    if (data.hasPreApproval !== null && data.hasPreApproval !== undefined) filled++
    if (data.propertyType) filled++
    if (data.location) filled++
    if (data.requirements?.bedrooms) filled++
    if (data.requirements?.parking) filled++
    if (data.requirements?.features?.length) filled++
    if (data.requirements?.propertySize) filled++

    return Math.round((filled / total) * 100)
}

// --- Format for display ---

export function formatAnalysisForAgent(analysis: LeadAnalysis, locale: 'tr' | 'en' = 'tr'): string {
    const lines: string[] = []

    lines.push(`━━━━ HAREKETe GEÇİRİCİ ÖZET ━━━━`)
    lines.push(``)
    lines.push(`${analysis.heatEmoji} Profil: ${analysis.profileLabel[locale]}`)
    lines.push(`📊 Durum: ${analysis.situationAnalysis[locale]}`)

    if (analysis.criticalNote) {
        lines.push(`🚩 Kritik: ${analysis.criticalNote[locale]}`)
    }

    lines.push(`💡 Tavsiye: ${analysis.recommendation[locale]}`)
    lines.push(`📈 Veri Güveni: %${analysis.confidence}`)

    return lines.join('\n')
}

// --- Format for email HTML ---

export function formatAnalysisForEmail(analysis: LeadAnalysis, locale: 'tr' | 'en' = 'tr'): string {
    const heatColor = analysis.heat === 'hot' ? '#ef4444' : analysis.heat === 'warm' ? '#f59e0b' : '#3b82f6'
    const heatLabel = analysis.heat === 'hot'
        ? (locale === 'tr' ? 'SICAK' : 'HOT')
        : analysis.heat === 'warm'
            ? (locale === 'tr' ? 'ILIMAN' : 'WARM')
            : (locale === 'tr' ? 'SOĞUK' : 'COLD')

    return `
    <div style="background: #f8fafc; border-left: 4px solid ${heatColor}; padding: 16px; margin: 16px 0; border-radius: 0 8px 8px 0;">
        <h3 style="margin: 0 0 12px 0; color: #1e293b; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
            ${analysis.heatEmoji} ${locale === 'tr' ? 'Harekete Geçirici Özet' : 'Actionable Summary'}
            <span style="background: ${heatColor}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-left: 8px;">${heatLabel}</span>
        </h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #334155;">
            <tr>
                <td style="padding: 6px 0; font-weight: 600; width: 80px; vertical-align: top;">
                    ${locale === 'tr' ? 'Profil' : 'Profile'}:
                </td>
                <td style="padding: 6px 0;">${analysis.profileLabel[locale]}</td>
            </tr>
            <tr>
                <td style="padding: 6px 0; font-weight: 600; vertical-align: top;">
                    ${locale === 'tr' ? 'Durum' : 'Status'}:
                </td>
                <td style="padding: 6px 0;">${analysis.situationAnalysis[locale]}</td>
            </tr>
            ${analysis.criticalNote ? `
            <tr>
                <td style="padding: 6px 0; font-weight: 600; color: #dc2626; vertical-align: top;">
                    ${locale === 'tr' ? 'Kritik' : 'Critical'}:
                </td>
                <td style="padding: 6px 0; color: #dc2626;">${analysis.criticalNote[locale]}</td>
            </tr>` : ''}
            <tr style="background: #f1f5f9; border-radius: 4px;">
                <td style="padding: 8px 6px; font-weight: 600; vertical-align: top;">
                    ${locale === 'tr' ? 'Tavsiye' : 'Advice'}:
                </td>
                <td style="padding: 8px 6px; font-weight: 500;">${analysis.recommendation[locale]}</td>
            </tr>
        </table>
        <div style="margin-top: 8px; font-size: 11px; color: #94a3b8;">
            ${locale === 'tr' ? 'Veri güveni' : 'Data confidence'}: ${analysis.confidence}%
        </div>
    </div>`
}
