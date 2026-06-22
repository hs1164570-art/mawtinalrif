// lib/export-utils.ts
// Generic, reusable export functions (CSV / Excel / PDF / Word) driven purely
// by a column config + row data. Any table or report on the dashboard can
// reuse these instead of writing its own export logic (DRY).

export interface ExportColumn<T> {
  key: keyof T;
  header: string; // Arabic column header
  format?: (value: T[keyof T], row: T) => string;
}

export interface ExportOptions<T> {
  filename: string; // without extension
  title: string; // Arabic report title, shown in PDF/Word
  columns: ExportColumn<T>[];
  rows: T[];
}

function getCellText<T>(col: ExportColumn<T>, row: T): string {
  const raw = row[col.key];
  if (col.format) return col.format(raw, row);
  if (raw === null || raw === undefined) return "";
  return String(raw);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ───────────────────────── CSV ───────────────────────── */

export function exportToCSV<T>({ filename, columns, rows }: ExportOptions<T>) {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const header = columns.map((c) => escape(c.header)).join(",");
  const lines = rows.map((row) =>
    columns.map((c) => escape(getCellText(c, row))).join(","),
  );
  // BOM so Excel opens Arabic UTF-8 CSV correctly
  const csv = "\uFEFF" + [header, ...lines].join("\r\n");
  downloadBlob(
    new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    `${filename}.csv`,
  );
}

/* ───────────────────────── Excel (.xlsx) ───────────────────────── */

export async function exportToExcel<T>({
  filename,
  title,
  columns,
  rows,
}: ExportOptions<T>) {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Mawtan Al-Reef Analytics";
  const sheet = workbook.addWorksheet(title.slice(0, 28) || "Report", {
    views: [{ rightToLeft: true }],
  });

  sheet.columns = columns.map((c) => ({
    header: c.header,
    key: String(c.key),
    width: 22,
  }));
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1A1A1A" },
  };
  sheet.getRow(1).alignment = { horizontal: "right" };

  rows.forEach((row) => {
    const record: Record<string, string> = {};
    columns.forEach((c) => {
      record[String(c.key)] = getCellText(c, row);
    });
    const r = sheet.addRow(record);
    r.alignment = { horizontal: "right" };
  });

  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `${filename}.xlsx`,
  );
}

/* ───────────────────────── PDF ───────────────────────── */

export async function exportToPDF<T>({
  filename,
  title,
  columns,
  rows,
}: ExportOptions<T>) {
  const { default: jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({
    orientation: columns.length > 5 ? "landscape" : "portrait",
  });

  doc.setFontSize(14);
  doc.text(title, doc.internal.pageSize.getWidth() / 2, 16, {
    align: "center",
  });
  doc.setFontSize(9);
  doc.text(
    new Date().toLocaleDateString("en-US", { numberingSystem: "latn" }),
    doc.internal.pageSize.getWidth() / 2,
    22,
    { align: "center" },
  );

  autoTable(doc, {
    startY: 28,
    head: [columns.map((c) => c.header).reverse()],
    body: rows.map((row) => columns.map((c) => getCellText(c, row)).reverse()),
    styles: { font: "helvetica", fontSize: 8, halign: "center" },
    headStyles: { fillColor: [26, 26, 26], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 249, 250] },
  });

  doc.save(`${filename}.pdf`);
}

/* ───────────────────────── Word (.docx) ───────────────────────── */

export async function exportToWord<T>({
  filename,
  title,
  columns,
  rows,
}: ExportOptions<T>) {
  const {
    Document,
    Packer,
    Paragraph,
    Table,
    TableRow,
    TableCell,
    TextRun,
    HeadingLevel,
    WidthType,
    AlignmentType,
  } = await import("docx");

  const headerRow = new TableRow({
    children: columns.map(
      (c) =>
        new TableCell({
          width: { size: 100 / columns.length, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: c.header, bold: true })],
            }),
          ],
        }),
    ),
  });

  const bodyRows = rows.map(
    (row) =>
      new TableRow({
        children: columns.map(
          (c) =>
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  text: getCellText(c, row),
                }),
              ],
            }),
        ),
      }),
  );

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: title, bold: true })],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: new Date().toLocaleDateString("en-US", {
                  numberingSystem: "latn",
                }),
                color: "868E96",
              }),
            ],
          }),
          new Paragraph({ text: "" }),
          new Table({
            rows: [headerRow, ...bodyRows],
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${filename}.docx`);
}

export type ExportFormat = "csv" | "excel" | "pdf" | "word";

export async function runExport<T>(
  format: ExportFormat,
  options: ExportOptions<T>,
) {
  switch (format) {
    case "csv":
      return exportToCSV(options);
    case "excel":
      return exportToExcel(options);
    case "pdf":
      return exportToPDF(options);
    case "word":
      return exportToWord(options);
  }
}
