import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@school.com'
    const newPassword = '123456'
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    console.log(`🔒 Reseteando contraseña para: ${email}...`)

    await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
    })

    console.log(`✅ Contraseña actualizada exitosamente.`)
    console.log(`🔑 Nueva credencial válida -> Email: ${email} | Pass: ${newPassword}`)
}

main()
    .catch(e => {
        console.error("Error al resetear:", e)
        process.exit(1)
    })
    .finally(async () => await prisma.$disconnect())
