import React, { useMemo, useState, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { useDataset } from "../../context/DatasetContext.jsx";
import DatasetSelector from "../shared/DatasetSelector.jsx";
import { uploadDataset } from "../../services/api.js";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

export default function PreviewTable() {
  const { dataset, activeFile, appendDataset } = useDataset();
  const [isUploadingMore, setIsUploadingMore] = useState(false);
  const fileInputRef = useRef(null);

  const handleAddFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setIsUploadingMore(true);
    try {
      const res = await uploadDataset(files, dataset.dataset_id);
      appendDataset(res.data);
      toast.success(`Added ${files.length} table(s) to workspace!`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to append file.");
    } finally {
      setIsUploadingMore(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const schema = activeFile?.schema ?? dataset?.schema;
  const previewRows = activeFile?.preview_rows ?? dataset?.preview_rows ?? [];

  const columnDefs = useMemo(
    () =>
      (schema?.columns || []).map((col) => ({
        field: col.name,
        headerName: col.name,
        sortable: true,
        filter: true,
        resizable: true,
      })),
    [schema]
  );

  if (!dataset) return null;

  return (
    <div className="space-y-3 flex flex-col h-[calc(100vh-100px)] animate-fade-in">
      {/* Tab Header Banner */}
      <div className="flex items-center justify-between gap-3 shrink-0">
        <div>
          <h2 className="font-outfit font-bold text-xl sm:text-2xl bg-gradient-to-r from-[#D97706] to-[#F59E0B] dark:from-[#F7D154] dark:to-[#FDE68A] bg-clip-text text-transparent tracking-tight">
            Data Preview & Statistics
          </h2>
          <p className="text-xs text-[#64748B] dark:text-[#7B8794] mt-0.5 font-sans">
            Inspect raw schemas, check column data types, null counts, and preview table rows.
          </p>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAddFiles}
            multiple
            accept=".csv,.xlsx,.xls,.db,.sqlite,.sql"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingMore}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#D97706] hover:bg-[#b45309] text-white dark:bg-[#F7D154] dark:hover:bg-[#ebd448] dark:text-[#0B0F14] text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {isUploadingMore ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus size={14} />
                Add Table / File
              </>
            )}
          </button>
        </div>
      </div>

      {/* Dataset selector + Compact Stats Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
        <DatasetSelector />
        
        {schema && (
          <div className="flex items-center gap-2 sm:gap-4 px-3.5 py-1.5 rounded-2xl bg-[#FFFFFF] dark:bg-[#10171F] border border-[#E2E8F0] dark:border-[#1F2630] shadow-xs text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[#64748B] dark:text-[#7B8794]">Rows:</span>
              <span className="font-semibold text-[#0F172A] dark:text-[#F2F4F7]">{schema.row_count?.toLocaleString()}</span>
            </div>
            <span className="text-[#E2E8F0] dark:text-[#1F2630]">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[#64748B] dark:text-[#7B8794]">Cols:</span>
              <span className="font-semibold text-[#0F172A] dark:text-[#F2F4F7]">{schema.column_count}</span>
            </div>
            <span className="text-[#E2E8F0] dark:text-[#1F2630]">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[#64748B] dark:text-[#7B8794]">Missing:</span>
              <span className="font-semibold text-[#0F172A] dark:text-[#F2F4F7]">{schema.columns?.reduce((sum, c) => sum + c.missing_count, 0).toLocaleString()}</span>
            </div>
            <span className="text-[#E2E8F0] dark:text-[#1F2630]">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[#64748B] dark:text-[#7B8794]">Duplicates:</span>
              <span className="font-semibold text-[#0F172A] dark:text-[#F2F4F7]">{schema.duplicate_row_count?.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Data grid Container */}
      <div className="flex-1 rounded-2xl bg-[#FFFFFF] dark:bg-[#10171F] border border-[#E2E8F0] dark:border-[#1F2630] shadow-sm p-2 sm:p-3 overflow-hidden flex flex-col">
        <div className="ag-theme-quartz dark:ag-theme-quartz-dark rounded-xl overflow-hidden w-full flex-1">
          <AgGridReact
            rowData={previewRows}
            columnDefs={columnDefs}
            pagination
            paginationPageSize={20}
            defaultColDef={{
              sortable: true,
              filter: true,
              resizable: true,
              minWidth: 110,
              flex: 1,
            }}
            animateRows={true}
            rowSelection="single"
          />
        </div>
      </div>
    </div>
  );
}
