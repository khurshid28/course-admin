import axios, { AxiosError } from "axios";
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";

interface FetchOptions<T> {
  fetcher: () => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  autoFetch?: boolean;
  successMessage?: string;
}

export function useFetchWithLoader<T>({
  fetcher,
  onSuccess,
  onError,
  autoFetch = true,
  successMessage,
}: FetchOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await fetcher();
      setData(result);
      console.log(result);
      
      if (successMessage) toast.success(successMessage);
      onSuccess?.(result);
    } catch (err) {
      setError(err);
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || err.message);
      } else {
        toast.error("Xatolik yuz berdi");
      }
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  }, [fetcher, onSuccess, onError, successMessage]);

  useEffect(() => {
    if (autoFetch) fetchData();
  }, [fetchData, autoFetch]);

  return { data, isLoading, error, refetch: fetchData };
}
