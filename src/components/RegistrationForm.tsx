"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { registerPilgrim } from '@/app/actions';

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { RegistrationSuccessDialog } from './RegistrationSuccessDialog';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import type { RegistrationPayload } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle } from 'lucide-react';


const registrationSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters."),
  mobileNumber: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit mobile number."),
  numberOfPeople: z.coerce.number().min(1, "At least one person is required.").max(10, "Maximum 10 people per registration."),
  date: z.date({ required_error: "Please select a date for your visit." }),
  ghat: z.string({ required_error: "Please select a Ghat." }),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;
type GhatOption = { value: string; label: string };

export function RegistrationForm({ ghats }: { ghats: GhatOption[] }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ id: string; telegramUrl: string; ghatName: string; timeSlot: string; date: Date } | null>(null);

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: "",
      mobileNumber: "",
      numberOfPeople: 1,
    }
  });

  async function onSubmit(data: RegistrationPayload) {
    setIsLoading(true);
    setError(null);
    try {
      const result = await registerPilgrim(data);
      if (result.success) {
        setSuccessData(result.data!);
      } else {
        setError(result.error || "An unknown error occurred.");
      }
    } catch (e) {
      setError("Failed to connect to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const resetForm = () => {
    form.reset();
    setSuccessData(null);
    setError(null);
  }

  if (successData) {
    return <RegistrationSuccessDialog open={!!successData} onOpenChange={resetForm} details={successData} />;
  }
  
  const inputStyles = "bg-white/10 border-white/30 text-white placeholder:text-white/60 focus:ring-primary focus:border-primary";
  const labelStyles = "text-white/90";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelStyles}>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your full name" {...field} className={inputStyles} />
              </FormControl>
              <FormMessage className="text-red-300" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mobileNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelStyles}>Mobile Number (for Telegram)</FormLabel>
              <FormControl>
                <Input placeholder="10-digit mobile number" {...field} className={inputStyles} />
              </FormControl>
              <FormMessage className="text-red-300" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="numberOfPeople"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelStyles}>Number of People</FormLabel>
              <FormControl>
                <Input type="number" min="1" max="10" {...field} className={inputStyles} />
              </FormControl>
              <FormMessage className="text-red-300" />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="ghat"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelStyles}>Select Ghat</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className={cn(inputStyles, "text-white/90")}>
                      <SelectValue placeholder="Choose a Ghat" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ghats.map((ghat) => (
                      <SelectItem key={ghat.value} value={ghat.value}>{ghat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className={cn(labelStyles, "mb-2")}>Select Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-white/60",
                           inputStyles
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date() || date > new Date("2028-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage className="text-red-300 mt-2" />
              </FormItem>
            )}
          />
        </div>
        
        {error && (
            <Alert variant="destructive" className="bg-red-500/20 border-red-500/50 text-red-300">
                <AlertCircle className="h-4 w-4 !text-red-300" />
                <AlertTitle>Registration Failed</AlertTitle>
                <AlertDescription>
                    {error}
                </AlertDescription>
            </Alert>
        )}
        <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          {isLoading ? 'Registering...' : 'Secure My Slot'}
        </Button>
      </form>
    </Form>
  );
}
