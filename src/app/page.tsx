import { seedDatabase } from '@/app/actions';
import BookingInterface from '@/components/BookingInterface';

export default async function Home() {
  // Ensure the database is seeded with initial data on first load.
  await seedDatabase();
  
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
       <div className="w-full max-w-4xl">
        <BookingInterface />
      </div>
    </main>
  );
}
