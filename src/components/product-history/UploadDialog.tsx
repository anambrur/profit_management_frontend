'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useStoresData } from '@/hooks/useStoreData';

import axiosInstance from '@/lib/axiosInstance';
import {
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Upload,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Input } from '../ui/input';

interface FormValues {
  file: FileList | undefined;
  storeID: string;
}

export function UploadDialog() {
  const { data: stores = [] } = useStoresData();

  const [open, setOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      file: undefined,
      storeID: '',
    },
  });

  const selectedFile = watch('file')?.[0];

  const mutation = useMutation({
    mutationFn: (formData: FormData) =>
      axiosInstance
        .post('/api/product-history/upload-product-history', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Access-Control-Allow-Origin': '*',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setUploadProgress(percentCompleted);
          },
        })
        .then((res) => res.data),
    onMutate: () => {
      setUploadProgress(0);
      setGeneralError(null);
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Upload successful');
      setUploadProgress(100);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Upload failed');
      setGeneralError(error.message || 'Network error occurred');
    },
  });

  const validateFile = (files: FileList | undefined) => {
    const file = files?.[0];
    if (!file) return 'File is required';

    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (!allowedTypes.includes(file.type)) {
      return 'Invalid file type. Please select CSV or Excel files only.';
    }
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return 'File size too large. Maximum size is 10MB.';
    }
    return true;
  };

  const onSubmit = (data: FormValues) => {
    if (!data.file || data.file.length === 0) {
      setError('file', { message: 'File is required' });
      return;
    }
    const formData = new FormData();
    formData.append('file', data.file[0]);
    formData.append('storeID', data.storeID);
    mutation.mutate(formData);
  };

  const handleClose = () => {
    if (mutation.isPending) return;
    reset();
    setGeneralError(null);
    setUploadProgress(0);
    setOpen(false); // close dialog
    mutation.reset(); // ✅ Reset mutation state
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) handleClose();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">Upload File</Button>
      </DialogTrigger>
      <DialogContent
        key={open ? 'open' : 'closed'}
        className="sm:max-w-[600px]"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload CSV/Excel File
          </DialogTitle>
          <DialogDescription>
            Upload inventory data, product information, or other business data
            to your selected store.
          </DialogDescription>
        </DialogHeader>

        {mutation.isSuccess ? (
          <div className="space-y-4">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                File uploaded and processed successfully!
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button onClick={handleClose}>Close</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {generalError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{generalError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="file-upload">
                Select File <span className="text-destructive">*</span>
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                className="cursor-pointer"
                {...register('file', {
                  required: 'File is required',
                  validate: validateFile,
                })}
                disabled={mutation.isPending}
              />
              {errors.file && (
                <p className="text-sm text-destructive mt-1">
                  {errors.file.message}
                </p>
              )}
              {selectedFile && (
                <div className="flex items-center justify-between text-sm text-muted-foreground mt-1">
                  <FileSpreadsheet className="h-4 w-4 text-green-600" />
                  <span>{selectedFile.name}</span>
                  <span>{formatFileSize(selectedFile.size)}</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Supported formats: CSV, Excel (.xlsx, .xls). Maximum size: 10MB
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="store-select">
                Select Store <span className="text-destructive">*</span>
              </Label>
              <Controller
                control={control}
                name="storeID"
                rules={{ required: 'Store selection is required' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    disabled={mutation.isPending}
                    onValueChange={(value) => {
                      field.onChange(value);
                      clearErrors('storeID');
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a store..." />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map((store) => (
                        <SelectItem key={store._id} value={store._id}>
                          <div className="flex flex-col">
                            <span>{store.storeName}</span>
                            <span className="text-xs text-muted-foreground">
                              {store.storeEmail}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.storeID && (
                <p className="text-sm text-destructive mt-1">
                  {errors.storeID.message}
                </p>
              )}
            </div>

            {mutation.isPending && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Uploading...' : 'Upload File'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
