import { AnimatedCounter } from '@/components/AnimatedCounter';
import { Button } from '@/components/ui/button';
import { Waves } from 'lucide-react';


export default function Hero({ registeredToday }: { registeredToday: number }) {
  return (
    <section className="relative py-20 md:py-32 bg-secondary/30 overflow-hidden">
        <div className="absolute inset-0 opacity-10 -z-10">
            <Waves className="w-full h-full text-accent" />
        </div>
        <div className="container relative text-center">
            <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight text-primary">
                KumbhSaathi 2027
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-foreground/80">
                Your digital companion for a divine experience at the Nashik Kumbh Mela. Book your Ghat slots seamlessly.
            </p>
            <div className="mt-8 flex justify-center">
                <div className="bg-card/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border">
                    <p className="text-sm font-medium text-muted-foreground tracking-widest uppercase">Total Pilgrims Registered Today</p>
                    <p className="text-5xl md:text-6xl text-accent font-headline mt-2">
                        <AnimatedCounter value={registeredToday} />
                    </p>
                </div>
            </div>
             <div className="mt-10">
                <Button asChild size="lg" className="rounded-full font-bold px-10 py-6 text-lg">
                    <a href="#register">Register for a Slot</a>
                </Button>
            </div>
        </div>
    </section>
  );
}
