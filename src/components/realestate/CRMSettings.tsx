'use client'

import { useState, useEffect } from 'react'

interface CRMIntegration {
    enabled: boolean
    provider: 'generic' | 'rex' | 'reapit'
    webhookUrl?: string
    apiKey?: string
    rexConfig?: {
        subdomain: string
        token: string
    }
    reapitConfig?: {
        clientId: string
        clientSecret: string
        customerId: string
        baseUrl?: string
    }
}

interface CRMSettingsProps {
    chatbotId: string
}

export default function CRMSettings({ chatbotId }: CRMSettingsProps) {
    const [config, setConfig] = useState<CRMIntegration>({
        enabled: false,
        provider: 'generic',
        webhookUrl: '',
        apiKey: '',
        rexConfig: { subdomain: '', token: '' },
        reapitConfig: { clientId: '', clientSecret: '', customerId: '', baseUrl: '' },
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [testing, setTesting] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    useEffect(() => {
        fetchSettings()
    }, [chatbotId])

    const fetchSettings = async () => {
        try {
            const res = await fetch(`/api/chatbots/${chatbotId}/crm`)
            if (res.ok) {
                const data = await res.json()
                setConfig({
                    enabled: false,
                    provider: 'generic',
                    webhookUrl: '',
                    apiKey: '',
                    rexConfig: { subdomain: '', token: '' },
                    reapitConfig: { clientId: '', clientSecret: '', customerId: '', baseUrl: '' },
                    ...data.crmIntegration,
                })
            }
        } catch {
            console.error('Failed to fetch CRM settings')
        } finally {
            setLoading(false)
        }
    }

    const saveSettings = async () => {
        setSaving(true)
        setMessage(null)
        try {
            const res = await fetch(`/api/chatbots/${chatbotId}/crm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ crmIntegration: config }),
            })
            const data = await res.json()
            if (res.ok) {
                setMessage({ type: 'success', text: 'CRM settings saved successfully!' })
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to save' })
            }
        } catch {
            setMessage({ type: 'error', text: 'Network error' })
        } finally {
            setSaving(false)
        }
    }

    const testConnection = async () => {
        setTesting(true)
        setMessage(null)
        try {
            const res = await fetch(`/api/chatbots/${chatbotId}/crm`, { method: 'PUT' })
            const data = await res.json()
            if (data.success) {
                setMessage({ type: 'success', text: '✅ Connection test passed! Test lead sent successfully.' })
            } else {
                setMessage({ type: 'error', text: `❌ Test failed: ${data.error}` })
            }
        } catch {
            setMessage({ type: 'error', text: 'Network error during test' })
        } finally {
            setTesting(false)
        }
    }

    if (loading) {
        return (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
        )
    }

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        🔗 CRM Integration
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Automatically forward captured leads to your external CRM system
                    </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={config.enabled}
                        onChange={(e) => setConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 dark:peer-focus:ring-amber-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-amber-500"></div>
                    <span className="ms-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {config.enabled ? 'Active' : 'Disabled'}
                    </span>
                </label>
            </div>

            {config.enabled && (
                <div className="space-y-5">
                    {/* Provider Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            CRM Provider
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: 'generic', name: 'Generic Webhook', icon: '🌐', desc: 'Any CRM with webhook support' },
                                { id: 'rex', name: 'Rex Software', icon: '🟦', desc: 'Australian real estate CRM' },
                                { id: 'reapit', name: 'Reapit', icon: '🟪', desc: 'Foundations API platform' },
                            ].map((provider) => (
                                <button
                                    key={provider.id}
                                    onClick={() => setConfig(prev => ({ ...prev, provider: provider.id as any }))}
                                    className={`p-3 rounded-lg border-2 text-left transition-all ${config.provider === provider.id
                                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="text-xl mb-1">{provider.icon}</div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{provider.name}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{provider.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Generic Webhook Config */}
                    {config.provider === 'generic' && (
                        <div className="space-y-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">🌐 Generic Webhook</h4>
                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    Webhook URL *
                                </label>
                                <input
                                    type="url"
                                    value={config.webhookUrl || ''}
                                    onChange={(e) => setConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
                                    placeholder="https://your-crm.com/api/webhook/leads"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    API Key (optional)
                                </label>
                                <input
                                    type="password"
                                    value={config.apiKey || ''}
                                    onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                                    placeholder="Bearer token or API key"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-400 mt-1">Sent as both Authorization: Bearer and X-API-Key headers</p>
                            </div>
                        </div>
                    )}

                    {/* Rex Software Config */}
                    {config.provider === 'rex' && (
                        <div className="space-y-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300">🟦 Rex Software</h4>
                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    Subdomain *
                                </label>
                                <div className="flex items-center">
                                    <input
                                        type="text"
                                        value={config.rexConfig?.subdomain || ''}
                                        onChange={(e) => setConfig(prev => ({
                                            ...prev,
                                            rexConfig: { ...prev.rexConfig!, subdomain: e.target.value }
                                        }))}
                                        placeholder="your-agency"
                                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    />
                                    <span className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-lg text-sm text-gray-500">
                                        .rex.software
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    API Token *
                                </label>
                                <input
                                    type="password"
                                    value={config.rexConfig?.token || ''}
                                    onChange={(e) => setConfig(prev => ({
                                        ...prev,
                                        rexConfig: { ...prev.rexConfig!, token: e.target.value }
                                    }))}
                                    placeholder="Your Rex API token"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    )}

                    {/* Reapit Config */}
                    {config.provider === 'reapit' && (
                        <div className="space-y-4 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                            <h4 className="text-sm font-semibold text-purple-700 dark:text-purple-300">🟪 Reapit Foundations</h4>
                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    Client ID *
                                </label>
                                <input
                                    type="text"
                                    value={config.reapitConfig?.clientId || ''}
                                    onChange={(e) => setConfig(prev => ({
                                        ...prev,
                                        reapitConfig: { ...prev.reapitConfig!, clientId: e.target.value }
                                    }))}
                                    placeholder="Your Reapit Client ID"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    Client Secret *
                                </label>
                                <input
                                    type="password"
                                    value={config.reapitConfig?.clientSecret || ''}
                                    onChange={(e) => setConfig(prev => ({
                                        ...prev,
                                        reapitConfig: { ...prev.reapitConfig!, clientSecret: e.target.value }
                                    }))}
                                    placeholder="Your Reapit Client Secret"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    Customer ID *
                                </label>
                                <input
                                    type="text"
                                    value={config.reapitConfig?.customerId || ''}
                                    onChange={(e) => setConfig(prev => ({
                                        ...prev,
                                        reapitConfig: { ...prev.reapitConfig!, customerId: e.target.value }
                                    }))}
                                    placeholder="SBOX or your Reapit customer code"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    )}

                    {/* Payload Preview */}
                    <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs font-mono overflow-x-auto">
                        <p className="text-gray-400 mb-2">// Sample payload sent to your CRM:</p>
                        <pre>{JSON.stringify({
                            event: 'lead.created',
                            source: 'pylonchat',
                            data: {
                                contact: { name: 'John Doe', phone: '+61400000000', email: 'john@email.com' },
                                qualification: { intent: 'buy', propertyType: 'apartment', budget: '$500K-$800K', timeline: '1-3 months' },
                                scoring: { score: 85, category: 'hot' },
                                requirements: { bedrooms: '3', bathrooms: '2', parking: '2', features: ['Pool', 'Garden'] },
                            }
                        }, null, 2)}</pre>
                    </div>

                    {/* Message */}
                    {message && (
                        <div className={`p-3 rounded-lg text-sm ${message.type === 'success'
                                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={saveSettings}
                            disabled={saving}
                            className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? 'Saving...' : '💾 Save CRM Settings'}
                        </button>
                        <button
                            onClick={testConnection}
                            disabled={testing}
                            className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 dark:border-gray-600"
                        >
                            {testing ? 'Testing...' : '🧪 Test Connection'}
                        </button>
                    </div>
                </div>
            )}

            {/* Disabled state info */}
            {!config.enabled && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Enable CRM integration to automatically sync leads with your external CRM system.
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                        Supported: Rex Software • Reapit • Generic Webhook (Salesforce, HubSpot, Pipedrive, etc.)
                    </p>
                </div>
            )}
        </div>
    )
}
