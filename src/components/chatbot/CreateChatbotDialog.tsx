'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface CreateChatbotDialogProps {
  trigger?: React.ReactNode
}

export function CreateChatbotDialog({ trigger }: CreateChatbotDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    language: 'tr',
    aiModel: 'gpt-3.5-turbo',
    botName: 'AI Asistan',
    welcomeMessage: 'Merhaba! Size nasıl yardımcı olabilirim?',
    placeholderText: 'Mesajınızı yazın...',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/chatbot/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Bir hata oluştu')
        setIsLoading(false)
        return
      }

      toast.success('Chatbot başarıyla oluşturuldu!')
      setOpen(false)
      router.refresh()
      
      // Chatbot detay sayfasına yönlendir
      router.push(`/chatbots/${data.chatbot.id}`)

    } catch (error) {
      toast.error('Bir hata oluştu')
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Chatbot Oluştur
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yeni Chatbot Oluştur</DialogTitle>
          <DialogDescription>
            Müşteri destek chatbot'unuzu oluşturun ve özelleştirin.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Chatbot Adı */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Chatbot Adı <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Örn: Destek Botu"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          {/* Dil */}
          <div className="space-y-2">
            <Label htmlFor="language">Dil</Label>
            <Select
              value={formData.language}
              onValueChange={(value) => setFormData({ ...formData, language: value })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tr">🇹🇷 Türkçe</SelectItem>
                <SelectItem value="en">🇬🇧 English</SelectItem>
                <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                <SelectItem value="fr">🇫🇷 Français</SelectItem>
                <SelectItem value="es">🇪🇸 Español</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* AI Model */}
          <div className="space-y-2">
            <Label htmlFor="aiModel">AI Model</Label>
            <Select
              value={formData.aiModel}
              onValueChange={(value) => setFormData({ ...formData, aiModel: value })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Hızlı)</SelectItem>
                <SelectItem value="gpt-4-turbo">GPT-4 Turbo (Gelişmiş)</SelectItem>
                <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bot Adı */}
          <div className="space-y-2">
            <Label htmlFor="botName">Bot Adı</Label>
            <Input
              id="botName"
              placeholder="Chat widget'ta görünecek isim"
              value={formData.botName}
              onChange={(e) => setFormData({ ...formData, botName: e.target.value })}
              disabled={isLoading}
            />
          </div>

          {/* Hoş Geldin Mesajı */}
          <div className="space-y-2">
            <Label htmlFor="welcomeMessage">Hoş Geldin Mesajı</Label>
            <Textarea
              id="welcomeMessage"
              placeholder="Kullanıcıları karşılama mesajınız"
              value={formData.welcomeMessage}
              onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
              disabled={isLoading}
              rows={3}
            />
          </div>

          {/* Placeholder Text */}
          <div className="space-y-2">
            <Label htmlFor="placeholderText">Mesaj Placeholder</Label>
            <Input
              id="placeholderText"
              placeholder="Mesaj input'unda görünecek text"
              value={formData.placeholderText}
              onChange={(e) => setFormData({ ...formData, placeholderText: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
              İptal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Oluşturuluyor...' : 'Chatbot Oluştur'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}