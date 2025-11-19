import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const QS_2024 =
    "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/webometrics/world_rankings.json\n";

export async function GET() {
    try {
        const res = await fetch(QS_2024);
        const raw = await res.text();

        if (!raw.trim().startsWith("{") && !raw.trim().startsWith("[")) {
            return NextResponse.json(
                {
                    error: "JSON değil (HTML geldi)",
                    preview: raw.slice(0, 200),
                },
                { status: 500 }
            );
        }

        const list = JSON.parse(raw);

        let updated = 0;

        for (const row of list) {
            const name = row["University"]?.trim();
            const rank = parseInt(row["Rank"], 10);

            if (!name || !rank) continue;

            const result = await prisma.university.updateMany({
                where: {
                    name: { equals: name, mode: "insensitive" },
                },
                data: { ranking: rank },
            });

            if (result.count > 0) updated += result.count;
        }

        return NextResponse.json({
            status: "ok",
            updated,
            totalInDataset: list.length,
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
