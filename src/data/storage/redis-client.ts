import {KeyValueStore, KeyValueStoreOptions, MetaKeyValueStore} from "./types";
import { createClient, RedisClientType } from "redis";
import { ok } from "../../is";

const GLOBAL_CLIENTS = new Map();
const GLOBAL_CLIENT_CONNECTION_PROMISE = new WeakMap();

export function isRedis() {
  return !!getRedisUrl();
}

export function isRedisMemory() {
  return !!process.env.REDIS_MEMORY;
}

export function getRedisUrl() {
  return process.env.REDIS_URL;
}

export function getGlobalRedisClient() {
  // console.log("getGlobalRedisClient");
  const url = getRedisUrl();
  const existing = GLOBAL_CLIENTS.get(url);
  if (existing) {
    return existing;
  }
  const client = createClient({
    url,
  });
  client.on("error", console.warn);
  GLOBAL_CLIENTS.set(url, client);
  return client;
}

export async function connectGlobalRedisClient(
  client: RedisClientType = getGlobalRedisClient()
) {
  if (client.isOpen) {
    return client;
  }
  const existingPromise = GLOBAL_CLIENT_CONNECTION_PROMISE.get(client);
  if (existingPromise) return existingPromise;
  const promise = client.connect().then(() => client);
  GLOBAL_CLIENT_CONNECTION_PROMISE.set(client, promise);
  promise.finally(() => {
    if (promise === GLOBAL_CLIENT_CONNECTION_PROMISE.get(client)) {
      GLOBAL_CLIENT_CONNECTION_PROMISE.delete(client);
    }
  });
  return promise;
}

// export async function getRedisClient() {
//     const client = getGlobalRedisClient();
//     await connectGlobalRedisClient(client);
//     return client;
// }

function getRedisPrefix(name: string, options?: KeyValueStoreOptions) {
  return `${name}::${options?.prefix ?? ""}`;
}

export function getRedisPrefixedKey(name: string, key: string, options?: KeyValueStoreOptions): string {
  return `${getRedisPrefix(name, options)}${key}`;
}

export function createRedisKeyValueStore<T>(name: string, options?: KeyValueStoreOptions): KeyValueStore<T> {
  const client = getGlobalRedisClient();

  const isCounter = name.endsWith("Counter");

  function parseValue(value: unknown): T | undefined {
    if (isCounter) {
      return parseCounterValue(value);
    }

    if (typeof value !== "string") {
      return undefined;
    }

    return JSON.parse(value);

    function parseCounterValue(value: unknown): T {
      let returnValue = 0;
      if (isNumberString(value)) {
        returnValue = +value;
      }
      ok<T>(returnValue);
      return returnValue;
    }
  }

  function getPrefix() {
    return getRedisPrefix(name, options);
  }

  function getKey(key: string): string {
    return getRedisPrefixedKey(name, key, options);
  }

  async function connect() {
    return connectGlobalRedisClient(client);
  }

  async function get(key: string): Promise<T | undefined> {
    return internalGet(getKey(key));
  }

  async function internalGet(actualKey: string): Promise<T | undefined> {
    await connect();
    const value = await client.get(actualKey);
    return parseValue(value);
  }

  async function set(key: string, value: T): Promise<void> {
    if (isCounter) {
      ok(typeof value === "number", "Expected number value for counter store");
    }
    await connect();
    const json = JSON.stringify(value);
    await client.set(getKey(key), json);
  }

  async function values(): Promise<T[]> {
    await connect();
    const keys = await client.keys(`${getPrefix()}*`);
    return await Promise.all(keys.map((key: string) => internalGet(key)));
  }

  async function* asyncIterable(): AsyncIterable<T> {
    for (const key of await keys()) {
      const value = await internalGet(key);
      // Could return as deleted in between fetching
      if (value) {
        yield value;
      }
    }
  }

  async function deleteFn(key: string): Promise<void> {
    await connect();
    await client.del(key);
  }

  async function has(key: string): Promise<boolean> {
    await connect();
    return client.exists(key);
  }

  async function keys(): Promise<string[]> {
    await connect();
    return await client.keys(`${getPrefix()}*`);
  }

  async function clear(): Promise<void> {
    await Promise.all(
      (
        await keys()
      ).map(async (key) => {
        await deleteFn(key);
      })
    );
  }

  async function increment(key: string): Promise<number> {
    ok(isCounter, "Expected increment to be used with a counter store only");
    await connect();
    const returnedValue = await client.incr(getKey(key));
    ok(
      isNumberString(returnedValue),
      "Expected redis to return number when incrementing"
    );
    return +returnedValue;
  }

  function meta<M>(key?: string): MetaKeyValueStore<M> {
    const fn = options?.meta;
    ok(fn, "expected meta option to be provided if meta is used");
    return fn<M>(key);
  }

  return {
    name,
    get,
    set,
    values,
    delete: deleteFn,
    has,
    keys,
    clear,
    increment,
    meta,
    [Symbol.asyncIterator]() {
      return asyncIterable()[Symbol.asyncIterator]();
    },
  };
}

export async function stopRedis() {
  // console.log("stopRedis", GLOBAL_CLIENTS.size);
  for (const [key, client] of GLOBAL_CLIENTS.entries()) {
    GLOBAL_CLIENTS.delete(key);
    GLOBAL_CLIENT_CONNECTION_PROMISE.delete(client);
    if (client.isOpen) {
      await client.disconnect();
    }
  }
}


export function isNumberString(value?: unknown): value is `${number}` | number {
  return (
      (typeof value === "string" && /^-?\d+(?:\.\d+)?$/.test(value)) ||
      typeof value === "number"
  );
}