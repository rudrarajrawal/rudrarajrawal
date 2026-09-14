/*
 * Apple Health import.
 *
 * Apple does not expose a live web API for HealthKit, so a website can never
 * hold an always-on connection to the Health app the way a native iOS app
 * can. This module reads the official export a user generates from
 * Health app -> profile icon -> "Export All Health Data" (an export.zip
 * containing export.xml). Parsing happens entirely client-side with JSZip;
 * the file is never sent to any server.
 */

const HealthImport = (() => {

  function parseAppleHealthZip(arrayBuffer) {
    return JSZip.loadAsync(arrayBuffer).then((zip) => {
      const exportFile = zip.file(/export\.xml$/i)[0];
      if (!exportFile) {
        throw new Error("Couldn't find export.xml inside the zip. Make sure this is the file from Health app > Export All Health Data.");
      }
      return exportFile.async("string");
    }).then((xmlText) => parseExportXml(xmlText));
  }

  function parseExportXml(xmlText) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, "text/xml");

    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10);

    let stepsToday = 0;
    let energyToday = 0;
    let avgRestingHR = null;
    const hrSamples = [];

    const records = doc.getElementsByTagName("Record");
    for (let i = 0; i < records.length; i++) {
      const r = records[i];
      const type = r.getAttribute("type");
      const startDate = r.getAttribute("startDate") || "";
      const value = parseFloat(r.getAttribute("value"));
      if (Number.isNaN(value)) continue;

      const isToday = startDate.slice(0, 10) === todayKey;

      if (type === "HKQuantityTypeIdentifierStepCount" && isToday) {
        stepsToday += value;
      } else if (type === "HKQuantityTypeIdentifierActiveEnergyBurned" && isToday) {
        energyToday += value;
      } else if (type === "HKQuantityTypeIdentifierRestingHeartRate") {
        hrSamples.push(value);
      }
    }

    if (hrSamples.length) {
      avgRestingHR = Math.round(hrSamples.reduce((a, b) => a + b, 0) / hrSamples.length);
    }

    const workouts = [];
    const workoutEls = doc.getElementsByTagName("Workout");
    for (let i = 0; i < workoutEls.length; i++) {
      const w = workoutEls[i];
      workouts.push({
        type: (w.getAttribute("workoutActivityType") || "Workout").replace("HKWorkoutActivityType", ""),
        startDate: w.getAttribute("startDate"),
        duration: parseFloat(w.getAttribute("duration")) || null,
        durationUnit: w.getAttribute("durationUnit") || "min",
        energy: parseFloat(w.getAttribute("totalEnergyBurned")) || null,
        energyUnit: w.getAttribute("totalEnergyBurnedUnit") || "kcal",
        distance: parseFloat(w.getAttribute("totalDistance")) || null,
        distanceUnit: w.getAttribute("totalDistanceUnit") || "km"
      });
    }

    workouts.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

    return {
      importedAt: new Date().toISOString(),
      stepsToday: Math.round(stepsToday),
      energyToday: Math.round(energyToday),
      avgRestingHR,
      recentWorkouts: workouts.slice(0, 15)
    };
  }

  return { parseAppleHealthZip };
})();
