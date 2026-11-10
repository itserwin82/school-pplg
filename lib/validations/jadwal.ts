import { z } from "zod";

export const jadwalSchema = z.object({
  hari: z.enum(["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"], {
    errorMap: () => ({ message: "Hari wajib dipilih" }),
  }),
  jamMulai: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format jam harus HH:MM"),
  jamSelesai: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format jam harus HH:MM"),
  mapelId: z.string().min(1, "Mata pelajaran wajib dipilih"),
  guruId: z.string().min(1, "Guru wajib dipilih"),
  kelasId: z.string().min(1, "Kelas wajib dipilih"),
}).refine((data) => data.jamMulai < data.jamSelesai, {
  message: "Jam selesai harus lebih besar dari jam mulai",
  path: ["jamSelesai"],
});

export type JadwalFormData = z.infer<typeof jadwalSchema>;