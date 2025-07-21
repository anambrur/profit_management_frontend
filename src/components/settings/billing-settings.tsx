'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar, CreditCard, Download } from 'lucide-react';

export function BillingSettings() {
  const currentPlan = {
    name: 'Professional',
    price: 49,
    billing: 'monthly',
    features: [
      'Unlimited products',
      'Advanced analytics',
      'Priority support',
      'API access',
      'Custom integrations',
    ],
  };

  const invoices = [
    {
      id: 'INV-001',
      date: '2024-01-01',
      amount: 49,
      status: 'paid',
    },
    {
      id: 'INV-002',
      date: '2024-02-01',
      amount: 49,
      status: 'paid',
    },
    {
      id: 'INV-003',
      date: '2024-03-01',
      amount: 49,
      status: 'pending',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            Manage your subscription and billing information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{currentPlan.name} Plan</h3>
              <p className="text-sm text-muted-foreground">
                ${currentPlan.price}/{currentPlan.billing}
              </p>
            </div>
            <Badge>Active</Badge>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Plan Features:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {currentPlan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <span className="mr-2">•</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">Change Plan</Button>
            <Button variant="outline">Cancel Subscription</Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
          <CardDescription>Manage your payment information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="h-8 w-12 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">VISA</span>
              </div>
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/25</p>
              </div>
            </div>
            <Badge variant="secondary">Default</Badge>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">Add Payment Method</Button>
            <Button variant="outline">Update Billing Address</Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Billing History
          </CardTitle>
          <CardDescription>View and download your invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium">{invoice.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {invoice.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">${invoice.amount}</span>
                  <Badge
                    variant={
                      invoice.status === 'paid' ? 'default' : 'secondary'
                    }
                  >
                    {invoice.status}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
