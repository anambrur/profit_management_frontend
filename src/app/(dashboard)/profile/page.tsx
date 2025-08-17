'use client';

import type React from 'react';

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axiosInstance from '@/lib/axiosInstance';
import { useAuthStore, UserProfile } from '@/store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  Shield,
  Upload,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Component() {
  const [isEditing, setIsEditing] = useState(false);
  const { user, setUser: setProfile } = useAuthStore();

  // Password change state
  const [changePassword, setChangePassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const { data: profile = {}, isLoading } = useQuery({
    queryKey: ['user', user?.id || null],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/api/users/get-user/${user?.id}`,
        {
          withCredentials: true,
        }
      );
      return response.data.user;
    },
  });

  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (profile && profile._id) {
      setEditedProfile(profile);
    }
  }, [profile]);

  const handleEdit = () => setIsEditing(true);

  const handleSave = async () => {
    try {
      if (changePassword) {
        // Validate password fields
        const errors = {
          currentPassword: !passwordData.currentPassword
            ? 'Current password is required'
            : '',
          newPassword: !passwordData.newPassword
            ? 'New password is required'
            : passwordData.newPassword.length < 8
            ? 'Password must be at least 8 characters'
            : !/[A-Z]/.test(passwordData.newPassword)
            ? 'Password must contain at least one uppercase letter'
            : !/[0-9]/.test(passwordData.newPassword)
            ? 'Password must contain at least one number'
            : '',
          confirmPassword:
            passwordData.newPassword !== passwordData.confirmPassword
              ? 'Passwords do not match'
              : '',
        };

        setPasswordErrors(errors);

        if (Object.values(errors).some((error) => error)) {
          return;
        }

        // Call API to change password
        await axiosInstance.post(
          '/api/users/change-password',
          {
            newPassword: passwordData.newPassword,
          },
          {
            withCredentials: true,
          }
        );
      }

      setIsEditing(false);
      setChangePassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error saving changes:', error);
      // Handle error appropriately
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    if (!editedProfile) return;
    setEditedProfile((prev) => ({ ...prev!, [field]: value }));
  };

  const handlePasswordChange = (
    field: keyof typeof passwordData,
    value: string
  ) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (passwordErrors[field as keyof typeof passwordErrors]) {
      setPasswordErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        if (isEditing && editedProfile) {
          setEditedProfile((prev) => ({ ...prev!, profileImage: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const getRoleColor = (role: string) => {
    return role === 'admin'
      ? 'bg-purple-100 text-purple-800'
      : 'bg-blue-100 text-blue-800';
  };

  if (!editedProfile || isLoading) {
    return <div className="p-4 text-center">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Profile Settings
          </h1>
          <p className="text-gray-600">
            Manage your account information and preferences
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={
                        isEditing
                          ? imagePreview || editedProfile.profileImage
                          : profile.profileImage
                      }
                      alt="Profile"
                    />
                    <AvatarFallback className="text-lg">
                      {(isEditing ? editedProfile.name : profile.name)
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="absolute -bottom-2 -right-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 rounded-full p-0 cursor-pointer"
                          type="button"
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                      </label>
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {isEditing ? editedProfile.name : profile.name}
                  </h2>
                  <p className="text-gray-600">
                    @
                    {(isEditing ? editedProfile.name : profile.name)
                      .toLowerCase()
                      .replace(/\s+/g, '')}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge
                      className={getRoleColor(
                        isEditing
                          ? editedProfile.roles?.[0]?.name
                          : profile.role
                      )}
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      {(isEditing
                        ? editedProfile.roles?.[0]?.name || 'user'
                        : profile.roles?.[0]?.name || 'user'
                      ).toUpperCase()}
                    </Badge>
                    <Badge
                      className={getStatusColor(
                        isEditing ? editedProfile.status : profile.status
                      )}
                    >
                      {(isEditing
                        ? editedProfile.status
                        : profile.status
                      ).toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" /> Personal Information
              </CardTitle>
              <CardDescription>
                Your basic account details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {['name', 'username', 'email', 'phone'].map((field) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field}>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </Label>
                  {isEditing ? (
                    <Input
                      id={field}
                      // @ts-ignore
                      value={editedProfile[field as keyof UserProfile] ?? ''}
                      onChange={(e) =>
                        handleInputChange(
                          field as keyof UserProfile,
                          e.target.value
                        )
                      }
                    />
                  ) : (
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                      <>
                        {field === 'email' ? (
                          <span className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-gray-500" />
                            {editedProfile.email}
                          </span>
                        ) : field === 'phone' ? (
                          <span className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-gray-500" />
                            {editedProfile.phone}
                          </span>
                        ) : (
                          editedProfile[field as keyof UserProfile]
                        )}
                      </>
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Password Change Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2" /> Security
              </CardTitle>
              <CardDescription>
                Manage your password and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Label
                  htmlFor="changePassword"
                  className="text-sm font-semibold text-gray-700 cursor-pointer"
                >
                  Change Password
                </Label>
              </div>

              {!changePassword && (
                <div className="space-y-4 pl-6 border-l-2 border-emerald-200">
                  <div className="space-y-3">
                    <Label htmlFor="newPassword">
                      New Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          handlePasswordChange('newPassword', e.target.value)
                        }
                        placeholder="Enter new password"
                        className={`pl-9 ${
                          passwordErrors.newPassword ? 'border-red-500' : ''
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {passwordErrors.newPassword}
                      </p>
                    )}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 font-medium mb-2">
                        Password Requirements:
                      </p>
                      <div className="grid grid-cols-1 gap-1 text-xs text-gray-500">
                        <span
                          className={`flex items-center ${
                            passwordData.newPassword.length >= 8
                              ? 'text-emerald-600'
                              : ''
                          }`}
                        >
                          <CheckCircle
                            className={`h-3 w-3 mr-1 ${
                              passwordData.newPassword.length >= 8
                                ? 'text-emerald-500'
                                : 'text-gray-300'
                            }`}
                          />
                          At least 8 characters
                        </span>
                        <span
                          className={`flex items-center ${
                            /[A-Z]/.test(passwordData.newPassword)
                              ? 'text-emerald-600'
                              : ''
                          }`}
                        >
                          <CheckCircle
                            className={`h-3 w-3 mr-1 ${
                              /[A-Z]/.test(passwordData.newPassword)
                                ? 'text-emerald-500'
                                : 'text-gray-300'
                            }`}
                          />
                          One uppercase letter
                        </span>
                        <span
                          className={`flex items-center ${
                            /[0-9]/.test(passwordData.newPassword)
                              ? 'text-emerald-600'
                              : ''
                          }`}
                        >
                          <CheckCircle
                            className={`h-3 w-3 mr-1 ${
                              /[0-9]/.test(passwordData.newPassword)
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
                    <Label htmlFor="confirmPassword">
                      Confirm New Password{' '}
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          handlePasswordChange(
                            'confirmPassword',
                            e.target.value
                          )
                        }
                        placeholder="Confirm new password"
                        className={`pl-9 ${
                          passwordErrors.confirmPassword ? 'border-red-500' : ''
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {passwordErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                  <Button onClick={handleEdit}>Update Password</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
