
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env explicitly
dotenv.config({ path: path.join(process.cwd(), '.env') });

async function main() {
    console.log('🔍 Checking Chatbot Widget Settings...');
    const prisma = new PrismaClient();

    try {
        await prisma.$connect();

        const chatbots = await prisma.chatbot.findMany({
            select: {
                id: true,
                name: true,
                widgetPrimaryColor: true,
                widgetButtonColor: true,
                updatedAt: true
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        let output = `Found ${chatbots.length} chatbots.\n`;

        chatbots.forEach(bot => {
            output += `--------------------------------------------------\n`;
            output += `ID: ${bot.id}\n`;
            output += `Name: ${bot.name}\n`;
            output += `Primary Color: ${bot.widgetPrimaryColor}\n`;
            output += `Button Color: ${bot.widgetButtonColor}\n`;
            output += `Last Updated: ${bot.updatedAt}\n`;
        });

        const outputPath = path.join(process.cwd(), 'chatbot_settings_output.txt');
        fs.writeFileSync(outputPath, output);
        console.log(`Output written to ${outputPath}`);

    } catch (error) {
        console.error("Error fetching chatbots:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(console.error);
