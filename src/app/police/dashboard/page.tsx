'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

export default function PoliceDashboardPage() {
    const [officerName, setOfficerName] = useState('');
    const [dutySector, setDutySector] = useState('');

    useEffect(() => {
        // This component only renders if auth is successful in the layout
        setOfficerName(sessionStorage.getItem('ks-police-name') || '');
        setDutySector(sessionStorage.getItem('ks-police-sector') || 'Unknown Sector');
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome, Officer {officerName}</h1>
            <p className="text-lg text-muted-foreground mb-6">You are assigned to the <span className="font-semibold text-primary">{dutySector}</span> sector.</p>
            
            <div className="grid grid-cols-1 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Live Region Monitor</CardTitle>
                        <CardDescription>Real-time incidents for the {dutySector} sector will appear here.</CardDescription>
                    </CardHeader>
                    <div className="p-6 pt-0">
                         <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                            <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-green-500" />
                            <p className="text-lg font-semibold">Region All Clear</p>
                            <p>No active incidents in your sector.</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
