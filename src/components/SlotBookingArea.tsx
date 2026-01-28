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
  const { data: ghats, loading } = useCollection<Ghat>(ghatsCollection);

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

  return (
    <>
      {loading ? <LiveSlotTrackerSkeleton /> : <LiveSlotTracker ghats={ghats || []} onSlotSelect={handleSlotSelect} />}
      <RegistrationSection ghatOptions={ghatOptions} selection={selection} />
      <StickySelectionBar selection={selection} onClear={clearSelection} />
    </>
  );
}
