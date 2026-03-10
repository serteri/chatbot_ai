import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Preview,
    Section,
    Text,
} from '@react-email/components'
import * as React from 'react'

interface WelcomeEmailProps {
    name: string
    email: string
    dashboardUrl?: string
}

export function WelcomeEmail({
    name,
    email,
    dashboardUrl = 'https://www.ndisshield.com.au/en/dashboard/validator',
}: WelcomeEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Your NDIS Compliance Shield is now active — welcome to NDIS Shield Hub.</Preview>
            <Body style={main}>
                <Container style={container}>

                    {/* Header bar */}
                    <Section style={header}>
                        <Text style={logoText}>NDIS Shield Hub</Text>
                        <Text style={tagline}>NDIS Compliance Intelligence</Text>
                    </Section>

                    {/* Body */}
                    <Section style={body}>
                        <Heading style={h1}>Welcome to NDIS Shield Hub, {name}.</Heading>

                        <Text style={paragraph}>
                            Thank you for joining NDIS Shield Hub. Your account is live and your
                            <strong> NDIS Compliance Shield is now active</strong>.
                        </Text>

                        <Text style={paragraph}>
                            You can now upload your NDIS Service Agreements and receive an
                            instant AI-powered compliance audit — checked against the
                            <strong> NDIS Practice Standards 2025/26</strong> and the
                            <strong> NDIS Price Guide 2025/26</strong>.
                        </Text>

                        {/* Feature highlights */}
                        <Section style={featureBox}>
                            <Text style={featureItem}>✅ &nbsp;Upload PDF or DOCX service agreements</Text>
                            <Text style={featureItem}>✅ &nbsp;Instant compliance gap detection</Text>
                            <Text style={featureItem}>✅ &nbsp;AI-generated addendum with NDIS citations</Text>
                            <Text style={featureItem}>✅ &nbsp;Processed in Sydney (ap-southeast-2) — data stays in Australia</Text>
                        </Section>

                        <Text style={paragraph}>
                            Your first <strong>3 audits are completely free</strong>, no credit card required.
                        </Text>

                        <Section style={{ textAlign: 'center', margin: '32px 0' }}>
                            <Button href={dashboardUrl} style={button}>
                                Start Your First Audit →
                            </Button>
                        </Section>

                        <Hr style={divider} />

                        <Text style={footerText}>
                            You&apos;re receiving this because you registered with <strong>{email}</strong>.
                            If this wasn&apos;t you, please ignore this email.
                        </Text>
                    </Section>

                    {/* Footer */}
                    <Section style={footer}>
                        <Text style={footerMuted}>
                            NDIS Shield Hub · Sydney, Australia · ap-southeast-2
                        </Text>
                        <Text style={footerMuted}>
                            © {new Date().getFullYear()} NDIS Shield Hub. All rights reserved.
                        </Text>
                    </Section>

                </Container>
            </Body>
        </Html>
    )
}

export default WelcomeEmail

// ─── Styles ──────────────────────────────────────────────────────────────────

const main: React.CSSProperties = {
    backgroundColor: '#f1f5f9',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container: React.CSSProperties = {
    margin: '0 auto',
    maxWidth: '560px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
}

const header: React.CSSProperties = {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
    padding: '32px 40px 28px',
    textAlign: 'center',
}

const logoText: React.CSSProperties = {
    color: '#67e8f9',
    fontSize: '28px',
    fontWeight: '800',
    margin: '0 0 4px',
    letterSpacing: '-0.5px',
}

const tagline: React.CSSProperties = {
    color: '#94a3b8',
    fontSize: '12px',
    margin: '0',
    letterSpacing: '1px',
    textTransform: 'uppercase',
}

const body: React.CSSProperties = {
    padding: '40px',
}

const h1: React.CSSProperties = {
    color: '#0f172a',
    fontSize: '24px',
    fontWeight: '700',
    lineHeight: '1.3',
    margin: '0 0 20px',
}

const paragraph: React.CSSProperties = {
    color: '#475569',
    fontSize: '15px',
    lineHeight: '1.7',
    margin: '0 0 16px',
}

const featureBox: React.CSSProperties = {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    padding: '16px 20px',
    margin: '24px 0',
}

const featureItem: React.CSSProperties = {
    color: '#166534',
    fontSize: '14px',
    lineHeight: '1.6',
    margin: '4px 0',
}

const button: React.CSSProperties = {
    backgroundColor: '#0891b2',
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '700',
    padding: '14px 32px',
    textDecoration: 'none',
    display: 'inline-block',
}

const divider: React.CSSProperties = {
    borderColor: '#e2e8f0',
    margin: '28px 0',
}

const footerText: React.CSSProperties = {
    color: '#94a3b8',
    fontSize: '12px',
    lineHeight: '1.6',
    margin: '0',
}

const footer: React.CSSProperties = {
    backgroundColor: '#f8fafc',
    borderTop: '1px solid #e2e8f0',
    padding: '20px 40px',
    textAlign: 'center',
}

const footerMuted: React.CSSProperties = {
    color: '#cbd5e1',
    fontSize: '11px',
    margin: '2px 0',
}
