/* Gym Home Planner — main app logic */

const STORAGE_KEYS = {
  log: "gymplanner.log",
  health: "gymplanner.health",
  settings: "gymplanner.settings",
  todayPlan: "gymplanner.todayPlan"
};

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
function saveJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
}

/* ---------- Navigation ---------- */
function initNav() {
  const buttons = document.querySelectorAll(".nav-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
      document.getElementById("view-" + btn.dataset.view).classList.add("active");
    });
  });
}

/* ---------- Clock ---------- */
function initClock() {
  function tick() {
    const now = new Date();
    document.getElementById("clock-time").textContent = now.toLocaleTimeString([], { hour12: false });
    document.getElementById("clock-date").textContent = now.toLocaleDateString([], {
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    });
    document.getElementById("today-label").textContent = now.toLocaleDateString([], { weekday: "long" });
    const tzOffset = -now.getTimezoneOffset() / 60;
    document.getElementById("clock-tz").textContent = `UTC${tzOffset >= 0 ? "+" : ""}${tzOffset}`;
  }
  tick();
  setInterval(tick, 1000);
}

/* ---------- Rest Timer ---------- */
function initRestTimer() {
  let seconds = 60;
  let remaining = seconds;
  let intervalId = null;
  const display = document.getElementById("timer-display");

  function render() {
    const m = String(Math.floor(remaining / 60)).padStart(2, "0");
    const s = String(remaining % 60).padStart(2, "0");
    display.textContent = `${m}:${s}`;
  }

  document.querySelectorAll("[data-seconds]").forEach((btn) => {
    btn.addEventListener("click", () => {
      seconds = parseInt(btn.dataset.seconds, 10);
      remaining = seconds;
      render();
    });
  });

  document.getElementById("timer-start").addEventListener("click", (e) => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
      e.target.textContent = "Start";
      return;
    }
    e.target.textContent = "Pause";
    intervalId = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(intervalId);
        intervalId = null;
        remaining = 0;
        e.target.textContent = "Start";
        if (window.navigator.vibrate) window.navigator.vibrate(200);
      }
      render();
    }, 1000);
  });

  document.getElementById("timer-reset").addEventListener("click", () => {
    if (intervalId) { clearInterval(intervalId); intervalId = null; }
    remaining = seconds;
    document.getElementById("timer-start").textContent = "Start";
    render();
  });

  render();
}

/* ---------- Move-guide animation (stand-in for AI generated video) ---------- */
function renderMoveGuide(anim) {
  const label = ANIM_LABELS[anim] || "Motion guide";
  return `
    <div class="move-guide move-${anim}" title="${label}">
      <svg viewBox="0 0 100 100" class="figure">
        <circle class="fig-head" cx="50" cy="20" r="8"/>
        <line class="fig-torso" x1="50" y1="28" x2="50" y2="58"/>
        <line class="fig-arm-l" x1="50" y1="36" x2="30" y2="50"/>
        <line class="fig-arm-r" x1="50" y1="36" x2="70" y2="50"/>
        <line class="fig-leg-l" x1="50" y1="58" x2="35" y2="85"/>
        <line class="fig-leg-r" x1="50" y1="58" x2="65" y2="85"/>
      </svg>
      <span class="move-guide-label">${label}</span>
    </div>`;
}

/* ---------- Workouts ---------- */
let activeWorkoutId = WORKOUTS[0].id;
let completedThisSession = new Set();

function initWorkoutsView() {
  const tabsEl = document.getElementById("workout-tabs");
  tabsEl.innerHTML = WORKOUTS.map((w) =>
    `<button class="tab-btn" data-id="${w.id}">${w.name}</button>`
  ).join("");

  tabsEl.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeWorkoutId = btn.dataset.id;
      completedThisSession = new Set();
      renderWorkoutDetail();
    });
  });

  renderWorkoutDetail();
}

