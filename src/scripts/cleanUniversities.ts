import { prisma } from "@/lib/prisma";

async function run() {
    await prisma.university.deleteMany();
    console.log("Universities cleared ✔");
}

run();
