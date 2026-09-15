"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import { 
  LayoutDashboard, 
  Users, 
  BookOpenCheck, 
  BarChart3, 
  Smartphone, 
  ShieldCheck, 
  LogOut,
  Bell,
  ChevronDown,
  Menu,
  FileCheck
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Workers", href: "/dashboard/workers", icon: Users },
  { name: "Training", href: "/dashboard/completions", icon: BookOpenCheck },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Devices", href: "/dashboard/devices", icon: Smartphone },
  { name: "Verify", href: "/dashboard/verify", icon: ShieldCheck },
  { name: "Audit Log", href: "/dashboard/audit", icon: FileCheck },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const userCookie = Cookies.get("user");
    if (userCookie) {
      setUser(JSON.parse(userCookie));
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("user");
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-[#F5F5F5] overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#1A237E] text-white transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-center h-16 border-b border-[#2a349c]">
          <ShieldCheck className="w-8 h-8 text-[#236B6B] mr-2" />
          <h1 className="text-xl font-bold tracking-wider">KHANAN MITRA</h1>
        </div>
        
        <nav className="flex-1 px-4 mt-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-[#236B6B] text-white" 
                    : "text-gray-300 hover:bg-[#2a349c] hover:text-white"
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 ${isActive ? "text-white" : "text-gray-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#2a349c]">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-[#2a349c] hover:text-white transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5 text-gray-400" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-[#E0E0E0] h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 mr-2 text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold text-[#212121] hidden sm:block">Dashboard</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-500 relative">
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-[#C62828] ring-2 ring-white" />
              <Bell className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex items-center cursor-pointer">
              <div className="hidden md:block text-right mr-3">
                <p className="text-sm font-medium text-[#212121]">{user?.full_name || "Admin"}</p>
                <p className="text-xs text-[#757575] capitalize">{user?.role?.replace("_", " ") || "Role"}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-[#236B6B] flex items-center justify-center text-white font-bold text-sm">
                {user?.full_name?.charAt(0) || "A"}
              </div>
              <ChevronDown className="ml-2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </header>

        {/* Main scrollable area */}
        <main className="flex-1 overflow-y-auto bg-[#F5F5F5] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
