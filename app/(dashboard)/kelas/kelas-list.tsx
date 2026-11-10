"use client";

import { useState } from "react";
import { Edit, Trash2, MoreVertical, User } from "lucide-react";
import { toast } from "sonner";

import { deleteKelas } from "@/app/actions/kelas";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

type KelasListProps = {
  kelasList: any[];
  onEdit: (item: any) => void;
};

export function KelasList({ kelasList, onEdit }: KelasListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteId) return;
    setIsDeleting(true);
    const result = await deleteKelas(deleteId);
    setIsDeleting(false);

    if (result.success) toast.success(result.message);
    else toast.error(result.error);
    setDeleteId(null);
  }

  if (kelasList.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30">
        <p className="text-sm text-muted-foreground">
          Belum ada kelas. Klik "Tambah Kelas" untuk memulai.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Kelas</TableHead>
              <TableHead>Tingkat</TableHead>
              <TableHead>Jurusan</TableHead>
              <TableHead>Wali Kelas</TableHead>
              <TableHead>Jumlah Siswa</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {kelasList.map((kelas) => (
              <TableRow key={kelas.id}>
                <TableCell className="font-medium">{kelas.nama}</TableCell>
                <TableCell>
                  <Badge variant="outline">{kelas.tingkat}</Badge>
                </TableCell>
                <TableCell>{kelas.jurusan}</TableCell>
                <TableCell>
                  {kelas.waliKelas ? (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{kelas.waliKelas.namaLengkap}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">Belum ditunjuk</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{kelas._count.siswaList} siswa</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(kelas)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteId(kelas.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Kelas ini akan dihapus permanen. Pastikan tidak ada siswa atau jadwal yang masih menggunakan kelas ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}