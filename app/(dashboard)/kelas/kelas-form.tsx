"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useEffect } from "react";
import { toast } from "sonner";

import { kelasSchema, type KelasFormData } from "@/lib/validations/kelas";
import { createKelas, updateKelas } from "@/app/actions/kelas";

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

type KelasFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: any | null;
  guruList: any[];
};

export function KelasForm({ open, onOpenChange, editData, guruList }: KelasFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<KelasFormData>({
    resolver: zodResolver(kelasSchema),
    defaultValues: {
      nama: editData?.nama ?? "",
      tingkat: editData?.tingkat ?? "X",
      jurusan: editData?.jurusan ?? "PPLG",
      waliKelasId: editData?.waliKelasId ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        nama: editData?.nama ?? "",
        tingkat: editData?.tingkat ?? "X",
        jurusan: editData?.jurusan ?? "PPLG",
        waliKelasId: editData?.waliKelasId ?? "",
      });
    } else {
      form.reset();
    }
  }, [open, editData, form]);

  function onSubmit(data: KelasFormData) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("nama", data.nama);
      formData.append("tingkat", data.tingkat);
      formData.append("jurusan", data.jurusan);
      formData.append("waliKelasId", data.waliKelasId || "");

      let result;
      if (editData) {
        result = await updateKelas(editData.id, formData);
      } else {
        result = await createKelas(formData);
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
          <DialogTitle>{editData ? "Edit Kelas" : "Tambah Kelas Baru"}</DialogTitle>
          <DialogDescription>
            {editData ? "Perbarui data kelas dan wali kelas." : "Isi form untuk menambahkan kelas baru."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nama"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Kelas</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: X PPLG 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tingkat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tingkat</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tingkat" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="X">X (Sepuluh)</SelectItem>
                        <SelectItem value="XI">XI (Sebelas)</SelectItem>
                        <SelectItem value="XII">XII (Dua Belas)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jurusan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jurusan</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: PPLG" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="waliKelasId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wali Kelas (Opsional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih wali kelas (opsional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Belum ditunjuk</SelectItem>
                      {guruList.map((guru) => (
                        <SelectItem key={guru.id} value={guru.id}>
                          {guru.namaLengkap}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
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