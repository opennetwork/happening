# Boilerplate - Node & JavaScript implementation

## Boilerplate setup

Main change to make is to replace any mention of "boilerplate" in [package.json](./package.json), and 
deleting the `"private": true,` line to enable publishing 

[//]: # (badges)

### Support

 ![Node.js supported](https://img.shields.io/badge/node-%3E%3D18.7.0-blue) 

### Test Coverage

 ![90.51%25 lines covered](https://img.shields.io/badge/lines-90.51%25-brightgreen) ![90.51%25 statements covered](https://img.shields.io/badge/statements-90.51%25-brightgreen) ![80.24%25 functions covered](https://img.shields.io/badge/functions-80.24%25-brightgreen) ![85.22%25 branches covered](https://img.shields.io/badge/branches-85.22%25-brightgreen)

[//]: # (badges)

### Client's TypeScript Interface

[//]: # (typescript client)

```typescript
export interface ClientOptions {
    partnerId?: string;
    accessToken?: string;
    version?: number;
    prefix?: string;
    url?: string | URL;
}

export interface Client {
    addPartner(partner: PartnerData): Promise<Partner>;
    listPartners(): Promise<Partner[]>;
    listSystemLogs(): Promise<SystemLog[]>;
    background(query: Record<string, string> | URLSearchParams): Promise<void>;
}

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
```

[//]: # (typescript client)