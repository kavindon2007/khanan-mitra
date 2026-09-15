"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchAPI } from "@/lib/api";
import { CompletionDetailResponse } from "@/types/api";
import { ArrowLeft, CheckCircle2, XCircle, Clock, AlertTriangle, Shield, ShieldAlert, Award } from "lucide-react";
import { format } from "date-fns";

export default function CompletionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<CompletionDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchAPI(`/api/completions/${id}`);
        if (!res.ok) {
          throw new Error("Failed to load completion details");
        }
        const detailData = await res.json();
        setData(detailData);
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
        {error || "Record not found"}
      </div>
    );
  }

  const { completion, steps, certificate_status } = data;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid": return "bg-[#2E7D32] text-[#2E7D32]";
      case "expiring": return "bg-[#F57F17] text-[#F57F17]";
      case "expired": 
      case "revoked": return "bg-[#C62828] text-[#C62828]";
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
          Back to Logs
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Overview Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-[#E0E0E0] p-6">
            <h3 className="text-xs font-bold text-[#757575] uppercase tracking-wider mb-4">Worker Profile</h3>
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center text-[#757575] font-bold text-lg">
                {completion.worker.short_worker_id}
              </div>
              <div>
                <p className="text-base font-semibold text-[#212121]">{completion.worker.full_name}</p>
                <Link href={`/dashboard/workers/${completion.worker.id}`} className="text-sm text-[#236B6B] hover:underline">
                  View full profile
                </Link>
              </div>
            </div>
            
            <hr className="border-[#E0E0E0] my-4"/>
            
            <h3 className="text-xs font-bold text-[#757575] uppercase tracking-wider mb-4">Assessment Details</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-[#757575]">Scenario</dt>
                <dd className="text-sm font-medium text-[#212121]">{completion.scenario.title_en}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#757575]">Completed At</dt>
                <dd className="text-sm font-medium text-[#212121]">{format(new Date(completion.completed_at), "PPP p")}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#757575]">Duration</dt>
                <dd className="text-sm font-medium text-[#212121]">{completion.duration_seconds ? `${Math.floor(completion.duration_seconds / 60)}m ${completion.duration_seconds % 60}s` : 'Unknown'}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#757575]">Attempts</dt>
                <dd className="text-sm font-medium text-[#212121]">{completion.total_attempts}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-[#E0E0E0] p-6">
             <h3 className="text-xs font-bold text-[#757575] uppercase tracking-wider mb-4">Certificate Status</h3>
             <div className="flex items-center space-x-3 mb-2">
                <span className={`p-2 rounded-full bg-opacity-10 ${getStatusColor(certificate_status)}`}>
                  {certificate_status === 'valid' ? <Shield className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                </span>
                <div>
                  <p className="text-sm font-semibold capitalize text-[#212121]">{certificate_status}</p>
                  <p className="text-xs text-[#757575]">
                    {completion.certificate_issued ? (completion.certificate_expires_at ? `Expires ${format(new Date(completion.certificate_expires_at), "PP")}` : "Issued") : "Not Issued"}
                  </p>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column - Results and Steps */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-[#E0E0E0] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#212121] flex items-center">
                Score: {completion.score}%
                {completion.is_flagged && (
                  <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#F57F17] bg-opacity-10 text-[#F57F17]">
                    <AlertTriangle className="w-3 h-3 mr-1" /> Flagged
                  </span>
                )}
              </h2>
              <p className="text-sm text-[#757575] mt-1">Passing threshold: {completion.scenario.passing_threshold}%</p>
            </div>
            <div>
              {completion.passed ? (
                <div className="bg-[#2E7D32] bg-opacity-10 border border-[#2E7D32] border-opacity-20 text-[#2E7D32] px-6 py-3 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 mr-2" />
                  <span className="font-bold text-lg">PASSED</span>
                </div>
              ) : (
                <div className="bg-[#C62828] bg-opacity-10 border border-[#C62828] border-opacity-20 text-[#C62828] px-6 py-3 rounded-lg flex items-center justify-center">
                  <XCircle className="w-6 h-6 mr-2" />
                  <span className="font-bold text-lg">FAILED</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-[#E0E0E0] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E0E0E0]">
              <h3 className="text-lg font-semibold text-[#212121]">Procedural Steps</h3>
            </div>
            <div className="divide-y divide-[#E0E0E0]">
              {steps.sort((a, b) => a.step_index - b.step_index).map((step) => (
                <div key={step.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5">
                        {step.correct ? (
                          <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />
                        ) : (
                          <XCircle className="w-5 h-5 text-[#C62828]" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#212121] capitalize">
                          Step {step.step_index}: {step.step_key.replace(/_/g, " ")}
                        </p>
                        <p className="text-sm text-[#757575] mt-1">Action: {step.action_taken}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${step.correct ? "text-[#2E7D32]" : "text-[#C62828]"}`}>
                        {step.points_awarded > 0 ? `+${step.points_awarded}` : "0"} pts
                      </p>
                      <p className="text-xs text-[#757575] mt-1 flex items-center justify-end">
                        <Clock className="w-3 h-3 mr-1" /> {step.time_taken_seconds}s
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {steps.length === 0 && (
                <div className="p-6 text-center text-[#757575]">
                  No step details recorded.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
