'use client';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';

export default function ToggleTheme() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // ensures hydration has happened
  }, []);

  if (!mounted) return null;

  const isLight = resolvedTheme === 'light';

  return (
    <Button
      onClick={() => setTheme(isLight ? 'dark' : 'light')}
      className="rounded-full transition-colors duration-200 hover:bg-transparent"
      variant="outline"
      size="icon"
    >
      {isLight ? (
        <Moon className="text-gray-600" />
      ) : (
        <Sun className="text-amber-400" />
      )}
    </Button>
  );
}
