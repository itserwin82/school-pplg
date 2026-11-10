"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition, useEffect } from "react"; // <-- useEffect sudah di-import
import { toast } from "sonner";

import { siswaSchema, type SiswaFormData } from "@/lib/validations/siswa";
import { createSiswa, updateSiswa } from "@/app/actions/siswa";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SiswaFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kelasList: { id: string; nama: string }[];
  editData?: {
    id: string;
    nis: string;
    namaLengkap: string;
    kelasId: string;
  } | null;
};

export function SiswaForm({
  open,
  onOpenChange,
  kelasList,
  editData,
}: SiswaFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<SiswaFormData>({
    resolver: zodResolver(siswaSchema),
    defaultValues: {
      nis: editData?.nis ?? "",
      namaLengkap: editData?.namaLengkap ?? "",
      kelasId: editData?.kelasId ?? "",
    },
  });

  // ✅ PERBAIKAN 1: Tambahkan useEffect ini agar form ter-reset saat modal dibuka/ditutup atau data edit berubah
  useEffect(() => {
    if (open) {
      form.reset({
        nis: editData?.nis ?? "",
        namaLengkap: editData?.namaLengkap ?? "",
        kelasId: editData?.kelasId ?? "",
      });
    } else {
      form.reset(); // Bersihkan form saat modal ditutup
    }
  }, [open, editData, form]);

  function onSubmit(data: SiswaFormData) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("nis", data.nis);
      formData.append("namaLengkap", data.namaLengkap);
      formData.append("kelasId", data.kelasId);

      let result;
      if (editData) {
        result = await updateSiswa(editData.id, formData);
      } else {
        result = await createSiswa(formData);
      }

      if (result.success) {
        toast.success(result.message);
        form.reset();
        onOpenChange(false);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit Siswa" : "Tambah Siswa Baru"}</DialogTitle>
          <DialogDescription>
            {editData
              ? "Perbarui data siswa di bawah ini."
              : "Isi form di bawah untuk menambahkan siswa baru."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIS (Nomor Induk Siswa)</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: 2023001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="namaLengkap"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Andi Pratama" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="kelasId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kelas</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value} // ✅ PERBAIKAN 2: Gunakan 'value' bukan 'defaultValue' agar reaktif terhadap form.reset()
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kelas" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {kelasList.map((kelas) => (
                        <SelectItem key={kelas.id} value={kelas.id}>
                          {kelas.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Menyimpan..." : editData ? "Perbarui" : "Tambah"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}