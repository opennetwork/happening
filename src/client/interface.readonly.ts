export interface AttendeeData {
    reference: string;
    name?: string;
    email?: string;
}

export interface Attendee extends AttendeeData {
    attendeeId: string;
    createdAt: string;
}

export type PartialAttendee = AttendeeData & Partial<Attendee>;

export type AttendeeAuthorisationType = "attendee";
export type HappeningAuthorisationType = "happening";

export type AuthorisationType = AttendeeAuthorisationType | HappeningAuthorisationType;

export interface AuthorisationData {
    type: AuthorisationType;
    attendeeId?: string;
    happeningId?: string;
    notifications?: AuthorisationNotificationData[];
}

export interface Authorisation extends AuthorisationData {
    authorisationId: string;
    createdAt: string;
    updatedAt: string;
    notifiedAt?: string;
    declinedAt?: string;
    authorisedAt?: string;
}

export type AuthorisationNotificationType = (
    | "payment"
    | "message"
);

export interface AuthorisationNotificationData extends Record<string, unknown> {
    type: AuthorisationNotificationType;
}

export interface AuthorisationNotification extends AuthorisationNotificationData {
    notificationId: string;
    authorisationId: string;
    createdAt: string;
    stateId?: string;
}

export interface Expiring {
    expiresAt?: string;
}

export type HappeningType = "event" | "appointment" | "poll" | "payment" | "bill" | "";

export interface HappeningTreeData extends HappeningEventData {
    attendees?: (string | AttendeeData)[]
    children?: HappeningTreeData[]
}

export interface HappeningEventData {
    startedAt?: string
    endedAt?: string
    createdAt?: string
    type?: HappeningType | string;
    reference?: string;
    url?: string;
}

export interface HappeningData extends HappeningEventData {
    parent?: string
    children?: string[];
    attendees?: string[];
}

export interface Happening extends HappeningData {
    happeningId: string;
    type: HappeningType | string;
}

export type PartialHappening = HappeningData & Partial<Happening>

export interface HappeningTree extends HappeningEventData {
    happeningId: string;
    type: HappeningType | string;
    parent?: HappeningTree;
    children: HappeningTree[];
    attendees: Attendee[];
}

export interface PartnerData extends Record<string, unknown> {
    partnerName: string;
    countryCode?: string; // "NZ"
    location?: string;
    remote?: boolean;
    onsite?: boolean;
    pharmacy?: boolean;
    delivery?: boolean;
    clinic?: boolean;
    website?: string;
}

export interface Partner extends PartnerData {
    partnerId: string;
    accessToken?: string;
    createdAt: string;
    updatedAt: string;
    approved?: boolean;
    approvedAt?: string;
    approvedByUserId?: string;
}

export interface SystemLogData extends Record<string, unknown> {
    uniqueCode?: string;
    value?: number;
    partnerId: string;
    message: string;
    timestamp?: string;
    action?: string;
}

export interface SystemLog extends SystemLogData {
    systemLogId: string;
    timestamp: string;
}