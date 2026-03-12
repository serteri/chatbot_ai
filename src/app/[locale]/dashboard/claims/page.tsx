import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import ClaimsClient from '@/components/dashboard/ClaimsClient'

export default async function ClaimsDashboardPage() {
    const session = await auth()

    if (!session?.user?.id) {
        redirect('/login')
    }

    // Fetch live claims from the database exclusively mapped to the authenticated user
    const claims = await prisma.claim.findMany({
        where: { userId: session.user.id },
        orderBy: { supportDeliveredDate: 'desc' },
    })

    return <ClaimsClient claims={claims} />
}
