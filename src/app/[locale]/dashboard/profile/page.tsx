import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import ProfileSettings from '@/components/dashboard/ProfileSettings';
import { Card, CardContent } from "@/components/ui/card";

export default async function ProfilePage() {
  // 1. Kullanıcı oturumunu sunucu tarafında kontrol et
  const session = await auth();
  
  // 2. Çevirileri çek (Navigasyon veya Profil namespace'inden)
  // Eğer 'profile' namespace'iniz yoksa 'nav' veya 'common' kullanabilirsiniz.
  // Burada başlık için 'nav.profile' kullanıyoruz.
  const t = await getTranslations('nav'); 

  // Oturum yoksa login'e at
  if (!session?.user) {
    redirect('/login');
  }

  // Kullanıcı verisini hazırla
  const userData = {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  };

  return (
    <div className="container mx-auto py-10 max-w-4xl px-4 animate-in fade-in-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {t('profile')}
        </h1>
        <p className="text-slate-500 mt-2 text-sm">
            {/* Burası için de bir çeviri anahtarı ekleyebilirsiniz, şimdilik varsayılan kalabilir */}
            {t('myProfile') || "Hesap bilgilerinizi ve tercihlerinizi buradan yönetin."}
        </p>
      </div>
      
      {/* 3. Eski statik kartlar yerine yeni, interaktif bileşeni çağırıyoruz */}
      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0">
            <ProfileSettings user={userData} />
        </CardContent>
      </Card>
    </div>
  );
}