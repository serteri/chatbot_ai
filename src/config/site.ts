export const siteConfig = {
  name: "PylonChat",
  description: "Professional multi-language AI chatbot platform",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  links: {
    twitter: "https://twitter.com/pylonchat",
    github: "https://github.com/serteri/chatbot_ai",
    docs: "https://pylonchat.com/docs",
  },

  creator: {
    name: "PylonChat Team",
    url: "https://pylonchat.com",
  },

  defaultLanguage: "tr",
  supportedLanguages: [
    { code: "tr", name: "Türkçe", flag: "🇹🇷" },
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
    { code: "ru", name: "Русский", flag: "🇷🇺" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
  ],

  features: [
    {
      title: "Çok Dilli Destek",
      description: "9 farklı dilde AI ile konuşun",
      icon: "🌍",
    },
    {
      title: "Güçlü AI Modelleri",
      description: "GPT-4 ve Claude 3 desteği",
      icon: "🤖",
    },
    {
      title: "Dosya Yükleme",
      description: "PDF, DOCX ve görselleri analiz edin",
      icon: "📁",
    },
    {
      title: "Prompt Kütüphanesi",
      description: "Hazır şablonlar ve paylaşım",
      icon: "📚",
    },
    {
      title: "Takım Çalışması",
      description: "Workspace ve işbirliği özellikleri",
      icon: "👥",
    },
    {
      title: "Gelişmiş Analitik",
      description: "Kullanım istatistikleri ve raporlar",
      icon: "📊",
    },
  ],

  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFilesPerMessage: 5,

  supportedFileTypes: {
    documents: [".pdf", ".doc", ".docx", ".txt"],
    images: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
    code: [".js", ".ts", ".py", ".java", ".cpp", ".c", ".html", ".css"],
  },

  chatDefaults: {
    model: "gpt-3.5-turbo" as const,
    temperature: 0.7,
    maxTokens: 2000,
  },
}