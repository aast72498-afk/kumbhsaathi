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

const getCrowdStatus = (ghat: Ghat) => {
    const totalCapacity = ghat.timeSlots.reduce((sum, slot) => sum + slot.maxCapacity, 0);
    const totalRegistrations = ghat.timeSlots.reduce((sum, slot) => sum + slot.currentRegistrations, 0);
    if(totalCapacity === 0) return { density: 0, label: 'Low' };
    const density = (totalRegistrations / totalCapacity) * 100;
    
    if (density > 75) return { density, label: 'High' };
    if (density > 40) return { density, label: 'Moderate' };
    return { density, label: 'Low' };
};

const HeatmapPoint = ({ ghat, top, left }: { ghat: Ghat; top: string; left: string; }) => {
    const { label } = getCrowdStatus(ghat);
    const color = {
        'Low': 'bg-green-500',
        'Moderate': 'bg-yellow-500',
        'High': 'bg-red-500'
    }[label];
    return (
        <div className={cn("absolute rounded-full animate-pulse", color)} style={{ top, left, width: '20px', height: '20px', borderWidth: '3px' }}>
             <span className="relative flex h-full w-full">
                <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", color)}></span>
                <span className={cn("relative inline-flex rounded-full h-full w-full border-2 border-background", color)}></span>
            </span>
        </div>
    );
};

const CrowdHeatmap = ({ ghats }: { ghats: Ghat[] | null }) => {
    const ghatPositions: { [key: string]: { top: string; left: string } } = {
        'ram-kund-ghat': { top: '25%', left: '30%' },
        'tapovan-ghat': { top: '50%', left: '60%' },
        'laxman-kund-ghat': { top: '75%', left: '40%' },
    };

    return (
        <Card className="h-[600px]">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Ghats Heatmap</CardTitle>
                 <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-green-500"></span> Low</div>
                    <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-yellow-500"></span> Moderate</div>
                    <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-500"></span> High</div>
                </div>
            </CardHeader>
            <CardContent className="h-full">
                <div className="relative h-full w-full rounded-lg bg-muted-foreground/10 border flex items-center justify-center">
                    <p className="text-muted-foreground">Interactive City Map Placeholder</p>
                    {ghats?.map(ghat => {
                         const pos = ghatPositions[ghat.id];
                         if (!pos) return null;
                         return <HeatmapPoint key={ghat.id} ghat={ghat} top={pos.top} left={pos.left} />
                    })}
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

    const [lastUpdated, setLastUpdated] = useState(Date.now());
    const [timeRange, setTimeRange] = useState('5');
    const [ghatTrends, setGhatTrends] = useState<Record<string, Trend>>({});

    useEffect(() => {
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
