'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog'
import { Calendar, Clock, Plus, Trash2, Eye, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface InspectionTime {
    id: string
    date: string
    startTime: string
    endTime: string
    notes?: string
}

interface InspectionTimesManagerProps {
    propertyId: string
    initialInspections: InspectionTime[]
    locale: string
}

const translations = {
    tr: {
        title: 'Görüntüleme Saatleri',
        description: 'Açık ev ve görüntüleme zamanlarını yönetin',
        addInspection: 'Görüntüleme Ekle',
        date: 'Tarih',
        startTime: 'Başlangıç',
        endTime: 'Bitiş',
        notes: 'Notlar',
        save: 'Kaydet',
        cancel: 'İptal',
        noInspections: 'Henüz görüntüleme saati eklenmemiş',
        upcoming: 'Yaklaşan',
        past: 'Geçmiş',
        addNew: 'Yeni Görüntüleme Ekle',
        optional: 'Opsiyonel'
    },
    en: {
        title: 'Inspection Times',
        description: 'Manage open house and inspection times',
        addInspection: 'Add Inspection',
        date: 'Date',
        startTime: 'Start Time',
        endTime: 'End Time',
        notes: 'Notes',
        save: 'Save',
        cancel: 'Cancel',
        noInspections: 'No inspection times added yet',
        upcoming: 'Upcoming',
        past: 'Past',
        addNew: 'Add New Inspection',
        optional: 'Optional'
    },
    de: {
        title: 'Besichtigungszeiten',
        description: 'Offene Hausbesichtigungen verwalten',
        addInspection: 'Besichtigung hinzufügen',
        date: 'Datum',
        startTime: 'Startzeit',
        endTime: 'Endzeit',
        notes: 'Notizen',
        save: 'Speichern',
        cancel: 'Abbrechen',
        noInspections: 'Noch keine Besichtigungszeiten hinzugefügt',
        upcoming: 'Bevorstehend',
        past: 'Vergangen',
        addNew: 'Neue Besichtigung hinzufügen',
        optional: 'Optional'
    },
    fr: {
        title: 'Horaires de visite',
        description: 'Gérer les visites et les journées portes ouvertes',
        addInspection: 'Ajouter une visite',
        date: 'Date',
        startTime: 'Heure de début',
        endTime: 'Heure de fin',
        notes: 'Notes',
        save: 'Enregistrer',
        cancel: 'Annuler',
        noInspections: 'Aucune visite programmée',
        upcoming: 'À venir',
        past: 'Passé',
        addNew: 'Ajouter une nouvelle visite',
        optional: 'Facultatif'
    },
    es: {
        title: 'Horarios de visita',
        description: 'Gestionar visitas y jornadas de puertas abiertas',
        addInspection: 'Agregar visita',
        date: 'Fecha',
        startTime: 'Hora de inicio',
        endTime: 'Hora de fin',
        notes: 'Notas',
        save: 'Guardar',
        cancel: 'Cancelar',
        noInspections: 'Aún no hay visitas programadas',
        upcoming: 'Próximo',
        past: 'Pasado',
        addNew: 'Agregar nueva visita',
        optional: 'Opcional'
    }
}

export function InspectionTimesManager({ propertyId, initialInspections, locale }: InspectionTimesManagerProps) {
    const [inspections, setInspections] = useState<InspectionTime[]>(initialInspections)
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [newInspection, setNewInspection] = useState({
        date: '',
        startTime: '',
        endTime: '',
        notes: ''
    })

    const t = translations[locale as keyof typeof translations] || translations.en

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })
    }

    const isUpcoming = (dateStr: string, timeStr: string) => {
        const inspectionDate = new Date(`${dateStr}T${timeStr}:00`)
        return inspectionDate > new Date()
    }

    const handleAddInspection = async () => {
        if (!newInspection.date || !newInspection.startTime || !newInspection.endTime) {
            toast.error('Please fill in all required fields')
            return
        }

        setIsLoading(true)
        try {
            const updatedInspections = [
                ...inspections,
                {
                    id: `insp_${Date.now()}`,
                    ...newInspection
                }
            ]

            const response = await fetch(`/api/properties/${propertyId}/inspections`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inspectionTimes: updatedInspections })
            })

            if (!response.ok) throw new Error('Failed to save')

            const result = await response.json()
            setInspections(result.inspectionTimes || [])
            setNewInspection({ date: '', startTime: '', endTime: '', notes: '' })
            setIsOpen(false)
            toast.success('Inspection time added!')
        } catch (error) {
            console.error(error)
            toast.error('Failed to add inspection time')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteInspection = async (inspectionId: string) => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/properties/${propertyId}/inspections?inspectionId=${inspectionId}`, {
                method: 'DELETE'
            })

            if (!response.ok) throw new Error('Failed to delete')

            setInspections(prev => prev.filter(i => i.id !== inspectionId))
            toast.success('Inspection time removed!')
        } catch (error) {
            console.error(error)
            toast.error('Failed to remove inspection time')
        } finally {
            setIsLoading(false)
        }
    }

    const upcomingInspections = inspections.filter(i => isUpcoming(i.date, i.startTime))
    const pastInspections = inspections.filter(i => !isUpcoming(i.date, i.startTime))

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg">{t.title}</CardTitle>
                    </div>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="mr-1 h-4 w-4" />
                                {t.addInspection}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{t.addNew}</DialogTitle>
                                <DialogDescription>{t.description}</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="date">{t.date}</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={newInspection.date}
                                        onChange={(e) => setNewInspection(prev => ({ ...prev, date: e.target.value }))}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="startTime">{t.startTime}</Label>
                                        <Input
                                            id="startTime"
                                            type="time"
                                            value={newInspection.startTime}
                                            onChange={(e) => setNewInspection(prev => ({ ...prev, startTime: e.target.value }))}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="endTime">{t.endTime}</Label>
                                        <Input
                                            id="endTime"
                                            type="time"
                                            value={newInspection.endTime}
                                            onChange={(e) => setNewInspection(prev => ({ ...prev, endTime: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="notes">{t.notes} ({t.optional})</Label>
                                    <Input
                                        id="notes"
                                        placeholder="e.g., Ring doorbell on arrival"
                                        value={newInspection.notes}
                                        onChange={(e) => setNewInspection(prev => ({ ...prev, notes: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsOpen(false)}>
                                    {t.cancel}
                                </Button>
                                <Button onClick={handleAddInspection} disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {t.save}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
                <CardDescription>{t.description}</CardDescription>
            </CardHeader>
            <CardContent>
                {inspections.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                        <Calendar className="h-10 w-10 mx-auto mb-2 text-slate-200" />
                        <p className="text-sm">{t.noInspections}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {upcomingInspections.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1">
                                    <Badge variant="secondary" className="bg-green-100 text-green-700">{t.upcoming}</Badge>
                                </h4>
                                <div className="space-y-2">
                                    {upcomingInspections.map((inspection) => (
                                        <div key={inspection.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1 text-sm">
                                                    <Calendar className="h-4 w-4 text-green-600" />
                                                    <span className="font-medium">{formatDate(inspection.date)}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{inspection.startTime} - {inspection.endTime}</span>
                                                </div>
                                                {inspection.notes && (
                                                    <span className="text-xs text-muted-foreground">({inspection.notes})</span>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteInspection(inspection.id)}
                                                disabled={isLoading}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {pastInspections.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-slate-500 mb-2">
                                    <Badge variant="secondary" className="bg-slate-100">{t.past}</Badge>
                                </h4>
                                <div className="space-y-2 opacity-60">
                                    {pastInspections.map((inspection) => (
                                        <div key={inspection.id} className="flex items-center justify-between p-3 bg-slate-50 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm">{formatDate(inspection.date)}</span>
                                                <span className="text-sm text-muted-foreground">{inspection.startTime} - {inspection.endTime}</span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteInspection(inspection.id)}
                                                disabled={isLoading}
                                            >
                                                <Trash2 className="h-4 w-4 text-slate-400" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
