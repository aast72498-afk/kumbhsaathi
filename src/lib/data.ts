import type { Ghat } from './types';
import { PlaceHolderImages } from './placeholder-images';

const findImage = (id: string) => PlaceHolderImages.find(img => img.id === id);

// Note: shortName for Tapovan changed from TP to TV
const mockGhats: Ghat[] = [
  {
    id: 'ram-kund-ghat',
    name: 'Ram Kund',
    shortName: 'RK',
    imageUrl: findImage('ram-kund')?.imageUrl || '',
    imageHint: findImage('ram-kund')?.imageHint || '',
    timeSlots: [
      { id: 'rk-1', time: '6 AM - 9 AM', maxCapacity: 5000, currentRegistrations: 4500 },
      { id: 'rk-2', time: '9 AM - 12 PM', maxCapacity: 5000, currentRegistrations: 3200 },
      { id: 'rk-3', time: '3 PM - 6 PM', maxCapacity: 4000, currentRegistrations: 3900 },
    ],
  },
  {
    id: 'tapovan-ghat',
    name: 'Tapovan Ghat',
    shortName: 'TV', // Changed from TP
    imageUrl: findImage('tapovan')?.imageUrl || '',
    imageHint: findImage('tapovan')?.imageHint || '',
    timeSlots: [
      { id: 'tp-1', time: '7 AM - 10 AM', maxCapacity: 3000, currentRegistrations: 1500 },
      { id: 'tp-2', time: '10 AM - 1 PM', maxCapacity: 3000, currentRegistrations: 2500 },
    ],
  },
  {
    id: 'laxman-kund-ghat',
    name: 'Laxman Kund',
    shortName: 'LK',
    imageUrl: findImage('laxman-kund')?.imageUrl || '',
    imageHint: findImage('laxman-kund')?.imageHint || '',
    timeSlots: [
      { id: 'lk-1', time: '6:30 AM - 9:30 AM', maxCapacity: 2500, currentRegistrations: 2480 },
      { id: 'lk-2', time: '9:30 AM - 12:30 PM', maxCapacity: 2500, currentRegistrations: 1200 },
      { id: 'lk-3', time: '4 PM - 7 PM', maxCapacity: 2000, currentRegistrations: 1990 },
    ],
  },
];

// This function is now only for getting static options for the dropdown.
// The live data is fetched from Firestore on the client.
export const getGhatsForDropdown = async () => {
    return Promise.resolve(mockGhats.map(ghat => ({
        value: ghat.shortName,
        label: ghat.name,
    })));
};
