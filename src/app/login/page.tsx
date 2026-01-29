'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Triangle, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Simulate network delay for better UX
        setTimeout(() => {
            if (password === 'kumbh@27') {
                try {
                    sessionStorage.setItem('isAdminAuthenticated', 'true');
                    router.replace('/admin');
                } catch (e) {
                     setError('Could not create session. Please enable cookies/session storage and try again.');
                     setIsLoading(false);
                }
            } else {
                setError('Incorrect password. Please try again.');
                setIsLoading(false);
            }
        }, 500);
    };

    return (
        <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
           <Card className="w-full max-w-sm border-border">
                <CardHeader className="text-center">
                    <Triangle className="mx-auto h-8 w-8 fill-primary stroke-primary mb-2" />
                    <CardTitle className="text-2xl">KumbhSaathi Admin</CardTitle>
                    <CardDescription>Enter password to access the live control room.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="bg-background"
                            />
                        </div>
                        {error && (
                             <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Login Failed</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <Button type="submit" className="w-full" disabled={isLoading}>
                             {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Login
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}
