"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ClipboardList, Package, ArrowLeft, Shield, Menu, X, ToggleLeft } from "lucide-react";
import { MockDatabase } from "@/lib/db/mock-db";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [staffName, setStaffName] = useState("Staff Member");

  useEffect(() => {
    MockDatabase.init();
    const profile = MockDatabase.getProfile();
    if (profile.role === "CUSTOMER") {
      alert("Redirecting to storefront. You switched to customer role. Switch to Staff or Admin in header first.");
      router.push("/");
    } else {
      setStaffName(profile.name);
    }
  }, [pathname]);

  const navItems = [
    { name: "Order Fulfillment Queue", href: "/staff", icon: <ClipboardList size={18} /> },
    { name: "Batch Inventory (FEFO)", href: "/staff/inventory", icon: <Package size={18} /> },
  ];

  const handleRoleChange = (role: "CUSTOMER" | "STAFF" | "ADMIN") => {
    const profile = MockDatabase.getProfile();
    profile.role = role;
    MockDatabase.updateProfile(profile);
    if (role === "CUSTOMER") router.push("/orders");
    else if (role === "STAFF") router.push("/staff");
    else router.push("/admin");
  };

  return (
    <div className="min-h-screen bg-background flex text-text font-sans">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-primary text-background border-r border-border/30 shrink-0">
        <div className="p-6 border-b border-border/30 bg-primary-hover/40">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="font-display font-black text-xl text-background tracking-tight">SafeSnack</span>
            <span className="text-[8px] bg-accent text-background px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
              Staff
            </span>
          </Link>
          <span className="text-[10px] text-background/50 uppercase tracking-widest font-semibold mt-1 block">
            Fulfillment Center
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 text-xs text-left">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  isActive
                    ? "bg-[#FAF8F3]/10 text-background shadow-xs border-l-2 border-accent"
                    : "text-background/70 hover:bg-background/10 hover:text-background"
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border/30 bg-primary-hover/30 space-y-3">
          <div className="text-[11px] text-background/50 flex items-center gap-1.5 justify-center">
            <Shield size={12} className="text-accent" />
            Role Quick Switcher
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[9px] font-bold">
            <button
              onClick={() => handleRoleChange("CUSTOMER")}
              className="bg-background/10 hover:bg-background/20 text-background py-2 rounded-lg cursor-pointer"
            >
              Customer View
            </button>
            <button
              onClick={() => handleRoleChange("ADMIN")}
              className="bg-background/10 hover:bg-background/20 text-background py-2 rounded-lg cursor-pointer"
            >
              Admin View
            </button>
          </div>
          <Link
            href="/"
            className="flex items-center justify-center gap-1.5 text-xs text-background/65 hover:text-background pt-1 block text-center"
          >
            <ArrowLeft size={12} />
            Back to Storefront
          </Link>
        </div>
      </aside>

      {/* Mobile Sidebar overlay */}
      {mobileSidebar && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-text/40" onClick={() => setMobileSidebar(false)} />
          <div className="relative w-64 bg-primary text-background flex flex-col p-6 z-10">
            <div className="flex items-center justify-between border-b border-border/30 pb-4 mb-4">
              <span className="font-display font-black text-lg text-background">Staff Portal</span>
              <button onClick={() => setMobileSidebar(false)} className="text-background/60">
                <X size={20} />
              </button>
            </div>
            
            <nav className="flex-1 space-y-2 text-xs text-left">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileSidebar(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold block ${
                    pathname === item.href ? "bg-background/10 text-background border-l-2 border-accent" : "text-background/70"
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-background border-b border-border h-16 flex items-center justify-between px-6 lg:px-8 shrink-0">
          <button
            onClick={() => setMobileSidebar(true)}
            className="p-2 -ml-2 text-text hover:text-primary lg:hidden cursor-pointer"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center gap-3 ml-auto text-xs">
            <div className="text-right hidden sm:block">
              <span className="font-bold text-text block">{staffName}</span>
              <span className="text-[10px] text-text/40 block">Warehouse Associate</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-accent text-background flex items-center justify-center font-bold">
              S
            </div>
          </div>
        </header>

        {/* Content viewport */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
