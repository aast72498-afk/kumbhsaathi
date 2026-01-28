import Header from '@/components/Header';
import Hero from '@/components/Hero';
import LiveSlotTracker from '@/components/LiveSlotTracker';
import RegistrationSection from '@/components/RegistrationSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <LiveSlotTracker />
        <RegistrationSection />
      </main>
      <Footer />
    </div>
  );
}
