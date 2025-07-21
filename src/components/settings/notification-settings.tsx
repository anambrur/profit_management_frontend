'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  category: 'orders' | 'inventory' | 'customers' | 'system';
}

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'new-orders',
      title: 'New Orders',
      description: 'Get notified when new orders are placed',
      enabled: true,
      category: 'orders',
    },
    {
      id: 'order-status',
      title: 'Order Status Updates',
      description: 'Notifications for order status changes',
      enabled: true,
      category: 'orders',
    },
    {
      id: 'low-stock',
      title: 'Low Stock Alerts',
      description: 'Get alerted when products are running low',
      enabled: true,
      category: 'inventory',
    },
    {
      id: 'out-of-stock',
      title: 'Out of Stock',
      description: 'Immediate alerts for out of stock items',
      enabled: true,
      category: 'inventory',
    },
    {
      id: 'new-customers',
      title: 'New Customer Registrations',
      description: 'Notifications for new customer sign-ups',
      enabled: false,
      category: 'customers',
    },
    {
      id: 'customer-feedback',
      title: 'Customer Reviews & Feedback',
      description: 'Get notified of new reviews and feedback',
      enabled: true,
      category: 'customers',
    },
    {
      id: 'system-updates',
      title: 'System Updates',
      description: 'Important system and security updates',
      enabled: true,
      category: 'system',
    },
    {
      id: 'maintenance',
      title: 'Maintenance Notifications',
      description: 'Scheduled maintenance and downtime alerts',
      enabled: true,
      category: 'system',
    },
  ]);

  const handleToggle = (id: string) => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  const handleSave = async () => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Notification settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update notification settings. Please try again.');
    }
  };

  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, NotificationSetting[]>);

  const categoryTitles = {
    orders: 'Order Notifications',
    inventory: 'Inventory Alerts',
    customers: 'Customer Notifications',
    system: 'System Notifications',
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedSettings).map(([category, categorySettings]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>
              {categoryTitles[category as keyof typeof categoryTitles]}
            </CardTitle>
            <CardDescription>
              Manage your {category} notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categorySettings.map((setting) => (
              <div
                key={setting.id}
                className="flex items-center justify-between space-x-2"
              >
                <div className="space-y-0.5">
                  <Label htmlFor={setting.id} className="text-base font-medium">
                    {setting.title}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {setting.description}
                  </p>
                </div>
                <Switch
                  id={setting.id}
                  checked={setting.enabled}
                  onCheckedChange={() => handleToggle(setting.id)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Notification Settings</Button>
      </div>
    </div>
  );
}
