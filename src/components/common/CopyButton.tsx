'use client';

import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface CopyButtonProps {
    text: string;
    label: string;
    successMessage: string;
}

export function CopyButton({ text, label, successMessage }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success(successMessage);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy keys', err);
            toast.error("Failed to copy");
        }
    };

    return (
        <Button
            size="sm"
            variant="secondary"
            className="h-7 text-xs bg-slate-700 text-white hover:bg-slate-600"
            onClick={handleCopy}
        >
            {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
            {label}
        </Button>
    );
}
