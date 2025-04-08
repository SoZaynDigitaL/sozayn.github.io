import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardCard } from "@/components/ui/dashboard-card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ArrowRight, ExternalLink, Lock, Share2 } from "lucide-react";

export default function WooCommerceIntegration() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">WooCommerce Integration</h1>
            <p className="text-gray-500">Connect and manage your WooCommerce store</p>
          </div>
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
            <ExternalLink className="h-4 w-4" />
            Connect Store
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DashboardCard>
            <div className="flex flex-col items-center justify-center py-6">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Share2 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium mb-1">Data Sync</h3>
              <p className="text-sm text-gray-500 text-center max-w-xs mb-4">
                Sync products, orders and customers from your WooCommerce store
              </p>
              <Button variant="outline" size="sm">
                Configure Sync
              </Button>
            </div>
          </DashboardCard>

          <DashboardCard>
            <div className="flex flex-col items-center justify-center py-6">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <ArrowRight className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium mb-1">Webhooks</h3>
              <p className="text-sm text-gray-500 text-center max-w-xs mb-4">
                Set up webhooks to automate actions between systems
              </p>
              <Button variant="outline" size="sm">
                Manage Webhooks
              </Button>
            </div>
          </DashboardCard>

          <DashboardCard>
            <div className="flex flex-col items-center justify-center py-6">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium mb-1">API Keys</h3>
              <p className="text-sm text-gray-500 text-center max-w-xs mb-4">
                Manage API keys and access permissions
              </p>
              <Button variant="outline" size="sm">
                Configure API
              </Button>
            </div>
          </DashboardCard>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started with WooCommerce</CardTitle>
            <CardDescription>Follow these steps to connect your WooCommerce store</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-none w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  1
                </div>
                <div>
                  <h3 className="font-medium">Create API Keys in WooCommerce</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Go to WooCommerce → Settings → Advanced → REST API and create a new key
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-none w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  2
                </div>
                <div>
                  <h3 className="font-medium">Set Appropriate Permissions</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Set the permissions to "Read/Write" for full access to your store data
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-none w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  3
                </div>
                <div>
                  <h3 className="font-medium">Copy Consumer Key & Secret</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Copy the generated Consumer Key and Consumer Secret credentials
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-none w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  4
                </div>
                <div>
                  <h3 className="font-medium">Enter Store URL and Credentials</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Enter your WordPress site URL along with the API credentials in SoZayn
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Connect WooCommerce Store
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}