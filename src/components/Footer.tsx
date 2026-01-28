import { Flower2 } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-secondary/30 border-t">
            <div className="container py-8 text-center text-muted-foreground">
                <div className="flex justify-center items-center gap-2 mb-2">
                    <Flower2 className="h-6 w-6 text-primary" />
                    <span className="font-headline text-xl font-bold text-foreground">
                        KumbhSaathi
                    </span>
                </div>
                <p className="text-sm">
                    &copy; {new Date().getFullYear()} KumbhSaathi. All rights reserved.
                </p>
                <p className="text-xs mt-2">
                    A digital initiative for a blessed Kumbh Mela experience.
                </p>
            </div>
        </footer>
    )
}
