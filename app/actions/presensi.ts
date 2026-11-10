"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const presensiSchema = z.object({
  siswaId: z.string().min(1, "Siswa wajib dipilih"),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  status: z.enum(["HADIR", "SAKIT", "IZIN", "ALPHA"]),
  keterangan: z.string().optional(),
});

export async function createPresensi(formData: FormData) {
  try {
    const rawData = {
      siswaId: formData.get("siswaId") as string,
      tanggal: formData.get("tanggal") as string,
      status: formData.get("status") as any,
      keterangan: formData.get("keterangan") as string | null,
    };

    const validatedData = presensiSchema.parse(rawData);
    const tanggalDate = new Date(validatedData.tanggal);

    const existingPresensi = await prisma.presensi.findUnique({
      where: {
        siswaId_tanggal: {
          siswaId: validatedData.siswaId,
          tanggal: tanggalDate,
        },
      },
    });

    if (existingPresensi) {
      await prisma.presensi.update({
        where: { id: existingPresensi.id },
        data: {
          status: validatedData.status,
          keterangan: validatedData.keterangan,
        },
      });
    } else {
      await prisma.presensi.create({
        data: {
          tanggal: tanggalDate,
          status: validatedData.status,
          keterangan: validatedData.keterangan,
          siswaId: validatedData.siswaId,
        },
      });
    }

    revalidatePath("/presensi");
    return { success: true, message: "Presensi berhasil disimpan" };
  } catch (error: any) {
    console.error("Error creating presensi:", error);
    if (error.errors && Array.isArray(error.errors)) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Gagal menyimpan presensi" };
  }
}

export async function bulkCreatePresensi(kelasId: string, tanggal: string, status: string) {
  try {
    const tanggalDate = new Date(tanggal);

    // 1. Tentukan kondisi filter: jika "all", ambil semua siswa. Jika tidak, filter berdasarkan kelasId
    const whereCondition: any = {};
    if (kelasId && kelasId !== "all") {
      whereCondition.kelasId = kelasId;
    }

    // 2. Ambil SEMUA siswa yang sesuai filter (bukan yang sudah ada presensinya)
    const siswaList = await prisma.siswa.findMany({
      where: whereCondition,
      select: { id: true },
    });

    if (siswaList.length === 0) {
      return { success: false, error: "Tidak ada siswa ditemukan. Pastikan Anda memilih kelas yang memiliki siswa." };
    }

    const siswaIds = siswaList.map((s) => s.id);

    // 3. Hapus presensi lama untuk tanggal & siswa tersebut (untuk mencegah duplikat)
    await prisma.presensi.deleteMany({
      where: {
        tanggal: tanggalDate,
        siswaId: { in: siswaIds },
      },
    });

    // 4. Buat presensi baru untuk semua siswa tersebut
    await prisma.presensi.createMany({
      data: siswaIds.map((siswaId) => ({
        tanggal: tanggalDate,
        status: status as any,
        siswaId,
      })),
    });

    revalidatePath("/presensi");
    return { success: true, message: `${siswaIds.length} data presensi berhasil disimpan` };
  } catch (error) {
    console.error("Error bulk creating presensi:", error);
    return { success: false, error: "Gagal menyimpan presensi massal" };
  }
}

export async function deletePresensi(id: string) {
  try {
    await prisma.presensi.delete({
      where: { id },
    });

    revalidatePath("/presensi");
    return { success: true, message: "Presensi berhasil dihapus" };
  } catch (error) {
    console.error("Error deleting presensi:", error);
    return { success: false, error: "Gagal menghapus presensi" };
  }
}

export async function getHeatmapDataAction(siswaId: string, bulan: number, tahun: number) {
  const startDate = new Date(tahun, bulan - 1, 1);
  const endDate = new Date(tahun, bulan, 0, 23, 59, 59, 999);

  const presensiList = await prisma.presensi.findMany({
    where: {
      siswaId,
      tanggal: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      tanggal: true,
      status: true,
    },
    orderBy: {
      tanggal: "asc",
    },
  });

  const heatmapData = new Map<string, string>();
  presensiList.forEach((p) => {
    const dateKey = new Date(p.tanggal).toISOString().split("T")[0];
    heatmapData.set(dateKey, p.status);
  });

  const stats = { HADIR: 0, SAKIT: 0, IZIN: 0, ALPHA: 0 };
  presensiList.forEach((p) => {
    if (stats[p.status as keyof typeof stats] !== undefined) {
      stats[p.status as keyof typeof stats]++;
    }
  });

  const totalHari = presensiList.length;
  const persentaseHadir = totalHari > 0 ? ((stats.HADIR / totalHari) * 100).toFixed(1) : "0";

  let currentStreak = 0;
  let longestStreak = 0;
  const sortedDates = Array.from(heatmapData.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  
  for (const [_, status] of sortedDates) {
    if (status === "HADIR") {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return {
    heatmapData,
    stats,
    totalHari,
    persentaseHadir,
    longestStreak,
  };
}