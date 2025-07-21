'use client';

import { useFileUpload } from '@/hooks/use-file-upload';
import axiosInstance from '@/lib/axiosInstance';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building,
  CheckCircle,
  CircleUserRoundIcon,
  Key,
  Save,
  Store,
  X,
} from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface NewStoreFormValues {
  storeId: string;
  storeName: string;
  storeEmail: string;
  storeClientId: string;
  storeClientSecret: string;
  storeStatus: string;
  storeImage: string;
}

export default function StorePageAdd() {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<NewStoreFormValues>({
    defaultValues: {
      storeId: '',
      storeName: '',
      storeEmail: '',
      storeClientId: '',
      storeClientSecret: '',
      storeStatus: 'active',
      storeImage: '',
    },
  });

  const [
    { files, isDragging },
    {
      removeFile,
      openFileDialog,
      getInputProps,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
    },
  ] = useFileUpload({
    accept: 'image/*',
  });

  React.useEffect(() => {
    if (files.length > 0 && files[0].preview) {
      setValue('storeImage', files[0].preview);
    }
  }, [files, setValue]);

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: NewStoreFormValues & { imageFile?: File }) => {
      const formData = new FormData();
      formData.append('storeId', data.storeId);
      formData.append('storeName', data.storeName);
      formData.append('storeEmail', data.storeEmail);
      formData.append('storeClientId', data.storeClientId);
      formData.append('storeClientSecret', data.storeClientSecret);
      formData.append('storeStatus', data.storeStatus);

      if (data.imageFile) {
        formData.append('storeImage', data.imageFile);
      }

      const res = await axiosInstance.post(
        '/api/stores/create-store',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      reset();
    },
  });

  const onSubmit = async (data: NewStoreFormValues) => {
    const fileCandidate = files[0]?.file;
    const imageFile = fileCandidate instanceof File ? fileCandidate : undefined;
    mutation.mutate({
      ...data,
      imageFile,
    });
  };

  const storeImage = watch('storeImage');

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Store className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Add New Store</h1>
          </div>
          <p className="text-gray-600">
            Create a new store with API credentials and configuration
          </p>
        </div>

        {mutation.isSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Store created successfully!
            </AlertDescription>
          </Alert>
        )}

        {mutation.isError && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <X className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Something went wrong creating the store - please try again
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Store Logo</CardTitle>
              <CardDescription>Upload a logo for the store</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-6">
                <div className="relative inline-flex">
                  <button
                    className="border-input hover:bg-accent/50 data-[dragging=true]:bg-accent/50 focus-visible:border-ring focus-visible:ring-ring/50 relative flex size-24 items-center justify-center overflow-hidden rounded-full border border-dashed transition-colors outline-none focus-visible:ring-[3px] has-disabled:pointer-events-none has-disabled:opacity-50 has-[img]:border-none"
                    onClick={openFileDialog}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    data-dragging={isDragging || undefined}
                    aria-label={storeImage ? 'Change image' : 'Upload image'}
                    type="button"
                  >
                    {storeImage ? (
                      <img
                        className="size-full object-cover"
                        src={storeImage}
                        alt="Uploaded image"
                        width={96}
                        height={96}
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <CircleUserRoundIcon className="size-6 opacity-60" />
                    )}
                  </button>

                  {storeImage && (
                    <Button
                      onClick={() => {
                        removeFile(files[0]?.id);
                        setValue('storeImage', '');
                      }}
                      size="icon"
                      className="absolute -top-1 -right-1 size-6 rounded-full"
                      aria-label="Remove image"
                      type="button"
                    >
                      <X className="size-4" />
                    </Button>
                  )}

                  <input
                    {...getInputProps()}
                    className="sr-only"
                    aria-label="Upload image file"
                    tabIndex={-1}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" /> Store Info
                </CardTitle>
                <CardDescription>Basic store details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="storeId">Store ID</Label>
                  <Input
                    id="storeId"
                    {...register('storeId', {
                      required: 'Store ID is required',
                    })}
                  />
                  {errors.storeId && (
                    <p className="text-sm text-red-600">
                      {errors.storeId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input
                    id="storeName"
                    {...register('storeName', {
                      required: 'Store name is required',
                    })}
                  />
                  {errors.storeName && (
                    <p className="text-sm text-red-600">
                      {errors.storeName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeEmail">Email</Label>
                  <Input
                    id="storeEmail"
                    type="email"
                    {...register('storeEmail', { required: 'Email required' })}
                  />
                  {errors.storeEmail && (
                    <p className="text-sm text-red-600">
                      {errors.storeEmail.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="h-5 w-5 mr-2" /> API Credentials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="storeClientId">Client ID</Label>
                  <Input
                    id="storeClientId"
                    {...register('storeClientId', {
                      required: 'Client ID is required',
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeClientSecret">Client Secret</Label>
                  <Input
                    id="storeClientSecret"
                    type="password"
                    {...register('storeClientSecret', {
                      required: 'Secret is required',
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <Button type="button" variant="outline" onClick={() => reset()}>
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || mutation.isPending}
              className="bg-blue-600 text-white"
            >
              {isSubmitting || mutation.isPending ? (
                'Submitting...'
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Store
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
