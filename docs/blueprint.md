# **App Name**: KumbhSaathi

## Core Features:

- Pilgrim Registration: Allow pilgrims to register for specific time slots at various Ghats with necessary personal details and number of attendees.
- Live Slot Tracker: Display a grid showing Ghats and time slots with live status (Available, Filling Fast, Full) based on real-time Firestore data.
- Unique ID Generation: Generate a unique confirmation code upon successful registration in the format KM-27-[GhatShortName]-[4RandomChars].
- Telegram Confirmation: Send a confirmation message to the user's Telegram via a cloud function, including the Unique ID and slot time.
- Real-time Availability: Maintain a 'Ghats' collection in Firestore, monitoring slot capacities to update slot statuses automatically.
- Live counter: Keep a live total of registered pilgrims on the hero section.

## Style Guidelines:

- Primary color: Saffron (#FF9933) to evoke energy and devotion.
- Secondary color: River Blue (#005A9C) for water and Ghat elements.
- Background color: Light Cream (#FFF5E1) for an easy-on-the-eyes experience.
- Headline font: 'Lora' serif for a traditional touch.
- Body font: 'Poppins' sans-serif for a modern look.
- Utilize high-quality devotional icons such as lotus, temple bell, and river waves.
- Implement a single-page application (SPA) layout with a sticky header.