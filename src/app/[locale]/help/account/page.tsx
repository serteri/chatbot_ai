import { Shield, Settings, FileSpreadsheet, Lock } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
    title: 'Managing Your Profile & NDIS Identity',
    description: 'Learn how to securely link your Australian Business Number (ABN) and NDIS Provider Identity to NDIS Shield Hub for automated PRODA Exports.',
}

export default function AccountHelpPage() {
    return (
        <article className="prose prose-slate prose-teal max-w-none dark:prose-invert">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-teal-100 dark:bg-teal-900/40 rounded-xl text-teal-700 dark:text-teal-400">
                    <Settings className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1">Account & NDIS Identity Settings</h1>
                    <p className="text-slate-500 mb-0 mt-0">Configuring your profile for automated PRODA integration.</p>
                </div>
            </div>

            <p className="lead">
                The Profile Settings interface in <strong>NDIS Shield Hub</strong> is more than just a place to update your name—it operates as the central data engine driving your automated PRODA Bulk Claim Syncs. Any NDIS Provider details securely saved to your account are dynamically injected into generated audit trails and financial CSV exports.
            </p>

            <hr className="my-8" />

            <h2 className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-teal-600" />
                Securing Your NDIS Provider Identity
            </h2>
            <p>
                To ensure compliance with the NDIS Quality and Safeguards Commission, the structural integrity of your bulk uploads relies on accurate account parameters.
                Navigate to your <Link href="/en/dashboard/settings">Profile Settings</Link> dashboard to configure the core <strong>NDIS Provider Identity & Audit Config</strong> schema:
            </p>
            <ul>
                <li><strong>NDIS Provider Number:</strong> Highly critical. This binds directly to the <code>RegistrationNumber</code> payload during automated PRODA CSV generation and must legally match your NDIA registered identity.</li>
                <li><strong>Australian Business Number (ABN):</strong> Embeds into generated validation addendums and billing reports to ensure multi-factor audit authenticity.</li>
                <li><strong>Registered Business Address:</strong> Sourced natively into your compliance headers.</li>
                <li><strong>Compliance Contact Phone:</strong> Added dynamically as your principal resolution touchpoint.</li>
            </ul>

            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-800 my-8">
                <h3 className="flex items-center gap-2 text-lg font-bold mt-0 mt-0 pt-0 text-slate-800 dark:text-slate-200">
                    <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
                    How Settings Link to PRODA Export Engine
                </h3>
                <p className="mb-0 text-sm">
                    Because your PRODA Bulk Payments portal rejects malformed or anonymous payloads instantly, <strong>NDIS Shield Hub</strong> refuses to use hardcoded assumptions.
                    Instead, the <Link href="/en/dashboard/claims">Claims Export API</Link> makes an internal, cryptographically authenticated database lookup to securely fetch your <code>ndisProviderNumber</code> from your specific dashboard settings session, mapping it seamlessly into the generated CSV file required for portal uploads.
                </p>
            </div>

            <h2>Updating Your Email or Password</h2>
            <p>
                For security reasons under the strict handling guidelines of the <strong>Australian Privacy Principles (APP)</strong>, direct editing of your registered account email is locked. Your identity establishes your primary data sovereignty link to our localized Sydney servers.
            </p>

            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 rounded-lg text-sm font-medium">
                <Lock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="m-0">
                    If you require a primary email transfer due to an organizational restructuring, please contact standard <code>support@ndisshield.com.au</code> directly.
                </p>
            </div>

        </article>
    )
}
