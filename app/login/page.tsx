"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { fetchAPI } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetchAPI("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error("Invalid email or password");
      }

      const data = await res.json();
      Cookies.set("token", data.access_token, { expires: 1 });
      Cookies.set("user", JSON.stringify(data.user), { expires: 1 });
      
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-[#E0E0E0] overflow-hidden">
        <div className="bg-[#1A237E] p-8 text-center text-white">
          <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-[#236B6B]" />
          <h1 className="text-2xl font-bold tracking-wide">KHANAN MITRA</h1>
          <p className="text-sm mt-2 opacity-90 text-balance">Industrial Safety Training & Compliance Portal</p>
        </div>
        
        <div className="p-8">
          <h2 className="text-xl font-semibold text-[#212121] mb-6 text-center">Administrator Login</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-[#C62828] bg-opacity-10 text-[#C62828] border border-[#C62828] border-opacity-20 rounded-md text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#757575] mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-[#E0E0E0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#236B6B] focus:border-transparent text-[#212121]"
                  placeholder="admin@khananmitra.demo"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#757575] mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-[#E0E0E0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#236B6B] focus:border-transparent text-[#212121]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#236B6B] hover:bg-[#1b5151] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#236B6B] transition-colors disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
