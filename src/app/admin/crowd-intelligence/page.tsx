'use client';

import { useState, useEffect } from 'react';
import { collection } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Ghat } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Loader2, Users, TrendingUp, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type HeatmapLocation = {
    id: string;
    name: string;
    count: number;
    capacity: number;
    status: 'LOW' | 'MODERATE' | 'HIGH';
    density: number;
};

const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <Card className={cn("bg-card/40 backdrop-blur-lg border-border/50", className)}>
        {children}
    </Card>
);

const getDensityInfo = (count: number, capacity: number) => {
    if (capacity === 0) return {
        status: 'LOW' as const,
        colorClasses: 'bg-blue-500/10 border-blue-500/30',
        textColor: 'text-blue-400',
        glowClasses: 'shadow-[0_0_20px_rgba(59,130,246,0.2)]',
        density: 0
    };
    
    const density = (count / capacity) * 100;
    
    if (density > 75) {
        return {
            status: 'HIGH' as const,
            colorClasses: 'bg-destructive/10 border-destructive/30',
            textColor: 'text-destructive',
            glowClasses: 'shadow-[0_0_20px_rgba(239,128,40,0.3)]',
            density
        };
    }
    if (density > 40) {
        return {
            status: 'MODERATE' as const,
            colorClasses: 'bg-yellow-500/10 border-yellow-500/30',
            textColor: 'text-yellow-400',
            glowClasses: 'shadow-[0_0_20px_rgba(234,179,8,0.2)]',
            density
        };
    }
    return {
        status: 'LOW' as const,
        colorClasses: 'bg-blue-500/10 border-blue-500/30',
        textColor: 'text-blue-400',
        glowClasses: 'shadow-[0_0_20px_rgba(59,130,246,0.2)]',
        density
    };
};


const HeatmapBlock = ({ location }: { location: HeatmapLocation }) => {
    const { status, colorClasses, textColor, glowClasses } = getDensityInfo(location.count, location.capacity);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={cn(
                'relative flex flex-col justify-between p-6 rounded-2xl border transition-all duration-300 h-48',
                'bg-card/40 backdrop-blur-lg',
                colorClasses,
                glowClasses
            )}
        >
            <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-foreground">{location.name}</h3>
                <span className={cn("text-xs font-bold px-2 py-1 rounded-full", textColor, colorClasses)}>
                    {status} - {Math.round(location.density)}%
                </span>
            </div>
            <div className="text-right mt-8">
                <p className="text-4xl font-black text-foreground flex items-center justify-end gap-2">
                    <Users className="h-7 w-7 text-muted-foreground" />
                    {location.count.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Estimated Crowd</p>
            </div>
             <div className="absolute bottom-0 left-0 w-full h-1 bg-foreground/10 rounded-b-xl overflow-hidden">
                <div 
                    className={cn(
                        "h-full rounded-b-xl transition-all duration-500",
                        status === 'HIGH' && 'bg-destructive',
                        status === 'MODERATE' && 'bg-yellow-500',
                        status === 'LOW' && 'bg-primary'
                    )}
                    style={{ width: `${location.density}%` }}
                ></div>
            </div>
        </motion.div>
    );
};

const PredictiveCard = ({ ghatName, prediction }: { ghatName: string, prediction: number }) => (
    <GlassCard>
        <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2"><Cpu className="h-4 w-4"/> AI Prediction</CardDescription>
            <CardTitle className="text-lg">{ghatName}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-3xl font-bold text-primary flex items-center gap-2">
                 <TrendingUp className="h-7 w-7" />
                ~{prediction.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Predicted pilgrim count in 30 mins.</p>
        </CardContent>
    </GlassCard>
);


export default function CrowdIntelligencePage() {
    const firestore = useFirestore();
    const ghatsCollection = useMemoFirebase(() => (firestore ? collection(firestore, 'ghats') : null), [firestore]);
    const { data: ghats, loading: ghatsLoading, error: ghatsError } = useCollection<Ghat>(ghatsCollection);
    
    const [liveData, setLiveData] = useState<HeatmapLocation[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        const staticLocations = [
            { id: 'godavari-ghat', name: 'Godavari Ghat', count: 320, capacity: 600 },
            { id: 'panchavati-area', name: 'Panchavati Area', count: 850, capacity: 1200 },
            { id: 'trimbak-ghat', name: 'Trimbak Ghat', count: 150, capacity: 400 },
        ];
        
        const updateData = () => {
             const allLocations = [
                ...(ghats || []).map(ghat => {
                     const count = ghat.timeSlots.reduce((sum, slot) => sum + slot.currentRegistrations, 0);
                     const capacity = ghat.timeSlots.reduce((sum, slot) => sum + slot.maxCapacity, 0);
                     const simulatedCount = Math.min(capacity, Math.floor(count + (Math.random() - 0.45) * 20));
                     return { id: ghat.id, name: ghat.name, count: Math.max(0, simulatedCount), capacity };
                }),
                ...staticLocations.map(loc => {
                    const simulatedCount = Math.min(loc.capacity, Math.floor(loc.count + (Math.random() - 0.45) * 50));
                     return { ...loc, count: Math.max(0, simulatedCount) };
                })
             ];

             const processedData = allLocations.map(loc => {
                 const { status, density } = getDensityInfo(loc.count, loc.capacity);
                 return { ...loc, status, density };
             });

             setLiveData(processedData);
        }
        
        if (isClient) {
            updateData();
            const timer = setInterval(updateData, 3000);
            return () => clearInterval(timer);
        }
    }, [ghats, isClient]);


    if (!isClient || (ghatsLoading && liveData.length === 0)) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Crowd Density Intelligence
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <GlassCard key={i} className="h-48 flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </GlassCard>
                    ))}
                </div>
            </div>
        );
    }
    
    if (ghatsError) {
        return <p className="text-destructive p-6">Failed to load live data for heatmap.</p>
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Crowd Density Intelligence
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {liveData.slice(0,3).map(location => (
                    <PredictiveCard key={`pred-${location.id}`} ghatName={location.name} prediction={Math.floor(location.count * (1 + (Math.random() * 0.2 - 0.05)))} />
                ))}
                 <PredictiveCard ghatName="Overall" prediction={liveData.reduce((acc, loc) => acc + Math.floor(loc.count * 1.05), 0)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveData.map(location => (
                    <HeatmapBlock key={location.id} location={location} />
                ))}
            </div>
        </div>
    );
}
