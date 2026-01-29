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
  timeSlot: string;
};

export type MissingPersonReportPayload = {
    missingPersonName: string;
    missingPersonMobile?: string;
    reporterContact: string;
    lastSeenGhat: string;
    detailedLocation: string;
    description: string;
    photoUrl?: string;
};

export type MissingPersonReport = MissingPersonReportPayload & {
    caseId: string;
    status: 'Pending' | 'Under Investigation' | 'Found';
    createdAt: any; // Firestore Timestamp
};

export type HealthEmergencyPayload = {
    issueType: string;
    location: string;
    details?: string;
};

export type HealthEmergencyAlert = HealthEmergencyPayload & {
    status: 'Pending' | 'Responded';
    createdAt: any; // Firestore Timestamp
};
