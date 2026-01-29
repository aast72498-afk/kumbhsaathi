import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'System Logs & Audit Trail | KumbhSaathi Admin',
  description: 'View system logs and audit trails for accountability.',
};

export default function SystemLogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
