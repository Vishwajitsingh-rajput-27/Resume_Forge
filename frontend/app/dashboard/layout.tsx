'use client';
import { useState } from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuthStore } from '@/store/auth-store';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuthStore();

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-base)]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-[var(--border-default)] bg-[var(--bg-elevated)] shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] w-56">
              <Search className="w-4 h-4 text-[var(--text-muted)]" />
              <span className="text-sm text-[var(--text-muted)]">Search…</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)] relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00C896]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00C896] to-[#6C63FF] flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
