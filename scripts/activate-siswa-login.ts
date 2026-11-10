import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Mencari siswa yang belum memiliki akun login...");

  // Ambil semua siswa
  const semuaSiswa = await prisma.siswa.findMany();
  let berhasil = 0;
  let dilewati = 0;

  for (const siswa of semuaSiswa) {
    // Cek apakah sudah ada user yang terhubung (berdasarkan nama atau kita buat baru)
    // Strategi aman: Buat user baru dengan email = nis@smkpplg.sch.id
    const defaultEmail = `${siswa.nis}@smkpplg.sch.id`;
    
    const existingUser = await prisma.user.findUnique({
      where: { email: defaultEmail }
    });

    if (existingUser) {
      // Jika user sudah ada tapi belum terhubung ke siswa ini, kita hubungkan
      if (!existingUser.siswaProfile) {
         // (Opsional: update relasi jika schema Anda mendukung)
      }
      dilewati++;
      continue;
    }

    // Buat User baru untuk siswa ini
    const hashedPassword = await bcrypt.hash("siswa123", 10);
    
    await prisma.user.create({
      data: {
        email: defaultEmail,
        name: siswa.namaLengkap,
        password: hashedPassword,
        role: "SISWA",
        siswaProfile: {
          connect: { id: siswa.id } // Hubungkan ke data siswa yang sudah ada
        }
      }
    });
    
    berhasil++;
  }

  console.log("✅ SELESAI!");
  console.log(`🎉 ${berhasil} akun siswa berhasil diaktifkan.`);
  console.log(`⚠️ ${dilewati} akun sudah ada/dilewati.`);
  console.log("\n📝 INFORMASI LOGIN UNTUK SEMUA SISWA:");
  console.log("   📧 Email    : [NIS]@smkpplg.sch.id  (Contoh: 1234567890@smkpplg.sch.id)");
  console.log("   🔑 Password : siswa123");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });