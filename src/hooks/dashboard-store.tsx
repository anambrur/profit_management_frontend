import { useAuthStore } from '@/store/useAuthStore';
import { useEffect, useMemo, useState } from 'react';
import { useStoresData } from './useStoreData';

export const useAllowedStores = () => {
  const { user } = useAuthStore();
  const { data: stores } = useStoresData();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const allowedStores = useMemo(() => {
    if (!hydrated || !stores) return [];

    const allowedStoreIds =
      user?.allowedStores?.map((store) => store.storeId) || [];
    return stores.filter((store) => allowedStoreIds.includes(store.storeId));
  }, [hydrated, stores, user?.allowedStores]);

  return allowedStores;
};
