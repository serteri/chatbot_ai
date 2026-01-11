'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import {
    Users, Plus, MoreVertical, Shield, User as UserIcon, Trash2, Mail
} from 'lucide-react'

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"

// Type definitions
interface TeamMember {
    id: string
    userId: string
    role: string // 'admin' | 'member'
    joinedAt: string
    user: {
        id: string
        name: string | null
        email: string | null
        image: string | null
    }
}

const inviteSchema = z.object({
    email: z.string().email({ message: "Invalid email address" })
})

type InviteFormValues = z.infer<typeof inviteSchema>

export function TeamList() {
    const t = useTranslations('team')
    const [members, setMembers] = useState<TeamMember[]>([])
    const [loading, setLoading] = useState(true)
    const [isInviteOpen, setIsInviteOpen] = useState(false)

    const form = useForm<InviteFormValues>({
        resolver: zodResolver(inviteSchema),
        defaultValues: {
            email: ""
        }
    })

    // Fetch members
    const fetchMembers = async () => {
        try {
            const response = await fetch('/api/team')
            if (!response.ok) throw new Error('Failed to fetch members')
            const data = await response.json()
            setMembers(data)
        } catch (error) {
            console.error('Error fetching members:', error)
            toast.error('Failed to load team members')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMembers()
    }, [])

    // Invite member
    const onInvite = async (data: InviteFormValues) => {
        try {
            const response = await fetch('/api/team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            const result = await response.json()

            if (!response.ok) {
                // Özel hata mesajları
                if (response.status === 403) {
                    toast.error(t('upgradeRequired'))
                } else if (response.status === 404) {
                    toast.error('User not found. They must sign up first.') // Translate in future
                } else {
                    toast.error(result.error || 'Failed to invite')
                }
                return
            }

            toast.success(t('inviteSent'))
            setIsInviteOpen(false)
            form.reset()
            fetchMembers()

        } catch (error) {
            toast.error('Something went wrong')
        }
    }

    // Remove member
    const onRemove = async (memberId: string) => {
        if (!confirm(t('removeConfirm'))) return

        try {
            const response = await fetch(`/api/team/${memberId}`, {
                method: 'DELETE'
            })

            if (!response.ok) throw new Error('Failed to remove')

            toast.success(t('removeSuccess'))
            setMembers(prev => prev.filter(m => m.id !== memberId))
        } catch (error) {
            toast.error('Failed to remove member')
        }
    }

    // Helper: Initials for Avatar
    const getInitials = (name: string | null) => {
        if (!name) return '??'
        return name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase()
    }

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading team...</div>
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>{t('title')}</CardTitle>
                    <CardDescription>{t('subtitle')}</CardDescription>
                </div>
                <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            {t('inviteMember')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('inviteMember')}</DialogTitle>
                            <DialogDescription>
                                Invite a registered user to your team by email.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={form.handleSubmit(onInvite)} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    placeholder={t('emailPlaceholder')}
                                    {...form.register('email')}
                                />
                                {form.formState.errors.email && (
                                    <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                                )}
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting ? 'Sending...' : 'Invite'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {members.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                        <Users className="mx-auto h-10 w-10 mb-3 opacity-20" />
                        <p>No team members yet. Invite someone!</p>
                    </div>
                ) : (
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">User</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">{t('role')}</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">{t('joinedAt')}</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {members.map((member) => (
                                    <tr key={member.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <td className="p-4 align-middle">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={member.user.image || ""} />
                                                    <AvatarFallback>{getInitials(member.user.name)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{member.user.name || 'Unknown'}</span>
                                                    <span className="text-xs text-slate-500">{member.user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <div className="flex items-center gap-1.5">
                                                {member.role === 'admin' ? (
                                                    <Shield className="h-3.5 w-3.5 text-blue-600" />
                                                ) : (
                                                    <UserIcon className="h-3.5 w-3.5 text-slate-500" />
                                                )}
                                                <span className="capitalize">{member.role}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            {new Date(member.joinedAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                                                    <DropdownMenuItem
                                                        className="text-red-600 focus:text-red-600 cursor-pointer"
                                                        onClick={() => onRemove(member.id)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        {t('remove')}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
