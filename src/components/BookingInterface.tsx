'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection } from 'firebase/firestore';
import { format, addDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';

import { useCollection, useFirestore, useAuth, useMemoFirebase } from '@/firebase';
import { registerPilgrim } from '@/app/actions';
import type { Ghat, TimeSlot, RegistrationPayload } from '@/lib/types';
import { cn } from '@/lib/utils';
import BookingInterfaceSkeleton from '@/components/BookingInterfaceSkeleton';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Calendar as CalendarIcon, Loader2, CheckCircle, AlertCircle, Users, Download, QrCode } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

// --- Schema for the form ---
const bookingSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters."),
  mobileNumber: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit mobile number."),
  numberOfPeople: z.coerce.number().min(1, "At least one person is required.").max(10, "Maximum 10 people per registration."),
});
type BookingFormValues = z.infer<typeof bookingSchema>;

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

// Success data type
type SuccessData = {
    id: string;
    ghatName: string;
    timeSlot: string;
    date: Date;
    fullName: string;
    numberOfPeople: number;
}

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

// --- Main Booking Component ---
export default function BookingInterface() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedGhat, setSelectedGhat] = useState<Ghat | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);

  // OTP State
  const auth = useAuth();
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);


  const ticketRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // --- Firestore Data Fetching ---
  const firestore = useFirestore();
  const ghatsCollection = useMemoFirebase(() => (firestore ? collection(firestore, 'ghats') : null), [firestore]);
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

  useEffect(() => {
    if (auth && !ghatsLoading && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
  }, [auth, ghatsLoading]);

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
    setOtpSent(false);
    setOtp('');
    setConfirmationResult(null);
  }

  // --- Download Ticket Logic ---
  const handleDownloadTicket = () => {
    if (ticketRef.current) {
        html2canvas(ticketRef.current, {
            useCORS: true,
            backgroundColor: null, // transparent background for the canvas
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `KumbhSaathi-Ticket-${successData?.id}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    }
  };

  const handleSendOtp = async (data: BookingFormValues) => {
    setIsLoading(true);
    setError(null);
    if (!auth) {
        setError("Authentication service is not available.");
        setIsLoading(false);
        return;
    }
    const appVerifier = window.recaptchaVerifier;
    const phoneNumber = "+91" + data.mobileNumber;
    try {
        const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
        setConfirmationResult(result);
        setOtpSent(true);
        toast({ title: "OTP Sent", description: `An OTP has been sent to ${phoneNumber}.` });
    } catch (e: any) {
        setError(`Failed to send OTP: ${e.message}`);
        console.error("OTP Send Error:", e);
    } finally {
        setIsLoading(false);
    }
  };

  const handleVerifyAndBook = async () => {
    if (!confirmationResult || otp.length !== 6) {
        setError("Please enter a valid 6-digit OTP.");
        return;
    }
    setIsVerifying(true);
    setError(null);
    try {
        await confirmationResult.confirm(otp);
        // OTP is correct, now submit the booking
        await processBooking(form.getValues());
    } catch (e: any) {
        setError("Invalid or expired OTP. Please try again.");
        console.error("OTP Verification Error:", e);
    } finally {
        setIsVerifying(false);
    }
  }

  // --- Form Submission Logic ---
  async function processBooking(data: BookingFormValues) {
    if (!selectedDate || !selectedGhat || !selectedSlot) {
      setError("Please complete all steps before confirming.");
      return;
    }
    
    // Use isVerifying state for the final booking process
    setIsVerifying(true);
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
        setSuccessData(result.data as SuccessData);
      } else {
        setError(result.error || "An unknown error occurred.");
      }
    } catch (e: any) {
      setError("Failed to connect to the server. Please try again.");
    } finally {
      setIsVerifying(false);
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
    return <BookingInterfaceSkeleton />;
  }
  
  if (ghatsError) {
      return (
        <Alert variant="destructive" className='max-w-lg mx-auto bg-white/50 backdrop-blur-sm'>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Data</AlertTitle>
            <AlertDescription>Could not load live ghat availability. Please check your internet connection and refresh the page.</AlertDescription>
        </Alert>
      )
  }

  const motionProps = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  };

  return (
    <Card className="w-full max-w-4xl shadow-2xl rounded-2xl overflow-hidden bg-white/30 backdrop-blur-lg border-white/20">
        <div id="recaptcha-container"></div>
        <div className={cn("grid grid-cols-1", successData ? 'md:grid-cols-3' : 'md:grid-cols-1')}>
            <div className={cn("p-6 sm:p-8 col-span-1", successData ? 'md:col-span-2' : 'md:col-span-1')}>
                 <div className='flex justify-between items-start mb-6 -mt-2'>
                    <div>
                        <h1 className="font-headline text-3xl font-bold text-gray-800">Safe Ghat Slot Booking</h1>
                        <p className="text-muted-foreground mt-1">Book your slot for a safe and divine experience.</p>
                    </div>
                     <div className="text-right">
                        <p className="text-sm font-bold text-gray-600 flex items-center gap-2 justify-end"><Users className="h-4 w-4" /> Total Registered</p>
                        <p className="text-3xl font-bold text-primary">{totalPilgrims}</p>
                    </div>
                </div>

                <AnimatePresence>
                { (selectedGhat || selectedSlot || form.formState.isDirty) && !successData &&
                    <motion.div key="resetButton" {...motionProps}>
                      <Button variant="ghost" size="sm" onClick={resetFlow} className="absolute top-4 right-4">Reset</Button>
                    </motion.div>
                }
                </AnimatePresence>

                {/* Step 1: Date */}
                <div className='space-y-4 mb-6'>
                    <h2 className='text-lg font-semibold flex items-center gap-2'><span className='flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm'>1</span>Select Date</h2>
                     <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full sm:w-[280px] justify-start text-left font-normal border-2 bg-white/50",
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
                                <button key={ghat.id} onClick={() => handleGhatSelect(ghat)} disabled={status.disabled} className={cn('p-3 px-4 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white/30', selectedGhat?.id === ghat.id ? 'border-primary ring-2 ring-primary' : 'border-border hover:border-primary/50')}>
                                    <span className='font-bold'>{ghat.name}</span>
                                    <div className={cn('text-xs font-bold rounded-full px-2 py-0.5 inline-block ml-2', status.color)}>{status.label} Crowd</div>
                                </button>
                            )
                        })}
                    </div>
                </div>
                
                <AnimatePresence>
                {/* Step 3: Slot */}
                {selectedGhat && (
                    <motion.div key="step3" {...motionProps} className='space-y-4 mb-8'>
                        <h2 className='text-lg font-semibold flex items-center gap-2'><span className='flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm'>3</span>Select Time Slot for <span className='text-primary'>{selectedGhat.name}</span></h2>
                        <div className='flex flex-wrap gap-3'>
                            {selectedGhat.timeSlots.map(slot => {
                                const isFull = slot.currentRegistrations >= slot.maxCapacity;
                                return (
                                    <button key={slot.id} onClick={() => handleSlotSelect(slot)} disabled={isFull} className={cn('p-3 px-4 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white/30', selectedSlot?.id === slot.id ? 'border-primary ring-2 ring-primary' : 'border-border hover:border-primary/50')}>
                                        <span className='font-semibold'>{slot.time}</span>
                                        {isFull && <span className='text-xs text-red-500 ml-2'>(Full)</span>}
                                    </button>
                                )
                            })}
                        </div>
                    </motion.div>
                )}
                
                {/* Step 4: Details & Submit */}
                {selectedSlot && (
                    <motion.div key="step4" {...motionProps}>
                         <h2 className='text-lg font-semibold flex items-center gap-2 mb-4'><span className='flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm'>4</span>Confirm Your Details</h2>
                        <Form {...form}>
                            <form className="space-y-4">
                                <FormField control={form.control} name="fullName" render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl><Input placeholder="Your full name" {...field} className="bg-white/50" /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="mobileNumber" render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>10-digit Mobile Number</FormLabel>
                                    <FormControl><Input placeholder="For confirmation updates" {...field} className="bg-white/50"/></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="numberOfPeople" render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Number of People</FormLabel>
                                    <FormControl><Input type="number" min="1" max="10" {...field} className="bg-white/50"/></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}/>
                                
                                {!otpSent ? (
                                    <>
                                        <Button type="button" size="lg" className="w-full font-bold" onClick={form.handleSubmit(handleSendOtp)} disabled={isLoading}>
                                            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending OTP...</> : 'Confirm and Send OTP'}
                                        </Button>
                                    </>
                                ) : (
                                    <div className="space-y-4 pt-4 border-t-2 border-dashed">
                                        <p className="text-center text-sm text-muted-foreground">An OTP has been sent to {form.getValues('mobileNumber')}.</p>
                                        <FormField control={form.control} name="mobileNumber" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Enter 6-Digit OTP</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        id="otp"
                                                        value={otp}
                                                        onChange={(e) => setOtp(e.target.value)}
                                                        placeholder="______"
                                                        maxLength={6}
                                                        className="bg-white/50 text-center text-2xl font-bold tracking-[0.5em]"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )} />
                                        <Button type="button" size="lg" className="w-full font-bold" onClick={handleVerifyAndBook} disabled={isVerifying || !otp || otp.length < 6}>
                                            {isVerifying ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying & Booking...</> : 'Verify OTP & Confirm Slot'}
                                        </Button>
                                    </div>
                                )}
                                {error && (
                                    <Alert variant="destructive" className="mt-4">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>An Error Occurred</AlertTitle>
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}
                            </form>
                        </Form>
                    </motion.div>
                )}
                </AnimatePresence>

            </div>
            
            <AnimatePresence>
            {/* --- Confirmation Panel --- */}
            {successData && (
                <motion.div 
                  key="confirmationPanel"
                  className="p-6 sm:p-8 bg-slate-100/80 col-span-1 flex flex-col justify-between"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                    <Confetti recycle={false} numberOfPieces={500} tweenDuration={10000} />
                    <div className='text-center'>
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h2 className="font-headline text-2xl font-bold text-gray-800">Booking Confirmed!</h2>
                        <p className="text-muted-foreground mt-1 mb-6">Your digital ticket is ready. Please download it for entry.</p>

                        {/* --- Digital Ticket --- */}
                        <div ref={ticketRef} className='bg-white p-4 rounded-lg text-center shadow-lg border-2 border-accent relative overflow-hidden'>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-7xl font-bold text-gray-200/50 -rotate-45 select-none font-headline">Jai Gange</span>
                            </div>
                           <div className="relative z-10">
                             <div className='flex items-center justify-between mb-3 border-b-2 border-dashed pb-3'>
                                <h3 className='font-headline text-lg font-bold text-accent'>Kumbh Mela Entry Pass</h3>
                                <QrCode className="h-6 w-6 text-accent"/>
                             </div>
                             <div className='p-2 bg-gray-100 rounded-md inline-block'>
                                <QRCode value={successData.id} size={128} bgColor="#f3f4f6" fgColor="#111827" />
                             </div>
                            <p className="text-lg font-bold font-mono tracking-widest text-primary mt-2">{successData.id}</p>
                            <div className="text-sm space-y-1 text-left bg-white p-3 rounded-lg mt-4 border">
                               <p><strong className="font-semibold w-24 inline-block">Name:</strong> {successData.fullName}</p>
                               <p><strong className="font-semibold w-24 inline-block">Pilgrims:</strong> {successData.numberOfPeople}</p>
                               <p><strong className="font-semibold w-24 inline-block">Ghat:</strong> {successData.ghatName}</p>
                               <p><strong className="font-semibold w-24 inline-block">Time Slot:</strong> {successData.timeSlot}</p>
                               <p><strong className="font-semibold w-24 inline-block">Date:</strong> {format(successData.date, "PPP")}</p>
                            </div>
                           </div>
                        </div>
                    </div>
                    <div className='mt-6 space-y-2'>
                        <Button size="lg" className='w-full' onClick={handleDownloadTicket}>
                            <Download className="mr-2 h-4 w-4"/>
                            Download Digital Ticket
                        </Button>
                        <Button variant="outline" className='w-full' onClick={resetFlow}>Book Another Slot</Button>
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    </Card>
  );
}
