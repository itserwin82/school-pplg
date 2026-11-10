"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";

import { guruSchema, type GuruFormData } from "@/lib/validations/guru";
import { createGuru, updateGuru } from "@/app/actions/guru";

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

type GuruFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: {
    id: string;
    nip: string;
    namaLengkap: string;
    email?: string;
  } | null;
};

export function GuruForm({ open, onOpenChange, editData }: GuruFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<GuruFormData>({
    resolver: zodResolver(guruSchema),
    defaultValues: {
      nip: editData?.nip ?? "",
      namaLengkap: editData?.namaLengkap ?? "",
      email: editData?.email ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        nip: editData?.nip ?? "",
        namaLengkap: editData?.namaLengkap ?? "",
        email: editData?.email ?? "",
      });
    } else {
      form.reset();
    }
  }, [open, editData, form]);

  function onSubmit(data: GuruFormData) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("nip", data.nip);
      formData.append("namaLengkap", data.namaLengkap);
      formData.append("email", data.email);

      let result;
      if (editData) {
        result = await updateGuru(editData.id, formData);
      } else {
        result = await createGuru(formData);
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
          <DialogTitle>{editData ? "Edit Data Guru" : "Tambah Guru Baru"}</DialogTitle>
          <DialogDescription>
            {editData 
              ? "Perbarui data guru dan email login." 
              : "Isi form untuk menambahkan guru baru. Akun login akan otomatis dibuat dengan password default: guru123"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIP (Nomor Induk Pegawai)</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: 198501012010011001" {...field} />
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
                    <Input placeholder="Contoh: Budi Santoso, S.Pd." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (untuk Login)</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Contoh: budi@smkpplg.sch.id" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!editData && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
                <p className="font-semibold">ℹ️ Informasi:</p>
                <p className="mt-1">
                  Akun login akan otomatis dibuat dengan password default <strong>guru123</strong>. 
                  Guru dapat mengubah password setelah login pertama.
                </p>
              </div>
            )}

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