"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchAPI } from "@/lib/api";
import { WorkerDetailResponse } from "@/types/api";
import { User, MapPin, Briefcase, Phone, ArrowLeft, Shield, Clock, ShieldAlert } from "lucide-react";
import { format } from "date-fns";

export default function WorkerProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<WorkerDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchAPI(`/api/workers/${id}`);
        if (!res.ok) {
          throw new Error("Failed to load worker profile");
        }
        const workerData = await res.json();
        setData(workerData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#236B6B]"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-[#C62828] bg-opacity-10 border border-[#C62828] border-opacity-20 text-[#C62828] px-4 py-3 rounded-md">
        {error || "Worker not found"}
      </div>
    );
  }

  const { worker, latest_completion, certificate_status } = data;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid": return "bg-[#2E7D32] text-white";
      case "expiring": return "bg-[#F57F17] text-white";
      case "expired": 
      case "revoked": return "bg-[#C62828] text-white";
      default: return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-sm font-medium text-[#757575] hover:text-[#212121] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Registry
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E0E0E0] overflow-hidden">
        {/* Profile Header */}
        <div className="bg-[#1A237E] px-6 py-8 sm:flex sm:items-center sm:justify-between">
          <div className="sm:flex sm:space-x-5 items-center">
            <div className="flex-shrink-0 h-20 w-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white font-bold text-2xl border-4 border-[#1A237E]">
              {worker.short_worker_id}
            </div>
            <div className="mt-4 sm:mt-0 text-center sm:text-left">
              <p className="text-xl font-bold text-white sm:text-2xl">{worker.full_name}</p>
              <p className="text-sm font-medium text-[#a7add9]">ID: {worker.id}</p>
            </div>
          </div>
          <div className="mt-5 flex justify-center sm:mt-0">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize shadow-sm ${getStatusColor(certificate_status)}`}>
              {certificate_status === 'valid' && <Shield className="w-4 h-4 mr-1" />}
              {certificate_status === 'expired' && <ShieldAlert className="w-4 h-4 mr-1" />}
              {certificate_status}
            </span>
          </div>
        </div>

        {/* Profile Details */}
        <div className="border-t border-[#E0E0E0] px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-[#757575] flex items-center"><MapPin className="w-4 h-4 mr-1"/> VTC Location</dt>
              <dd className="mt-1 text-sm text-[#212121]">{worker.vtc.name} ({worker.vtc.sector})</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-[#757575] flex items-center"><Briefcase className="w-4 h-4 mr-1"/> Department</dt>
              <dd className="mt-1 text-sm text-[#212121]">{worker.department}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-[#757575] flex items-center"><Phone className="w-4 h-4 mr-1"/> Contact</dt>
              <dd className="mt-1 text-sm text-[#212121]">{worker.phone_number}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-[#757575]">Contractor</dt>
              <dd className="mt-1 text-sm text-[#212121]">{worker.contractor || "N/A"}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-[#757575]">Language</dt>
              <dd className="mt-1 text-sm text-[#212121] uppercase">{worker.preferred_language}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-[#757575]">Blood Group</dt>
              <dd className="mt-1 text-sm text-[#212121]">{worker.blood_group || "N/A"}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Latest Training Section */}
      <h2 className="text-lg font-bold text-[#212121] mt-8 mb-4">Latest Training History</h2>
      {latest_completion ? (
        <div className="bg-white rounded-xl shadow-sm border border-[#E0E0E0] overflow-hidden p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-[#212121]">{latest_completion.scenario}</h3>
            <div className="mt-1 flex items-center text-sm text-[#757575]">
              <Clock className="w-4 h-4 mr-1" />
              Completed on {format(new Date(latest_completion.completed_at), "PPP")}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${latest_completion.passed ? "bg-[#2E7D32] bg-opacity-10 text-[#2E7D32]" : "bg-[#C62828] bg-opacity-10 text-[#C62828]"}`}>
              {latest_completion.passed ? "PASSED" : "FAILED"}
            </span>
            <Link 
              href={`/dashboard/completions/${latest_completion.id}`}
              className="inline-flex items-center px-4 py-2 border border-[#E0E0E0] shadow-sm text-sm font-medium rounded-md text-[#212121] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#236B6B]"
            >
              View Full Log
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-[#E0E0E0] p-6 text-center text-[#757575]">
          No training history found for this worker.
        </div>
      )}
      
      <div className="flex justify-end mt-4">
        <Link 
          href={`/dashboard/completions?worker_id=${worker.id}`}
          className="text-sm font-medium text-[#236B6B] hover:text-[#1b5151]"
        >
          View all history →
        </Link>
      </div>
    </div>
  );
}
