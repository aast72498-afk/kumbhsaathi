'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function PoliceLoginPage() {
    const [badgeId, setBadgeId] = useState('');
    const [officerName, setOfficerName] = useState('');
    const [dutySector, setDutySector] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (!badgeId || !officerName || !dutySector) {
            setError('Please fill in all officer details.');
            setIsLoading(false);
            return;
        }
        
        setTimeout(() => {
            if (password === 'kumbh@27') {
                try {
                    sessionStorage.setItem('ks-police-auth', 'true');
                    sessionStorage.setItem('ks-police-name', officerName);
                    sessionStorage.setItem('ks-police-badge', badgeId);
                    sessionStorage.setItem('ks-police-sector', dutySector);
                    router.replace('/police/dashboard');
                } catch (e) {
                     setError('Could not create a session. Please enable session storage in your browser.');
                     setIsLoading(false);
                }
            } else {
                setError('Incorrect password. Access denied.');
                setIsLoading(false);
            }
        }, 500);
    };

    return (
        <main className="flex min-h-screen w-full flex-col items-center justify-center p-4">
           <Card className="w-full max-w-md border-border bg-card">
                <CardHeader className="text-center">
                    <Shield className="mx-auto h-10 w-10 text-primary mb-2" />
                    <CardTitle className="text-2xl">Police & Volunteer Portal</CardTitle>
                    <CardDescription>Enter your duty credentials to access the command center.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="officerName">Officer Name</Label>
                                <Input
                                    id="officerName"
                                    value={officerName}
                                    onChange={(e) => setOfficerName(e.target.value)}
                                    placeholder="e.g., Jane Doe"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="badgeId">Badge ID</Label>
                                <Input
                                    id="badgeId"
                                    value={badgeId}
                                    onChange={(e) => setBadgeId(e.target.value)}
                                    placeholder="e.g., NP-1234"
                                    required
                                />
                            </div>
                        </div>

                         <div className="space-y-2">
                            <Label htmlFor="dutySector">Duty Sector</Label>
                            <Select onValueChange={setDutySector} value={dutySector}>
                                <SelectTrigger id="dutySector">
                                    <SelectValue placeholder="Select your assigned Ghat" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Ram Kund">Ram Kund</SelectItem>
                                    <SelectItem value="Tapovan Ghat">Tapovan Ghat</SelectItem>
                                    <SelectItem value="Laxman Kund">Laxman Kund</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="password">Access Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && (
                             <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Login Failed</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <Button type="submit" className="w-full !mt-6" disabled={isLoading}>
                             {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Secure Login
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}
