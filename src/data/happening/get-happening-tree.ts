import {Happening, HappeningTree} from "./types";
import {getHappening} from "./get-happening";
import {ok} from "../../is";

interface GetHappeningTreeContext {
    trees: Map<string, HappeningTree>;
    store?: Map<string, Happening>;
}

export function createGetHappeningTreeContext(happenings?: Happening[]): GetHappeningTreeContext {
    return {
        trees: new Map(),
        store: happenings ?
            new Map(happenings.map(value => [value.happeningId, value])) :
            undefined
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

    const happening = await get(happeningId);
    ok(happening, `Expected happening ${happeningId} to exist`);

    const { parent, children, ...data } = happening;

    const instance: HappeningTree = {
        happeningId,
        ...data,
        children: []
    };

    // Put the instance in the memory cache so
    // it's object reference is used when
    context.trees.set(happeningId, instance);

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

    async function get(happeningId: string) {
        const existing = context.store?.get(happeningId);
        if (existing) return existing;
        return getHappening(happeningId);
    }
}