"use client";

import { useState } from "react";
import { Edit, Trash2, MoreVertical, Key, Mail } from "lucide-react";
import { toast } from "sonner";

import { deleteGuru, resetPasswordGuru } from "@/app/actions/guru";
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
  DropdownMenuSeparator,
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

type GuruListProps = {
  guruList: any[];
  onEdit: (item: any) => void;
};

export function GuruList({ guruList, onEdit }: GuruListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteId) return;
    setIsDeleting(true);
    const result = await deleteGuru(deleteId);
    setIsDeleting(false);

    if (result.success) toast.success(result.message);
    else toast.error(result.error);
    setDeleteId(null);
  }

  async function handleResetPassword(id: string) {
    const result = await resetPasswordGuru(id);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.error);
    }
  }

  if (guruList.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30">
        <p className="text-sm text-muted-foreground">
          Belum ada data guru. Klik tombol "Tambah Guru" untuk memulai.
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
              <TableHead>NIP</TableHead>
              <TableHead>Nama Lengkap</TableHead>
              <TableHead>Email Login</TableHead>
              <TableHead>Wali Kelas</TableHead>
              <TableHead>Jadwal Diampu</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guruList.map((guru) => (
              <TableRow key={guru.id}>
                <TableCell className="font-mono text-sm">{guru.nip}</TableCell>
                <TableCell className="font-medium">{guru.namaLengkap}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    {guru.user.email}
                  </div>
                </TableCell>
                <TableCell>
                  {guru.kelasWali ? (
                    <Badge variant="secondary">{guru.kelasWali.nama}</Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{guru.user._count.jadwalList} jadwal</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(guru)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleResetPassword(guru.id)}>
                        <Key className="mr-2 h-4 w-4" />
                        Reset Password
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteId(guru.id)}
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
              Data guru dan akun loginnya akan dihapus permanen. Pastikan guru ini tidak menjadi wali kelas atau pengampu jadwal.
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