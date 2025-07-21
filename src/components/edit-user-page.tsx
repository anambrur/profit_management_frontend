'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Crown,
  Mail,
  Phone,
  Shield,
  Upload,
  User,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface UserData {
  _id: string;
  name: string;
  email: string;
  username: string;
  phone: string;
  address: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive';
  profileImage: string;
  createdAt: string;
  lastLogin?: string;
  storeId?: string; // Added storeId field
  department?: string; // Added department field
  position?: string; // Added position field
}

interface Store {
  _id: string;
  storeId: string;
  storeName: string;
}

interface FormErrors {
  [key: string]: string;
}

interface EditUserPageProps {
  user?: UserData;
  onBack: () => void;
  onUserUpdated: (user: UserData) => void;
}

export default function UserPageEdit({
  user,
  onBack,
  onUserUpdated,
}: EditUserPageProps) {
  // Form state
  const [formData, setFormData] = useState<UserData>(
    user || {
      _id: '',
      name: '',
      email: '',
      username: '',
      phone: '',
      address: '',
      role: 'user',
      status: 'active',
      profileImage: '',
      createdAt: '',
      department: '',
      position: '',
      storeId: '',
    }
  );

  const [errors, setErrors] = useState<FormErrors>({});
  const [imagePreview, setImagePreview] = useState<string>(
    user?.profileImage || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');

  // Fetch stores data
  const { data: stores = [] } = useStoresData();

  // Role options
  const roles = [
    { value: 'admin', label: 'Admin', icon: Crown },
    { value: 'manager', label: 'Manager', icon: Shield },
    { value: 'user', label: 'User', icon: User },
  ];

  // Department options
  const departments = [
    'Sales',
    'Marketing',
    'IT',
    'Finance',
    'Operations',
    'Human Resources',
    'Customer Service',
  ];

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (formData.role === 'manager' && !formData.storeId) {
      newErrors.storeId = 'Store selection is required for managers';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field: keyof UserData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        profileImage: 'Image must be less than 5MB',
      }));
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({
        ...prev,
        profileImage: 'Please upload an image file',
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      setFormData((prev) => ({ ...prev, profileImage: result }));
    };
    reader.readAsDataURL(file);
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          form.append(key, value.toString());
        }
      });

      if (formData.profileImage?.startsWith('data:image')) {
        const blob = await fetch(formData.profileImage).then((res) =>
          res.blob()
        );
        form.append('profileImageFile', blob, 'profile.jpg');
      }

      const res = await axiosInstance.put(
        `/api/users/update-user/${user?._id}`,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      onUserUpdated(res.data.updatedUser);
      setSubmitStatus('success');
      setTimeout(onBack, 1500);
    } catch (error) {
      console.error('Error updating user:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions
  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  const getStatusColor = (status: string) =>
    status === 'active'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="outline" onClick={onBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
          <div className="flex items-center mb-4">
            <User className="h-8 w-8 text-primary mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
              <p className="text-gray-600">Update user information</p>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {submitStatus === 'success' && (
          <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-md border border-green-200 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            User updated successfully!
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-md border border-red-200 flex items-center">
            <X className="h-5 w-5 mr-2" />
            Failed to update user. Please try again.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* User Profile Card */}
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={imagePreview} alt="Profile" />
                      <AvatarFallback className="bg-gray-100">
                        {getInitials(formData.name)}
                      </AvatarFallback>
                    </Avatar>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="profile-image-upload"
                    />
                    <label htmlFor="profile-image-upload">
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
                    <h2 className="text-2xl font-semibold">{formData.name}</h2>
                    <p className="text-gray-600">@{formData.username}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline" className="capitalize">
                        {formData.role}
                      </Badge>
                      <Badge className={getStatusColor(formData.status)}>
                        {formData.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div className="flex items-center mb-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined {new Date(formData.createdAt).toLocaleDateString()}
                  </div>
                  {formData.lastLogin && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Last login{' '}
                      {new Date(formData.lastLogin).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Full name"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange('email', e.target.value)
                      }
                      placeholder="Email"
                      className={`pl-10 ${
                        errors.email ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Phone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange('phone', e.target.value)
                      }
                      placeholder="Phone number"
                      className={`pl-10 ${
                        errors.phone ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange('address', e.target.value)
                    }
                    placeholder="Address"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleInputChange('role', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex items-center">
                            <role.icon className="h-4 w-4 mr-2" />
                            {role.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.role === 'manager' && (
                  <div className="space-y-2">
                    <Label>Assigned Store *</Label>
                    <Select
                      value={formData.storeId}
                      onValueChange={(value) =>
                        handleInputChange('storeId', value)
                      }
                    >
                      <SelectTrigger
                        className={errors.storeId ? 'border-red-500' : ''}
                      >
                        <SelectValue placeholder="Select store" />
                      </SelectTrigger>
                      <SelectContent>
                        {stores.map((store) => (
                          <SelectItem key={store._id} value={store._id}>
                            {store.storeName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.storeId && (
                      <p className="text-sm text-red-600">{errors.storeId}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select
                    value={formData.department || ''}
                    onValueChange={(value) =>
                      handleInputChange('department', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Position</Label>
                  <Input
                    value={formData.position || ''}
                    onChange={(e) =>
                      handleInputChange('position', e.target.value)
                    }
                    placeholder="Job position"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleInputChange('status', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
