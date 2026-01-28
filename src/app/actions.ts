'use server';

import { 
    doc,
    runTransaction,
    collection,
    addDoc,
    serverTimestamp,
    DocumentReference,
    DocumentData
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import type { RegistrationPayload, Ghat, TimeSlot } from '@/lib/types';


const generateRandomChars = (length: number) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

const WEBHOOK_URL = 'https://unarrestive-unpotently-glenda.ngrok-free.dev/webhook/d7bc3369-b741-4d56-98df-9b6a9f9f454e';

async function sendWebhook(payload: object) {
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            console.error("Webhook failed with status:", response.status, await response.text());
        }
    } catch (error) {
        console.error("Failed to send webhook:", error);
        // Don't block the user flow if webhook fails
    }
}


export async function registerPilgrim(data: RegistrationPayload) {
    const { firestore } = initializeFirebase();
    const { fullName, mobileNumber, numberOfPeople, date, ghat: ghatShortName, timeSlot } = data;
    
    // Server-side validation
    if (!fullName || !mobileNumber || !numberOfPeople || !date || !ghatShortName || !timeSlot) {
         return { success: false, error: "Missing required registration details." };
    }

    try {
        const resultData = await runTransaction(firestore, async (transaction) => {
            // There is no ghatId in the payload, so we need to get it from the shortName
            const ghatQuerySnapshot = await transaction.get(collection(firestore, "ghats"));
            const ghatDoc = ghatQuerySnapshot.docs.find(d => d.data().shortName === ghatShortName);
            
            if (!ghatDoc) {
                throw new Error("Selected Ghat not found.");
            }
            
            const ghatRef = ghatDoc.ref;
            const ghatData = ghatDoc.data() as Ghat;
            const ghatId = ghatDoc.id;

            // Find the selected time slot and check capacity
            const slotIndex = ghatData.timeSlots.findIndex(s => s.time === timeSlot);
            if (slotIndex === -1) {
                throw new Error("Selected time slot not found for this Ghat.");
            }

            const selectedSlot = ghatData.timeSlots[slotIndex];
            if ((selectedSlot.currentRegistrations + numberOfPeople) > selectedSlot.maxCapacity) {
                throw new Error(`The selected slot at ${ghatData.name} is now full or has insufficient capacity. Please try another.`);
            }

            // Generate Unique ID
            const uniqueId = `KM-27-${ghatData.shortName}-${generateRandomChars(4)}`;

            // 1. Create a new registration document
            const registrationData = {
                id: uniqueId,
                fullName,
                mobileNumber,
                numberOfPeople,
                date: date,
                ghatId: ghatId,
                ghatName: ghatData.name,
                timeSlot: timeSlot,
                createdAt: serverTimestamp()
            };
            transaction.set(doc(collection(firestore, "registrations")), registrationData);


            // 2. Update the ghat's timeslot registrations
            const updatedTimeSlots = [...ghatData.timeSlots];
            updatedTimeSlots[slotIndex] = {
                ...updatedTimeSlots[slotIndex],
                currentRegistrations: updatedTimeSlots[slotIndex].currentRegistrations + numberOfPeople
            };

            transaction.update(ghatRef, { timeSlots: updatedTimeSlots });

            return { uniqueId, ghatName: ghatData.name };
        });
        
        // Transaction successful, now send webhook
        await sendWebhook({
            name: fullName,
            mobile: mobileNumber,
            ghat: resultData.ghatName,
            slot: timeSlot,
            ticketID: resultData.uniqueId
        });

        // Simulate Telegram link for the success dialog
        const telegramBotUsername = "KumbhSaathiOfficialBot"; // Placeholder
        const telegramUrl = `https://t.me/${telegramBotUsername}?start=${resultData.uniqueId}`;

        return {
            success: true,
            data: {
                id: resultData.uniqueId,
                ghatName: resultData.ghatName,
                timeSlot: timeSlot,
                date: date,
                telegramUrl: telegramUrl,
            }
        };

    } catch (e: any) {
        console.error("Registration Transaction Failed:", e);
        return { success: false, error: e.message || "An error occurred during registration. Please try again." };
    }
}
