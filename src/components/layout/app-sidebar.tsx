'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { Home, Package, Shield, ShoppingCart, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BiStoreAlt } from 'react-icons/bi';
import { FaCanadianMapleLeaf } from 'react-icons/fa6';
import { MdManageHistory } from 'react-icons/md';

// Navigation items with required permissions
const navigationItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: Home,
    requiredPermissions: [], // No permissions required for dashboard
  },
  {
    title: 'Orders',
    url: '/orders',
    icon: ShoppingCart,
    requiredPermissions: ['order:view'],
  },
  {
    title: 'Inventory',
    url: '/inventory',
    icon: Package,
    requiredPermissions: ['product:view'],
  },
  {
    title: 'Purchases History',
    url: '/product-history',
    icon: MdManageHistory,
    requiredPermissions: ['product-history:view'],
  },
  {
    title: 'Stores',
    url: '/store',
    icon: BiStoreAlt,
    requiredPermissions: ['store:view'],
  },
];

const userNavigationItems = [
  {
    title: 'Users',
    url: '/users',
    icon: Users,
    requiredPermissions: ['user:view'],
  },
  {
    title: 'Role Management',
    url: '/users/roles',
    icon: Shield,
    requiredPermissions: ['role:create'],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, hasPermission, hasAnyPermission } = useAuthStore();

  // Check if user has admin privileges
  const isAdmin = user?.roles?.some((role) => role.name === 'admin');

  return (
    <Sidebar className="border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <SidebarHeader className="border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary dark:bg-primary">
            <FaCanadianMapleLeaf className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold dark:text-gray-100">
              {user?.name || 'Admin Dashboard'}
            </span>
            <span className="truncate text-xs text-muted-foreground dark:text-gray-400">
              {isAdmin ? 'Administrator' : 'User Dashboard'}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Main Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                // Skip if user doesn't have required permissions
                if (
                  item.requiredPermissions.length > 0 &&
                  !hasAnyPermission(item.requiredPermissions)
                ) {
                  return null;
                }
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      className={cn(
                        'w-full justify-start gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        pathname === item.url
                          ? 'bg-gray-950 text-primary-foreground dark:bg-gray-950 dark:text-white'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                      )}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Only show User Management for admin users */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              USER MANAGEMENT
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {userNavigationItems.map((item) => {
                  if (!hasAnyPermission(item.requiredPermissions)) {
                    return null;
                  }
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.url}
                        className={cn(
                          'w-full justify-start gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          pathname === item.url
                            ? 'bg-gray-950 text-primary-foreground dark:bg-gray-950 dark:text-white'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                        )}
                      >
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span>All systems operational</span>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
