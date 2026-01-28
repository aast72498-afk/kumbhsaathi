"use client";

import { useState, useMemo } from 'react';
import { collection } from 'firebase/firestore';
import LiveSlotTracker from '@/components/LiveSlotTracker';
import RegistrationSection from '@/components/RegistrationSection';
import { StickySelectionBar } from '@/components/StickySelectionBar';
import type { Ghat, TimeSlot } from '@/lib/types';
import { useCollection, useFirestore } from '@/firebase';
import { Skeleton } from './ui/skeleton';
import { AlertCircle, WifiOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

type SlotBookingAreaProps = {
    ghatOptions: { value: string, label: string }[];
}

function LiveSlotTrackerSkeleton() {
    return (
      <div className="container py-20">
         <div className="text-center mb-12">
            <Skeleton className="h-10 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-1/2 mx-auto mt-4" />
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-4 rounded-2xl p-4 border">
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <div className="space-y-3 pt-2">
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-12 w-full" />
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
    if (error || !ghats || ghats.length === 0) {
        return (
            <div className="container py-20">
                 <Alert variant="destructive" className="bg-red-950/50 border-red-500/50 text-red-300">
                    <WifiOff className="h-4 w-4 !text-red-300" />
                    <AlertTitle>Connection Error</AlertTitle>
                    <AlertDescription>
                        Could not load live Ghat data from the database. Please check your connection and try again. The database may also be seeding for the first time.
                    </AlertDescription>
                </Alert>
            </div>
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
