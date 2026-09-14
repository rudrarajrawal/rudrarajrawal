/*
 * Workout program data.
 * `anim` maps each exercise to one of the animated move-guide categories
 * defined in style.css / rendered by app.js: push, pull, squat, hinge, core, cardio.
 */

const WORKOUTS = [
  {
    id: "push",
    name: "Push Day",
    category: "Strength",
    duration: "45–55 min",
    difficulty: "Intermediate",
    muscles: ["Chest", "Shoulders", "Triceps"],
    exercises: [
      { name: "Barbell Bench Press", sets: 4, reps: "8–10", rest: 90, anim: "push" },
      { name: "Overhead Shoulder Press", sets: 3, reps: "10–12", rest: 75, anim: "push" },
      { name: "Incline Push-Ups", sets: 3, reps: "To failure", rest: 60, anim: "push" },
      { name: "Tricep Dips", sets: 3, reps: "12–15", rest: 60, anim: "push" },
      { name: "Lateral Raises", sets: 3, reps: "12–15", rest: 45, anim: "push" }
    ]
  },
  {
    id: "pull",
    name: "Pull Day",
    category: "Strength",
    duration: "45–55 min",
    difficulty: "Intermediate",
    muscles: ["Back", "Biceps", "Rear Delts"],
    exercises: [
      { name: "Pull-Ups", sets: 4, reps: "6–10", rest: 90, anim: "pull" },
      { name: "Barbell Bent-Over Row", sets: 4, reps: "8–10", rest: 90, anim: "pull" },
      { name: "Lat Pulldown", sets: 3, reps: "10–12", rest: 60, anim: "pull" },
      { name: "Face Pulls", sets: 3, reps: "15", rest: 45, anim: "pull" },
      { name: "Barbell Bicep Curl", sets: 3, reps: "10–12", rest: 45, anim: "pull" }
    ]
  },
  {
    id: "legs",
    name: "Leg Day",
    category: "Strength",
    duration: "50–60 min",
    difficulty: "Advanced",
    muscles: ["Quads", "Hamstrings", "Glutes", "Calves"],
    exercises: [
      { name: "Barbell Back Squat", sets: 4, reps: "6–8", rest: 120, anim: "squat" },
      { name: "Romanian Deadlift", sets: 4, reps: "8–10", rest: 100, anim: "hinge" },
      { name: "Walking Lunges", sets: 3, reps: "12 per leg", rest: 60, anim: "squat" },
      { name: "Leg Press", sets: 3, reps: "10–12", rest: 75, anim: "squat" },
      { name: "Standing Calf Raise", sets: 4, reps: "15–20", rest: 45, anim: "squat" }
    ]
  },
  {
    id: "full-body",
    name: "Full Body Beginner",
    category: "Strength",
    duration: "35–45 min",
    difficulty: "Beginner",
    muscles: ["Full Body"],
    exercises: [
      { name: "Bodyweight Squats", sets: 3, reps: "15", rest: 45, anim: "squat" },
      { name: "Push-Ups (knees ok)", sets: 3, reps: "10–12", rest: 45, anim: "push" },
      { name: "Bent-Knee Deadlift (light)", sets: 3, reps: "10", rest: 60, anim: "hinge" },
      { name: "Dumbbell Row", sets: 3, reps: "12 per side", rest: 45, anim: "pull" },
      { name: "Plank Hold", sets: 3, reps: "30–45 sec", rest: 30, anim: "core" }
    ]
  },
  {
    id: "hiit",
    name: "HIIT Cardio Blast",
    category: "Conditioning",
    duration: "20–25 min",
    difficulty: "Intermediate",
    muscles: ["Full Body", "Cardio"],
    exercises: [
      { name: "Jumping Jacks", sets: 4, reps: "40 sec on / 20 off", rest: 20, anim: "cardio" },
      { name: "Mountain Climbers", sets: 4, reps: "40 sec on / 20 off", rest: 20, anim: "cardio" },
      { name: "Burpees", sets: 4, reps: "40 sec on / 20 off", rest: 20, anim: "cardio" },
      { name: "High Knees", sets: 4, reps: "40 sec on / 20 off", rest: 20, anim: "cardio" },
      { name: "Squat Jumps", sets: 4, reps: "40 sec on / 20 off", rest: 20, anim: "squat" }
    ]
  },
  {
    id: "core",
    name: "Core & Abs",
    category: "Conditioning",
    duration: "20–25 min",
    difficulty: "Beginner",
    muscles: ["Abs", "Obliques", "Lower Back"],
    exercises: [
      { name: "Sit-Ups", sets: 3, reps: "15–20", rest: 30, anim: "core" },
      { name: "Plank Hold", sets: 3, reps: "45–60 sec", rest: 30, anim: "core" },
      { name: "Russian Twists", sets: 3, reps: "20 per side", rest: 30, anim: "core" },
      { name: "Leg Raises", sets: 3, reps: "12–15", rest: 30, anim: "core" },
      { name: "Side Plank", sets: 3, reps: "30 sec per side", rest: 30, anim: "core" }
    ]
  }
];

const ANIM_LABELS = {
  push: "Push motion guide",
  pull: "Pull motion guide",
  squat: "Squat motion guide",
  hinge: "Hip-hinge motion guide",
  core: "Core brace guide",
  cardio: "Cardio motion guide"
};
