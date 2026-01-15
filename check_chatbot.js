
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function check() {
    const id = 'cmk7tcv360001if04fv6opteb'
    const chatbots = await prisma.chatbot.findMany({
        select: { id: true, name: true, industry: true, identifier: true }
    })
    console.log(JSON.stringify(chatbots, null, 2))
}

check()
