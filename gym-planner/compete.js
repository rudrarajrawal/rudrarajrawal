/*
 * Compete tab — shared leaderboard backed by Supabase (Postgres + REST),
 * so friends on separate personal accounts/devices can all see and
 * contribute to one leaderboard (a Claude Artifact's shared database is
 * restricted to viewers in the same Claude organization, which doesn't
 * fit a casual friend group on separate accounts).
 *
 * Scoring (resets each calendar month):
 *   - Preset workout finished:      +10 pts
 *   - Custom exercise logged:        +5 pts  (for the free-form "Add Exercise" log)
 *   - Daily calorie target hit:      +5 pts  (once per player per day, 85-110% of target)
 *   - Streak bonus (shown live):   +2 pts per consecutive active day, capped at 14 days
 */

const COMPETE_STORAGE_KEY = "gymplanner.competePlayer";

function getCompetePlayer() {
  return loadJSON(COMPETE_STORAGE_KEY, null);
}

function setCompetePlayer(player) {
  saveJSON(COMPETE_STORAGE_KEY, player);
}

function competeTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

async function joinCompetition(name) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Enter a name first.");

  const existing = await Supabase.select(
    "gym_players",
    `name=eq.${encodeURIComponent(trimmed)}&select=*`
  );
  let player;
  if (existing.length) {
    player = existing[0];
  } else {
    player = await Supabase.insert("gym_players", {
      name: trimmed,
      calorie_target: getCalorieTarget()
    });
  }
  setCompetePlayer({ id: player.id, name: player.name });
  return player;
}

function leaveCompetition() {
  localStorage.removeItem(COMPETE_STORAGE_KEY);
}

async function logPresetWorkoutToCompete(workout, completedCount) {
  const player = getCompetePlayer();
  if (!player) return;
  try {
    await Supabase.insert("gym_activity_logs", {
      player_id: player.id,
      log_date: competeTodayDate(),
      kind: "preset_workout",
      title: workout.name,
      details: { completed: completedCount, total: workout.exercises.length },
      points: 10
    });
  } catch (e) {
    console.error("Failed to sync workout to leaderboard:", e);
  }
}

async function logCustomExercise({ name, sets, reps, weight, notes }) {
  const player = getCompetePlayer();
  if (!player) throw new Error("Join the competition first.");
  return Supabase.insert("gym_activity_logs", {
    player_id: player.id,
    log_date: competeTodayDate(),
    kind: "custom_exercise",
    title: name,
    details: { sets: sets || null, reps: reps || null, weight: weight || null, notes: notes || "" },
    points: 5
  });
}

async function checkAndAwardCalorieBonus() {
  const player = getCompetePlayer();
  if (!player) return;

  const totals = sumMacros(getTodayMealEntries());
  const target = getCalorieTarget();
  const inBand = totals.kcal >= target * 0.85 && totals.kcal <= target * 1.1;
  if (!inBand) return;

  try {
    const already = await Supabase.select(
      "gym_activity_logs",
      `player_id=eq.${player.id}&log_date=eq.${competeTodayDate()}&kind=eq.meal&select=id&limit=1`
    );
    if (already.length) return;

    await Supabase.insert("gym_activity_logs", {
      player_id: player.id,
      log_date: competeTodayDate(),
      kind: "meal",
      title: "Calorie Target Hit",
      details: { kcal: totals.kcal, target },
      points: 5
    });
  } catch (e) {
    console.error("Failed to check/award calorie bonus:", e);
  }
}

