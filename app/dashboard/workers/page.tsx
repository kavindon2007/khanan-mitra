"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchAPI } from "@/lib/api";
import { WorkerListResponse, VTCBasic } from "@/types/api";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";

export default function WorkersPage() {
  const [data, setData] = useState<WorkerListResponse | null>(null);
  const [vtcs, setVtcs] = useState<VTCBasic[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [vtcId, setVtcId] = useState("");
  const [department, setDepartment] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    async function loadVTCs() {
      try {
        const res = await fetchAPI("/api/dashboard/vtcs");
        if (res.ok) {
          const vtcData = await res.json();
          setVtcs(vtcData.items);
        }
      } catch (err) {}
    }
    loadVTCs();
  }, []);

  useEffect(() => {
    async function loadWorkers() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          page_size: pageSize.toString(),
        });
        if (search) params.append("search", search);
        if (vtcId) params.append("vtc_id", vtcId);
        if (department) params.append("department", department);

        const res = await fetchAPI(`/api/workers?${params.toString()}`);
        if (res.ok) {
          const workerData = await res.json();
          setData(workerData);
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadWorkers();
    }, 300); // debounce

    return () => clearTimeout(timer);
  }, [search, vtcId, department, page]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#212121]">Worker Registry</h1>
          <p className="text-[#757575] mt-1">Manage and monitor personnel compliance.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E0E0E0] overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-[#E0E0E0] grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search ID, Name, Phone..."
              className="block w-full pl-10 pr-3 py-2 border border-[#E0E0E0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#236B6B] text-sm"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          
          <div>
            <select
              className="block w-full pl-3 pr-10 py-2 border border-[#E0E0E0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#236B6B] text-sm"
              value={vtcId}
              onChange={(e) => { setVtcId(e.target.value); setPage(1); }}
            >
              <option value="">All VTCs</option>
              {vtcs.map((vtc: any) => (
                <option key={vtc.id} value={vtc.id}>{vtc.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="block w-full pl-3 pr-10 py-2 border border-[#E0E0E0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#236B6B] text-sm"
              value={department}
              onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
            >
              <option value="">All Departments</option>
              <option value="Mining">Mining</option>
              <option value="Engineering">Engineering</option>
              <option value="Safety">Safety</option>
              <option value="Operations">Operations</option>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#757575] uppercase tracking-wider">VTC</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#757575] uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#757575] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-[#757575] uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#E0E0E0]">
                {data?.items.map((worker) => (
                  <tr key={worker.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-[#757575] font-semibold text-sm">
                          {worker.short_worker_id}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-[#212121]">{worker.full_name}</div>
                          <div className="text-sm text-[#757575]">{worker.phone_number}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[#212121]">{worker.vtc.name}</div>
                      <div className="text-sm text-[#757575]">{worker.vtc.sector}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#757575]">
                      {worker.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${worker.is_active ? "bg-[#2E7D32] bg-opacity-10 text-[#2E7D32]" : "bg-gray-100 text-gray-800"}`}>
                        {worker.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/dashboard/workers/${worker.id}`} className="text-[#236B6B] hover:text-[#1b5151]">
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))}
                {data?.items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-[#757575]">
                      No workers found.
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
