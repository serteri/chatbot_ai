'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
    X,
    Send,
    MessageCircle,
    Building2,
    Home,
    MapPin,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    CheckCircle,
    Phone,
    Mail,
    User,
    Wrench,
    TrendingUp,
    Flame,
    Snowflake,
    ThermometerSun,
    Camera,
    Loader2
} from 'lucide-react'
import { Lock } from 'lucide-react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'

// Demo chat limit constants
const DEMO_CHAT_STORAGE_KEY = 'pylonchat_widget_demo'
const DEMO_CHAT_MAX_MESSAGES = 5
const DEMO_CHAT_EXPIRY_HOURS = 24

// Types
interface Message {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: Date
    type?: 'text' | 'cards' | 'form' | 'appointment' | 'quick-replies' | 'lead-score' | 'photo-upload' | 'no-properties'
    data?: any
}

interface Property {
    id: string
    title: string
    price: string
    location: string
    rooms: string
    area: string | null
    image: string
    badge?: string | null
    monthlyRent?: string | null
    roi?: string | null
}

interface LeadData {
    intent?: 'buy' | 'rent' | 'sell' | 'value' | 'tenant'
    propertyType?: string
    bedrooms?: string
    bathrooms?: string
    city?: string
    suburb?: string
    budget?: string
    budgetLevel?: 'low' | 'medium' | 'high' | 'premium'
    budgetMin?: number
    budgetMax?: number
    location?: string
    timeline?: string
    timelineUrgency?: 'immediate' | 'soon' | 'later' | 'browsing'
    hasPreApproval?: boolean
    purpose?: 'investment' | 'residence'
    contactName?: string
    contactPhone?: string
    contactEmail?: string
    leadScore?: number
    leadCategory?: 'hot' | 'warm' | 'cold'
    monthlyIncome?: number
    monthlyExpenses?: number
    downPayment?: number
    calculatedMaxBudget?: number
    parking?: string
    features?: string[]
    propertySize?: string
    floorPreference?: string
    hasPropertyToSell?: string
}

interface TenantIssue {
    type: string
    description?: string
    photos?: string[]
    urgency?: 'emergency' | 'normal' | 'low'
}

interface RealEstateWidgetProps {
    locale?: string
    primaryColor?: string
    position?: 'bottom-right' | 'bottom-left'
    agentName?: string
    agentPhoto?: string
    companyLogo?: string
    chatbotIdentifier?: string // Required for API calls
    calendlyUrl?: string // Calendly booking URL (e.g., https://calendly.com/username/event)
    embedded?: boolean // When true, renders full-page without floating toggle button
    onLeadCapture?: (lead: LeadData) => void
    onHotLead?: (lead: LeadData) => void
    onTenantIssue?: (issue: TenantIssue) => void
    onAppointmentBooked?: (slot: any, lead: LeadData) => void
}


// Enhanced Lead scoring function with more qualification factors
function calculateLeadScore(lead: LeadData): { score: number; category: 'hot' | 'warm' | 'cold' } {
    let score = 0

    // Timeline urgency (max 40pts)
    if (lead.timelineUrgency === 'immediate') score += 40
    else if (lead.timelineUrgency === 'soon') score += 25
    else if (lead.timelineUrgency === 'later') score += 10

    // Pre-approval status (max 30pts)
    if (lead.hasPreApproval === true) score += 30
    else if (lead.hasPreApproval === false) score += 5

    // Budget level (max 20pts)
    if (lead.budgetLevel === 'premium') score += 20
    else if (lead.budgetLevel === 'high') score += 15
    else if (lead.budgetLevel === 'medium') score += 10
    else if (lead.budgetLevel === 'low') score += 5

    // Contact info provided (max 15pts)
    if (lead.contactPhone) score += 10
    if (lead.contactEmail) score += 5

    // Location specificity (max 10pts)
    if (lead.city) score += 5
    if (lead.suburb) score += 5

    // Property type specified (5pts)
    if (lead.propertyType) score += 5

    // Financial capacity matches or exceeds budget (10pts)
    if (lead.calculatedMaxBudget && lead.budgetMax) {
        if (lead.calculatedMaxBudget >= lead.budgetMax) score += 10
    }

    let category: 'hot' | 'warm' | 'cold'
    if (score >= 70) category = 'hot'
    else if (score >= 40) category = 'warm'
    else category = 'cold'

    return { score, category }
}

// Map property type to API value
function mapPropertyTypeToApi(type: string, locale: string): string {
    const trMap: Record<string, string> = {
        'Daire': 'apartment',
        'Villa': 'villa',
        'Müstakil Ev': 'house',
        'Arsa': 'land',
        'Ticari': 'commercial'
    }
    const enMap: Record<string, string> = {
        'Apartment': 'apartment',
        'Villa': 'villa',
        'House': 'house',
        'Land': 'land',
        'Commercial': 'commercial'
    }
    return locale === 'tr' ? trMap[type] || 'apartment' : enMap[type] || 'apartment'
}

