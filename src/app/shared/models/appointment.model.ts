export interface Appointment {
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
