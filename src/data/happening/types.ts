export interface HappeningTreeData extends HappeningEventData {
    children?: HappeningTreeData[]
}

export interface HappeningEventData {
    startedAt?: string
    endedAt?: string
    createdAt?: string
}

export interface HappeningData extends HappeningEventData {
    parent?: string
    children?: string[]
}

export interface Happening extends HappeningData {
    happeningId: string
}

export type PartialHappening = HappeningData & Partial<Happening>

export interface HappeningTree extends HappeningEventData {
    happeningId: string;
    parent?: HappeningTree;
    children: HappeningTree[];
}
