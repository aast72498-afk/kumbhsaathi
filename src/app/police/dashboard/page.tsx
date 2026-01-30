'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { MissingPersonReport, HealthEmergencyAlert } from '@/lib/types';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShieldCheck, User, Hospital, Phone, MapPin, AlertTriangle, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// --- TYPE DEFINITIONS ---
type CombinedIncident = (
    (MissingPersonReport & { id: string; type: 'Missing Person' }) |
    (HealthEmergencyAlert & { id:string; type: 'Health Emergency' })
) & { position?: { top: string; left: string } };

// --- SECTOR LAYOUT ---
const SECTORS: { [key: string]: { gridArea: string } } = {
  'Ram Kund': { gridArea: 'ramKund' },
  'Tapovan Ghat': { gridArea: 'tapovan' },
  'Laxman Kund': { gridArea: 'laxman' },
};


// --- MAIN COMPONENT ---
export default function PoliceDashboardPage() {
    const [officerName, setOfficerName] = useState('');
    const [dutySector, setDutySector] = useState('');
    const [isClient, setIsClient] = useState(false);

    const firestore = useFirestore();

    // --- DATA FETCHING ---
    const mpQuery = useMemoFirebase(() => {
        if (!firestore || !dutySector) return null;
        return query(collection(firestore, 'missing_persons'), where('lastSeenGhat', '==', dutySector), orderBy('createdAt', 'desc'));
    }, [firestore, dutySector]);

    const heQuery = useMemoFirebase(() => {
        if (!firestore || !dutySector) return null;
        return query(collection(firestore, 'emergency_alerts'), where('locationGhat', '==', dutySector), orderBy('createdAt', 'desc'));
    }, [firestore, dutySector]);

    const { data: missingPersons, loading: mpLoading } = useCollection<MissingPersonReport & {id: string}>(mpQuery);
    const { data: healthAlerts, loading: haLoading } = useCollection<HealthEmergencyAlert & {id: string}>(heQuery);

    // --- STATE MANAGEMENT ---
    const [incidents, setIncidents] = useState<CombinedIncident[]>([]);
    const [selectedIncident, setSelectedIncident] = useState<CombinedIncident | null>(null);

    // --- EFFECTS ---
    useEffect(() => {
        setIsClient(true);
        setOfficerName(sessionStorage.getItem('ks-police-name') || '');
        setDutySector(sessionStorage.getItem('ks-police-sector') || '');
    }, []);

    const combinedIncidents = useMemo(() => {
        const mp = (missingPersons || []).map(p => ({ ...p, type: 'Missing Person' as const }));
        const he = (healthAlerts || []).map(a => ({ ...a, type: 'Health Emergency' as const }));
        return [...mp, ...he].sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
    }, [missingPersons, healthAlerts]);
    
    useEffect(() => {
        setIncidents(prevIncidents => {
            return combinedIncidents.map(currentInc => {
                const existing = prevIncidents.find(p => p.id === currentInc.id);
                // Keep existing position if available, otherwise generate a new one
                return {
                    ...currentInc,
                    position: existing?.position || {
                        top: `${Math.floor(Math.random() * 80) + 10}%`,
                        left: `${Math.floor(Math.random() * 80) + 10}%`,
                    },
                };
            });
        });
    }, [combinedIncidents]);


    const isLoading = mpLoading || haLoading;

    // --- RENDER ---
    return (
        <div className="flex flex-col h-full">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-foreground">Welcome, Officer {officerName}</h1>
                <p className="text-lg text-muted-foreground">
                    You are assigned to the <span className="font-semibold text-primary">{dutySector}</span> sector.
                </p>
            </header>

            <div className="grid lg:grid-cols-3 gap-6 flex-1">
                {/* --- TACTICAL MAP --- */}
                <div className="lg:col-span-2 relative">
                    <Card className="h-full min-h-[600px] flex flex-col">
                        <CardHeader>
                            <CardTitle>Tactical Incident Map</CardTitle>
                            <CardDescription>Live incident markers for the {dutySector} sector.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="relative h-full w-full rounded-lg bg-gray-800 border-2 border-gray-700 p-4" style={{
                                display: 'grid',
                                gridTemplateAreas: `
                                    "ramKund tapovan"
                                    "laxman tapovan"
                                `,
                                gridTemplateRows: '1fr 1fr',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1rem'
                            }}>
                                {Object.entries(SECTORS).map(([name, layout]) => (
                                    <div key={name} style={{ gridArea: layout.gridArea }} className="border-2 border-dashed border-gray-600/50 rounded-lg p-2 relative flex items-center justify-center">
                                        <h3 className="text-xl font-bold text-gray-600 select-none">{name}</h3>
                                        {incidents
                                            .filter(inc => (inc.type === 'Missing Person' ? inc.lastSeenGhat : inc.locationGhat) === name)
                                            .map(inc => (
                                                <IncidentMarker key={inc.id} incident={inc} onSelect={setSelectedIncident} />
                                            ))}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                         <AnimatePresence>
                            {selectedIncident && <IncidentPopup incident={selectedIncident} onClose={() => setSelectedIncident(null)} />}
                         </AnimatePresence>
                    </Card>
                </div>

                {/* --- INCIDENT LOG --- */}
                <div className="lg:col-span-1">
                     <Card className="h-full min-h-[600px] flex flex-col">
                        <CardHeader>
                            <CardTitle>Live Incident Log</CardTitle>
                             <CardDescription>Real-time feed for your sector.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 p-0">
                            <ScrollArea className="h-[500px]">
                                {isLoading && incidents.length === 0 ? (
                                     <div className="flex items-center justify-center h-full">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                     </div>
                                ) : incidents.length === 0 ? (
                                    <div className="text-center text-muted-foreground p-8">
                                        <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-green-500" />
                                        <p className="text-lg font-semibold">Region All Clear</p>
                                        <p>No active incidents in your sector.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 p-6 pt-0">
                                        {incidents.map(inc => (
                                            <button key={inc.id} onClick={() => setSelectedIncident(inc)} className="w-full text-left p-3 rounded-lg border bg-card hover:bg-slate-800 transition-colors">
                                                 <div className="flex justify-between items-center mb-1">
                                                    <Badge variant={inc.status === 'Pending' ? 'destructive' : 'secondary'}>{inc.status}</Badge>
                                                    <p className="text-xs text-muted-foreground">{inc.createdAt ? formatDistanceToNow(inc.createdAt.toDate(), { addSuffix: true }) : 'just now'}</p>
                                                 </div>
                                                 <div className="flex items-center gap-3">
                                                    {inc.type === 'Missing Person' ? <User className="h-5 w-5 text-primary"/> : <Hospital className="h-5 w-5 text-amber-400"/>}
                                                    <div>
                                                        <p className="font-semibold">{inc.type}</p>
                                                        <p className="text-sm text-muted-foreground">{inc.type === 'Missing Person' ? inc.missingPersonName : inc.issueType}</p>
                                                    </div>
                                                 </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// --- SUB-COMPONENTS ---
const IncidentMarker = ({ incident, onSelect }: { incident: CombinedIncident, onSelect: (inc: CombinedIncident) => void }) => {
    if (!incident.position) return null;
    const isPending = incident.status === 'Pending';
    
    return (
        <button
            onClick={() => onSelect(incident)}
            className="absolute z-10"
            style={{ top: incident.position.top, left: incident.position.left }}
        >
            <div className="relative flex items-center justify-center">
                <div className={cn(
                    "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-125",
                    incident.type === 'Missing Person' ? 'bg-blue-500/50 border-blue-300' : 'bg-amber-500/50 border-amber-300'
                )}>
                     {incident.type === 'Missing Person' ? <User className="h-3 w-3 text-white"/> : <AlertTriangle className="h-3 w-3 text-white"/>}
                </div>
                 {isPending && (
                    <div className="absolute h-6 w-6 rounded-full bg-red-500 animate-ping opacity-75"></div>
                 )}
            </div>
        </button>
    );
};

const IncidentPopup = ({ incident, onClose }: { incident: CombinedIncident, onClose: () => void }) => {
    const isMissingPerson = incident.type === 'Missing Person';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 right-4 w-80 z-20"
        >
            <Card className="bg-slate-900/80 backdrop-blur-sm border-primary/50 shadow-2xl shadow-primary/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg">{incident.type}</CardTitle>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}><X className="h-4 w-4" /></Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                         <div className="flex items-start gap-3">
                            {isMissingPerson ? <User className="h-4 w-4 mt-1 text-muted-foreground" /> : <Hospital className="h-4 w-4 mt-1 text-muted-foreground" />}
                            <div>
                                <p className="text-sm text-muted-foreground">{isMissingPerson ? "Name" : "Issue"}</p>
                                <p className="font-semibold">{isMissingPerson ? incident.missingPersonName : incident.issueType}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Reporter Contact</p>
                                <p className="font-semibold">{incident.reporterContact}</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-3">
                            <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Detailed Location</p>
                                <p className="font-semibold">{incident.detailedLocation}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};
