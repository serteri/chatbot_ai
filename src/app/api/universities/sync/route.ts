import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const GET = async () => {
    try {
        let cursor = "*";
        let universities: any[] = [];
        let page = 1;

        while (cursor) {
            const url = `https://api.openalex.org/institutions?filter=type:education&per-page=200&cursor=${cursor}`;
            const res = await fetch(url);
            const data = await res.json();

            console.log(`PAGE ${page} | fetched ${data.results.length}`);
            page++;

            universities.push(...data.results);

            cursor = data.meta?.next_cursor || null;
        }

        // DB write
        for (const uni of universities) {
            await prisma.university.upsert({
                where: { id: uni.id },
                update: {
                    name: uni.display_name,
                    country: uni.country_code || "",
                    city: uni.geo?.city || "",
                    founded: uni.founded,
                    studentCount: uni.statistics?.students,
                    internationalStudents: uni.statistics?.international_students,
                    website: uni.homepage_url,
                    description: uni.summary,
                    logo: uni.logo_url
                },
                create: {
                    id: uni.id,
                    name: uni.display_name,
                    country: uni.country_code || "",
                    city: uni.geo?.city || "",
                    founded: uni.founded,
                    studentCount: uni.statistics?.students,
                    internationalStudents: uni.statistics?.international_students,
                    website: uni.homepage_url,
                    description: uni.summary,
                    logo: uni.logo_url
                }
            });
        }

        return NextResponse.json({
            status: "ok",
            count: universities.length
        });

    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
};
