import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import SlotBookingArea from '@/components/SlotBookingArea';
import { getGhatsForDropdown } from '@/lib/data';

// For now, this is a mock. In a real app, this would be fetched from Firestore.
const getRegisteredToday = async () => {
    return 12345;
}

export default async function Home() {
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
