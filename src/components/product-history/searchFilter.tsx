'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SearchFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function SearchFilter({ search, onSearchChange }: SearchFilterProps) {
  const [input, setInput] = useState(search);

  useEffect(() => {
    const delay = setTimeout(() => {
      onSearchChange(input);
    }, 400); // debounce delay
    return () => clearTimeout(delay);
  }, [input]);

  return (
    <div className="w-full px-4 py-2">
      <div className="relative">  
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search by product name or SKU..."
          className="pl-10"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>
    </div>
  );
}
