"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { jadwalSchema } from "@/lib/validations/jadwal";

export async function createJadwal(formData: FormData) {
  try {
    const rawData = {
      hari: formData.get("hari") as string,
      jamMulai: formData.get("jamMulai") as string,
      jamSelesai: formData.get("jamSelesai") as string,
      mapelId: formData.get("mapelId") as string,
      guruId: formData.get("guruId") as string,
      kelasId: formData.get("kelasId") as string,
    };

    const validatedData = jadwalSchema.parse(rawData);

    // Cek bentrok jadwal di kelas yang sama
    const existingJadwal = await prisma.jadwal.findFirst({
      where: {
        kelasId: validatedData.kelasId,
        hari: validatedData.hari,
        OR: [
          {
            jamMulai: { lte: validatedData.jamMulai },
            jamSelesai: { gt: validatedData.jamMulai },
          },
          {
            jamMulai: { lt: validatedData.jamSelesai },
            jamSelesai: { gte: validatedData.jamSelesai },
          },
        ],
      },
    });

    if (existingJadwal) {
      return { success: false, error: "Jadwal bentrok dengan jadwal lain di kelas ini pada hari yang sama" };
    }

    await prisma.jadwal.create({
      data: validatedData,
    });

    revalidatePath("/jadwal");
    return { success: true, message: "Jadwal berhasil ditambahkan" };
  } catch (error: any) {
    console.error("Error creating jadwal:", error);
    if (error.errors && Array.isArray(error.errors)) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Gagal menambahkan jadwal" };
  }
}

export async function updateJadwal(id: string, formData: FormData) {
  try {
    const rawData = {
      hari: formData.get("hari") as string,
      jamMulai: formData.get("jamMulai") as string,
      jamSelesai: formData.get("jamSelesai") as string,
      mapelId: formData.get("mapelId") as string,
      guruId: formData.get("guruId") as string,
      kelasId: formData.get("kelasId") as string,
    };

    const validatedData = jadwalSchema.parse(rawData);

    // Cek bentrok (kecuali diri sendiri)
    const existingJadwal = await prisma.jadwal.findFirst({
      where: {
        kelasId: validatedData.kelasId,
        hari: validatedData.hari,
        id: { not: id },
        OR: [
          {
            jamMulai: { lte: validatedData.jamMulai },
            jamSelesai: { gt: validatedData.jamMulai },
          },
          {
            jamMulai: { lt: validatedData.jamSelesai },
            jamSelesai: { gte: validatedData.jamSelesai },
          },
        ],
      },
    });

    if (existingJadwal) {
      return { success: false, error: "Jadwal bentrok dengan jadwal lain di kelas ini" };
    }

    await prisma.jadwal.update({
      where: { id },
      data: validatedData,
    });

    revalidatePath("/jadwal");
    return { success: true, message: "Jadwal berhasil diperbarui" };
  } catch (error: any) {
    console.error("Error updating jadwal:", error);
    if (error.errors && Array.isArray(error.errors)) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Gagal memperbarui jadwal" };
  }
}

export async function deleteJadwal(id: string) {
  try {
    await prisma.jadwal.delete({ where: { id } });
    revalidatePath("/jadwal");
    return { success: true, message: "Jadwal berhasil dihapus" };
  } catch (error) {
    console.error("Error deleting jadwal:", error);
    return { success: false, error: "Gagal menghapus jadwal" };
  }
}