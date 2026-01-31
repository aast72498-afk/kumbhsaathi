'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle, Send } from 'lucide-react';
import { mockGhats } from '@/lib/data';

const alertSchema = z.object({
  ghat: z.string().min(1, { message: 'Please select a Ghat.' }),
  zone: z.string().min(1, { message: 'Zone is required.' }),
  emails: z
    .string()
    .refine(
      (value) => {
        if (!value || value.trim() === '') return true; // Optional field
        const emails = value.split(',').map((e) => e.trim());
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emails.every((email) => emailRegex.test(email));
      },
      { message: 'Please provide a valid, comma-separated list of emails.' }
    )
    .optional(),
  message: z.string().min(10, { message: 'Alert message must be at least 10 characters.' }),
});

type AlertFormValues = z.infer<typeof alertSchema>;

interface BroadcastAlertFormProps {
  setOpen: (open: boolean) => void;
}

export function BroadcastAlertForm({ setOpen }: BroadcastAlertFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [telegramUrl, setTelegramUrl] = useState('');
  const { toast } = useToast();

  const form = useForm<AlertFormValues>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      ghat: '',
      zone: '',
      emails: '',
      message: '',
    },
  });

  const ghatOptions = mockGhats.map((ghat) => ({
    label: ghat.name,
    value: ghat.name,
  }));

  const onSubmit = (data: AlertFormValues) => {
    setIsSubmitting(true);
    
    const telegramMessage = `🚨 MAHAKUMBH CROWD ALERT

Location:
Ghat: ${data.ghat}
Zone: ${data.zone}

Alert:
${data.message}

Please proceed immediately and assist with crowd management.`;

    const encodedMessage = encodeURIComponent(telegramMessage);
    const url = `https://t.me/share/url?text=${encodedMessage}`;
    setTelegramUrl(url);
    setSubmissionSuccess(true);
    
    toast({
      title: 'Alert Prepared',
      description: 'Redirecting to Telegram...',
    });

    setTimeout(() => {
      window.open(url, '_blank');
      setOpen(false);
      // Reset for next time
      setTimeout(() => {
        setSubmissionSuccess(false);
        setIsSubmitting(false);
        form.reset();
      }, 500);
    }, 2000);
  };
  
  if (submissionSuccess) {
    return (
        <div className="text-center space-y-4 py-8">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h3 className="text-lg font-medium">Alert Prepared Successfully</h3>
            <p className="text-sm text-muted-foreground">
                You will be redirected to Telegram automatically.
            </p>
            <Button onClick={() => window.open(telegramUrl, '_blank')}>
                <Send className="mr-2 h-4 w-4" /> Open Telegram Now
            </Button>
        </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="ghat"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ghat Selection</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Ghat" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ghatOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="zone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Zone Selection</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Zone A, Sector 2" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="emails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Volunteer Emails (Optional, not sent to Telegram)</FormLabel>
              <FormControl>
                <Input placeholder="email1@example.com, email2@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alert Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Heavy crowd influx near the main entrance. Assistance required."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Prepare Alert
            </Button>
        </div>
      </form>
    </Form>
  );
}
