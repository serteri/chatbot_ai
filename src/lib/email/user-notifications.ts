import { render } from '@react-email/components'
import { WelcomeEmail } from '@/emails/WelcomeEmail'
import { AdminAlertEmail } from '@/emails/AdminAlertEmail'
import { getResend, FROM, ADMIN_EMAIL, SITE_URL } from '@/lib/mail'

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

        const { error } = await getResend().emails.send({
            from: FROM.info,
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

        const { error } = await getResend().emails.send({
            from: FROM.noReply,
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