function renderWorkoutDetail() {
  const tabsEl = document.getElementById("workout-tabs");
  tabsEl.querySelectorAll(".tab-btn").forEach((b) =>
    b.classList.toggle("active", b.dataset.id === activeWorkoutId)
  );

  const workout = WORKOUTS.find((w) => w.id === activeWorkoutId);
  const detail = document.getElementById("workout-detail");

  detail.innerHTML = `
    <div class="card">
      <div class="workout-meta">
        <h2>${workout.name}</h2>
        <div class="pill-row">
          <span class="pill">${workout.category}</span>
          <span class="pill">${workout.duration}</span>
          <span class="pill">${workout.difficulty}</span>
          ${workout.muscles.map((m) => `<span class="pill pill-muted">${m}</span>`).join("")}
        </div>
      </div>
      <div class="exercise-list">
        ${workout.exercises.map((ex, i) => `
          <div class="exercise-row">
            <label class="exercise-check">
              <input type="checkbox" data-ex="${i}" ${completedThisSession.has(i) ? "checked" : ""}>
              <span></span>
            </label>
            ${renderMoveGuide(ex.anim)}
            <div class="exercise-info">
              <div class="exercise-name">${ex.name}</div>
              <div class="exercise-sub">${ex.sets} sets × ${ex.reps} &middot; rest ${ex.rest}s</div>
            </div>
          </div>
        `).join("")}
      </div>
      <div class="card-foot">
        <span id="workout-complete-count">${completedThisSession.size} / ${workout.exercises.length} done</span>
        <button class="btn btn-primary" id="finish-workout-btn">Log this workout</button>
      </div>
    </div>
  `;

  detail.querySelectorAll("input[data-ex]").forEach((cb) => {
    cb.addEventListener("change", () => {
      const idx = parseInt(cb.dataset.ex, 10);
      if (cb.checked) completedThisSession.add(idx); else completedThisSession.delete(idx);
      document.getElementById("workout-complete-count").textContent =
        `${completedThisSession.size} / ${workout.exercises.length} done`;
    });
  });

  detail.querySelector("#finish-workout-btn").addEventListener("click", () => {
    logWorkout(workout, completedThisSession.size);
    completedThisSession = new Set();
    renderWorkoutDetail();
    renderProgress();
    renderDashboardStats();
  });
}

function logWorkout(workout, completedCount) {
  const log = loadJSON(STORAGE_KEYS.log, []);
  log.unshift({
    date: new Date().toISOString(),
    programId: workout.id,
    programName: workout.name,
    completed: completedCount,
    total: workout.exercises.length
  });
  saveJSON(STORAGE_KEYS.log, log);
  updateStreak(log);
}

function updateStreak(log) {
  const days = new Set(log.map((entry) => entry.date.slice(0, 10)));
  let streak = 0;
  let cursor = new Date();
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  document.getElementById("streak-badge").textContent = `🔥 ${streak} day streak`;
}

/* ---------- Today's plan on dashboard ---------- */
function pickTodayPlan() {
  const stored = loadJSON(STORAGE_KEYS.todayPlan, null);
  const todayKey = new Date().toISOString().slice(0, 10);
  if (stored && stored.date === todayKey) return stored.workoutId;
  const idx = new Date().getDate() % WORKOUTS.length;
  const workoutId = WORKOUTS[idx].id;
  saveJSON(STORAGE_KEYS.todayPlan, { date: todayKey, workoutId });
  return workoutId;
}

function renderTodayPlan() {
  const workoutId = pickTodayPlan();
  const workout = WORKOUTS.find((w) => w.id === workoutId);
  document.getElementById("today-plan-body").innerHTML = `
    <div class="today-plan-head">
      <strong>${workout.name}</strong>
      <span class="pill">${workout.duration}</span>
    </div>
    <ul class="today-plan-list">
      ${workout.exercises.map((ex) => `<li>${ex.name} — ${ex.sets}×${ex.reps}</li>`).join("")}
    </ul>
    <button class="btn btn-primary" id="go-to-workout-btn">Start Workout</button>
  `;
  document.getElementById("go-to-workout-btn").addEventListener("click", () => {
    activeWorkoutId = workoutId;
    document.querySelector('.nav-btn[data-view="workouts"]').click();
    renderWorkoutDetail();
  });

  document.getElementById("shuffle-plan").addEventListener("click", () => {
    const idx = Math.floor(Math.random() * WORKOUTS.length);
    saveJSON(STORAGE_KEYS.todayPlan, { date: new Date().toISOString().slice(0, 10), workoutId: WORKOUTS[idx].id });
    renderTodayPlan();
  });
}

/* ---------- Dashboard stats ---------- */
function renderDashboardStats() {
  const log = loadJSON(STORAGE_KEYS.log, []);
  document.getElementById("stat-workouts").textContent = log.length;

  const health = loadJSON(STORAGE_KEYS.health, null);
  document.getElementById("stat-steps").textContent = health ? health.stepsToday.toLocaleString() : "—";
  document.getElementById("stat-energy").textContent = health ? `${health.energyToday}` : "—";

  updateStreak(log);
}

/* ---------- Progress log ---------- */
function renderProgress() {
  const log = loadJSON(STORAGE_KEYS.log, []);
  const tbody = document.querySelector("#log-table tbody");
  const empty = document.getElementById("log-empty");
  tbody.innerHTML = log.map((entry) => `
    <tr>
      <td>${new Date(entry.date).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</td>
      <td>${entry.programName}</td>
      <td>${entry.completed} / ${entry.total}</td>
    </tr>
  `).join("");
  empty.hidden = log.length > 0;
}

