import {HappeningTree} from "../../../../client";
import {createContext, useContext} from "react";
import {ok} from "../../../../is";

export interface HappeningData {
    happening: HappeningTree;
    timezone: string;
}

export const HappeningContext = createContext<HappeningData | undefined>(undefined);
export const HappeningProvider = HappeningContext.Provider;

export function useHappeningContext(): HappeningData {
    const context = useContext(HappeningContext);
    ok(context);
    return context;
}

export function useHappening() {
    const { happening } = useHappeningContext();
    return happening;
}

export function useTimezone() {
    const { timezone } = useHappeningContext();
    return timezone;
}