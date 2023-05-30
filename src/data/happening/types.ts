import {Attendee, AttendeeData} from "../attendee";

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
