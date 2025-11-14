'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Search, Filter, Calendar, DollarSign, MapPin, GraduationCap, ExternalLink, Heart, Loader2 } from 'lucide-react'
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

    const debouncedSearch = useDebounce(searchQuery, 500)

    useEffect(() => {
        fetchScholarships()
    }, [debouncedSearch, filters, pagination.page])

    const fetchScholarships = async () => {
        setLoading(true)
        try {
            const searchParams = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                ...(debouncedSearch && { search: debouncedSearch }),
                ...(filters.country !== 'all' && { country: filters.country }),
                ...(filters.studyLevel !== 'all' && { studyLevel: filters.studyLevel }),
                ...(filters.provider !== 'all' && { provider: filters.provider }),
            })

            const res = await fetch(`/api/scholarships?${searchParams}`)
            if (res.ok) {
                const data = await res.json()
                setScholarships(data.scholarships)
                setPagination(data.pagination)
            } else {
                toast.error(t('loadError'))
            }
        } catch (error) {
            toast.error(t('connectionError'))
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

                        {/* Filter Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div>
                                <Label>{t('country')}</Label>
                                <Select
                                    value={filters.country}
                                    onValueChange={(value) => handleFilterChange('country', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('selectCountry')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {WORLD_COUNTRIES.map((country) => (
                                            <SelectItem key={country.code} value={country.code}>
                                                {country.flag} {country.name[resolvedParams.locale as 'tr' | 'en'] || country.name.en}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

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

                            <div className="md:col-span-2 flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={clearFilters}
                                    className="flex-1"
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
                        {loading ? t('loading') : `${pagination.total} ${t('found')}`}
                    </h2>
                </div>

                {/* Scholarship Grid */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                ) : (
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
                                    {scholarship.studyLevel.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {scholarship.studyLevel.map((level) => (
                                                <Badge key={level} variant="secondary" className="text-xs">
                                                    {level === 'Bachelor' ? t('bachelorShort') :
                                                        level === 'Master' ? t('masterShort') : t('phdShort')}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    {/* Requirements hint */}
                                    {scholarship.requirements.length > 0 && (
                                        <div className="text-xs text-gray-500">
                                            {scholarship.requirements.length} {t('requirements')}
                                        </div>
                                    )}

                                    {/* Divider */}
                                    <hr className="border-gray-200" />

                                    {/* Deadline & Actions */}
                                    <div className="flex justify-between items-center">
                                        <div className={`flex items-center gap-2 text-xs px-2 py-1 rounded-full ${getDeadlineColor(scholarship.deadline)}`}>
                                            <Calendar className="w-3 h-3" />
                                            {formatDeadline(scholarship.deadline)}
                                        </div>
                                        <div className="flex gap-2">
                                            {scholarship.applicationUrl && (
                                                <Button size="sm" variant="outline" asChild>
                                                    <a href={scholarship.applicationUrl} target="_blank" rel="noopener">
                                                        <ExternalLink className="w-3 h-3 mr-1" />
                                                        {t('apply')}
                                                    </a>
                                                </Button>
                                            )}
                                            <Button size="sm">
                                                {t('details')}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!loading && scholarships.length > 0 && (
                    <div className="flex justify-center gap-2">
                        <Button
                            variant="outline"
                            disabled={!pagination.hasPrev}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        >
                            {t('previous')}
                        </Button>
                        <div className="flex items-center px-4">
                            {pagination.page} / {pagination.totalPages}
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

                {/* No results */}
                {!loading && scholarships.length === 0 && (
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
            </div>
        </div>
    )
}