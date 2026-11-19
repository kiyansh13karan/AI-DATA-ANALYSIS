import React from "react";
import { downloadCsv, downloadExcel } from "../../services/api.js";
import { Download } from "lucide-react";

function saveBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

export default function DownloadButtons({ datasetId, sql }) {
  if (!sql) return null;

  const handleCsv = async () => {
    const { data } = await downloadCsv(datasetId, sql);
    saveBlob(data, "result.csv");
  };

  const handleExcel = async () => {
    const { data } = await downloadExcel(datasetId, sql);
    saveBlob(data, "result.xlsx");
  };

  const btnClass =
    "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#1F2630] bg-[#FFFFFF] dark:bg-[#10171F] text-[#0F172A] dark:text-[#F2F4F7] hover:bg-[#F1F5F9] dark:hover:bg-[#17212B] transition-colors font-medium cursor-pointer";

  return (
    <div className="flex gap-2">
      <button onClick={handleCsv} className={btnClass}><Download size={14} /> CSV</button>
      <button onClick={handleExcel} className={btnClass}><Download size={14} /> Excel</button>
    </div>
  );
}
