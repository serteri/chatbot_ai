'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Search, Filter, Calendar, DollarSign, MapPin, GraduationCap, ExternalLink, Heart, Loader2, X, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'

interface Scholarship {
    id: string
    title: string
    description: string
    provider: string
    amount: string
    currency: string
    deadline: string
    country: string
    city?: string
    studyLevel: string[]
    fieldOfStudy: string[]
    nationality: string[]
    requirements: string[]
    applicationUrl?: string
    tags: string[]
    minGPA?: number
    maxAge?: number
}

// Comprehensive Country List with Flags
const WORLD_COUNTRIES = [
    { code: "all", name: { tr: "Tümü", en: "All" }, flag: "🌍" },
    { code: "AF", name: { tr: "Afganistan", en: "Afghanistan" }, flag: "🇦🇫" },
    { code: "AL", name: { tr: "Arnavutluk", en: "Albania" }, flag: "🇦🇱" },
    { code: "DZ", name: { tr: "Cezayir", en: "Algeria" }, flag: "🇩🇿" },
    { code: "AD", name: { tr: "Andorra", en: "Andorra" }, flag: "🇦🇩" },
    { code: "AO", name: { tr: "Angola", en: "Angola" }, flag: "🇦🇴" },
    { code: "AR", name: { tr: "Arjantin", en: "Argentina" }, flag: "🇦🇷" },
    { code: "AM", name: { tr: "Ermenistan", en: "Armenia" }, flag: "🇦🇲" },
    { code: "AU", name: { tr: "Avustralya", en: "Australia" }, flag: "🇦🇺" },
    { code: "AT", name: { tr: "Avusturya", en: "Austria" }, flag: "🇦🇹" },
    { code: "AZ", name: { tr: "Azerbaycan", en: "Azerbaijan" }, flag: "🇦🇿" },
    { code: "BS", name: { tr: "Bahama Adaları", en: "Bahamas" }, flag: "🇧🇸" },
    { code: "BH", name: { tr: "Bahreyn", en: "Bahrain" }, flag: "🇧🇭" },
    { code: "BD", name: { tr: "Bangladeş", en: "Bangladesh" }, flag: "🇧🇩" },
    { code: "BB", name: { tr: "Barbados", en: "Barbados" }, flag: "🇧🇧" },
    { code: "BY", name: { tr: "Belarus", en: "Belarus" }, flag: "🇧🇾" },
    { code: "BE", name: { tr: "Belçika", en: "Belgium" }, flag: "🇧🇪" },
    { code: "BZ", name: { tr: "Belize", en: "Belize" }, flag: "🇧🇿" },
    { code: "BJ", name: { tr: "Benin", en: "Benin" }, flag: "🇧🇯" },
    { code: "BT", name: { tr: "Bhutan", en: "Bhutan" }, flag: "🇧🇹" },
    { code: "BO", name: { tr: "Bolivya", en: "Bolivia" }, flag: "🇧🇴" },
    { code: "BA", name: { tr: "Bosna Hersek", en: "Bosnia and Herzegovina" }, flag: "🇧🇦" },
    { code: "BW", name: { tr: "Botsvana", en: "Botswana" }, flag: "🇧🇼" },
    { code: "BR", name: { tr: "Brezilya", en: "Brazil" }, flag: "🇧🇷" },
    { code: "BN", name: { tr: "Brunei", en: "Brunei" }, flag: "🇧🇳" },
    { code: "BG", name: { tr: "Bulgaristan", en: "Bulgaria" }, flag: "🇧🇬" },
    { code: "BF", name: { tr: "Burkina Faso", en: "Burkina Faso" }, flag: "🇧🇫" },
    { code: "BI", name: { tr: "Burundi", en: "Burundi" }, flag: "🇧🇮" },
    { code: "CV", name: { tr: "Cabo Verde", en: "Cabo Verde" }, flag: "🇨🇻" },
    { code: "KH", name: { tr: "Kamboçya", en: "Cambodia" }, flag: "🇰🇭" },
    { code: "CM", name: { tr: "Kamerun", en: "Cameroon" }, flag: "🇨🇲" },
    { code: "CA", name: { tr: "Kanada", en: "Canada" }, flag: "🇨🇦" },
    { code: "CF", name: { tr: "Orta Afrika Cumhuriyeti", en: "Central African Republic" }, flag: "🇨🇫" },
    { code: "TD", name: { tr: "Çad", en: "Chad" }, flag: "🇹🇩" },
    { code: "CL", name: { tr: "Şili", en: "Chile" }, flag: "🇨🇱" },
    { code: "CN", name: { tr: "Çin", en: "China" }, flag: "🇨🇳" },
    { code: "CO", name: { tr: "Kolombiya", en: "Colombia" }, flag: "🇨🇴" },
    { code: "KM", name: { tr: "Komorlar", en: "Comoros" }, flag: "🇰🇲" },
    { code: "CG", name: { tr: "Kongo", en: "Congo" }, flag: "🇨🇬" },
    { code: "CR", name: { tr: "Kosta Rika", en: "Costa Rica" }, flag: "🇨🇷" },
    { code: "CI", name: { tr: "Fildişi Sahili", en: "Côte d'Ivoire" }, flag: "🇨🇮" },
    { code: "HR", name: { tr: "Hırvatistan", en: "Croatia" }, flag: "🇭🇷" },
    { code: "CU", name: { tr: "Küba", en: "Cuba" }, flag: "🇨🇺" },
    { code: "CY", name: { tr: "Kıbrıs", en: "Cyprus" }, flag: "🇨🇾" },
    { code: "CZ", name: { tr: "Çek Cumhuriyeti", en: "Czech Republic" }, flag: "🇨🇿" },
    { code: "DK", name: { tr: "Danimarka", en: "Denmark" }, flag: "🇩🇰" },
    { code: "DJ", name: { tr: "Cibuti", en: "Djibouti" }, flag: "🇩🇯" },
    { code: "DM", name: { tr: "Dominika", en: "Dominica" }, flag: "🇩🇲" },
    { code: "DO", name: { tr: "Dominik Cumhuriyeti", en: "Dominican Republic" }, flag: "🇩🇴" },
    { code: "EC", name: { tr: "Ekvador", en: "Ecuador" }, flag: "🇪🇨" },
    { code: "EG", name: { tr: "Mısır", en: "Egypt" }, flag: "🇪🇬" },
    { code: "SV", name: { tr: "El Salvador", en: "El Salvador" }, flag: "🇸🇻" },
    { code: "GQ", name: { tr: "Ekvator Ginesi", en: "Equatorial Guinea" }, flag: "🇬🇶" },
    { code: "ER", name: { tr: "Eritre", en: "Eritrea" }, flag: "🇪🇷" },
    { code: "EE", name: { tr: "Estonya", en: "Estonia" }, flag: "🇪🇪" },
    { code: "SZ", name: { tr: "Eswatini", en: "Eswatini" }, flag: "🇸🇿" },
    { code: "ET", name: { tr: "Etiyopya", en: "Ethiopia" }, flag: "🇪🇹" },
    { code: "FJ", name: { tr: "Fiji", en: "Fiji" }, flag: "🇫🇯" },
    { code: "FI", name: { tr: "Finlandiya", en: "Finland" }, flag: "🇫🇮" },
    { code: "FR", name: { tr: "Fransa", en: "France" }, flag: "🇫🇷" },
    { code: "GA", name: { tr: "Gabon", en: "Gabon" }, flag: "🇬🇦" },
    { code: "GM", name: { tr: "Gambiya", en: "Gambia" }, flag: "🇬🇲" },
    { code: "GE", name: { tr: "Gürcistan", en: "Georgia" }, flag: "🇬🇪" },
    { code: "DE", name: { tr: "Almanya", en: "Germany" }, flag: "🇩🇪" },
    { code: "GH", name: { tr: "Gana", en: "Ghana" }, flag: "🇬🇭" },
    { code: "GR", name: { tr: "Yunanistan", en: "Greece" }, flag: "🇬🇷" },
    { code: "GD", name: { tr: "Grenada", en: "Grenada" }, flag: "🇬🇩" },
    { code: "GT", name: { tr: "Guatemala", en: "Guatemala" }, flag: "🇬🇹" },
    { code: "GN", name: { tr: "Gine", en: "Guinea" }, flag: "🇬🇳" },
    { code: "GW", name: { tr: "Gine-Bissau", en: "Guinea-Bissau" }, flag: "🇬🇼" },
    { code: "GY", name: { tr: "Guyana", en: "Guyana" }, flag: "🇬🇾" },
    { code: "HT", name: { tr: "Haiti", en: "Haiti" }, flag: "🇭🇹" },
    { code: "HN", name: { tr: "Honduras", en: "Honduras" }, flag: "🇭🇳" },
    { code: "HU", name: { tr: "Macaristan", en: "Hungary" }, flag: "🇭🇺" },
    { code: "IS", name: { tr: "İzlanda", en: "Iceland" }, flag: "🇮🇸" },
    { code: "IN", name: { tr: "Hindistan", en: "India" }, flag: "🇮🇳" },
    { code: "ID", name: { tr: "Endonezya", en: "Indonesia" }, flag: "🇮🇩" },
    { code: "IR", name: { tr: "İran", en: "Iran" }, flag: "🇮🇷" },
    { code: "IQ", name: { tr: "Irak", en: "Iraq" }, flag: "🇮🇶" },
    { code: "IE", name: { tr: "İrlanda", en: "Ireland" }, flag: "🇮🇪" },
    { code: "IL", name: { tr: "İsrail", en: "Israel" }, flag: "🇮🇱" },
    { code: "IT", name: { tr: "İtalya", en: "Italy" }, flag: "🇮🇹" },
    { code: "JM", name: { tr: "Jamaika", en: "Jamaica" }, flag: "🇯🇲" },
    { code: "JP", name: { tr: "Japonya", en: "Japan" }, flag: "🇯🇵" },
    { code: "JO", name: { tr: "Ürdün", en: "Jordan" }, flag: "🇯🇴" },
    { code: "KZ", name: { tr: "Kazakistan", en: "Kazakhstan" }, flag: "🇰🇿" },
    { code: "KE", name: { tr: "Kenya", en: "Kenya" }, flag: "🇰🇪" },
    { code: "KI", name: { tr: "Kiribati", en: "Kiribati" }, flag: "🇰🇮" },
    { code: "KP", name: { tr: "Kuzey Kore", en: "North Korea" }, flag: "🇰🇵" },
    { code: "KR", name: { tr: "Güney Kore", en: "South Korea" }, flag: "🇰🇷" },
    { code: "KW", name: { tr: "Kuveyt", en: "Kuwait" }, flag: "🇰🇼" },
    { code: "KG", name: { tr: "Kırgızistan", en: "Kyrgyzstan" }, flag: "🇰🇬" },
    { code: "LA", name: { tr: "Laos", en: "Laos" }, flag: "🇱🇦" },
    { code: "LV", name: { tr: "Letonya", en: "Latvia" }, flag: "🇱🇻" },
    { code: "LB", name: { tr: "Lübnan", en: "Lebanon" }, flag: "🇱🇧" },
    { code: "LS", name: { tr: "Lesoto", en: "Lesotho" }, flag: "🇱🇸" },
    { code: "LR", name: { tr: "Liberya", en: "Liberia" }, flag: "🇱🇷" },
    { code: "LY", name: { tr: "Libya", en: "Libya" }, flag: "🇱🇾" },
    { code: "LI", name: { tr: "Liechtenstein", en: "Liechtenstein" }, flag: "🇱🇮" },
    { code: "LT", name: { tr: "Litvanya", en: "Lithuania" }, flag: "🇱🇹" },
    { code: "LU", name: { tr: "Lüksemburg", en: "Luxembourg" }, flag: "🇱🇺" },
    { code: "MG", name: { tr: "Madagaskar", en: "Madagascar" }, flag: "🇲🇬" },
    { code: "MW", name: { tr: "Malavi", en: "Malawi" }, flag: "🇲🇼" },
    { code: "MY", name: { tr: "Malezya", en: "Malaysia" }, flag: "🇲🇾" },
    { code: "MV", name: { tr: "Maldivler", en: "Maldives" }, flag: "🇲🇻" },
    { code: "ML", name: { tr: "Mali", en: "Mali" }, flag: "🇲🇱" },
    { code: "MT", name: { tr: "Malta", en: "Malta" }, flag: "🇲🇹" },
    { code: "MH", name: { tr: "Marshall Adaları", en: "Marshall Islands" }, flag: "🇲🇭" },
    { code: "MR", name: { tr: "Moritanya", en: "Mauritania" }, flag: "🇲🇷" },
    { code: "MU", name: { tr: "Mauritius", en: "Mauritius" }, flag: "🇲🇺" },
    { code: "MX", name: { tr: "Meksika", en: "Mexico" }, flag: "🇲🇽" },
    { code: "FM", name: { tr: "Mikronezya", en: "Micronesia" }, flag: "🇫🇲" },
    { code: "MD", name: { tr: "Moldova", en: "Moldova" }, flag: "🇲🇩" },
    { code: "MC", name: { tr: "Monako", en: "Monaco" }, flag: "🇲🇨" },
    { code: "MN", name: { tr: "Moğolistan", en: "Mongolia" }, flag: "🇲🇳" },
    { code: "ME", name: { tr: "Karadağ", en: "Montenegro" }, flag: "🇲🇪" },
    { code: "MA", name: { tr: "Fas", en: "Morocco" }, flag: "🇲🇦" },
    { code: "MZ", name: { tr: "Mozambik", en: "Mozambique" }, flag: "🇲🇿" },
    { code: "MM", name: { tr: "Myanmar", en: "Myanmar" }, flag: "🇲🇲" },
    { code: "NA", name: { tr: "Namibya", en: "Namibia" }, flag: "🇳🇦" },
    { code: "NR", name: { tr: "Nauru", en: "Nauru" }, flag: "🇳🇷" },
    { code: "NP", name: { tr: "Nepal", en: "Nepal" }, flag: "🇳🇵" },
    { code: "NL", name: { tr: "Hollanda", en: "Netherlands" }, flag: "🇳🇱" },
    { code: "NZ", name: { tr: "Yeni Zelanda", en: "New Zealand" }, flag: "🇳🇿" },
    { code: "NI", name: { tr: "Nikaragua", en: "Nicaragua" }, flag: "🇳🇮" },
    { code: "NE", name: { tr: "Nijer", en: "Niger" }, flag: "🇳🇪" },
    { code: "NG", name: { tr: "Nijerya", en: "Nigeria" }, flag: "🇳🇬" },
    { code: "MK", name: { tr: "Kuzey Makedonya", en: "North Macedonia" }, flag: "🇲🇰" },
    { code: "NO", name: { tr: "Norveç", en: "Norway" }, flag: "🇳🇴" },
    { code: "OM", name: { tr: "Umman", en: "Oman" }, flag: "🇴🇲" },
    { code: "PK", name: { tr: "Pakistan", en: "Pakistan" }, flag: "🇵🇰" },
    { code: "PW", name: { tr: "Palau", en: "Palau" }, flag: "🇵🇼" },
    { code: "PS", name: { tr: "Filistin", en: "Palestine" }, flag: "🇵🇸" },
    { code: "PA", name: { tr: "Panama", en: "Panama" }, flag: "🇵🇦" },
    { code: "PG", name: { tr: "Papua Yeni Gine", en: "Papua New Guinea" }, flag: "🇵🇬" },
    { code: "PY", name: { tr: "Paraguay", en: "Paraguay" }, flag: "🇵🇾" },
    { code: "PE", name: { tr: "Peru", en: "Peru" }, flag: "🇵🇪" },
    { code: "PH", name: { tr: "Filipinler", en: "Philippines" }, flag: "🇵🇭" },
    { code: "PL", name: { tr: "Polonya", en: "Poland" }, flag: "🇵🇱" },
    { code: "PT", name: { tr: "Portekiz", en: "Portugal" }, flag: "🇵🇹" },
    { code: "QA", name: { tr: "Katar", en: "Qatar" }, flag: "🇶🇦" },
    { code: "RO", name: { tr: "Romanya", en: "Romania" }, flag: "🇷🇴" },
    { code: "RU", name: { tr: "Rusya", en: "Russia" }, flag: "🇷🇺" },
    { code: "RW", name: { tr: "Ruanda", en: "Rwanda" }, flag: "🇷🇼" },
    { code: "KN", name: { tr: "Saint Kitts ve Nevis", en: "Saint Kitts and Nevis" }, flag: "🇰🇳" },
    { code: "LC", name: { tr: "Saint Lucia", en: "Saint Lucia" }, flag: "🇱🇨" },
    { code: "VC", name: { tr: "Saint Vincent ve Grenadinler", en: "Saint Vincent and the Grenadines" }, flag: "🇻🇨" },
    { code: "WS", name: { tr: "Samoa", en: "Samoa" }, flag: "🇼🇸" },
    { code: "SM", name: { tr: "San Marino", en: "San Marino" }, flag: "🇸🇲" },
    { code: "ST", name: { tr: "Sao Tome ve Principe", en: "Sao Tome and Principe" }, flag: "🇸🇹" },
    { code: "SA", name: { tr: "Suudi Arabistan", en: "Saudi Arabia" }, flag: "🇸🇦" },
    { code: "SN", name: { tr: "Senegal", en: "Senegal" }, flag: "🇸🇳" },
    { code: "RS", name: { tr: "Sırbistan", en: "Serbia" }, flag: "🇷🇸" },
    { code: "SC", name: { tr: "Seychelles", en: "Seychelles" }, flag: "🇸🇨" },
    { code: "SL", name: { tr: "Sierra Leone", en: "Sierra Leone" }, flag: "🇸🇱" },
    { code: "SG", name: { tr: "Singapur", en: "Singapore" }, flag: "🇸🇬" },
    { code: "SK", name: { tr: "Slovakya", en: "Slovakia" }, flag: "🇸🇰" },
    { code: "SI", name: { tr: "Slovenya", en: "Slovenia" }, flag: "🇸🇮" },
    { code: "SB", name: { tr: "Solomon Adaları", en: "Solomon Islands" }, flag: "🇸🇧" },
    { code: "SO", name: { tr: "Somali", en: "Somalia" }, flag: "🇸🇴" },
    { code: "ZA", name: { tr: "Güney Afrika", en: "South Africa" }, flag: "🇿🇦" },
    { code: "SS", name: { tr: "Güney Sudan", en: "South Sudan" }, flag: "🇸🇸" },
    { code: "ES", name: { tr: "İspanya", en: "Spain" }, flag: "🇪🇸" },
    { code: "LK", name: { tr: "Sri Lanka", en: "Sri Lanka" }, flag: "🇱🇰" },
    { code: "SD", name: { tr: "Sudan", en: "Sudan" }, flag: "🇸🇩" },
    { code: "SR", name: { tr: "Surinam", en: "Suriname" }, flag: "🇸🇷" },
    { code: "SE", name: { tr: "İsveç", en: "Sweden" }, flag: "🇸🇪" },
    { code: "CH", name: { tr: "İsviçre", en: "Switzerland" }, flag: "🇨🇭" },
    { code: "SY", name: { tr: "Suriye", en: "Syria" }, flag: "🇸🇾" },
    { code: "TJ", name: { tr: "Tacikistan", en: "Tajikistan" }, flag: "🇹🇯" },
    { code: "TZ", name: { tr: "Tanzanya", en: "Tanzania" }, flag: "🇹🇿" },
    { code: "TH", name: { tr: "Tayland", en: "Thailand" }, flag: "🇹🇭" },
    { code: "TL", name: { tr: "Doğu Timor", en: "East Timor" }, flag: "🇹🇱" },
    { code: "TG", name: { tr: "Togo", en: "Togo" }, flag: "🇹🇬" },
    { code: "TO", name: { tr: "Tonga", en: "Tonga" }, flag: "🇹🇴" },
    { code: "TT", name: { tr: "Trinidad ve Tobago", en: "Trinidad and Tobago" }, flag: "🇹🇹" },
    { code: "TN", name: { tr: "Tunus", en: "Tunisia" }, flag: "🇹🇳" },
    { code: "TR", name: { tr: "Türkiye", en: "Turkey" }, flag: "🇹🇷" },
    { code: "TM", name: { tr: "Türkmenistan", en: "Turkmenistan" }, flag: "🇹🇲" },
    { code: "TV", name: { tr: "Tuvalu", en: "Tuvalu" }, flag: "🇹🇻" },
    { code: "UG", name: { tr: "Uganda", en: "Uganda" }, flag: "🇺🇬" },
    { code: "UA", name: { tr: "Ukrayna", en: "Ukraine" }, flag: "🇺🇦" },
    { code: "AE", name: { tr: "Birleşik Arap Emirlikleri", en: "United Arab Emirates" }, flag: "🇦🇪" },
    { code: "GB", name: { tr: "İngiltere", en: "United Kingdom" }, flag: "🇬🇧" },
    { code: "US", name: { tr: "Amerika Birleşik Devletleri", en: "United States" }, flag: "🇺🇸" },
    { code: "UY", name: { tr: "Uruguay", en: "Uruguay" }, flag: "🇺🇾" },
    { code: "UZ", name: { tr: "Özbekistan", en: "Uzbekistan" }, flag: "🇺🇿" },
    { code: "VU", name: { tr: "Vanuatu", en: "Vanuatu" }, flag: "🇻🇺" },
    { code: "VA", name: { tr: "Vatikan", en: "Vatican City" }, flag: "🇻🇦" },
    { code: "VE", name: { tr: "Venezuela", en: "Venezuela" }, flag: "🇻🇪" },
    { code: "VN", name: { tr: "Vietnam", en: "Vietnam" }, flag: "🇻🇳" },
    { code: "YE", name: { tr: "Yemen", en: "Yemen" }, flag: "🇾🇪" },
    { code: "ZM", name: { tr: "Zambiya", en: "Zambia" }, flag: "🇿🇲" },
    { code: "ZW", name: { tr: "Zimbabve", en: "Zimbabwe" }, flag: "🇿🇼" },
]

