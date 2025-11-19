import fetch from "node-fetch";
import { prisma } from "../lib/prisma";

async function run() {
    const countries = await fetch("https://restcountries.com/v3.1/all")
        .then((r) => r.json())
        .then((d) => d.map((c: any) => c.name.common));

    console.log("Countries:", countries.length);

    for (const country of countries) {
        console.log("Fetching:", country);

        const url = `https://universities.hipolabs.com/search?country=${encodeURIComponent(
            country
        )}`;

        const data = await fetch(url).then((r) => r.json());

        for (const u of data) {
            await prisma.university.upsert({
                where: {
                    id: `${u.name}-${country}`,
                },
                create: {
                    id: `${u.name}-${country}`,
                    name: u.name,
                    country,
                    city: u["state-province"] || "",
                    website: u.web_pages?.[0] ?? null,
                    programs: [],
                },
                update: {},
            });
        }

        console.log(`${country}: ${data.length} items`);
    }

    console.log("DONE.");
}

run()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
