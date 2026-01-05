'use client';

import {
    MoreVertical,
    Code,
    Eye,
    Settings,
    Trash2
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { EmbedCodeDialog } from '@/components/chatbot/EmbedCodeDialog';

interface ChatbotCardActionsProps {
    chatbotId: string;
    locale: string;
    labels: {
        embed: string;
        manage: string;
        settings: string;
        delete: string;
    };
}

export function ChatbotCardActions({ chatbotId, locale, labels }: ChatbotCardActionsProps) {
    return (
        <DropdownMenu>
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
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
