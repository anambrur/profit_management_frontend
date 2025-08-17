'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type React from 'react';

import {
  AlertCircle,
  Building2,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  Save,
  Shield,
  User,
  UserCheck,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

// Components
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRole } from '@/hooks/useRole';
import { useStoresData } from '@/hooks/useStoreData';
import axiosInstance from '@/lib/axiosInstance';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface Permission {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Role {
  _id: string;
  name: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Store {
  _id: string;
  storeName: string;
}

interface EditUser {
  name: string;
  email: string;
  username: string;
  phone: string;
  roles: string;
  status: string;
  password?: string;
  confirmPassword?: string;
  profileImage: string;
  assignedStores?: string[];
}

interface FormErrors {
  [key: string]: string;
}

interface StoreSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  stores: Store[];
  onAssign: (selectedStores: string[]) => void;
  defaultSelected?: string[];
}

interface UserPageEditProps {
  userId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function UserPageEdit({
  userId,
  onSuccess,
  onCancel,
}: UserPageEditProps) {
  // Form state
  const [formData, setFormData] = useState<EditUser>({
    name: '',
    email: '',
    username: '',
    phone: '',
    roles: '',
    status: 'active',
    password: '',
    confirmPassword: '',
    profileImage: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [isStoreDialogOpen, setIsStoreDialogOpen] = useState(false);
  const [assignedStores, setAssignedStores] = useState<string[]>([]);
  const [changePassword, setChangePassword] = useState(false);

  // Data fetching
  const { data: stores = [], isLoading: isStoresLoading } = useStoresData();
  const { data: roles = [], isLoading: isRolesLoading } = useRole();
  const queryClient = useQueryClient();

  // Fetch existing user data
  const {
    data: existingUser,
    isLoading: isUserLoading,
    error: userError,
  } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/api/users/get-user/${userId}`);
      return response.data.user;
    },
    enabled: !!userId,
  });

  // Initialize form with existing user data
  useEffect(() => {
    if (existingUser) {
      setFormData({
        name: existingUser.name || '',
        email: existingUser.email || '',
        username: existingUser.username || '',
        phone: existingUser.phone || '',
        roles: existingUser.role || '',
        status: existingUser.status || 'active',
        password: '',
        confirmPassword: '',
        profileImage: existingUser.profileImage || '',
      });
      setAssignedStores(existingUser.assignedStores || []);
      if (existingUser.profileImage) {
        setImagePreview(existingUser.profileImage);
      }
    }
  }, [existingUser]);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username =
        'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number (10-15 digits)';
    }

    // Password validation only if changing password
    if (changePassword) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/[A-Z]/.test(formData.password)) {
        newErrors.password =
          'Password must contain at least one uppercase letter';
      } else if (!/[0-9]/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one number';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Input change handler
  const handleInputChange = (field: keyof EditUser, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  // Image upload handler
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        profileImage: 'Image size must be less than 5MB',
      }));
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({
        ...prev,
        profileImage: 'Please select a valid image file',
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
        profileImage: result,
      }));
    };
    reader.readAsDataURL(file);

    if (errors.profileImage) {
      setErrors((prev) => ({
        ...prev,
        profileImage: '',
      }));
    }
  };

  // API mutation for updating user
  const mutation = useMutation({
    mutationFn: async (userData: EditUser) => {
      const updateData = {
        ...userData,
        roles: userData.roles,
        allowedStores: assignedStores,
        newPassword: changePassword ? formData.password : undefined,
      };

      // Remove password fields if not changing password
      if (!changePassword) {
        delete updateData.password;
        delete updateData.confirmPassword;
      }

      const response = await axiosInstance.put(
        `/api/users/update-user/${userId}`,
        updateData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      setSubmitStatus('success');
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error('User update error:', error);
      toast.error(
        `❌ ${error.response?.data?.message || 'Failed to update user'}`
      );
      setSubmitStatus('error');
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Prepare the update data
    const updateData = {
      ...formData,
      roles: formData.roles,
      allowedStores: assignedStores,
    };

    // First update the user data
    try {
      await mutation.mutateAsync(updateData);
      toast.success('🎉 User updated successfully!');
      setSubmitStatus('success');
      onSuccess?.();
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignStores = (selectedStores: string[]) => {
    if (selectedStores.length === 0) {
      toast.error('Please select at least one store for the manager');
      return;
    }
    setAssignedStores(selectedStores);
    setIsStoreDialogOpen(false);

    // Submit the form after store assignment
    mutation.mutate(formData);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      // Reset form to original values
      if (existingUser) {
        setFormData({
          name: existingUser.name || '',
          email: existingUser.email || '',
          username: existingUser.username || '',
          phone: existingUser.phone || '',
          roles: existingUser.roles.name || '',
          status: existingUser.status || 'active',
          password: '',
          confirmPassword: '',
          profileImage: existingUser.profileImage || '',
        });
        setAssignedStores(existingUser.assignedStores || []);
        setImagePreview(existingUser.profileImage || '');
      }
      setErrors({});
      setChangePassword(false);
      setSubmitStatus('idle');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'manager':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'employee':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Loading state
  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
              <p className="text-lg text-gray-600">Loading user data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (userError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800 font-medium">
              ❌ Failed to load user data. Please try again.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl mr-4">
              <UserCheck className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Edit User
              </h1>
              <p className="text-lg text-gray-600">
                Update user information, role permissions, and access control
                settings
              </p>
            </div>
          </div>
        </div>

        {/* Status messages */}
        {submitStatus === 'success' && (
          <Alert className="mb-8 border-emerald-200 bg-emerald-50">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <AlertDescription className="text-emerald-800 font-medium">
              🎉 User updated successfully! Changes have been saved.
            </AlertDescription>
          </Alert>
        )}

        {submitStatus === 'error' && (
          <Alert className="mb-8 border-red-200 bg-red-50">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800 font-medium">
              ❌ Failed to update user. Please check the form and try again.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Personal Information */}
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <User className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      Personal Information
                    </CardTitle>
                    <CardDescription className="text-base">
                      Update basic user details and contact information
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="name"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter full name"
                    className={`h-12 text-base transition-all duration-200 ${
                      errors.name
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-200'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 font-medium flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="username"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Username <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) =>
                      handleInputChange('username', e.target.value)
                    }
                    placeholder="Enter username"
                    className={`h-12 text-base transition-all duration-200 ${
                      errors.username
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-200'
                    }`}
                  />
                  {errors.username && (
                    <p className="text-sm text-red-600 font-medium flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.username}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="email"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange('email', e.target.value)
                      }
                      placeholder="Enter email address"
                      className={`h-12 pl-12 text-base transition-all duration-200 ${
                        errors.email
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                          : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-200'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600 font-medium flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="phone"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange('phone', e.target.value)
                      }
                      placeholder="Enter phone number"
                      className={`h-12 pl-12 text-base transition-all duration-200 ${
                        errors.phone
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                          : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-200'
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-red-600 font-medium flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.phone}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card className="border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Shield className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Account Settings</CardTitle>
                    <CardDescription className="text-base">
                      Update role, status, and security configuration
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role: Role) => (
                      <SelectItem key={role._id} value={role._id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Store assignment */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center">
                    <Building2 className="h-4 w-4 mr-2" />
                    Assigned Stores
                  </Label>
                  <div className="min-h-[60px] p-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                    {assignedStores.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {assignedStores.map((storeId) => {
                          const store = stores.find((s) => s._id === storeId);
                          return (
                            <Badge
                              key={storeId}
                              variant="outline"
                              className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1 flex items-center space-x-2"
                            >
                              <Building2 className="h-3 w-3" />
                              <span>{store?.storeName || storeId}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setAssignedStores(
                                    assignedStores.filter((s) => s !== storeId)
                                  )
                                }
                                className="ml-1 text-emerald-500 hover:text-red-500 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-2">
                        <Building2 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <span className="text-sm">No stores assigned yet</span>
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsStoreDialogOpen(true)}
                    className="w-full h-11 border-2 border-dashed border-emerald-300 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-400 transition-all duration-200"
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    {assignedStores.length > 0
                      ? 'Edit Store Assignment'
                      : 'Assign Stores'}
                  </Button>
                </div>

                {/* Password Change Section */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="changePassword"
                      checked={changePassword}
                      // @ts-ignore
                      onCheckedChange={setChangePassword}
                      className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                    />
                    <Label
                      htmlFor="changePassword"
                      className="text-sm font-semibold text-gray-700 cursor-pointer"
                    >
                      Change Password
                    </Label>
                  </div>

                  {changePassword && (
                    <div className="space-y-4 pl-6 border-l-2 border-emerald-200">
                      <div className="space-y-3">
                        <Label
                          htmlFor="password"
                          className="text-sm font-semibold text-gray-700"
                        >
                          New Password <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) =>
                              handleInputChange('password', e.target.value)
                            }
                            placeholder="Enter new password"
                            className={`h-12 pl-12 pr-12 text-base transition-all duration-200 ${
                              errors.password
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-200'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-sm text-red-600 font-medium flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.password}
                          </p>
                        )}
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-600 font-medium mb-2">
                            Password Requirements:
                          </p>
                          <div className="grid grid-cols-1 gap-1 text-xs text-gray-500">
                            <span
                              className={`flex items-center ${
                                formData.password &&
                                formData.password.length >= 8
                                  ? 'text-emerald-600'
                                  : ''
                              }`}
                            >
                              <CheckCircle
                                className={`h-3 w-3 mr-1 ${
                                  formData.password &&
                                  formData.password.length >= 8
                                    ? 'text-emerald-500'
                                    : 'text-gray-300'
                                }`}
                              />
                              At least 8 characters
                            </span>
                            <span
                              className={`flex items-center ${
                                formData.password &&
                                /[A-Z]/.test(formData.password)
                                  ? 'text-emerald-600'
                                  : ''
                              }`}
                            >
                              <CheckCircle
                                className={`h-3 w-3 mr-1 ${
                                  formData.password &&
                                  /[A-Z]/.test(formData.password)
                                    ? 'text-emerald-500'
                                    : 'text-gray-300'
                                }`}
                              />
                              One uppercase letter
                            </span>
                            <span
                              className={`flex items-center ${
                                formData.password &&
                                /[0-9]/.test(formData.password)
                                  ? 'text-emerald-600'
                                  : ''
                              }`}
                            >
                              <CheckCircle
                                className={`h-3 w-3 mr-1 ${
                                  formData.password &&
                                  /[0-9]/.test(formData.password)
                                    ? 'text-emerald-500'
                                    : 'text-gray-300'
                                }`}
                              />
                              One number
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label
                          htmlFor="confirmPassword"
                          className="text-sm font-semibold text-gray-700"
                        >
                          Confirm New Password{' '}
                          <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={(e) =>
                              handleInputChange(
                                'confirmPassword',
                                e.target.value
                              )
                            }
                            placeholder="Confirm new password"
                            className={`h-12 pl-12 pr-12 text-base transition-all duration-200 ${
                              errors.confirmPassword
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-200'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                            tabIndex={-1}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-sm text-red-600 font-medium flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.confirmPassword}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form actions */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="h-12 px-8 text-base border-2 hover:bg-gray-50 transition-all duration-200 bg-transparent"
                >
                  <X className="h-5 w-5 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 px-8 text-base bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Updating User...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Update User
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Store Selection Dialog */}
        <StoreSelectionDialog
          isOpen={isStoreDialogOpen}
          onClose={() => setIsStoreDialogOpen(false)}
          // @ts-ignore
          stores={stores}
          onAssign={handleAssignStores}
          defaultSelected={assignedStores}
        />
      </div>
    </div>
  );
}

function StoreSelectionDialog({
  isOpen,
  onClose,
  stores,
  onAssign,
  defaultSelected = [],
}: StoreSelectionDialogProps) {
  const [selected, setSelected] = useState<string[]>(defaultSelected);

  useEffect(() => {
    if (isOpen) {
      setSelected(defaultSelected);
    }
  }, [isOpen, defaultSelected]);

  const toggleSelection = (storeId: string) => {
    setSelected((prev) =>
      prev.includes(storeId)
        ? prev.filter((id) => id !== storeId)
        : [...prev, storeId]
    );
  };

  const handleAssign = () => {
    if (selected.length === 0) {
      toast.error('Please select at least one store');
      return;
    }
    onAssign(selected);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl flex items-center">
            <Building2 className="h-6 w-6 mr-3 text-emerald-600" />
            Update Store Assignment
          </DialogTitle>
          <DialogDescription className="text-base">
            Select the stores this manager will have access to. They will be
            able to view and manage data for selected stores only.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {stores.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No stores available</p>
              <p className="text-gray-400 text-sm">
                Please create stores first before assigning them to users.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {stores.map((store) => (
                <div
                  key={store._id}
                  className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer hover:bg-gray-50 ${
                    selected.includes(store._id)
                      ? 'border-emerald-300 bg-emerald-50'
                      : 'border-gray-200'
                  }`}
                  onClick={() => toggleSelection(store._id)}
                >
                  <Checkbox
                    id={store._id}
                    checked={selected.includes(store._id)}
                    onCheckedChange={() => toggleSelection(store._id)}
                    className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={store._id}
                      className="cursor-pointer font-medium text-gray-900 flex items-center"
                    >
                      <Building2 className="h-4 w-4 mr-2 text-gray-500" />
                      {store.storeName}
                    </Label>
                  </div>
                  {selected.includes(store._id) && (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  )}
                </div>
              ))}
            </div>
          )}

          {selected.length > 0 && (
            <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-sm font-medium text-emerald-800 mb-2">
                Selected Stores ({selected.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {selected.map((storeId) => {
                  const store = stores.find((s) => s._id === storeId);
                  return (
                    <Badge
                      key={storeId}
                      className="bg-emerald-100 text-emerald-800 border-emerald-300"
                    >
                      {store?.storeName}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-11 px-6 bg-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={selected.length === 0}
            className="h-11 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          >
            <Building2 className="h-4 w-4 mr-2" />
            Update {selected.length} Store{selected.length !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
