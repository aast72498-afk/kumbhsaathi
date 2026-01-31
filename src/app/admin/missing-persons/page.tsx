'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { updateMissingPersonStatus, broadcastMissingPersonAlert } from '@/app/actions';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

import type { MissingPersonReport } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, X, UserCircle, Phone, MapPin, Milestone, MessageSquare, Image as ImageIcon, Megaphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

type ReportWithId = MissingPersonReport & { id: string };

const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <Card className={cn("bg-card/40 backdrop-blur-lg border-border/50", className)}>
        {children}
    </Card>
);

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value?: string | null }) => {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3">
            <div className="text-muted-foreground mt-1">{icon}</div>
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-medium text-foreground">{value}</p>
            </div>
        </div>
    );
};

export default function MissingPersonsPage() {
    const firestore = useFirestore();
    const reportsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'missing_persons'), orderBy('createdAt', 'desc')) : null, [firestore]);
    const { data: reports, loading: reportsLoading } = useCollection<ReportWithId>(reportsQuery);
    
    const [selectedReport, setSelectedReport] = useState<ReportWithId | null>(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [, setNow] = useState(new Date());

    const { toast } = useToast();

    useEffect(() => {
        setIsClient(true);
        const interval = setInterval(() => setNow(new Date()), 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);
    
    useEffect(() => {
        if (selectedReport && reports && !reports.find(r => r.id === selectedReport.id)) {
            setSelectedReport(null);
        }
        if (reports && reports.length > 0 && !selectedReport) {
            setSelectedReport(reports[0]);
        }
    }, [reports, selectedReport]);

    const handleStatusUpdate = async (status: 'Under Investigation' | 'Found') => {
        if (!selectedReport) return;
        setIsUpdatingStatus(true);
        const result = await updateMissingPersonStatus(selectedReport.id, status);
        if (result.success) {
            toast({ title: "Action Successful", description: result.message });
        } else {
            toast({ variant: 'destructive', title: "Update Failed", description: result.error });
        }
        setIsUpdatingStatus(false);
    };

    const handleBroadcast = async () => {
        if (!selectedReport) return;
        setIsBroadcasting(true);
        const result = await broadcastMissingPersonAlert(selectedReport.id);
        if (result.success) {
            toast({ title: "Broadcast Sent", description: result.message });
        } else {
            toast({ variant: 'destructive', title: "Broadcast Failed", description: result.error });
        }
        setIsBroadcasting(false);
    };

    const getStatusVariant = (status: ReportWithId['status']) => {
        switch (status) {
            case 'Found': return 'default';
            case 'Under Investigation': return 'secondary';
            case 'Pending': return 'destructive';
            default: return 'outline';
        }
    };
    
    if (!isClient) {
        return (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[80vh]">
                <GlassCard className="md:col-span-1 h-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </GlassCard>
                <GlassCard className="md:col-span-2 h-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </GlassCard>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
            <GlassCard className="md:col-span-1 flex flex-col">
                <CardHeader>
                    <CardTitle>Live Cases</CardTitle>
                    <CardDescription>All active missing person reports.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 flex-grow">
                    <ScrollArea className="h-full">
                        <Table>
                            <TableHeader className="sticky top-0 bg-card/80 backdrop-blur-xl z-10">
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reportsLoading && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
                                            <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!reportsLoading && reports?.map((report) => (
                                    <TableRow
                                        key={report.id}
                                        onClick={() => setSelectedReport(report)}
                                        className="cursor-pointer"
                                        data-state={selectedReport?.id === report.id ? 'selected' : ''}
                                    >
                                        <TableCell className="font-medium">{report.missingPersonName}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(report.status)}>{report.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {report.createdAt ? (
                                                <div title={report.createdAt.toDate().toLocaleString()}>
                                                    {formatDistanceToNow(report.createdAt.toDate(), { addSuffix: true })}
                                                </div>
                                            ) : 'N/A'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                 {!reportsLoading && reports?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">No reports found.</TableCell>
                                    </TableRow>
                                 )}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </GlassCard>

            <GlassCard className="md:col-span-2 flex flex-col">
                {selectedReport ? (
                    <>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Case Details: {selectedReport.caseId}</CardTitle>
                                    <CardDescription>Reported by contact: {selectedReport.reporterContact}</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                     <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={handleBroadcast}
                                        disabled={isBroadcasting || selectedReport.broadcastSent}
                                    >
                                        {isBroadcasting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Megaphone className="mr-2 h-4 w-4" />}
                                        {selectedReport.broadcastSent ? 'Alert Sent' : 'Broadcast Alert'}
                                    </Button>
                                     <Button size="sm" variant="outline" onClick={() => handleStatusUpdate('Under Investigation')} disabled={isUpdatingStatus || selectedReport.status === 'Under Investigation'}>
                                        Investigating
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleStatusUpdate('Found')} disabled={isUpdatingStatus || selectedReport.status === 'Found'}>
                                        Mark as Found
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow overflow-y-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    {selectedReport.photoUrl ? (
                                        <Image
                                            src={selectedReport.photoUrl}
                                            alt={`Photo of ${selectedReport.missingPersonName}`}
                                            width={500}
                                            height={500}
                                            className="rounded-lg border object-cover aspect-square bg-muted"
                                        />
                                    ) : (
                                        <div className="aspect-square w-full bg-muted/20 rounded-lg flex flex-col items-center justify-center text-muted-foreground">
                                            <ImageIcon className="h-16 w-16" />
                                            <p>No photo provided</p>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-6">
                                    <DetailItem icon={<UserCircle className="h-5 w-5"/>} label="Missing Person" value={selectedReport.missingPersonName} />
                                    <DetailItem icon={<Phone className="h-5 w-5"/>} label="Missing Person's Mobile" value={selectedReport.missingPersonMobile} />
                                    <DetailItem icon={<MapPin className="h-5 w-5"/>} label="Last Seen Ghat" value={selectedReport.lastSeenGhat} />
                                    <DetailItem icon={<Milestone className="h-5 w-5"/>} label="Specific Location" value={selectedReport.detailedLocation} />
                                    <DetailItem icon={<MessageSquare className="h-5 w-5"/>} label="Description" value={selectedReport.description} />
                                </div>
                            </div>
                        </CardContent>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        {reportsLoading ? (
                             <Loader2 className="h-8 w-8 animate-spin" />
                        ) : (
                           <>
                            <UserCircle className="h-16 w-16" />
                            <p className="mt-4">Select a case to view details</p>
                           </>
                        )}
                    </div>
                )}
            </GlassCard>
        </div>
    );
}
