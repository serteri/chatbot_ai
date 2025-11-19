import fs from "fs";
import path from "path";
import axios from "axios";
import prisma from "@/lib/prisma";
import stringSimilarity from "string-similarity";

interface ScrapedUni {
    rank: number | null;
    name: string;
    country: string | null;
    sourceUrl?: string | null;
}

interface DbUni {
    id: string;
    name: string;
    country: string | null;
}

async function loadQS() {
    const filePath = path.join(process.cwd(), "data", "qs-top1000-2024.json");

    if (!fs.existsSync(filePath)) {
        throw new Error("qs-top1000-2024.json bulunamadı!");
    }

    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw) as ScrapedUni[];
}

async function run() {
    console.log("📘 QS TOP 1000 yükleniyor...");

    const qsList = await loadQS();

    console.log("📗 Database üniversiteleri çekiliyor...");

    const dbUniversities = await prisma.prisma.university.findMany({
        select: { id: true, name: true, country: true },
    });

    console.log(`📌 DB University Count: ${dbUniversities.length}`);
    console.log(`📌 QS Count: ${qsList.length}`);

    for (const uni of qsList) {
        const scrapedName = uni.name.trim();

        /// === EXACT MATCH ===
        let match = dbUniversities.find(
            (d: DbUni) => d.name.toLowerCase().trim() === scrapedName.toLowerCase().trim()
        );

        /// === partial contains ===
        if (!match) {
            match = dbUniversities.find(
                (d: DbUni) =>
                    scrapedName.toLowerCase().includes(d.name.toLowerCase()) ||
                    d.name.toLowerCase().includes(scrapedName.toLowerCase())
            );
        }

        /// === string similarity ===
        if (!match) {
            const dbNames = dbUniversities.map((d: DbUni) => d.name);
            const best = stringSimilarity.findBestMatch(scrapedName, dbNames);

            if (best.bestMatch.rating > 0.75) {
                match = dbUniversities[best.bestMatchIndex];
            }
        }

        if (!match) {
            console.log(`❌ EŞLEŞMEDİ: ${scrapedName}`);
            continue;
        }

        console.log(`✅ EŞLEŞTİ: ${scrapedName} → ${match.name}`);

        await prisma.prisma.university.update({
            where: { id: match.id },
            data: { ranking: uni.rank ?? null },
        });
    }

    console.log("🎉 BİTTİ — QS ranking sync tamamlandı!");
}

run()
    .catch((err) => {
        console.error(err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.prisma.$disconnect();
    });