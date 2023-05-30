export interface Expiring {
    expiresAt?: string;
}

export type HappeningType = "event" | "appointment" | "poll";

export interface HappeningTreeData extends HappeningEventData {
    children?: HappeningTreeData[]
}

export interface HappeningEventData {
    startedAt?: string
    endedAt?: string
    createdAt?: string
    type?: HappeningType | string
}

export interface HappeningData extends HappeningEventData {
    parent?: string
    children?: string[]
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