'use client';

import { useState, useMemo, useEffect } from 'react';
import { collection } from 'firebase/firestore';
import { useCollection, useFirestore } from '@/firebase';
import type { Ghat } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowDown, ArrowUp, Loader2, Minus, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type Trend = 'increasing' | 'decreasing' | 'stable';

const HeatmapPoint = ({ name, top, left, currentRegistrations, maxCapacity }: { name: string; top: string; left: string; currentRegistrations: number; maxCapacity: number; }) => {
    const density = maxCapacity > 0 ? (currentRegistrations / maxCapacity) * 100 : Math.random() * 100;
    
    let label = 'Low';
    let color = 'bg-green-500';
    if (density > 75) {
        label = 'High';
        color = 'bg-red-500';
    } else if (density > 40) {
        label = 'Moderate';
        color = 'bg-yellow-500';
    }

    const size = 25 + (density / 100) * 25; // size from 25px to 50px

    return (
        <div className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer" style={{ top, left }}>
            <div className={cn("relative rounded-full flex items-center justify-center font-bold text-white text-sm border-2 border-background/50 shadow-lg", color)} style={{ width: `${size}px`, height: `${size}px` }}>
                <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", color)}></span>
                <span className="relative z-10">{currentRegistrations}</span>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2">
                <span className="text-xs font-bold text-card-foreground bg-card/80 backdrop-blur-sm px-2 py-1 rounded-md shadow-md">{name}</span>
            </div>
        </div>
    );
};

