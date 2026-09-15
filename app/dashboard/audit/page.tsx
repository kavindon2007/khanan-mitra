"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api";
import { AuditLogListResponse } from "@/types/api";
import { ChevronLeft, ChevronRight, Activity, ShieldCheck, Database, KeySquare } from "lucide-react";
import { format } from "date-fns";

export default function AuditLogPage() {
  const [data, setData] = useState<AuditLogListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetchAPI(`/api/audit?page=${page}&page_size=${pageSize}`);
        if (!res.ok) {
          throw new Error("Failed to load audit logs");
        }
        const auditData = await res.json();
        setData(auditData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [page]);

  const getActionIcon = (action: string) => {
    if (action.includes("LOGIN")) return <ShieldCheck className="w-4 h-4 text-[#1A237E]" />;
    if (action.includes("SYNC")) return <Database className="w-4 h-4 text-[#236B6B]" />;
    if (action.includes("REVOKE")) return <KeySquare className="w-4 h-4 text-[#C62828]" />;
    return <Activity className="w-4 h-4 text-[#757575]" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#212121]">System Audit Log</h1>
        <p className="text-[#757575] mt-1">Review administrative actions and system events.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E0E0E0] overflow-hidden flex flex-col">
        {error && (
          <div className="p-4 bg-[#C62828] bg-opacity-10 text-[#C62828] text-sm">
            {error}
          </div>
        )}

        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-full pt-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#236B6B]"></div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-[#E0E0E0]">
              <thead className="bg-[#F5F5F5]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#757575] uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#757575] uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#757575] uppercase tracking-wider">Actor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#757575] uppercase tracking-wider">Target</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#757575] uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#E0E0E0] text-sm">
                {data?.items.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-[#757575] font-mono text-xs">
                      {format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center font-medium text-[#212121]">
                        <span className="mr-2">{getActionIcon(log.action)}</span>
                        {log.action}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#757575]">
                      {log.actor_type.toUpperCase()} 
                      {log.actor_id && <span className="block text-xs font-mono">{log.actor_id.split('-')[0]}...</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#757575]">
                      {log.target_table ? (
                        <>
                          {log.target_table.toUpperCase()}
                          {log.target_id && <span className="block text-xs font-mono">{log.target_id.split('-')[0]}...</span>}
                        </>
                      ) : "-"}
                    </td>
                    <td className="px-6 py-4 text-[#757575] text-xs font-mono max-w-xs truncate" title={JSON.stringify(log.metadata_)}>
                      {log.metadata_ ? JSON.stringify(log.metadata_) : "-"}
                    </td>
                  </tr>
                ))}
                {data?.items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-[#757575]">
                      No audit logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {data && (
          <div className="px-4 py-3 border-t border-[#E0E0E0] bg-[#F5F5F5] flex items-center justify-between sm:px-6">
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
