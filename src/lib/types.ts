export type TimeSlot = {
  id: string;
  time: string;
  maxCapacity: number;
  currentRegistrations: number;
};

export type Ghat = {
  id: string;
  name: string;
  shortName: string;
  imageUrl: string;
  imageHint: string;
  timeSlots: TimeSlot[];
};

export type RegistrationPayload = {
  fullName: string;
  mobileNumber: string;
  numberOfPeople: number;
  date: Date;
  ghat: string; // This will be the shortName
};
