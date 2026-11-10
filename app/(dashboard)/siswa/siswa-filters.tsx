"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SiswaFiltersProps = {
  kelasList: { id: string; nama: string }[];
};

export function SiswaFilters({ kelasList }: SiswaFiltersProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  function handleSearch(value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    router.push(`/siswa?${params.toString()}`);
  }

  function handleKelasFilter(value: string) {
    const params = new URLSearchParams(searchParams);
    if (value === "all") {
      params.delete("kelas");
    } else {
      params.set("kelas", value);
    }
    router.push(`/siswa?${params.toString()}`);
  }

  return (
    <div className="flex flex-1 flex-col gap-3 sm:flex-row">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari NIS atau nama..."
          defaultValue={searchParams.get("search") ?? ""}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select
        defaultValue={searchParams.get("kelas") ?? "all"}
        onValueChange={handleKelasFilter}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
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
  );
}