"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JadwalList } from "./jadwal-list";
import { JadwalForm } from "./jadwal-form";

export function JadwalPageClient({
  jadwalList,
  kelasList,
  mapelList,
  guruList,
  initialHari,
  initialKelas,
}: {
  jadwalList: any[];
  kelasList: any[];
  mapelList: any[];
  guruList: any[];
  initialHari?: string;
  initialKelas?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [hari, setHari] = useState(initialHari || "all");
  const [kelasId, setKelasId] = useState(initialKelas || "all");

  const handleHariChange = (value: string) => {
    setHari(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value !== "all") params.set("hari", value);
    else params.delete("hari");
    router.push(`/jadwal?${params.toString()}`);
  };

  const handleKelasChange = (value: string) => {
    setKelasId(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value !== "all") params.set("kelas", value);
    else params.delete("kelas");
    router.push(`/jadwal?${params.toString()}`);
  };

  const handleAdd = () => {
    setEditData(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditData(item);
    setIsFormOpen(true);
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setEditData(null);
  };

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Select value={hari} onValueChange={handleHariChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Semua Hari" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Hari</SelectItem>
              <SelectItem value="SENIN">Senin</SelectItem>
              <SelectItem value="SELASA">Selasa</SelectItem>
              <SelectItem value="RABU">Rabu</SelectItem>
              <SelectItem value="KAMIS">Kamis</SelectItem>
              <SelectItem value="JUMAT">Jumat</SelectItem>
              <SelectItem value="SABTU">Sabtu</SelectItem>
            </SelectContent>
          </Select>

          <Select value={kelasId} onValueChange={handleKelasChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Semua Kelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kelas</SelectItem>
              {kelasList.map((kelas) => (
                <SelectItem key={kelas.id} value={kelas.id}>
                  {kelas.nama}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Jadwal
        </Button>
      </div>

      <JadwalList jadwalList={jadwalList} onEdit={handleEdit} />

      <JadwalForm
        open={isFormOpen}
        onOpenChange={handleClose}
        editData={editData}
        kelasList={kelasList}
        mapelList={mapelList}
        guruList={guruList}
      />
    </>
  );
}