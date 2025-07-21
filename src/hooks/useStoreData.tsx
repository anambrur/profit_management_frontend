import axiosInstance from '@/lib/axiosInstance';
import { useQuery } from '@tanstack/react-query';

export interface Store {
  _id: Key | null | undefined;
  storeId: string;
  storeName: string;
  storeEmail: string;
  storeClientId: string;
  storeClientSecret: string;
  storeImage?: string;
  storeImagePublicId?: string;
  storeStatus: 'active' | 'inactive' | 'suspended';
}
const getStore = async (): Promise<Store[]> => {
  try {
    const response = await axiosInstance.get('/api/stores/get-all-store');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching stores:', error);
    return [];
  }
};

export const useStoresData = () => {
  return useQuery({
    queryKey: ['stores'],
    queryFn: getStore,
  });
};
