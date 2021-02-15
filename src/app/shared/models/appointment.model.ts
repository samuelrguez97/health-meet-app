export interface Appointment {
  key?: string;
  userUid: string;
  userNif?: string;
  physioUid: string;
  beginDate: string;
  endDate: string;
  eventId: string;
  type: string;
  therapy: string;
  pain: string;
}
