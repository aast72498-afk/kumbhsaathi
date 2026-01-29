import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Emergency Dispatch | KumbhSaathi Admin',
  description: 'Manage and dispatch emergency vehicles in real-time.',
};

export default function EmergencyDispatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
