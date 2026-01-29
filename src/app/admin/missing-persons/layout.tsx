import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Missing Persons | KumbhSaathi Admin',
  description: 'Privacy-first dashboard for managing missing person cases.',
};

export default function MissingPersonsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
