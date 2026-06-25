"use client";

import React, { useEffect, useState } from "react";
import { LayoutTemplate, Sparkles, CheckCircle, ArrowLeft } from "lucide-react";
import { MockDatabase, HomepageCms } from "@/lib/db/mock-db";
import { Button } from "@/components/ui/button";

export default function AdminHomepageCms() {
  const [cms, setCms] = useState<HomepageCms | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    MockDatabase.init();
    setCms(MockDatabase.getCms());
  }, []);

  const handleCmsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cms) return;

    MockDatabase.updateCms(cms);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  if (!cms) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F1EA]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left max-w-3xl animate-fade-in">
      
      {/* Page Header */}
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-text tracking-tight flex items-center gap-2">
          <LayoutTemplate size={28} className="text-primary" />
          Homepage Content CMS (No-Code)
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Control the main marketing copy, call-to-actions, and top announcement banner of your storefront without writing code or deploying.
        </p>
      </div>

      {saveSuccess && (
        <div className="bg-[#EBF7EE] border border-[#D6ECD9] text-[#2F5233] p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle size={16} />
          ✓ Homepage CMS configurations saved successfully! Changes are live on the storefront immediately.
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleCmsSubmit} className="bg-background border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs text-xs">
        
        {/* Banner */}
        <div className="space-y-2">
          <span className="font-display font-bold text-sm text-primary block">Announcement Banner</span>
          <div className="space-y-1">
            <label className="font-bold text-text-muted uppercase block">Top Header Announcement Text</label>
            <input
              type="text"
              required
              value={cms.bannerText || ""}
              onChange={(e) => setCms({ ...cms, bannerText: e.target.value })}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-text focus:outline-none"
            />
          </div>
        </div>

        {/* Hero Details */}
        <div className="space-y-4 border-t border-border pt-4">
          <span className="font-display font-bold text-sm text-primary block">Hero Section Marketing</span>
          
          <div className="space-y-1">
            <label className="font-bold text-text-muted uppercase block">Hero Big Title</label>
            <input
              type="text"
              required
              value={cms.heroTitle}
              onChange={(e) => setCms({ ...cms, heroTitle: e.target.value })}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-text focus:outline-none font-display font-bold text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-text-muted uppercase block">Hero Subtitle Paragraph</label>
            <textarea
              required
              rows={3}
              value={cms.heroSubtitle}
              onChange={(e) => setCms({ ...cms, heroSubtitle: e.target.value })}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-text focus:outline-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-text-muted uppercase block">CTA Button Text</label>
              <input
                type="text"
                required
                value={cms.heroCtaText}
                onChange={(e) => setCms({ ...cms, heroCtaText: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-text focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-text-muted uppercase block">CTA Button Link</label>
              <input
                type="text"
                required
                value={cms.heroCtaLink}
                onChange={(e) => setCms({ ...cms, heroCtaLink: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-text focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-text-muted uppercase block">Hero Cover Photo URL</label>
            <input
              type="text"
              required
              value={cms.heroImage}
              onChange={(e) => setCms({ ...cms, heroImage: e.target.value })}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-text focus:outline-none"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-2 justify-end border-t border-border pt-6">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="font-bold cursor-pointer"
          >
            Update Homepage Copy
          </Button>
        </div>

      </form>
    </div>
  );
}
