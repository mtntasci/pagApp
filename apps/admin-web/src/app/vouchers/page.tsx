'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VouchersPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/surveys');
  }, [router]);

  return null;
}
