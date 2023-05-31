import {KeyValueStore, KeyValueStoreOptions} from "./types";
import {isPromise, ok} from "../../is";
import {getKeyValueStore} from "./kv";

export const STORAGE_CONSTRUCT = "construct" as const;

export const STORAGE_HOOK_ON_FUNCTION: StorageHookOnFunction[] = [
    "clear",
    "delete",
    "get",
    "has",
    "increment",
    "keys",
    "set",
    "values"
];
const STRING_FUNCTIONS: string[] = STORAGE_HOOK_ON_FUNCTION;

function isStorageHookOnFunction(key: string): key is StorageHookOnFunction {
    return STRING_FUNCTIONS.includes(key);
}

// export const STORAGE_HOOK_ON: StorageHookOn[] = [
//     STORAGE_CONSTRUCT,
//     ...STORAGE_HOOK_ON_FUNCTION,
// ];

export type StorageHookOn = (
    | typeof STORAGE_CONSTRUCT
    | StorageHookOnFunction
);

export type StorageHookOnFunction = (
    | "clear"
    | "delete"
    | "get"
    | "has"
    | "increment"
    | "keys"
    | "set"
    | "values"
);

export const STORAGE_HOOK_BEFORE = "before" as const;
export const STORAGE_HOOK_AFTER = "after" as const;
export const STORAGE_HOOK_DEFAULT = STORAGE_HOOK_AFTER;

export type StorageHookStage = (
    | typeof STORAGE_HOOK_BEFORE
    | typeof STORAGE_HOOK_AFTER
);

export type StorageHookValue<O extends StorageHookOnFunction, T> = Awaited<ReturnType<KeyValueStore<T>[O]>> | undefined | void;
export type StorageHookReturnValue<O extends StorageHookOnFunction, T> =  StorageHookValue<O, T> | Promise<StorageHookValue<O, T>>;

export interface StorageHook<O extends StorageHookOn = StorageHookOn, T = unknown> {
    on: O;
    stage?: StorageHookStage;
    handler: O extends typeof STORAGE_CONSTRUCT ?
        StorageHookConstructFn<T> :
        O extends StorageHookOnFunction ?
            StorageHookFn<O, T> : never;
}

export interface StorageHookFn<O extends StorageHookOnFunction = StorageHookOnFunction, T = unknown> {
    (...args: [...Parameters<KeyValueStore<T>[O]>, StorageHookValue<O, T>]): StorageHookReturnValue<O, T>
}

export interface StorageHookConstructFn<T = unknown> {
    (store: KeyValueStore<T>): KeyValueStore<T> | undefined | void;
}

export type StorageHooks<T = unknown> = {
    [O in StorageHookOn]: StorageHook<O, T>[]
}

export interface Builder<T = unknown, ST extends KeyValueStore<T> = KeyValueStore<T>> {
    <O extends StorageHookOn>(hook: StorageHook<O, T>): Builder<T, ST>;
    (on: typeof STORAGE_CONSTRUCT, fn: StorageHookConstructFn<T>): Builder<T, ST>;
    <O extends StorageHookOnFunction>(on: O, fn: StorageHookFn<O, T>): Builder<T, ST>;
    stages: StorageHooks;
    build(name: string, options?: KeyValueStoreOptions): ST;
}

export interface BuilderKeyValueStore<T> extends KeyValueStore<T> {
    builder: Builder<T>;
}

