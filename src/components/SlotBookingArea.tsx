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
import { AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { mockGhats } from '@/lib/data';

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
            <>
                <LiveSlotTracker ghats={mockGhats} onSlotSelect={handleSlotSelect} />
                <div className="container -mt-10 mb-10">
                    <Alert className="border-primary/50 bg-primary/10">
                        <Info className="h-4 w-4 text-primary" />
                        <AlertTitle className="text-primary">Developer Preview</AlertTitle>
                        <AlertDescription className="text-primary/80">
                            Your Firestore 'ghats' collection is empty. Showing mock data as a fallback. Please seed your database to see live slot availability.
                        </AlertDescription>
                    </Alert>
                </div>
            </>
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
