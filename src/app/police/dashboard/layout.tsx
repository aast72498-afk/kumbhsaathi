'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Shield, LogOut, LayoutDashboard, Search, Siren } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PoliceDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const [officerName, setOfficerName] = useState('');
  
  useEffect(() => {
    try {
      const isAuthenticated = sessionStorage.getItem('ks-police-auth') === 'true';
      const name = sessionStorage.getItem('ks-police-name');
      if (!isAuthenticated || !name) {
        router.replace('/police');
      } else {
        setOfficerName(name);
        setIsVerified(true);
      }
    } catch (e) {
      router.replace('/police');
    }
  }, [router]);

  const handleLogout = () => {
    try {
        sessionStorage.removeItem('ks-police-auth');
        sessionStorage.removeItem('ks-police-name');
        sessionStorage.removeItem('ks-police-badge');
        sessionStorage.removeItem('ks-police-sector');
    } finally {
        router.push('/police');
    }
  };

  if (!isVerified) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 flex flex-col p-4 border-r border-slate-300 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-8">
            <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold">Command Center</span>
        </div>
        <nav className="flex-1 space-y-2">
            <Button variant="ghost" className="w-full justify-start text-base bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-white">
                <LayoutDashboard className="mr-2 h-5 w-5" />
                Live Monitor
            </Button>
             <Button variant="ghost" className="w-full justify-start text-base">
                <Search className="mr-2 h-5 w-5" />
                Case Search
            </Button>
            <Button variant="ghost" className="w-full justify-start text-base">
                <Siren className="mr-2 h-5 w-5" />
                Alerts
            </Button>
        </nav>
        <div className="mt-auto">
            <div className='text-center mb-4'>
                <p className="text-sm font-semibold">{officerName}</p>
                <p className="text-xs text-muted-foreground">On Duty</p>
            </div>
            <Button variant="secondary" className="w-full" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-[#002366] text-white flex items-center justify-between p-4 shadow-md z-10">
            <div className="flex items-center gap-4">
                 {/* Placeholder for Nashik Police Logo */}
                <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">NP</div>
                <h1 className="text-2xl font-semibold tracking-wider">NASHIK POLICE: KUMBH MELA 2027</h1>
            </div>
             <div className="flex items-center gap-4">
                 <p className="text-lg font-medium">Live Operations</p>
                 {/* Placeholder for Kumbh Mela 2027 Logo */}
                 <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">KM</div>
            </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
            {children}
        </main>
      </div>
    </div>
  );
}
