'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection } from 'firebase/firestore';
import { format, addDays } from 'date-fns';
import Image from 'next/image';

import { useCollection, useFirestore } from '@/firebase';
import { registerPilgrim } from '@/app/actions';
import type { Ghat, TimeSlot, RegistrationPayload } from '@/lib/types';
import { cn } from '@/lib/utils';

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, Loader2, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

// --- Schema for the form ---
const bookingSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters."),
  mobileNumber: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit mobile number."),
  numberOfPeople: z.coerce.number().min(1, "At least one person is required.").max(10, "Maximum 10 people per registration."),
});
type BookingFormValues = z.infer<typeof bookingSchema>;


// --- Main Booking Component ---
export default function BookingInterface() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedGhat, setSelectedGhat] = useState<Ghat | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ id: string; ghatName: string; timeSlot: string; date: Date } | null>(null);

  const { toast } = useToast();

  // --- Firestore Data Fetching ---
  const firestore = useFirestore();
  const ghatsCollection = useMemo(() => (firestore ? collection(firestore, 'ghats') : null), [firestore]);
  const { data: ghats, loading: ghatsLoading, error: ghatsError } = useCollection<Ghat>(ghatsCollection);

  const totalPilgrims = useMemo(() => {
    if (!ghats) return 0;
    return ghats.reduce((total, ghat) => {
        return total + ghat.timeSlots.reduce((ghatTotal, slot) => {
            return ghatTotal + slot.currentRegistrations;
        }, 0);
    }, 0);
  }, [ghats]);


  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { fullName: "", mobileNumber: "", numberOfPeople: 1 },
  });

  const handleGhatSelect = (ghat: Ghat) => {
    setSelectedGhat(ghat);
    setSelectedSlot(null); // Reset slot when ghat changes
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };
  
  const resetFlow = () => {
    setSelectedGhat(null);
    setSelectedSlot(null);
    setSuccessData(null);
    setError(null);
    form.reset();
  }

  // --- Form Submission Logic ---
  async function onSubmit(data: BookingFormValues) {
    if (!selectedDate || !selectedGhat || !selectedSlot) {
      setError("Please complete all steps before confirming.");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    const payload = {
        ...data,
        date: selectedDate,
        ghat: selectedGhat.shortName,
        timeSlot: selectedSlot.time,
    };
    
    try {
      const result = await registerPilgrim(payload as RegistrationPayload & {date: Date});
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

  const getCrowdStatus = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 95) return { label: 'High', color: 'bg-red-500 text-white', disabled: true };
    if (percentage >= 70) return { label: 'Moderate', color: 'bg-yellow-500 text-white', disabled: false };
    return { label: 'Low', color: 'bg-green-500 text-white', disabled: false };
  };

  const getOverallGhatStatus = (ghat: Ghat) => {
    const totalCapacity = ghat.timeSlots.reduce((sum, slot) => sum + slot.maxCapacity, 0);
    const totalRegistrations = ghat.timeSlots.reduce((sum, slot) => sum + slot.currentRegistrations, 0);
    if(totalCapacity === 0) return getCrowdStatus(0, 1); // Avoid division by zero
    return getCrowdStatus(totalRegistrations, totalCapacity);
  };


  if (ghatsLoading) {
    return <div className="text-center p-12"><Loader2 className="h-8 w-8 animate-spin mx-auto" /> <p className='mt-2'>Loading Live Data...</p></div>
  }
  
  if (ghatsError) {
      return (
        <Alert variant="destructive" className='max-w-lg mx-auto'>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Data</AlertTitle>
            <AlertDescription>Could not load live ghat availability. Please check your internet connection and refresh the page.</AlertDescription>
        </Alert>
      )
  }

  return (
    <Card className="w-full max-w-4xl shadow-2xl rounded-2xl overflow-hidden">
        <div className={cn("grid grid-cols-1", successData ? 'md:grid-cols-3' : 'md:grid-cols-1')}>
            <div className={cn("p-6 sm:p-8 col-span-1", successData ? 'md:col-span-2' : 'md:col-span-1')}>
                 <div className='flex justify-between items-start mb-6 -mt-2'>
                    <div>
                        <h1 className="font-headline text-3xl font-bold text-gray-800">Safe Ghat Slot Booking</h1>
                        <p className="text-muted-foreground mt-1">Book your slot for a safe and divine experience.</p>
                    </div>
                     <div className="text-right">
                        <p className="text-sm font-bold text-gray-600 flex items-center gap-2 justify-end"><Users className="h-4 w-4" /> Total Registered</p>
                        <p className="text-3xl font-bold text-primary">{ghatsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : totalPilgrims}</p>
                    </div>
                </div>


                { (selectedGhat || selectedSlot || form.formState.isDirty) && !successData &&
                    <Button variant="ghost" size="sm" onClick={resetFlow} className="absolute top-4 right-4">Reset</Button>
                }

                {/* Step 1: Date */}
                <div className='space-y-4 mb-6'>
                    <h2 className='text-lg font-semibold flex items-center gap-2'><span className='flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm'>1</span>Select Date</h2>
                     <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full sm:w-[280px] justify-start text-left font-normal border-2",
                              !selectedDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) || date > addDays(new Date(), 60)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                </div>

                {/* Step 2: Ghat */}
                <div className='space-y-4 mb-6'>
                    <h2 className='text-lg font-semibold flex items-center gap-2'><span className='flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm'>2</span>Choose Ghat</h2>
                    <div className='flex flex-wrap gap-3'>
                        {ghats?.map(ghat => {
                            const status = getOverallGhatStatus(ghat);
                            return (
                                <button key={ghat.id} onClick={() => handleGhatSelect(ghat)} disabled={status.disabled} className={cn('p-3 px-4 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed', selectedGhat?.id === ghat.id ? 'border-primary ring-2 ring-primary' : 'border-border hover:border-primary/50')}>
                                    <span className='font-bold'>{ghat.name}</span>
                                    <div className={cn('text-xs font-bold rounded-full px-2 py-0.5 inline-block ml-2', status.color)}>{status.label} Crowd</div>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Step 3: Slot */}
                {selectedGhat && (
                    <div className='space-y-4 mb-8 animate-in fade-in duration-500'>
                        <h2 className='text-lg font-semibold flex items-center gap-2'><span className='flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm'>3</span>Select Time Slot for <span className='text-primary'>{selectedGhat.name}</span></h2>
                        <div className='flex flex-wrap gap-3'>
                            {selectedGhat.timeSlots.map(slot => {
                                const isFull = slot.currentRegistrations >= slot.maxCapacity;
                                return (
                                    <button key={slot.id} onClick={() => handleSlotSelect(slot)} disabled={isFull} className={cn('p-3 px-4 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed', selectedSlot?.id === slot.id ? 'border-primary ring-2 ring-primary' : 'border-border hover:border-primary/50')}>
                                        <span className='font-semibold'>{slot.time}</span>
                                        {isFull && <span className='text-xs text-red-500 ml-2'>(Full)</span>}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}
                
                {/* Step 4: Details & Submit */}
                {selectedSlot && (
                    <div className='animate-in fade-in duration-500'>
                         <h2 className='text-lg font-semibold flex items-center gap-2 mb-4'><span className='flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm'>4</span>Confirm Your Details</h2>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField control={form.control} name="fullName" render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl><Input placeholder="Your full name" {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="mobileNumber" render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>10-digit Mobile Number</FormLabel>
                                    <FormControl><Input placeholder="For confirmation updates" {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="numberOfPeople" render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Number of People</FormLabel>
                                    <FormControl><Input type="number" min="1" max="10" {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}/>
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Registration Failed</AlertTitle>
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}
                                <Button type="submit" size="lg" className="w-full font-bold" disabled={isLoading}>
                                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please Wait...</> : 'Confirm Slot'}
                                </Button>
                            </form>
                        </Form>
                    </div>
                )}

            </div>
            
            {/* --- Confirmation Panel --- */}
            {successData && (
                <div className="p-6 sm:p-8 bg-slate-100 col-span-1 animate-in fade-in duration-500">
                    <div className='text-center'>
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h2 className="font-headline text-2xl font-bold text-gray-800">Booking Confirmed!</h2>
                        <p className="text-muted-foreground mt-1">Scan the QR code at the Ghat entry. A confirmation has been sent to your mobile.</p>

                        <div className='bg-white p-4 rounded-lg my-6 text-center shadow-inner border'>
                           <Image 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${successData.id}`}
                                alt="Booking QR Code"
                                width={150}
                                height={150}
                                className='mx-auto rounded-md'
                           />
                            <p className="text-lg font-bold font-mono tracking-widest text-primary mt-3">{successData.id}</p>
                            <p className="text-xs font-medium text-muted-foreground">Your Unique Registration ID</p>
                        </div>

                        <div className="text-sm space-y-1 text-left bg-white p-4 rounded-lg shadow-inner border">
                           <p><strong className="font-semibold w-24 inline-block">Ghat:</strong> {successData.ghatName}</p>
                           <p><strong className="font-semibold w-24 inline-block">Time Slot:</strong> {successData.timeSlot}</p>
                           <p><strong className="font-semibold w-24 inline-block">Date:</strong> {format(successData.date, "PPP")}</p>
                        </div>
                        
                        <Button variant="outline" className='mt-6 w-full' onClick={resetFlow}>Book Another Slot</Button>
                    </div>
                </div>
            )}
        </div>
    </Card>
  );
}
