import { z } from "zod";

export const siswaSchema = z.object({
  nis: z
    .string()
    .min(1, "NIS wajib diisi")
    .regex(/^\d+$/, "NIS harus berupa angka"),
  namaLengkap: z
    .string()
    .min(3, "Nama minimal 3 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  kelasId: z.string().min(1, "Kelas wajib dipilih"),
});

export type SiswaFormData = z.infer<typeof siswaSchema>;