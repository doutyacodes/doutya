"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WhyXortcutRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/why-xortlist');
  }, [router]);

  return null;
}
