"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { SiswaList } from "./siswa-list";
import { SiswaFilters } from "./siswa-filters";
import { SiswaForm } from "@/components/siswa/siswa-form";
import { Button } from "@/components/ui/button";

type SiswaPageClientProps = {
  siswaList: any[];
  kelasList: any[];
};

export function SiswaPageClient({ siswaList, kelasList }: SiswaPageClientProps) {
  // 1. State terpusat untuk modal dan data edit
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  // 2. Fungsi saat tombol "Tambah" diklik
  const handleAdd = () => {
    setEditData(null); // Pastikan null agar form tahu ini mode TAMBAH
    setIsFormOpen(true);
  };

  // 3. Fungsi saat tombol "Edit" di tabel diklik
  const handleEdit = (siswa: any) => {
    setEditData({
      id: siswa.id,
      nis: siswa.nis,
      namaLengkap: siswa.namaLengkap,
      kelasId: siswa.kelas?.id ?? "", 
    });
    setIsFormOpen(true); // Langsung buka modal
  };

  // 4. Fungsi saat modal ditutup (reset state)
  const handleClose = () => {
    setIsFormOpen(false);
    setEditData(null);
  };

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SiswaFilters kelasList={kelasList} />
        
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Siswa
        </Button>
      </div>

      <SiswaList siswaList={siswaList} onEdit={handleEdit} />

      <SiswaForm
        open={isFormOpen}
        onOpenChange={handleClose}
        kelasList={kelasList}
        editData={editData}
      />
    </>
  );
}