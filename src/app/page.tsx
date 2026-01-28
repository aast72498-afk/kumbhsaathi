import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import SlotBookingArea from '@/components/SlotBookingArea';
import { getGhatsForDropdown } from '@/lib/data';
import { seedDatabase } from '@/app/actions';

// For now, this is a mock. In a real app, this would be fetched from Firestore.
const getRegisteredToday = async () => {
    // In a real app, you would query the 'registrations' collection.
    // For now, we return a static number.
    return 12345; 
}

export default async function Home() {
  await seedDatabase(); // Ensure DB is seeded on first load
  const registeredToday = await getRegisteredToday();
  const ghatOptions = await getGhatsForDropdown();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 pb-20">
        <Hero registeredToday={registeredToday} />
        <SlotBookingArea ghatOptions={ghatOptions} />
      </main>
      <Footer />
    </div>
  );
}
