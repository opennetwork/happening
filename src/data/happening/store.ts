import {getKeyValueStore} from "../kv";
import {Happening} from "./types";

const STORE_NAME = "happening" as const;

export function getHappeningStore() {
    return getKeyValueStore<Happening>(STORE_NAME);
}