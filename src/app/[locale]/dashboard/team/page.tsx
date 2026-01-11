import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { TeamList } from '@/components/team/TeamList'

export default async function TeamPage() {
    const session = await auth()
    if (!session?.user?.id) {
        redirect('/login')
    }

    const t = await getTranslations('team')

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                <p className="text-muted-foreground">
                    {t('subtitle')}
                </p>
            </div>

            <TeamList />
        </div>
    )
}
