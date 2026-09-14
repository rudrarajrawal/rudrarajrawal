/*
 * Minimal Supabase REST (PostgREST) client — no SDK, just fetch.
 * Used for the shared "Compete" leaderboard so friends on separate
 * Claude/device accounts can all read and write the same backend.
 */

const SUPABASE_URL = "https://htparsqqsrbyygbvjvqf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0cGFyc3Fxc3JieXlnYnZqdnFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyNDU1MzcsImV4cCI6MjEwMzgyMTUzN30.gg1g40L9vnlekrh7DLcBf38c_0yjd5wPIcFz8BZHfz0";

const Supabase = (() => {
  function headers(extra) {
    return Object.assign({
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json"
    }, extra || {});
  }

  async function select(table, query) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query || "select=*"}`, {
      headers: headers()
    });
    if (!res.ok) throw new Error(`Supabase select failed on ${table}: ${res.status}`);
    return res.json();
  }

  async function insert(table, row) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: headers({ Prefer: "return=representation" }),
      body: JSON.stringify(row)
    });
    if (!res.ok) throw new Error(`Supabase insert failed on ${table}: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return Array.isArray(data) ? data[0] : data;
  }

  async function update(table, query, patch) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
      method: "PATCH",
      headers: headers({ Prefer: "return=representation" }),
      body: JSON.stringify(patch)
    });
    if (!res.ok) throw new Error(`Supabase update failed on ${table}: ${res.status}`);
    return res.json();
  }

  return { select, insert, update };
})();
