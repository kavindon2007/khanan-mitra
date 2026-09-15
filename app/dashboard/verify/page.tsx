"use client";

import { useState } from "react";
import { fetchAPI } from "@/lib/api";
import { CertificateVerification } from "@/types/api";
import { ShieldCheck, Search, ShieldAlert, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function VerifyPage() {
  const [token, setToken] = useState("");
  const [result, setResult] = useState<CertificateVerification | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetchAPI("/api/verify", {
        method: "POST",
        body: JSON.stringify({ token: token.trim() }),
      });

      if (!res.ok) {
        throw new Error("Verification request failed. Please check the token format.");
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status: string | undefined) => {
    switch (status) {
      case "valid":
        return (
          <div className="bg-[#2E7D32] bg-opacity-10 border border-[#2E7D32] border-opacity-20 text-[#2E7D32] px-6 py-4 rounded-xl flex items-center justify-center space-x-3">
            <ShieldCheck className="w-8 h-8" />
            <span className="font-bold text-xl uppercase tracking-wider">Valid Certificate</span>
          </div>
        );
      case "expired":
        return (
          <div className="bg-[#C62828] bg-opacity-10 border border-[#C62828] border-opacity-20 text-[#C62828] px-6 py-4 rounded-xl flex items-center justify-center space-x-3">
            <ShieldAlert className="w-8 h-8" />
            <span className="font-bold text-xl uppercase tracking-wider">Expired Certificate</span>
          </div>
        );
      case "revoked":
        return (
          <div className="bg-[#C62828] bg-opacity-10 border border-[#C62828] border-opacity-20 text-[#C62828] px-6 py-4 rounded-xl flex items-center justify-center space-x-3">
            <AlertCircle className="w-8 h-8" />
            <span className="font-bold text-xl uppercase tracking-wider">Revoked Certificate</span>
          </div>
        );
      case "not_issued":
      case "invalid":
      default:
        return (
          <div className="bg-gray-100 border border-gray-300 text-gray-800 px-6 py-4 rounded-xl flex items-center justify-center space-x-3">
            <AlertCircle className="w-8 h-8 text-gray-500" />
            <span className="font-bold text-xl uppercase tracking-wider">Invalid or Unknown Token</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <ShieldCheck className="w-16 h-16 text-[#236B6B] mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-[#1A237E]">Certificate Verification</h1>
        <p className="text-[#757575] mt-2 max-w-lg mx-auto">
          Enter a certificate token to securely verify training compliance against the Khanan Mitra central registry.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-[#E0E0E0] p-6 sm:p-10">
        <form onSubmit={handleVerify} className="max-w-xl mx-auto space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Enter Certificate Token ID..."
              className="block w-full pl-12 pr-4 py-4 text-lg border-2 border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-4 focus:ring-[#236B6B] focus:border-[#236B6B] text-[#212121] transition-all"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || !token.trim()}
            className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-[#1A237E] hover:bg-[#151c66] focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-[#1A237E] transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : (
              "Verify Certificate"
            )}
          </button>
        </form>

        {error && (
          <div className="mt-8 p-4 bg-[#C62828] bg-opacity-10 border border-[#C62828] border-opacity-20 rounded-lg text-center text-[#C62828] max-w-xl mx-auto">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              {getStatusDisplay(result.status)}
            </div>

            {result.worker && result.training && (
              <div className="border border-[#E0E0E0] rounded-xl overflow-hidden shadow-sm">
                <div className="bg-[#F5F5F5] px-6 py-4 border-b border-[#E0E0E0]">
                  <h3 className="text-lg font-bold text-[#212121]">Certified Personnel Details</h3>
                </div>
                <div className="px-6 py-6 bg-white grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-[#757575]">Worker Name</dt>
                    <dd className="mt-1 text-lg font-semibold text-[#212121]">{result.worker.full_name}</dd>
                    <dd className="text-sm text-[#757575]">ID: {result.worker.short_worker_id}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-[#757575]">Training Location</dt>
                    <dd className="mt-1 text-lg font-semibold text-[#212121]">{result.worker.vtc}</dd>
                  </div>
                  <div className="md:col-span-2 border-t border-[#E0E0E0] pt-6">
                    <dt className="text-xs font-bold uppercase tracking-wider text-[#757575]">Certified Competency</dt>
                    <dd className="mt-1 text-xl font-bold text-[#1A237E]">{result.training.scenario}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-[#757575]">Assessment Score</dt>
                    <dd className="mt-1 text-lg font-semibold text-[#2E7D32] flex items-center">
                      <CheckCircle2 className="w-5 h-5 mr-1.5" />
                      {result.training.score}%
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-[#757575]">Completion Date</dt>
                    <dd className="mt-1 text-lg font-semibold text-[#212121]">
                      {result.completed_at ? format(new Date(result.completed_at), "PPP") : "N/A"}
                    </dd>
                    <dd className="text-sm text-[#757575]">
                      {result.expires_at ? `Valid until ${format(new Date(result.expires_at), "PP")}` : ""}
                    </dd>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
