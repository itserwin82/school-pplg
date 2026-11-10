import { z } from "zod";

export const mapelSchema = z.object({
  kode: z.string().min(1, "Kode mapel wajib diisi").max(20, "Kode maksimal 20 karakter"),
  nama: z.string().min(3, "Nama mapel minimal 3 karakter").max(100, "Nama maksimal 100 karakter"),
  jamPelajaran: z.coerce.number().min(1, "Jam pelajaran minimal 1").max(20, "Maksimal 20 JP"),
});

export type MapelFormData = z.infer<typeof mapelSchema>;