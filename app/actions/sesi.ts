"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { randomBytes } from "crypto";

// Generate token QR unik (16 karakter alphanumerik)
function generateQrToken(): string {
  return randomBytes(8).toString("hex").toUpperCase();
}

// 1. Buat sesi baru dari jadwal (otomatis untuk hari ini)
export async function createSesiFromJadwal(jadwalId: string, tanggal: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id || "system";

    console.log("🔍 [CREATE SESI] Jadwal ID:", jadwalId);
    console.log("🔍 [CREATE SESI] Tanggal:", tanggal);
    console.log("🔍 [CREATE SESI] User ID:", userId);

    const tanggalDate = new Date(tanggal);
    tanggalDate.setHours(0, 0, 0, 0); // Normalize ke tengah malam

    // Cek duplikasi
    const existing = await prisma.sesiPembelajaran.findFirst({
      where: {
        jadwalId,
        tanggal: tanggalDate,
      },
    });

    if (existing) {
      return { 
        success: false, 
        error: "Sesi untuk jadwal ini sudah ada di tanggal tersebut. Silakan klik 'Mulai Sesi' pada kartu yang sudah ada." 
      };
    }

    // Ambil data jadwal
    const jadwal = await prisma.jadwal.findUnique({
      where: { id: jadwalId },
      select: { jamMulai: true, jamSelesai: true, kelasId: true },
    });

    if (!jadwal) {
      return { success: false, error: "Jadwal tidak ditemukan" };
    }

    // Buat sesi baru
    const sesi = await prisma.sesiPembelajaran.create({
      data: {
        tanggal: tanggalDate,
        jamMulai: jadwal.jamMulai,
        jamSelesai: jadwal.jamSelesai,
        status: "BELUM_DIMULAI",
        jadwalId,
      },
    });

    console.log("✅ [CREATE SESI] Sesi berhasil dibuat:", sesi.id);

    // Auto-create presensi untuk semua siswa
    const siswaList = await prisma.siswa.findMany({
      where: { kelasId: jadwal.kelasId },
      select: { id: true },
    });

    console.log("🔍 [CREATE SESI] Jumlah siswa di kelas:", siswaList.length);

    if (siswaList.length > 0) {
      await prisma.presensiDetail.createMany({
        data: siswaList.map((siswa) => ({
          sesiId: sesi.id,
          siswaId: siswa.id,
          status: "ALPHA",
          source: "SYSTEM",
          createdBy: userId,
        })),
      });
    }

    revalidatePath("/sesi");
    return { success: true, message: "Sesi berhasil dibuat" };
  } catch (error) {
    console.error("❌ Error creating sesi:", error);
    return { success: false, error: "Gagal membuat sesi. Lihat console untuk detail." };
  }
}

// 2. Mulai sesi (generate QR Code)
export async function mulaiSesi(sesiId: string, durasiMenit: number = 15) {
  try {
    const qrToken = generateQrToken();
    const qrExpiredAt = new Date(Date.now() + durasiMenit * 60 * 1000);

    await prisma.sesiPembelajaran.update({
      where: { id: sesiId },
      data: {
        status: "BERLANGSUNG",
        qrToken,
        qrExpiredAt,
      },
    });

    revalidatePath("/sesi");
    return { 
      success: true, 
      message: "Sesi dimulai. QR Code aktif selama " + durasiMenit + " menit",
      qrToken,
      qrExpiredAt: qrExpiredAt.toISOString(),
    };
  } catch (error) {
    console.error("Error starting sesi:", error);
    return { success: false, error: "Gagal memulai sesi" };
  }
}

// 3. Tutup sesi
export async function tutupSesi(sesiId: string) {
  try {
    await prisma.sesiPembelajaran.update({
      where: { id: sesiId },
      data: {
        status: "SELESAI",
        qrToken: null,
        qrExpiredAt: null,
      },
    });

    revalidatePath("/sesi");
    return { success: true, message: "Sesi berhasil ditutup" };
  } catch (error) {
    console.error("Error closing sesi:", error);
    return { success: false, error: "Gagal menutup sesi" };
  }
}

// 4. Update presensi siswa (override manual oleh guru)
export async function updatePresensiSiswa(
  sesiId: string,
  siswaId: string,
  status: string,
  keterangan?: string
) {
  try {
    const session = await auth();
    
    await prisma.presensiDetail.update({
      where: {
        sesiId_siswaId: {
          sesiId,
          siswaId,
        },
      },
      data: {
        status: status as any,
        keterangan: keterangan || null,
        source: "MANUAL_GURU",
        createdBy: session?.user?.id || "system",
        updatedAt: new Date(),
      },
    });

    revalidatePath("/sesi");
    return { success: true, message: "Status presensi berhasil diperbarui" };
  } catch (error) {
    console.error("❌ Error updating presensi:", error);
    return { success: false, error: "Gagal memperbarui presensi" };
  }
}

