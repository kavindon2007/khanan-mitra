"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api";
import { StepAnalyticsResponse } from "@/types/api";
import { Clock, AlertTriangle, ArrowDownToLine, CheckCircle2 } from "lucide-react";

export default function AnalyticsPage() {
  const [data, setData] = useState<StepAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scenarioFilter, setScenarioFilter] = useState("fire_explosion"); // Default to a known scenario, or "" for all

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (scenarioFilter) {
          params.append("scenario_key", scenarioFilter);
        }
        
        const res = await fetchAPI(`/api/analytics/steps?${params.toString()}`);
        if (!res.ok) {
          throw new Error("Failed to load analytics data");
        }
        const analyticsData = await res.json();
        setData(analyticsData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [scenarioFilter]);

  if (error) {
    return (
      <div className="bg-[#C62828] bg-opacity-10 border border-[#C62828] border-opacity-20 text-[#C62828] px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#212121]">Step-Level Performance Analytics</h1>
        <p className="text-[#757575] mt-1">Identify which safety procedures workers struggle with.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E0E0E0] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#E0E0E0] flex justify-between items-center bg-[#F5F5F5]">
          <h3 className="text-sm font-semibold text-[#212121]">Procedure Accuracy</h3>
          <select
            className="block w-64 pl-3 pr-10 py-2 border border-[#E0E0E0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#236B6B] text-sm bg-white"
            value={scenarioFilter}
            onChange={(e) => setScenarioFilter(e.target.value)}
          >
            <option value="">All Scenarios</option>
            <option value="fire_explosion">Fire & Explosion Response</option>
            <option value="gas_leak">Gas Leak Protocol</option>
            <option value="first_aid">First Aid Application</option>
            <option value="roof_fall">Roof Fall Emergency</option>
            <option value="equipment_failure">Equipment Failure</option>
          </select>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-full pt-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#236B6B]"></div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-[#E0E0E0]">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#757575] uppercase tracking-wider w-1/3">Procedure Step</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#757575] uppercase tracking-wider">Accuracy</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-[#757575] uppercase tracking-wider">Attempts</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-[#757575] uppercase tracking-wider">Avg Time</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-[#757575] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E0E0]">
                {data?.items.map((stat, idx) => {
                  const accuracy = stat.accuracy * 100;
                  const isWarning = accuracy < 85;
                  
                  return (
                    <tr key={`${stat.scenario_key}-${stat.step_key}`} className={`transition-colors ${isWarning ? 'bg-[#F57F17] bg-opacity-5' : 'hover:bg-gray-50'}`}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-[#212121] capitalize">{stat.step_key.replace(/_/g, ' ')}</div>
                        <div className="text-xs text-[#757575] capitalize mt-0.5">{stat.scenario_key.replace(/_/g, ' ')}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className={`text-sm font-bold mr-3 ${isWarning ? 'text-[#F57F17]' : 'text-[#2E7D32]'}`}>
                            {accuracy.toFixed(1)}%
                          </span>
                          <div className="flex-1 w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${isWarning ? 'bg-[#F57F17]' : 'bg-[#2E7D32]'}`}
                              style={{ width: `${accuracy}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-[#757575]">
                        <span className="font-medium text-[#212121]">{stat.attempts}</span> total
                        <div className="text-xs text-[#757575] mt-1">
                          <span className="text-[#2E7D32]">{stat.correct}</span> / <span className="text-[#C62828]">{stat.incorrect}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-[#757575]">
                        <div className="flex items-center justify-center">
                          <Clock className="w-3.5 h-3.5 mr-1.5" />
                          {stat.average_time_seconds.toFixed(1)}s
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {isWarning ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#F57F17] bg-opacity-10 text-[#F57F17] border border-[#F57F17] border-opacity-20">
                            <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Needs Training
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#2E7D32] bg-opacity-10 text-[#2E7D32] border border-[#2E7D32] border-opacity-20">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Proficient
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {data?.items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-[#757575]">
                      No step analytics data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
