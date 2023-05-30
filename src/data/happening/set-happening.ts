import {Happening, PartialHappening} from "./types";
import {v4} from "uuid";
import {getHappeningStore} from "./store";
import {getMaybePartner} from "../../authentication";

export async function setHappening(data: PartialHappening) {
    const createdAt = data.createdAt || new Date().toISOString();
    const happeningId = data.happeningId || v4();
    const type = data.type || "event";
    const partnerId = getMaybePartner()?.partnerId;
    const happening: Happening = {
        ...data,
        type,
        createdAt,
        happeningId,
        partnerId
    };
    const store = getHappeningStore();
    await store.set(happeningId, happening);
    return happening;
}