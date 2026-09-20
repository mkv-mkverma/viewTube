import { YOUTUBE_SEARCH_API, YOUTUBE_SEARCH_JSONP_API } from "./constant";

/**
 * Search suggestions come from Google's suggest endpoint, which sends no
 * Access-Control-Allow-Origin header. In dev the Vite proxy sidesteps that; in
 * prod there is no server, so we use JSONP (a <script> tag is not subject to
 * CORS). The two transports return different shapes, so both are normalised to
 * string[] here and callers do not need to care which one ran.
 */

const JSONP_TIMEOUT_MS = 5000;

let callbackId = 0;

/** client=firefox → ["hindi", ["hindi song", "hindi movie", ...], ...] */
type ProxyResponse = [string, string[], ...unknown[]];

/** client=youtube → ["hindi", [["hindi song", 0, [512]], ...], ...] */
type JsonpResponse = [string, [string, ...unknown[]][], ...unknown[]];

const fetchViaProxy = async (query: string): Promise<string[]> => {
  const res = await fetch(`${YOUTUBE_SEARCH_API}${encodeURIComponent(query)}`);
  const data: ProxyResponse = await res.json();
  return data?.[1] ?? [];
};

const fetchViaJsonp = (query: string): Promise<string[]> =>
  new Promise((resolve, reject) => {
    const callbackName = `__ytSuggest_${callbackId++}`;
    const script = document.createElement("script");
    const globals = window as unknown as Record<string, unknown>;

    let timer: ReturnType<typeof setTimeout>;

    const cleanup = () => {
      clearTimeout(timer);
      delete globals[callbackName];
      script.remove();
    };

    globals[callbackName] = (data: JsonpResponse) => {
      cleanup();
      resolve((data?.[1] ?? []).map((entry) => entry[0]));
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("Failed to load search suggestions"));
    };

    timer = setTimeout(() => {
      cleanup();
      reject(new Error("Search suggestions timed out"));
    }, JSONP_TIMEOUT_MS);

    script.src = `${YOUTUBE_SEARCH_JSONP_API}${encodeURIComponent(query)}&callback=${callbackName}`;
    document.body.appendChild(script);
  });

export const getSearchSuggestions = (query: string): Promise<string[]> =>
  import.meta.env.DEV ? fetchViaProxy(query) : fetchViaJsonp(query);
