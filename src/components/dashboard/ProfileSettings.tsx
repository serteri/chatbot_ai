'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, Lock, Save, Camera, CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Yükleniyor simgesi
function Loader2({ className }: { className?: string }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}

interface ProfileSettingsProps {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
    hasPassword?: boolean; // YENİ: Kullanıcının şifresi var mı?
}

export default function ProfileSettings({ user, hasPassword = false }: ProfileSettingsProps) {
    const t = useTranslations('profile');

    // Initial değerleri sakla
    const [initialValues, setInitialValues] = useState({
        name: user.name || '',
        phone: ''
    });

    // Form State'leri
    const [name, setName] = useState(user.name || '');
    const [phone, setPhone] = useState('');
    const [email] = useState(user.email || '');

    // Değişiklik kontrolü
    const hasChanges = name !== initialValues.name || phone !== initialValues.phone;

    // Şifre Alanı Kontrolü
    const [isPasswordOpen, setIsPasswordOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // Durumlar
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    // Kaydetme İşlemi
    const handleSave = async () => {
        setIsLoading(true);
        setStatus('idle');

        // Simülasyon: API isteği
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Başarılı kaydettikten sonra initial values'ı güncelle
        setInitialValues({
            name,
            phone
        });

        setIsLoading(false);
        setStatus('success');

        // 3 saniye sonra başarı mesajını gizle
        setTimeout(() => setStatus('idle'), 3000);
    };

    return (
        <div className="space-y-8 animate-in fade-in-50 duration-500">
            
            {/* --- Üst Başlık ve Avatar Bölümü --- */}
            <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white rounded-xl border border-slate-100 shadow-sm">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                        {user.image ? (
                            <img src={user.image} alt={name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-3xl font-bold text-slate-400">
                                {(name || 'U').charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    {/* Sosyal medya ile girenlerde fotoğraf değişimi de kapatılabilir, ama şimdilik açık bırakıyoruz */}
                    <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110" title="Fotoğrafı Değiştir">
                        <Camera className="w-4 h-4" />
                    </button>
                </div>
                
                <div className="text-center md:text-left space-y-1">
                    <h2 className="text-2xl font-bold text-slate-900">{name || 'İsimsiz Kullanıcı'}</h2>
                    <p className="text-slate-500 font-medium">{email}</p>
                    <div className="pt-2 flex gap-2 justify-center md:justify-start">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-100">
                            {t('planPro')}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 border border-green-100">
                            {t('statusActive')}
                        </span>
                    </div>
                </div>
            </div>

            {/* --- Kişisel Bilgiler Formu --- */}
            <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        {t('personalInfo')}
                    </CardTitle>
                    <CardDescription>
                        {t('personalInfoDesc')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <User className="w-4 h-4 text-slate-400" />
                                {t('fullName')}
                            </label>
                            <Input 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                placeholder={t('fullNamePlaceholder')} 
                                className="bg-slate-50/50 border-slate-200 focus:bg-white transition-colors"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-slate-400" />
                                {t('email')}
                            </label>
                            <Input 
                                value={email} 
                                disabled 
                                className="bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200" 
                            />
                            <p className="text-[11px] text-slate-400 pl-1">
                                {t('emailReadOnly')}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-slate-400" />
                                {t('phone')}
                            </label>
                            <Input 
                                value={phone} 
                                onChange={(e) => setPhone(e.target.value)} 
                                placeholder="+90 555 000 00 00" 
                                type="tel"
                                className="bg-slate-50/50 border-slate-200 focus:bg-white transition-colors"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* --- Güvenlik / Şifre --- */}
            {/* YENİ: Sadece şifresi olan (sosyal medya olmayan) kullanıcılar için göster */}
            {hasPassword && (
                <Card className="border-slate-200 shadow-sm overflow-hidden">
                    <div 
                        className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                        onClick={() => setIsPasswordOpen(!isPasswordOpen)}
                    >
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <Lock className="w-5 h-5 text-blue-600" />
                                {t('securityTitle')}
                            </h3>
                            <p className="text-sm text-slate-500">
                                {t('securityDesc')}
                            </p>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm"
                            className={isPasswordOpen ? "bg-slate-200 text-slate-800" : ""}
                        >
                            {isPasswordOpen ? t('cancel') : t('changePassword')}
                        </Button>
                    </div>

                    {/* Açılır Şifre Alanı */}
                    {isPasswordOpen && (
                        <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2 duration-300">
                            <Separator className="mb-6" />
                            <div className="grid gap-4 max-w-md bg-slate-50 p-6 rounded-xl border border-slate-200">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">{t('currentPassword')}</label>
                                    <Input 
                                        type="password" 
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="••••••••" 
                                        className="bg-white" 
                                    />
                                </div>
                                <Separator className="my-2" />
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">{t('newPassword')}</label>
                                    <Input 
                                        type="password" 
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••" 
                                        className="bg-white" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">{t('confirmPassword')}</label>
                                    <Input type="password" placeholder="••••••••" className="bg-white" />
                                </div>
                                <div className="pt-2">
                                    <Button className="w-full bg-slate-900 text-white hover:bg-slate-800">
                                        {t('updatePassword')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </Card>
            )}

            {/* --- Alt Eylem Çubuğu --- */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
                {status === 'success' && (
                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium animate-in fade-in slide-in-from-right-5">
                        <CheckCircle2 className="w-4 h-4" />
                        {t('successMessage')}
                    </div>
                )}
                
                <Button
                    onClick={handleSave}
                    disabled={isLoading || !hasChanges}
                    className={
                        hasChanges
                            ? "bg-blue-600 hover:bg-blue-700 text-white min-w-[160px] shadow-lg shadow-blue-600/20"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed min-w-[160px] hover:bg-slate-100"
                    }
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {t('saving')}
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            {t('saveChanges')}
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}