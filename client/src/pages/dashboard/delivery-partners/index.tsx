import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DeliveryPartnerIntegrations from '@/components/dashboard/delivery-partners/DeliveryPartnerIntegrations';
import { Button } from '@/components/ui/button';
import { Truck, Plus, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function DeliveryPartnersPage() {
  return (
    <DashboardLayout>
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Truck className="h-8 w-8 text-primary" />
              Delivery Partners
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage delivery provider integrations and track active deliveries
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Info className="h-4 w-4" />
                  <span>About</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delivery Partner Integration</DialogTitle>
                  <DialogDescription>
                    SoZayn currently supports UberDirect and JetGo for delivery integration, allowing you to automatically dispatch deliveries and track their status in real-time.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium flex items-center gap-2 mb-2">
                      <Truck className="h-4 w-4 text-blue-500" />
                      UberDirect
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      UberDirect provides on-demand delivery with advanced tracking and reliability. Ideal for local deliveries with fast turnaround times.
                    </p>
                    <div className="mt-2 text-sm">
                      <a 
                        href="https://www.uber.com/us/en/business/solutions/direct/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary underline text-xs"
                      >
                        Learn more
                      </a>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium flex items-center gap-2 mb-2">
                      <Truck className="h-4 w-4 text-purple-500" />
                      JetGo
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      JetGo specializes in same-day and next-day deliveries with flexible scheduling options and comprehensive delivery management.
                    </p>
                  </div>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  Contact our support team if you need assistance with setting up your delivery partner integrations.
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="mt-6">
          <DeliveryPartnerIntegrations />
        </div>
      </div>
    </DashboardLayout>
  );
}