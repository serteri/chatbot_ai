import { PrismaClient } from '@prisma/client'

// PrismaClient'ın "global" bir değişken olarak tanımlanması
declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined
}

// globalThis.prisma'yı kontrol et veya yeni bir client oluştur.
// Bu, Next.js'in development modundaki (npm run dev) hot-reload
// özelliğinin her seferinde yeni bir client oluşturmasını engeller.
export const prisma =
    globalThis.prisma ||
    new PrismaClient({
        // İsteğe bağlı: Geliştirme ortamında tüm sorguları log'la
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })

// Development ortamında global değişkeni ayarla
if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prisma
}