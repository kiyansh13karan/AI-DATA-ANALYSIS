import React, { useState } from "react";

const PAGE_SIZE = 20;

export default function ResultTable({ columns, rows }) {
  const [page, setPage] = useState(0);

  if (!columns?.length || !rows?.length) return null;

  const totalPages = Math.ceil(rows.length / PAGE_SIZE);
  const pageRows = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="mt-2 rounded-lg border border-[#E2E8F0] dark:border-[#1F2630] overflow-hidden text-xs">
      <div className="overflow-x-auto max-h-64">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-[#F8FAFC] dark:bg-[#10171F] z-10">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-3 py-2 text-left font-semibold text-[#64748B] dark:text-[#7B8794] border-b border-[#E2E8F0] dark:border-[#1F2630] whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, i) => (
              <tr
                key={i}
                className={
                  i % 2 === 0
                    ? "bg-[#FFFFFF] dark:bg-[#10171F]"
                    : "bg-[#F8FAFC] dark:bg-[#0B0F14]"
                }
              >
                {columns.map((col) => (
                  <td
                    key={col}
                    className="px-3 py-1.5 text-[#0F172A] dark:text-[#F2F4F7] border-b border-[#E2E8F0] dark:border-[#1B232C] whitespace-nowrap max-w-[200px] truncate"
                    title={String(row[col] ?? "")}
                  >
                    {row[col] === null || row[col] === undefined ? (
                      <span className="text-[#64748B]/50 dark:text-[#7B8794]/50 italic">null</span>
                    ) : (
                      String(row[col])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer: row count + pagination */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#F8FAFC] dark:bg-[#10171F] border-t border-[#E2E8F0] dark:border-[#1F2630] text-[#64748B] dark:text-[#7B8794]">
        <span>
          {rows.length} row{rows.length !== 1 ? "s" : ""}
          {rows.length > PAGE_SIZE && ` · page ${page + 1} of ${totalPages}`}
        </span>
        {totalPages > 1 && (
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-2 py-0.5 rounded border border-[#E2E8F0] dark:border-[#1B232C] disabled:opacity-40 hover:bg-[#F1F5F9] dark:hover:bg-[#17212B] text-[#0F172A] dark:text-[#F2F4F7]"
            >
              ‹
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="px-2 py-0.5 rounded border border-[#E2E8F0] dark:border-[#1B232C] disabled:opacity-40 hover:bg-[#F1F5F9] dark:hover:bg-[#17212B] text-[#0F172A] dark:text-[#F2F4F7]"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