// 5. Scan QR Code oleh siswa
export async function scanQrPresensi(qrToken: string) {
  try {
    console.log("\n🔍 ========== [SCAN QR] DIMULAI ==========");
    console.log("🔍 [SCAN QR] Token diterima:", qrToken);
    
    const session = await auth();
    console.log("🔍 [SCAN QR] Session:", session ? "Ada" : "Tidak ada");
    console.log("🔍 [SCAN QR] User ID:", session?.user?.id);
    console.log("🔍 [SCAN QR] User Role:", session?.user?.role);
    console.log("🔍 [SCAN QR] User Email:", session?.user?.email);
    
    if (!session?.user?.id) {
      console.log("❌ [SCAN QR] User tidak login");
      return { success: false, error: "Anda harus login terlebih dahulu" };
    }

    // Cari sesi berdasarkan QR token
    const sesi = await prisma.sesiPembelajaran.findUnique({
      where: { qrToken },
      include: {
        jadwal: {
          include: {
            mapel: true,
            kelas: true,
          },
        },
      },
    });

    console.log("🔍 [SCAN QR] Sesi ditemukan:", sesi ? "Ya" : "Tidak");
    if (!sesi) {
      return { success: false, error: "QR Code tidak valid atau sesi tidak ditemukan" };
    }

    // Cek status sesi
    if (sesi.status !== "BERLANGSUNG") {
      console.log("❌ [SCAN QR] Status sesi:", sesi.status);
      return { success: false, error: "Sesi tidak sedang berlangsung" };
    }

    // Cek apakah QR masih aktif
    if (sesi.qrExpiredAt && new Date() > new Date(sesi.qrExpiredAt)) {
      console.log("❌ [SCAN QR] QR sudah expired");
      return { success: false, error: "QR Code sudah kadaluarsa. Minta guru untuk generate QR baru." };
    }

    // ✅ PERBAIKAN: Cari profil siswa dengan 2 cara (lebih robust)
    let siswaProfile = null;
    
    // Cara 1: Cari berdasarkan userId langsung
    siswaProfile = await prisma.siswa.findFirst({
      where: { userId: session.user.id },
      include: { kelas: true },
    });

    // Cara 2: Jika tidak ketemu, cari berdasarkan email/name (fallback)
    if (!siswaProfile) {
      console.log("⚠️ [SCAN QR] Siswa tidak ditemukan via userId, coba via email");
      siswaProfile = await prisma.siswa.findFirst({
        where: {
          user: { email: session.user.email }
        },
        include: { kelas: true },
      });
    }

    console.log("🔍 [SCAN QR] Profil siswa:", siswaProfile ? siswaProfile.namaLengkap : "TIDAK DITEMUKAN");

    if (!siswaProfile) {
      return { 
        success: false, 
        error: "Akun Anda tidak terdaftar sebagai siswa. Hubungi admin untuk menghubungkan akun dengan data siswa." 
      };
    }

    // Cek apakah siswa ada di kelas yang benar
    if (siswaProfile.kelasId !== sesi.jadwal.kelasId) {
      console.log("❌ [SCAN QR] Kelas tidak cocok");
      console.log("   Kelas siswa:", siswaProfile.kelas.nama);
      console.log("   Kelas sesi:", sesi.jadwal.kelas.nama);
      return { 
        success: false, 
        error: `Anda bukan siswa kelas ${sesi.jadwal.kelas.nama}. QR ini untuk kelas lain.` 
      };
    }

    // Cek apakah sudah ada presensi untuk siswa ini di sesi ini
    const existingPresensi = await prisma.presensiDetail.findUnique({
      where: {
        sesiId_siswaId: {
          sesiId: sesi.id,
          siswaId: siswaProfile.id,
        },
      },
    });

    if (!existingPresensi) {
      console.log("❌ [SCAN QR] PresensiDetail belum ada untuk siswa ini");
      return { 
        success: false, 
        error: "Data presensi Anda belum dibuat di sesi ini. Hubungi guru untuk sinkronisasi." 
      };
    }

    if (existingPresensi.status === "HADIR") {
      console.log("ℹ️ [SCAN QR] Siswa sudah presensi sebelumnya");
      
      // Format waktu scan sebelumnya
      const waktuScanFormatted = existingPresensi.waktuScan 
        ? new Date(existingPresensi.waktuScan).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : null;

      return {
        success: true,
        alreadyScanned: true, // ✅ Flag khusus untuk UI
        message: "Anda telah melakukan presensi di sesi ini.",
        waktuScan: waktuScanFormatted,
        mapel: sesi.jadwal.mapel?.nama,
      };
    }

    // Update presensi siswa
    await prisma.presensiDetail.update({
      where: {
        sesiId_siswaId: {
          sesiId: sesi.id,
          siswaId: siswaProfile.id,
        },
      },
      data: {
        status: "HADIR",
        waktuScan: new Date(),
        source: "QR_SCAN",
      },
    });

    console.log("✅ [SCAN QR] Presensi berhasil untuk:", siswaProfile.namaLengkap);

    return { 
      success: true,
      alreadyScanned: false, // ✅ Flag baru
      message: `Presensi tercatat pada ${new Date().toLocaleTimeString("id-ID")}`,
      mapel: sesi.jadwal.mapel?.nama,
    };
  } catch (error) {
    console.error("💥 [SCAN QR] CRITICAL ERROR:", error);
    return { success: false, error: "Gagal memproses scan QR. Silakan coba lagi." };
  }
}

