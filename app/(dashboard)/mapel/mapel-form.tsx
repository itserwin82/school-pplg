"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";

import { mapelSchema, type MapelFormData } from "@/lib/validations/mapel";
import { createMapel, updateMapel } from "@/app/actions/mapel";

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

type MapelFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: {
    id: string;
    kode: string;
    nama: string;
    jamPelajaran: number;
  } | null;
};

export function MapelForm({ open, onOpenChange, editData }: MapelFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<MapelFormData>({
    resolver: zodResolver(mapelSchema),
    defaultValues: {
      kode: editData?.kode ?? "",
      nama: editData?.nama ?? "",
      jamPelajaran: editData?.jamPelajaran ?? 4,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        kode: editData?.kode ?? "",
        nama: editData?.nama ?? "",
        jamPelajaran: editData?.jamPelajaran ?? 4,
      });
    } else {
      form.reset();
    }
  }, [open, editData, form]);

  function onSubmit(data: MapelFormData) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("kode", data.kode);
      formData.append("nama", data.nama);
      formData.append("jamPelajaran", String(data.jamPelajaran));

      let result;
      if (editData) {
        result = await updateMapel(editData.id, formData);
      } else {
        result = await createMapel(formData);
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
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran Baru"}</DialogTitle>
          <DialogDescription>
            {editData ? "Perbarui data mata pelajaran di bawah ini." : "Isi form untuk menambahkan mata pelajaran baru."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="kode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kode Mapel</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: PPLG-101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nama"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Mata Pelajaran</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Pemrograman Web" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jamPelajaran"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jam Pelajaran (JP) per Minggu</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={20} {...field} />
                  </FormControl>
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