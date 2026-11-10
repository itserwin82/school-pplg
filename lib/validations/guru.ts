import { z } from "zod";

export const guruSchema = z.object({
  nip: z.string().min(4, "NIP minimal 4 karakter").max(30, "NIP maksimal 30 karakter"),
  namaLengkap: z.string().min(3, "Nama minimal 3 karakter").max(100, "Nama maksimal 100 karakter"),
  email: z.string().email("Format email tidak valid").min(5, "Email minimal 5 karakter"),
});

export type GuruFormData = z.infer<typeof guruSchema>;