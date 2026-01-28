'use server';

import * as z from 'zod';
import { getGhatByShortName, getGhatsData } from '@/lib/data';
import type { RegistrationPayload } from '@/lib/types';

const generateRandomChars = (length: number) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

export async function registerPilgrim(data: RegistrationPayload) {
    // Schema is defined in the form, but we can re-validate here for safety
    const { fullName, mobileNumber, numberOfPeople, date, ghat: ghatShortName, timeSlot } = data;
    
    const ghat = getGhatByShortName(ghatShortName);
    if (!ghat) {
        return { success: false, error: "Selected Ghat not found." };
    }
    
    // The user has selected a time slot. Find it and check if it's available.
    const selectedSlot = ghat.timeSlots.find(s => s.time === timeSlot);

    if (!selectedSlot) {
        return { success: false, error: "Selected time slot not found." };
    }

    // In a real app, this check would be a transaction.
    // We refetch the data to get the most "live" numbers for this simulation.
    const allGhats = await getGhatsData();
    const liveGhat = allGhats.find(g => g.id === ghat.id);
    const liveSlot = liveGhat?.timeSlots.find(s => s.id === selectedSlot.id);
    const capacityCheck = liveSlot ? liveSlot.currentRegistrations : selectedSlot.currentRegistrations;


    if (!liveSlot || (capacityCheck + numberOfPeople) > selectedSlot.maxCapacity) {
        return { success: false, error: `The selected slot at ${ghat.name} is now full or has insufficient capacity. Please try another.` };
    }

    // Generate Unique ID
    const uniqueId = `KM-27-${ghat.shortName}-${generateRandomChars(4)}`;

    // Simulate saving to Firestore
    console.log("Saving to DB:", {
        id: uniqueId,
        fullName,
        mobileNumber,
        numberOfPeople,
        date: date.toISOString(),
        ghatId: ghat.id,
        ghatName: ghat.name,
        timeSlot: selectedSlot.time,
        createdAt: new Date().toISOString()
    });

    // Simulate Telegram link
    const telegramBotUsername = "KumbhSaathiOfficialBot"; // Placeholder
    const telegramUrl = `https://t.me/${telegramBotUsername}?start=${uniqueId}`;

    return {
        success: true,
        data: {
            id: uniqueId,
            ghatName: ghat.name,
            timeSlot: selectedSlot.time,
            date: date,
            telegramUrl: telegramUrl,
        }
    };
}
