import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Login | KumbhSaathi',
  description: 'Login to access the KumbhSaathi Admin Dashboard.',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