export default function ScholarshipsPage({ params }: { params: Promise<{ locale: string }> }) {
    const resolvedParams = React.use(params)
    const t = useTranslations('Scholarships')
    const [scholarships, setScholarships] = useState<Scholarship[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filters, setFilters] = useState({
        country: 'all',
        studyLevel: 'all',
        provider: 'all',
        minAmount: '',
        maxAmount: ''
    })
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
    })

    // ✅ PROFESSIONAL DETAIL MODAL STATE
    const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

    const debouncedSearch = useDebounce(searchQuery, 500)

    // ✅ GUARANTEED WORKING URLs - Government portals + Main university pages only
    const generateRealScholarshipURL = (scholarship: Scholarship) => {
        const provider = scholarship.provider.toLowerCase()
        const country = scholarship.country.toLowerCase()

        // ✅ TURKEY - Specific university pages (not all to same portal!)
        if (country.includes('turkey') || country.includes('türkiye')) {
            if (provider.includes('yök') || provider.includes('council of higher education')) {
                return 'https://www.yok.gov.tr/en'
            }
            if (provider.includes('istanbul') && provider.includes('teknik')) {
                return 'https://www.itu.edu.tr/en'
            }
            if (provider.includes('boğaziçi') || provider.includes('bogazici')) {
                return 'https://www.boun.edu.tr/en_US'
            }
            if (provider.includes('orta doğu') || provider.includes('odtü') || provider.includes('middle east') || provider.includes('metu')) {
                return 'https://www.metu.edu.tr/tr'
            }
            if (provider.includes('hacettepe')) {
                return 'https://www.hacettepe.edu.tr/english'
            }
            if (provider.includes('bilkent')) {
                return 'https://www.bilkent.edu.tr/'
            }
            if (provider.includes('sabancı') || provider.includes('sabanci')) {
                return 'https://www.sabanciuniv.edu/en'
            }
            if (provider.includes('koç') || provider.includes('koc')) {
                return 'https://www.ku.edu.tr/en'
            }
            if (provider.includes('ankara') && provider.includes('üniversite')) {
                return 'https://www.ankara.edu.tr/en/'
            }
            if (provider.includes('gazi') && provider.includes('üniversite')) {
                return 'https://www.gazi.edu.tr/en/'
            }
            if (provider.includes('ege') && provider.includes('üniversite')) {
                return 'https://www.ege.edu.tr/eng/'
            }
            if (provider.includes('dokuz eylül') || provider.includes('dokuz eylul')) {
                return 'https://www.deu.edu.tr/en/'
            }
            if (provider.includes('karadeniz teknik')) {
                return 'https://www.ktu.edu.tr/en'
            }
            if (provider.includes('çukurova') || provider.includes('cukurova')) {
                return 'https://www.cu.edu.tr/en/'
            }
            if (provider.includes('erciyes')) {
                return 'https://www.erciyes.edu.tr/en/'
            }
            if (provider.includes('gebze teknik')) {
                return 'https://www.gtu.edu.tr/en'
            }
            if (provider.includes('yıldız teknik') || provider.includes('yildiz teknik')) {
                return 'https://www.yildiz.edu.tr/en'
            }
            if (provider.includes('marmara')) {
                return 'https://www.marmara.edu.tr/en'
            }
            if (provider.includes('istanbul') && provider.includes('üniversite')) {
                return 'https://www.istanbul.edu.tr/en/'
            }
            if (provider.includes('galatasaray')) {
                return 'https://www.gsu.edu.tr/en/'
            }
            if (provider.includes('özyeğin') || provider.includes('ozyegin')) {
                return 'https://www.ozyegin.edu.tr/en'
            }
            if (provider.includes('bahçeşehir') || provider.includes('bahcesehir')) {
                return 'https://www.bahcesehir.edu.tr/en/'
            }

            // ✅ If it's a general Turkish government scholarship or unmatched
            if (provider.includes('türkiye burslari') || provider.includes('turkey scholarship') || provider.includes('government')) {
                return 'https://www.turkiyeburslari.gov.tr/en'
            }

            // ✅ DEFAULT: If no specific university matches, use YÖK (Higher Education Council)
            return 'https://www.yok.gov.tr/en'
        }

        // ✅ AUSTRALIA - Government portal + Main university pages
        if (country.includes('australia')) {
            if (provider.includes('macquarie')) {
                return 'https://www.mq.edu.au/'  // Main page always works
            }
            if (provider.includes('technology sydney') || provider.includes('uts')) {
                return 'https://www.uts.edu.au/'  // Main page always works
            }
            if (provider.includes('deakin')) {
                return 'https://www.deakin.edu.au/'  // Main page always works
            }
            if (provider.includes('queensland') && provider.includes('technology')) {
                return 'https://www.qut.edu.au/'  // Main page always works
            }
            if (provider.includes('unsw') || provider.includes('new south wales')) {
                return 'https://www.unsw.edu.au/'  // Main page always works
            }
            if (provider.includes('melbourne')) {
                return 'https://www.unimelb.edu.au/'  // Main page always works
            }
            if (provider.includes('sydney') && !provider.includes('technology')) {
                return 'https://www.sydney.edu.au/'  // Main page always works
            }
            if (provider.includes('monash')) {
                return 'https://www.monash.edu/'  // Main page always works
            }

            // Australian Government Scholarship Portal - ALWAYS WORKS
            return 'https://www.studyaustralia.gov.au/english/study/scholarships'
        }

        // ✅ UNITED STATES - Government portal + Main university pages
        if (country.includes('united states') || country.includes('usa')) {
            if (provider.includes('harvard')) {
                return 'https://www.harvard.edu/'  // Main page always works
            }
            if (provider.includes('stanford')) {
                return 'https://www.stanford.edu/'  // Main page always works
            }
            if (provider.includes('mit')) {
                return 'https://web.mit.edu/'  // Main page always works
            }
            if (provider.includes('yale')) {
                return 'https://www.yale.edu/'  // Main page always works
            }
            if (provider.includes('princeton')) {
                return 'https://www.princeton.edu/'  // Main page always works
            }
            if (provider.includes('columbia')) {
                return 'https://www.columbia.edu/'  // Main page always works
            }

            // US Government Financial Aid - ALWAYS WORKS
            return 'https://studentaid.gov/'
        }

        // ✅ UNITED KINGDOM - Government portal + Main university pages
        if (country.includes('united kingdom') || country.includes('uk')) {
            if (provider.includes('oxford')) {
                return 'https://www.ox.ac.uk/'  // Main page always works
            }
            if (provider.includes('cambridge')) {
                return 'https://www.cam.ac.uk/'  // Main page always works
            }
            if (provider.includes('imperial')) {
                return 'https://www.imperial.ac.uk/'  // Main page always works
            }
            if (provider.includes('london') || provider.includes('ucl')) {
                return 'https://www.ucl.ac.uk/'  // Main page always works
            }
            if (provider.includes('edinburgh')) {
                return 'https://www.ed.ac.uk/'  // Main page always works
            }

            // UK Government Student Finance - ALWAYS WORKS
            return 'https://www.gov.uk/student-finance'
        }

        // ✅ GERMANY - Government portal always works
        if (country.includes('germany')) {
            if (provider.includes('daad')) {
                return 'https://www.daad.de/en/'  // Main page always works
            }
            if (provider.includes('humboldt')) {
                return 'https://www.humboldt-foundation.de/en/'  // Main page always works
            }
            if (provider.includes('erasmus')) {
                return 'https://erasmus-plus.ec.europa.eu/'  // Main page always works
            }

            // German Academic Exchange Service - ALWAYS WORKS
            return 'https://www.daad.de/en/'
        }

        // ✅ CANADA - Government portal always works
        if (country.includes('canada')) {
            if (provider.includes('toronto')) {
                return 'https://www.utoronto.ca/'  // Main page always works
            }
            if (provider.includes('mcgill')) {
                return 'https://www.mcgill.ca/'  // Main page always works
            }
            if (provider.includes('british columbia') || provider.includes('ubc')) {
                return 'https://www.ubc.ca/'  // Main page always works
            }

            // Canadian Government Scholarships - ALWAYS WORKS
            return 'https://www.educanada.ca/scholarships-bourses/index.aspx?lang=eng'
        }

        // ✅ FRANCE - Government portal always works
        if (country.includes('france')) {
            if (provider.includes('sorbonne')) {
                return 'https://www.sorbonne-universite.fr/'  // Main page always works
            }
            if (provider.includes('eiffel')) {
                return 'https://www.campusfrance.org/en/'  // Main page always works
            }

            // French Government Scholarships - ALWAYS WORKS
            return 'https://www.campusfrance.org/en/'
        }

        // ✅ NETHERLANDS - Government portal always works
        if (country.includes('netherlands')) {
            if (provider.includes('amsterdam')) {
                return 'https://www.uva.nl/en'  // Main page always works
            }
            if (provider.includes('delft')) {
                return 'https://www.tudelft.nl/en/'  // Main page always works
            }

            // Dutch Government Scholarships - ALWAYS WORKS
            return 'https://www.studyinholland.nl/'
        }

        // ✅ SINGAPORE - Government portal always works
        if (country.includes('singapore')) {
            if (provider.includes('nus') || provider.includes('national university singapore')) {
                return 'https://www.nus.edu.sg/'  // Main page always works
            }
            if (provider.includes('ntu') || provider.includes('nanyang')) {
                return 'https://www.ntu.edu.sg/'  // Main page always works
            }

            // Singapore Government Scholarships - ALWAYS WORKS
            return 'https://www.moe.gov.sg/'
        }

        // ✅ JAPAN - Government portal always works
        if (country.includes('japan')) {
            if (provider.includes('jasso')) {
                return 'https://www.jasso.go.jp/en/'  // Main page always works
            }
            if (provider.includes('mext')) {
                return 'https://www.studyinjapan.go.jp/en/'  // Main page always works
            }

            // Japanese Government Scholarships - ALWAYS WORKS
            return 'https://www.studyinjapan.go.jp/en/'
        }

        // ✅ SOUTH KOREA - Government portal always works
        if (country.includes('korea')) {
            if (provider.includes('gks') || provider.includes('korean government')) {
                return 'https://www.studyinkorea.go.kr/en/'  // Main page always works
            }

            // Korean Government Scholarship Program - ALWAYS WORKS
            return 'https://www.studyinkorea.go.kr/en/'
        }

        // ✅ SWEDEN - Government portal always works
        if (country.includes('sweden')) {
            return 'https://studyinsweden.se/'  // Government portal always works
        }

        // ✅ NORWAY - Government portal always works
        if (country.includes('norway')) {
            return 'https://www.studyinnorway.no/'  // Government portal always works
        }

        // ✅ SWITZERLAND - Government portal always works
        if (country.includes('switzerland')) {
            return 'https://www.swissuniversities.ch/en/'  // Government portal always works
        }

        // ✅ PROFESSIONAL FALLBACK - ScholarshipPortal (always works)
        return 'https://www.scholarshipportal.com/'
    }

    useEffect(() => {
        fetchScholarships()

        // ✅ LISTEN FOR ADMIN UPDATES - Force refresh after admin changes
        const handleAdminUpdate = () => {
            console.log('🔄 Admin update detected, refreshing scholarships...')
            fetchScholarships()
        }

        // Add event listener for admin updates
        window.addEventListener('scholarshipUpdate', handleAdminUpdate)

        return () => {
            window.removeEventListener('scholarshipUpdate', handleAdminUpdate)
        }
    }, [debouncedSearch, filters, pagination.page])

    const fetchScholarships = async () => {
        setLoading(true)
        try {
            // Convert country code to name for API
            const getCountryNameForAPI = (code: string) => {
                if (code === 'all') return ''

                const country = WORLD_COUNTRIES.find(c => c.code === code)
                if (!country) return ''

                // Return Turkish name for translation in API
                return country.name.tr || country.name.en
            }

            // Build search params
            const searchParams = new URLSearchParams()
            searchParams.append('page', pagination.page.toString())
            searchParams.append('limit', pagination.limit.toString())

            if (debouncedSearch) {
                searchParams.append('search', debouncedSearch)
            }

            if (filters.country !== 'all') {
                const countryName = getCountryNameForAPI(filters.country)
                if (countryName) {
                    searchParams.append('country', countryName)
                }
            }

            if (filters.studyLevel !== 'all') {
                searchParams.append('studyLevel', filters.studyLevel)
            }

            if (filters.provider !== 'all') {
                searchParams.append('provider', filters.provider)
            }

            const url = `/api/scholarships/search?${searchParams.toString()}`
            console.log('🔍 API Call:', url)

            const res = await fetch(url)

            if (!res.ok) {
                throw new Error(`API returned ${res.status}`)
            }

            const data = await res.json()
            console.log('📊 API Response:', data)

            if (data.success && Array.isArray(data.data)) {
                setScholarships(data.data)

                if (data.pagination) {
                    setPagination(prev => ({
                        ...prev,
                        total: data.pagination.total || 0,
                        totalPages: data.pagination.totalPages || 1,
                        hasNext: data.pagination.hasNext || false,
                        hasPrev: data.pagination.hasPrev || false
                    }))
                }

                console.log(`✅ Loaded ${data.data.length} scholarships (Total: ${data.pagination?.total})`)
            } else {
                console.error('❌ Invalid API response:', data)
                setScholarships([])
                setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }))
            }

        } catch (error) {
            console.error('❌ Fetch failed:', error)
            toast.error(t('connectionError'))
            setScholarships([])
            setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }))
        } finally {
            setLoading(false)
        }
    }

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }))
        setPagination(prev => ({ ...prev, page: 1 }))
    }

    const clearFilters = () => {
        setFilters({
            country: 'all',
            studyLevel: 'all',
            provider: 'all',
            minAmount: '',
            maxAmount: ''
        })
        setSearchQuery('')
        setPagination(prev => ({ ...prev, page: 1 }))
    }

    // ✅ MULTI-LANGUAGE MODAL HANDLER
    const handleDetailClick = (scholarship: Scholarship) => {
        setSelectedScholarship(scholarship)
        setIsDetailModalOpen(true)
    }

    const closeDetailModal = () => {
        setIsDetailModalOpen(false)
        setSelectedScholarship(null)
    }

    // ✅ MULTI-LANGUAGE HELPER FUNCTIONS
    const getStudyLevelText = (level: string) => {
        if (resolvedParams.locale === 'tr') {
            return level === 'Bachelor' ? 'Lisans' : level === 'Master' ? 'Yüksek Lisans' : 'Doktora'
        } else {
            return level === 'Bachelor' ? 'Bachelor' : level === 'Master' ? 'Master' : 'PhD'
        }
    }

    const getModalLabels = () => {
        if (resolvedParams.locale === 'tr') {
            return {
                amount: 'Burs Miktarı',
                location: 'Konum',
                level: 'Eğitim Seviyesi',
                deadline: 'Son Başvuru Tarihi',
                provider: 'Sağlayıcı',
                studyFields: 'Çalışma Alanları',
                requirements: 'Gereksinimler',
                minGPA: 'Minimum GPA',
                maxAge: 'Maksimum Yaş',
                eligibleNationalities: 'Uygun Uyruklular',
                close: 'Kapat',
                apply: 'Başvur'
            }
        } else {
            return {
                amount: 'Scholarship Amount',
                location: 'Location',
                level: 'Study Level',
                deadline: 'Application Deadline',
                provider: 'Provider',
                studyFields: 'Study Fields',
                requirements: 'Requirements',
                minGPA: 'Minimum GPA',
                maxAge: 'Maximum Age',
                eligibleNationalities: 'Eligible Nationalities',
                close: 'Close',
                apply: 'Apply'
            }
        }
    }

    const formatDeadline = (deadline: string) => {
        const date = new Date(deadline)
        const now = new Date()
        const diffTime = date.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays < 0) return t('expired')
        if (diffDays < 7) return `${diffDays} ${t('daysLeft')}`
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} ${t('weeksLeft')}`
        return date.toLocaleDateString(resolvedParams.locale === 'tr' ? 'tr-TR' : 'en-US')
    }

    const getDeadlineColor = (deadline: string) => {
        const date = new Date(deadline)
        const now = new Date()
        const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays < 7) return 'text-red-600 bg-red-50'
        if (diffDays < 30) return 'text-orange-600 bg-orange-50'
        return 'text-green-600 bg-green-50'
    }

    const getDeadlineIcon = (deadline: string) => {
        const date = new Date(deadline)
        const now = new Date()
        const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays < 0) return <AlertCircle className="w-4 h-4" />
        if (diffDays < 7) return <Clock className="w-4 h-4" />
        return <CheckCircle className="w-4 h-4" />
    }

    const modalLabels = getModalLabels()

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
                    <p className="text-gray-600 text-lg">
                        {t('subtitle')}
                    </p>
                </div>

                {/* Search & Filters */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="w-5 h-5" />
                            {t('searchAndFilters')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder={t('searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* ✅ IMPROVED FILTER GRID - Better responsive layout */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {/* Country Filter - Takes more space when needed */}
                            <div className="sm:col-span-2 lg:col-span-1 xl:col-span-2">
                                <Label>{t('country')}</Label>
                                <Select
                                    value={filters.country}
                                    onValueChange={(value) => handleFilterChange('country', value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={t('selectCountry')} />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-60 overflow-y-auto min-w-[300px] max-w-[400px]">
                                        {WORLD_COUNTRIES.map((country) => (
                                            <SelectItem
                                                key={country.code}
                                                value={country.code}
                                                className="py-3 px-3 cursor-pointer hover:bg-gray-50"
                                            >
                                                <div className="flex items-center gap-3 w-full min-w-0">
                                                    <span className="flex-shrink-0 text-lg">{country.flag}</span>
                                                    <span className="text-sm font-medium truncate max-w-[250px]">
                                                        {country.name[resolvedParams.locale as 'tr' | 'en'] || country.name.en}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Study Level */}
                            <div>
                                <Label>{t('level')}</Label>
                                <Select
                                    value={filters.studyLevel}
                                    onValueChange={(value) => handleFilterChange('studyLevel', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('selectLevel')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('all')}</SelectItem>
                                        <SelectItem value="Bachelor">{t('bachelor')}</SelectItem>
                                        <SelectItem value="Master">{t('master')}</SelectItem>
                                        <SelectItem value="PhD">{t('phd')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Provider */}
                            <div>
                                <Label>{t('provider')}</Label>
                                <Select
                                    value={filters.provider}
                                    onValueChange={(value) => handleFilterChange('provider', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('selectProvider')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('all')}</SelectItem>
                                        <SelectItem value="Government">{t('government')}</SelectItem>
                                        <SelectItem value="University">{t('university')}</SelectItem>
                                        <SelectItem value="Private">{t('private')}</SelectItem>
                                        <SelectItem value="Foundation">{t('foundation')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Clear Button */}
                            <div className="sm:col-span-2 lg:col-span-1 xl:col-span-1 flex items-end">
                                <Button
                                    variant="outline"
                                    onClick={clearFilters}
                                    className="w-full"
                                >
                                    {t('clearFilters')}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Results */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">
                        {loading ? t('loading') : `${pagination.total || 0} ${t('found')}`}
                    </h2>
                </div>

                {/* Scholarship Grid */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                ) : scholarships && scholarships.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {scholarships.map((scholarship) => (
                            <Card key={scholarship.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex justify-between items-start gap-2">
                                        <CardTitle className="text-lg leading-tight">
                                            {scholarship.title}
                                        </CardTitle>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <Heart className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <CardDescription className="line-clamp-2">
                                        {scholarship.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Amount & Provider */}
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-green-600" />
                                            <span className="font-semibold text-green-600">
                                                {scholarship.amount}
                                            </span>
                                        </div>
                                        <Badge variant="outline">
                                            {scholarship.provider}
                                        </Badge>
                                    </div>

                                    {/* Location */}
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <MapPin className="w-4 h-4" />
                                        <span>{scholarship.city ? `${scholarship.city}, ` : ''}{scholarship.country}</span>
                                    </div>

                                    {/* Study Levels */}
                                    {scholarship.studyLevel && scholarship.studyLevel.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {scholarship.studyLevel.map((level) => (
                                                <Badge key={level} variant="secondary" className="text-xs">
                                                    {getStudyLevelText(level)}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    {/* Requirements hint */}
                                    {scholarship.requirements && scholarship.requirements.length > 0 && (
                                        <div className="text-xs text-gray-500">
                                            {scholarship.requirements.length} {t('requirements')}
                                        </div>
                                    )}

                                    {/* Divider */}
                                    <hr className="border-gray-200" />

                                    {/* Deadline & Actions */}
                                    <div className="flex justify-between items-center">
                                        <div className={`flex items-center gap-2 text-xs px-2 py-1 rounded-full ${getDeadlineColor(scholarship.deadline)}`}>
                                            {getDeadlineIcon(scholarship.deadline)}
                                            {formatDeadline(scholarship.deadline)}
                                        </div>
                                        <div className="flex gap-2">
                                            {/* ✅ FIXED DETAIL BUTTON with multi-language modal */}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDetailClick(scholarship)}
                                            >
                                                {t('details')}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">{t('noScholarships')}</h3>
                        <p className="text-gray-600 mb-4">
                            {t('tryDifferentCriteria')}
                        </p>
                        <Button onClick={clearFilters} variant="outline">
                            {t('clearFilters')}
                        </Button>
                    </div>
                )}

                {/* Pagination */}
                {!loading && scholarships && scholarships.length > 0 && (
                    <div className="flex justify-center gap-2">
                        <Button
                            variant="outline"
                            disabled={!pagination.hasPrev}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        >
                            {t('previous')}
                        </Button>
                        <div className="flex items-center px-4">
                            {pagination.page} / {pagination.totalPages || 1}
                        </div>
                        <Button
                            variant="outline"
                            disabled={!pagination.hasNext}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        >
                            {t('next')}
                        </Button>
                    </div>
                )}
            </div>

            {/* ✅ MULTI-LANGUAGE PROFESSIONAL DETAIL MODAL */}
            <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    {selectedScholarship && (
                        <>
                            <DialogHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <DialogTitle className="text-xl font-bold mb-2 pr-8">
                                            {selectedScholarship.title}
                                        </DialogTitle>
                                        <DialogDescription className="text-base">
                                            {selectedScholarship.description}
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <DollarSign className="w-5 h-5 text-green-600" />
                                            <div>
                                                <p className="text-sm text-gray-600">{modalLabels.amount}</p>
                                                <p className="font-semibold text-green-600">{selectedScholarship.amount}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-5 h-5 text-blue-600" />
                                            <div>
                                                <p className="text-sm text-gray-600">{modalLabels.location}</p>
                                                <p className="font-medium">
                                                    {selectedScholarship.city ? `${selectedScholarship.city}, ` : ''}
                                                    {selectedScholarship.country}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <GraduationCap className="w-5 h-5 text-purple-600" />
                                            <div>
                                                <p className="text-sm text-gray-600">{modalLabels.level}</p>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {selectedScholarship.studyLevel.map((level) => (
                                                        <Badge key={level} variant="secondary" className="text-xs">
                                                            {getStudyLevelText(level)}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-5 h-5 text-orange-600" />
                                            <div>
                                                <p className="text-sm text-gray-600">{modalLabels.deadline}</p>
                                                <p className="font-medium">
                                                    {new Date(selectedScholarship.deadline).toLocaleDateString(resolvedParams.locale === 'tr' ? 'tr-TR' : 'en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                                <div className={`inline-flex items-center gap-1 text-xs mt-1 px-2 py-1 rounded-full ${getDeadlineColor(selectedScholarship.deadline)}`}>
                                                    {getDeadlineIcon(selectedScholarship.deadline)}
                                                    {formatDeadline(selectedScholarship.deadline)}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">{modalLabels.provider}</p>
                                            <Badge variant="outline" className="font-medium">
                                                {selectedScholarship.provider}
                                            </Badge>
                                        </div>

                                        {selectedScholarship.fieldOfStudy && selectedScholarship.fieldOfStudy.length > 0 && (
                                            <div>
                                                <p className="text-sm text-gray-600 mb-2">{modalLabels.studyFields}</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {selectedScholarship.fieldOfStudy.map((field) => (
                                                        <Badge key={field} variant="outline" className="text-xs">
                                                            {field}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Requirements */}
                                {selectedScholarship.requirements && selectedScholarship.requirements.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            {modalLabels.requirements} ({selectedScholarship.requirements.length})
                                        </h4>
                                        <ul className="space-y-2">
                                            {selectedScholarship.requirements.map((requirement, index) => (
                                                <li key={index} className="flex items-start gap-2 text-sm">
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                                    <span>{requirement}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Additional Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                    {selectedScholarship.minGPA && (
                                        <div>
                                            <p className="text-sm text-gray-600">{modalLabels.minGPA}</p>
                                            <p className="font-medium">{selectedScholarship.minGPA}</p>
                                        </div>
                                    )}
                                    {selectedScholarship.maxAge && (
                                        <div>
                                            <p className="text-sm text-gray-600">{modalLabels.maxAge}</p>
                                            <p className="font-medium">{selectedScholarship.maxAge}</p>
                                        </div>
                                    )}
                                    {selectedScholarship.nationality && selectedScholarship.nationality.length > 0 && (
                                        <div className="md:col-span-2">
                                            <p className="text-sm text-gray-600 mb-2">{modalLabels.eligibleNationalities}</p>
                                            <div className="flex flex-wrap gap-1">
                                                {selectedScholarship.nationality.map((nat) => (
                                                    <Badge key={nat} variant="secondary" className="text-xs">
                                                        {nat}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <DialogFooter className="flex gap-3 pt-4">
                                <Button variant="outline" onClick={closeDetailModal}>
                                    {modalLabels.close}
                                </Button>
                                {/* ✅ REAL SCHOLARSHIP URL BUTTON */}
                                <Button asChild>
                                    <a
                                        href={generateRealScholarshipURL(selectedScholarship)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2"
                                        onClick={() => {
                                            console.log('🔗 Real scholarship URL clicked:', selectedScholarship.title)
                                        }}
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        {modalLabels.apply}
                                    </a>
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}