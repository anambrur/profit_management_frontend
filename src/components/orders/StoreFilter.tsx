'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Check, ChevronDown, X } from 'lucide-react';
import { useState } from 'react';

export interface Store {
  id: string;
  name: string;
  color?: string;
}

interface StoreFilterProps {
  stores: Store[];
  selectedStores: string[];
  onStoreChange: (storeIds: string[]) => void;
  placeholder?: string;
}

export function StoreFilter({
  stores,
  selectedStores,
  onStoreChange,
  placeholder = 'Select stores...',
}: StoreFilterProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const filteredStores = stores.filter((store) =>
    store.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleStoreToggle = (storeId: string) => {
    const updatedSelection = selectedStores.includes(storeId)
      ? selectedStores.filter((id) => id !== storeId)
      : [...selectedStores, storeId];
    onStoreChange(updatedSelection);
  };

  const handleSelectAll = () => {
    if (selectedStores.length === stores.length) {
      onStoreChange([]);
    } else {
      onStoreChange(stores.map((store) => store.id));
    }
  };

  const clearSelection = () => {
    onStoreChange([]);
  };

  const selectedStoreNames = stores
    .filter((store) => selectedStores.includes(store.id))
    .map((store) => store.name);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between min-w-[200px]"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {selectedStores.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : selectedStores.length === 1 ? (
              <span className="truncate">{selectedStoreNames[0]}</span>
            ) : (
              <span className="text-sm">
                {selectedStores.length} stores selected
              </span>
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search stores..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>No stores found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={handleSelectAll}
                className="cursor-pointer"
              >
                <Checkbox
                  checked={selectedStores.length === stores.length}
                  className="mr-2"
                />
                <span className="font-medium">
                  {selectedStores.length === stores.length
                    ? 'Deselect All'
                    : 'Select All'}
                </span>
              </CommandItem>
              <Separator className="my-1" />
              {filteredStores.map((store) => (
                <CommandItem
                  key={store.id}
                  onSelect={() => handleStoreToggle(store.id)}
                  className="cursor-pointer"
                >
                  <Checkbox
                    checked={selectedStores.includes(store.id)}
                    className="mr-2"
                  />
                  <span className="flex-1">{store.name}</span>
                  <Check
                    className={`ml-auto h-4 w-4 ${
                      selectedStores.includes(store.id)
                        ? 'opacity-100'
                        : 'opacity-0'
                    }`}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        {selectedStores.length > 0 && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="w-full justify-center"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Selection
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// Selected stores display component
interface SelectedStoresDisplayProps {
  stores: Store[];
  selectedStores: string[];
  onRemoveStore: (storeId: string) => void;
}

export function SelectedStoresDisplay({
  stores,
  selectedStores,
  onRemoveStore,
}: SelectedStoresDisplayProps) {
  if (selectedStores.length === 0) return null;

  const selectedStoreData = stores.filter((store) =>
    selectedStores.includes(store.id)
  );

  return (
    <div className="flex flex-wrap gap-2">
      {selectedStoreData.map((store) => (
        <Badge
          key={store.id}
          variant="secondary"
          className="flex items-center gap-1 pr-1"
        >
          <span>{store.name}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveStore(store.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
    </div>
  );
}
