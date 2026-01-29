import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crowd Intelligence | KumbhSaathi Admin',
  description: 'Real-time crowd intelligence and analytics.',
};

export default function CrowdIntelligenceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
