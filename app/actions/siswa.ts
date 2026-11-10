"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs"; // ✅ PASTIKAN INI ADA

// 1. Validasi Schema
const siswaSchema = z.object({
  nis: z.string().min(1, "NIS wajib diisi").max(50, "NIS maksimal 50 karakter"),
  namaLengkap: z.string().min(3, "Nama minimal 3 karakter").max(100, "Nama maksimal 100 karakter"),
  kelasId: z.string().min(1, "Kelas wajib dipilih"),
});

// 2. Tambah Siswa Baru (dengan Auto-Create Akun Login)
export async function createSiswa(formData: FormData) {
  try {
    const rawData = {
      nis: formData.get("nis") as string,
      namaLengkap: formData.get("namaLengkap") as string,
      kelasId: formData.get("kelasId") as string,
    };

    const validatedData = siswaSchema.parse(rawData);

    // Cek duplikasi NIS
    const existingNis = await prisma.siswa.findUnique({
      where: { nis: validatedData.nis },
    });
    if (existingNis) {
      return { success: false, error: "NIS sudah terdaftar" };
    }

    // Buat Email default dari NIS (contoh: 12345@smkpplg.sch.id)
    const defaultEmail = `${validatedData.nis}@smkpplg.sch.id`;
    
    // Cek apakah email sudah dipakai
    const existingEmail = await prisma.user.findUnique({
      where: { email: defaultEmail },
    });
    if (existingEmail) {
      return { success: false, error: "Akun dengan NIS ini sudah ada" };
    }

    // Hash password default
    const hashedPassword = await bcrypt.hash("siswa123", 10);

    // Buat User + Siswa sekaligus (Nested Create)
    await prisma.user.create({
      data: {
        email: defaultEmail,
        name: validatedData.namaLengkap,
        password: hashedPassword,
        role: "SISWA",
        siswaProfile: {
          create: {
            nis: validatedData.nis,
            namaLengkap: validatedData.namaLengkap,
            kelasId: validatedData.kelasId,
          },
        },
      },
    });

    revalidatePath("/siswa");
    return { 
      success: true, 
      message: `Siswa berhasil ditambahkan. Email login: ${defaultEmail}, Password: siswa123` 
    };
  } catch (error: any) {
    // ✅ PERBAIKAN: Log error detail ke terminal agar kita tahu penyebab pastinya
    console.error("❌ [CREATE SISWA] Error detail:", error);
    
    // Handle Zod validation errors dengan benar (gunakan .issues)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    
    return { success: false, error: error.message || "Gagal menambahkan siswa" };
  }
}

// 3. Update Siswa
export async function updateSiswa(id: string, formData: FormData) {
  try {
    const rawData = {
      nis: formData.get("nis") as string,
      namaLengkap: formData.get("namaLengkap") as string,
      kelasId: formData.get("kelasId") as string,
    };

    const validatedData = siswaSchema.parse(rawData);

    // Cek duplikasi NIS (kecuali diri sendiri)
    const existingNis = await prisma.siswa.findFirst({
      where: { nis: validatedData.nis, id: { not: id } },
    });
    if (existingNis) {
      return { success: false, error: "NIS sudah digunakan siswa lain" };
    }

    // Update data Siswa
    await prisma.siswa.update({
      where: { id },
      data: {
        nis: validatedData.nis,
        namaLengkap: validatedData.namaLengkap,
        kelasId: validatedData.kelasId,
      },
    });

    // Sinkronisasi nama di tabel User (opsional tapi bagus untuk konsistensi)
    const siswaLama = await prisma.siswa.findUnique({ where: { id }, select: { userId: true } });
    if (siswaLama?.userId) {
      await prisma.user.update({
        where: { id: siswaLama.userId },
        data: { name: validatedData.namaLengkap },
      });
    }

    revalidatePath("/siswa");
    return { success: true, message: "Data siswa berhasil diperbarui" };
  } catch (error: any) {
    console.error("❌ [UPDATE SISWA] Error detail:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: error.message || "Gagal memperbarui data siswa" };
  }
}

// 4. Hapus Siswa
export async function deleteSiswa(id: string) {
  try {
    // Ambil userId terlebih dahulu
    const siswa = await prisma.siswa.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!siswa) {
      return { success: false, error: "Data siswa tidak ditemukan" };
    }

    // Hapus User (cascade akan otomatis menghapus data Siswa karena onDelete: Cascade di schema)
    await prisma.user.delete({
      where: { id: siswa.userId },
    });

    revalidatePath("/siswa");
    return { success: true, message: "Siswa berhasil dihapus" };
  } catch (error: any) {
    console.error("❌ [DELETE SISWA] Error detail:", error);
    return { success: false, error: error.message || "Gagal menghapus siswa. Pastikan tidak ada data presensi yang mengunci." };
  }
}