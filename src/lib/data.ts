import type { Ghat } from './types';
import { PlaceHolderImages } from './placeholder-images';

const findImage = (id: string) => PlaceHolderImages.find(img => img.id === id);

// This data is used to seed the database on the first app load.
export const mockGhats: Ghat[] = [
  {
    id: 'ram-kund-ghat',
    name: 'Ram Kund',
    shortName: 'RK',
    imageUrl: findImage('ram-kund')?.imageUrl || 'https://picsum.photos/seed/ramkund/600/400',
    imageHint: findImage('ram-kund')?.imageHint || 'ghat temple',
    timeSlots: [
      { id: 'rk-1', time: '6:30 AM - 9:30 AM', maxCapacity: 100, currentRegistrations: 0 },
      { id: 'rk-2', time: '9:30 AM - 12:30 PM', maxCapacity: 100, currentRegistrations: 0 },
      { id: 'rk-3', time: '4:00 PM - 7:00 PM', maxCapacity: 100, currentRegistrations: 0 },
    ],
  },
  {
    id: 'tapovan-ghat',
    name: 'Tapovan Ghat',
    shortName: 'TV',
    imageUrl: findImage('tapovan')?.imageUrl || 'https://picsum.photos/seed/tapovan/600/400',
    imageHint: findImage('tapovan')?.imageHint || 'river forest',
    timeSlots: [
      { id: 'tp-1', time: '6:30 AM - 9:30 AM', maxCapacity: 100, currentRegistrations: 0 },
      { id: 'tp-2', time: '9:30 AM - 12:30 PM', maxCapacity: 100, currentRegistrations: 0 },
      { id: 'tp-3', time: '4:00 PM - 7:00 PM', maxCapacity: 100, currentRegistrations: 0 },
    ],
  },
  {
    id: 'laxman-kund-ghat',
    name: 'Laxman Kund',
    shortName: 'LK',
    imageUrl: findImage('laxman-kund')?.imageUrl || 'https://picsum.photos/seed/laxmankund/600/400',
    imageHint: findImage('laxman-kund')?.imageHint || 'ghat river',
    timeSlots: [
      { id: 'lk-1', time: '6:30 AM - 9:30 AM', maxCapacity: 100, currentRegistrations: 0 },
      { id: 'lk-2', time: '9:30 AM - 12:30 PM', maxCapacity: 100, currentRegistrations: 0 },
      { id: 'lk-3', time: '4:00 PM - 7:00 PM', maxCapacity: 100, currentRegistrations: 0 },
    ],
  },
];

// This function is for getting static options for the dropdown.
export const getGhatsForDropdown = async () => {
    return Promise.resolve(mockGhats.map(ghat => ({
        value: ghat.shortName,
        label: ghat.name,
    })));
};
