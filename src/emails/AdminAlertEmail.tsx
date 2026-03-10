import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Row,
    Column,
    Section,
    Text,
} from '@react-email/components'
import * as React from 'react'

interface AdminAlertEmailProps {
    name: string
    email: string
    companyName?: string
    registeredAt?: string
}

export function AdminAlertEmail({
    name,
    email,
    companyName,
    registeredAt = new Date().toISOString(),
}: AdminAlertEmailProps) {
    const formattedDate = new Date(registeredAt).toLocaleString('en-AU', {
        timeZone: 'Australia/Sydney',
        dateStyle: 'medium',
        timeStyle: 'short',
    })

    return (
        <Html>
            <Head />
            <Preview>🚀 New User Registered: {name} — {email}</Preview>
            <Body style={main}>
                <Container style={container}>

                    {/* Header */}
                    <Section style={header}>
                        <Text style={emoji}>🚀</Text>
                        <Heading style={h1}>New User Registered</Heading>
                        <Text style={subheading}>NDIS Shield Hub · {formattedDate} AEST</Text>
                    </Section>

                    {/* Details */}
                    <Section style={body}>
                        <Text style={lead}>
                            A new provider has just signed up for NDIS Shield Hub.
                        </Text>

                        <Section style={infoBox}>
                            <Row>
                                <Column style={labelCol}>
                                    <Text style={label}>Name</Text>
                                </Column>
                                <Column>
                                    <Text style={value}>{name}</Text>
                                </Column>
                            </Row>
                            <Row>
                                <Column style={labelCol}>
                                    <Text style={label}>Email</Text>
                                </Column>
                                <Column>
                                    <Text style={value}>{email}</Text>
                                </Column>
                            </Row>
                            {companyName && (
                                <Row>
                                    <Column style={labelCol}>
                                        <Text style={label}>Company</Text>
                                    </Column>
                                    <Column>
                                        <Text style={value}>{companyName}</Text>
                                    </Column>
                                </Row>
                            )}
                            <Row>
                                <Column style={labelCol}>
                                    <Text style={label}>Signed up</Text>
                                </Column>
                                <Column>
                                    <Text style={value}>{formattedDate} AEST</Text>
                                </Column>
                            </Row>
                        </Section>

                        <Hr style={divider} />

                        <Text style={footerNote}>
                            This is an automated alert from NDIS Shield Hub. No action is required.
                        </Text>
                    </Section>

                </Container>
            </Body>
        </Html>
    )
}

export default AdminAlertEmail

// ─── Styles ──────────────────────────────────────────────────────────────────

const main: React.CSSProperties = {
    backgroundColor: '#f1f5f9',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container: React.CSSProperties = {
    margin: '0 auto',
    maxWidth: '520px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
}

const header: React.CSSProperties = {
    backgroundColor: '#0f172a',
    padding: '32px 40px 24px',
    textAlign: 'center',
}

const emoji: React.CSSProperties = {
    fontSize: '40px',
    margin: '0 0 8px',
    lineHeight: '1',
}

const h1: React.CSSProperties = {
    color: '#ffffff',
    fontSize: '22px',
    fontWeight: '700',
    margin: '0 0 6px',
}

const subheading: React.CSSProperties = {
    color: '#94a3b8',
    fontSize: '12px',
    margin: '0',
    letterSpacing: '0.5px',
}

const body: React.CSSProperties = {
    padding: '32px 40px',
}

const lead: React.CSSProperties = {
    color: '#334155',
    fontSize: '15px',
    margin: '0 0 24px',
}

const infoBox: React.CSSProperties = {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '16px 20px',
}

const labelCol: React.CSSProperties = {
    width: '90px',
}

const label: React.CSSProperties = {
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: '6px 0',
}

const value: React.CSSProperties = {
    color: '#0f172a',
    fontSize: '14px',
    fontWeight: '500',
    margin: '6px 0',
}

const divider: React.CSSProperties = {
    borderColor: '#e2e8f0',
    margin: '24px 0 16px',
}

const footerNote: React.CSSProperties = {
    color: '#94a3b8',
    fontSize: '12px',
    margin: '0',
}
