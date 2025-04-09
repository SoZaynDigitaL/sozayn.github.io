import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface WebhookLogsProps {
  webhookId: number;
}

export default function WebhookLogs({ webhookId }: WebhookLogsProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  
  // Fetch webhook logs
  const {
    data: logs = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["/api/webhook-logs", webhookId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/webhooks/${webhookId}/logs`);
      if (!res.ok) {
        throw new Error("Failed to fetch webhook logs");
      }
      return res.json();
    },
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="flex justify-center py-6">
        <p className="text-red-500">Failed to load webhook logs</p>
      </div>
    );
  }
  
  if (logs.length === 0) {
    return (
      <div className="flex justify-center py-6">
        <p className="text-gray-500">No logs found for this webhook</p>
      </div>
    );
  }
  
  // Helper to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    }).format(date);
  };
  
  // Helper to format JSON for display
  const formatJson = (json: any) => {
    try {
      return JSON.stringify(json, null, 2);
    } catch (e) {
      return JSON.stringify(json);
    }
  };
  
  // Get status badge color
  const getStatusBadge = (status: number) => {
    if (status >= 200 && status < 300) {
      return <Badge className="bg-green-500">Success</Badge>;
    } else if (status >= 400 && status < 500) {
      return <Badge className="bg-yellow-500">Client Error</Badge>;
    } else if (status >= 500) {
      return <Badge className="bg-red-500">Server Error</Badge>;
    } else {
      return <Badge className="bg-gray-500">Unknown</Badge>;
    }
  };
  
  // Get event type badge
  const getEventBadge = (eventType: string) => {
    const typeColor = eventType.includes('delivery') ? 'blue' : 
                      eventType.includes('order') ? 'purple' : 
                      eventType.includes('payment') ? 'green' : 
                      eventType.includes('subscription') ? 'orange' : 
                      eventType.includes('courier') ? 'blue' : 'gray';
    
    return (
      <Badge className={`bg-${typeColor}-100 text-${typeColor}-800 border-${typeColor}-200`} variant="outline">
        {eventType}
      </Badge>
    );
  };
  
  const toggleAccordion = (value: string) => {
    setExpandedItem(expandedItem === value ? null : value);
  };
  
  return (
    <div className="space-y-4">
      <CardHeader className="px-0 pt-0">
        <CardTitle>Webhook Logs</CardTitle>
        <CardDescription>
          Recent webhook events and their processing status
        </CardDescription>
      </CardHeader>
      
      <div className="space-y-4">
        {logs.map((log: any, index: number) => (
          <Card key={log.id} className="shadow-sm">
            <CardHeader className="p-4 pb-0">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                      {log.eventType.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium flex flex-wrap gap-2 items-center">
                      {getEventBadge(log.eventType)}
                      <span className="text-xs text-gray-500">
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Processing time: {log.processingTimeMs}ms
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {log.statusCode && getStatusBadge(log.statusCode)}
                  {log.errorMessage && (
                    <Badge variant="outline" className="text-red-500 border-red-200">
                      Error
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <Accordion type="single" collapsible value={expandedItem || ''}>
                <AccordionItem value={`request-${log.id}`} className="border-0">
                  <AccordionTrigger 
                    onClick={() => toggleAccordion(`request-${log.id}`)}
                    className="py-2 text-sm font-medium"
                  >
                    Request Payload
                  </AccordionTrigger>
                  <AccordionContent>
                    <pre className="bg-slate-950 text-gray-200 p-3 rounded-md text-xs overflow-auto max-h-64">
                      {formatJson(log.requestPayload)}
                    </pre>
                  </AccordionContent>
                </AccordionItem>
                
                {log.responsePayload && (
                  <AccordionItem value={`response-${log.id}`} className="border-0">
                    <AccordionTrigger 
                      onClick={() => toggleAccordion(`response-${log.id}`)}
                      className="py-2 text-sm font-medium"
                    >
                      Response Payload
                    </AccordionTrigger>
                    <AccordionContent>
                      <pre className="bg-slate-950 text-gray-200 p-3 rounded-md text-xs overflow-auto max-h-64">
                        {formatJson(log.responsePayload)}
                      </pre>
                    </AccordionContent>
                  </AccordionItem>
                )}
                
                {log.errorMessage && (
                  <AccordionItem value={`error-${log.id}`} className="border-0">
                    <AccordionTrigger 
                      onClick={() => toggleAccordion(`error-${log.id}`)}
                      className="py-2 text-sm font-medium text-red-500"
                    >
                      Error Details
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
                        {log.errorMessage}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}