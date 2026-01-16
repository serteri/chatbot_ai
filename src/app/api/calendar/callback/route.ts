import { NextRequest, NextResponse } from 'next/server'

// OAuth callback handler - redirects back to dashboard with code
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state') // chatbot ID
    const error = searchParams.get('error')

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

    if (error) {
        return NextResponse.redirect(
            `${baseUrl}/dashboard/chatbots/${state}?tab=settings&calendar_error=${error}`
        )
    }

    if (!code || !state) {
        return NextResponse.redirect(
            `${baseUrl}/dashboard?error=missing_params`
        )
    }

    // Redirect back to chatbot settings with the code
    return NextResponse.redirect(
        `${baseUrl}/dashboard/chatbots/${state}?tab=settings&calendar_code=${code}`
    )
}
