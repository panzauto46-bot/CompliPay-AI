import handler from "./_app.js";

function normalizePath(value) {
  if (Array.isArray(value)) return value.join("/");
  return typeof value === "string" ? value : "";
}

export default function apiRouter(req, res) {
  const url = new URL(req.url || "/", "http://localhost");
  const pathFromQuery =
    req && typeof req === "object" && "query" in req
      ? normalizePath(req.query?.path)
      : normalizePath(url.searchParams.getAll("path"));
  const cleanedPath = String(pathFromQuery || "").replace(/^\/+/, "");

  url.searchParams.delete("path");
  const queryString = url.searchParams.toString();
  req.url = `/api/${cleanedPath}${queryString ? `?${queryString}` : ""}`;

  return handler(req, res);
}
