import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Memulai pembuatan akun siswa...");

  // 1. Pastikan ada kelas (atau buat baru jika belum ada)
  let kelas = await prisma.kelas.findFirst({ where: { nama: "X PPLG 1" } });
  if (!kelas) {
    kelas = await prisma.kelas.create({
      data: { nama: "X PPLG 1", tingkat: "X", jurusan: "PPLG" },
    });
    console.log("✅ Kelas 'X PPLG 1' berhasil dibuat.");
  }

  // 2. Tentukan kredensial siswa
  const emailSiswa = "siswa1@smkpplg.sch.id";
  const passwordPlain = "siswa123";
  
  // 3. Cek apakah user sudah ada
  const existingUser = await prisma.user.findUnique({ where: { email: emailSiswa } });
  if (existingUser) {
    console.log("⚠️ Akun siswa ini sudah ada di database.");
    console.log(`📧 Silakan login dengan Email: ${emailSiswa}`);
    console.log(`🔑 Dan Password: ${passwordPlain}`);
    return;
  }

  // 4. Hash password
  const hashedPassword = await bcrypt.hash(passwordPlain, 10);

  // 5. Buat User dan Profil Siswa sekaligus (Nested Create)
  const newUser = await prisma.user.create({
    data: {
      email: emailSiswa,
      name: "Budi Santoso",
      password: hashedPassword,
      role: "SISWA", // Role wajib huruf besar sesuai schema
      siswaProfile: {
        create: {
          nis: "1234567890",
          namaLengkap: "Budi Santoso",
          kelasId: kelas.id,
        },
      },
    },
    include: {
      siswaProfile: true,
    }
  });

  console.log("🎉 ✅ Akun SISWA berhasil dibuat!");
  console.log("--------------------------------------------------");
  console.log("📧 Email    :", emailSiswa);
  console.log("🔑 Password :", passwordPlain);
  console.log("🏫 Kelas    :", kelas.nama);
  console.log("👤 Nama     :", newUser.siswaProfile?.namaLengkap);
  console.log("--------------------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });