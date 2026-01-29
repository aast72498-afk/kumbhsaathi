'use client';

import { useState, useEffect } from 'react';
import { collection } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Ghat } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Loader2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// Define types for heatmap data
type HeatmapLocation = {
    id: string;
    name: string;
    count: number;
    capacity: number;
    status: 'LOW' | 'MODERATE' | 'HIGH';
    density: number;
};

// Helper to get status and colors
const getDensityInfo = (count: number, capacity: number) => {
    if (capacity === 0) return {
        status: 'LOW' as const,
        colorClasses: 'from-green-500/20 to-green-500/5 border-green-500/50',
        glowClasses: 'shadow-[0_0_20px_rgba(74,222,128,0.3)]',
        density: 0
    };
    
    const density = (count / capacity) * 100;
    
    if (density > 75) {
        return {
            status: 'HIGH' as const,
            colorClasses: 'from-red-500/20 to-red-500/5 border-red-500/50',
            glowClasses: 'shadow-[0_0_20px_rgba(239,68,68,0.4)]',
            density
        };
    }
    if (density > 40) {
        return {
            status: 'MODERATE' as const,
            colorClasses: 'from-orange-500/20 to-orange-500/5 border-orange-500/50',
            glowClasses: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]',
            density
        };
    }
    return {
        status: 'LOW' as const,
        colorClasses: 'from-green-500/20 to-green-500/5 border-green-500/50',
        glowClasses: 'shadow-[0_0_20px_rgba(74,222,128,0.3)]',
        density
    };
};


// Heatmap Block Component
const HeatmapBlock = ({ location }: { location: HeatmapLocation }) => {
    const { status, colorClasses, glowClasses } = getDensityInfo(location.count, location.capacity);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={cn(
                'relative flex flex-col justify-between p-6 rounded-xl border bg-gradient-to-br transition-all duration-300 h-48',
                colorClasses,
                glowClasses
            )}
        >
            <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-white">{location.name}</h3>
                <span className={cn(
                    "text-xs font-bold px-2 py-1 rounded-full",
                    status === 'HIGH' && 'bg-red-500/80 text-white',
                    status === 'MODERATE' && 'bg-orange-500/80 text-white',
                    status === 'LOW' && 'bg-green-500/80 text-white'
                )}>
                    {status}
                </span>
            </div>
            <div className="text-right mt-8">
                <p className="text-4xl font-black text-white flex items-center justify-end gap-2">
                    <Users className="h-7 w-7 text-white/50" />
                    {location.count}
                </p>
                <p className="text-sm text-white/60">Estimated Crowd</p>
            </div>
             <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 rounded-b-xl overflow-hidden">
                <div 
                    className={cn(
                        "h-full rounded-b-xl transition-all duration-500",
                        status === 'HIGH' && 'bg-red-500',
                        status === 'MODERATE' && 'bg-orange-500',
                        status === 'LOW' && 'bg-green-500'
                    )}
                    style={{ width: `${location.density}%` }}
                ></div>
            </div>
        </motion.div>
    );
};


export default function CrowdIntelligencePage() {
    const firestore = useFirestore();
    const ghatsCollection = useMemoFirebase(() => (firestore ? collection(firestore, 'ghats') : null), [firestore]);
    const { data: ghats, loading: ghatsLoading, error: ghatsError } = useCollection<Ghat>(ghatsCollection);
    
    // Using state to make data feel "live"
    const [liveData, setLiveData] = useState<HeatmapLocation[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        // Initial static data
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
                     // Add some randomness to simulate live data
                     const simulatedCount = Math.min(capacity, Math.floor(count + (Math.random() - 0.45) * 20));
                     return { id: ghat.id, name: ghat.name, count: Math.max(0, simulatedCount), capacity };
                }),
                ...staticLocations.map(loc => {
                    // Add some randomness to simulate live data
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
        
        // Only run the interval on the client
        if (isClient) {
            updateData(); // Initial call
            const timer = setInterval(updateData, 3000); // Update every 3 seconds
            return () => clearInterval(timer);
        }
    }, [ghats, isClient]);


    if (!isClient || (ghatsLoading && liveData.length === 0)) {
        return (
            <div className="p-4 lg:p-6">
                <h1 className="text-2xl font-bold tracking-tight text-white mb-6">
                    Crowd Density Heatmap – Kumbh Mela, Nashik
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(5)].map((_, i) => (
                        <Card key={i} className="h-48 bg-white/5 flex items-center justify-center border-border">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </Card>
                    ))}
                </div>
            </div>
        );
    }
    
    if (ghatsError) {
        return <p className="text-destructive p-6">Failed to load live data for heatmap.</p>
    }

    return (
        <div className="p-4 lg:p-6">
            <h1 className="text-2xl font-bold tracking-tight text-white mb-6">
                Crowd Density Heatmap – Kumbh Mela, Nashik
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveData.map(location => (
                    <HeatmapBlock key={location.id} location={location} />
                ))}
            </div>
        </div>
    );
}
