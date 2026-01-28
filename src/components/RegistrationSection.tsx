import { RegistrationForm } from './RegistrationForm';
import {PlaceHolderImages} from '@/lib/placeholder-images'
import Image from 'next/image';
import type { Ghat, TimeSlot } from '@/lib/types';

type RegistrationSectionProps = {
    selection: { ghat: Ghat, slot: TimeSlot } | null;
    ghatOptions: { value: string, label: string }[];
}


export default function RegistrationSection({ selection, ghatOptions }: RegistrationSectionProps) {
  const bgImage = PlaceHolderImages.find(img => img.id === 'kumbh-bg');

  return (
    <section id="registration-form" className="py-20 bg-cover bg-center relative scroll-mt-20" >
        <div className="absolute inset-0 bg-black/50 z-0">
          {bgImage && (
             <Image
                src={bgImage.imageUrl}
                alt={bgImage.description}
                fill
                className="object-cover opacity-50"
                data-ai-hint={bgImage.imageHint}
            />
          )}
        </div>
        <div className="container relative z-10">
            <div className="max-w-2xl mx-auto bg-card/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <h2 className="font-headline text-3xl md:text-4xl font-bold text-white">
                        Book Your Divine Slot
                    </h2>
                    <p className="mt-2 text-lg text-white/80">
                        {selection ? "Confirm your details below." : "Select a slot above or fill in your details to secure your spot."}
                    </p>
                </div>
                <RegistrationForm ghats={ghatOptions} selection={selection ? { ghat: { name: selection.ghat.name, shortName: selection.ghat.shortName}, slot: { time: selection.slot.time } } : null} />
            </div>
        </div>
    </section>
  );
}
