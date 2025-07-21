import { AppSidebar } from '@/components/layout/app-sidebar';
import { Header } from '@/components/layout/header';
import { SidebarProvider } from '@/components/ui/sidebar';
import type React from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={true} suppressHydrationWarning={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col" suppressHydrationWarning={true}>
          <Header />
          <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-800">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
