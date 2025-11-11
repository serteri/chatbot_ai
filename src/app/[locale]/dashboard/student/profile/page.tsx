'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Loader2, Save, User, GraduationCap, FileText, Globe } from 'lucide-react'

export default function StudentProfilePage() {
    const { data: session } = useSession()
    const t = useTranslations('StudentProfile')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [profile, setProfile] = useState<any>(null)

    useEffect(() => {
        if (session?.user) {
            fetchProfile()
        }
    }, [session])

    const fetchProfile = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/student/profile')
            if (res.ok) {
                const data = await res.json()

                // ✅ Eğer profil yoksa, user bilgilerinden doldur
                if (!data.profile && session?.user) {
                    const nameParts = session.user.name?.split(' ') || []
                    setProfile({
                        firstName: nameParts[0] || '',
                        lastName: nameParts.slice(1).join(' ') || '',
                        preferredCountries: [],
                        preferredFields: []
                    })
                } else {
                    setProfile(data.profile)
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch('/api/student/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile)
            })

            if (res.ok) {
                toast.success(t('saveSuccess'))
            } else {
                toast.error(t('saveError'))
            }
        } catch (error) {
            toast.error(t('saveError'))
        } finally {
            setSaving(false)
        }
    }

    const updateProfile = (field: string, value: any) => {
        setProfile({ ...profile, [field]: value })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">{t('title')}</h1>
                        <p className="text-gray-600">{t('subtitle')}</p>
                    </div>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        {t('save')}
                    </Button>
                </div>

                <Tabs defaultValue="personal" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="personal">
                            <User className="w-4 h-4 mr-2" />
                            {t('tabs.personal')}
                        </TabsTrigger>
                        <TabsTrigger value="academic">
                            <GraduationCap className="w-4 h-4 mr-2" />
                            {t('tabs.academic')}
                        </TabsTrigger>
                        <TabsTrigger value="tests">
                            <FileText className="w-4 h-4 mr-2" />
                            {t('tabs.tests')}
                        </TabsTrigger>
                        <TabsTrigger value="preferences">
                            <Globe className="w-4 h-4 mr-2" />
                            {t('tabs.preferences')}
                        </TabsTrigger>
                    </TabsList>

                    {/* Personal Info */}
                    <TabsContent value="personal">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('personal.title')}</CardTitle>
                                <CardDescription>{t('personal.description')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>{t('personal.firstName')} *</Label>
                                        <Input
                                            value={profile?.firstName || ''}
                                            onChange={(e) => updateProfile('firstName', e.target.value)}
                                            placeholder={t('personal.firstNamePlaceholder')}
                                        />
                                    </div>
                                    <div>
                                        <Label>{t('personal.lastName')} *</Label>
                                        <Input
                                            value={profile?.lastName || ''}
                                            onChange={(e) => updateProfile('lastName', e.target.value)}
                                            placeholder={t('personal.lastNamePlaceholder')}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>{t('personal.dateOfBirth')}</Label>
                                    <Input
                                        type="date"
                                        value={profile?.dateOfBirth?.split('T')[0] || ''}
                                        onChange={(e) => updateProfile('dateOfBirth', e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>{t('personal.nationality')}</Label>
                                        <Input
                                            value={profile?.nationality || ''}
                                            onChange={(e) => updateProfile('nationality', e.target.value)}
                                            placeholder={t('personal.nationalityPlaceholder')}
                                        />
                                    </div>
                                    <div>
                                        <Label>{t('personal.phoneNumber')}</Label>
                                        <Input
                                            value={profile?.phoneNumber || ''}
                                            onChange={(e) => updateProfile('phoneNumber', e.target.value)}
                                            placeholder="+90 555 123 4567"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>{t('personal.currentCountry')}</Label>
                                        <Input
                                            value={profile?.currentCountry || ''}
                                            onChange={(e) => updateProfile('currentCountry', e.target.value)}
                                            placeholder={t('personal.currentCountryPlaceholder')}
                                        />
                                    </div>
                                    <div>
                                        <Label>{t('personal.currentCity')}</Label>
                                        <Input
                                            value={profile?.currentCity || ''}
                                            onChange={(e) => updateProfile('currentCity', e.target.value)}
                                            placeholder={t('personal.currentCityPlaceholder')}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Academic Background */}
                    <TabsContent value="academic">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('academic.title')}</CardTitle>
                                <CardDescription>{t('academic.description')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>{t('academic.highestDegree')}</Label>
                                    <Select
                                        value={profile?.highestDegree || ''}
                                        onValueChange={(value) => updateProfile('highestDegree', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('academic.selectDegree')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="High School">{t('academic.degrees.highSchool')}</SelectItem>
                                            <SelectItem value="Bachelor's">{t('academic.degrees.bachelors')}</SelectItem>
                                            <SelectItem value="Master's">{t('academic.degrees.masters')}</SelectItem>
                                            <SelectItem value="PhD">{t('academic.degrees.phd')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>{t('academic.fieldOfStudy')}</Label>
                                    <Input
                                        value={profile?.fieldOfStudy || ''}
                                        onChange={(e) => updateProfile('fieldOfStudy', e.target.value)}
                                        placeholder={t('academic.fieldPlaceholder')}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>{t('academic.gpa')}</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="4"
                                            value={profile?.gpa || ''}
                                            onChange={(e) => updateProfile('gpa', parseFloat(e.target.value))}
                                            placeholder="3.5"
                                        />
                                    </div>
                                    <div>
                                        <Label>{t('academic.graduationYear')}</Label>
                                        <Input
                                            type="number"
                                            value={profile?.graduationYear || ''}
                                            onChange={(e) => updateProfile('graduationYear', parseInt(e.target.value))}
                                            placeholder="2024"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>{t('academic.institution')}</Label>
                                    <Input
                                        value={profile?.institution || ''}
                                        onChange={(e) => updateProfile('institution', e.target.value)}
                                        placeholder={t('academic.institutionPlaceholder')}
                                    />
                                </div>

                                <div>
                                    <Label>{t('academic.workExperience')}</Label>
                                    <Input
                                        value={profile?.workExperience || ''}
                                        onChange={(e) => updateProfile('workExperience', e.target.value)}
                                        placeholder="2"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Test Scores */}
                    <TabsContent value="tests">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('tests.title')}</CardTitle>
                                <CardDescription>{t('tests.description')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>{t('tests.toefl')}</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            max="120"
                                            value={profile?.toeflScore || ''}
                                            onChange={(e) => updateProfile('toeflScore', parseInt(e.target.value))}
                                            placeholder="100"
                                        />
                                    </div>
                                    <div>
                                        <Label>{t('tests.ielts')}</Label>
                                        <Input
                                            type="number"
                                            step="0.5"
                                            min="0"
                                            max="9"
                                            value={profile?.ieltsScore || ''}
                                            onChange={(e) => updateProfile('ieltsScore', parseFloat(e.target.value))}
                                            placeholder="7.5"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>{t('tests.sat')}</Label>
                                        <Input
                                            type="number"
                                            min="400"
                                            max="1600"
                                            value={profile?.satScore || ''}
                                            onChange={(e) => updateProfile('satScore', parseInt(e.target.value))}
                                            placeholder="1500"
                                        />
                                    </div>
                                    <div>
                                        <Label>{t('tests.gre')}</Label>
                                        <Input
                                            type="number"
                                            min="260"
                                            max="340"
                                            value={profile?.greScore || ''}
                                            onChange={(e) => updateProfile('greScore', parseInt(e.target.value))}
                                            placeholder="320"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label>{t('tests.gmat')}</Label>
                                    <Input
                                        type="number"
                                        min="200"
                                        max="800"
                                        value={profile?.gmatScore || ''}
                                        onChange={(e) => updateProfile('gmatScore', parseInt(e.target.value))}
                                        placeholder="700"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Preferences */}
                    <TabsContent value="preferences">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('preferences.title')}</CardTitle>
                                <CardDescription>{t('preferences.description')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>{t('preferences.countries')}</Label>
                                    <Input
                                        value={profile?.preferredCountries?.join(', ') || ''}
                                        onChange={(e) => updateProfile('preferredCountries', e.target.value.split(',').map((s: string) => s.trim()))}
                                        placeholder="USA, Germany, Canada"
                                    />
                                </div>

                                <div>
                                    <Label>{t('preferences.fields')}</Label>
                                    <Input
                                        value={profile?.preferredFields?.join(', ') || ''}
                                        onChange={(e) => updateProfile('preferredFields', e.target.value.split(',').map((s: string) => s.trim()))}
                                        placeholder="Computer Science, Data Science"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>{t('preferences.budgetMin')}</Label>
                                        <Input
                                            type="number"
                                            value={profile?.budgetMin || ''}
                                            onChange={(e) => updateProfile('budgetMin', parseInt(e.target.value))}
                                            placeholder="10000"
                                        />
                                    </div>
                                    <div>
                                        <Label>{t('preferences.budgetMax')}</Label>
                                        <Input
                                            type="number"
                                            value={profile?.budgetMax || ''}
                                            onChange={(e) => updateProfile('budgetMax', parseInt(e.target.value))}
                                            placeholder="50000"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>{t('preferences.intakeYear')}</Label>
                                        <Select
                                            value={profile?.intakeYear?.toString() || ''}
                                            onValueChange={(value) => updateProfile('intakeYear', parseInt(value))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('preferences.selectYear')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="2025">2025</SelectItem>
                                                <SelectItem value="2026">2026</SelectItem>
                                                <SelectItem value="2027">2027</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>{t('preferences.intakeSemester')}</Label>
                                        <Select
                                            value={profile?.intakeSemester || ''}
                                            onValueChange={(value) => updateProfile('intakeSemester', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('preferences.selectSemester')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Fall">{t('preferences.semesters.fall')}</SelectItem>
                                                <SelectItem value="Spring">{t('preferences.semesters.spring')}</SelectItem>
                                                <SelectItem value="Summer">{t('preferences.semesters.summer')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}