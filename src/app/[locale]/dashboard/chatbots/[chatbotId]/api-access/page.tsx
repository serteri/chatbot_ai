'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; -> Kaldırıldı, HTML table kullanacağız
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Copy, Check, Key, Code, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface ApiKey {
    id: string;
    name: string;
    key: string;
    createdAt: string;
    lastUsed: string | null;
}

interface ApiAccessPageProps {
    params: {
        chatbotId: string;
        locale: string;
    };
}

export default function ApiAccessPage({ params }: ApiAccessPageProps) {
    const { chatbotId } = params;
    const t = useTranslations('ApiAccess'); // Çeviriler eklenecek
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [newKeyIps, setNewKeyIps] = useState('');
    const [newKeyRateLimit, setNewKeyRateLimit] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    useEffect(() => {
        fetchKeys();
    }, [chatbotId]);

    const fetchKeys = async () => {
        try {
            const res = await fetch(`/api/api-keys?chatbotId=${chatbotId}`);
            if (res.ok) {
                const data = await res.json();
                setKeys(data);
            }
        } catch (error) {
            toast.error('Failed to load API keys');
        } finally {
            setIsLoading(false);
        }
    };

    const createKey = async () => {
        if (!newKeyName.trim()) return;

        setIsCreating(true);
        try {
            const res = await fetch('/api/api-keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatbotId,
                    name: newKeyName,
                    allowedIps: newKeyIps ? newKeyIps.split(',').map(ip => ip.trim()).filter(Boolean) : [],
                    rateLimit: newKeyRateLimit ? parseInt(newKeyRateLimit) : null
                })
            });

            if (res.ok) {
                const newKey = await res.json();
                setKeys([newKey, ...keys]);
                setNewKeyName('');
                setNewKeyIps('');
                setNewKeyRateLimit('');
                setIsDialogOpen(false);
                toast.success('API Key created successfully');
            } else {
                toast.error('Failed to create API key');
            }
        } catch (error) {
            toast.error('Error creating key');
        } finally {
            setIsCreating(false);
        }
    };

    const deleteKey = async (id: string) => {
        if (!confirm('Are you sure you want to revoke this key? It will stop working immediately.')) return;

        try {
            const res = await fetch(`/api/api-keys?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setKeys(keys.filter(k => k.id !== id));
                toast.success('API Key revoked');
            } else {
                toast.error('Failed to revoke key');
            }
        } catch (error) {
            toast.error('Error deleting key');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(text);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-8 p-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">API Access</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage API keys to access your chatbot programmatically.
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Create New Key
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Create API Key</DialogTitle>
                            <DialogDescription>
                                Secure your API access with optional IP restrictions and limits.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div>
                                <Label htmlFor="name" className="mb-2 block">Key Name</Label>
                                <Input
                                    id="name"
                                    value={newKeyName}
                                    onChange={(e) => setNewKeyName(e.target.value)}
                                    placeholder="e.g. Website Widget, Backend Service"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="ips" className="mb-2 block text-xs">Allowed IPs (Optional)</Label>
                                    <Input
                                        id="ips"
                                        value={newKeyIps}
                                        onChange={(e) => setNewKeyIps(e.target.value)}
                                        placeholder="1.2.3.4, 5.6.7.8"
                                        className="text-xs"
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-1">Comma separated IPv4 addresses.</p>
                                </div>
                                <div>
                                    <Label htmlFor="limit" className="mb-2 block text-xs">Rate Limit (Req/Min)</Label>
                                    <Input
                                        id="limit"
                                        type="number"
                                        value={newKeyRateLimit}
                                        onChange={(e) => setNewKeyRateLimit(e.target.value)}
                                        placeholder="e.g. 60"
                                        className="text-xs"
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={createKey} disabled={isCreating || !newKeyName.trim()}>
                                {isCreating ? 'Creating...' : 'Create Key'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5 text-blue-600" />
                        Active API Keys
                    </CardTitle>
                    <CardDescription>
                        These keys grant full access to your chatbot. Keep them secret.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading keys...</div>
                    ) : keys.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-slate-50">
                            <Key className="mx-auto h-8 w-8 text-slate-300 mb-3" />
                            <h3 className="text-lg font-medium text-slate-900">No API Keys</h3>
                            <p className="text-slate-500 mb-4">You haven't created any API keys yet.</p>
                            <Button variant="outline" onClick={() => setIsDialogOpen(true)}>Create your first key</Button>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 [&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Name</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Key Prefix</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Security</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Created</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Last Used</th>
                                        <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {keys.map((key) => (
                                        <tr key={key.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <td className="p-4 align-middle font-medium">{key.name}</td>
                                            <td className="p-4 align-middle">
                                                <div className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded w-fit font-mono text-xs">
                                                    {key.key.substring(0, 12)}...
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-4 w-4 ml-1"
                                                        onClick={() => copyToClipboard(key.key)}
                                                    >
                                                        {copiedKey === key.key ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                                                    </Button>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">
                                                <div className="flex flex-col gap-1">
                                                    {(key as any).allowedIps?.length > 0 ? (
                                                        <Badge variant="outline" className="w-fit text-[10px] bg-green-50 text-green-700 border-green-200">
                                                            Restrict: {(key as any).allowedIps.length} IPs
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="w-fit text-[10px] text-yellow-600 border-yellow-200 bg-yellow-50">
                                                            Global Access
                                                        </Badge>
                                                    )}
                                                    {(key as any).rateLimit ? (
                                                        <span className="text-[10px] text-muted-foreground">Limit: {(key as any).rateLimit}/min</span>
                                                    ) : null}
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle">{formatDate(key.createdAt)}</td>
                                            <td className="p-4 align-middle">
                                                {key.lastUsed ? formatDate(key.lastUsed) : (
                                                    <Badge variant="secondary" className="text-xs font-normal">Never</Badge>
                                                )}
                                            </td>
                                            <td className="p-4 align-middle text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => deleteKey(key.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Code className="h-5 w-5 text-purple-600" />
                        Usage Example
                    </CardTitle>
                    <CardDescription>
                        How to use your API key to send messages.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-slate-950 text-slate-50 p-4 rounded-lg font-mono text-sm relative overflow-x-auto">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 text-slate-400 hover:text-white hover:bg-white/10"
                            onClick={() => copyToClipboard(`curl -X POST https://chatbot-ai.com/api/chat \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{"message": "Hello", "chatbotId": "${chatbotId}"}'`)}
                        >
                            <Copy className="h-4 w-4" />
                        </Button>
                        <pre>
                            {`curl -X POST https://chatbot-ai.com/api/chat \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{"message": "Hello", "chatbotId": "${chatbotId}"}'`}
                        </pre>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
