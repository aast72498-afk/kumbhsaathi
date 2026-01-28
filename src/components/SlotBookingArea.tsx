"use client";

import { useState } from 'react';
import LiveSlotTracker from '@/components/LiveSlotTracker';
import RegistrationSection from '@/components/RegistrationSection';
import { StickySelectionBar } from '@/components/StickySelectionBar';
import type { Ghat, TimeSlot } from '@/lib/types';

type SlotBookingAreaProps = {
    ghats: Ghat[];
    ghatOptions: { value: string, label: string }[];
}

export default function SlotBookingArea({ ghats, ghatOptions }: SlotBookingAreaProps) {
  const [selection, setSelection] = useState<{ ghat: Ghat; slot: TimeSlot } | null>(null);

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
      <LiveSlotTracker ghats={ghats} onSlotSelect={handleSlotSelect} />
      <RegistrationSection ghatOptions={ghatOptions} selection={selection} />
      <StickySelectionBar selection={selection} onClear={clearSelection} />
    </>
  );
}
