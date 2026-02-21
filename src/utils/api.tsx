// Use the env var. If it's missing, fallback to "/api" (proxy)
const ENV_URL = import.meta.env.BACKEND_SERVER_URL;

const BASE_URL = ENV_URL ? `${ENV_URL}/api` : "/api";

const fetchWithAuth = async (
  endpoint: string,
  method: string,
  token: string | null = null,
  body: any = null,
) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${normalizedEndpoint}`, options);

  // Check for 401 Unauthorized (Expired/Invalid Token)
  if (response.status === 401) {
    // Clear storage and cookies
    localStorage.removeItem("token");
    document.cookie =
      "token=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;SameSite=Strict";

    // Force redirect to Get Started if not already there
    if (
      !window.location.pathname.includes("/get-started") &&
      !window.location.pathname.includes("/login")
    ) {
      window.location.href = "/get-started";
    }

    throw new Error("Session expired. Please log in again.");
  }

  const text = await response.text();
  let result;
  try {
    result = text ? JSON.parse(text) : {};
  } catch (error) {
    console.error("Failed to parse API response:", text);
    result = {
      error: `Server Error: ${response.status} ${response.statusText}`,
    };
  }

  if (!response.ok) {
    throw new Error(result.error || result.message || "Something went wrong");
  }

  return result;
};

export const api = {
  post: (endpoint: string, data: any, token?: string | null) =>
    fetchWithAuth(endpoint, "POST", token, data),

  get: (endpoint: string, token?: string | null) =>
    fetchWithAuth(endpoint, "GET", token),

  put: (endpoint: string, data: any, token?: string | null) =>
    fetchWithAuth(endpoint, "PUT", token, data),

  delete: (endpoint: string, token?: string | null) =>
    fetchWithAuth(endpoint, "DELETE", token),
};
