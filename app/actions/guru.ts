"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { guruSchema } from "@/lib/validations/guru";
import bcrypt from "bcryptjs";

export async function createGuru(formData: FormData) {
  try {
    const rawData = {
      nip: formData.get("nip") as string,
      namaLengkap: formData.get("namaLengkap") as string,
      email: formData.get("email") as string,
    };

    const validatedData = guruSchema.parse(rawData);

    // 1. Cek duplikasi NIP
    const existingNip = await prisma.guru.findUnique({
      where: { nip: validatedData.nip },
    });
    if (existingNip) {
      return { success: false, error: "NIP sudah terdaftar" };
    }

    // 2. Cek duplikasi email
    const existingEmail = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    if (existingEmail) {
      return { success: false, error: "Email sudah digunakan" };
    }

    // 3. Hash password default
    const hashedPassword = await bcrypt.hash("guru123", 10);

    // 4. Buat User + Guru sekaligus (transaksi otomatis via nested create)
    await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.namaLengkap,
        password: hashedPassword,
        role: "GURU",
        guruProfile: {
          create: {
            nip: validatedData.nip,
            namaLengkap: validatedData.namaLengkap,
          },
        },
      },
    });

    revalidatePath("/guru");
    return { 
      success: true, 
      message: "Guru berhasil ditambahkan. Password default: guru123" 
    };
  } catch (error: any) {
    console.error("Error creating guru:", error);
    if (error.errors && Array.isArray(error.errors)) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Gagal menambahkan guru" };
  }
}

export async function updateGuru(id: string, formData: FormData) {
  try {
    const rawData = {
      nip: formData.get("nip") as string,
      namaLengkap: formData.get("namaLengkap") as string,
      email: formData.get("email") as string,
    };

    const validatedData = guruSchema.parse(rawData);

    // 1. Ambil data lama untuk mendapatkan userId
    const guruLama = await prisma.guru.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!guruLama) {
      return { success: false, error: "Data guru tidak ditemukan" };
    }

    // 2. Cek duplikasi NIP (kecuali diri sendiri)
    const existingNip = await prisma.guru.findFirst({
      where: { nip: validatedData.nip, id: { not: id } },
    });
    if (existingNip) {
      return { success: false, error: "NIP sudah digunakan guru lain" };
    }

    // 3. Cek duplikasi email (kecuali diri sendiri)
    const existingEmail = await prisma.user.findFirst({
      where: { email: validatedData.email, id: { not: guruLama.userId } },
    });
    if (existingEmail) {
      return { success: false, error: "Email sudah digunakan user lain" };
    }

    // 4. Update tabel Guru
    await prisma.guru.update({
      where: { id },
      data: {
        nip: validatedData.nip,
        namaLengkap: validatedData.namaLengkap,
      },
    });

    // 5. Update tabel User (sinkronisasi nama & email)
    await prisma.user.update({
      where: { id: guruLama.userId },
      data: {
        name: validatedData.namaLengkap,
        email: validatedData.email,
      },
    });

    revalidatePath("/guru");
    return { success: true, message: "Data guru berhasil diperbarui" };
  } catch (error: any) {
    console.error("Error updating guru:", error);
    if (error.errors && Array.isArray(error.errors)) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Gagal memperbarui data guru" };
  }
}

export async function deleteGuru(id: string) {
  try {
    // Ambil userId terlebih dahulu
    const guru = await prisma.guru.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!guru) {
      return { success: false, error: "Data guru tidak ditemukan" };
    }

    // Cek apakah guru ini adalah wali kelas
    const waliKelas = await prisma.kelas.findFirst({
      where: { waliKelasId: id },
    });

    if (waliKelas) {
      return { 
        success: false, 
        error: `Guru ini masih menjadi wali kelas ${waliKelas.nama}. Cabut penunjukan terlebih dahulu.` 
      };
    }

    // Hapus User (cascade akan hapus Guru)
    await prisma.user.delete({
      where: { id: guru.userId },
    });

    revalidatePath("/guru");
    return { success: true, message: "Guru berhasil dihapus" };
  } catch (error) {
    console.error("Error deleting guru:", error);
    return { success: false, error: "Gagal menghapus guru" };
  }
}

export async function resetPasswordGuru(id: string) {
  try {
    const guru = await prisma.guru.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!guru) {
      return { success: false, error: "Data guru tidak ditemukan" };
    }

    const hashedPassword = await bcrypt.hash("guru123", 10);

    await prisma.user.update({
      where: { id: guru.userId },
      data: { password: hashedPassword },
    });

    return { success: true, message: "Password berhasil direset ke: guru123" };
  } catch (error) {
    console.error("Error resetting password:", error);
    return { success: false, error: "Gagal mereset password" };
  }
}