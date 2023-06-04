import {getHappeningStore} from "./store";
import {createGetHappeningTreeContext, getHappeningTree} from "./get-happening-tree";
import {listHappenings} from "./list-happenings";
import {getAttendee} from "../attendee";

export async function listHappeningTrees() {
    const happenings = await listHappenings();
    const attendeeIds = [...new Set(happenings.flatMap(happening => happening.attendees))];
    const attendees = await Promise.all(attendeeIds.map(getAttendee));
    const context = createGetHappeningTreeContext(happenings, attendees);

    const nonUniqueTrees = await Promise.all(
        happenings.map(
            ({ happeningId }) => getHappeningTree(happeningId, context)
        )
    );

    // These trees without parents will contain all trees in nonUniqueTrees
    return nonUniqueTrees.filter(
        tree => !tree.parent
    );
}