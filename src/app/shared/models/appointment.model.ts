export interface Appointment {
  key?: string;
  userUid: string;
  userNif?: string;
  userName?: string;
  physioUid: string;
  date: string;
  beginDate: string;
  endDate: string;
  eventId: string;
  type: string;
  therapy: string;
  pain: string;
}
