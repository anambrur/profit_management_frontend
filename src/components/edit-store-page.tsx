'use client';

import type React from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertCircle,
  ArrowLeft,
  Building,
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
  Key,
  Mail,
  Save,
  Store,
  Upload,
  X,
} from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';
import axiosInstance from '@/lib/axiosInstance';

interface StoreData {
  storeId: string;
  storeName: string;
  storeEmail: string;
  storeClientId: string;
  storeClientSecret: string;
  storeStatus: 'active' | 'inactive' | 'pending';
  storeImage: string;
  storeDescription?: string;
  storeAddress?: string;
  storePhone?: string;
  createdAt: string;
}

interface FormErrors {
  [key: string]: string;
}

interface EditStorePageProps {
  store: StoreData;
  onBack: () => void;
  onStoreUpdated: (store: StoreData) => void;
}

export default function StorePageEdit({
  store,
  onBack,
  onStoreUpdated,
}: EditStorePageProps) {
  const [formData, setFormData] = useState<StoreData>(store);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(store.storeImage);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Store Name validation
    if (!formData.storeName.trim()) {
      newErrors.storeName = 'Store name is required';
    } else if (formData.storeName.trim().length < 2) {
      newErrors.storeName = 'Store name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.storeEmail.trim()) {
      newErrors.storeEmail = 'Store email is required';
    } else if (!emailRegex.test(formData.storeEmail)) {
      newErrors.storeEmail = 'Please enter a valid email address';
    }

    // Phone validation
    if (
      formData.storePhone &&
      !/^\d{10,15}$/.test(formData.storePhone.replace(/\s/g, ''))
    ) {
      newErrors.storePhone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof StoreData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          storeImage: 'Image size must be less than 5MB',
        }));
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({
          ...prev,
          storeImage: 'Please select a valid image file',
        }));
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData((prev) => ({
          ...prev,
          storeImage: result,
        }));
      };
      reader.readAsDataURL(file);

      // Clear image error
      if (errors.storeImage) {
        setErrors((prev) => ({
          ...prev,
          storeImage: '',
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // axiosInstance.put('/', formData);

      setSubmitStatus('success');

      // Call the callback to update the parent component
      onStoreUpdated(formData);

      // Navigate back after a short delay
      setTimeout(() => {
        onBack();
      }, 1500);
    } catch (error) {
      console.error('Error updating store:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    console.log(`${field} copied to clipboard`);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="outline" onClick={onBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Stores
          </Button>
          <div className="flex items-center mb-4">
            <Store className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Edit Store</h1>
          </div>
          <p className="text-gray-600">Update store information and settings</p>
        </div>

        {/* Success/Error Messages */}
        {submitStatus === 'success' && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Store updated successfully! Redirecting back to stores list...
            </AlertDescription>
          </Alert>
        )}

        {submitStatus === 'error' && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Failed to update store. Please try again.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Store Logo Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Store Logo</CardTitle>
              <CardDescription>Update the store logo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={imagePreview || '/placeholder.svg'}
                      alt="Store logo preview"
                    />
                    <AvatarFallback className="text-lg bg-gray-100">
                      {formData.storeName ? (
                        getInitials(formData.storeName)
                      ) : (
                        <Store className="h-8 w-8" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="store-logo-upload"
                  />
                  <label htmlFor="store-logo-upload">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 cursor-pointer"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </label>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Update Logo</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Choose a new store logo. Max file size: 5MB
                  </p>
                  {errors.storeImage && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.storeImage}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Store Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Store Information
                </CardTitle>
                <CardDescription>
                  Basic store details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="storeId">Store ID</Label>
                  <Input
                    id="storeId"
                    value={formData.storeId}
                    disabled
                    className="bg-gray-100"
                  />
                  <p className="text-xs text-gray-500">
                    Store ID cannot be changed
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeName">
                    Store Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="storeName"
                    value={formData.storeName}
                    onChange={(e) =>
                      handleInputChange('storeName', e.target.value)
                    }
                    placeholder="Enter store name"
                    className={errors.storeName ? 'border-red-500' : ''}
                  />
                  {errors.storeName && (
                    <p className="text-sm text-red-600">{errors.storeName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeEmail">
                    Store Email <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="storeEmail"
                      type="email"
                      value={formData.storeEmail}
                      onChange={(e) =>
                        handleInputChange('storeEmail', e.target.value)
                      }
                      placeholder="Enter store email"
                      className={`pl-10 ${
                        errors.storeEmail ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  {errors.storeEmail && (
                    <p className="text-sm text-red-600">{errors.storeEmail}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storePhone">Phone Number</Label>
                  <Input
                    id="storePhone"
                    value={formData.storePhone || ''}
                    onChange={(e) =>
                      handleInputChange('storePhone', e.target.value)
                    }
                    placeholder="Enter phone number (optional)"
                    className={errors.storePhone ? 'border-red-500' : ''}
                  />
                  {errors.storePhone && (
                    <p className="text-sm text-red-600">{errors.storePhone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeStatus">Store Status</Label>
                  <Select
                    value={formData.storeStatus}
                    onValueChange={(value) =>
                      handleInputChange('storeStatus', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                          Active
                        </div>
                      </SelectItem>
                      <SelectItem value="inactive">
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                          Inactive
                        </div>
                      </SelectItem>
                      <SelectItem value="pending">
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></div>
                          Pending
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* API Credentials */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="h-5 w-5 mr-2" />
                  API Credentials
                </CardTitle>
                <CardDescription>View and copy API credentials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="storeClientId">Client ID</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="storeClientId"
                      value={formData.storeClientId}
                      readOnly
                      className="bg-gray-50"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(formData.storeClientId, 'Client ID')
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeClientSecret">Client Secret</Label>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <Input
                        id="storeClientSecret"
                        type={showClientSecret ? 'text' : 'password'}
                        value={formData.storeClientSecret}
                        readOnly
                        className="bg-gray-50"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowClientSecret(!showClientSecret)}
                      >
                        {showClientSecret ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          formData.storeClientSecret,
                          'Client Secret'
                        )
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    API credentials are read-only. Contact support to regenerate
                    them.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>
                Store description and address details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storeDescription">Store Description</Label>
                <Textarea
                  id="storeDescription"
                  value={formData.storeDescription || ''}
                  onChange={(e) =>
                    handleInputChange('storeDescription', e.target.value)
                  }
                  placeholder="Enter store description (optional)"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeAddress">Store Address</Label>
                <Textarea
                  id="storeAddress"
                  value={formData.storeAddress || ''}
                  onChange={(e) =>
                    handleInputChange('storeAddress', e.target.value)
                  }
                  placeholder="Enter store address (optional)"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating Store...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Store
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
