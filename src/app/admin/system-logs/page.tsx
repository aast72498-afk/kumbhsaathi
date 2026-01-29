'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ListFilter, Loader2 } from 'lucide-react';

type LogEntry = {
  id: string;
  timestamp: string;
  action: 'ROUTE_CLEAR' | 'CROWD_ALERT' | 'GHAT_LOCK' | 'USER_LOGIN' | 'CASE_CREATED';
  performedBy: string;
  location: string;
  details: string;
};

const generateMockLogs = (): LogEntry[] => [
  { id: 'log-1', timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), action: 'ROUTE_CLEAR', performedBy: 'Admin_01', location: 'Near Ram Kund', details: 'Cleared route for vehicle AMB-01.' },
  { id: 'log-2', timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), action: 'CROWD_ALERT', performedBy: 'System (Auto)', location: 'Laxman Kund', details: 'High crowd density detected (95%).' },
  { id: 'log-3', timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(), action: 'CASE_CREATED', performedBy: 'Helpdesk_04', location: 'Tapovan Area', details: 'Missing person case MP-83419 created.' },
  { id: 'log-4', timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(), action: 'GHAT_LOCK', performedBy: 'Control_Room_S2', location: 'Laxman Kund', details: 'Entry locked due to overcrowding.' },
  { id: 'log-5', timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), action: 'USER_LOGIN', performedBy: 'Admin_01', location: 'Control Room IP 192.168.1.10', details: 'User logged in successfully.' },
  { id: 'log-6', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), action: 'USER_LOGIN', performedBy: 'Helpdesk_04', location: 'Helpdesk Kiosk 3', details: 'User logged in successfully.' },
];

const getActionVariant = (action: LogEntry['action']): 'destructive' | 'secondary' | 'default' | 'outline' => {
    switch (action) {
        case 'ROUTE_CLEAR': return 'destructive';
        case 'CROWD_ALERT': return 'secondary';
        case 'GHAT_LOCK': return 'destructive';
        case 'CASE_CREATED': return 'default';
        default: return 'outline';
    }
};

const formatTimestamp = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
}

export default function SystemLogsPage() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // Generate logs and set client flag on mount to avoid hydration mismatch
        setLogs(generateMockLogs());
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <Card>
                 <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <CardTitle>System Logs & Audit Trail</CardTitle>
                            <CardDescription>A complete record of all system actions for accountability.</CardDescription>
                        </div>
                    </div>
                 </CardHeader>
                 <CardContent>
                    <div className="h-96 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                 </CardContent>
            </Card>
        )
    }


  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                 <CardTitle>System Logs & Audit Trail</CardTitle>
                 <CardDescription>A complete record of all system actions for accountability.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Input placeholder="Search logs..." className="max-w-xs" />
                <Select>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by action" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="route_clear">Route Clear</SelectItem>
                        <SelectItem value="crowd_alert">Crowd Alert</SelectItem>
                        <SelectItem value="ghat_lock">Ghat Lock</SelectItem>
                        <SelectItem value="case_created">Case Created</SelectItem>
                        <SelectItem value="user_login">User Login</SelectItem>
                    </SelectContent>
                </Select>
                 <Button variant="outline" className="gap-2">
                    <ListFilter className="h-4 w-4" />
                    Apply Filters
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead className="w-[150px]">Action</TableHead>
              <TableHead className="w-[150px]">Performed By</TableHead>
              <TableHead>Location / Context</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length > 0 ? logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-mono text-xs">{formatTimestamp(log.timestamp)}</TableCell>
                <TableCell>
                  <Badge variant={getActionVariant(log.action)}>{log.action.replace('_', ' ')}</Badge>
                </TableCell>
                <TableCell className="font-medium">{log.performedBy}</TableCell>
                <TableCell>{log.location}</TableCell>
                <TableCell className="text-muted-foreground">{log.details}</TableCell>
              </TableRow>
            )) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                       No logs found.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
       <CardFooter>
            <div className="text-xs text-muted-foreground">
                Showing <strong>{logs.length}</strong> of <strong>{logs.length}</strong> entries.
            </div>
        </CardFooter>
    </Card>
  );
}
