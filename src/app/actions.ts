'use server';

import * as z from 'zod';
import { getGhatByShortName, getGhatsData } from '@/lib/data';
import type { RegistrationPayload } from '@/lib/types';

const findAvailableSlot = async (ghatId: string, numberOfPeople: number) => {
    // In a real app, this would be a complex transaction checking Firestore
    const allGhats = await getGhatsData();
    const ghat = allGhats.find(g => g.id === ghatId);
    if (!ghat) return null;

    const availableSlot = ghat.timeSlots.find(slot => (slot.currentRegistrations + numberOfPeople) <= slot.maxCapacity);
    return availableSlot;
}

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
    const { fullName, mobileNumber, numberOfPeople, date, ghat: ghatShortName } = data;
    
    const ghat = getGhatByShortName(ghatShortName);
    if (!ghat) {
        return { success: false, error: "Selected Ghat not found." };
    }
    
    // Simulate finding a slot.
    const timeSlot = await findAvailableSlot(ghat.id, numberOfPeople);

    if (!timeSlot) {
        return { success: false, error: `No available slots for ${numberOfPeople} people at ${ghat.name}. Please try another Ghat or time.` };
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
        timeSlot: timeSlot.time,
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
            timeSlot: timeSlot.time,
            date: date,
            telegramUrl: telegramUrl,
        }
    };
}