const CrowdHeatmap = ({ ghats }: { ghats: Ghat[] | null }) => {
    // Positions for Ghats from Firestore
    const ghatPositions: { [key: string]: { top: string; left: string } } = {
        'ram-kund-ghat': { top: '25%', left: '30%' },
        'tapovan-ghat': { top: '50%', left: '70%' },
        'laxman-kund-ghat': { top: '75%', left: '45%' },
    };

    // Additional static locations
    const staticLocations = [
        { id: 'panchavati', name: 'Panchavati Area', position: { top: '40%', left: '50%' }, currentRegistrations: 730, maxCapacity: 1000 },
        { id: 'sita-gufa', name: 'Sita Gufa', position: { top: '30%', left: '15%' }, currentRegistrations: 150, maxCapacity: 300 },
        { id: 'kalaram-temple', name: 'Kalaram Temple', position: { top: '65%', left: '25%' }, currentRegistrations: 450, maxCapacity: 600 },
        { id: 'main-entry-north', name: 'Main Entry (North)', position: { top: '10%', left: '50%' }, currentRegistrations: 950, maxCapacity: 1200 },
        { id: 'exit-south', name: 'South Exit', position: { top: '90%', left: '60%' }, currentRegistrations: 250, maxCapacity: 800 },
        { id: 'trimbak-road', name: 'Trimbak Road Junction', position: { top: '85%', left: '15%' }, currentRegistrations: 600, maxCapacity: 700 },
        { id: 'gangapur-road', name: 'Gangapur Road Checkpoint', position: { top: '55%', left: '90%' }, currentRegistrations: 400, maxCapacity: 500 },
    ];

    const allPoints = useMemo(() => {
        const ghatPoints = ghats?.map(ghat => {
            const pos = ghatPositions[ghat.id];
            if (!pos) return null;
            return {
                id: ghat.id,
                name: ghat.name,
                position: pos,
                currentRegistrations: ghat.timeSlots.reduce((sum, slot) => sum + slot.currentRegistrations, 0),
                maxCapacity: ghat.timeSlots.reduce((sum, slot) => sum + slot.maxCapacity, 0)
            }
        }).filter(Boolean) as any[] || [];

        return [...ghatPoints, ...staticLocations];
    }, [ghats]);


    return (
        <Card className="h-[600px]">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Ghats & Hotspots Heatmap</CardTitle>
                 <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-green-500"></span> Low</div>
                    <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-yellow-500"></span> Moderate</div>
                    <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-500"></span> High</div>
                </div>
            </CardHeader>
            <CardContent className="h-full">
                <div className="relative h-full w-full rounded-lg bg-muted-foreground/10 border flex items-center justify-center">
                    <p className="text-muted-foreground">Interactive City Map Placeholder</p>
                    {allPoints.map(point => (
                         <HeatmapPoint 
                            key={point.id} 
                            name={point.name}
                            top={point.position.top}
                            left={point.position.left}
                            currentRegistrations={point.currentRegistrations}
                            maxCapacity={point.maxCapacity}
                         />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};


const GhatCrowdCard = ({ ghat, trend }: { ghat: Ghat; trend: Trend }) => {
    const totalRegistrations = ghat.timeSlots.reduce((sum, slot) => sum + slot.currentRegistrations, 0);
    const trendIcons: Record<Trend, React.ReactNode> = {
        increasing: <ArrowUp className="h-5 w-5 text-red-500" />,
        decreasing: <ArrowDown className="h-5 w-5 text-green-500" />,
        stable: <Minus className="h-5 w-5 text-yellow-500" />,
    };

    return (
        <Card className="bg-card/30">
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                    <p className="font-bold">{ghat.name}</p>
                    <p className="text-sm text-muted-foreground">Estimated Crowd</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-2xl font-bold flex items-center gap-2"><Users className="h-5 w-5" /> {totalRegistrations}</p>
                    </div>
                     <div className="p-2 bg-muted rounded-full">
                        {trendIcons[trend]}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default function CrowdIntelligencePage() {
    const firestore = useFirestore();
    const ghatsCollection = useMemo(() => (firestore ? collection(firestore, 'ghats') : null), [firestore]);
    const { data: ghats, loading: ghatsLoading, error: ghatsError } = useCollection<Ghat>(ghatsCollection);

    const [lastUpdated, setLastUpdated] = useState(0);
    const [timeRange, setTimeRange] = useState('5');
    const [ghatTrends, setGhatTrends] = useState<Record<string, Trend>>({});
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        setLastUpdated(Date.now());

        const timer = setInterval(() => {
            setLastUpdated(Date.now());
            // Simulate trend changes
             if(ghats) {
                const trends: Record<string, Trend> = {};
                ghats.forEach(ghat => {
                    const rand = Math.random();
                    if (rand < 0.33) trends[ghat.id] = 'increasing';
                    else if (rand < 0.66) trends[ghat.id] = 'decreasing';
                    else trends[ghat.id] = 'stable';
                });
                setGhatTrends(trends);
            }
        }, 5000); // Update every 5 seconds
        return () => clearInterval(timer);
    }, [ghats]);

    if (!isClient) {
        return (
             <div className="grid gap-6 md:grid-cols-3">
                 <div className="md:col-span-2">
                    <Card className="h-[600px] flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </Card>
                 </div>
                 <div className="md:col-span-1 space-y-6">
                    <Card>
                         <CardHeader><CardTitle>Controls</CardTitle></CardHeader>
                         <CardContent className='flex items-center justify-center h-24'>
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                         </CardContent>
                    </Card>
                    <div className='space-y-4'>
                         <h3 className="text-lg font-semibold">Live Ghat Status</h3>
                        <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                    </div>
                 </div>
            </div>
        );
    }

    const secondsSinceUpdate = Math.floor((Date.now() - lastUpdated) / 1000);

    return (
        <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
                <CrowdHeatmap ghats={ghats} />
            </div>
            <div className="md:col-span-1 space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Controls</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Time Range</label>
                            <Select value={timeRange} onValueChange={setTimeRange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select time range" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">Last 5 min</SelectItem>
                                    <SelectItem value="15">Last 15 min</SelectItem>
                                    <SelectItem value="60">Last 1 hour</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <Button className="w-full" variant="outline">Apply Filters</Button>
                    </CardContent>
                </Card>

                <div className='space-y-4'>
                    <div className='flex justify-between items-center'>
                         <h3 className="text-lg font-semibold">Live Ghat Status</h3>
                        <p className="text-xs text-muted-foreground">Updated {secondsSinceUpdate}s ago</p>
                    </div>

                    {ghatsLoading && <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                    
                    {ghatsError && <p className="text-destructive">Failed to load live data.</p>}

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        {ghats?.map(ghat => (
                            <GhatCrowdCard key={ghat.id} ghat={ghat} trend={ghatTrends[ghat.id] || 'stable'} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
