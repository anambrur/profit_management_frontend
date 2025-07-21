import axiosInstance from '@/lib/axiosInstance';
import { useQuery } from '@tanstack/react-query';

export const useRole = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () =>
      axiosInstance.get('/api/roles/all').then((res) => res.data.data),
  });
};
