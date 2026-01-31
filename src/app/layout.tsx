import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase';

export const metadata: Metadata = {
  title: 'Kumbh Saathi | Smart City Nashik',
  description: 'Your digital companion for a divine experience at the Nashik Kumbh Mela.',
  icons: {
    icon: 'https://iili.io/fLU26ZX.jpg', // Ye line Firebase logo ko replace karegi
    apple: 'https://iili.io/fLU26ZX.jpg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased font-sans"> 
        <FirebaseClientProvider>
          {children} {/* Sirf content dikhega, koi extra navbar nahi */}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}