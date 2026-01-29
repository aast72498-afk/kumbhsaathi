import { seedDatabase } from '@/app/actions';
import BookingInterface from '@/components/BookingInterface';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

export default async function Home() {
  // Ensure the database is seeded with initial data on first load.
  await seedDatabase();
  const bgImage = PlaceHolderImages.find(img => img.id === 'kumbh-bg');
  
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 relative">
       {bgImage && (
            <Image
                src={bgImage.imageUrl}
                alt={bgImage.description}
                fill
                className="object-cover -z-10"
                data-ai-hint={bgImage.imageHint}
            />
        )}
       <div className="w-full max-w-4xl">
        <BookingInterface />
      </div>
    </main>
  );
}
