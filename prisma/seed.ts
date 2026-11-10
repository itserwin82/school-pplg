import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Memulai seeding data...')

  // 1. Buat User Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@smkpplg.sch.id' },
    update: {},
    create: {
      email: 'admin@smkpplg.sch.id',
      name: 'Administrator',
      password: 'password123', // Nanti di-hash
      role: 'ADMIN',
    },
  })

  // 2. Buat Kelas X PPLG 1
  const kelas = await prisma.kelas.upsert({
    where: { id: 'kelas-x-pplg-1' }, // Kita pakai ID statis untuk kemudahan seed
    update: {},
    create: {
      id: 'kelas-x-pplg-1',
      nama: 'X PPLG 1',
      tingkat: 10,
      jurusan: 'PPLG',
    },
  })

  // 3. Buat Guru
  const guruUser = await prisma.user.create({
    data: {
      email: 'budi@smkpplg.sch.id',
      name: 'Budi Santoso, S.Kom',
      password: 'password123',
      role: 'GURU',
      guruProfile: {
        create: {
          nip: '198501012010011001',
          namaLengkap: 'Budi Santoso, S.Kom',
        }
      }
    }
  })

  // 4. Buat Siswa
  await prisma.user.create({
    data: {
      email: 'andi@smkpplg.sch.id',
      name: 'Andi Pratama',
      password: 'password123',
      role: 'SISWA',
      siswaProfile: {
        create: {
          nis: '2023001',
          namaLengkap: 'Andi Pratama',
          kelasId: kelas.id,
        }
      }
    }
  })

  console.log('✅ Seeding selesai! Data berhasil dimasukkan.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })