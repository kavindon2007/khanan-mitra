"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchAPI } from "@/lib/api";
import { CompletionLogListResponse } from "@/types/api";
import { Search, ChevronLeft, ChevronRight, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function CompletionsPage() {
  const [data, setData] = useState<CompletionLogListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [passed, setPassed] = useState("");
  const [isFlagged, setIsFlagged] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    async function loadCompletions() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          page_size: pageSize.toString(),
        });
        if (passed !== "") params.append("passed", passed);
        if (isFlagged !== "") params.append("is_flagged", isFlagged);

        const res = await fetchAPI(`/api/completions?${params.toString()}`);
        if (res.ok) {
          const completionData = await res.json();
          setData(completionData);
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    }

    loadCompletions();
  }, [passed, isFlagged, page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#212121]">Training Completion Logs</h1>
        <p className="text-[#757575] mt-1">Review procedural assessments and certification results.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E0E0E0] overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-[#E0E0E0] flex flex-wrap gap-4">
          <div className="w-full sm:w-auto">
            <select
              className="block w-full pl-3 pr-10 py-2 border border-[#E0E0E0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#236B6B] text-sm"
              value={passed}
              onChange={(e) => { setPassed(e.target.value); setPage(1); }}
            >
              <option value="">All Results</option>
              <option value="true">Passed</option>
              <option value="false">Failed</option>
            </select>
          </div>
          
          <div className="w-full sm:w-auto">
            <select
              className="block w-full pl-3 pr-10 py-2 border border-[#E0E0E0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#236B6B] text-sm"
              value={isFlagged}
              onChange={(e) => { setIsFlagged(e.target.value); setPage(1); }}
            >
              <option value="">All Statuses</option>
              <option value="true">Flagged for Review</option>
              <option value="false">Normal</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-full pt-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#236B6B]"></div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-[#E0E0E0]">
              <thead className="bg-[#F5F5F5]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#757575] uppercase tracking-wider">Worker</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#757575] uppercase tracking-wider">Scenario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#757575] uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#757575] uppercase tracking-wider">Completed At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#757575] uppercase tracking-wider">Result</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#757575] uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#E0E0E0]">
                {data?.items.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[#212121]">{log.worker.full_name}</div>
                      <div className="text-sm text-[#757575]">ID: {log.worker.short_worker_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#212121]">{log.scenario.title_en}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-[#212121]">{log.score}%</div>
                      <div className="text-xs text-[#757575]">{log.total_attempts} attempt{log.total_attempts !== 1 ? 's' : ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#757575]">
                      {format(new Date(log.completed_at), "MMM d, yyyy HH:mm")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {log.passed ? (
                          <span className="flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-[#2E7D32] bg-opacity-10 text-[#2E7D32]">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Passed
                          </span>
                        ) : (
                          <span className="flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-[#C62828] bg-opacity-10 text-[#C62828]">
                            <XCircle className="w-3 h-3 mr-1" /> Failed
                          </span>
                        )}
                        {log.is_flagged && (
                          <span className="flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-[#F57F17] bg-opacity-10 text-[#F57F17]" title={log.flagged_reason || "Flagged"}>
                            <AlertTriangle className="w-3 h-3 mr-1" /> Flagged
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/dashboard/completions/${log.id}`} className="text-[#236B6B] hover:text-[#1b5151]">
                        View Log
                      </Link>
                    </td>
                  </tr>
                ))}
                {data?.items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-[#757575]">
                      No completion records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {data && (
          <div className="px-4 py-3 border-t border-[#E0E0E0] bg-white flex items-center justify-between sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-[#757575]">
                  Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(page * pageSize, data.total)}</span> of <span className="font-medium">{data.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-[#E0E0E0] bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page * pageSize >= data.total}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-[#E0E0E0] bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
