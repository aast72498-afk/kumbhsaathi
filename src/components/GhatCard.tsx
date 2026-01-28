import type { Ghat } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

const getStatus = (current: number, max: number) => {
  const percentage = (current / max) * 100;
  if (percentage >= 95) return { label: 'Full', color: 'bg-red-500 hover:bg-red-500/90', textColor: 'text-white' };
  if (percentage >= 70) return { label: 'Filling Fast', color: 'bg-orange-400 hover:bg-orange-400/90', textColor: 'text-white' };
  return { label: 'Available', color: 'bg-green-500 hover:bg-green-500/90', textColor: 'text-white' };
};

export function GhatCard({ ghat }: { ghat: Ghat }) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-primary/20 hover:shadow-2xl transition-shadow duration-300 rounded-2xl border-2 border-transparent hover:border-primary/50">
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
      <CardContent className="p-6">
        <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2"><Clock className="w-4 h-4" /> Time Slots</h3>
        <ul className="space-y-3">
          {ghat.timeSlots.map(slot => {
            const status = getStatus(slot.currentRegistrations, slot.maxCapacity);
            return (
              <li key={slot.id} className="flex justify-between items-center bg-secondary/50 p-3 rounded-lg">
                <span className="font-medium text-foreground">{slot.time}</span>
                <Badge className={cn("text-xs font-bold", status.color, status.textColor)}>
                  {status.label}
                </Badge>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
