"use client";

import type { Ghat, TimeSlot } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';
import { Button } from './ui/button';

const getStatus = (current: number, max: number) => {
  const percentage = (current / max) * 100;
  if (percentage >= 100) return { label: 'Full', disabled: true };
  if (percentage >= 70) return { label: 'Filling Fast', disabled: false };
  return { label: 'Available', disabled: false };
};

export function GhatCard({ ghat, onSlotSelect }: { ghat: Ghat, onSlotSelect: (ghat: Ghat, slot: TimeSlot) => void }) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-primary/20 hover:shadow-2xl transition-shadow duration-300 rounded-2xl border-2 border-transparent hover:border-primary/50 flex flex-col">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
            <Image
                src={ghat.imageUrl}
                alt={ghat.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                data-ai-hint={ghat.imageHint}
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
             <CardTitle className="absolute bottom-4 left-4 font-headline text-2xl text-white">{ghat.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 flex-1 flex flex-col">
        <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2"><Clock className="w-4 h-4" /> Time Slots</h3>
        <ul className="space-y-3 flex-1">
          {ghat.timeSlots.map(slot => {
            const status = getStatus(slot.currentRegistrations, slot.maxCapacity);
            return (
              <li key={slot.id} className="flex justify-between items-center bg-secondary/50 p-3 rounded-lg">
                <span className="font-medium text-foreground">{slot.time}</span>
                <Button 
                    size="sm"
                    onClick={() => onSlotSelect(ghat, slot)} 
                    disabled={status.disabled}
                    variant={status.disabled ? 'destructive' : 'default'}
                    className="font-bold"
                >
                    {status.label === 'Full' ? 'Full' : 'Book Now'}
                </Button>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
