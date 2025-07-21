'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export function DashboardCharts() {
  const { data: revenueData, isLoading } = useQuery({
    queryKey: ['revenue-data'],
    queryFn: getRevenueData,
  });

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full dark:bg-gray-800" />;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={revenueData}>
        <CartesianGrid
          strokeDasharray="3 3"
          className="stroke-muted dark:stroke-gray-700"
        />
        <XAxis
          dataKey="month"
          className="text-xs fill-muted-foreground dark:fill-gray-400"
          tick={{ fill: 'currentColor' }}
        />
        <YAxis
          className="text-xs fill-muted-foreground dark:fill-gray-400"
          tick={{ fill: 'currentColor' }}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
            color: 'hsl(var(--foreground))',
          }}
          itemStyle={{
            color: 'hsl(var(--foreground))',
          }}
          labelStyle={{
            color: 'hsl(var(--foreground))',
          }}
          formatter={(value: number) => [
            `$${value.toLocaleString()}`,
            'Revenue',
          ]}
        />
        <Legend
          wrapperStyle={{
            color: 'hsl(var(--foreground))',
          }}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="oklch(0.53 0.14 150)" /* Light mode color */
          className="dark:stroke-[oklch(0.7_0.15_150)]" /* Dark mode color */
          strokeWidth={2}
          dot={{
            fill: 'oklch(var(--primary))',
            stroke: 'hsl(var(--background))',
            strokeWidth: 1,
          }}
          activeDot={{
            fill: 'oklch(var(--primary))',
            stroke: 'hsl(var(--background))',
            strokeWidth: 2,
            r: 6,
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
