'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';

import axiosInstance from '@/lib/axiosInstance';
import { useAuthStore } from '@/store/useAuthStore';
import { User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import NotificationPanel from '../notification-panel';

export function Header() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();

  const logOutUser = async () => {
    try {
      await axiosInstance.post(
        '/api/users/logout',
        {},
        { withCredentials: true }
      );
      useAuthStore.getState().logout();
      router.push('/');
      toast.success('Logout successful');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <header className="sticky top-0 z-10 flex h-17 items-center gap-4 border-b border-gray-200 bg-white px-6 dark:border-gray-800 dark:bg-gray-900">
      {/* Sidebar for mobile */}
      <SidebarTrigger className="md:hidden" />

      {/* Notification + User Menu */}
      <div className="ml-auto flex items-center gap-2">
        <NotificationPanel />

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 hover:bg-transparent dark:hover:bg-gray-800"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary dark:bg-primary">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="hidden text-left md:block">
                <div className="text-sm font-medium dark:text-gray-100">
                  {user?.name || 'John Doe'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email || 'john@example.com'}
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-56 dark:border-gray-700 dark:bg-gray-800"
          >
            <DropdownMenuLabel className="dark:text-gray-200">
              My Account
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="dark:bg-gray-700" />

            <Link href="/profile" passHref>
              <DropdownMenuItem className="flex items-center gap-2 dark:text-gray-200 dark:hover:bg-gray-700">
                <User className="h-4 w-4 text-muted-foreground dark:text-gray-300" />
                Profile
              </DropdownMenuItem>
            </Link>

            <DropdownMenuSeparator className="dark:bg-gray-700" />
            <DropdownMenuItem
              onClick={logOutUser}
              className="text-red-600 dark:text-red-400 dark:hover:bg-gray-700"
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