function computeStreak(activeDateSet) {
  let streak = 0;
  const cursor = new Date();
  while (activeDateSet.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function monthBounds() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

async function fetchLeaderboard() {
  const { start, end } = monthBounds();
  const [players, logs] = await Promise.all([
    Supabase.select("gym_players", "select=id,name"),
    Supabase.select(
      "gym_activity_logs",
      `log_date=gte.${start}&log_date=lte.${end}&select=player_id,points,log_date,kind`
    )
  ]);

  const byPlayer = new Map(players.map((p) => [p.id, {
    id: p.id,
    name: p.name,
    points: 0,
    workouts: 0,
    customExercises: 0,
    activeDates: new Set()
  }]));

  logs.forEach((log) => {
    const row = byPlayer.get(log.player_id);
    if (!row) return;
    row.points += log.points;
    row.activeDates.add(log.log_date);
    if (log.kind === "preset_workout") row.workouts += 1;
    if (log.kind === "custom_exercise") row.customExercises += 1;
  });

  return Array.from(byPlayer.values())
    .map((row) => {
      const streak = computeStreak(row.activeDates);
      return {
        name: row.name,
        workouts: row.workouts,
        customExercises: row.customExercises,
        basePoints: row.points,
        streak,
        totalPoints: row.points + Math.min(streak, 14) * 2
      };
    })
    .sort((a, b) => b.totalPoints - a.totalPoints);
}

/* ---------- Rendering ---------- */

function renderCompeteView() {
  const player = getCompetePlayer();
  const root = document.getElementById("compete-root");
  if (!player) {
    root.innerHTML = `
      <div class="card">
        <h2>Join the Competition</h2>
        <p class="note">Pick a name your friends will recognize. Everyone who opens this page and joins shares one leaderboard, backed by a real database — works across all your separate devices/accounts.</p>
        <div class="join-row">
          <input type="text" id="join-name-input" placeholder="Your name" maxlength="40">
          <button class="btn btn-primary" id="join-btn">Join</button>
        </div>
        <p id="join-status" class="dropzone-status"></p>
      </div>
    `;
    document.getElementById("join-btn").addEventListener("click", async () => {
      const input = document.getElementById("join-name-input");
      const status = document.getElementById("join-status");
      try {
        status.textContent = "Joining…";
        await joinCompetition(input.value);
        renderCompeteView();
      } catch (e) {
        status.textContent = e.message;
      }
    });
    return;
  }

  root.innerHTML = `
    <div class="card">
      <div class="card-head">
        <h2>Competing as ${player.name}</h2>
        <button class="btn btn-ghost" id="leave-compete-btn">Switch player</button>
      </div>
      <p class="note">+10 pts per finished workout &middot; +5 pts per custom exercise logged &middot; +5 pts for hitting your daily calorie target &middot; up to +28 pts streak bonus. Resets each month.</p>
    </div>

    <div class="card">
      <h2>Add Exercise</h2>
      <p class="subtitle">For any exercise you did that isn't in a preset program — full details, your call.</p>
      <div class="exercise-form">
        <input type="text" id="ex-name" placeholder="Exercise name (e.g. Cable Crossover)">
        <input type="number" id="ex-sets" placeholder="Sets" min="1" max="20">
        <input type="text" id="ex-reps" placeholder="Reps (e.g. 8-10)">
        <input type="text" id="ex-weight" placeholder="Weight (e.g. 40kg)">
        <input type="text" id="ex-notes" placeholder="Notes (optional)">
        <button class="btn btn-primary" id="add-exercise-btn">Log Exercise (+5 pts)</button>
      </div>
      <p id="add-exercise-status" class="dropzone-status"></p>
    </div>

    <div class="card">
      <div class="card-head">
        <h2>Leaderboard — this month</h2>
        <button class="btn btn-ghost" id="refresh-leaderboard-btn">Refresh</button>
      </div>
      <table class="health-table" id="leaderboard-table">
        <thead><tr><th>#</th><th>Name</th><th>Points</th><th>Streak</th><th>Workouts</th><th>Custom Exercises</th></tr></thead>
        <tbody></tbody>
      </table>
      <p id="leaderboard-status" class="note"></p>
    </div>
  `;

  document.getElementById("leave-compete-btn").addEventListener("click", () => {
    if (!confirm("Switch to a different player name on this device?")) return;
    leaveCompetition();
    renderCompeteView();
  });

  document.getElementById("add-exercise-btn").addEventListener("click", async () => {
    const name = document.getElementById("ex-name").value.trim();
    const status = document.getElementById("add-exercise-status");
    if (!name) { status.textContent = "Enter an exercise name."; return; }
    status.textContent = "Logging…";
    try {
      await logCustomExercise({
        name,
        sets: document.getElementById("ex-sets").value,
        reps: document.getElementById("ex-reps").value,
        weight: document.getElementById("ex-weight").value,
        notes: document.getElementById("ex-notes").value
      });
      ["ex-name", "ex-sets", "ex-reps", "ex-weight", "ex-notes"].forEach((id) => {
        document.getElementById(id).value = "";
      });
      status.textContent = "Logged! +5 pts.";
      loadLeaderboard();
    } catch (e) {
      status.textContent = "Failed: " + e.message;
    }
  });

  document.getElementById("refresh-leaderboard-btn").addEventListener("click", loadLeaderboard);

  loadLeaderboard();
}

async function loadLeaderboard() {
  const statusEl = document.getElementById("leaderboard-status");
  const tbody = document.querySelector("#leaderboard-table tbody");
  if (!statusEl || !tbody) return;
  statusEl.textContent = "Loading…";
  try {
    const rows = await fetchLeaderboard();
    tbody.innerHTML = rows.map((r, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${r.name}</td>
        <td>${r.totalPoints}</td>
        <td>${r.streak > 0 ? "🔥 " + r.streak : "—"}</td>
        <td>${r.workouts}</td>
        <td>${r.customExercises}</td>
      </tr>
    `).join("") || `<tr><td colspan="6">No one has logged anything yet this month.</td></tr>`;
    statusEl.textContent = "";
  } catch (e) {
    statusEl.textContent = "Couldn't load leaderboard: " + e.message;
  }
}