// 6. Ambil detail sesi (Server Action agar bisa dipanggil dari Client Component)
export async function getSesiDetailAction(sesiId: string) {
  try {
    const sesi = await prisma.sesiPembelajaran.findUnique({
      where: { id: sesiId },
      include: {
        jadwal: {
          include: {
            mapel: true,
            kelas: {
              include: {
                _count: { select: { siswaList: true } }, // ✅ TAMBAHKAN INI
              },
            },
            guru: true,
          },
        },
        presensiDetail: {
          include: {
            siswa: {
              include: { kelas: true },
            },
          },
          orderBy: {
            siswa: { namaLengkap: "asc" },
          },
        },
      },
    });
    return sesi;
  } catch (error) {
    console.error("❌ Error fetching sesi detail:", error);
    return null;
  }
}

// 7. Sinkronisasi siswa di sesi dengan siswa di kelas
// Memastikan setiap siswa di kelas memiliki PresensiDetail di sesi ini
export async function sinkronisasiSiswaSesi(sesiId: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id || "system";

    // Ambil sesi beserta jadwal dan kelasnya
    const sesi = await prisma.sesiPembelajaran.findUnique({
      where: { id: sesiId },
      include: {
        jadwal: { select: { kelasId: true } },
        presensiDetail: { select: { siswaId: true } },
      },
    });

    if (!sesi) {
      return { success: false, error: "Sesi tidak ditemukan" };
    }

    // Ambil semua siswa di kelas tersebut
    const semuaSiswa = await prisma.siswa.findMany({
      where: { kelasId: sesi.jadwal.kelasId },
      select: { id: true },
    });

    // Ambil ID siswa yang sudah ada di sesi
    const siswaYangSudahAda = new Set(sesi.presensiDetail.map(p => p.siswaId));

    // Temukan siswa yang BELUM ada di sesi
    const siswaBaru = semuaSiswa.filter(s => !siswaYangSudahAda.has(s.id));

    if (siswaBaru.length === 0) {
      return { 
        success: true, 
        message: "Semua siswa sudah tersinkronisasi",
        added: 0,
      };
    }

    // Buat PresensiDetail untuk siswa baru (default ALPHA)
    await prisma.presensiDetail.createMany({
      data: siswaBaru.map(siswa => ({
        sesiId,
        siswaId: siswa.id,
        status: "ALPHA",
        source: "SYSTEM",
        createdBy: userId,
      })),
    });

    console.log(`✅ [SYNC] ${siswaBaru.length} siswa baru ditambahkan ke sesi`);

    revalidatePath("/sesi");
    return { 
      success: true, 
      message: `${siswaBaru.length} siswa berhasil ditambahkan ke sesi`,
      added: siswaBaru.length,
    };
  } catch (error) {
    console.error("❌ Error syncing siswa:", error);
    return { success: false, error: "Gagal sinkronisasi siswa" };
  }
}

// 8. Regenerate QR Code untuk sesi yang sedang berlangsung
export async function regenerateQrCode(sesiId: string, durasiMenit: number = 15) {
  try {
    console.log("🔄 [REGENERATE] Sesi ID:", sesiId, "Durasi:", durasiMenit, "menit");
    
    // Validasi sesi
    const sesi = await prisma.sesiPembelajaran.findUnique({
      where: { id: sesiId },
    });

    if (!sesi) {
      return { success: false, error: "Sesi tidak ditemukan" };
    }

    if (sesi.status !== "BERLANGSUNG") {
      return { success: false, error: "QR hanya bisa di-generate untuk sesi yang sedang berlangsung" };
    }

    // Generate token baru
    const qrToken = generateQrToken();
    const qrExpiredAt = new Date(Date.now() + durasiMenit * 60 * 1000);

    await prisma.sesiPembelajaran.update({
      where: { id: sesiId },
      data: {
        qrToken,
        qrExpiredAt,
      },
    });

    console.log("✅ [REGENERATE] QR baru berhasil di-generate:", qrToken);

    revalidatePath("/sesi");
    return {
      success: true,
      message: `QR Code baru berhasil di-generate. Berlaku ${durasiMenit} menit.`,
      qrToken,
      qrExpiredAt: qrExpiredAt.toISOString(),
    };
  } catch (error) {
    console.error("❌ Error regenerating QR:", error);
    return { success: false, error: "Gagal generate QR baru" };
  }
}