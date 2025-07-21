import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
interface Store {
  storeId: string;
  storeName: string;
  storeEmail: string;
  storeClientId: string;
  storeClientSecret: string;
  storeImage?: string;
  storeImagePublicId?: string;
  storeStatus: 'active' | 'inactive' | 'suspended';
}
export function StoreFilter({
  value,
  onChange,
  storeValue,
}: {
  value?: string;
  onChange?: (val: string) => void;
  storeValue?: Store[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-10 w-65 shadow-none">
        <SelectValue placeholder="Select store" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Stores</SelectItem>
        {storeValue?.map((store) => (
          <SelectItem key={store.storeId} value={store.storeId}>
            {store.storeName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
