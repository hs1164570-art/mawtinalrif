"use client";

import { useState, useRef } from "react";
import {
  Download,
  FileSpreadsheet,
  FileText,
  FileDown,
  Loader2,
} from "lucide-react";
import type { ExportFormat } from "../types";
import { Command } from "cmdk";

interface DataExporterProps {
  getData: () => Record<string, unknown>[];
  fileName?: string;
  disabled?: boolean;
}

async function exportCSV(rows: Record<string, unknown>[], fileName: string) {
  // حل مشكلة الـ Dynamic Import لـ file-saver
  const fileSaver = await import("file-saver");
  const saveAs =
    fileSaver.saveAs || fileSaver.default?.saveAs || fileSaver.default;

  if (!rows.length || !saveAs) return;

  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      headers
        .map((h) => {
          const val = String(r[h] ?? "");
          return val.includes(",") || val.includes('"') ?
              `"${val.replace(/"/g, '""')}"`
            : val;
        })
        .join(","),
    ),
  ];
  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], {
    type: "text/csv;charset=utf-8;",
  });
  saveAs(blob, `${fileName}.csv`);
}

async function exportXLSX(rows: Record<string, unknown>[], fileName: string) {
  const XLSX = await import("xlsx");
  // حل مشكلة الـ Dynamic Import لـ file-saver هنا أيضاً
  const fileSaver = await import("file-saver");
  const saveAs =
    fileSaver.saveAs || fileSaver.default?.saveAs || fileSaver.default;

  if (!saveAs) return;

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "بيانات");
  const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `${fileName}.xlsx`);
}

async function exportPDF(rows: Record<string, unknown>[], fileName: string) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const th = headers
    .map(
      (h) =>
        `<th style="padding:6px 10px;border:1px solid #EDE5D8;background:#FAF7F2;color:#3D2B1F;">${h}</th>`,
    )
    .join("");
  const trs = rows
    .map(
      (r) =>
        `<tr>${headers.map((h) => `<td style="padding:5px 10px;border:1px solid #EDE5D8;color:#3D2B1F;">${r[h] ?? ""}</td>`).join("")}</tr>`,
    )
    .join("");
  const html = `
    <html dir="rtl"><head><meta charset="utf-8"><title>${fileName}</title>
    <style>body{font-family:sans-serif;padding:24px;}table{border-collapse:collapse;width:100%;}</style>
    </head><body>
    <h2 style="color:#3D2B1F;margin-bottom:16px;">${fileName}</h2>
    <table><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>
    </body></html>
  `;
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  w.print();
}

const FORMAT_OPTIONS: Array<{
  value: ExportFormat;
  label: string;
  icon: React.ReactNode;
  desc: string;
}> = [
  {
    value: "csv",
    label: "CSV",
    icon: <FileText size={14} />,
    desc: "ملف نصي مفصول بفواصل",
  },
  {
    value: "xlsx",
    label: "Excel",
    icon: <FileSpreadsheet size={14} />,
    desc: "جدول بيانات Excel",
  },
  {
    value: "pdf",
    label: "PDF",
    icon: <FileDown size={14} />,
    desc: "طباعة أو PDF",
  },
];

export default function DataExporter({
  getData,
  fileName = "تقرير",
  disabled,
}: DataExporterProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<ExportFormat | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const handle = async (fmt: ExportFormat) => {
    setLoading(fmt);
    setOpen(false);
    try {
      const rows = getData();
      if (fmt === "csv") await exportCSV(rows, fileName);
      if (fmt === "xlsx") await exportXLSX(rows, fileName);
      if (fmt === "pdf") await exportPDF(rows, fileName);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="relative" ref={ref} dir="rtl">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={disabled || !!loading}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="تصدير البيانات"
        title="تصدير (Ctrl+E)"
        className="
          flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EDE5D8]
          bg-white text-[#6B4C3B] text-xs font-medium shadow-sm
          hover:bg-[#F5EFE6] hover:border-[#B89A5A] transition-all duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B89A5A]
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        {loading ?
          <Loader2 size={13} className="animate-spin" />
        : <Download size={13} />}
        تصدير
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />

          <div
            role="listbox"
            aria-label="اختر صيغة التصدير"
            className="absolute left-0 top-full mt-2 w-48 bg-white rounded-2xl border border-[#EDE5D8]
                       shadow-xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"
          >
            <Command label="خيارات التصدير">
              <div className="p-1.5">
                <Command.List>
                  {FORMAT_OPTIONS.map((opt) => (
                    <Command.Item
                      key={opt.value}
                      value={`${opt.label} ${opt.desc}`}
                      onSelect={() => handle(opt.value)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-right
                     text-[#3D2B1F] aria-selected:bg-[#F5EFE6] transition-colors group cursor-pointer"
                    >
                      <span
                        className="p-1.5 rounded-lg bg-[#F5EFE6] text-[#B89A5A] group-aria-selected:bg-[#EDE5D8]
                                 transition-colors flex-shrink-0"
                      >
                        {opt.icon}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium leading-none">
                          {opt.label}
                        </p>
                        <p className="text-[10px] text-[#A89585] mt-0.5">
                          {opt.desc}
                        </p>
                      </div>
                    </Command.Item>
                  ))}
                </Command.List>
              </div>
            </Command>
          </div>
        </>
      )}
    </div>
  );
}
