'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Siren, User, Hospital, Loader2, CheckCircle } from 'lucide-react';
import { getGhatsForDropdown } from '@/lib/data';
import { reportMissingPerson, reportHealthEmergency } from '@/app/actions';

// Schemas
const missingPersonSchema = z.object({
  missingPersonName: z.string().min(3, 'Name must be at least 3 characters.'),
  missingPersonMobile: z.string().optional(),
  reporterContact: z.string().regex(/^\d{10}$/, 'Please enter a valid 10-digit mobile number.'),
  lastSeenGhat: z.string().min(1, 'Please select the last seen location.'),
  description: z.string().min(10, 'Please provide a brief description.'),
});

const healthEmergencySchema = z.object({
  issueType: z.string().min(1, 'Please select the type of issue.'),
  location: z.string().min(3, 'Please provide your current location.'),
  details: z.string().optional(),
});

type MissingPersonFormValues = z.infer<typeof missingPersonSchema>;
type HealthEmergencyFormValues = z.infer<typeof healthEmergencySchema>;

// Main Component
export default function EmergencyFab() {
  const [missingPersonOpen, setMissingPersonOpen] = useState(false);
  const [healthEmergencyOpen, setHealthEmergencyOpen] = useState(false);
  const [ghatOptions, setGhatOptions] = useState<{ label: string; value: string }[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    getGhatsForDropdown().then(setGhatOptions);
  }, []);
  
  const mpForm = useForm<MissingPersonFormValues>({ resolver: zodResolver(missingPersonSchema) });
  const heForm = useForm<HealthEmergencyFormValues>({ resolver: zodResolver(healthEmergencySchema) });

  const onMissingPersonSubmit = async (data: MissingPersonFormValues) => {
    const result = await reportMissingPerson(data);
    if (result.success) {
      toast({
        title: 'Report Submitted Successfully',
        description: 'Police and volunteers have been notified. Please stay near the selected Ghat Help-Desk.',
      });
      mpForm.reset();
      setMissingPersonOpen(false);
    } else {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: result.error,
      });
    }
  };

  const onHealthEmergencySubmit = async (data: HealthEmergencyFormValues) => {
    const result = await reportHealthEmergency(data);
    if (result.success) {
      toast({
        title: 'Emergency Reported',
        description: 'Emergency team dispatched. Please stay where you are. Help is on the way!',
        className: 'bg-green-500 text-white',
      });
      heForm.reset();
      setHealthEmergencyOpen(false);
    } else {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: result.error,
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 1 }}
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50"
          >
            <Button
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 shadow-2xl animate-pulse"
            >
              <Siren className="w-8 h-8" />
            </Button>
          </motion.div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={10} className="w-64">
          <DropdownMenuItem onSelect={() => setMissingPersonOpen(true)}>
            <User className="mr-2 h-4 w-4" />
            <span>Report Missing Person</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setHealthEmergencyOpen(true)}>
            <Hospital className="mr-2 h-4 w-4" />
            <span>Medical Emergency</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Missing Person Dialog */}
      <Dialog open={missingPersonOpen} onOpenChange={setMissingPersonOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Report a Missing Person</DialogTitle>
            <DialogDescription>
              Please provide as much detail as possible. Your report will be sent to the nearest authorities.
            </DialogDescription>
          </DialogHeader>
          <Form {...mpForm}>
            <form onSubmit={mpForm.handleSubmit(onMissingPersonSubmit)} className="space-y-4">
              <FormField control={mpForm.control} name="missingPersonName" render={({ field }) => (
                <FormItem><Label>Missing Person's Name</Label><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={mpForm.control} name="reporterContact" render={({ field }) => (
                <FormItem><Label>Your Contact Number</Label><FormControl><Input placeholder="10-digit mobile number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={mpForm.control} name="lastSeenGhat" render={({ field }) => (
                 <FormItem>
                    <Label>Last Seen Location</Label>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a Ghat" /></SelectTrigger></FormControl>
                        <SelectContent>
                            {ghatOptions.map(opt => <SelectItem key={opt.value} value={opt.label}>{opt.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
              )} />
              <FormField control={mpForm.control} name="description" render={({ field }) => (
                <FormItem><Label>Description (Clothing, etc.)</Label><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button type="submit" disabled={mpForm.formState.isSubmitting}>
                  {mpForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Report
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Health Emergency Dialog */}
      <Dialog open={healthEmergencyOpen} onOpenChange={setHealthEmergencyOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Report a Medical Emergency</DialogTitle>
            <DialogDescription>
              Select the issue and confirm your location. A medical team will be dispatched immediately.
            </DialogDescription>
          </DialogHeader>
           <Form {...heForm}>
            <form onSubmit={heForm.handleSubmit(onHealthEmergencySubmit)} className="space-y-6">
               <FormField control={heForm.control} name="issueType" render={({ field }) => (
                <FormItem className="space-y-3">
                    <Label>Type of Issue</Label>
                    <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl><RadioGroupItem value="Fainting" /></FormControl><Label className="font-normal">Fainting / Dizziness</Label>
                            </FormItem>
                             <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl><RadioGroupItem value="Breathing Difficulty" /></FormControl><Label className="font-normal">Breathing Difficulty</Label>
                            </FormItem>
                             <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl><RadioGroupItem value="Physical Injury" /></FormControl><Label className="font-normal">Physical Injury</Label>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl><RadioGroupItem value="Other" /></FormControl><Label className="font-normal">Other</Label>
                            </FormItem>
                        </RadioGroup>
                    </FormControl>
                    <FormMessage />
                </FormItem>
              )} />
              <FormField control={heForm.control} name="location" render={({ field }) => (
                <FormItem><Label>Your Current Location (Ghat/Sector)</Label><FormControl><Input placeholder="e.g., Ram Kund, near main steps" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button type="submit" disabled={heForm.formState.isSubmitting} className="bg-red-600 hover:bg-red-700">
                  {heForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Dispatch Medical Team
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
