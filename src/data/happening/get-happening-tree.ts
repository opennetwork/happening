import {Happening, HappeningTree} from "./types";
import {getHappening} from "./get-happening";
import {ok} from "../../is";
import {Attendee, getAttendee} from "../attendee";

interface GetHappeningTreeContext {
    trees: Map<string, HappeningTree>;
    store?: Map<string, Happening>;
    attendees: Map<string, Attendee>;
}

export function createGetHappeningTreeContext(happenings?: Happening[], attendees?: Attendee[]): GetHappeningTreeContext {
    return {
        trees: new Map(),
        store: happenings ?
            new Map(happenings.map(value => [value.happeningId, value])) :
            undefined,
        attendees: attendees ?
            new Map(attendees.map(value => [value.attendeeId, value])) :
            new Map(),
    };
}

export async function getTopHappeningTree(happeningId: string): Promise<HappeningTree> {
    const tree = await getHappeningTree(happeningId);
    const parent = getParent(tree);
    return getWithoutParent(parent);

    function getWithoutParent(tree: HappeningTree): HappeningTree {
        return {
            ...tree,
            parent: undefined,
            children: tree.children.map(getWithoutParent)
        }
    }

    function getParent(tree: HappeningTree): HappeningTree {
        const { parent } = tree;
        if (!parent) return tree;
        return getParent(parent)
    }
}

export async function getHappeningTree(happeningId: string, context = createGetHappeningTreeContext()): Promise<HappeningTree> {
    const existing = context.trees.get(happeningId);
    if (existing) return existing;

    const happening = await getCachedHappening(happeningId);
    ok(happening, `Expected happening ${happeningId} to exist`);

    const { attendees, parent, children, ...data } = happening;

    const instance: HappeningTree = {
        happeningId,
        ...data,
        children: [],
        attendees: []
    };

    // Put the instance in the memory cache so
    // it's object reference is used when
    context.trees.set(happeningId, instance);

    if (attendees?.length) {
        instance.attendees = (
            await Promise.all(
                attendees.map(
                    attendee => getCachedAttendee(attendee)
                )
            )
        );
    }

    // When getting the children trees, they will reference the parent using the above
    if (children?.length) {
        instance.children = await Promise.all(
            children.map(
                child => getHappeningTree(child, context)
            )
        );
    }

    if (parent) {
        instance.parent = await getHappeningTree(parent, context)
    }

    return instance;

    async function getCachedHappening(happeningId: string) {
        const existing = context.store?.get(happeningId);
        if (existing) return existing;
        return getHappening(happeningId);
    }

    async function getCachedAttendee(attendeeId: string) {
        const existing = context.attendees.get(attendeeId);
        if (existing) return existing;
        const value = await getAttendee(attendeeId);
        ok(value, `Expected to find attendee ${attendeeId}`);
        context.attendees.set(attendeeId, value);
        return value;
    }
}