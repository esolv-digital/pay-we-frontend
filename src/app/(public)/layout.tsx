import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PayWe - Secure Payment Processing',
  description: 'Complete your payment securely with PayWe',
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
