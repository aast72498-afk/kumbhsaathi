'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Ambulance, Car, MapPin, Siren, ShieldCheck, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type VehicleStatus = 'En Route' | 'Stuck' | 'On Site' | 'Available';
type VehicleType = 'Ambulance' | 'Police';

interface Vehicle {
    id: string;
    type: VehicleType;
    location: string;
    status: VehicleStatus;
    position: { top: string; left: string };
}

const initialVehicles: Vehicle[] = [
    { id: 'AMB-01', type: 'Ambulance', location: 'Near Ram Kund', status: 'Stuck', position: { top: '30%', left: '40%' } },
    { id: 'POL-05', type: 'Police', location: 'Tapovan Sector', status: 'En Route', position: { top: '60%', left: '70%' } },
    { id: 'AMB-02', type: 'Ambulance', location: 'Laxman Kund Parking', status: 'On Site', position: { top: '75%', left: '25%' } },
];

export default function EmergencyDispatchPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
    const [clearingRoute, setClearingRoute] = useState(false);
    const [broadcastSent, setBroadcastSent] = useState(false);

    const stuckVehicle = vehicles.find(v => v.status === 'Stuck');

    const handleClearRoute = () => {
        if (!stuckVehicle) return;
        setClearingRoute(true);
        setBroadcastSent(false);

        // Simulate API call and response
        setTimeout(() => {
            console.log(`Broadcasting geo-alert around ${stuckVehicle.location}`);
            setBroadcastSent(true);

            setTimeout(() => {
                setVehicles(vehicles.map(v => v.id === stuckVehicle.id ? { ...v, status: 'En Route' } : v));
                setClearingRoute(false);
                setBroadcastSent(false);
            }, 3000);
        }, 1500);
    };

    const getStatusVariant = (status: VehicleStatus) => {
        switch (status) {
            case 'Stuck': return 'destructive';
            case 'En Route': return 'default';
            case 'On Site': return 'secondary';
            case 'Available': return 'outline';
            default: return 'default';
        }
    };
    
    const getVehicleIcon = (type: VehicleType) => {
        switch(type) {
            case 'Ambulance': return <Ambulance className="h-5 w-5" />;
            case 'Police': return <Car className="h-5 w-5" />;
            default: return null;
        }
    }

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <Card className="h-[600px]">
                    <CardHeader>
                        <CardTitle>Live Emergency Map</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="relative h-[500px] w-full rounded-lg bg-muted/20 border flex items-center justify-center">
                            <p className="text-muted-foreground">Interactive City Map Placeholder</p>
                            {vehicles.map(v => (
                                <div key={v.id} className="absolute p-2 bg-background/80 rounded-full shadow-lg border-2" style={{ top: v.position.top, left: v.position.left }}>
                                    <div className={cn("animate-pulse", v.status === 'Stuck' ? 'text-destructive' : 'text-primary')}>
                                        {getVehicleIcon(v.type)}
                                    </div>
                                    {v.status === 'Stuck' && (
                                        <div className="absolute -top-2 -right-2">
                                            <span className="relative flex h-4 w-4">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-4 w-4 bg-destructive border-2 border-background"></span>
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                             {stuckVehicle && (
                                <div className="absolute border-2 border-dashed border-amber-500 rounded-full opacity-50" style={{
                                    top: `calc(${stuckVehicle.position.top} - 10%)`,
                                    left: `calc(${stuckVehicle.position.left} - 10%)`,
                                    width: '20%',
                                    height: '20%',
                                    aspectRatio: '1/1'
                                }}></div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Vehicle Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Vehicle</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {vehicles.map(v => (
                                    <TableRow key={v.id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            {getVehicleIcon(v.type)} {v.id}
                                        </TableCell>
                                        <TableCell>{v.location}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(v.status)}>{v.status}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className={cn("transition-all", stuckVehicle ? 'border-destructive bg-destructive/5' : 'bg-card')}>
                    <CardHeader>
                        <CardTitle className={cn(stuckVehicle && "text-destructive")}>Dispatch Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {stuckVehicle ? (
                            <div className="space-y-4">
                                <Alert variant="destructive">
                                    <Siren className="h-4 w-4" />
                                    <AlertTitle>Vehicle Blocked!</AlertTitle>
                                    <AlertDescription>
                                        Ambulance {stuckVehicle.id} is stuck near {stuckVehicle.location}. Immediate action required.
                                    </AlertDescription>
                                </Alert>
                                <Button
                                    variant="destructive"
                                    size="lg"
                                    className="w-full h-12 text-lg font-bold"
                                    onClick={handleClearRoute}
                                    disabled={clearingRoute}
                                >
                                    {clearingRoute ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Siren className="mr-2 h-5 w-5" />}
                                    CLEAR ROUTE
                                </Button>

                                {broadcastSent && (
                                     <Alert className="bg-green-500/10 border-green-500/50 text-green-400">
                                         <CheckCircle className="h-4 w-4 text-green-500" />
                                        <AlertTitle>Broadcast Sent!</AlertTitle>
                                        <AlertDescription>
                                            Geo-alert sent to a 500m radius around vehicle. Route clearing in progress.
                                        </AlertDescription>
                                    </Alert>
                                )}

                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground p-4">
                                <ShieldCheck className="h-8 w-8 mx-auto mb-2 text-green-500" />
                                <p>All routes are clear. No immediate action required.</p>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                       <p className="text-xs text-muted-foreground text-center w-full">All actions are logged for accountability.</p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
