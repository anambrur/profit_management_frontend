'use client';

import { usePathname } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { useEffect } from 'react';

// ✅ Custom Configuration
NProgress.configure({
  minimum: 0.2,
  easing: 'ease-in-out',
  speed: 600,
  showSpinner: false,
  trickle: true,
  trickleSpeed: 300,
  parent: 'body',
});

export default function NProgressProvider() {
  const pathname = usePathname();

  useEffect(() => {
    NProgress.start();
    const timer = setTimeout(() => {
      NProgress.done();
    });

    return () => {
      clearTimeout(timer);
    };
  }, [pathname]);

  return null;
}
