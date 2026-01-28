"use client";

import { Button } from "@/components/ui/button";
import type { Ghat, TimeSlot } from "@/lib/types";
import { X } from "lucide-react";

type StickySelectionBarProps = {
    selection: { ghat: Ghat, slot: TimeSlot } | null;
    onClear: () => void;
}

export function StickySelectionBar({ selection, onClear }: StickySelectionBarProps) {
    if (!selection) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-primary text-primary-foreground p-3 sm:p-4 flex justify-center items-center gap-4 z-50 shadow-lg animate-in fade-in slide-in-from-bottom-5">
            <div className="text-center sm:text-left">
                <span className="font-semibold">Selected: </span>
                <span className="font-normal">{selection.ghat.name} | {selection.slot.time}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClear} className="hover:bg-white/20 hover:text-white rounded-full">
                <X className="w-4 h-4 mr-1" />
                Clear
            </Button>
        </div>
    );
}
