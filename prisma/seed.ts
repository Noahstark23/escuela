// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@school.com'
    const passwordRaw = '123456'

    // Hash fresh para evitar errores de salt anteriores
    const hashedPassword = await bcrypt.hash(passwordRaw, 10)

    console.log(`🌱 Sembrando usuario: ${email} ...`)

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: 'ADMIN' // Aseguramos que tenga rol
        },
        create: {
            email,
            password: hashedPassword,
            role: 'ADMIN',
        },
    })

    console.log(`✅ Usuario creado/actualizado correctamente.`)
    console.log(`📧 Email: ${email}`)
    console.log(`Vx Clave: ${passwordRaw}`)
}

main()
    .then(async () => await prisma.$disconnect())
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
