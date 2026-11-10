import { z } from "zod";

export const kelasSchema = z.object({
  nama: z.string().min(3, "Nama kelas minimal 3 karakter").max(50),
  tingkat: z.enum(["X", "XI", "XII"], {
    errorMap: () => ({ message: "Tingkat wajib dipilih" }),
  }),
  jurusan: z.string().min(1, "Jurusan wajib diisi"),
  waliKelasId: z.string().optional().nullable(),
});

export type KelasFormData = z.infer<typeof kelasSchema>;