export function RealEstateWidget({
    locale = 'tr',
    primaryColor = '#D97706',
    position = 'bottom-right',
    agentName = 'Emlak Danışmanı',
    agentPhoto,
    companyLogo,
    chatbotIdentifier,
    calendlyUrl,
    embedded = false,
    onLeadCapture,
    onHotLead,
    onTenantIssue,
    onAppointmentBooked
}: RealEstateWidgetProps) {
    const [isOpen, setIsOpen] = useState(embedded)
    const [showCalendly, setShowCalendly] = useState(false)

    // In embedded mode, always stay open
    useEffect(() => {
        if (embedded) setIsOpen(true)
    }, [embedded])
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [leadData, setLeadData] = useState<LeadData>({})
    const [currentStep, setCurrentStep] = useState<string>('initial')
    const [carouselIndex, setCarouselIndex] = useState(0)
    const [showNotification, setShowNotification] = useState(true)
    const [tenantIssue, setTenantIssue] = useState<TenantIssue>({ type: '' })
    const [loadingProperties, setLoadingProperties] = useState(false)
    const [demoChatUsed, setDemoChatUsed] = useState(0)
    const [demoChatLimit, setDemoChatLimit] = useState(DEMO_CHAT_MAX_MESSAGES)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [limitReached, setLimitReached] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const tRaw = useTranslations('widget.realestate')
    const currentLocale = useLocale()
    // Use the hook locale if available, otherwise fallback to prop (logic mostly relies on next-intl context now)

    const t = {
        title: tRaw('title'),
        subtitle: tRaw('subtitle'),
        online: tRaw('online'),
        placeholder: tRaw('placeholder'),
        welcome: tRaw('welcome'),
        quickReplies: {
            buy: tRaw('quickReplies.buy'),
            rent: tRaw('quickReplies.rent'),
            sell: tRaw('quickReplies.sell'),
            value: tRaw('quickReplies.value'),
            tenant: tRaw('quickReplies.tenant')
        },
        leadQualification: {
            propertyType: tRaw('leadQualification.propertyType'),
            purpose: tRaw('leadQualification.purpose'),
            purposeOptions: [
                tRaw('leadQualification.purposeOptions.investment'),
                tRaw('leadQualification.purposeOptions.residence'),
                tRaw('leadQualification.purposeOptions.both')
            ],
            budget: tRaw('leadQualification.budget'),
            budgetNote: tRaw('leadQualification.budgetNote'),
            location: tRaw('leadQualification.location'),
            city: tRaw('leadQualification.city'),
            cityNote: tRaw('leadQualification.cityNote'),
            suburb: tRaw('leadQualification.suburb'),
            suburbNote: tRaw('leadQualification.suburbNote'),
            bedrooms: tRaw('leadQualification.bedrooms'),
            bedroomsNote: tRaw('leadQualification.bedroomsNote'),
            bathrooms: tRaw('leadQualification.bathrooms'),
            bathroomsNote: tRaw('leadQualification.bathroomsNote'),
            timeline: tRaw('leadQualification.timeline'),
            timelineNote: tRaw('leadQualification.timelineNote'),
            preApproval: tRaw('leadQualification.preApproval'),
            preApprovalNote: tRaw('leadQualification.preApprovalNote'),
            contact: tRaw('leadQualification.contact'),
            income: tRaw('leadQualification.income'),
            incomeNote: tRaw('leadQualification.incomeNote'),
            affordabilityResult: tRaw('leadQualification.affordabilityResult'),
            affordabilityNote: tRaw('leadQualification.affordabilityNote'),
            affordabilityWarning: tRaw('leadQualification.affordabilityWarning'),
            affordabilitySuccess: tRaw('leadQualification.affordabilitySuccess'),
            expenses: tRaw('leadQualification.expenses'),
            expensesNote: tRaw('leadQualification.expensesNote'),
            downPayment: tRaw('leadQualification.downPayment'),
            downPaymentNote: tRaw('leadQualification.downPaymentNote'),
            parking: tRaw('leadQualification.parking'),
            parkingNote: tRaw('leadQualification.parkingNote'),
            features: tRaw('leadQualification.features'),
            featuresNote: tRaw('leadQualification.featuresNote'),
            propertySize: tRaw('leadQualification.propertySize'),
            propertySizeNote: tRaw('leadQualification.propertySizeNote'),
            floorPreference: tRaw('leadQualification.floorPreference'),
            floorPreferenceNote: tRaw('leadQualification.floorPreferenceNote'),
            hasPropertyToSell: tRaw('leadQualification.hasPropertyToSell'),
            hasPropertyToSellNote: tRaw('leadQualification.hasPropertyToSellNote')
        },
        propertyTypes: [
            tRaw('propertyTypes.apartment'),
            tRaw('propertyTypes.villa'),
            tRaw('propertyTypes.house'),
            tRaw('propertyTypes.land'),
            tRaw('propertyTypes.commercial')
        ],
        budgetRanges: [
            { label: tRaw('budgetRanges.label1'), min: 1000000, max: 3000000 },
            { label: tRaw('budgetRanges.label2'), min: 3000000, max: 5000000 },
            { label: tRaw('budgetRanges.label3'), min: 5000000, max: 10000000 },
            { label: tRaw('budgetRanges.label4'), min: 10000000, max: 20000000 },
            { label: tRaw('budgetRanges.label5'), min: 20000000, max: 100000000 }
        ],
        rentBudgetRanges: [
            { label: tRaw('rentBudgetRanges.label1'), min: 10000, max: 20000 },
            { label: tRaw('rentBudgetRanges.label2'), min: 20000, max: 35000 },
            { label: tRaw('rentBudgetRanges.label3'), min: 35000, max: 50000 },
            { label: tRaw('rentBudgetRanges.label4'), min: 50000, max: 75000 },
            { label: tRaw('rentBudgetRanges.label5'), min: 75000, max: 200000 }
        ],
        timelines: [
            tRaw('timelines.immediate'),
            tRaw('timelines.soon'),
            tRaw('timelines.later'),
            tRaw('timelines.browsing')
        ],
        bedroomOptions: [
            { label: tRaw('bedroomOptions.1'), value: '1' },
            { label: tRaw('bedroomOptions.2'), value: '2' },
            { label: tRaw('bedroomOptions.3'), value: '3' },
            { label: tRaw('bedroomOptions.4'), value: '4' },
            { label: tRaw('bedroomOptions.5plus'), value: '5+' },
            { label: tRaw('bedroomOptions.any'), value: 'any' }
        ],
        bathroomOptions: [
            { label: tRaw('bathroomOptions.1'), value: '1' },
            { label: tRaw('bathroomOptions.2'), value: '2' },
            { label: tRaw('bathroomOptions.3plus'), value: '3+' },
            { label: tRaw('bathroomOptions.any'), value: 'any' }
        ],
        yesNo: [
            tRaw('yesNo.yes'),
            tRaw('yesNo.no'),
            tRaw('yesNo.apply')
        ],
        parkingOptions: [
            { label: tRaw('parkingOptions.none'), value: 'none' },
            { label: tRaw('parkingOptions.1'), value: '1' },
            { label: tRaw('parkingOptions.2'), value: '2' },
            { label: tRaw('parkingOptions.3plus'), value: '3+' }
        ],
        featureOptions: [
            tRaw('featureOptions.pool'),
            tRaw('featureOptions.garden'),
            tRaw('featureOptions.balcony'),
            tRaw('featureOptions.aircon'),
            tRaw('featureOptions.security'),
            tRaw('featureOptions.gym'),
            tRaw('featureOptions.storage'),
            tRaw('featureOptions.none')
        ],
        floorOptions: [
            { label: tRaw('floorOptions.ground'), value: 'ground' },
            { label: tRaw('floorOptions.low'), value: 'low' },
            { label: tRaw('floorOptions.mid'), value: 'mid' },
            { label: tRaw('floorOptions.high'), value: 'high' },
            { label: tRaw('floorOptions.penthouse'), value: 'penthouse' },
            { label: tRaw('floorOptions.any'), value: 'any' }
        ],
        hasPropertyOptions: [
            tRaw('hasPropertyOptions.yes'),
            tRaw('hasPropertyOptions.no'),
            tRaw('hasPropertyOptions.already')
        ],
        appointmentSlots: {
            title: tRaw('appointmentSlots.title'),
            select: tRaw('appointmentSlots.select')
        },
        valuation: {
            title: tRaw('valuation.title'),
            subtitle: tRaw('valuation.subtitle'),
            address: tRaw('valuation.address'),
            area: tRaw('valuation.area'),
            rooms: tRaw('valuation.rooms'),
            buildingAge: tRaw('valuation.buildingAge'),
            submit: tRaw('valuation.submit'),
            result: tRaw('valuation.result')
        },
        tenant: {
            title: tRaw('tenant.title'),
            greeting: tRaw('tenant.greeting'),
            options: [
                tRaw('tenant.options.issue'),
                tRaw('tenant.options.payment'),
                tRaw('tenant.options.contract'),
                tRaw('tenant.options.key'),
                tRaw('tenant.options.other')
            ],
            issueTypes: {
                plumbing: tRaw('tenant.issueTypes.plumbing'),
                electrical: tRaw('tenant.issueTypes.electrical'),
                heating: tRaw('tenant.issueTypes.heating'),
                structural: tRaw('tenant.issueTypes.structural'),
                other: tRaw('tenant.issueTypes.other')
            },
            urgency: {
                emergency: tRaw('tenant.urgency.emergency'),
                normal: tRaw('tenant.urgency.normal'),
                low: tRaw('tenant.urgency.low')
            },
            photoPrompt: tRaw('tenant.photoPrompt'),
            photoButton: tRaw('tenant.photoButton'),
            submitted: tRaw('tenant.submitted'),
            rentInfo: tRaw('tenant.rentInfo'),
            contractInfo: tRaw('tenant.contractInfo')
        },
        leadScore: {
            hot: tRaw('leadScore.hot'),
            warm: tRaw('leadScore.warm'),
            cold: tRaw('leadScore.cold'),
            hotDesc: tRaw('leadScore.hotDesc'),
            warmDesc: tRaw('leadScore.warmDesc'),
            coldDesc: tRaw('leadScore.coldDesc')
        },
        messages: {
            hotLeadAlert: tRaw('messages.hotLeadAlert'),
            warmLeadAlert: tRaw('messages.warmLeadAlert'),
            coldLeadResponse: tRaw('messages.coldLeadResponse'),
            searchingProperties: tRaw('messages.searchingProperties'),
            propertiesFound: tRaw('messages.propertiesFound'),
            noPropertiesFound: tRaw('messages.noPropertiesFound'),
            investmentMatch: tRaw('messages.investmentMatch'),
            residenceMatch: tRaw('messages.residenceMatch'),
            appointmentConfirmed: tRaw('messages.appointmentConfirmed'),
            valuationResult: tRaw('messages.valuationResult'),
            upsellHigherBudget: tRaw('messages.upsellHigherBudget'),
            upsellDifferentType: tRaw('messages.upsellDifferentType'),
            upsellNearby: tRaw('messages.upsellNearby'),
            alternativeQuestion: tRaw('messages.alternativeQuestion'),
            schedulePrompt: tRaw('messages.schedulePrompt'),
            scheduleYes: tRaw('messages.scheduleYes'),
            scheduleNo: tRaw('messages.scheduleNo'),
            upsellYes: tRaw('messages.upsellYes'),
            upsellNo: tRaw('messages.upsellNo')
        },
        thankYou: tRaw('thankYou'),
        viewDetails: tRaw('viewDetails'),
        schedule: tRaw('schedule'),
        showMore: tRaw('showMore'),
        loading: tRaw('loading'),
        notificationBubble: {
            greeting: tRaw('notificationBubble.greeting'),
            subtitle: tRaw('notificationBubble.subtitle'),
            timestamp: tRaw('notificationBubble.timestamp')
        }
    }
    const positionClass = position === 'bottom-left' ? 'left-4' : 'right-4'
    const remainingMessages = demoChatLimit === -1 ? -1 : Math.max(0, demoChatLimit - demoChatUsed)

    // Check demo chat usage on mount
    // Check demo chat usage on mount
    useEffect(() => {
        const checkUsage = async () => {
            // For public demos (no chatbotIdentifier), use localStorage exclusively
            if (!chatbotIdentifier) {
                const stored = localStorage.getItem(DEMO_CHAT_STORAGE_KEY)
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored)
                        const now = Date.now()
                        if (parsed.expiry && now < parsed.expiry) {
                            setDemoChatUsed(parsed.count || 0)
                            setLimitReached((parsed.count || 0) >= DEMO_CHAT_MAX_MESSAGES)
                        } else {
                            localStorage.removeItem(DEMO_CHAT_STORAGE_KEY)
                            setDemoChatUsed(0)
                        }
                    } catch {
                        localStorage.removeItem(DEMO_CHAT_STORAGE_KEY)
                        setDemoChatUsed(0)
                    }
                }
                return
            }

            try {
                // Use chatbot owner's limits via API
                const url = `/api/demo-chat?chatbotId=${chatbotIdentifier}`
                const response = await fetch(url)
                if (response.ok) {
                    const data = await response.json()
                    setIsAuthenticated(data.authenticated)

                    if (data.authenticated || chatbotIdentifier) {
                        setDemoChatUsed(typeof data.used === 'number' ? data.used : 0)
                        setDemoChatLimit(typeof data.limit === 'number' ? data.limit : 5)
                        setLimitReached(data.limit !== -1 && (data.used || 0) >= data.limit)
                    }
                }
            } catch (error) {
                console.error('Error checking demo chat usage:', error)
            }
        }
        checkUsage()
    }, [chatbotIdentifier])

    // Increment demo chat usage
    // Increment demo chat usage
    const incrementUsage = async (): Promise<boolean> => {
        if (limitReached) return false

        // Public demo: LocalStorage only
        if (!chatbotIdentifier) {
            const newCount = demoChatUsed + 1
            if (newCount > DEMO_CHAT_MAX_MESSAGES) {
                setLimitReached(true)
                return false
            }
            setDemoChatUsed(newCount)
            localStorage.setItem(DEMO_CHAT_STORAGE_KEY, JSON.stringify({
                count: newCount,
                expiry: Date.now() + (DEMO_CHAT_EXPIRY_HOURS * 60 * 60 * 1000)
            }))
            setLimitReached(newCount >= DEMO_CHAT_MAX_MESSAGES)
            return true
        }

        try {
            const response = await fetch('/api/demo-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatbotId: chatbotIdentifier })
            })
            const data = await response.json()

            if (!data.success) {
                setLimitReached(true)
                return false
            }
            setDemoChatUsed(data.used)
            setLimitReached(data.remaining === 0)
            return true
        } catch (error) {
            console.error('Error incrementing demo chat usage:', error)
            return false
        }
    }

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [isOpen])

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            addBotMessage(t.welcome, 'quick-replies', {
                replies: Object.values(t.quickReplies)
            })
        }
    }, [isOpen])

    const addBotMessage = useCallback((content: string, type: Message['type'] = 'text', data?: any) => {
        // Don't add bot messages if limit is reached (except for system messages)
        if (limitReached && currentStep !== 'limitReached') {
            return
        }

        setIsTyping(true)
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content,
                timestamp: new Date(),
                type,
                data
            }])
            setIsTyping(false)
        }, 600 + Math.random() * 400)
    }, [limitReached, currentStep])

    const addUserMessage = useCallback(async (content: string) => {
        // Check and increment usage before allowing message
        const canSend = await incrementUsage()
        if (!canSend) {
            // Show limit reached message and block further interaction
            setCurrentStep('limitReached')
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'system',
                content: locale === 'tr'
                    ? '⚠️ Demo chat limitinize ulaştınız. Daha fazla mesaj göndermek için lütfen kayıt olun veya planınızı yükseltin.'
                    : '⚠️ You have reached your demo chat limit. Please register or upgrade your plan to send more messages.',
                timestamp: new Date(),
                type: 'text'
            }])
            return
        }

        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date(),
            type: 'text'
        }])
    }, [locale, incrementUsage])

    // Fetch properties from API
    const fetchProperties = async (purpose: string, budgetMax?: number, propertyType?: string): Promise<Property[]> => {
        if (!chatbotIdentifier) {
            console.warn('No chatbotIdentifier provided, cannot fetch properties')
            return []
        }

        try {
            const params = new URLSearchParams({
                identifier: chatbotIdentifier,
                purpose: purpose,
                listingType: leadData.intent === 'rent' ? 'rent' : 'sale'
            })

            if (budgetMax) params.append('maxPrice', budgetMax.toString())
            if (propertyType) params.append('propertyType', propertyType)

            // Add new search filters from leadData
            if (leadData.bedrooms && leadData.bedrooms !== 'any') {
                params.append('rooms', leadData.bedrooms)
            }
            if (leadData.bathrooms && leadData.bathrooms !== 'any') {
                params.append('bathrooms', leadData.bathrooms)
            }
            if (leadData.city) {
                params.append('city', leadData.city)
            }
            if (leadData.suburb) {
                params.append('district', leadData.suburb)
            }

            const response = await fetch(`/api/properties/search?${params.toString()}`)
            if (!response.ok) return []

            const data = await response.json()
            return data.properties || []
        } catch (error) {
            console.error('Error fetching properties:', error)
            return []
        }
    }

    // Fetch alternative properties with expanded criteria (for upsell)
    const fetchAlternativeProperties = async (
        purpose: string,
        budgetMax?: number,
        propertyType?: string
    ): Promise<{ properties: Property[]; reason: 'higher-budget' | 'different-type' | 'nearby' }> => {
        if (!chatbotIdentifier) {
            return { properties: [], reason: 'higher-budget' }
        }

        try {
            // Try 1: Expand budget by 25%
            const expandedBudget = budgetMax ? Math.round(budgetMax * 1.25) : undefined
            const params1 = new URLSearchParams({
                identifier: chatbotIdentifier,
                purpose: purpose,
                listingType: leadData.intent === 'rent' ? 'rent' : 'sale',
                limit: '3'
            })
            if (expandedBudget) params1.append('maxPrice', expandedBudget.toString())
            if (propertyType) params1.append('propertyType', propertyType)

            const response1 = await fetch(`/api/properties/search?${params1.toString()}`)
            if (response1.ok) {
                const data1 = await response1.json()
                if (data1.properties?.length > 0) {
                    return { properties: data1.properties.slice(0, 3), reason: 'higher-budget' }
                }
            }

            // Try 2: Remove property type filter
            const params2 = new URLSearchParams({
                identifier: chatbotIdentifier,
                purpose: purpose,
                listingType: leadData.intent === 'rent' ? 'rent' : 'sale',
                limit: '3'
            })
            if (expandedBudget) params2.append('maxPrice', expandedBudget.toString())

            const response2 = await fetch(`/api/properties/search?${params2.toString()}`)
            if (response2.ok) {
                const data2 = await response2.json()
                if (data2.properties?.length > 0) {
                    return { properties: data2.properties.slice(0, 3), reason: 'different-type' }
                }
            }

            // Try 3: Get any available properties (featured/popular)
            const params3 = new URLSearchParams({
                identifier: chatbotIdentifier,
                featured: 'true',
                limit: '3'
            })

            const response3 = await fetch(`/api/properties/search?${params3.toString()}`)
            if (response3.ok) {
                const data3 = await response3.json()
                if (data3.properties?.length > 0) {
                    return { properties: data3.properties.slice(0, 3), reason: 'nearby' }
                }
            }

            return { properties: [], reason: 'higher-budget' }
        } catch (error) {
            console.error('Error fetching alternative properties:', error)
            return { properties: [], reason: 'higher-budget' }
        }
    }

    // Save lead to API
    const saveLead = async (leadInfo: LeadData) => {
        if (!chatbotIdentifier) return

        try {
            await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: chatbotIdentifier,
                    name: leadInfo.contactName || '',
                    phone: leadInfo.contactPhone || '',
                    email: leadInfo.contactEmail || '',
                    intent: leadInfo.intent,
                    propertyType: leadInfo.propertyType,
                    purpose: leadInfo.purpose,
                    budget: leadInfo.budget,
                    budgetMin: leadInfo.budgetMin,
                    budgetMax: leadInfo.budgetMax,
                    location: `${leadInfo.city || ''} ${leadInfo.suburb || ''}`.trim(),
                    timeline: leadInfo.timeline,
                    hasPreApproval: leadInfo.hasPreApproval,
                    score: leadInfo.leadScore,
                    category: leadInfo.leadCategory,
                    requirements: {
                        bedrooms: leadInfo.bedrooms,
                        bathrooms: leadInfo.bathrooms,
                        monthlyIncome: leadInfo.monthlyIncome,
                        monthlyExpenses: leadInfo.monthlyExpenses,
                        downPayment: leadInfo.downPayment,
                        calculatedMaxBudget: leadInfo.calculatedMaxBudget,
                        housingType: leadInfo.propertyType // Add redundant for clarity
                    }
                })
            })
        } catch (error) {
            console.error('Error saving lead:', error)
        }
    }

    const handleQuickReply = async (reply: string) => {
        await addUserMessage(reply)

        // If limit reached, don't continue the flow
        if (limitReached) return

        if (reply === t.quickReplies.buy) {
            setLeadData(prev => ({ ...prev, intent: 'buy' }))
            setCurrentStep('purpose')
            setTimeout(() => {
                addBotMessage(t.leadQualification.purpose, 'quick-replies', {
                    replies: t.leadQualification.purposeOptions
                })
            }, 300)
        } else if (reply === t.quickReplies.rent) {
            setLeadData(prev => ({ ...prev, intent: 'rent' }))
            setCurrentStep('propertyType')
            setTimeout(() => {
                addBotMessage(t.leadQualification.propertyType, 'quick-replies', {
                    replies: t.propertyTypes
                })
            }, 300)
        } else if (reply === t.quickReplies.sell || reply === t.quickReplies.value) {
            setLeadData(prev => ({ ...prev, intent: reply === t.quickReplies.sell ? 'sell' : 'value' }))
            setCurrentStep('valuation')
            setTimeout(() => {
                addBotMessage(t.valuation.title, 'form', { type: 'valuation' })
            }, 300)
        } else if (reply === t.quickReplies.tenant) {
            setLeadData(prev => ({ ...prev, intent: 'tenant' }))
            setCurrentStep('tenant')
            setTimeout(() => {
                addBotMessage(t.tenant.greeting, 'quick-replies', { replies: t.tenant.options })
            }, 300)
        }
    }

    const handlePurposeSelect = async (purpose: string) => {
        await addUserMessage(purpose)
        if (limitReached) return

        const purposeValue = purpose === t.leadQualification.purposeOptions[0] ? 'investment' :
            purpose === t.leadQualification.purposeOptions[1] ? 'residence' : 'investment'
        setLeadData(prev => ({ ...prev, purpose: purposeValue }))
        setCurrentStep('propertyType')
        setTimeout(() => {
            addBotMessage(t.leadQualification.propertyType, 'quick-replies', { replies: t.propertyTypes })
        }, 300)
    }

    const handlePropertyTypeSelect = async (type: string) => {
        await addUserMessage(type)
        if (limitReached) return

        const apiType = mapPropertyTypeToApi(type, locale)
        setLeadData(prev => ({ ...prev, propertyType: apiType }))
        setCurrentStep('bedrooms')
        setTimeout(() => {
            addBotMessage(`${t.leadQualification.bedrooms}\n\n🛏️ ${t.leadQualification.bedroomsNote}`, 'quick-replies', {
                replies: t.bedroomOptions.map((b: any) => b.label)
            })
        }, 300)
    }

    const handleBedroomsSelect = async (bedroom: string) => {
        await addUserMessage(bedroom)
        if (limitReached) return

        const bedroomValue = t.bedroomOptions.find((b: any) => b.label === bedroom)?.value || bedroom
        setLeadData(prev => ({ ...prev, bedrooms: bedroomValue }))
        setCurrentStep('bathrooms')
        setTimeout(() => {
            addBotMessage(`${t.leadQualification.bathrooms}\n\n🚿 ${t.leadQualification.bathroomsNote}`, 'quick-replies', {
                replies: t.bathroomOptions.map((b: any) => b.label)
            })
        }, 300)
    }

    const handleBathroomsSelect = async (bathroom: string) => {
        await addUserMessage(bathroom)
        if (limitReached) return

        const bathroomValue = t.bathroomOptions.find((b: any) => b.label === bathroom)?.value || bathroom
        setLeadData(prev => ({ ...prev, bathrooms: bathroomValue }))
        setCurrentStep('city')
        setTimeout(() => {
            addBotMessage(`${t.leadQualification.city}\n\n📍 ${t.leadQualification.cityNote}`)
        }, 300)
    }

    const handleCityInput = async (city: string) => {
        await addUserMessage(city)
        if (limitReached) return

        setLeadData(prev => ({ ...prev, city: city.trim() }))
        setCurrentStep('suburb')
        setTimeout(() => {
            addBotMessage(`${t.leadQualification.suburb}\n\n🏘️ ${t.leadQualification.suburbNote}`)
        }, 300)
    }

    const handleSuburbInput = async (suburb: string) => {
        await addUserMessage(suburb)
        if (limitReached) return

        setLeadData(prev => ({ ...prev, suburb: suburb.trim() }))
        // After suburb, go to deep qualifying questions starting with parking
        setCurrentStep('parking')
        setTimeout(() => {
            addBotMessage(`${t.leadQualification.parking}\n\n🅿️ ${t.leadQualification.parkingNote}`, 'quick-replies', {
                replies: t.parkingOptions.map((p: any) => p.label)
            })
        }, 300)
    }

    const handleParkingSelect = async (parking: string) => {
        await addUserMessage(parking)
        if (limitReached) return

        const parkingValue = t.parkingOptions.find((p: any) => p.label === parking)?.value || parking
        setLeadData(prev => ({ ...prev, parking: parkingValue }))
        setCurrentStep('features')
        setTimeout(() => {
            addBotMessage(`${t.leadQualification.features}\n\n✨ ${t.leadQualification.featuresNote}`, 'quick-replies', {
                replies: t.featureOptions
            })
        }, 300)
    }

    const handleFeaturesSelect = async (feature: string) => {
        await addUserMessage(feature)
        if (limitReached) return

        // If they selected "no preference", skip features collection
        const noPreference = t.featureOptions[t.featureOptions.length - 1]
        if (feature === noPreference) {
            setLeadData(prev => ({ ...prev, features: [] }))
        } else {
            setLeadData(prev => ({ ...prev, features: [...(prev.features || []), feature] }))
        }

        // Move to property size
        setCurrentStep('propertySize')
        setTimeout(() => {
            addBotMessage(`${t.leadQualification.propertySize}\n\n📐 ${t.leadQualification.propertySizeNote}`)
        }, 300)
    }

    const handlePropertySizeInput = async (size: string) => {
        await addUserMessage(size)
        if (limitReached) return

        setLeadData(prev => ({ ...prev, propertySize: size.trim() }))

        // If property type is apartment/daire, ask floor preference
        const isApartment = leadData.propertyType === 'apartment' || leadData.propertyType === 'daire'
        if (isApartment) {
            setCurrentStep('floorPreference')
            setTimeout(() => {
                addBotMessage(`${t.leadQualification.floorPreference}\n\n🏢 ${t.leadQualification.floorPreferenceNote}`, 'quick-replies', {
                    replies: t.floorOptions.map((f: any) => f.label)
                })
            }, 300)
        } else if (leadData.intent === 'buy') {
            // For non-apartment buy, ask if they have property to sell
            setCurrentStep('hasPropertyToSell')
            setTimeout(() => {
                addBotMessage(`${t.leadQualification.hasPropertyToSell}\n\n🏠 ${t.leadQualification.hasPropertyToSellNote}`, 'quick-replies', {
                    replies: t.hasPropertyOptions
                })
            }, 300)
        } else {
            // Rental non-apartment — go to budget
            goToBudgetStep()
        }
    }

    const handleFloorPreferenceSelect = async (floor: string) => {
        await addUserMessage(floor)
        if (limitReached) return

        const floorValue = t.floorOptions.find((f: any) => f.label === floor)?.value || floor
        setLeadData(prev => ({ ...prev, floorPreference: floorValue }))

        // If buying, ask if they have a property to sell
        if (leadData.intent === 'buy') {
            setCurrentStep('hasPropertyToSell')
            setTimeout(() => {
                addBotMessage(`${t.leadQualification.hasPropertyToSell}\n\n🏠 ${t.leadQualification.hasPropertyToSellNote}`, 'quick-replies', {
                    replies: t.hasPropertyOptions
                })
            }, 300)
        } else {
            // Rental — go to budget
            goToBudgetStep()
        }
    }

    const handleHasPropertyToSellSelect = async (answer: string) => {
        await addUserMessage(answer)
        if (limitReached) return

        setLeadData(prev => ({ ...prev, hasPropertyToSell: answer }))
        goToBudgetStep()
    }

    const goToBudgetStep = () => {
        setCurrentStep('budget')
        setTimeout(() => {
            const isRent = leadData.intent === 'rent'
            const budgetOptions = isRent ? (t.rentBudgetRanges || []) : t.budgetRanges

            addBotMessage(`${t.leadQualification.budget}\n\n💡 ${t.leadQualification.budgetNote}`, 'quick-replies', {
                replies: budgetOptions.map((b: any) => b.label)
            })
        }, 300)
    }

    const handleBudgetSelect = async (budget: string) => {
        await addUserMessage(budget)
        if (limitReached) return

        const isRent = leadData.intent === 'rent'
        const budgetRanges = isRent ? (t.rentBudgetRanges || []) : t.budgetRanges
        const budgetRange = budgetRanges.find((b: any) => b.label === budget)

        // Calculate budget level logic
        let budgetLevel: 'low' | 'medium' | 'high' | 'premium' = 'medium'
        const budgetIndex = budgetRanges.findIndex((b: any) => b.label === budget)
        if (budgetIndex === 0) budgetLevel = 'low'
        else if (budgetIndex === 1) budgetLevel = 'medium'
        else if (budgetIndex === 2) budgetLevel = 'high'
        else budgetLevel = 'premium'

        setLeadData(prev => ({
            ...prev,
            budget,
            budgetLevel,
            budgetMin: budgetRange?.min,
            budgetMax: budgetRange?.max
        }))

        // Skip income step - go directly to timeline
        setCurrentStep('timeline')
        setTimeout(() => {
            addBotMessage(`${t.leadQualification.timeline}\n\n⏰ ${t.leadQualification.timelineNote}`, 'quick-replies', {
                replies: t.timelines
            })
        }, 300)
    }

    const handleTimelineSelect = async (timeline: string) => {
        await addUserMessage(timeline)
        if (limitReached) return

        let timelineUrgency: 'immediate' | 'soon' | 'later' | 'browsing' = 'later'
        const timelineIndex = t.timelines.indexOf(timeline)
        if (timelineIndex === 0) timelineUrgency = 'immediate'
        else if (timelineIndex === 1) timelineUrgency = 'soon'
        else if (timelineIndex === 2) timelineUrgency = 'later'
        else timelineUrgency = 'browsing'

        setLeadData(prev => ({ ...prev, timeline, timelineUrgency }))

        if (timelineUrgency === 'browsing') {
            setCurrentStep('coldLead')
            setTimeout(() => {
                addBotMessage(t.messages.coldLeadResponse, 'form', { type: 'email-only' })
            }, 300)
            return
        }

        // If Rental, skip Pre-approval and go to contact flow
        if (leadData.intent === 'rent') {
            // For rentals, we can calculate score now and proceed to matching
            // Assuming default preApproval false for rent
            const updatedLead = { ...leadData, timeline, timelineUrgency, hasPreApproval: false }
            setLeadData(updatedLead)

            const { score, category } = calculateLeadScore(updatedLead)
            updatedLead.leadScore = score
            updatedLead.leadCategory = category

            // Proceed to matching similar to handleContactSubmit or handlePreApprovalSelect end
            const matchMessage = t.messages.residenceMatch // Rentals are usually residence

            setCurrentStep('searchingProperties')
            addBotMessage(matchMessage)

            // Trigger property search
            setLoadingProperties(true)
            setTimeout(async () => {
                const properties = await fetchProperties(
                    'residence',
                    updatedLead.budgetMax,
                    updatedLead.propertyType
                )
                setLoadingProperties(false)

                if (properties.length > 0) {
                    addBotMessage(t.messages.propertiesFound, 'cards', { properties })
                    setTimeout(() => {
                        setCurrentStep('contact')
                        addBotMessage(t.leadQualification.contact, 'form', { type: 'contact', leadCategory: category })
                    }, 2000)
                } else {
                    // No properties found for rental, go straight to contact
                    addBotMessage(t.messages.noPropertiesFound, 'form', { type: 'contact', leadCategory: category })
                    setCurrentStep('contact')
                }
            }, 1000)
            return
        }

        setCurrentStep('preApproval')
        setTimeout(() => {
            addBotMessage(`${t.leadQualification.preApproval}\n\n🏦 ${t.leadQualification.preApprovalNote}`, 'quick-replies', {
                replies: t.yesNo
            })
        }, 300)
    }

    const handlePreApprovalSelect = async (answer: string) => {
        await addUserMessage(answer)
        if (limitReached) return

        const hasPreApproval = answer === t.yesNo[0]
        const updatedLead = { ...leadData, hasPreApproval }
        setLeadData(updatedLead)

        const { score, category } = calculateLeadScore(updatedLead)
        updatedLead.leadScore = score
        updatedLead.leadCategory = category

        const matchMessage = updatedLead.purpose === 'investment'
            ? t.messages.investmentMatch
            : t.messages.residenceMatch

        setCurrentStep('searchingProperties')
        addBotMessage(matchMessage)

        // Fetch real properties from API
        setLoadingProperties(true)
        setTimeout(async () => {
            const properties = await fetchProperties(
                updatedLead.purpose || 'residence',
                updatedLead.budgetMax,
                updatedLead.propertyType
            )
            setLoadingProperties(false)

            if (properties.length > 0) {
                addBotMessage(t.messages.propertiesFound, 'cards', { properties })

                setTimeout(() => {
                    setCurrentStep('contact')
                    addBotMessage(t.leadQualification.contact, 'form', {
                        type: 'contact',
                        leadCategory: category
                    })
                }, 2000)
            } else {
                // No exact matches - try to find alternatives (upsell)
                const alternatives = await fetchAlternativeProperties(
                    updatedLead.purpose || 'residence',
                    updatedLead.budgetMax,
                    updatedLead.propertyType
                )

                if (alternatives.properties.length > 0) {
                    // Show upsell message based on reason
                    const upsellMessage = alternatives.reason === 'higher-budget'
                        ? t.messages.upsellHigherBudget
                        : alternatives.reason === 'different-type'
                            ? t.messages.upsellDifferentType
                            : t.messages.upsellNearby

                    addBotMessage(upsellMessage, 'cards', { properties: alternatives.properties })

                    setTimeout(() => {
                        addBotMessage(t.messages.alternativeQuestion, 'quick-replies', {
                            replies: [t.messages.upsellYes, t.messages.upsellNo]
                        })
                        setCurrentStep('upsellResponse')
                    }, 2500)
                } else {
                    // No alternatives found either
                    addBotMessage(t.messages.noPropertiesFound, 'form', {
                        type: 'contact',
                        leadCategory: category
                    })
                    setCurrentStep('contact')
                }
            }
        }, 1000)
    }

    const handleContactSubmit = async (contactData: { name: string; phone: string; email: string }) => {
        const finalLeadData: LeadData = {
            ...leadData,
            contactName: contactData.name,
            contactPhone: contactData.phone,
            contactEmail: contactData.email
        }

        const { score, category } = calculateLeadScore(finalLeadData)
        finalLeadData.leadScore = score
        finalLeadData.leadCategory = category

        setLeadData(finalLeadData)

        // Save to API
        await saveLead(finalLeadData)

        // Trigger callbacks
        onLeadCapture?.(finalLeadData)
        if (category === 'hot') {
            onHotLead?.(finalLeadData)
        }

        let responseMessage = ''
        if (category === 'hot') {
            responseMessage = t.messages.hotLeadAlert
        } else if (category === 'warm') {
            responseMessage = t.messages.warmLeadAlert
        } else {
            responseMessage = t.thankYou
        }

        addBotMessage(responseMessage, 'lead-score', {
            score,
            category,
            labels: t.leadScore
        })

        // Score-based routing:
        // Hot leads (≥70) → Offer booking/appointment
        // Warm leads (40-69) → Thank you, agent will contact
        // Cold leads (<40) → Thank you only
        if (category === 'hot') {
            setTimeout(() => {
                addBotMessage(
                    t.messages.schedulePrompt,
                    'quick-replies',
                    {
                        replies: [t.messages.scheduleYes, t.messages.scheduleNo]
                    }
                )
                setCurrentStep('schedule-prompt')
            }, 1000)
        } else {
            setCurrentStep('complete')
        }
    }

    const handleTenantOption = (option: string) => {
        addUserMessage(option)

        if (option === t.tenant.options[0]) {
            setCurrentStep('tenantIssueType')
            setTimeout(() => {
                addBotMessage(
                    locale === 'tr' ? 'Arıza türünü seçin:' : 'Select issue type:',
                    'quick-replies',
                    { replies: Object.values(t.tenant.issueTypes) }
                )
            }, 300)
        } else if (option === t.tenant.options[1]) {
            addBotMessage(t.tenant.rentInfo)
        } else if (option === t.tenant.options[2]) {
            setCurrentStep('tenantContract')
            setTimeout(() => {
                addBotMessage(t.tenant.contractInfo, 'form', { type: 'contact' })
            }, 300)
        } else if (option === t.tenant.options[3]) {
            addBotMessage(
                locale === 'tr'
                    ? 'Anahtar teslimi için ofisimize hafta içi 09:00-18:00 arası gelebilirsiniz.\n\nAdres: [Ofis Adresi]\n\nYanınızda kimlik ve kira sözleşmesi getirmeyi unutmayın.'
                    : 'For key handover, please visit our office Monday-Friday 9AM-6PM.\n\nAddress: [Office Address]\n\nPlease bring your ID and lease agreement.'
            )
        } else {
            setCurrentStep('tenantOther')
            setTimeout(() => {
                addBotMessage(t.tenant.contractInfo, 'form', { type: 'contact' })
            }, 300)
        }
    }

    const handleTenantIssueType = (issueType: string) => {
        addUserMessage(issueType)
        setTenantIssue(prev => ({ ...prev, type: issueType }))
        setCurrentStep('tenantUrgency')
        setTimeout(() => {
            addBotMessage(
                locale === 'tr' ? 'Aciliyet durumu:' : 'Urgency level:',
                'quick-replies',
                { replies: Object.values(t.tenant.urgency) }
            )
        }, 300)
    }

    const handleTenantUrgency = (urgency: string) => {
        addUserMessage(urgency)
        let urgencyLevel: 'emergency' | 'normal' | 'low' = 'normal'
        if (urgency === t.tenant.urgency.emergency) urgencyLevel = 'emergency'
        else if (urgency === t.tenant.urgency.low) urgencyLevel = 'low'

        const updatedIssue = { ...tenantIssue, urgency: urgencyLevel }
        setTenantIssue(updatedIssue)

        if (urgencyLevel === 'emergency') {
            addBotMessage(
                locale === 'tr'
                    ? '🚨 ACİL DURUM!\n\nAcil servis hattımız: 0850 XXX XX XX\n\nEkibimiz en kısa sürede size ulaşacak. Lütfen iletişim bilgilerinizi bırakın.'
                    : '🚨 EMERGENCY!\n\nEmergency hotline: 1-800-XXX-XXXX\n\nOur team will reach you shortly. Please leave your contact info.',
                'form',
                { type: 'contact' }
            )
        } else {
            setCurrentStep('tenantPhoto')
            setTimeout(() => {
                addBotMessage(t.tenant.photoPrompt, 'photo-upload', {})
            }, 300)
        }
    }

    const handlePhotoUpload = () => {
        addBotMessage(
            locale === 'tr' ? 'Fotoğraf alındı. Şimdi iletişim bilgilerinizi paylaşır mısınız?' : 'Photo received. Please share your contact info.',
            'form',
            { type: 'contact' }
        )
        setCurrentStep('tenantContact')
    }

    const handleTenantContactSubmit = (contactData: { name: string; phone: string; email: string }) => {
        const finalIssue: TenantIssue = {
            ...tenantIssue,
            description: `${contactData.name} - ${contactData.phone}`
        }

        if (chatbotIdentifier) {
            const issueNotes = [
                `Issue: ${finalIssue.type}`,
                finalIssue.urgency ? `Urgency: ${finalIssue.urgency}` : null,
                finalIssue.description ? `Contact: ${finalIssue.description}` : null
            ].filter(Boolean).join(' | ')

            fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: chatbotIdentifier,
                    name: contactData.name,
                    phone: contactData.phone,
                    email: contactData.email,
                    intent: 'tenant',
                    notes: issueNotes,
                    requirements: {
                        issueType: finalIssue.type,
                        urgency: finalIssue.urgency
                    }
                })
            }).catch(error => {
                console.error('Failed to submit tenant lead:', error)
            })
        }

        onTenantIssue?.(finalIssue)
        addBotMessage(t.tenant.submitted)
        setCurrentStep('complete')
    }

    // Parse numerical input
    const parseNumber = (text: string): number => {
        const cleaned = text.replace(/[^0-9]/g, '')
        return parseInt(cleaned) || 0
    }

    const handleMortgageCountrySelect = (reply: string) => {
        addUserMessage(reply)
        let country = 'tr'
        if (reply.includes('Australia') || reply.includes('Avustralya')) country = 'au'
        else if (reply.includes('USA') || reply.includes('ABD')) country = 'us'
        else if (reply.includes('UK') || reply.includes('İngiltere')) country = 'uk'

        setLeadData(prev => ({ ...prev, mortgageCountry: country }))

        // Now ask for income
        setCurrentStep('income')
        setTimeout(() => {
            addBotMessage(`${t.leadQualification.income}\n\n💵 ${t.leadQualification.incomeNote}`)
        }, 300)
    }

    const handleIncomeInput = async (text: string) => {
        await addUserMessage(text)
        if (limitReached) return

        const income = parseNumber(text)
        setLeadData(prev => ({ ...prev, monthlyIncome: income }))
        setCurrentStep('expenses')
        setTimeout(() => {
            addBotMessage(`${t.leadQualification.expenses}\n\n📉 ${t.leadQualification.expensesNote}`)
        }, 300)
    }

    const handleExpensesInput = async (text: string) => {
        await addUserMessage(text)
        if (limitReached) return

        const expenses = parseNumber(text)
        setLeadData(prev => ({ ...prev, monthlyExpenses: expenses }))

        if (leadData.intent === 'rent') {
            checkAffordability(leadData.monthlyIncome || 0, expenses, 0)
        } else {
            setCurrentStep('downPayment')
            setTimeout(() => {
                addBotMessage(`${t.leadQualification.downPayment}\\n\\n💰 ${t.leadQualification.downPaymentNote}`)
            }, 300)
        }
    }

    const handleDownPaymentInput = async (text: string) => {
        await addUserMessage(text)
        if (limitReached) return

        const downPayment = parseNumber(text)
        setLeadData(prev => ({ ...prev, downPayment: downPayment }))

        checkAffordability(leadData.monthlyIncome || 0, leadData.monthlyExpenses || 0, downPayment)
    }

    const checkAffordability = (income: number, expenses: number, downPayment: number) => {
        const netIncome = income - expenses
        let maxBudget = 0

        const formatCurrency = (amount: number) => {
            return new Intl.NumberFormat(locale, { style: 'currency', currency: locale === 'tr' ? 'TRY' : 'USD', maximumFractionDigits: 0 }).format(amount)
        }

        if (leadData.intent === 'rent') {
            maxBudget = netIncome * 0.35
            setLeadData(prev => ({ ...prev, calculatedMaxBudget: maxBudget }))

            setTimeout(() => {
                addBotMessage(t.leadQualification.affordabilityResult.replace('{amount}', formatCurrency(maxBudget)))
                setTimeout(() => {
                    addBotMessage(t.leadQualification.affordabilityNote, 'quick-replies', {
                        replies: [t.yesNo.yes, t.yesNo.no]
                    })
                    setCurrentStep('affordability-confirm')
                }, 500)
            }, 500)
        } else {
            const maxMonthlyPayment = netIncome * 0.5 // More aggressive than 0.35 for MVP

            // Interest rates based on selected country
            let monthlyRate = 0.005 // Default ~6% yearly
            if (leadData.mortgageCountry === 'tr') monthlyRate = 0.025 // ~30% yearly
            else if (leadData.mortgageCountry === 'au') monthlyRate = 0.005 // ~6% yearly
            else if (leadData.mortgageCountry === 'us') monthlyRate = 0.0058 // ~7% yearly
            else if (leadData.mortgageCountry === 'uk') monthlyRate = 0.0045 // ~5.4% yearly

            const months = 360 // 30 years standard

            const maxLoan = maxMonthlyPayment * (Math.pow(1 + monthlyRate, months) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, months))

            maxBudget = maxLoan + downPayment
            setLeadData(prev => ({ ...prev, calculatedMaxBudget: maxBudget }))

            setTimeout(() => {
                addBotMessage(t.leadQualification.affordabilityResult.replace('{amount}', formatCurrency(maxBudget)))
                setTimeout(() => {
                    const statusMsg = maxBudget < (leadData.budgetMin || 0)
                        ? t.leadQualification.affordabilityWarning
                        : t.leadQualification.affordabilitySuccess

                    addBotMessage(statusMsg)

                    setTimeout(() => {
                        addBotMessage(t.leadQualification.affordabilityNote, 'quick-replies', {
                            replies: [t.yesNo.yes, t.yesNo.no]
                        })
                        setCurrentStep('affordability-confirm')
                    }, 500)
                }, 500)
            }, 500)
        }
    }

    const handleAffordabilityResponse = async (response: string) => {
        await addUserMessage(response)
        if (response === t.yesNo.yes) {
            // User accepts calculated budget or just proceeds
            if (leadData.calculatedMaxBudget) {
                setLeadData(prev => ({ ...prev, budgetMax: leadData.calculatedMaxBudget }))
            }
        }
        // FORCE FLOW TO COMPLETE - NO LOOPING BACK
        setTimeout(() => {
            addBotMessage(t.thankYou)
            setCurrentStep('complete')
        }, 500)
    }

    const handleSend = () => {
        if (!input.trim()) return

        // Handle city/suburb text input steps directly
        if (currentStep === 'income') {
            handleIncomeInput(input.trim())
            setInput('')
            return
        }
        if (currentStep === 'expenses') {
            handleExpensesInput(input.trim())
            setInput('')
            return
        }
        if (currentStep === 'downPayment') {
            handleDownPaymentInput(input.trim())
            setInput('')
            return
        }

        if (currentStep === 'city') {
            handleCityInput(input.trim())
            setInput('')
            return
        }
        if (currentStep === 'suburb') {
            handleSuburbInput(input.trim())
            setInput('')
            return
        }
        if (currentStep === 'propertySize') {
            handlePropertySizeInput(input.trim())
            setInput('')
            return
        }

        addUserMessage(input.trim())

        const userInput = input.toLowerCase()
        setInput('')

        setTimeout(async () => {
            if (userInput.includes('fiyat') || userInput.includes('price') || userInput.includes('bütçe') || userInput.includes('budget')) {
                addBotMessage(t.leadQualification.budget, 'quick-replies', {
                    replies: t.budgetRanges.map(b => b.label)
                })
                setCurrentStep('budget')
            } else if (userInput.includes('daire') || userInput.includes('ev') || userInput.includes('villa') || userInput.includes('apartment')) {
                addBotMessage(t.leadQualification.propertyType, 'quick-replies', {
                    replies: t.propertyTypes
                })
                setCurrentStep('propertyType')
            } else {
                // FALLBACK: Use AI for general questions
                if (!chatbotIdentifier) {
                    addBotMessage(
                        locale === 'tr'
                            ? 'Size yardımcı olmak için aşağıdaki seçeneklerden birini seçin:'
                            : 'Please select one of the options below:',
                        'quick-replies',
                        { replies: Object.values(t.quickReplies) }
                    )
                    return
                }

                setIsTyping(true)
                try {
                    // Sanitize messages for API
                    const apiMessages = messages.map(m => ({
                        role: m.role,
                        content: m.content
                    }))

                    const response = await fetch('/api/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            messages: [...apiMessages, { role: 'user', content: userInput }],
                            chatbotId: chatbotIdentifier,
                            mode: 'realestate',
                            language: currentLocale || locale
                        })
                    })

                    if (response.ok) {
                        const data = await response.json()
                        addBotMessage(data.response)
                    } else {
                        addBotMessage(
                            locale === 'tr'
                                ? 'Şu anda size cevap veremiyorum. Lütfen aşağıdaki seçeneklerden birini deneyin:'
                                : 'I cannot answer right now. Please try options below:',
                            'quick-replies',
                            { replies: Object.values(t.quickReplies) }
                        )
                    }
                } catch (error) {
                    console.error('AI Chat Error:', error)
                    addBotMessage(
                        locale === 'tr'
                            ? 'Bir bağlantı hatası oluştu.'
                            : 'Connection error occurred.',
                        'quick-replies',
                        { replies: Object.values(t.quickReplies) }
                    )
                } finally {
                    setIsTyping(false)
                }
            }
        }, 300)
    }

    const renderMessageContent = (message: Message) => {
        switch (message.type) {
            case 'quick-replies':
                return (
                    <div className="space-y-2">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {message.data?.replies?.map((reply: string, i: number) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        if (currentStep === 'initial') handleQuickReply(reply)
                                        else if (currentStep === 'purpose') handlePurposeSelect(reply)
                                        else if (currentStep === 'propertyType') handlePropertyTypeSelect(reply)
                                        else if (currentStep === 'bedrooms') handleBedroomsSelect(reply)
                                        else if (currentStep === 'affordability-confirm') handleAffordabilityResponse(reply)
                                        else if (currentStep === 'bathrooms') handleBathroomsSelect(reply)
                                        else if (currentStep === 'budget') handleBudgetSelect(reply)
                                        else if (currentStep === 'timeline') handleTimelineSelect(reply)
                                        else if (currentStep === 'preApproval') handlePreApprovalSelect(reply)
                                        else if (currentStep === 'parking') handleParkingSelect(reply)
                                        else if (currentStep === 'features') handleFeaturesSelect(reply)
                                        else if (currentStep === 'floorPreference') handleFloorPreferenceSelect(reply)
                                        else if (currentStep === 'hasPropertyToSell') handleHasPropertyToSellSelect(reply)
                                        else if (currentStep === 'tenant') handleTenantOption(reply)
                                        else if (currentStep === 'tenantIssueType') handleTenantIssueType(reply)
                                        else if (currentStep === 'tenantUrgency') handleTenantUrgency(reply)
                                        else if (currentStep === 'upsellResponse') {
                                            addUserMessage(reply)
                                            const isInterested = reply.includes('Evet') || reply.includes('Yes')
                                            if (isInterested) {
                                                addBotMessage(
                                                    locale === 'tr'
                                                        ? 'Harika! Bu seçeneklerden biriyle ilgileniyorsunuz. Detaylar için bilgilerinizi bırakın, danışmanımız sizi arasın:'
                                                        : 'Great! You\'re interested in one of these options. Leave your details and our advisor will call you:',
                                                    'form',
                                                    { type: 'contact', leadCategory: leadData.leadCategory }
                                                )
                                            } else {
                                                addBotMessage(
                                                    locale === 'tr'
                                                        ? 'Anlıyorum. Danışmanımız sizin için özel arama yapabilir. İletişim bilgilerinizi bırakır mısınız?'
                                                        : 'I understand. Our advisor can do a custom search for you. Would you leave your contact info?',
                                                    'form',
                                                    { type: 'contact', leadCategory: leadData.leadCategory }
                                                )
                                            }
                                            setCurrentStep('contact')
                                        } else if (currentStep === 'schedule-prompt') {
                                            addUserMessage(reply)
                                            const isYes = reply.includes('Randevu') || reply.includes('Schedule')
                                            if (isYes) {
                                                addBotMessage(t.appointmentSlots.title, 'appointment', {})
                                                setTimeout(() => {
                                                    // Offer mortgage calculator after appointment selection
                                                    addBotMessage(
                                                        locale === 'tr'
                                                            ? '💰 Kredi hesaplaması yapmamı ister misiniz? (Aylık ödeme tahmini)'
                                                            : '💰 Would you like me to calculate your mortgage? (Monthly payment estimate)',
                                                        'quick-replies',
                                                        { replies: [locale === 'tr' ? 'Evet, hesapla' : 'Yes, calculate', locale === 'tr' ? 'Hayır, teşekkürler' : 'No, thanks'] }
                                                    )
                                                    setCurrentStep('mortgage-offer')
                                                }, 2000)
                                            } else {
                                                // Offer mortgage calculator even if they don't want appointment
                                                addBotMessage(
                                                    locale === 'tr'
                                                        ? '💰 Kredi hesaplaması yapmamı ister misiniz? (Aylık ödeme tahmini)'
                                                        : '💰 Would you like me to calculate your mortgage? (Monthly payment estimate)',
                                                    'quick-replies',
                                                    { replies: [locale === 'tr' ? 'Evet, hesapla' : 'Yes, calculate', locale === 'tr' ? 'Hayır, teşekkürler' : 'No, thanks'] }
                                                )
                                                setCurrentStep('mortgage-offer')
                                            }
                                        } else if (currentStep === 'mortgage-offer') {
                                            addUserMessage(reply)
                                            const wantsMortgage = reply.includes('Evet') || reply.includes('Yes')
                                            if (wantsMortgage) {
                                                // Ask for country first
                                                addBotMessage(
                                                    locale === 'tr'
                                                        ? 'Hangi ülke/bölge için hesaplama yapalım?'
                                                        : 'Which country/region should we use for calculation?',
                                                    'quick-replies',
                                                    { replies: ['Türkiye (TR)', 'Australia (AU)', 'USA', 'UK'] }
                                                )
                                                setCurrentStep('mortgageCountry')
                                            } else {
                                                addBotMessage(t.thankYou)
                                                setCurrentStep('complete')
                                            }
                                        } else if (currentStep === 'mortgageCountry') {
                                            handleMortgageCountrySelect(reply)
                                        }
                                    }}
                                    className="px-3 py-1.5 text-sm rounded-full border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors"
                                >
                                    {reply}
                                </button>
                            ))}
                        </div>
                    </div>
                )

            case 'cards':
                const properties = message.data?.properties || []
                if (properties.length === 0) {
                    return <p className="text-sm">{message.content}</p>
                }
                return (
                    <div className="space-y-2">
                        <p className="text-sm font-medium mb-3">{message.content}</p>
                        <div className="relative">
                            <div className="overflow-hidden">
                                <div
                                    className="flex transition-transform duration-300"
                                    style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
                                >
                                    {properties.map((property: Property) => (
                                        <div key={property.id} className="min-w-full px-1">
                                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                                                <div className="relative h-32">
                                                    <img
                                                        src={property.image}
                                                        alt={property.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    {property.badge && (
                                                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full">
                                                            {property.badge}
                                                        </span>
                                                    )}
                                                    {property.roi && (
                                                        <span className="absolute top-2 right-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                                                            {property.roi}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="p-3">
                                                    <h4 className="font-semibold text-gray-900 text-sm">{property.title}</h4>
                                                    <p className="text-amber-600 font-bold mt-1">{property.price}</p>
                                                    {property.monthlyRent && (
                                                        <p className="text-green-600 text-xs">{property.monthlyRent}</p>
                                                    )}
                                                    <div className="flex items-center text-gray-500 text-xs mt-1">
                                                        <MapPin className="w-3 h-3 mr-1" />
                                                        {property.location}
                                                    </div>
                                                    <div className="flex gap-3 text-xs text-gray-500 mt-1">
                                                        <span>{property.rooms}</span>
                                                        {property.area && <span>{property.area}</span>}
                                                    </div>
                                                    <div className="flex gap-2 mt-2">
                                                        <button className="flex-1 px-2 py-1 text-xs bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors">
                                                            {t.viewDetails}
                                                        </button>
                                                        <button className="flex-1 px-2 py-1 text-xs border border-amber-600 text-amber-600 rounded hover:bg-amber-50 transition-colors">
                                                            {t.schedule}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {properties.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setCarouselIndex(Math.max(0, carouselIndex - 1))}
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/90 rounded-full shadow flex items-center justify-center hover:bg-white"
                                        disabled={carouselIndex === 0}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setCarouselIndex(Math.min(properties.length - 1, carouselIndex + 1))}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/90 rounded-full shadow flex items-center justify-center hover:bg-white"
                                        disabled={carouselIndex === properties.length - 1}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </>
                            )}
                            {properties.length > 1 && (
                                <div className="flex justify-center gap-1 mt-2">
                                    {properties.map((_: Property, i: number) => (
                                        <div
                                            key={i}
                                            className={`w-1.5 h-1.5 rounded-full transition-colors ${i === carouselIndex ? 'bg-amber-600' : 'bg-gray-300'}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )

            case 'lead-score':
                const scoreData = message.data
                const ScoreIcon = scoreData.category === 'hot' ? Flame :
                    scoreData.category === 'warm' ? ThermometerSun : Snowflake
                const scoreColor = scoreData.category === 'hot' ? 'text-red-500' :
                    scoreData.category === 'warm' ? 'text-orange-500' : 'text-blue-500'
                const scoreBg = scoreData.category === 'hot' ? 'bg-red-50 border-red-200' :
                    scoreData.category === 'warm' ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'

                return (
                    <div className="space-y-2">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${scoreBg}`}>
                            <ScoreIcon className={`w-5 h-5 ${scoreColor}`} />
                            <div>
                                <p className={`font-semibold text-sm ${scoreColor}`}>
                                    {scoreData.labels[scoreData.category]}
                                </p>
                                <p className="text-xs text-gray-600">
                                    {scoreData.labels[`${scoreData.category}Desc`]}
                                </p>
                            </div>
                        </div>
                        {/* Calendly Booking Button for Hot/Warm Leads */}
                        {calendlyUrl && (scoreData.category === 'hot' || scoreData.category === 'warm') && (
                            <button
                                onClick={() => {
                                    // Open Calendly in popup or new tab
                                    const width = 600
                                    const height = 700
                                    const left = (window.innerWidth - width) / 2
                                    const top = (window.innerHeight - height) / 2
                                    window.open(
                                        calendlyUrl,
                                        'calendly',
                                        `width=${width},height=${height},left=${left},top=${top}`
                                    )
                                }}
                                className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
                            >
                                <Calendar className="w-4 h-4" />
                                {locale === 'tr' ? 'Hemen Randevu Al' : 'Book Appointment Now'}
                            </button>
                        )}
                    </div>
                )

            case 'form':
                if (message.data?.type === 'contact') {
                    return <ContactForm
                        onSubmit={currentStep.includes('tenant') ? handleTenantContactSubmit : handleContactSubmit}
                        locale={locale}
                        leadCategory={message.data?.leadCategory}
                    />
                }
                if (message.data?.type === 'valuation') {
                    return <ValuationForm locale={locale} onSubmit={(data) => {
                        addUserMessage(`${data.address} - ${data.area}m² - ${data.rooms}`)
                        const minValue = parseInt(data.area) * 40000
                        const maxValue = parseInt(data.area) * 55000
                        addBotMessage(
                            `${t.messages.valuationResult}\n\n${t.valuation.result}:\n💰 ${minValue.toLocaleString()} TL - ${maxValue.toLocaleString()} TL\n\n📊 Bu değerleme yapay zeka tahminidir. Kesin değer için uzman değerleme gerekir.\n\nDetaylı değerleme raporu için iletişim bilgilerinizi paylaşın:`
                        )
                        setTimeout(() => {
                            addBotMessage(t.leadQualification.contact, 'form', { type: 'contact' })
                        }, 1500)
                    }} />
                }
                if (message.data?.type === 'email-only') {
                    return <EmailOnlyForm locale={locale} onSubmit={async (email) => {
                        addUserMessage(email)

                        // Save lead with email to database and notify realtor
                        try {
                            const response = await fetch('/api/leads', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    identifier: chatbotIdentifier,
                                    name: leadData.contactName || 'Araştırma yapan müşteri',
                                    phone: leadData.contactPhone || '',
                                    email: email,
                                    intent: leadData.intent || 'research',
                                    propertyType: leadData.preferences?.propertyType,
                                    budget: leadData.preferences?.budget,
                                    timeline: leadData.preferences?.timeline,
                                    notes: 'Piyasa raporları istedi',
                                    source: 'email-reports'
                                })
                            })
                            console.log('Lead saved for email reports:', response.ok)
                        } catch (err) {
                            console.error('Failed to save email lead:', err)
                        }

                        addBotMessage(
                            locale === 'tr'
                                ? `Teşekkürler! Piyasa raporlarını ${email} adresine göndereceğiz.\n\nAraştırma sürecinizde sorularınız olursa bize yazın!`
                                : `Thanks! We'll send market reports to ${email}.\n\nFeel free to reach out if you have questions during your research!`
                        )
                    }} />
                }
                return <p className="text-sm">{message.content}</p>

            case 'appointment':
                // If Calendly URL is available, embed Calendly
                if (calendlyUrl) {
                    return (
                        <div className="space-y-2">
                            <p className="text-sm font-medium mb-2">{message.content}</p>
                            <div className="rounded-lg overflow-hidden border border-gray-200" style={{ height: '400px' }}>
                                <iframe
                                    src={`${calendlyUrl}?hide_event_type_details=1&hide_gdpr_banner=1&primary_color=${primaryColor.replace('#', '')}`}
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    title="Schedule Appointment"
                                    style={{ minHeight: '400px' }}
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 text-center mt-1">
                                {locale === 'tr' ? 'Uygun bir zaman seçin' : 'Select a convenient time'}
                            </p>
                        </div>
                    )
                }
                // Fallback to built-in appointment slot picker
                return <AppointmentSlotPicker
                    locale={locale}
                    identifier={chatbotIdentifier || ''}
                    leadData={leadData}
                    onSlotSelected={(slot) => {
                        addUserMessage(`${slot.date} - ${slot.time}`)
                        addBotMessage(
                            locale === 'tr'
                                ? `Harika seçim! ${slot.date} tarihinde saat ${slot.time} için randevunuz alındı.\n\n${t.messages.appointmentConfirmed}`
                                : `Great choice! Your appointment is booked for ${slot.date} at ${slot.time}.\n\n${t.messages.appointmentConfirmed}`
                        )
                        onAppointmentBooked?.(slot, leadData)
                        setCurrentStep('complete')
                    }}
                />

            case 'photo-upload':
                return (
                    <div className="space-y-2">
                        <p className="text-sm">{message.content}</p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoUpload}
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors"
                            >
                                <Camera className="w-4 h-4" />
                                {t.tenant.photoButton}
                            </button>
                            <button
                                onClick={() => {
                                    addBotMessage(
                                        locale === 'tr' ? 'Fotoğraf olmadan devam ediyoruz. İletişim bilgilerinizi paylaşır mısınız?' : 'Continuing without photo. Please share your contact info.',
                                        'form',
                                        { type: 'contact' }
                                    )
                                    setCurrentStep('tenantContact')
                                }}
                                className="px-3 py-2 text-sm rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
                            >
                                {locale === 'tr' ? 'Atla' : 'Skip'}
                            </button>
                        </div>
                    </div>
                )

            default:
                return <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        }
    }

    return (
        <>
            {!embedded && !isOpen && (
                <div className={`fixed bottom-4 ${positionClass} z-50`}>
                    {showNotification && (
                        <div className="absolute -top-2 -right-2 flex items-center justify-center">
                            <span className="relative flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 items-center justify-center text-white text-[10px] font-bold">1</span>
                            </span>
                        </div>
                    )}

                    <div className="flex items-end gap-2">
                        {showNotification && (
                            <div
                                className="bg-white rounded-2xl rounded-br-sm shadow-lg p-3 max-w-[220px] animate-fade-in cursor-pointer border border-gray-100"
                                onClick={() => {
                                    setIsOpen(true)
                                    setShowNotification(false)
                                }}
                            >
                                <p className="text-xs text-gray-700 font-medium">
                                    {t.notificationBubble.greeting}
                                </p>
                                <p className="text-[10px] text-gray-500 mt-1">
                                    {t.notificationBubble.subtitle}
                                </p>
                                <span className="text-[10px] text-gray-400 mt-1 block">
                                    {t.notificationBubble.timestamp}
                                </span>
                            </div>
                        )}

                        <button
                            onClick={() => {
                                setIsOpen(true)
                                setShowNotification(false)
                            }}
                            className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 hover:shadow-xl"
                            style={{ backgroundColor: primaryColor }}
                        >
                            {companyLogo ? (
                                <img src={companyLogo} alt="Logo" className="w-8 h-8 object-contain" />
                            ) : (
                                <MessageCircle className="w-7 h-7 text-white" />
                            )}
                        </button>
                    </div>
                </div>
            )}

            {isOpen && (
                <div className={`${embedded ? 'relative w-full h-full' : `fixed bottom-4 ${positionClass} z-50 w-[360px] h-[540px]`} bg-white ${embedded ? '' : 'rounded-2xl'} shadow-2xl flex flex-col overflow-hidden ${embedded ? '' : 'animate-slide-up'}`}>
                    <div
                        className="px-4 py-3 flex items-center justify-between"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                {agentPhoto ? (
                                    <img src={agentPhoto} alt={agentName} className="w-10 h-10 rounded-full object-cover border-2 border-white/30" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                        <Building2 className="w-5 h-5 text-white" />
                                    </div>
                                )}
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-white text-sm">{t.title}</h3>
                                <p className="text-white/80 text-xs flex items-center">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></span>
                                    {t.online} • {t.subtitle}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Demo usage badge */}
                            {remainingMessages !== -1 && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${remainingMessages > 2 ? 'bg-white/20' : remainingMessages > 0 ? 'bg-orange-500' : 'bg-red-500'} text-white`}>
                                    {remainingMessages}/{demoChatLimit}
                                </span>
                            )}
                            {!embedded && (
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div
                        className="flex-1 overflow-y-auto p-4 space-y-3"
                        style={{
                            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23f59e0b\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                            backgroundColor: '#fefce8'
                        }}
                    >
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-3 py-2 shadow-sm ${message.role === 'user'
                                        ? 'bg-amber-600 text-white rounded-br-sm'
                                        : 'bg-white text-gray-800 rounded-bl-sm'
                                        }`}
                                >
                                    {renderMessageContent(message)}
                                    <div className={`text-[10px] mt-1 flex items-center ${message.role === 'user' ? 'text-amber-200 justify-end' : 'text-gray-400'}`}>
                                        {message.timestamp.toLocaleTimeString(locale === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                        {message.role === 'user' && <CheckCircle className="w-3 h-3 ml-1" />}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {(isTyping || loadingProperties) && (
                            <div className="flex justify-start">
                                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    <div className="border-t bg-white p-3">
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder={t.placeholder}
                                className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim()}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                                style={{ backgroundColor: primaryColor }}
                            >
                                <Send className="w-5 h-5 text-white" />
                            </button>
                        </div>
                        <p className="text-center text-[10px] text-gray-400 mt-2">
                            Powered by <span className="font-semibold text-amber-600">PylonChat</span>
                        </p>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-slide-up { animation: slide-up 0.3s ease-out; }
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
            `}</style>
        </>
    )
}

// Comprehensive worldwide country codes
const COUNTRY_CODES = [
    // Popular / Most Used
    { code: '+1', flag: '🇺🇸', iso: 'US', name: 'United States', phoneFmt: '10' },
    { code: '+1', flag: '🇨🇦', iso: 'CA', name: 'Canada', phoneFmt: '10' },
    { code: '+44', flag: '🇬🇧', iso: 'GB', name: 'United Kingdom', phoneFmt: '10-11' },
    { code: '+61', flag: '🇦🇺', iso: 'AU', name: 'Australia', phoneFmt: '9' },
    { code: '+90', flag: '🇹🇷', iso: 'TR', name: 'Turkey', phoneFmt: '10' },
    { code: '+49', flag: '🇩🇪', iso: 'DE', name: 'Germany', phoneFmt: '10-11' },
    { code: '+33', flag: '🇫🇷', iso: 'FR', name: 'France', phoneFmt: '9' },
    { code: '+34', flag: '🇪🇸', iso: 'ES', name: 'Spain', phoneFmt: '9' },
    { code: '+39', flag: '🇮🇹', iso: 'IT', name: 'Italy', phoneFmt: '9-10' },
    { code: '+31', flag: '🇳🇱', iso: 'NL', name: 'Netherlands', phoneFmt: '9' },
    { code: '+32', flag: '🇧🇪', iso: 'BE', name: 'Belgium', phoneFmt: '9' },
    { code: '+41', flag: '🇨🇭', iso: 'CH', name: 'Switzerland', phoneFmt: '9' },
    { code: '+43', flag: '🇦🇹', iso: 'AT', name: 'Austria', phoneFmt: '10-11' },
    { code: '+46', flag: '🇸🇪', iso: 'SE', name: 'Sweden', phoneFmt: '9-10' },
    { code: '+47', flag: '🇳🇴', iso: 'NO', name: 'Norway', phoneFmt: '8' },
    { code: '+45', flag: '🇩🇰', iso: 'DK', name: 'Denmark', phoneFmt: '8' },
    { code: '+358', flag: '🇫🇮', iso: 'FI', name: 'Finland', phoneFmt: '9-10' },
    { code: '+48', flag: '🇵🇱', iso: 'PL', name: 'Poland', phoneFmt: '9' },
    { code: '+420', flag: '🇨🇿', iso: 'CZ', name: 'Czech Republic', phoneFmt: '9' },
    { code: '+36', flag: '🇭🇺', iso: 'HU', name: 'Hungary', phoneFmt: '9' },
    { code: '+40', flag: '🇷🇴', iso: 'RO', name: 'Romania', phoneFmt: '9' },
    { code: '+30', flag: '🇬🇷', iso: 'GR', name: 'Greece', phoneFmt: '10' },
    { code: '+351', flag: '🇵🇹', iso: 'PT', name: 'Portugal', phoneFmt: '9' },
    { code: '+353', flag: '🇮🇪', iso: 'IE', name: 'Ireland', phoneFmt: '9' },
    { code: '+354', flag: '🇮🇸', iso: 'IS', name: 'Iceland', phoneFmt: '7' },
    { code: '+352', flag: '🇱🇺', iso: 'LU', name: 'Luxembourg', phoneFmt: '9' },
    { code: '+370', flag: '🇱🇹', iso: 'LT', name: 'Lithuania', phoneFmt: '8' },
    { code: '+371', flag: '🇱🇻', iso: 'LV', name: 'Latvia', phoneFmt: '8' },
    { code: '+372', flag: '🇪🇪', iso: 'EE', name: 'Estonia', phoneFmt: '7-8' },
    { code: '+380', flag: '🇺🇦', iso: 'UA', name: 'Ukraine', phoneFmt: '9' },
    { code: '+385', flag: '🇭🇷', iso: 'HR', name: 'Croatia', phoneFmt: '9' },
    { code: '+381', flag: '🇷🇸', iso: 'RS', name: 'Serbia', phoneFmt: '9' },
    { code: '+386', flag: '🇸🇮', iso: 'SI', name: 'Slovenia', phoneFmt: '8' },
    { code: '+387', flag: '🇧🇦', iso: 'BA', name: 'Bosnia', phoneFmt: '8' },
    { code: '+389', flag: '🇲🇰', iso: 'MK', name: 'North Macedonia', phoneFmt: '8' },
    { code: '+355', flag: '🇦🇱', iso: 'AL', name: 'Albania', phoneFmt: '9' },
    { code: '+359', flag: '🇧🇬', iso: 'BG', name: 'Bulgaria', phoneFmt: '9' },
    { code: '+373', flag: '🇲🇩', iso: 'MD', name: 'Moldova', phoneFmt: '8' },
    { code: '+374', flag: '🇦🇲', iso: 'AM', name: 'Armenia', phoneFmt: '8' },
    { code: '+995', flag: '🇬🇪', iso: 'GE', name: 'Georgia', phoneFmt: '9' },
    { code: '+994', flag: '🇦🇿', iso: 'AZ', name: 'Azerbaijan', phoneFmt: '9' },
    { code: '+375', flag: '🇧🇾', iso: 'BY', name: 'Belarus', phoneFmt: '9-10' },
    { code: '+7', flag: '🇷🇺', iso: 'RU', name: 'Russia', phoneFmt: '10' },
    // Middle East
    { code: '+971', flag: '🇦🇪', iso: 'AE', name: 'UAE', phoneFmt: '9' },
    { code: '+966', flag: '🇸🇦', iso: 'SA', name: 'Saudi Arabia', phoneFmt: '9' },
    { code: '+974', flag: '🇶🇦', iso: 'QA', name: 'Qatar', phoneFmt: '8' },
    { code: '+973', flag: '🇧🇭', iso: 'BH', name: 'Bahrain', phoneFmt: '8' },
    { code: '+968', flag: '🇴🇲', iso: 'OM', name: 'Oman', phoneFmt: '8' },
    { code: '+965', flag: '🇰🇼', iso: 'KW', name: 'Kuwait', phoneFmt: '8' },
    { code: '+962', flag: '🇯🇴', iso: 'JO', name: 'Jordan', phoneFmt: '9' },
    { code: '+961', flag: '🇱🇧', iso: 'LB', name: 'Lebanon', phoneFmt: '7-8' },
    { code: '+972', flag: '🇮🇱', iso: 'IL', name: 'Israel', phoneFmt: '9' },
    { code: '+964', flag: '🇮🇶', iso: 'IQ', name: 'Iraq', phoneFmt: '10' },
    { code: '+98', flag: '🇮🇷', iso: 'IR', name: 'Iran', phoneFmt: '10' },
    { code: '+963', flag: '🇸🇾', iso: 'SY', name: 'Syria', phoneFmt: '9' },
    { code: '+967', flag: '🇾🇪', iso: 'YE', name: 'Yemen', phoneFmt: '9' },
    // Asia Pacific
    { code: '+64', flag: '🇳🇿', iso: 'NZ', name: 'New Zealand', phoneFmt: '9' },
    { code: '+65', flag: '🇸🇬', iso: 'SG', name: 'Singapore', phoneFmt: '8' },
    { code: '+60', flag: '🇲🇾', iso: 'MY', name: 'Malaysia', phoneFmt: '9-10' },
    { code: '+62', flag: '🇮🇩', iso: 'ID', name: 'Indonesia', phoneFmt: '10-12' },
    { code: '+63', flag: '🇵🇭', iso: 'PH', name: 'Philippines', phoneFmt: '10' },
    { code: '+66', flag: '🇹🇭', iso: 'TH', name: 'Thailand', phoneFmt: '9' },
    { code: '+84', flag: '🇻🇳', iso: 'VN', name: 'Vietnam', phoneFmt: '9-10' },
    { code: '+81', flag: '🇯🇵', iso: 'JP', name: 'Japan', phoneFmt: '10' },
    { code: '+82', flag: '🇰🇷', iso: 'KR', name: 'South Korea', phoneFmt: '10-11' },
    { code: '+86', flag: '🇨🇳', iso: 'CN', name: 'China', phoneFmt: '11' },
    { code: '+852', flag: '🇭🇰', iso: 'HK', name: 'Hong Kong', phoneFmt: '8' },
    { code: '+886', flag: '🇹🇼', iso: 'TW', name: 'Taiwan', phoneFmt: '9' },
    { code: '+91', flag: '🇮🇳', iso: 'IN', name: 'India', phoneFmt: '10' },
    { code: '+92', flag: '🇵🇰', iso: 'PK', name: 'Pakistan', phoneFmt: '10' },
    { code: '+94', flag: '🇱🇰', iso: 'LK', name: 'Sri Lanka', phoneFmt: '9' },
    { code: '+880', flag: '🇧🇩', iso: 'BD', name: 'Bangladesh', phoneFmt: '10' },
    { code: '+977', flag: '🇳🇵', iso: 'NP', name: 'Nepal', phoneFmt: '10' },
    { code: '+93', flag: '🇦🇫', iso: 'AF', name: 'Afghanistan', phoneFmt: '9' },
    { code: '+855', flag: '🇰🇭', iso: 'KH', name: 'Cambodia', phoneFmt: '9' },
    { code: '+856', flag: '🇱🇦', iso: 'LA', name: 'Laos', phoneFmt: '9-10' },
    { code: '+95', flag: '🇲🇲', iso: 'MM', name: 'Myanmar', phoneFmt: '9-10' },
    { code: '+976', flag: '🇲🇳', iso: 'MN', name: 'Mongolia', phoneFmt: '8' },
    { code: '+996', flag: '🇰🇬', iso: 'KG', name: 'Kyrgyzstan', phoneFmt: '9' },
    { code: '+998', flag: '🇺🇿', iso: 'UZ', name: 'Uzbekistan', phoneFmt: '9' },
    { code: '+992', flag: '🇹🇯', iso: 'TJ', name: 'Tajikistan', phoneFmt: '9' },
    { code: '+993', flag: '🇹🇲', iso: 'TM', name: 'Turkmenistan', phoneFmt: '8' },
    { code: '+7', flag: '🇰🇿', iso: 'KZ', name: 'Kazakhstan', phoneFmt: '10' },
    // Americas
    { code: '+52', flag: '🇲🇽', iso: 'MX', name: 'Mexico', phoneFmt: '10' },
    { code: '+55', flag: '🇧🇷', iso: 'BR', name: 'Brazil', phoneFmt: '10-11' },
    { code: '+54', flag: '🇦🇷', iso: 'AR', name: 'Argentina', phoneFmt: '10' },
    { code: '+56', flag: '🇨🇱', iso: 'CL', name: 'Chile', phoneFmt: '9' },
    { code: '+57', flag: '🇨🇴', iso: 'CO', name: 'Colombia', phoneFmt: '10' },
    { code: '+58', flag: '🇻🇪', iso: 'VE', name: 'Venezuela', phoneFmt: '10' },
    { code: '+51', flag: '🇵🇪', iso: 'PE', name: 'Peru', phoneFmt: '9' },
    { code: '+593', flag: '🇪🇨', iso: 'EC', name: 'Ecuador', phoneFmt: '9' },
    { code: '+591', flag: '🇧🇴', iso: 'BO', name: 'Bolivia', phoneFmt: '8' },
    { code: '+595', flag: '🇵🇾', iso: 'PY', name: 'Paraguay', phoneFmt: '9' },
    { code: '+598', flag: '🇺🇾', iso: 'UY', name: 'Uruguay', phoneFmt: '8' },
    { code: '+506', flag: '🇨🇷', iso: 'CR', name: 'Costa Rica', phoneFmt: '8' },
    { code: '+507', flag: '🇵🇦', iso: 'PA', name: 'Panama', phoneFmt: '8' },
    { code: '+502', flag: '🇬🇹', iso: 'GT', name: 'Guatemala', phoneFmt: '8' },
    { code: '+503', flag: '🇸🇻', iso: 'SV', name: 'El Salvador', phoneFmt: '8' },
    { code: '+504', flag: '🇭🇳', iso: 'HN', name: 'Honduras', phoneFmt: '8' },
    { code: '+505', flag: '🇳🇮', iso: 'NI', name: 'Nicaragua', phoneFmt: '8' },
    { code: '+53', flag: '🇨🇺', iso: 'CU', name: 'Cuba', phoneFmt: '8' },
    { code: '+1809', flag: '🇩🇴', iso: 'DO', name: 'Dominican Republic', phoneFmt: '10' },
    // Africa
    { code: '+27', flag: '🇿🇦', iso: 'ZA', name: 'South Africa', phoneFmt: '9' },
    { code: '+20', flag: '🇪🇬', iso: 'EG', name: 'Egypt', phoneFmt: '10' },
    { code: '+212', flag: '🇲🇦', iso: 'MA', name: 'Morocco', phoneFmt: '9' },
    { code: '+213', flag: '🇩🇿', iso: 'DZ', name: 'Algeria', phoneFmt: '9' },
    { code: '+216', flag: '🇹🇳', iso: 'TN', name: 'Tunisia', phoneFmt: '8' },
    { code: '+218', flag: '🇱🇾', iso: 'LY', name: 'Libya', phoneFmt: '9' },
    { code: '+234', flag: '🇳🇬', iso: 'NG', name: 'Nigeria', phoneFmt: '10' },
    { code: '+233', flag: '🇬🇭', iso: 'GH', name: 'Ghana', phoneFmt: '9' },
    { code: '+254', flag: '🇰🇪', iso: 'KE', name: 'Kenya', phoneFmt: '9' },
    { code: '+255', flag: '🇹🇿', iso: 'TZ', name: 'Tanzania', phoneFmt: '9' },
    { code: '+256', flag: '🇺🇬', iso: 'UG', name: 'Uganda', phoneFmt: '9' },
    { code: '+251', flag: '🇪🇹', iso: 'ET', name: 'Ethiopia', phoneFmt: '9' },
    { code: '+237', flag: '🇨🇲', iso: 'CM', name: 'Cameroon', phoneFmt: '9' },
    { code: '+225', flag: '🇨🇮', iso: 'CI', name: "Côte d'Ivoire", phoneFmt: '10' },
    { code: '+221', flag: '🇸🇳', iso: 'SN', name: 'Senegal', phoneFmt: '9' },
    { code: '+244', flag: '🇦🇴', iso: 'AO', name: 'Angola', phoneFmt: '9' },
    { code: '+258', flag: '🇲🇿', iso: 'MZ', name: 'Mozambique', phoneFmt: '9' },
    { code: '+260', flag: '🇿🇲', iso: 'ZM', name: 'Zambia', phoneFmt: '9' },
    { code: '+263', flag: '🇿🇼', iso: 'ZW', name: 'Zimbabwe', phoneFmt: '9' },
    // Caribbean & Islands
    { code: '+1876', flag: '🇯🇲', iso: 'JM', name: 'Jamaica', phoneFmt: '10' },
    { code: '+1868', flag: '🇹🇹', iso: 'TT', name: 'Trinidad & Tobago', phoneFmt: '10' },
    { code: '+356', flag: '🇲🇹', iso: 'MT', name: 'Malta', phoneFmt: '8' },
    { code: '+357', flag: '🇨🇾', iso: 'CY', name: 'Cyprus', phoneFmt: '8' },
    { code: '+230', flag: '🇲🇺', iso: 'MU', name: 'Mauritius', phoneFmt: '8' },
    { code: '+679', flag: '🇫🇯', iso: 'FJ', name: 'Fiji', phoneFmt: '7' },
]

// Phone validation helper
function validatePhoneLength(phone: string, phoneFmt: string): boolean {
    const digits = phone.replace(/\D/g, '')
    if (!digits) return false
    const parts = phoneFmt.split('-')
    const minLen = parseInt(parts[0])
    const maxLen = parts.length > 1 ? parseInt(parts[1]) : minLen
    return digits.length >= minLen && digits.length <= maxLen
}

// Contact Form Component
function ContactForm({
    onSubmit,
    locale,
    leadCategory
}: {
    onSubmit: (data: { name: string; phone: string; email: string }) => void
    locale: 'tr' | 'en'
    leadCategory?: string
}) {
    const [name, setName] = useState('')
    const [countryCode, setCountryCode] = useState('+61')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [codeSearch, setCodeSearch] = useState('')
    const [showCodeDropdown, setShowCodeDropdown] = useState(false)

    const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode) || COUNTRY_CODES[0]

    const filteredCodes = codeSearch
        ? COUNTRY_CODES.filter(c =>
            c.name.toLowerCase().includes(codeSearch.toLowerCase()) ||
            c.iso.toLowerCase().includes(codeSearch.toLowerCase()) ||
            c.code.includes(codeSearch)
        )
        : COUNTRY_CODES

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !phone) {
            setError(locale === 'tr' ? 'Lütfen ad ve telefon bilgilerini giriniz.' : 'Please enter your name and phone number.')
            return
        }
        // Validate phone number length
        const cleanPhone = phone.replace(/\D/g, '').replace(/^0+/, '')
        if (!validatePhoneLength(cleanPhone, selectedCountry.phoneFmt)) {
            const parts = selectedCountry.phoneFmt.split('-')
            const expected = parts.length > 1 ? `${parts[0]}-${parts[1]}` : parts[0]
            setError(
                locale === 'tr'
                    ? `${selectedCountry.name} için telefon numarası ${expected} haneli olmalıdır.`
                    : `Phone number for ${selectedCountry.name} should be ${expected} digits.`
            )
            return
        }
        // Combine country code with phone number
        const fullPhone = `${countryCode}${cleanPhone}`
        onSubmit({ name, phone: fullPhone, email })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-sm font-medium text-gray-700">
                {locale === 'tr' ? 'İletişim Bilgileri' : 'Contact Information'}
            </p>
            <div className="space-y-2">
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-amber-400">
                    <User className="w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value)
                            setError('')
                        }}
                        placeholder={locale === 'tr' ? 'Ad Soyad *' : 'Full Name *'}
                        className="flex-1 text-sm outline-none bg-transparent"
                    />
                </div>
                <div className="flex items-center gap-1 border rounded-lg px-2 py-2 bg-white focus-within:ring-2 focus-within:ring-amber-400 relative">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowCodeDropdown(!showCodeDropdown)}
                            className="flex items-center gap-1 text-sm border-r border-gray-200 pr-2 cursor-pointer hover:bg-gray-50 rounded py-0.5 px-1"
                        >
                            <span>{selectedCountry.flag}</span>
                            <span className="text-gray-600">{selectedCountry.code}</span>
                            <span className="text-gray-400 text-[10px]">▼</span>
                        </button>
                        {showCodeDropdown && (
                            <div className="absolute top-8 left-0 z-50 bg-white border border-gray-200 rounded-lg shadow-xl w-56 max-h-60 overflow-hidden">
                                <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
                                    <input
                                        type="text"
                                        value={codeSearch}
                                        onChange={(e) => setCodeSearch(e.target.value)}
                                        placeholder={locale === 'tr' ? 'Ülke ara...' : 'Search country...'}
                                        className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded outline-none focus:border-amber-400"
                                        autoFocus
                                    />
                                </div>
                                <div className="overflow-y-auto max-h-48">
                                    {filteredCodes.map((c, idx) => (
                                        <button
                                            key={`${c.iso}-${idx}`}
                                            type="button"
                                            onClick={() => {
                                                setCountryCode(c.code)
                                                setShowCodeDropdown(false)
                                                setCodeSearch('')
                                            }}
                                            className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-amber-50 transition-colors text-left ${countryCode === c.code && c.iso === selectedCountry.iso ? 'bg-amber-50 font-medium' : ''}`}
                                        >
                                            <span>{c.flag}</span>
                                            <span className="flex-1 truncate">{c.name}</span>
                                            <span className="text-gray-400">{c.code}</span>
                                        </button>
                                    ))}
                                    {filteredCodes.length === 0 && (
                                        <p className="text-xs text-gray-400 px-3 py-2 text-center">
                                            {locale === 'tr' ? 'Sonuç bulunamadı' : 'No results found'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                            // Only allow digits, spaces, dashes
                            const val = e.target.value.replace(/[^\d\s\-()]/g, '')
                            setPhone(val)
                            setError('')
                        }}
                        placeholder={locale === 'tr' ? 'Telefon *' : 'Phone *'}
                        className="flex-1 text-sm outline-none bg-transparent min-w-0"
                        onClick={() => setShowCodeDropdown(false)}
                    />
                </div>
                <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-amber-400">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className="flex-1 text-sm outline-none bg-transparent"
                    />
                </div>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
                type="submit"
                className="w-full py-2.5 text-sm text-white rounded-lg transition-colors hover:opacity-90 flex items-center justify-center gap-2 font-medium shadow-sm"
                style={{ backgroundColor: '#D97706' }}
            >
                {locale === 'tr' ? 'Devam Et' : 'Continue'}
                <CheckCircle className="w-4 h-4" />
            </button>
        </form>
    )
}

// Email Only Form
function EmailOnlyForm({
    locale,
    onSubmit
}: {
    locale: 'tr' | 'en'
    onSubmit: (email: string) => void
}) {
    const [email, setEmail] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (email) {
            onSubmit(email)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={locale === 'tr' ? 'E-posta adresiniz' : 'Your email address'}
                    className="flex-1 px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-amber-400"
                    required
                />
            </div>
            <button
                type="submit"
                className="w-full py-2 text-sm text-white rounded-lg transition-colors hover:opacity-90"
                style={{ backgroundColor: '#D97706' }}
            >
                {locale === 'tr' ? 'Raporları Gönder' : 'Send Reports'}
            </button>
        </form>
    )
}

// Valuation Form Component
function ValuationForm({ locale, onSubmit }: { locale: 'tr' | 'en'; onSubmit: (data: { address: string; area: string; rooms: string; buildingAge: string }) => void }) {
    const [address, setAddress] = useState('')
    const [area, setArea] = useState('')
    const [rooms, setRooms] = useState('')
    const [buildingAge, setBuildingAge] = useState('')
    const tRaw = useTranslations('widget.realestate')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (address && area && rooms) {
            onSubmit({ address, area, rooms, buildingAge })
        }
    }

    const t = {
        valuation: {
            title: tRaw('valuation.title'),
            subtitle: tRaw('valuation.subtitle'),
            address: tRaw('valuation.address'),
            area: tRaw('valuation.area'),
            rooms: tRaw('valuation.rooms'),
            buildingAge: tRaw('valuation.buildingAge'),
            submit: tRaw('valuation.submit'),
            result: tRaw('valuation.result')
        }
    }


    return (
        <form onSubmit={handleSubmit} className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                {t.valuation.title}
            </p>
            <p className="text-xs text-gray-500">{t.valuation.subtitle}</p>
            <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={t.valuation.address}
                    className="flex-1 px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-amber-400"
                    required
                />
            </div>
            <div className="flex gap-2">
                <div className="flex items-center gap-2 flex-1">
                    <Home className="w-4 h-4 text-gray-400" />
                    <input
                        type="number"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        placeholder={t.valuation.area}
                        className="w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-amber-400"
                        required
                    />
                </div>
                <select
                    value={rooms}
                    onChange={(e) => setRooms(e.target.value)}
                    className="px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-amber-400"
                    required
                >
                    <option value="">{t.valuation.rooms}</option>
                    <option value="1+1">1+1</option>
                    <option value="2+1">2+1</option>
                    <option value="3+1">3+1</option>
                    <option value="4+1">4+1</option>
                    <option value="5+">5+</option>
                </select>
            </div>
            <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <select
                    value={buildingAge}
                    onChange={(e) => setBuildingAge(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-amber-400"
                >
                    <option value="">{t.valuation.buildingAge}</option>
                    <option value="0-5">{locale === 'tr' ? '0-5 yıl' : '0-5 years'}</option>
                    <option value="5-10">{locale === 'tr' ? '5-10 yıl' : '5-10 years'}</option>
                    <option value="10-20">{locale === 'tr' ? '10-20 yıl' : '10-20 years'}</option>
                    <option value="20+">{locale === 'tr' ? '20+ yıl' : '20+ years'}</option>
                </select>
            </div>
            <button
                type="submit"
                className="w-full py-2 text-sm text-white rounded-lg transition-colors hover:opacity-90"
                style={{ backgroundColor: '#D97706' }}
            >
                {t.valuation.submit}
            </button>
        </form>
    )
}

// Appointment Slot Picker Component
function AppointmentSlotPicker({
    locale,
    identifier,
    leadData,
    onSlotSelected
}: {
    locale: 'tr' | 'en'
    identifier: string
    leadData: any
    onSlotSelected: (slot: { date: string; time: string; type: string }) => void
}) {
    const [slots, setSlots] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedSlot, setSelectedSlot] = useState<any>(null)
    const [bookingName, setBookingName] = useState(leadData.contactName || '')
    const [bookingPhone, setBookingPhone] = useState(leadData.contactPhone || '')
    const [bookingEmail, setBookingEmail] = useState(leadData.contactEmail || '')
    const [booking, setBooking] = useState(false)

    useEffect(() => {
        if (identifier) {
            fetchSlots()
        }
    }, [identifier])

    const fetchSlots = async () => {
        try {
            // Use new calendar availability API with locale for multilingual labels
            const response = await fetch(`/api/calendar/availability?identifier=${identifier}&locale=${locale}`)
            const data = await response.json()
            setSlots(data.slots?.filter((s: any) => s.available) || generateLocalSlots())
        } catch (error) {
            console.error('Error fetching slots:', error)
            setSlots(generateLocalSlots())
        } finally {
            setLoading(false)
        }
    }

    const generateLocalSlots = () => {
        const slots = []
        const today = new Date()

        // Multilingual time labels  
        const timeLabels: Record<string, { morning: string; afternoon: string }> = {
            en: { morning: 'Morning', afternoon: 'Afternoon' },
            tr: { morning: 'Sabah', afternoon: 'Öğleden Sonra' },
            de: { morning: 'Morgen', afternoon: 'Nachmittag' },
            es: { morning: 'Mañana', afternoon: 'Tarde' },
            fr: { morning: 'Matin', afternoon: 'Après-midi' }
        }
        const labels = timeLabels[locale] || timeLabels['en']

        for (let i = 1; i <= 5; i++) {
            const date = new Date(today)
            date.setDate(date.getDate() + i)

            // Format as dd/mm/yyyy
            const day = date.getDate().toString().padStart(2, '0')
            const month = (date.getMonth() + 1).toString().padStart(2, '0')
            const year = date.getFullYear()
            const dateStr = `${day}/${month}/${year}`

            if (date.getDay() !== 0) { // Skip Sunday
                slots.push(
                    { date: dateStr, time: '10:00', label: labels.morning, type: 'viewing', available: true },
                    { date: dateStr, time: '14:00', label: labels.afternoon, type: 'viewing', available: true }
                )
            }
        }
        return slots.slice(0, 6) // Limit to 6 slots
    }

    const [bookingError, setBookingError] = useState('')

    const handleBookSlot = async () => {
        if (!selectedSlot || !bookingName || !bookingPhone) return

        setBookingError('')
        setBooking(true)
        try {
            // Use new calendar events API - pass locale for multi-language notifications
            const response = await fetch('/api/calendar/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier,
                    date: selectedSlot.isoDate || selectedSlot.date,
                    time: selectedSlot.time,
                    name: bookingName,
                    phone: bookingPhone,
                    email: bookingEmail || undefined,
                    type: selectedSlot.type || 'viewing',
                    locale
                })
            })

            if (response.ok) {
                onSlotSelected(selectedSlot)
            } else if (response.status === 409) {
                // Slot already taken
                const data = await response.json()
                setBookingError(data.message || (locale === 'tr' ? 'Bu saat dolu. Başka saat seçin.' : 'This time slot is taken. Please select another.'))
                setSelectedSlot(null)
                // Refresh slots to show updated availability
                fetchSlots()
            } else {
                setBookingError(locale === 'tr' ? 'Randevu oluşturulamadı. Tekrar deneyin.' : 'Failed to create appointment. Please try again.')
            }
        } catch (error) {
            console.error('Error booking appointment:', error)
            setBookingError(locale === 'tr' ? 'Bir hata oluştu. Tekrar deneyin.' : 'An error occurred. Please try again.')
        } finally {
            setBooking(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                {locale === 'tr' ? 'Müsait zamanlar yükleniyor...' : 'Loading available times...'}
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <p className="text-sm font-medium flex items-center gap-1">
                <Calendar className="w-4 h-4 text-amber-500" />
                {locale === 'tr' ? 'Randevu Seçin' : 'Select Appointment'}
            </p>

            <div className="grid grid-cols-2 gap-2">
                {slots.map((slot, index) => (
                    <button
                        key={index}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-2 text-left rounded-lg border text-xs transition-all ${selectedSlot === slot
                            ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500'
                            : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50'
                            }`}
                    >
                        <p className="font-medium text-gray-900">{slot.date}</p>
                        <p className="text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {slot.time} - {slot.label}
                        </p>
                    </button>
                ))}
            </div>

            {selectedSlot && (
                <div className="space-y-2 pt-2 border-t">
                    {!leadData.contactName && (
                        <input
                            type="text"
                            value={bookingName}
                            onChange={(e) => setBookingName(e.target.value)}
                            placeholder={locale === 'tr' ? 'Ad Soyad *' : 'Full Name *'}
                            className="w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-amber-400"
                        />
                    )}
                    {!leadData.contactPhone && (
                        <input
                            type="tel"
                            value={bookingPhone}
                            onChange={(e) => setBookingPhone(e.target.value)}
                            placeholder={locale === 'tr' ? 'Telefon *' : 'Phone *'}
                            className="w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-amber-400"
                        />
                    )}
                    {!leadData.contactEmail && (
                        <input
                            type="email"
                            value={bookingEmail}
                            onChange={(e) => setBookingEmail(e.target.value)}
                            placeholder={locale === 'tr' ? 'Email (isteğe bağlı)' : 'Email (optional)'}
                            className="w-full px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-amber-400"
                        />
                    )}
                    {bookingError && (
                        <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{bookingError}</p>
                    )}
                    <button
                        onClick={handleBookSlot}
                        disabled={booking || !bookingName || !bookingPhone}
                        className="w-full py-2 text-sm text-white rounded-lg transition-colors hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                        style={{ backgroundColor: '#D97706' }}
                    >
                        {booking ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {locale === 'tr' ? 'Randevu alınıyor...' : 'Booking...'}
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                {locale === 'tr' ? 'Randevuyu Onayla' : 'Confirm Appointment'}
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    )
}
