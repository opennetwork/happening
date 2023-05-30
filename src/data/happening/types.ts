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
