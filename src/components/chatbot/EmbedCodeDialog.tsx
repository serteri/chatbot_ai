'use client';

import { useState, useEffect } from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger,
    DialogDescription
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, Check, Terminal, Globe, LayoutTemplate } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmbedCodeDialogProps {
    chatbotId: string;
    trigger: React.ReactNode;
}

export function EmbedCodeDialog({ chatbotId, trigger }: EmbedCodeDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [origin, setOrigin] = useState('');
    const [activeTab, setActiveTab] = useState('script'); // Aktif sekmeyi takip etmek için state

    // Sayfa yüklendiğinde gerçek URL'i (localhost veya domain) al
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Öncelik: .env dosyası -> Yoksa: Tarayıcıdaki adres
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
            setOrigin(appUrl);
        }
    }, []);

    const scriptCode = `<script 
  src="${origin}/embed/${chatbotId}.js"
  defer>
</script>`;

    const iframeCode = `<iframe
  src="${origin}/chatbot/${chatbotId}"
  width="100%"
  height="600"
  frameborder="0"
></iframe>`;

    const handleCopy = () => {
        const codeToCopy = activeTab === 'iframe' ? iframeCode : scriptCode;
        navigator.clipboard.writeText(codeToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl bg-white p-0 overflow-hidden gap-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Terminal className="w-5 h-5 text-blue-600" />
                        Chatbot'u Siteye Ekle
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 mt-2">
                        Chatbot'u web sitenize eklemek için aşağıdaki yöntemlerden birini seçin.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="p-6 pt-2">
                    <Tabs defaultValue="script" value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-100 p-1">
                            <TabsTrigger value="script" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Script (Önerilen)</TabsTrigger>
                            <TabsTrigger value="iframe" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Iframe</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="script" className="mt-0">
                            <div className="relative group">
                                <div className="absolute right-2 top-2 z-10">
                                    <Button 
                                        size="icon" 
                                        variant="secondary" 
                                        className={cn(
                                            "h-8 w-8 transition-all duration-200", 
                                            copied ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                        )}
                                        onClick={handleCopy}
                                    >
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <pre className="bg-[#0f172a] text-slate-50 p-4 rounded-lg text-sm font-mono overflow-x-auto border border-slate-800 shadow-inner">
                                    <code className="language-html">
                                        {`<script 
  src="`}
                                        <span className="text-green-400">{origin}</span>
                                        {`/embed/`}
                                        <span className="text-yellow-400">{chatbotId}</span>
                                        {`.js"
  defer>
</script>`}
                                    </code>
                                </pre>
                            </div>
                            
                            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-3 items-start">
                                <Globe className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-800">
                                    <p className="font-semibold mb-1">Otomatik Yapılandırma</p>
                                    Bu kod, chatbot ayarlarınızı (renk, ikon, karşılama mesajı) sunucudan otomatik çeker. Tasarımı değiştirdiğinizde kodu güncellemeniz gerekmez.
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="iframe" className="mt-0">
                            <div className="relative group">
                                <div className="absolute right-2 top-2 z-10">
                                    <Button 
                                        size="icon" 
                                        variant="secondary" 
                                        className={cn(
                                            "h-8 w-8 transition-all duration-200", 
                                            copied ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                        )}
                                        onClick={handleCopy}
                                    >
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <pre className="bg-[#0f172a] text-slate-50 p-4 rounded-lg text-sm font-mono overflow-x-auto border border-slate-800 shadow-inner">
                                    <code className="language-html">
                                        {`<iframe
  src="`}
                                        <span className="text-green-400">{origin}</span>
                                        {`/chatbot/`}
                                        <span className="text-yellow-400">{chatbotId}</span>
                                        {`"
  width="100%"
  height="600"
  frameborder="0"
></iframe>`}
                                    </code>
                                </pre>
                            </div>
                            
                            <div className="mt-4 bg-amber-50 border border-amber-100 rounded-lg p-3 flex gap-3 items-start">
                                <LayoutTemplate className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-amber-800">
                                    <p className="font-semibold mb-1">Manuel Yerleşim</p>
                                    Iframe yöntemi, chatbot'u sayfanın belirli bir bölümüne (örneğin bir blog yazısının içine veya iletişim sayfasına) gömmek için idealdir.
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
                
                <div className="bg-slate-50 p-4 flex justify-end gap-2 border-t border-slate-100">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Kapat
                    </Button>
                    <Button onClick={handleCopy} className="bg-blue-600 hover:bg-blue-700 text-white">
                        {copied ? 'Kopyalandı' : 'Kodu Kopyala'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}