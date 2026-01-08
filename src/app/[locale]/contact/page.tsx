import { Footer } from '@/components/Footer'
// ... imports ...

export default function ContactPage() {
    const t = useTranslations()
    const params = useParams()
    const locale = params.locale as string

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const validate = () => {
        const newErrors: Record<string, string> = {}
        if (!formData.name.trim()) newErrors.name = t('contact.form.nameRequired')
        if (!formData.email.trim()) {
            newErrors.email = t('contact.form.emailRequired')
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = t('contact.form.emailInvalid')
        }
        if (!formData.subject.trim()) newErrors.subject = t('contact.form.subjectRequired')
        if (!formData.message.trim()) newErrors.message = t('contact.form.messageRequired')

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return

        setIsSubmitting(true)

        // Simulate form submission
        setTimeout(() => {
            setIsSubmitting(false)
            setIsSubmitted(true)
            setFormData({ name: '', email: '', subject: '', message: '' })
            setErrors({})
        }, 2000)
    }

    // ... faqs ...

    return (
        <>
            <PublicNav />

            <div className="min-h-screen bg-white">
                {/* ... Hero Section ... */}
                <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">
                            {t('contact.title')}
                        </h1>
                        <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                            {t('contact.subtitle')}
                        </p>
                        <p className="text-lg text-blue-100 max-w-4xl mx-auto">
                            {t('contact.description')}
                        </p>
                    </div>
                </div>

                <div className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="grid lg:grid-cols-3 gap-12 max-w-7xl mx-auto">

                            {/* Contact Form */}
                            <div className="lg:col-span-2">
                                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                        {t('contact.form.title')}
                                    </h2>

                                    {isSubmitted ? (
                                        <div className="text-center py-12">
                                            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                {t('contact.form.success')}
                                            </h3>
                                            <button
                                                onClick={() => setIsSubmitted(false)}
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                {locale === 'tr' ? 'Yeni mesaj gönder' : 'Send another message'}
                                            </button>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        {t('contact.form.name')}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                                                        placeholder={t('contact.form.namePlaceholder')}
                                                        value={formData.name}
                                                        onChange={(e) => {
                                                            setFormData({ ...formData, name: e.target.value })
                                                            if (errors.name) setErrors({ ...errors, name: '' })
                                                        }}
                                                    />
                                                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        {t('contact.form.email')}
                                                    </label>
                                                    <input
                                                        type="email"
                                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                                        placeholder={t('contact.form.emailPlaceholder')}
                                                        value={formData.email}
                                                        onChange={(e) => {
                                                            setFormData({ ...formData, email: e.target.value })
                                                            if (errors.email) setErrors({ ...errors, email: '' })
                                                        }}
                                                    />
                                                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    {t('contact.form.subject')}
                                                </label>
                                                <input
                                                    type="text"
                                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.subject ? 'border-red-500' : 'border-gray-300'}`}
                                                    placeholder={t('contact.form.subjectPlaceholder')}
                                                    value={formData.subject}
                                                    onChange={(e) => {
                                                        setFormData({ ...formData, subject: e.target.value })
                                                        if (errors.subject) setErrors({ ...errors, subject: '' })
                                                    }}
                                                />
                                                {errors.subject && <p className="mt-1 text-sm text-red-500">{errors.subject}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    {t('contact.form.message')}
                                                </label>
                                                <textarea
                                                    rows={6}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.message ? 'border-red-500' : 'border-gray-300'}`}
                                                    placeholder={t('contact.form.messagePlaceholder')}
                                                    value={formData.message}
                                                    onChange={(e) => {
                                                        setFormData({ ...formData, message: e.target.value })
                                                        if (errors.message) setErrors({ ...errors, message: '' })
                                                    }}
                                                />
                                                {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message}</p>}
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                            >
                                                <Send className="h-5 w-5" />
                                                <span>
                                                    {isSubmitting ? t('contact.form.sending') : t('contact.form.send')}
                                                </span>
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>

                            {/* Contact Info Sidebar */}
                            <div className="space-y-8">
                                {/* ... Contact Info ... */}
                                {/* ... Support Categories ... */}
                                <div className="bg-gray-50 p-6 rounded-2xl">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                                        {t('contact.info.title')}
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                                <Mail className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{t('contact.info.email')}</div>
                                                <div className="text-gray-600">support@pylonchat.com</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                                                <Phone className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{t('contact.info.phone')}</div>
                                                <div className="text-gray-600">+61 432 672 696</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                                                <MapPin className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{t('contact.info.address')}</div>
                                                <div className="text-gray-600">Brisbane, Australia</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                                                <Clock className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{t('contact.info.hours')}</div>
                                                <div className="text-gray-600">{t('contact.info.hoursValue')}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Support Categories */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-200">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                                        {t('contact.support.title')}
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                                            <HeadphonesIcon className="h-5 w-5 text-blue-600" />
                                            <span className="text-blue-900 font-medium">{t('contact.support.technical')}</span>
                                        </div>

                                        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                                            <Building className="h-5 w-5 text-green-600" />
                                            <span className="text-green-900 font-medium">{t('contact.support.sales')}</span>
                                        </div>

                                        <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                                            <MessageCircle className="h-5 w-5 text-purple-600" />
                                            <span className="text-purple-900 font-medium">{t('contact.support.general')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="py-20 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                    {t('contact.faq.title')}
                                </h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {faqs.map((faq, index) => (
                                    <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                                        <div className="flex items-start space-x-4">
                                            <HelpCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                    {faq.question}
                                                </h3>
                                                <p className="text-gray-600 leading-relaxed">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer locale={locale} />
        </>
    )
}