"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, Trash2, MoreVertical, Calendar } from "lucide-react";
import { toast } from "sonner";
import { ZodError } from "zod";

import { deleteSiswa } from "@/app/actions/siswa";
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

type SiswaListProps = {
  siswaList: {
    id: string;
    nis: string;
    namaLengkap: string;
    createdAt: Date;
    kelas: {
      id : string;
      nama: string;
      jurusan: string;
    };
  }[];
  onEdit: (siswa: { id: string; nis: string; namaLengkap: string; kelasId: string }) => void;
};

export function SiswaList({ siswaList, onEdit }: SiswaListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteId) return;

    setIsDeleting(true);
    const result = await deleteSiswa(deleteId);
    setIsDeleting(false);

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.error);
    }

    setDeleteId(null);
  }

  if (siswaList.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30">
        <p className="text-sm text-muted-foreground">
          Belum ada data siswa. Klik tombol "Tambah Siswa" untuk memulai.
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
              <TableHead>NIS</TableHead>
              <TableHead>Nama Lengkap</TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead>Tanggal Daftar</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {siswaList.map((siswa) => (
              <TableRow key={siswa.id}>
                <TableCell className="font-mono text-sm">{siswa.nis}</TableCell>
                <TableCell className="font-medium">{siswa.namaLengkap}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{siswa.kelas?.nama ?? "Tanpa Kelas"}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Intl.DateTimeFormat("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }).format(siswa.createdAt)}
                </TableCell>
                <TableCell>
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {/* ✅ TAMBAHKAN INI: Link langsung ke halaman detail/heatmap siswa */}
                      <Link href={`/siswa/${siswa.id}`}>
                        <DropdownMenuItem>
                          <Calendar className="mr-2 h-4 w-4" />
                          Riwayat Presensi
                        </DropdownMenuItem>
                      </Link>

                      <DropdownMenuItem onClick={() => onEdit({
                        id: siswa.id,
                        nis: siswa.nis,
                        namaLengkap: siswa.namaLengkap,
                        kelasId: siswa.kelas?.id ?? "",
                      })}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem
                        onClick={() => setDeleteId(siswa.id)}
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
              Tindakan ini tidak dapat dibatalkan. Data siswa akan dihapus
              permanen dari sistem.
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