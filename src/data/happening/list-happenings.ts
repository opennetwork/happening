import {getHappeningStore} from "./store";
import {createGetHappeningTreeContext} from "./get-happening-tree";

export function listHappenings() {
    const store = getHappeningStore();
    return store.values(); // TODO filter
}