import {CacheKey} from "../util/CacheManager";

interface SQLQuery {
  text: string;
  values: any[];
  cache?: SQLQueryCacheOptions;
  useMulti?: boolean;
}

interface SQLQueryCacheOptions {
  key?: string | CacheKey;
  name: string | number;
  subKey?: string;
  clear?: boolean;
  clearKeys?: CacheKey[];
  clearSpecific?: SQLQueryCacheOptions[];
}

interface FetchMessagesOptions {
  amount: number;
  startAt: number | null;
}
