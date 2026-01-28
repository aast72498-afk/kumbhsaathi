"use client";

import { useState, useMemo } from 'react';
import { collection } from 'firebase/firestore';
import LiveSlotTracker from '@/components/LiveSlotTracker';
import RegistrationSection from '@/components/RegistrationSection';
import { StickySelectionBar } from '@/components/StickySelectionBar';
import type { Ghat, TimeSlot } from '@/lib/types';
import { useCollection } from '@/firebase';
import { useFirestore } from '@/firebase';
import { Skeleton } from './ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

type SlotBookingAreaProps = {
    ghatOptions: { value: string, label: string }[];
}

function LiveSlotTrackerSkeleton() {
    return (
      <div className="container py-20">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-4">
                    <Skeleton className="h-48 w-full rounded-2xl" />
                    <div className="space-y-2 p-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </div>
            ))}
        </div>
      </div>
    );
}


export default function SlotBookingArea({ ghatOptions }: SlotBookingAreaProps) {
  const [selection, setSelection] = useState<{ ghat: Ghat; slot: TimeSlot } | null>(null);
  const firestore = useFirestore();
  
  const ghatsCollection = useMemo(() => (firestore ? collection(firestore, 'ghats') : null), [firestore]);
  const { data: ghats, loading, error } = useCollection<Ghat>(ghatsCollection);

  const handleSlotSelect = (ghat: Ghat, slot: TimeSlot) => {
    setSelection({ ghat, slot });
    
    const formElement = document.getElementById("registration-form");
    if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const clearSelection = () => {
    setSelection(null);
  };
  
  const renderContent = () => {
    if (loading) {
        return <LiveSlotTrackerSkeleton />;
    }
    if (error) {
        return (
            <div className="container py-20">
                 <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        Could not load Ghat data. Please try again later.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }
    if (!ghats || ghats.length === 0) {
        return (
            <section id="slots" className="py-20">
                <div className="container text-center">
                    <div className="text-center mb-12">
                        <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground">
                            Live Slot Availability
                        </h2>
                        <p className="mt-2 text-lg text-muted-foreground max-w-xl mx-auto">
                            Choose your preferred Ghat and time for a holy dip. Status is updated in real-time.
                        </p>
                    </div>
                    <div className="bg-secondary/50 border border-dashed border-border p-8 rounded-lg">
                        <h3 className="font-semibold text-xl text-foreground">No Ghats Available</h3>
                        <p className="text-muted-foreground mt-2">
                            It seems there are no Ghats configured in the database.
                        </p>
                        <p className="text-xs text-muted-foreground mt-4">
                            (Developer note: Please seed the 'ghats' collection in your Firestore database.)
                        </p>
                    </div>
                </div>
            </section>
        );
    }
    return <LiveSlotTracker ghats={ghats} onSlotSelect={handleSlotSelect} />;
  }

  return (
    <>
      {renderContent()}
      <RegistrationSection ghatOptions={ghatOptions} selection={selection} />
      <StickySelectionBar selection={selection} onClear={clearSelection} />
    </>
  );
}
