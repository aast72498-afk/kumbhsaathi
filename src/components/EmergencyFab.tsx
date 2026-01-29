'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';

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
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Siren, User, Hospital, Loader2 } from 'lucide-react';
import { getGhatsForDropdown } from '@/lib/data';
import { reportMissingPerson, reportHealthEmergency } from '@/app/actions';

// Schemas
const missingPersonSchema = z.object({
  missingPersonName: z.string().min(3, 'Name must be at least 3 characters.'),
  missingPersonMobile: z.string().optional(),
  reporterContact: z.string().regex(/^\d{10}$/, 'Please enter a valid 10-digit mobile number.'),
  lastSeenGhat: z.string().min(1, 'Please select the last seen location.'),
  detailedLocation: z.string().min(3, 'Please provide more details on the location.'),
  description: z.string().min(10, 'Please provide a brief description.'),
  photo: z.any().optional(),
});

const healthEmergencySchema = z.object({
  reporterName: z.string().min(3, "Please enter your name."),
  reporterContact: z.string().regex(/^\d{10}$/, 'Please enter a valid 10-digit mobile number.'),
  peopleAffected: z.coerce.number().min(1, 'At least one person must be affected.'),
  issueType: z.string().min(1, 'Please select the type of issue.'),
  locationGhat: z.string().min(1, 'Please select the ghat location.'),
  detailedLocation: z.string().min(3, 'Please provide specific location details.'),
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
  
  const mpForm = useForm<MissingPersonFormValues>({ resolver: zodResolver(missingPersonSchema), defaultValues: { missingPersonName: '', missingPersonMobile: '', reporterContact: '', lastSeenGhat: '', detailedLocation: '', description: '' } });
  const heForm = useForm<HealthEmergencyFormValues>({ resolver: zodResolver(healthEmergencySchema), defaultValues: { reporterName: '', reporterContact: '', peopleAffected: 1, issueType: '', locationGhat: '', detailedLocation: '', details: '' } });
  
  const selectedMpGhat = mpForm.watch('lastSeenGhat');
  const selectedHeGhat = heForm.watch('locationGhat');


  const onMissingPersonSubmit = async (data: MissingPersonFormValues) => {
    let photoUrl = '';
    if (data.photo && data.photo.length > 0) {
        const file = data.photo[0];
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast({ variant: 'destructive', title: 'Photo is too large', description: 'Please upload an image under 5MB.' });
            mpForm.setError('photo', { message: 'Photo must be under 5MB.' });
            return;
        }
        if (!file.type.startsWith('image/')) {
            toast({ variant: 'destructive', title: 'Invalid file type', description: 'Please upload an image file (PNG, JPG).' });
            mpForm.setError('photo', { message: 'Invalid file type.' });
            return;
        }
        
        try {
            photoUrl = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = error => reject(error);
                reader.readAsDataURL(file);
            });
        } catch (error) {
            console.error("Error converting file to data URL", error);
            toast({ variant: 'destructive', title: 'File Read Error', description: 'Could not process the uploaded photo.' });
            return;
        }
    }

    // Create a new object for the server action payload
    const payload = {
        missingPersonName: data.missingPersonName,
        missingPersonMobile: data.missingPersonMobile,
        reporterContact: data.reporterContact,
        lastSeenGhat: data.lastSeenGhat,
        detailedLocation: data.detailedLocation,
        description: data.description,
        photoUrl: photoUrl || undefined,
    };

    const result = await reportMissingPerson(payload);

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
        <DialogContent className="sm:max-w-[425px] grid-rows-[auto_1fr_auto] max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle>Report a Missing Person</DialogTitle>
            <DialogDescription>
              Please provide as much detail as possible. Your report will be sent to the nearest authorities.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto px-6">
            <Form {...mpForm}>
                <form id="missing-person-form" onSubmit={mpForm.handleSubmit(onMissingPersonSubmit)} className="space-y-4 py-4">
                  <FormField control={mpForm.control} name="missingPersonName" render={({ field }) => (
                    <FormItem><FormLabel>Missing Person's Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={mpForm.control} name="missingPersonMobile" render={({ field }) => (
                    <FormItem><FormLabel>Missing Person's Mobile No. (Optional)</FormLabel><FormControl><Input placeholder="10-digit mobile if available" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                    <FormField control={mpForm.control} name="photo" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Photo of Missing Person (Optional)</FormLabel>
                            <FormControl>
                                <Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files)} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                  <FormField control={mpForm.control} name="reporterContact" render={({ field }) => (
                    <FormItem><FormLabel>Your Contact Number</FormLabel><FormControl><Input placeholder="10-digit mobile number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={mpForm.control} name="lastSeenGhat" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Last Seen Location</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a Ghat" /></SelectTrigger></FormControl>
                            <SelectContent>
                                {ghatOptions.map(opt => <SelectItem key={opt.value} value={opt.label}>{opt.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                  )} />
                    <AnimatePresence>
                    {selectedMpGhat && (
                        <motion.div
                            key="detailedLocation"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <FormField control={mpForm.control} name="detailedLocation" render={({ field }) => (
                                <FormItem className="pt-4">
                                    <FormLabel>Specific Location Details</FormLabel>
                                    <FormControl><Input placeholder="e.g., Near the main steps, by the banyan tree" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </motion.div>
                    )}
                    </AnimatePresence>
                  <FormField control={mpForm.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description (Clothing, etc.)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </form>
            </Form>
          </div>
          <DialogFooter className="p-6 pt-4">
              <Button type="submit" form="missing-person-form" disabled={mpForm.formState.isSubmitting}>
                {mpForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Report
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Health Emergency Dialog */}
      <Dialog open={healthEmergencyOpen} onOpenChange={setHealthEmergencyOpen}>
        <DialogContent className="sm:max-w-[425px] grid-rows-[auto_1fr_auto] max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle>Report a Medical Emergency</DialogTitle>
            <DialogDescription>
              Fill in the details below. A medical team will be dispatched immediately.
            </DialogDescription>
          </DialogHeader>
           <div className="overflow-y-auto px-6">
            <Form {...heForm}>
              <form id="health-emergency-form" onSubmit={heForm.handleSubmit(onHealthEmergencySubmit)} className="space-y-4 py-4">
                  <FormField control={heForm.control} name="reporterName" render={({ field }) => (
                      <FormItem><FormLabel>Your Name</FormLabel><FormControl><Input placeholder="Your full name" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={heForm.control} name="reporterContact" render={({ field }) => (
                      <FormItem><FormLabel>Your Contact Number</FormLabel><FormControl><Input placeholder="10-digit mobile number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={heForm.control} name="peopleAffected" render={({ field }) => (
                      <FormItem><FormLabel>Number of People Affected</FormLabel><FormControl><Input type="number" min="1" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                <FormField control={heForm.control} name="issueType" render={({ field }) => (
                  <FormItem className="space-y-3">
                      <FormLabel>Type of Issue</FormLabel>
                      <FormControl>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl><RadioGroupItem value="Fainting" /></FormControl><FormLabel className="font-normal">Fainting / Dizziness</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl><RadioGroupItem value="Breathing Difficulty" /></FormControl><FormLabel className="font-normal">Breathing Difficulty</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl><RadioGroupItem value="Physical Injury" /></FormControl><FormLabel className="font-normal">Physical Injury</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl><RadioGroupItem value="Other" /></FormControl><FormLabel className="font-normal">Other</FormLabel>
                              </FormItem>
                          </RadioGroup>
                      </FormControl>
                      <FormMessage />
                  </FormItem>
                )} />
                <FormField control={heForm.control} name="locationGhat" render={({ field }) => (
                  <FormItem>
                      <FormLabel>Location (Ghat)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select the nearest Ghat" /></SelectTrigger></FormControl>
                          <SelectContent>
                              {ghatOptions.map(opt => <SelectItem key={opt.value} value={opt.label}>{opt.label}</SelectItem>)}
                          </SelectContent>
                      </Select>
                      <FormMessage />
                  </FormItem>
                )} />
                  <AnimatePresence>
                      {selectedHeGhat && (
                          <motion.div
                              key="heDetailedLocation"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                          >
                              <FormField control={heForm.control} name="detailedLocation" render={({ field }) => (
                                  <FormItem className="pt-4">
                                      <FormLabel>Specific Location Details</FormLabel>
                                      <FormControl><Input placeholder="e.g., Near the main steps, by the banyan tree" {...field} /></FormControl>
                                      <FormMessage />
                                  </FormItem>
                              )} />
                          </motion.div>
                      )}
                  </AnimatePresence>
                <FormField control={heForm.control} name="details" render={({ field }) => (
                  <FormItem><FormLabel>Additional Details (Optional)</FormLabel><FormControl><Textarea placeholder="Provide any other relevant information" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </form>
            </Form>
           </div>
          <DialogFooter className="p-6 pt-4">
              <Button type="submit" form="health-emergency-form" disabled={heForm.formState.isSubmitting} className="bg-red-600 hover:bg-red-700">
                {heForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Dispatch Medical Team
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
