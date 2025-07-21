'use client';

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
import type { RootState } from '@/store';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import * as z from 'zod';

const generalSettingsSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  timezone: z.string(),
  currency: z.string(),
  description: z.string().optional(),
});

type GeneralSettingsForm = z.infer<typeof generalSettingsSchema>;

export function GeneralSettings() {
  const user = useSelector((state: RootState) => state.auth.user);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    control,
  } = useForm<GeneralSettingsForm>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      companyName: 'Acme Corp',
      email: user?.email || '',
      phone: '+1 (555) 123-4567',
      address: '123 Business St, City, State 12345',
      timezone: 'America/New_York',
      currency: 'USD',
      description:
        'A modern e-commerce business focused on quality products and excellent customer service.',
    },
  });

  const onSubmit = async (data: GeneralSettingsForm) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update settings. Please try again.');
    }
  };

  return (
    <Card className="dark:bg-gray-900 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="dark:text-white">General Settings</CardTitle>
        <CardDescription className="dark:text-gray-400">
          Update your company information and preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="companyName" className="dark:text-gray-300">
                Company Name
              </Label>
              <Input
                id="companyName"
                {...register('companyName')}
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="dark:text-gray-300">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="dark:text-gray-300">
                Phone Number
              </Label>
              <Input
                id="phone"
                {...register('phone')}
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone" className="dark:text-gray-300">
                Timezone
              </Label>
              <Select
                value={watch('timezone')}
                onValueChange={(value) => setValue('timezone', value)}
              >
                <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                  <SelectItem
                    value="America/New_York"
                    className="dark:hover:bg-gray-800 dark:text-gray-200"
                  >
                    Eastern Time
                  </SelectItem>
                  <SelectItem
                    value="America/Chicago"
                    className="dark:hover:bg-gray-800 dark:text-gray-200"
                  >
                    Central Time
                  </SelectItem>
                  <SelectItem
                    value="America/Denver"
                    className="dark:hover:bg-gray-800 dark:text-gray-200"
                  >
                    Mountain Time
                  </SelectItem>
                  <SelectItem
                    value="America/Los_Angeles"
                    className="dark:hover:bg-gray-800 dark:text-gray-200"
                  >
                    Pacific Time
                  </SelectItem>
                  <SelectItem
                    value="Europe/London"
                    className="dark:hover:bg-gray-800 dark:text-gray-200"
                  >
                    London
                  </SelectItem>
                  <SelectItem
                    value="Europe/Paris"
                    className="dark:hover:bg-gray-800 dark:text-gray-200"
                  >
                    Paris
                  </SelectItem>
                  <SelectItem
                    value="Asia/Tokyo"
                    className="dark:hover:bg-gray-800 dark:text-gray-200"
                  >
                    Tokyo
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency" className="dark:text-gray-300">
                Default Currency
              </Label>
              <Select
                value={watch('currency')}
                onValueChange={(value) => setValue('currency', value)}
              >
                <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                  <SelectItem
                    value="USD"
                    className="dark:hover:bg-gray-800 dark:text-gray-200"
                  >
                    USD - US Dollar
                  </SelectItem>
                  <SelectItem
                    value="EUR"
                    className="dark:hover:bg-gray-800 dark:text-gray-200"
                  >
                    EUR - Euro
                  </SelectItem>
                  <SelectItem
                    value="GBP"
                    className="dark:hover:bg-gray-800 dark:text-gray-200"
                  >
                    GBP - British Pound
                  </SelectItem>
                  <SelectItem
                    value="JPY"
                    className="dark:hover:bg-gray-800 dark:text-gray-200"
                  >
                    JPY - Japanese Yen
                  </SelectItem>
                  <SelectItem
                    value="CAD"
                    className="dark:hover:bg-gray-800 dark:text-gray-200"
                  >
                    CAD - Canadian Dollar
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="dark:text-gray-300">
              Business Address
            </Label>
            <Textarea
              id="address"
              {...register('address')}
              rows={3}
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="dark:text-gray-300">
              Company Description
            </Label>
            <Textarea
              id="description"
              {...register('description')}
              rows={4}
              placeholder="Tell us about your business..."
              className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
