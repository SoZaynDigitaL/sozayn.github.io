import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { Loader2, ClipboardList, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

interface WebhookLogsProps {
  webhookId: number;
}

export default function WebhookLogs({ webhookId }: WebhookLogsProps) {
  const [isLogDetailOpen, setIsLogDetailOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  
  // Query to fetch webhook logs
  const { data: logs = [], isLoading } = useQuery({
    queryKey: [`/api/webhooks/${webhookId}/logs`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/webhooks/${webhookId}/logs`);
      if (!res.ok) {
        throw new Error("Failed to fetch webhook logs");
      }
      return res.json();
    },
  });
  
  // View log details
  const viewLogDetails = (log: any) => {
    setSelectedLog(log);
    setIsLogDetailOpen(true);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy HH:mm:ss");
  };
  
  // Get status badge
  const getStatusBadge = (statusCode: number) => {
    if (!statusCode) return null;
    
    if (statusCode >= 200 && statusCode < 300) {
      return <Badge className="bg-green-500">Success</Badge>;
    } else if (statusCode >= 400 && statusCode < 500) {
      return <Badge className="bg-yellow-500">Client Error</Badge>;
    } else if (statusCode >= 500) {
      return <Badge className="bg-red-500">Server Error</Badge>;
    }
    
    return <Badge>Unknown</Badge>;
  };
  
  // Get event type label
  const getEventTypeLabel = (eventType: string) => {
    // Map of event types to more readable labels
    const eventLabels: Record<string, string> = {
      "order.created": "Order Created",
      "order.updated": "Order Updated",
      "order.cancelled": "Order Cancelled",
      "delivery.assigned": "Delivery Assigned",
      "delivery.pickup": "Delivery Pickup",
      "delivery.completed": "Delivery Completed",
      "payment.succeeded": "Payment Succeeded",
      "payment.failed": "Payment Failed",
    };
    
    return eventLabels[eventType] || eventType;
  };
  
  // Format JSON for display
  const formatJSON = (json: any) => {
    try {
      return JSON.stringify(json, null, 2);
    } catch (error) {
      return String(json);
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Recent Webhook Logs</h2>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <ClipboardList className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">No webhook logs yet</p>
          <p className="text-sm text-gray-400">Logs will appear here once the webhook is triggered</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.slice(0, 5).map((log: any) => (
            <Card 
              key={log.id} 
              className="p-3 cursor-pointer hover:bg-gray-50"
              onClick={() => viewLogDetails(log)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{getEventTypeLabel(log.eventType)}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(log.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {log.statusCode && (
                    <div className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {log.statusCode}
                    </div>
                  )}
                  {getStatusBadge(log.statusCode)}
                  {log.processingTimeMs && (
                    <div className="text-xs text-gray-500">
                      {log.processingTimeMs}ms
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
          
          {logs.length > 5 && (
            <div className="text-center pt-2">
              <Button variant="link" className="text-blue-600">
                View all {logs.length} logs
              </Button>
            </div>
          )}
        </div>
      )}
      
      {selectedLog && (
        <Dialog open={isLogDetailOpen} onOpenChange={setIsLogDetailOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Webhook Log Details</DialogTitle>
              <DialogDescription>
                Log ID: {selectedLog.id} • {formatDate(selectedLog.createdAt)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-sm font-medium">Event Type</h3>
                  <p>{getEventTypeLabel(selectedLog.eventType)}</p>
                </div>
                
                <div className="text-right">
                  <h3 className="text-sm font-medium">Status</h3>
                  <div className="flex items-center gap-2 justify-end">
                    {selectedLog.statusCode && (
                      <div className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {selectedLog.statusCode}
                      </div>
                    )}
                    {getStatusBadge(selectedLog.statusCode)}
                  </div>
                </div>
              </div>
              
              {selectedLog.processingTimeMs && (
                <div>
                  <h3 className="text-sm font-medium">Processing Time</h3>
                  <p>{selectedLog.processingTimeMs}ms</p>
                </div>
              )}
              
              {selectedLog.errorMessage && (
                <div>
                  <h3 className="text-sm font-medium text-red-600">Error</h3>
                  <p className="text-red-600">{selectedLog.errorMessage}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {selectedLog.requestPayload && (
                  <div>
                    <h3 className="text-sm font-medium">Request Payload</h3>
                    <div className="mt-1 max-h-80 overflow-auto bg-gray-50 p-3 rounded-md">
                      <pre className="text-xs font-mono">
                        {formatJSON(selectedLog.requestPayload)}
                      </pre>
                    </div>
                  </div>
                )}
                
                {selectedLog.responsePayload && (
                  <div>
                    <h3 className="text-sm font-medium">Response Payload</h3>
                    <div className="mt-1 max-h-80 overflow-auto bg-gray-50 p-3 rounded-md">
                      <pre className="text-xs font-mono">
                        {formatJSON(selectedLog.responsePayload)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}