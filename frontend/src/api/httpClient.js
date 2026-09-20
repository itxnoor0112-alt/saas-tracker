const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const DEFAULT_CACHE_TTL_MS = 15000;
const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 300;

const cache = new Map();
let refreshPromise = null;

function buildUrl(path, params) {
  const url = new URL(BASE_URL + path);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    });
  }
  return url.toString();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isCacheable(method) {
  return method === "GET";
}

function invalidateCache() {
  cache.clear();
}

class HttpError extends Error {
  constructor(status, data) {
    super(data?.message || "Request failed");
    this.response = { status, data };
  }
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch(BASE_URL + "/auth/refresh", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new HttpError(res.status, json);
        localStorage.setItem("ridgeline_token", json.data.accessToken);
        return json.data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

function logoutAndRedirect() {
  localStorage.removeItem("ridgeline_token");
  localStorage.removeItem("ridgeline_user");
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

async function performFetch(method, path, { body, params } = {}) {
  const token = localStorage.getItem("ridgeline_token");
  const res = await fetch(buildUrl(path, params), {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok) {
    throw new HttpError(res.status, json);
  }
  return json;
}

async function request(method, path, { body, params, skipCache = false, allowRetryOn401 = true } = {}) {
  const cacheKey = method + buildUrl(path, params);

  if (isCacheable(method) && !skipCache) {
    const cached = cache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return { data: cached.data };
    }
  }

  let attempt = 0;
  while (true) {
    try {
      const json = await performFetch(method, path, { body, params });
      if (isCacheable(method)) {
        cache.set(cacheKey, { data: json, expiry: Date.now() + DEFAULT_CACHE_TTL_MS });
      } else {
        invalidateCache();
      }
      return { data: json };
    } catch (err) {
      const status = err.response?.status;

      if (status === 401 && allowRetryOn401) {
        try {
          await refreshAccessToken();
          return request(method, path, { body, params, skipCache: true, allowRetryOn401: false });
        } catch {
          logoutAndRedirect();
          throw err;
        }
      }

      const isRetryable = !status || status >= 500;
      if (isRetryable && attempt < MAX_RETRIES) {
        await sleep(RETRY_BASE_DELAY_MS * 2 ** attempt);
        attempt += 1;
        continue;
      }

      throw err;
    }
  }
}

const httpClient = {
  get: (path, opts) => request("GET", path, opts),
  post: (path, body) => request("POST", path, { body }),
  patch: (path, body) => request("PATCH", path, { body }),
  delete: (path) => request("DELETE", path),
  invalidateCache,
};

export default httpClient;
