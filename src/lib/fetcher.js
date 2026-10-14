export async function fetcher(url) {
  const res = await fetch(url);
  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.error || "Request failed");
  }

  return json.data;
}
