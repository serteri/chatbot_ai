import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as cheerio from "cheerio";

export const GET = async () => {
    try {
        const universities = await prisma.university.findMany({
            where: { website: { not: null } },
            take: 2000 // Batch işlem
        });

        for (const uni of universities) {
            if (!uni.website) continue;

            const slug = uni.website.split("/").pop();
            const url = `https://www.topuniversities.com/universities/${slug}/undergrad`;

            const res = await fetch(url);
            const html = await res.text();

            const $ = cheerio.load(html);

            let programs: string[] = [];

            $(".field-item ul li").each((i, el) => {
                const text = $(el).text().trim();
                if (text) programs.push(text);
            });

            if (programs.length > 0) {
                await prisma.university.update({
                    where: { id: uni.id },
                    data: { programs }
                });
            }
        }

        return NextResponse.json({ status: "ok" });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
};
