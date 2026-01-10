'use client';

import { useState, useRef } from 'react';
import {
    MoreVertical,
    Code,
    Eye,
    Settings,
    Trash2,
    Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EmbedCodeDialog } from '@/components/chatbot/EmbedCodeDialog';
import { toast } from 'react-hot-toast';

interface ChatbotCardActionsProps {
    chatbotId: string;
    locale: string;
    labels: {
        embed: string;
        manage: string;
        settings: string;
        delete: string;
        deleteTitle?: string;
        deleteDescription?: string;
        deleteCancel?: string;
        deleteConfirm?: string;
        deleting?: string;
        deleteSuccess?: string;
        deleteError?: string;
    };
}

export function ChatbotCardActions({ chatbotId, locale, labels }: ChatbotCardActionsProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/chatbots/${chatbotId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete chatbot');
            }

            toast.success(labels.deleteSuccess || 'Chatbot deleted successfully');
            setShowDeleteDialog(false);
            router.refresh();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error(labels.deleteError || 'Failed to delete chatbot');
        } finally {
            setIsDeleting(false);
        }
    };

    const openDeleteDialog = () => {
        setDropdownOpen(false); // Close dropdown first
        setTimeout(() => {
            setShowDeleteDialog(true); // Then open dialog
        }, 100);
    };

    return (
        <>
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 data-[state=open]:bg-slate-100 text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all duration-200 rounded-full"
                    >
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    sideOffset={8}
                    className="w-60 p-1.5 shadow-2xl border border-slate-100 bg-white rounded-2xl ring-1 ring-slate-900/5"
                >
                    {/* Embed Kodu Penceresi */}
                    <EmbedCodeDialog
                        chatbotId={chatbotId}
                        trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer py-2.5 px-3 rounded-xl text-slate-600 focus:text-blue-600 focus:bg-blue-50 transition-colors duration-200 font-medium my-0.5">
                                <Code className="mr-3 h-4.5 w-4.5" />
                                {labels.embed}
                            </DropdownMenuItem>
                        }
                    />

                    <DropdownMenuItem asChild>
                        <Link href={`/${locale}/dashboard/chatbots/${chatbotId}`} className="cursor-pointer py-2.5 px-3 rounded-xl text-slate-600 focus:text-slate-900 focus:bg-slate-50 transition-colors duration-200 font-medium my-0.5 w-full flex items-center">
                            <Eye className="mr-3 h-4.5 w-4.5" /> {labels.manage}
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                        <Link href={`/${locale}/dashboard/chatbots/${chatbotId}/settings`} className="cursor-pointer py-2.5 px-3 rounded-xl text-slate-600 focus:text-slate-900 focus:bg-slate-50 transition-colors duration-200 font-medium my-0.5 w-full flex items-center">
                            <Settings className="mr-3 h-4.5 w-4.5" /> {labels.settings}
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="my-1" />

                    {/* Delete Button */}
                    <DropdownMenuItem
                        onSelect={(e) => {
                            e.preventDefault();
                            openDeleteDialog();
                        }}
                        className="cursor-pointer py-2.5 px-3 rounded-xl text-red-600 focus:text-red-700 focus:bg-red-50 transition-colors duration-200 font-medium my-0.5"
                    >
                        <Trash2 className="mr-3 h-4.5 w-4.5" />
                        {labels.delete}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>{labels.deleteTitle || 'Delete Chatbot'}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {labels.deleteDescription || 'Are you sure you want to delete this chatbot? This action cannot be undone. All conversations, documents, and settings will be permanently deleted.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            {labels.deleteCancel || 'Cancel'}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {labels.deleting || 'Deleting...'}
                                </>
                            ) : (
                                labels.deleteConfirm || 'Delete'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
