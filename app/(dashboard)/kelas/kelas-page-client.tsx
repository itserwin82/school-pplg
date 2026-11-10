"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KelasList } from "./kelas-list";
import { KelasForm } from "./kelas-form";

export function KelasPageClient({ kelasList, guruList }: { kelasList: any[]; guruList: any[] }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

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
      <div className="flex justify-end">
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Kelas
        </Button>
      </div>

      <KelasList kelasList={kelasList} onEdit={handleEdit} />

      <KelasForm
        open={isFormOpen}
        onOpenChange={handleClose}
        editData={editData}
        guruList={guruList}
      />
    </>
  );
}