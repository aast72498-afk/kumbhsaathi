'use client';

import { useMemo, useEffect, useState } from 'react';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { MissingPersonReport, HealthEmergencyAlert } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BroadcastAlertForm } from '@/components/BroadcastAlertForm';
import { AlertCircle, Ambulance, ArrowRight, ShieldAlert, UserSearch, HeartPulse, Loader2, Users, AlertTriangle } from "lucide-react";
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

type CombinedAlert = (
    (MissingPersonReport & { id: string; type: 'Missing Person' }) |
    (HealthEmergencyAlert & { id: string; type: 'Health Emergency' })
);

const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <Card className={cn("bg-card/40 backdrop-blur-lg border-border/50", className)}>
        {children}
    </Card>
);

const KpiCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
    <GlassCard>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <div className="text-muted-foreground">{icon}</div>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </GlassCard>
);


export default function AdminDashboard() {
  const firestore = useFirestore();

  const missingPersonsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'missing_persons'), orderBy('createdAt', 'desc'), limit(5)) : null, [firestore]);
  const healthAlertsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'emergency_alerts'), orderBy('createdAt', 'desc'), limit(5)) : null, [firestore]);
  
  const { data: missingPersons, loading: mpLoading } = useCollection<MissingPersonReport & { id: string }>(missingPersonsQuery);
  const { data: healthAlerts, loading: haLoading } = useCollection<HealthEmergencyAlert & { id: string }>(healthAlertsQuery);
  const [isClient, setIsClient] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);


  useEffect(() => {
    setIsClient(true);
  }, []);

  const allAlerts = useMemo(() => {
    if (!missingPersons && !healthAlerts) return [];
    
    const combined = [
        ...(missingPersons || []).map(a => ({ ...a, type: 'Missing Person' as const })),
        ...(healthAlerts || []).map(a => ({ ...a, type: 'Health Emergency' as const })),
    ];
    
    return combined.sort((a, b) => {
        const timeA = a.createdAt?.toMillis() || 0;
        const timeB = b.createdAt?.toMillis() || 0;
        return timeB - timeA;
    }).slice(0, 5);
  }, [missingPersons, healthAlerts]);
  
  const hasActiveHealthEmergency = useMemo(() => {
      return healthAlerts?.some(alert => alert.status === 'Pending' || alert.status === 'On-site');
  }, [healthAlerts]);

  const getAlertIcon = (type: 'Missing Person' | 'Health Emergency') => {
    switch (type) {
        case 'Missing Person':
            return <UserSearch className="h-5 w-5 text-primary" />;
        case 'Health Emergency':
            return <HeartPulse className="h-5 w-5 text-amber-500" />;
        default:
            return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };
  
  const getAlertLink = (alert: CombinedAlert) => {
    switch (alert.type) {
        case 'Missing Person': return '/admin/missing-persons';
        case 'Health Emergency': return '/admin/emergency-dispatch';
        default: return '/admin';
    }
  }

  const totalPilgrims = 12345; // Placeholder
  const activeAlertsCount = allAlerts.length;

  return (
    <div className="grid gap-4 md:gap-6 grid-cols-12 auto-rows-[minmax(100px,auto)]">
        
        <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <KpiCard title="Total Pilgrims" value={totalPilgrims.toLocaleString()} icon={<Users className="h-4 w-4" />} />
            <KpiCard title="Available Ghat Capacity" value="8,500" icon={<Users className="h-4 w-4" />} />
            <KpiCard title="Active Emergency Alerts" value={activeAlertsCount} icon={<AlertTriangle className="h-4 w-4 text-destructive" />} />
        </div>

        <div className="col-span-12 lg:col-span-8 row-span-3">
             <GlassCard className="h-full min-h-[400px]">
                <CardHeader>
                    <CardTitle>3D Digital Twin - Nashik</CardTitle>
                    <CardDescription>Real-time crowd density and incident monitoring.</CardDescription>
                </CardHeader>
                <CardContent className="h-full">
                    <div className="relative h-[calc(100%-4rem)] w-full rounded-lg bg-black/30 border flex items-center justify-center">
                        <p className="text-muted-foreground">Interactive 3D Map Placeholder</p>
                        {/* Placeholder for Map elements */}
                        <div className="absolute top-10 left-10 p-4 bg-background/50 backdrop-blur-md rounded-lg shadow-lg border">
                            <h3 className="font-bold">Ram Kund</h3>
                            <p className="text-blue-400">Crowd: Low</p>
                        </div>
                        <div className="absolute top-40 left-60 p-4 bg-background/50 backdrop-blur-md rounded-lg shadow-lg border">
                            <h3 className="font-bold">Tapovan Ghat</h3>
                            <p className="text-yellow-400">Crowd: Moderate</p>
                        </div>
                        <div className="absolute bottom-20 right-20 p-4 bg-background/50 backdrop-blur-md rounded-lg shadow-lg border">
                            <h3 className="font-bold">Laxman Kund</h3>
                            <p className="text-destructive">Crowd: High</p>
                        </div>
                        <div className="absolute bottom-1/2 right-1/2 p-2 bg-primary/80 rounded-full shadow-lg border-2 border-white animate-pulse">
                            <Ambulance className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </CardContent>
            </GlassCard>
        </div>

        <div className="col-span-12 lg:col-span-4 row-span-2">
            <GlassCard className="h-full">
                <CardHeader>
                    <CardTitle>Live Alerts Feed</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {(mpLoading || haLoading) && !isClient && (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    )}

                    {isClient && !mpLoading && !haLoading && allAlerts.length === 0 && (
                        <div className="text-center text-muted-foreground p-4">
                            <ShieldAlert className="h-8 w-8 mx-auto mb-2 text-green-500" />
                            <p>System is stable. No active alerts.</p>
                        </div>
                    )}
                    
                    {isClient && allAlerts.map((alert) => {
                        const isNew = alert.createdAt && (new Date().getTime() - alert.createdAt.toDate().getTime()) < 5 * 60 * 1000;
                        return (
                            <Link href={getAlertLink(alert)} key={alert.id} className={cn(
                                "flex items-start gap-4 p-3 rounded-lg border transition-colors hover:bg-muted/50",
                                alert.type === 'Health Emergency' ? "border-amber-500/30" : "border-primary/30",
                                isNew && "animate-pulse"
                            )}>
                                <div className={cn("p-2 rounded-full", alert.type === 'Health Emergency' ? "bg-amber-500/20" : "bg-primary/20")}>
                                    {getAlertIcon(alert.type)}
                                </div>
                                <div>
                                    <p className="font-semibold">
                                        {alert.type === 'Missing Person' ? `Missing: ${alert.missingPersonName}` : `Health: ${alert.issueType}`}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {alert.createdAt ? `${formatDistanceToNow(alert.createdAt.toDate())} ago` : 'Just now'} at {alert.type === 'Missing Person' ? alert.lastSeenGhat : alert.locationGhat}
                                    </p>
                                </div>
                                <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                            </Link>
                        )
                    })}
                </CardContent>
            </GlassCard>
        </div>
        
        <div className="col-span-12 lg:col-span-4 row-span-1">
             <GlassCard className="h-full">
                <CardHeader>
                    <CardTitle>Dispatch Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-2">
                    <Button variant="destructive" className="w-full justify-start" disabled={!hasActiveHealthEmergency}>Clear Emergency Route</Button>
                    <Dialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">Broadcast Crowd Alert</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[480px] bg-background/80 backdrop-blur-xl">
                        <DialogHeader>
                        <DialogTitle>Broadcast Crowd Alert</DialogTitle>
                        <DialogDescription>
                            Fill in the details below. An alert will be prepared for you to send via Telegram.
                        </DialogDescription>
                        </DialogHeader>
                        <div className="pt-4">
                        <BroadcastAlertForm setOpen={setIsAlertDialogOpen} />
                        </div>
                    </DialogContent>
                    </Dialog>
                    <Button variant="outline" className="w-full justify-start">Lock Ghat Entry</Button>
                </CardContent>
            </GlassCard>
        </div>
    </div>
  );
}