export function builder<T>() {
    const stages: StorageHooks<T> = {
        [STORAGE_CONSTRUCT]: [],
        clear: [],
        delete: [],
        get: [],
        has: [],
        increment: [],
        keys: [],
        set: [],
        values: []
    }
    const fn: unknown = builderFn;
    ok<Partial<Builder>>(fn);
    fn.stages = stages;
    fn.build = build;
    ok<Builder<T>>(fn);
    const builder: Builder<T> = fn;
    return fn;

    function build(name: string, options?: KeyValueStoreOptions): KeyValueStore<T> {
        let store: KeyValueStore<T> = getKeyValueStore<T>(name, options);
        store = buildOn(STORAGE_CONSTRUCT);
        for (const on of STORAGE_HOOK_ON_FUNCTION) {
            store = buildOn(STORAGE_CONSTRUCT);
        }
        return store;
        
        function buildOn<O extends StorageHookOn>(on: O): KeyValueStore<T> {
            type UnknownFn = (...args: unknown[]) => unknown;

            let returningStore = store;
            if (on === STORAGE_CONSTRUCT) {
                const hooks = stages[STORAGE_CONSTRUCT];
                for (const { handler, stage } of hooks) {
                    ok(stage === STORAGE_HOOK_DEFAULT, `Expected stage to be not given or ${STORAGE_HOOK_DEFAULT} for on ${STORAGE_CONSTRUCT}`);
                    const returnedValue = handler(returningStore);
                    if (returnedValue) {
                        returningStore = returnedValue;
                    }
                }
            } else if (isStorageHookOnFunction(on)) {
                const hooks: StorageHook<O, T>[] = stages[on];
                if (!hooks.length) return;
                const before = hooks.filter(hook => isStage(hook, STORAGE_HOOK_BEFORE));
                const after = hooks.filter(hook => isStage(hook, STORAGE_HOOK_AFTER));

                let fn: UnknownFn = store[on];
                for (const { handler } of before) {
                    ok<UnknownFn>(handler);
                    fn = createBeforeFn(fn, handler);
                }
                for (const { handler } of after) {
                    ok<UnknownFn>(handler);
                    fn = createAfterFn(fn, handler);
                }
                Object.assign(store, { [on]: fn });

                function createAfterFn(fn: UnknownFn, handler: UnknownFn): UnknownFn {
                    const name = `after${on}Hook` as const;
                    const namedFn = {
                        // Maybe this will actually show up as the name for the call... idk
                        async [name](...args: unknown[]) {
                            const returnedValue = await fn.call(store, ...args);
                            return handler.call(store, ...args, returnedValue);
                        }
                    } as const;
                    return namedFn[name];
                }

                function createBeforeFn(fn: UnknownFn, handler: UnknownFn): UnknownFn {
                    const name = `before${on}Hook` as const;
                    const namedFn = {
                        async [name](...args: unknown[]) {
                            const returnedValue = handler.call(store, ...args);
                            if (isPromise(returnedValue)) {
                                // Ignore the returned value
                                // The handler can directly modify arguments if super needed
                                await returnedValue;
                            }
                            return fn.call(store, ...args);
                        }
                    } as const;
                    return namedFn[name];
                }
            }
            return returningStore;

            function isStage(hook: StorageHook, stage: StorageHookStage) {
                if (!hook.stage) {
                    return stage === STORAGE_HOOK_DEFAULT;
                }
                return hook.stage === stage;
            }
        }
    }

    function builderFn(...args: unknown[]): Builder<T> {
        const hook = get();
        push(stages[hook.on], hook);
        return builder;
        function push<O extends StorageHookOn>(hooks: StorageHook<O, T>[], hook: StorageHook<StorageHookOn, T>) {
            ok(hooks);
            const was: unknown = hook;
            assertHook(was);
            hooks.push(was);

            function assertHook(hook: unknown): asserts hook is StorageHook<O, T> {
                ok<StorageHook<O, T>>(hook);
                if (hooks.length >= 1) {
                    ok(hook.on === hooks[0].on);
                }
            }
        }

        function get(): StorageHook<StorageHookOn, T> {
            if (args.length === 1) {
                const hook = args[0];
                ok<StorageHook<StorageHookOn, T>>(hook);
                ok(hook.on);
                ok(hook.handler);
                return hook;
            }
            ok(args.length >= 2);
            const [on, handler] = args;
            ok(typeof on === "string");
            ok<StorageHookOn>(on);
            ok<StorageHookFn<StorageHookOnFunction, T> | StorageHookConstructFn<T>>(handler);
            return {
                on,
                handler,
                stage: STORAGE_HOOK_DEFAULT
            };
        }
    }
}