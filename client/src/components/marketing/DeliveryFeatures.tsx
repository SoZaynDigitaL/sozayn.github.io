import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  Truck, 
  Rocket, 
  Map, 
  BarChart, 
  ShieldCheck, 
  MessageSquare, 
  ArrowRight, 
  Clock,
  Activity,
  Users
} from 'lucide-react';

export default function DeliveryFeatures() {
  return (
    <div className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Advanced Delivery Integration</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our platform offers seamless integration with industry-leading delivery providers, giving you complete control over your delivery operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Feature 1 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-primary/10 p-2">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-xl">UberDirect Integration</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p>Connect directly with UberDirect's API for seamless on-demand delivery services with real-time tracking.</p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Automated dispatch system</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Real-time delivery updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Configurable delivery zones</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full gap-2">
                <span>Learn More</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          {/* Feature 2 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-purple-500/10 p-2">
                  <Rocket className="h-5 w-5 text-purple-500" />
                </div>
                <CardTitle className="text-xl">JetGo Integration</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p>Connect with JetGo for specialized delivery services with advanced routing and optimization.</p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Optimized delivery routing</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Scheduled delivery windows</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Webhook delivery notifications</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full gap-2">
                <span>Learn More</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          {/* Feature 3 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-blue-500/10 p-2">
                  <Map className="h-5 w-5 text-blue-500" />
                </div>
                <CardTitle className="text-xl">Live Delivery Tracking</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p>Interactive map interface for real-time tracking of all active deliveries in your service area.</p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Real-time GPS positioning</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Live ETA updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Customer delivery notifications</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full gap-2">
                <span>Learn More</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* More Features */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Analytics Dashboard</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Comprehensive analytics on delivery performance, costs, and customer satisfaction metrics.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Delivery Scheduling</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Advanced scheduling features for planned deliveries with precise time windows.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Performance Tracking</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Monitor delivery partner performance with detailed metrics and benchmarking.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Customer Feedback</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Automated customer feedback collection after each delivery for continuous improvement.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-xl bg-muted/50 border p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to transform your delivery operations?</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Join Turkish Kebab Grill House and other successful businesses using SoZayn to streamline their delivery processes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="gap-2">
              <span>Request a Demo</span>
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              <span>View Case Studies</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Check icon component
function Check(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}