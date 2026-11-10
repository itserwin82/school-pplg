"use client";

import { useState } from "react";
import { Calendar, TrendingUp, Award } from "lucide-react";

type HeatmapCalendarProps = {
  heatmapData: Map<string, string>;
  bulan: number;
  tahun: number;
  stats: {
    HADIR: number;
    SAKIT: number;
    IZIN: number;
    ALPHA: number;
  };
  totalHari: number;
  persentaseHadir: string;
  longestStreak: number;
};

const BULAN_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const HARI_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function getStatusColor(status: string | undefined): string {
  if (!status) return "bg-muted/30";
  switch (status) {
    case "HADIR": return "bg-emerald-500 hover:bg-emerald-600";
    case "SAKIT": return "bg-yellow-500 hover:bg-yellow-600";
    case "IZIN": return "bg-blue-500 hover:bg-blue-600";
    case "ALPHA": return "bg-red-500 hover:bg-red-600";
    default: return "bg-muted/30";
  }
}

function getStatusLabel(status: string | undefined): string {
  if (!status) return "Tidak ada data";
  switch (status) {
    case "HADIR": return "Hadir";
    case "SAKIT": return "Sakit";
    case "IZIN": return "Izin";
    case "ALPHA": return "Alpha";
    default: return "Tidak ada data";
  }
}

export function HeatmapCalendar({
  heatmapData,
  bulan,
  tahun,
  stats,
  totalHari,
  persentaseHadir,
  longestStreak,
}: HeatmapCalendarProps) {
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // Hitung jumlah hari dalam bulan
  const daysInMonth = new Date(tahun, bulan, 0).getDate();
  
  // Hitung hari pertama bulan (0 = Minggu, 1 = Senin, dst)
  const firstDayOfMonth = new Date(tahun, bulan - 1, 1).getDay();

  // Buat array untuk grid kalender
  const calendarDays = [];
  
  // Tambahkan slot kosong untuk hari sebelum tanggal 1
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  
  // Tambahkan hari-hari dalam bulan
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${tahun}-${String(bulan).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const status = heatmapData.get(dateStr);
    calendarDays.push({ day, dateStr, status });
  }

  return (
    <div className="space-y-6">
      {/* Header dengan Statistik */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-700">Persentase Hadir</p>
              <p className="mt-1 text-2xl font-bold text-emerald-900">{persentaseHadir}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-emerald-600" />
          </div>
        </div>

        <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-700">Total Hari</p>
              <p className="mt-1 text-2xl font-bold text-blue-900">{totalHari}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-700">Streak Terpanjang</p>
              <p className="mt-1 text-2xl font-bold text-purple-900">{longestStreak} hari</p>
            </div>
            <Award className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium text-muted-foreground">Detail Status</p>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-emerald-500"></span>
                Hadir
              </span>
              <span className="font-semibold">{stats.HADIR}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-yellow-500"></span>
                Sakit
              </span>
              <span className="font-semibold">{stats.SAKIT}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-blue-500"></span>
                Izin
              </span>
              <span className="font-semibold">{stats.IZIN}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-red-500"></span>
                Alpha
              </span>
              <span className="font-semibold">{stats.ALPHA}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold">
          Kehadiran {BULAN_NAMES[bulan - 1]} {tahun}
        </h3>

        {/* Header Hari */}
        <div className="mb-2 grid grid-cols-7 gap-2">
          {HARI_NAMES.map((hari) => (
            <div key={hari} className="text-center text-xs font-medium text-muted-foreground">
              {hari}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((item, index) => {
            if (!item) {
              return <div key={index} className="aspect-square"></div>;
            }

            const isHovered = hoveredDate === item.dateStr;

            return (
              <div
                key={item.dateStr}
                className="relative"
                onMouseEnter={() => setHoveredDate(item.dateStr)}
                onMouseLeave={() => setHoveredDate(null)}
              >
                <div
                  className={`aspect-square rounded-lg ${getStatusColor(item.status)} transition-all duration-200 flex items-center justify-center text-xs font-medium text-white shadow-sm`}
                >
                  {item.day}
                </div>

                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg">
                    <p className="font-semibold">{item.dateStr}</p>
                    <p className="text-muted-foreground">{getStatusLabel(item.status)}</p>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-popover"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-sm bg-emerald-500"></span>
            Hadir
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-sm bg-yellow-500"></span>
            Sakit
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-sm bg-blue-500"></span>
            Izin
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-sm bg-red-500"></span>
            Alpha
          </span>
          <span className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-sm bg-muted/30"></span>
            Tidak ada data
          </span>
        </div>
      </div>
    </div>
  );
}