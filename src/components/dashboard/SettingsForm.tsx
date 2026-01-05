'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    User, Bell, Shield, Palette, Save,
    Download, Moon, Sun, Laptop, Mail, LogOut, CheckCircle2,
    Smartphone, MapPin, Loader2, Send
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface SettingsFormProps {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        emailNotifications?: boolean;
        marketingEmails?: boolean;
    }
}

// Yan menü öğeleri
const sidebarItems = [
    { id: 'profile', icon: User, label: 'profile' },
    { id: 'security', icon: Shield, label: 'security' },
    { id: 'notifications', icon: Bell, label: 'notifications' },
    { id: 'preferences', icon: Palette, label: 'preferences' },
];

export default function SettingsForm({ user }: SettingsFormProps) {
    const t = useTranslations('settings');
    const router = useRouter();

    // State'ler
    const [activeTab, setActiveTab] = useState('profile');
    const [darkMode, setDarkMode] = useState(false);

    // Form Verileri (Başlangıç değerleri prop'tan gelir)
    const [initialValues, setInitialValues] = useState({
        name: user.name || '',
        emailNotifications: user.emailNotifications ?? true,
        marketingEmails: user.marketingEmails ?? false
    });

    const [name, setName] = useState(user.name || '');
    const [emailNotifications, setEmailNotifications] = useState(user.emailNotifications ?? true);
    const [marketingEmails, setMarketingEmails] = useState(user.marketingEmails ?? false);

    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [isSendingTest, setIsSendingTest] = useState(false);
    const [testEmailSent, setTestEmailSent] = useState(false);

    const [deviceInfo, setDeviceInfo] = useState({ os: 'Unknown', browser: 'Unknown', type: 'desktop' });
    const [locationInfo, setLocationInfo] = useState<string | null>(null);

    // Değişiklik Kontrolü: Mevcut değerler başlangıç değerlerinden farklı mı?
    const hasChanges =
        name !== initialValues.name ||
        emailNotifications !== initialValues.emailNotifications ||
        marketingEmails !== initialValues.marketingEmails;

    useEffect(() => {
        // Dark Mode Kontrolü
        const isDark = document.documentElement.classList.contains('dark');
        setDarkMode(isDark);

        // Cihaz Tespiti
        const detectDevice = async () => {
            if (typeof window !== 'undefined') {
                const ua = window.navigator.userAgent;
                let os = 'Unknown OS', browser = 'Unknown Browser', type = 'desktop';

                if (ua.indexOf("Win") !== -1) os = "Windows";
                else if (ua.indexOf("Mac") !== -1) os = "MacOS";
                else if (ua.indexOf("Linux") !== -1) os = "Linux";
                else if (ua.indexOf("Android") !== -1) { os = "Android"; type = 'mobile'; }
                else if (ua.indexOf("iOS") !== -1) { os = "iOS"; type = 'mobile'; }

                // Tarayıcı Tespiti
                // @ts-ignore
                if ((navigator as any).brave && await (navigator as any).brave.isBrave()) {
                    browser = "Brave";
                } else if (ua.indexOf("Edg") !== -1) {
                    browser = "Edge";
                } else if (ua.indexOf("Chrome") !== -1) {
                    browser = "Chrome";
                } else if (ua.indexOf("Safari") !== -1) {
                    browser = "Safari";
                } else if (ua.indexOf("Firefox") !== -1) {
                    browser = "Firefox";
                }

                setDeviceInfo({ os, browser, type });
            }
        };

        detectDevice();

        // Konum Tespiti
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    if (res.ok) {
                        const data = await res.json();
                        const city = data.address.city || data.address.town || data.address.state;
                        const country = data.address.country_code?.toUpperCase();
                        if (city) setLocationInfo(`${city}, ${country}`);
                    }
                } catch (e) { console.error(e); }
            }, () => {});
        }
    }, []);

    const toggleDarkMode = (checked: boolean) => {
        setDarkMode(checked);
        if (checked) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    // --- GERÇEK KAYIT İŞLEMİ ---
    const handleSave = async () => {
        if (!hasChanges) return; // Değişiklik yoksa işlem yapma

        setIsSaving(true);
        setSaveSuccess(false);

        try {
            const response = await fetch('/api/user/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    emailNotifications,
                    marketingEmails,
                })
            });

            if (!response.ok) throw new Error('Kayıt başarısız');

            // Başarılı kaydettikten sonra initial values'ı güncelle
            setInitialValues({
                name,
                emailNotifications,
                marketingEmails
            });

            setSaveSuccess(true);
            router.refresh(); // Sunucu verilerini yenile

            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error(error);
            alert("Ayarlar kaydedilirken bir hata oluştu.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDownloadData = () => {
        const data = JSON.stringify({
            userProfile: { ...user, name, emailNotifications, marketingEmails },
            appSettings: { darkMode },
            deviceInfo,
            exportDate: new Date().toISOString()
        }, null, 2);

        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `my-data.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Test Email Gönder
    const handleSendTestEmail = async () => {
        setIsSendingTest(true);
        setTestEmailSent(false);

        try {
            const response = await fetch('/api/email/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'test' })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setTestEmailSent(true);
                setTimeout(() => setTestEmailSent(false), 5000);
            } else {
                alert(data.error || 'Email gönderilemedi. Email bildirimlerinizin açık olduğundan emin olun.');
            }
        } catch (error) {
            console.error('Test email error:', error);
            alert('Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setIsSendingTest(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 min-h-[600px] animate-in fade-in-50 duration-500">

            <aside className="lg:w-64 flex-shrink-0">
                <div className="sticky top-4 space-y-1">
                    <h2 className="mb-4 px-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {t('title')}
                    </h2>
                    <nav className="space-y-1">
                        {sidebarItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                                        isActive
                                            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 shadow-sm ring-1 ring-blue-200 dark:ring-blue-800"
                                            : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50 hover:text-slate-900"
                                    )}
                                >
                                    <Icon className={cn("w-5 h-5", isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400")} />
                                    {t(`tabs.${item.label}`)}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            <main className="flex-1 space-y-6">

                {/* 1. PROFİL */}
                {activeTab === 'profile' && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 pb-8">
                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-3xl font-bold text-blue-600 border-4 border-white shadow-lg overflow-hidden">
                                        {user.image ? <img src={user.image} alt="User" className="w-full h-full object-cover" /> : (name || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="text-center sm:text-left space-y-1">
                                        <h3 className="font-bold text-2xl text-slate-900 dark:text-white">{name}</h3>
                                        <p className="text-sm text-slate-500 font-medium">{user.email}</p>
                                        <Badge variant="secondary" className="mt-2">{t('profile.planBadge')}</Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-8">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">{t('profile.name')}</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="pl-10" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">{t('profile.email')}</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                            <Input id="email" value={user.email || ''} disabled className="pl-10 cursor-not-allowed bg-slate-100" />
                                        </div>
                                        <p className="text-[11px] text-slate-400">{t('profile.emailNote')}</p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-slate-50/50 border-t flex justify-end p-4">
                                <div className="flex items-center gap-4">
                                    {saveSuccess && <span className="text-sm text-green-600 flex items-center gap-1 animate-in fade-in"><CheckCircle2 className="w-4 h-4"/> {t('saveSuccess')}</span>}
                                    <Button
                                        onClick={handleSave}
                                        disabled={!hasChanges || isSaving}
                                        className={cn(
                                            "min-w-[140px] transition-all",
                                            hasChanges
                                                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                                                : "bg-slate-100 text-slate-400 cursor-not-allowed hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-600"
                                        )}
                                    >
                                        {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> {t('saving')}</> : t('save')}
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                )}

                {/* 2. GÜVENLİK */}
                {activeTab === 'security' && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                            <CardHeader>
                                <CardTitle>{t('security.activeSessions')}</CardTitle>
                                <CardDescription>{t('security.deviceDesc')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-xl bg-slate-50/50">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white rounded-lg shadow-sm border">
                                            {deviceInfo.type === 'mobile' ? <Smartphone className="h-6 w-6 text-blue-600" /> : <Laptop className="h-6 w-6 text-blue-600" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-slate-900">{deviceInfo.os} - {deviceInfo.browser}</p>
                                                {deviceInfo.browser === 'Brave' && <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 rounded border border-orange-200">Güvenli</span>}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1">
                                                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                                    {t('security.currentSession')}
                                                </p>
                                                {locationInfo && <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3"/> {locationInfo}</p>}
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50"><LogOut className="w-4 h-4 mr-2"/> {t('security.logout')}</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* 3. BİLDİRİMLER (ARTIK ÇALIŞIYOR) */}
                {activeTab === 'notifications' && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                            <CardHeader>
                                <CardTitle>{t('notifications.title')}</CardTitle>
                                <CardDescription>{t('notifications.desc')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className="space-y-0.5">
                                        <Label className="text-base font-medium">{t('notifications.emailTitle')}</Label>
                                        <p className="text-sm text-slate-500">{t('notifications.emailDesc')}</p>
                                    </div>
                                    <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className="space-y-0.5">
                                        <Label className="text-base font-medium">{t('notifications.marketingTitle')}</Label>
                                        <p className="text-sm text-slate-500">{t('notifications.marketingDesc')}</p>
                                    </div>
                                    <Switch checked={marketingEmails} onCheckedChange={setMarketingEmails} />
                                </div>
                                <Separator />
                                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Label className="text-base font-medium text-blue-900 dark:text-blue-100">Test Email Gönder</Label>
                                            <p className="text-sm text-blue-700 dark:text-blue-300">Email sisteminin çalışıp çalışmadığını test edin</p>
                                        </div>
                                        <Button
                                            onClick={handleSendTestEmail}
                                            disabled={isSendingTest || !emailNotifications}
                                            variant="outline"
                                            className="min-w-[140px] bg-white dark:bg-slate-800"
                                        >
                                            {isSendingTest ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Gönderiliyor...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4 mr-2" />
                                                    Test Gönder
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    {testEmailSent && (
                                        <div className="mt-3 flex items-center gap-2 text-sm text-green-600 dark:text-green-400 animate-in fade-in">
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span>Test emaili başarıyla gönderildi! {user.email} adresini kontrol edin.</span>
                                        </div>
                                    )}
                                    {!emailNotifications && (
                                        <div className="mt-3 text-sm text-orange-600 dark:text-orange-400">
                                            ⚠️ Test emaili göndermek için email bildirimlerini açmanız gerekiyor.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="bg-slate-50/50 border-t flex justify-end p-4">
                                <div className="flex items-center gap-4">
                                    {saveSuccess && <span className="text-sm text-green-600 flex items-center gap-1 animate-in fade-in"><CheckCircle2 className="w-4 h-4"/> {t('saveSuccess')}</span>}
                                    <Button
                                        onClick={handleSave}
                                        disabled={!hasChanges || isSaving}
                                        className={cn(
                                            "min-w-[140px] transition-all",
                                            hasChanges
                                                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                                                : "bg-slate-100 text-slate-400 cursor-not-allowed hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-600"
                                        )}
                                    >
                                        {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> {t('saving')}</> : t('save')}
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                )}

                {/* 4. TERCİHLER */}
                {activeTab === 'preferences' && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('preferences.theme')}</CardTitle>
                                <CardDescription>{t('preferences.themeDesc')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between p-3 rounded-xl border bg-slate-50/50">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("p-3 rounded-xl transition-all", darkMode ? "bg-slate-800 text-yellow-400" : "bg-white text-slate-400 shadow-sm")}>
                                            {darkMode ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
                                        </div>
                                        <div className="space-y-0.5">
                                            <Label className="text-base cursor-pointer">{t('preferences.darkMode')}</Label>
                                            <p className="text-sm text-slate-500">{t('preferences.darkModeDesc')}</p>
                                        </div>
                                    </div>
                                    <Switch checked={darkMode} onCheckedChange={toggleDarkMode} className="data-[state=checked]:bg-blue-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t('preferences.dataPrivacy')}</CardTitle>
                                <CardDescription>{t('preferences.privacyDesc')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between p-4 border rounded-xl bg-slate-50/50">
                                    <div className="space-y-1">
                                        <p className="font-medium">{t('preferences.downloadData')}</p>
                                        <p className="text-xs text-slate-500">{t('preferences.jsonDesc')}</p>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={handleDownloadData} className="gap-2">
                                        <Download className="w-4 h-4" /> {t('preferences.download')}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </main>
        </div>
    )
}