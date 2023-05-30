import {getAttendeeStore} from "./store";
import {Attendee, PartialAttendee} from "./types";
import {createHash} from "crypto";
import {getAttendee} from "./get-attendee";
import {entries} from "../entries";

function getPartitionPrefix() {
    // TODO
    return "partition::";
}

/**
 * Allows partial update of an attendee, retains existing properties
 * @param data
 */
export async function setAttendee(data: PartialAttendee) {
    const store = getAttendeeStore();
    const attendeeId = data.attendeeId ?? createAttendeeId();
    const existing = await getAttendee(attendeeId);
    if (existing && !isDifferent(existing)) {
        return existing;
    }
    const createdAt = data.createdAt || new Date().toISOString();
    const attendee: Attendee = {
        ...existing,
        ...data,
        attendeeId,
        createdAt
    };
    await store.set(attendeeId, attendee);
    return attendee;

    function isDifferent(value: Attendee) {
        return !!entries(data).find(entry => value[entry[0]] !== entry[1]);
    }

    function createAttendeeId() {
        const hash = createHash("sha512");
        hash.update(getPartitionPrefix());
        hash.update(data.reference);
        return hash.digest().toString("hex");
    }
}