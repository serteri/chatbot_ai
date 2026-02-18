'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, X, RefreshCw, Paperclip, Loader2, Sparkles, Globe, FileText, XCircle, Headset, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
    id: string;
    role: 'user' | 'bot';
    content: string;
    timestamp: Date;
    attachment?: string; // Dosya eki için alan
}

interface ChatTranslations {
    displayName: string;
    subTitle: string;
    placeholder: string;
    clearChat: string;
    today: string;
    you: string;
    assistant: string;
    errorReply: string;
    errorConnection: string;
    poweredBy: string;
    aiPowered: string;
    changeLanguage: string;
}

interface ChatInterfaceProps {
    chatbot: {
        id: string;
        name: string;
        welcomeMessage: string | null;
        widgetPrimaryColor: string | null;
        widgetButtonColor: string | null;
        widgetTextColor: string | null;
        hideBranding?: boolean;
        enableLiveChat?: boolean;
        liveSupportUrl?: string | null;
        whatsappNumber?: string | null;
    };
    translations: ChatTranslations;
    language: string; // Supports 'tr' | 'en' | 'de' | 'fr' | 'es'
}

export default function ChatInterface({ chatbot, translations: t, language }: ChatInterfaceProps) {
    const router = useRouter();
    const pathname = usePathname();

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null); // Seçilen dosya state'i

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null); // Gizli input referansı

    // Renk Ayarları
    const primaryColor = chatbot.widgetPrimaryColor || '#18181b';
    const textColor = chatbot.widgetTextColor || '#FFFFFF'; // Default text color for header

    useEffect(() => {
        if (chatbot.welcomeMessage && messages.length === 0) {
            setMessages([{
                id: 'welcome',
                role: 'bot',
                content: chatbot.welcomeMessage,
                timestamp: new Date()
            }]);
        }
    }, [chatbot.welcomeMessage]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading, selectedFile]);

    // --- DİL DEĞİŞTİRME FONKSİYONU ---
    const changeLanguage = (newLang: string) => {
        if (newLang === language) return;
        router.replace(`${pathname}?lang=${newLang}`);
    };

    const languages = [
        { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'es', name: 'Español', flag: '🇪🇸' },
    ];

    // --- DOSYA SEÇME FONKSİYONLARI ---
    const handlePaperclipClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // --- MESAJ GÖNDERME ---
    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();

        // Hem mesaj hem dosya yoksa gönderme
        if ((!inputValue.trim() && !selectedFile) || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue,
            timestamp: new Date(),
            attachment: selectedFile ? selectedFile.name : undefined
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setSelectedFile(null); // Dosyayı temizle
        setIsLoading(true);

        // API İsteği
        try {
            const response = await fetch('/api/chat/public', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatbotId: chatbot.id,
                    message: userMsg.content + (userMsg.attachment ? ` [Dosya Eklendi: ${userMsg.attachment}]` : ''),
                    language: language
                })
            });

            if (!response.ok) throw new Error('API Hatası');
            const data = await response.json();

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'bot',
                content: data.reply || t.errorReply,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                id: 'error',
                role: 'bot',
                content: t.errorConnection,
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        window.parent.postMessage({ type: 'CHATBOT_CLOSE' }, '*');
    };

    const handleLiveSupport = () => {
        if (chatbot.whatsappNumber) {
            const number = chatbot.whatsappNumber.replace(/[^0-9]/g, '');
            window.open(`https://wa.me/${number}`, '_blank');
        } else if (chatbot.liveSupportUrl) {
            window.open(chatbot.liveSupportUrl, '_blank');
        }
    };

    return (
        <div className="flex flex-col h-full bg-white font-sans overflow-hidden border-l border-slate-100">
            {/* --- HEADER --- */}
            <div
                className="shrink-0 px-6 py-5 flex items-center justify-between border-b border-slate-100 sticky top-0 z-10 transition-colors duration-300"
                style={{ backgroundColor: primaryColor, color: textColor }}
            >
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-sm">
                            <Sparkles className="w-5 h-5 fill-current opacity-90" style={{ color: textColor }} />
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>

                    <div className="flex flex-col">
                        <h1 className="font-bold text-base leading-tight" style={{ color: textColor }}>
                            {t.displayName}
                        </h1>
                        <p className="text-xs font-medium mt-0.5 opacity-80" style={{ color: textColor }}>
                            {t.subTitle}
                        </p>
                    </div>
                </div>

                {/* Aksiyon Butonları */}
                <div className="flex items-center gap-1">
                    {/* YENİ: Canlı Destek Butonu */}
                    {chatbot.enableLiveChat && (chatbot.whatsappNumber || chatbot.liveSupportUrl) && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="bg-white/10 hover:bg-white/20 h-9 w-9 rounded-full transition-colors backdrop-blur-sm border border-white/10"
                            style={{ color: textColor }}
                            onClick={handleLiveSupport}
                            title="Live Support"
                        >
                            <Headset className="w-5 h-5" />
                        </Button>
                    )}

                    {/* YENİ: Dil Değiştirme Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="bg-white/10 hover:bg-white/20 h-9 w-9 rounded-full transition-colors backdrop-blur-sm border border-white/10 font-bold text-xs"
                                style={{ color: textColor }}
                                title={t.changeLanguage}
                            >
                                {language.toUpperCase()}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 z-50 bg-white">
                            {languages.map((lang) => (
                                <DropdownMenuItem
                                    key={lang.code}
                                    onClick={() => changeLanguage(lang.code)}
                                    className={cn(
                                        "flex items-center gap-2 cursor-pointer",
                                        language === lang.code && "bg-slate-100 font-medium"
                                    )}
                                >
                                    <span className="text-lg">{lang.flag}</span>
                                    <span>{lang.name}</span>
                                    {language === lang.code && <Check className="w-3 h-3 ml-auto opacity-70" />}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="bg-white/10 hover:bg-white/20 h-9 w-9 rounded-full transition-colors backdrop-blur-sm border border-white/10"
                        style={{ color: textColor }}
                        onClick={() => setMessages([])}
                        title={t.clearChat}
                    >
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="bg-white/10 hover:bg-white/20 h-9 w-9 rounded-full transition-colors backdrop-blur-sm border border-white/10"
                        style={{ color: textColor }}
                        onClick={handleClose}
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* --- MESAJ ALANI --- */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-white">
                {messages.map((msg, index) => (
                    <div
                        key={msg.id}
                        className={cn(
                            "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
                            msg.role === 'user' ? "justify-end" : "justify-start"
                        )}
                    >
                        <div className={cn("flex max-w-[85%] flex-col gap-1.5", msg.role === 'user' ? "items-end" : "items-start")}>

                            <span className="text-[10px] text-slate-400 font-medium px-1">
                                {msg.role === 'user' ? t.you : t.assistant}
                            </span>

                            <div
                                className={cn(
                                    "px-5 py-3.5 text-[14px] leading-relaxed shadow-sm",
                                    msg.role === 'user'
                                        ? "text-white rounded-[20px] rounded-tr-sm"
                                        : "bg-slate-50 text-slate-800 rounded-[20px] rounded-tl-sm border border-slate-100"
                                )}
                                style={msg.role === 'user' ? { backgroundColor: primaryColor } : {}}
                            >
                                {/* Eğer dosya eki varsa göster */}
                                {msg.attachment && (
                                    <div className="flex items-center gap-2 mb-2 p-2 bg-white/10 rounded-lg text-xs border border-white/10">
                                        <FileText className="w-4 h-4" />
                                        <span className="truncate max-w-[150px]">{msg.attachment}</span>
                                    </div>
                                )}
                                {msg.content}
                            </div>

                            <span className="text-[10px] text-slate-300 px-1 select-none">
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
                        <div className="bg-slate-50 px-4 py-4 rounded-[20px] rounded-tl-sm border border-slate-100 flex gap-1.5 items-center w-fit">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* --- INPUT ALANI --- */}
            <div className="shrink-0 p-5 bg-white relative">
                {/* YENİ: Dosya Önizleme Çipi (Dosya seçilince input'un üstünde belirir) */}
                {selectedFile && (
                    <div className="absolute -top-2 left-8 bg-slate-800 text-white text-xs py-1 px-3 rounded-full shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-2 z-10">
                        <FileText className="w-3 h-3" />
                        <span className="max-w-[150px] truncate">{selectedFile.name}</span>
                        <button onClick={clearFile} className="hover:text-red-300 ml-1">
                            <XCircle className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}

                <form
                    onSubmit={handleSendMessage}
                    className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-full shadow-sm focus-within:ring-2 focus-within:ring-slate-100 focus-within:border-slate-300 transition-all"
                >
                    <div className="pl-3">
                        {/* Gizli Dosya Inputu */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*,.pdf,.doc,.docx"
                        />
                        {/* Ataç İkonu */}
                        <Paperclip
                            onClick={handlePaperclipClick}
                            className="w-5 h-5 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                        />
                    </div>

                    <input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={selectedFile ? `${selectedFile.name} gönderilecek...` : t.placeholder}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-3 px-2 placeholder:text-slate-400 outline-none"
                    />

                    <Button
                        type="submit"
                        size="icon"
                        disabled={(!inputValue.trim() && !selectedFile) || isLoading}
                        className="h-10 w-10 rounded-full shrink-0 transition-all disabled:opacity-50 disabled:scale-95"
                        style={{
                            backgroundColor: (inputValue.trim() || selectedFile) ? primaryColor : '#f4f4f5',
                            color: (inputValue.trim() || selectedFile) ? 'white' : '#a1a1aa'
                        }}
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                    </Button>
                </form>

                {!chatbot.hideBranding && (
                    <div className="text-center mt-3">
                        <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                            {t.aiPowered} · Powered by
                            <span style={{ color: primaryColor, fontWeight: 600 }}>PylonChat</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}