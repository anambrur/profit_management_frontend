import { useAllowedStores } from '@/store/useAuthStore';
import { PaginationInfo } from './product-history/ProductHistory-table';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Skeleton } from './ui/skeleton';

interface SelectStoreProps {
  selectedStores: string[];
  setSelectedStores: React.Dispatch<React.SetStateAction<string[]>>;
  isLoading: boolean;
  clearSelection: () => void;
  setPagination: React.Dispatch<React.SetStateAction<PaginationInfo>>;
  handleRefresh: () => void;
}

export default function SelectStore({
  selectedStores,
  setSelectedStores,
  isLoading,
  clearSelection,
  setPagination,
  handleRefresh,
}: SelectStoreProps) {
  const stores = useAllowedStores();
  const handleStoreChange = (newStoreIds: string[]) => {
    setSelectedStores(newStoreIds);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };
  const handleCheckboxChange = (storeId: string, checked: boolean) => {
    setSelectedStores((prev) => {
      let newSelected;
      if (checked) {
        newSelected = [...prev, storeId];
      } else {
        newSelected = prev.filter((id) => id !== storeId);
      }
      handleStoreChange(newSelected);
      return newSelected;
    });
  };

  const getSelectedStoreNames = () => {
    if (selectedStores.length === 0) return 'All Stores';
    const names = stores
      .filter((s) => selectedStores.includes(s._id as string))
      .map((s) => s.storeName);
    return names.length > 0 ? names.join(', ') : 'Selected Stores';
  };
  return (
    <div className="flex items-center justify-between">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="min-w-[200px]">
            Select Store(s) {selectedStores.length / 2}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-4 shadow-none" align="start">
          {isLoading ? (
            <Skeleton className="h-8 w-full" />
          ) : (
            <div className="flex flex-col max-h-60 overflow-auto space-y-2">
              {stores.map((store) => {
                const checked = selectedStores.includes(store._id as string);
                return (
                  <label
                    key={store._id}
                    className="inline-flex items-center space-x-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(store._id as string, !!checked)
                      }
                    />
                    <span>{store.storeName}</span>
                  </label>
                );
              })}
            </div>
          )}
          {selectedStores.length > 0 && (
            <Button
              variant="destructive"
              className="mt-3 w-full"
              onClick={clearSelection}
            >
              Clear All
            </Button>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
