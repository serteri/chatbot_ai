import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// QS JSON Data URL
const QS_DATA =
    "https://raw.githubusercontent.com/ankita2002/QS-world-university-rankings-json/master/QS-World-University-Rankings-2023.json";

export async function GET() {
    try {
        const res = await fetch(QS_DATA);

        const raw = await res.text();

        // JSON valid mi önce kontrol et
        if (!raw.trim().startsWith("[")) {
            return NextResponse.json(
                { error: "QS JSON formatında değil" },
                { status: 500 }
            );
        }

        const rankingData = JSON.parse(raw);

        let updated = 0;

        for (const uni of rankingData) {
            const name = uni?.institution || "";
            const rank = parseInt(uni?.rank?.replace(/\D/g, ""), 10);

            if (!name || !rank) continue;

            await prisma.university.updateMany({
                where: {
                    name: {
                        equals: name,
                        mode: "insensitive",
                    },
                },
                data: {
                    ranking: rank,
                },
            });

            updated++;
        }

        return NextResponse.json({
            status: "ok",
            updated,
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
