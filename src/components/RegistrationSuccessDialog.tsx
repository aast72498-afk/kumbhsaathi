"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

type SuccessDetails = {
    id: string;
    ghatName: string;
    timeSlot: string;
    date: Date;
    telegramUrl: string;
}

type DialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    details: SuccessDetails;
}

export function RegistrationSuccessDialog({ open, onOpenChange, details }: DialogProps) {
    const { toast } = useToast();
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText(details.id);
        toast({
            title: "Copied to Clipboard!",
            description: "Your registration ID has been copied.",
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-background border-primary">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl font-headline text-primary">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                        Registration Successful!
                    </DialogTitle>
                    <DialogDescription className="pt-2 text-muted-foreground">
                        Your slot has been booked. Please find your registration details below.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="bg-secondary p-4 rounded-lg text-center border">
                        <p className="text-sm font-medium text-muted-foreground">Your Unique Registration ID</p>
                        <div className="flex items-center justify-center gap-2 mt-2">
                             <p className="text-2xl font-bold font-mono tracking-widest text-accent">{details.id}</p>
                             <Button variant="ghost" size="icon" onClick={copyToClipboard} aria-label="Copy ID">
                                <Copy className="h-5 w-5"/>
                             </Button>
                        </div>
                    </div>
                    <div className="text-sm space-y-2 text-foreground p-4 bg-secondary rounded-lg border">
                       <p><strong className="font-semibold w-20 inline-block">Ghat:</strong> {details.ghatName}</p>
                       <p><strong className="font-semibold w-20 inline-block">Time Slot:</strong> {details.timeSlot}</p>
                       <p><strong className="font-semibold w-20 inline-block">Date:</strong> {format(details.date, "PPP")}</p>
                    </div>
                </div>
                <DialogFooter className="sm:justify-center">
                    <Button asChild size="lg" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold gap-2">
                        <a href={details.telegramUrl} target="_blank" rel="noopener noreferrer">
                           <Send className="h-4 w-4" />
                           Get Ticket on Telegram
                        </a>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