/* ---------- Apple Health import wiring ---------- */
function initHealthImport() {
  const dropzone = document.getElementById("health-dropzone");
  const input = document.getElementById("health-file-input");
  const browseBtn = document.getElementById("health-browse-btn");
  const status = document.getElementById("health-status");

  browseBtn.addEventListener("click", () => input.click());

  ["dragover", "dragenter"].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.add("drag-over"); })
  );
  ["dragleave", "drop"].forEach((evt) =>
    dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.remove("drag-over"); })
  );
  dropzone.addEventListener("drop", (e) => {
    const file = e.dataTransfer.files[0];
    if (file) handleHealthFile(file);
  });
  input.addEventListener("change", () => {
    if (input.files[0]) handleHealthFile(input.files[0]);
  });

  function handleHealthFile(file) {
    if (!file.name.toLowerCase().endsWith(".zip")) {
      status.textContent = "Please choose the export.zip file from the Health app.";
      return;
    }
    status.textContent = "Parsing " + file.name + " …";
    file.arrayBuffer()
      .then((buf) => HealthImport.parseAppleHealthZip(buf))
      .then((result) => {
        saveJSON(STORAGE_KEYS.health, result);
        status.textContent = `Imported successfully at ${new Date(result.importedAt).toLocaleTimeString()}.`;
        renderHealthResults(result);
        renderDashboardStats();
      })
      .catch((err) => {
        status.textContent = "Import failed: " + err.message;
      });
  }

  const existing = loadJSON(STORAGE_KEYS.health, null);
  if (existing) renderHealthResults(existing);
}

function renderHealthResults(result) {
  const card = document.getElementById("health-results");
  card.hidden = false;
  document.getElementById("health-summary-grid").innerHTML = `
    <div class="mini-stat"><div class="mini-stat-label">Steps Today</div><div class="mini-stat-value">${result.stepsToday.toLocaleString()}</div></div>
    <div class="mini-stat"><div class="mini-stat-label">Active Energy</div><div class="mini-stat-value">${result.energyToday} kcal</div></div>
    <div class="mini-stat"><div class="mini-stat-label">Avg Resting HR</div><div class="mini-stat-value">${result.avgRestingHR ?? "—"} bpm</div></div>
  `;
  const tbody = document.querySelector("#health-workouts-table tbody");
  tbody.innerHTML = result.recentWorkouts.map((w) => `
    <tr>
      <td>${w.type}</td>
      <td>${w.startDate ? new Date(w.startDate).toLocaleDateString() : "—"}</td>
      <td>${w.duration ? `${Math.round(w.duration)} ${w.durationUnit}` : "—"}</td>
      <td>${w.energy ? `${Math.round(w.energy)} ${w.energyUnit}` : "—"}</td>
      <td>${w.distance ? `${w.distance.toFixed(2)} ${w.distanceUnit}` : "—"}</td>
    </tr>
  `).join("") || `<tr><td colspan="5">No workouts found in export.</td></tr>`;
}

/* ---------- Settings ---------- */
function initSettings() {
  const settings = loadJSON(STORAGE_KEYS.settings, { theme: "dark", units: "metric" });
  document.documentElement.dataset.theme = settings.theme;
  document.getElementById("theme-select").value = settings.theme;
  document.getElementById("units-select").value = settings.units;

  document.getElementById("theme-select").addEventListener("change", (e) => {
    settings.theme = e.target.value;
    document.documentElement.dataset.theme = settings.theme;
    saveJSON(STORAGE_KEYS.settings, settings);
  });
  document.getElementById("units-select").addEventListener("change", (e) => {
    settings.units = e.target.value;
    saveJSON(STORAGE_KEYS.settings, settings);
  });
  document.getElementById("reset-data-btn").addEventListener("click", () => {
    if (!confirm("Clear your workout log and imported Apple Health data?")) return;
    localStorage.removeItem(STORAGE_KEYS.log);
    localStorage.removeItem(STORAGE_KEYS.health);
    localStorage.removeItem(STORAGE_KEYS.todayPlan);
    document.getElementById("health-results").hidden = true;
    document.getElementById("health-status").textContent = "";
    renderDashboardStats();
    renderProgress();
    renderTodayPlan();
  });
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initClock();
  initRestTimer();
  initWorkoutsView();
  initHealthImport();
  initSettings();
  renderTodayPlan();
  renderDashboardStats();
  renderProgress();
});
