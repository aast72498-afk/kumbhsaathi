'use server';

import { 
    doc,
    runTransaction,
    collection,
    addDoc,
    serverTimestamp,
    getDocs,
    writeBatch,
    query,
    limit,
    where,
    DocumentReference,
    DocumentData
} from 'firebase/firestore';
import { getFirebaseServer } from '@/firebase/server';
import type { RegistrationPayload, Ghat } from '@/lib/types';
import { mockGhats } from '@/lib/data';

// --- Database Seeding Action ---
export async function seedDatabase() {
    const { firestore } = getFirebaseServer();
    const ghatsRef = collection(firestore, "ghats");
    
    const q = query(ghatsRef, limit(1));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
        console.log("Ghats collection is empty. Seeding database...");
        try {
            const batch = writeBatch(firestore);
            mockGhats.forEach((ghat) => {
                // Use the predefined ID for the document
                const docRef = doc(firestore, "ghats", ghat.id);
                batch.set(docRef, ghat);
            });
            await batch.commit();
            console.log("Database seeded successfully.");
        } catch (error) {
            console.error("Error seeding database:", error);
            // We might want to throw here to indicate a critical startup failure
        }
    }
}


const generateRandomChars = (length: number) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// --- Webhook Configuration ---
const WEBHOOK_URL = 'https://unarrestive-unpotently-glenda.ngrok-free.dev/webhook/d7bc3369-b741-4d56-98df-9b6a9f9f454e';

async function sendWebhook(payload: object) {
    console.log("Sending webhook to:", WEBHOOK_URL);
    console.log("Webhook payload:", JSON.stringify(payload, null, 2));
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            console.error("Webhook notification failed with status:", response.status, await response.text());
        } else {
            console.log("Webhook sent successfully.");
        }
    } catch (error) {
        console.error("Webhook call failed:", error);
    }
}


// --- Pilgrim Registration Action ---
export async function registerPilgrim(data: RegistrationPayload) {
    const { firestore } = getFirebaseServer();
    const { fullName, mobileNumber, numberOfPeople, date, ghat: ghatShortName, timeSlot } = data;
    
    if (!fullName || !mobileNumber || !numberOfPeople || !date || !ghatShortName || !timeSlot) {
         return { success: false, error: "Missing required registration details." };
    }

    const ghatsRef = collection(firestore, "ghats");
    const q = query(ghatsRef, where("shortName", "==", ghatShortName), limit(1));
    
    try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return { success: false, error: "Configuration error: Selected Ghat could not be found." };
        }
        const ghatDocRef = querySnapshot.docs[0].ref;

        // Transaction to ensure atomic update
        const resultData = await runTransaction(firestore, async (transaction) => {
            const ghatDoc = await transaction.get(ghatDocRef);
            
            if (!ghatDoc.exists()) {
                throw new Error("Database inconsistency: Ghat document not found within transaction.");
            }
            
            const ghatData = ghatDoc.data() as Ghat;

            const slotIndex = ghatData.timeSlots.findIndex(s => s.time === timeSlot);
            if (slotIndex === -1) {
                throw new Error("Selected time slot is no longer available or valid.");
            }

            const selectedSlot = ghatData.timeSlots[slotIndex];
            const numericNumberOfPeople = Number(numberOfPeople);
            if ((selectedSlot.currentRegistrations + numericNumberOfPeople) > selectedSlot.maxCapacity) {
                throw new Error(`The selected slot at ${ghatData.name} is now full or has insufficient capacity for ${numericNumberOfPeople} people. Please try another.`);
            }

            const uniqueId = `KM-27-${ghatData.shortName}-${generateRandomChars(4)}`;

            const registrationData = {
                id: uniqueId,
                fullName,
                mobileNumber,
                numberOfPeople: numericNumberOfPeople,
                date: date.toISOString(),
                ghatId: ghatDoc.id,
                ghatName: ghatData.name,
                timeSlot: timeSlot,
                createdAt: serverTimestamp()
            };
            const newRegistrationRef = doc(collection(firestore, "registrations"));
            transaction.set(newRegistrationRef, registrationData);

            const updatedTimeSlots = [...ghatData.timeSlots];
            updatedTimeSlots[slotIndex] = {
                ...updatedTimeSlots[slotIndex],
                currentRegistrations: updatedTimeSlots[slotIndex].currentRegistrations + numericNumberOfPeople
            };

            transaction.update(ghatDocRef, { timeSlots: updatedTimeSlots });

            return { uniqueId, ghatName: ghatData.name, fullName, numberOfPeople: numericNumberOfPeople };
        });
        
        console.log("Registration transaction successful.");
        
        // Send webhook after successful registration
        await sendWebhook({
            name: fullName,
            mobile: mobileNumber,
            ghat: resultData.ghatName,
            slot: timeSlot,
            ticketID: resultData.uniqueId
        });

        return {
            success: true,
            data: {
                id: resultData.uniqueId,
                ghatName: resultData.ghatName,
                timeSlot: timeSlot,
                date: date,
                fullName: resultData.fullName,
                numberOfPeople: resultData.numberOfPeople,
            }
        };

    } catch (e: any) {
        console.error("Registration Failed:", e);
        return { success: false, error: e.message || "An error occurred during registration. Please try again." };
    }
}
