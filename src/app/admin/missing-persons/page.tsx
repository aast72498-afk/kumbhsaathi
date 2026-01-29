'use client';

import { useState, useMemo, useEffect } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore } from '@/firebase';
import { updateMissingPersonStatus } from '@/app/actions';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

import type { MissingPersonReport } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, X, UserCircle, Phone, MapPin, Milestone, MessageSquare, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

type ReportWithId = MissingPersonReport & { id: string };

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
    const reportsQuery = useMemo(() => firestore ? query(collection(firestore, 'missing_persons'), orderBy('createdAt', 'desc')) : null, [firestore]);
    const { data: reports, loading: reportsLoading } = useCollection<ReportWithId>(reportsQuery);
    
    const [selectedReport, setSelectedReport] = useState<ReportWithId | null>(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isClient, setIsClient] = useState(false);
    
    const { toast } = useToast();

    useEffect(() => {
        setIsClient(true);
    }, []);
    
    useEffect(() => {
        if (reports && reports.length > 0 && !selectedReport) {
            setSelectedReport(reports[0]);
        }
    }, [reports, selectedReport]);

    const handleStatusUpdate = async (status: 'Under Investigation' | 'Found') => {
        if (!selectedReport) return;
        setIsUpdatingStatus(true);
        const result = await updateMissingPersonStatus(selectedReport.id, status);
        if (result.success) {
            toast({ title: "Status Updated Successfully" });
        } else {
            toast({ variant: 'destructive', title: "Update Failed", description: result.error });
        }
        setIsUpdatingStatus(false);
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
                <Card className="md:col-span-1 h-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </Card>
                <Card className="md:col-span-2 h-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </Card>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
            {/* Left Panel: Cases List */}
            <Card className="md:col-span-1 flex flex-col">
                <CardHeader>
                    <CardTitle>Live Cases</CardTitle>
                    <CardDescription>All active missing person reports.</CardDescription>
                </CardHeader>
                <CardContent className="p-0 flex-grow">
                    <ScrollArea className="h-full">
                        <Table>
                            <TableHeader className="sticky top-0 bg-card z-10">
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
                                        <TableCell className="text-xs text-muted-foreground">
                                            {report.createdAt ? formatDistanceToNow(report.createdAt.toDate(), { addSuffix: true }) : 'N/A'}
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
            </Card>

            {/* Right Panel: Case Details */}
            <Card className="md:col-span-2 flex flex-col">
                {selectedReport ? (
                    <>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Case Details: {selectedReport.caseId}</CardTitle>
                                    <CardDescription>Reported by contact: {selectedReport.reporterContact}</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                     <Button size="sm" variant="outline" onClick={() => handleStatusUpdate('Under Investigation')} disabled={isUpdatingStatus || selectedReport.status === 'Under Investigation'}>
                                        Investigating
                                    </Button>
                                    <Button size="sm" onClick={() => handleStatusUpdate('Found')} disabled={isUpdatingStatus || selectedReport.status === 'Found'}>
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
                                        <div className="aspect-square w-full bg-muted rounded-lg flex flex-col items-center justify-center text-muted-foreground">
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
            </Card>
        </div>
    );
}
