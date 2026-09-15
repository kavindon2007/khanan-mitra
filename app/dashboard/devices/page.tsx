"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api";
import { DeviceListResponse } from "@/types/api";
import { Smartphone, Activity, AlertCircle, WifiOff } from "lucide-react";
import { format, differenceInMinutes } from "date-fns";

export default function DevicesPage() {
  const [data, setData] = useState<DeviceListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchAPI("/api/devices");
        if (!res.ok) {
          throw new Error("Failed to load device data");
        }
        const deviceData = await res.json();
        setData(deviceData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (error) {
    return (
      <div className="bg-[#C62828] bg-opacity-10 border border-[#C62828] border-opacity-20 text-[#C62828] px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  const getStatusDisplay = (device: any) => {
    if (device.status === 'Healthy') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#2E7D32] bg-opacity-10 text-[#2E7D32] border border-[#2E7D32] border-opacity-20">
          <Activity className="w-3.5 h-3.5 mr-1" /> Healthy
        </span>
      );
    } else if (device.status === 'Warning') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#F57F17] bg-opacity-10 text-[#F57F17] border border-[#F57F17] border-opacity-20">
          <AlertCircle className="w-3.5 h-3.5 mr-1" /> Warning
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#C62828] bg-opacity-10 text-[#C62828] border border-[#C62828] border-opacity-20">
          <WifiOff className="w-3.5 h-3.5 mr-1" /> Offline
        </span>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#212121]">Device & Sync Health</h1>
        <p className="text-[#757575] mt-1">Monitor offline-first Android device synchronizations.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E0E0E0] overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-full pt-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#236B6B]"></div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-[#E0E0E0]">
              <thead className="bg-[#F5F5F5]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#757575] uppercase tracking-wider">Device</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#757575] uppercase tracking-wider">Location (VTC)</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#757575] uppercase tracking-wider">Last Sync</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-[#757575] uppercase tracking-wider">Pending Records</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#757575] uppercase tracking-wider">App Version</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-[#757575] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#E0E0E0]">
                {data?.items.map((device) => {
                  return (
                    <tr key={device.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-[#1A237E] bg-opacity-10 rounded-lg flex items-center justify-center">
                            <Smartphone className="h-5 w-5 text-[#1A237E]" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-[#212121]">{device.device_label}</div>
                            <div className="text-xs text-[#757575] mt-0.5 font-mono">ID: {device.android_id || "Unregistered"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[#212121]">{device.vtc.name}</div>
                        <div className="text-xs text-[#757575]">{device.vtc.district}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[#212121]">
                          {device.last_synced_at ? format(new Date(device.last_synced_at), "MMM d, HH:mm") : "Never"}
                        </div>
                        <div className="text-xs text-[#757575] mt-0.5">
                           Heartbeat: {device.last_heartbeat_at ? format(new Date(device.last_heartbeat_at), "HH:mm") : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                          device.pending_records > 50 ? 'bg-[#C62828] bg-opacity-10 text-[#C62828]' : 
                          device.pending_records > 0 ? 'bg-[#F57F17] bg-opacity-10 text-[#F57F17]' : 
                          'text-[#757575]'
                        }`}>
                          {device.pending_records}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#757575]">
                        {device.app_version || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {getStatusDisplay(device)}
                      </td>
                    </tr>
                  );
                })}
                {data?.items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-[#757575]">
                      No devices registered.
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
