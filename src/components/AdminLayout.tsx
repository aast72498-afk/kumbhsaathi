'use client';
import {
    SidebarProvider,
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter,
    SidebarTrigger,
    SidebarInset,
} from '@/components/ui/sidebar';
import {
    LayoutDashboard,
    Users,
    Search,
    Siren,
    BookMarked,
    FileText,
    Triangle,
    Clock,
    LogOut,
    Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from './ui/button';
import React, { useState, useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isVerified, setIsVerified] = useState(false);
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        try {
            const isAuthenticated = sessionStorage.getItem('isAdminAuthenticated') === 'true';
            if (!isAuthenticated) {
                router.replace('/login');
            } else {
                setIsVerified(true);
            }
        } catch (e) {
            // sessionStorage is not available
            router.replace('/login');
        }
    }, [router]);

    useEffect(() => {
        const timer = setInterval(() => {
            const time = new Date().toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Asia/Kolkata',
                hour12: true,
            });
            setCurrentTime(time);
        }, 1000);
        return () => clearInterval(timer);
    }, []);


    if (!isVerified) {
        return (
            <div className="dark bg-background text-foreground min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="dark bg-background text-foreground min-h-screen">
            <SidebarProvider>
                <Sidebar>
                    <SidebarHeader>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" asChild>
                                <Link href="/admin">
                                    <Triangle className="size-5 fill-primary stroke-primary" />
                                </Link>
                            </Button>
                            <h2 className="text-lg font-semibold tracking-tighter">KumbhSaathi</h2>
                        </div>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === '/admin'}>
                                    <Link href="/admin"><LayoutDashboard />Dashboard</Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === '/admin/crowd-intelligence'}>
                                    <Link href="/admin/crowd-intelligence"><Users />Crowd Intelligence</Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === '/admin/missing-persons'}>
                                    <Link href="/admin/missing-persons"><Search />Missing Persons</Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === '/admin/emergency-dispatch'}>
                                    <Link href="/admin/emergency-dispatch"><Siren />Emergency Dispatch</Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href="/"><BookMarked />Ghat Booking</Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                             <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === '/admin/system-logs'}>
                                    <Link href="/admin/system-logs"><FileText />System Logs</Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarContent>
                    <SidebarFooter>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton href="/"><LogOut/>Exit to Public View</SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarFooter>
                </Sidebar>
                <SidebarInset>
                    <header className="flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6 sticky top-0 z-30">
                         <div className="flex items-center gap-2">
                            <SidebarTrigger className="md:hidden" />
                            <h1 className="text-xl font-semibold hidden md:block">Live Control Room: Nashik</h1>
                         </div>
                        <div className="flex-1"></div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-sm font-medium text-muted-foreground">Real-time Sync</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>{currentTime || '...'}</span>
                            </div>
                        </div>
                    </header>
                    <main className="flex-1 p-4 lg:p-6">{children}</main>
                    <footer className="border-t px-6 py-3 text-center text-xs text-muted-foreground">
                       No Facial Data Stored | Real-time Firebase Sync | Auto-Delete Enabled
                    </footer>
                </SidebarInset>
            </SidebarProvider>
        </div>
    );
}
