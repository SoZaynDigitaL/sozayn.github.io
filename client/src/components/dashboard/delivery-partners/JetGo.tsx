import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Rocket } from 'lucide-react';
import JetGoIntegration from './JetGoIntegration';

type JetGoProps = {
  integration: any;
  isSubmitting: boolean;
  onUpdate: (id: number, data: any) => void;
  onToggleActive: (id: number, isActive: boolean) => void;
  onTest: (id: number) => void;
  onDelete: (id: number) => void;
};

export default function JetGo({ 
  integration,
  isSubmitting,
  onUpdate,
  onToggleActive,
  onTest,
  onDelete
}: JetGoProps) {
  // For Supabase integration, we're directly using the JetGoIntegration component
  return <JetGoIntegration />;
}