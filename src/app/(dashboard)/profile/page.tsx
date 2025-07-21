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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  Edit,
  Mail,
  MapPin,
  Phone,
  Save,
  Shield,
  Upload,
  User,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import axiosInstance from '@/lib/axiosInstance';

interface UserProfile {
  name: string;
  email: string;
  username: string;
  phone: string;
  address: string;
  role: string;
  status: string;
  profileImage: string;
}

export default function Component() {
  const [isEditing, setIsEditing] = useState(false);
  const { user, setUser: setProfile } = useAuthStore();

  const { data: profile = {}, isLoading } = useQuery({
    queryKey: ['user', user?.id || null],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/api/users/get-user/${user?.id}`
      );
      return response.data.user;
    },
  });

  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (profile && profile.username) {
      setEditedProfile({
        name: profile.name || '',
        email: profile.email || '',
        username: profile.username || '',
        phone: profile.phone || '',
        address: profile.address || '',
        role: profile.role || '',
        status: profile.status || '',
        profileImage: profile.profileImage || '',
      });
    }
  }, [profile]);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const handleEdit = () => setIsEditing(true);

  const handleSave = () => {
    if (editedProfile) {
      setProfile({
        id: profile?.id || '',
        name: editedProfile.name,
        email: editedProfile.email,
        role: editedProfile.role,
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile({
      name: profile.name || '',
      email: profile.email || '',
      username: profile.username || '',
      phone: profile.phone || '',
      address: profile.address || '',
      role: profile.role || '',
      status: profile.status || '',
      profileImage: profile.profileImage || '',
    });
    setImagePreview('');
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    if (!editedProfile) return;
    setEditedProfile((prev) => ({ ...prev!, [field]: value }));
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
                    @{isEditing ? editedProfile.username : profile.username}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge
                      className={getRoleColor(
                        isEditing ? editedProfile.role : profile.role
                      )}
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      {(isEditing
                        ? editedProfile.role
                        : profile.role
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
              <div className="flex space-x-2">
                {!isEditing ? (
                  <Button onClick={handleEdit} variant="outline">
                    <Edit className="h-4 w-4 mr-2" /> Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleSave}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="h-4 w-4 mr-2" /> Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline">
                      <X className="h-4 w-4 mr-2" /> Cancel
                    </Button>
                  </>
                )}
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
                      value={editedProfile[field as keyof UserProfile]}
                      onChange={(e) =>
                        handleInputChange(
                          field as keyof UserProfile,
                          e.target.value
                        )
                      }
                    />
                  ) : (
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
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
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" /> Additional Information
              </CardTitle>
              <CardDescription>Location and account settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                {isEditing ? (
                  <Select
                    value={editedProfile.role}
                    onValueChange={(value) => handleInputChange('role', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                    <Shield className="h-4 w-4 mr-2 text-gray-500" />
                    {editedProfile.role.charAt(0).toUpperCase() +
                      editedProfile.role.slice(1)}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Account Status</Label>
                {isEditing ? (
                  <select
                    id="status"
                    value={editedProfile.status}
                    onChange={(e) =>
                      handleInputChange('status', e.target.value)
                    }
                    className={cn(
                      'w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500',
                      isEditing && 'bg-white'
                    )}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                ) : (
                  <div className="flex items-center text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                    <div
                      className={`h-2 w-2 rounded-full mr-2 ${
                        editedProfile.status === 'active'
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      }`}
                    ></div>
                    {editedProfile.status.charAt(0).toUpperCase() +
                      editedProfile.status.slice(1)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
