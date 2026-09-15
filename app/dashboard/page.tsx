"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api";
import { DashboardOverview, VTCStatsResponse } from "@/types/api";
import { Users, BookOpenCheck, Activity, Building2, AlertTriangle, AlertCircle, Clock } from "lucide-react";

export default function DashboardOverviewPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [vtcStats, setVtcStats] = useState<VTCStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [overviewRes, vtcRes] = await Promise.all([
          fetchAPI("/api/dashboard/overview"),
          fetchAPI("/api/dashboard/vtcs")
        ]);

        if (!overviewRes.ok || !vtcRes.ok) {
          throw new Error("Failed to load dashboard data");
        }

        const overviewData = await overviewRes.json();
        const vtcData = await vtcRes.json();

        setOverview(overviewData);
        setVtcStats(vtcData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#236B6B]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#C62828] bg-opacity-10 border border-[#C62828] border-opacity-20 text-[#C62828] px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  if (!overview || !vtcStats) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#212121]">Compliance Overview</h1>
        <p className="text-[#757575] mt-1">Monitor industrial safety training across Jharkhand's mining, steel and mica sectors.</p>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="TOTAL WORKERS"
          value={overview.total_workers}
          subtitle={`${overview.active_workers} active workers`}
          icon={Users}
        />
        <MetricCard
          title="TRAINING COMPLETIONS"
          value={overview.total_completions}
          subtitle="completed assessments"
          icon={BookOpenCheck}
        />
        <MetricCard
          title="PASS RATE"
          value={`${(overview.pass_rate * 100).toFixed(1)}%`}
          subtitle={`${overview.passed_completions} / ${overview.total_completions}`}
          icon={Activity}
        />
        <MetricCard
          title="ACTIVE VTCs"
          value={overview.total_vtcs}
          subtitle="across Jharkhand"
          icon={Building2}
        />
      </div>

      {/* Secondary & Operational Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3 width) - VTC Performance */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-[#E0E0E0] overflow-hidden">
            <div className="px-6 py-5 border-b border-[#E0E0E0]">
              <h3 className="text-lg font-semibold text-[#212121]">VTC Performance</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#E0E0E0]">
                <thead className="bg-[#F5F5F5]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#757575] uppercase tracking-wider">VTC</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#757575] uppercase tracking-wider">Workers</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#757575] uppercase tracking-wider">Completions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#757575] uppercase tracking-wider">Pass Rate</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#E0E0E0]">
                  {vtcStats.items.map((vtc) => (
                    <tr key={vtc.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-[#212121]">{vtc.name}</div>
                        <div className="text-sm text-[#757575]">{vtc.district}, {vtc.sector}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#212121]">{vtc.worker_count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#212121]">{vtc.completion_count}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          vtc.pass_rate >= 0.8 ? "bg-[#2E7D32] bg-opacity-10 text-[#2E7D32]" : 
                          vtc.pass_rate >= 0.5 ? "bg-[#F57F17] bg-opacity-10 text-[#F57F17]" : 
                          "bg-[#C62828] bg-opacity-10 text-[#C62828]"
                        }`}>
                          {(vtc.pass_rate * 100).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width) - Attention Required */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-[#E0E0E0] p-6">
            <h3 className="text-lg font-semibold text-[#212121] mb-4">Attention Required</h3>
            
            <div className="space-y-4">
              <a href="/dashboard/completions?passed=false" className="flex items-start p-3 rounded-lg border border-[#E0E0E0] hover:bg-gray-50 transition-colors cursor-pointer group">
                <AlertCircle className="w-5 h-5 text-[#C62828] mt-0.5 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-[#212121] group-hover:text-[#1A237E]">{overview.failed_completions} Failed assessments</p>
                  <p className="text-xs text-[#757575] mt-0.5">Workers require retraining</p>
                </div>
              </a>

              <a href="/dashboard/completions?is_flagged=true" className="flex items-start p-3 rounded-lg border border-[#E0E0E0] hover:bg-gray-50 transition-colors cursor-pointer group">
                <AlertTriangle className="w-5 h-5 text-[#C62828] mt-0.5 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-[#212121] group-hover:text-[#1A237E]">{overview.flagged_completions} Flagged records</p>
                  <p className="text-xs text-[#757575] mt-0.5">Require officer review</p>
                </div>
              </a>

              <a href="/dashboard/completions" className="flex items-start p-3 rounded-lg border border-[#E0E0E0] hover:bg-gray-50 transition-colors cursor-pointer group">
                <Clock className="w-5 h-5 text-[#F57F17] mt-0.5 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-[#212121] group-hover:text-[#1A237E]">{overview.expiring_certificates} Certificates expiring soon</p>
                  <p className="text-xs text-[#757575] mt-0.5">Review certification status</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon: Icon }: { title: string, value: string | number, subtitle: string, icon: any }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E0E0E0] p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-[#757575] tracking-wider">{title}</h3>
        <Icon className="w-5 h-5 text-[#236B6B]" />
      </div>
      <div className="mt-4">
        <p className="text-3xl font-semibold text-[#212121]">{value}</p>
        <p className="text-sm text-[#757575] mt-1">{subtitle}</p>
      </div>
    </div>
  );
}
