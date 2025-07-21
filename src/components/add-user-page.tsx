'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  Building2,
  Camera,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  Save,
  Shield,
  Upload,
  User,
  UserPlus,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

// Components
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRole } from '@/hooks/useRole';
import { useStoresData } from '@/hooks/useStoreData';
import axiosInstance from '@/lib/axiosInstance';

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

interface NewUser {
  name: string;
  email: string;
  username: string;
  phone: string;
  role: string;
  status: string;
  password: string;
  confirmPassword: string;
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

export default function UserPageAdd() {
  // Form state
  const [formData, setFormData] = useState<NewUser>({
    name: '',
    email: '',
    username: '',
    phone: '',
    role: '',
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
  const [userData, setUserData] = useState<NewUser>({
    name: '',
    email: '',
    username: '',
    phone: '',
    role: '',
    status: 'active',
    password: '',
    confirmPassword: '',
    profileImage: '',
    assignedStores: [],
  });
  // Data fetching
  const { data: stores = [], isLoading: isStoresLoading } = useStoresData();
  const { data: roles = [], isLoading: isRolesLoading } = useRole();
  const queryClient = useQueryClient();

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

    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Input change handler
  const handleInputChange = (field: keyof NewUser, value: string) => {
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

  // API mutation
  const mutation = useMutation({
    mutationFn: async (userData: NewUser) => {
      console.log('userData', userData);
      console.log('store', userData.assignedStores);
      const response = await axiosInstance.post(
        '/api/users/register',
        {
          ...userData,
          roles: userData.role,
          allowedStores: userData.assignedStores, // ✅ Clean and direct
        },
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('🎉 User created successfully!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setSubmitStatus('success');
      resetForm();
    },
    onError: (error: any) => {
      console.error('User creation error:', error);
      toast.error(
        `❌ ${error.response?.data?.message || 'Failed to create user'}`
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

    // For managers, ensure at least one store is assigned
    if (formData.role === 'manager' && assignedStores.length === 0) {
      setIsStoreDialogOpen(true);
      setIsSubmitting(false);
      return;
    }

    // Prepare the data for API submission
    const userData: NewUser = {
      name: formData.name,
      email: formData.email,
      username: formData.username,
      phone: formData.phone,
      role: formData.role,
      status: formData.status,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      profileImage: formData.profileImage,
      assignedStores: assignedStores,
    };

    mutation.mutate(userData);
  };

  const handleAssignStores = (selectedStores: string[]) => {
    if (selectedStores.length === 0) {
      toast.error('Please select at least one store for the manager');
      return;
    }
    setAssignedStores(selectedStores);
    setIsStoreDialogOpen(false);

    // Submit the form after store assignment
    const userData: NewUser = {
      ...formData,
      assignedStores: selectedStores,
    };
    setUserData(userData);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      username: '',
      phone: '',
      role: '',
      status: 'active',
      password: '',
      confirmPassword: '',
      profileImage: '',
    });
    setErrors({});
    setImageFile(null);
    setImagePreview('');
    setSubmitStatus('idle');
    setAssignedStores([]);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl mr-4">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Add New User
              </h1>
              <p className="text-lg text-gray-600">
                Create a new user account with role-based permissions and access
                control
              </p>
            </div>
          </div>
        </div>

        {/* Status messages */}
        {submitStatus === 'success' && (
          <Alert className="mb-8 border-emerald-200 bg-emerald-50">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <AlertDescription className="text-emerald-800 font-medium">
              🎉 User created successfully! They can now access the system.
            </AlertDescription>
          </Alert>
        )}

        {submitStatus === 'error' && (
          <Alert className="mb-8 border-red-200 bg-red-50">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800 font-medium">
              ❌ Failed to create user. Please check the form and try again.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Image Section */}
          {/* <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Camera className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Profile Picture</CardTitle>
                  <CardDescription className="text-base">
                    Upload a professional profile picture (Max 5MB)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-8">
                <div className="relative group">
                  <Avatar className="h-32 w-32 ring-4 ring-white">
                    <AvatarImage
                      src={
                        imagePreview || '/placeholder.svg?height=128&width=128'
                      }
                      alt="Profile preview"
                      className="object-cover"
                    />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-400 to-pink-400 text-white">
                      {formData.name ? (
                        getInitials(formData.name)
                      ) : (
                        <User className="h-12 w-12" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="profile-image-upload"
                  />
                  <label
                    htmlFor="profile-image-upload"
                    className="absolute -bottom-2 -right-2 cursor-pointer"
                  >
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-full p-3 transition-all duration-200 hover:scale-110">
                      <Upload className="h-4 w-4" />
                    </div>
                  </label>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">
                    Upload Photo
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Choose a clear, professional photo. Supported formats: JPG,
                    PNG, GIF
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1 text-emerald-500" />
                      Max 5MB
                    </span>
                    <span className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-1 text-emerald-500" />
                      Square format recommended
                    </span>
                  </div>
                  {errors.profileImage && (
                    <p className="text-red-600 mt-2 font-medium">
                      {errors.profileImage}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card> */}

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
                      Basic user details and contact information
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
              <CardHeader className="pb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Shield className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Account Settings</CardTitle>
                    <CardDescription className="text-base">
                      Role, status, and security configuration
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="role"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Role <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleInputChange('role', value)}
                  >
                    <SelectTrigger
                      className={`h-12 text-base transition-all duration-200 ${
                        errors.role
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                          : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-200'
                      }`}
                    >
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {isRolesLoading ? (
                        <div className="p-4 text-center text-gray-500">
                          Loading roles...
                        </div>
                      ) : (
                        roles.map((role: Role) => (
                          <SelectItem key={role._id} value={role.name}>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant="outline"
                                className={`${getRoleBadgeColor(
                                  role.name
                                )} font-medium`}
                              >
                                {role.name.charAt(0).toUpperCase() +
                                  role.name.slice(1)}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-red-600 font-medium flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.role}
                    </p>
                  )}
                </div>

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

                <div className="space-y-3">
                  <Label
                    htmlFor="status"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Account Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleInputChange('status', value)
                    }
                  >
                    <SelectTrigger className="h-12 text-base border-gray-200 focus:border-emerald-500 focus:ring-emerald-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">
                        <div className="flex items-center space-x-3">
                          <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                          <span className="font-medium">Active</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="inactive">
                        <div className="flex items-center space-x-3">
                          <div className="h-3 w-3 rounded-full bg-red-500"></div>
                          <span className="font-medium">Inactive</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="password"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Password <span className="text-red-500">*</span>
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
                      placeholder="Enter password"
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
                          formData.password.length >= 8
                            ? 'text-emerald-600'
                            : ''
                        }`}
                      >
                        <CheckCircle
                          className={`h-3 w-3 mr-1 ${
                            formData.password.length >= 8
                              ? 'text-emerald-500'
                              : 'text-gray-300'
                          }`}
                        />
                        At least 8 characters
                      </span>
                      <span
                        className={`flex items-center ${
                          /[A-Z]/.test(formData.password)
                            ? 'text-emerald-600'
                            : ''
                        }`}
                      >
                        <CheckCircle
                          className={`h-3 w-3 mr-1 ${
                            /[A-Z]/.test(formData.password)
                              ? 'text-emerald-500'
                              : 'text-gray-300'
                          }`}
                        />
                        One uppercase letter
                      </span>
                      <span
                        className={`flex items-center ${
                          /[0-9]/.test(formData.password)
                            ? 'text-emerald-600'
                            : ''
                        }`}
                      >
                        <CheckCircle
                          className={`h-3 w-3 mr-1 ${
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
                    Confirm Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange('confirmPassword', e.target.value)
                      }
                      placeholder="Confirm password"
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
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className="h-12 px-8 text-base border-2 hover:bg-gray-50 transition-all duration-200 bg-transparent"
                >
                  <X className="h-5 w-5 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 px-8 text-base bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating User...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Create User
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
            Assign Stores
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
            Assign {selected.length} Store{selected.length !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
