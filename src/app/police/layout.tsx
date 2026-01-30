import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KumbhSaathi Police Portal',
  description: 'Official portal for on-duty police and volunteers.',
};

export default function PoliceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark bg-background text-foreground min-h-screen">
      {children}
    </div>
  );
}
