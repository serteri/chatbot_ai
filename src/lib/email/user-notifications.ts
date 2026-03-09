import { Resend } from 'resend'
import { render } from '@react-email/components'
import { WelcomeEmail } from '@/emails/WelcomeEmail'
import { AdminAlertEmail } from '@/emails/AdminAlertEmail'

const ADMIN_EMAIL = 'serteri@gmail.com'
const FROM_ADDRESS = process.env.EMAIL_FROM || 'onboarding@resend.dev'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pylonchat.com'

function getClient(): Resend {
    const key = process.env.RESEND_API_KEY
    if (!key) throw new Error('RESEND_API_KEY is not set')
    return new Resend(key)
}

// ---------------------------------------------------------------------------
// Welcome email → new registrant
// ---------------------------------------------------------------------------
export async function sendWelcomeEmail(params: {
    name: string
    email: string
}): Promise<void> {
    try {
        const html = await render(
            WelcomeEmail({
                name: params.name,
                email: params.email,
                dashboardUrl: `${SITE_URL}/en/dashboard/validator`,
            })
        )

        const { error } = await getClient().emails.send({
            from: `PylonChat <${FROM_ADDRESS}>`,
            to: [params.email],
            subject: 'Welcome to PylonChat — Your NDIS Compliance Shield is Active',
            html,
        })

        if (error) console.error('[Resend] Welcome email error:', error)
        else console.log('[Resend] Welcome email sent to', params.email)
    } catch (err) {
        // Non-fatal: never block registration if email fails
        console.error('[Resend] sendWelcomeEmail threw:', err)
    }
}

// ---------------------------------------------------------------------------
// Admin alert → serteri@gmail.com
// ---------------------------------------------------------------------------
export async function sendAdminAlert(params: {
    name: string
    email: string
    companyName?: string
}): Promise<void> {
    try {
        const html = await render(
            AdminAlertEmail({
                name: params.name,
                email: params.email,
                companyName: params.companyName,
                registeredAt: new Date().toISOString(),
            })
        )

        const { error } = await getClient().emails.send({
            from: `PylonChat Alerts <${FROM_ADDRESS}>`,
            to: [ADMIN_EMAIL],
            subject: `🚀 New User Registered: ${params.name} (${params.email})`,
            html,
        })

        if (error) console.error('[Resend] Admin alert error:', error)
        else console.log('[Resend] Admin alert sent for', params.email)
    } catch (err) {
        console.error('[Resend] sendAdminAlert threw:', err)
    }
}
