"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";

import { jadwalSchema, type JadwalFormData } from "@/lib/validations/jadwal";
import { createJadwal, updateJadwal } from "@/app/actions/jadwal";

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

type JadwalFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: any | null;
  kelasList: any[];
  mapelList: any[];
  guruList: any[];
};

export function JadwalForm({
  open,
  onOpenChange,
  editData,
  kelasList,
  mapelList,
  guruList,
}: JadwalFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<JadwalFormData>({
    resolver: zodResolver(jadwalSchema),
    defaultValues: {
      hari: editData?.hari ?? "SENIN",
      jamMulai: editData?.jamMulai ?? "07:00",
      jamSelesai: editData?.jamSelesai ?? "08:30",
      mapelId: editData?.mapelId ?? "",
      guruId: editData?.guruId ?? "",
      kelasId: editData?.kelasId ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        hari: editData?.hari ?? "SENIN",
        jamMulai: editData?.jamMulai ?? "07:00",
        jamSelesai: editData?.jamSelesai ?? "08:30",
        mapelId: editData?.mapelId ?? "",
        guruId: editData?.guruId ?? "",
        kelasId: editData?.kelasId ?? "",
      });
    } else {
      form.reset();
    }
  }, [open, editData, form]);

  function onSubmit(data: JadwalFormData) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("hari", data.hari);
      formData.append("jamMulai", data.jamMulai);
      formData.append("jamSelesai", data.jamSelesai);
      formData.append("mapelId", data.mapelId);
      formData.append("guruId", data.guruId);
      formData.append("kelasId", data.kelasId);

      let result;
      if (editData) {
        result = await updateJadwal(editData.id, formData);
      } else {
        result = await createJadwal(formData);
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
          <DialogTitle>{editData ? "Edit Jadwal" : "Tambah Jadwal Baru"}</DialogTitle>
          <DialogDescription>
            {editData ? "Perbarui jadwal pembelajaran." : "Isi form untuk menambahkan jadwal baru."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="hari"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hari</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih hari" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SENIN">Senin</SelectItem>
                      <SelectItem value="SELASA">Selasa</SelectItem>
                      <SelectItem value="RABU">Rabu</SelectItem>
                      <SelectItem value="KAMIS">Kamis</SelectItem>
                      <SelectItem value="JUMAT">Jumat</SelectItem>
                      <SelectItem value="SABTU">Sabtu</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="jamMulai"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jam Mulai</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jamSelesai"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jam Selesai</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="mapelId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mata Pelajaran</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih mata pelajaran" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mapelList.map((mapel) => (
                        <SelectItem key={mapel.id} value={mapel.id}>
                          {mapel.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guruId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guru Pengampu</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih guru" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {guruList.map((guru) => (
                        <SelectItem key={guru.id} value={guru.id}>
                          {guru.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Select onValueChange={field.onChange} value={field.value}>
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