import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import SettingsForm from '@/components/dashboard/SettingsForm';

export default async function SettingsPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    // Kullanıcının güncel ayarlarını veritabanından çek
    const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            name: true,
            email: true,
            image: true,
            emailNotifications: true, // Şemada var
            customSettings: true      // Pazarlama ayarı burada (JSON)
        }
    });

    // customSettings'i güvenli bir şekilde parse et
    const customSettings = (dbUser?.customSettings as any) || {};

    const userData = {
        name: dbUser?.name,
        email: dbUser?.email,
        image: dbUser?.image,
        emailNotifications: dbUser?.emailNotifications ?? true, // Varsayılan true
        marketingEmails: customSettings.marketingEmails ?? false // Varsayılan false
    };

    return <SettingsForm user={userData} />;
}