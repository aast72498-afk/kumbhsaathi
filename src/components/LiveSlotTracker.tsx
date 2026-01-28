import { GhatCard } from './GhatCard';
import { Bell } from 'lucide-react';
import type { Ghat, TimeSlot } from '@/lib/types';

type LiveSlotTrackerProps = {
    ghats: Ghat[];
    onSlotSelect: (ghat: Ghat, slot: TimeSlot) => void;
}

export default function LiveSlotTracker({ ghats, onSlotSelect }: LiveSlotTrackerProps) {
  return (
    <section id="slots" className="py-20">
      <div className="container">
        <div className="text-center mb-12">
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground">
                Live Slot Availability
            </h2>
            <p className="mt-2 text-lg text-muted-foreground max-w-xl mx-auto">
                Choose your preferred Ghat and time for a holy dip. Status is updated in real-time.
            </p>
            <div className="flex justify-center mt-4">
                <Bell className="w-6 h-6 text-primary animate-swing" />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ghats.map(ghat => (
            <GhatCard key={ghat.id} ghat={ghat} onSlotSelect={onSlotSelect} />
          ))}
        </div>
      </div>
    </section>
  );
}
