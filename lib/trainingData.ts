import { Phase, TrainingWeek, TrainingSession } from './types'

// Training days: Tue, Thu, Sat, Sun (+ Wed from week 8 of base)
// Phase start dates
export const PHASE_STARTS = {
  base: '2026-05-05',        // 18 weeks
  development: '2026-09-08', // 12 weeks
  peak: '2026-12-01',        // 14 weeks
  taper: '2027-04-06',       // 3 weeks
  race: '2027-04-27',
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

// day offsets from Monday: Tue=1, Wed=2, Thu=3, Sat=5, Sun=6
const DAY_OFFSETS: Record<string, number> = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
}

function sessionDate(weekMonday: string, day: string): string {
  return addDays(weekMonday, DAY_OFFSETS[day])
}

// BASE PHASE — 18 weeks, starting 5 May 2026
// Weeks 1-7: Tue, Thu, Sat, Sun
// Weeks 8-18: Tue, Wed, Thu, Sat, Sun
function buildBasePhase(): TrainingWeek[] {
  const weeks: TrainingWeek[] = []

  // Base phase first Monday: 4 May 2026
  const weekTemplates = [
    // Week 1
    {
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run', mins: 40 },
        { day: 'Thursday', type: 'Easy', desc: 'Easy aerobic run', mins: 40 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 50 },
        { day: 'Sunday', type: 'Long', desc: 'Long slow run — aerobic base', mins: 75 },
      ],
    },
    // Week 2
    {
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run', mins: 45 },
        { day: 'Thursday', type: 'Easy', desc: 'Easy aerobic run', mins: 45 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 55 },
        { day: 'Sunday', type: 'Long', desc: 'Long slow run — aerobic base', mins: 80 },
      ],
    },
    // Week 3 — down week (knee)
    {
      note: 'Natural down week — Thursday skipped for knee. Saturday short test run. Sunday Rushcliffe with brother hit LT1.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run', mins: 52 },
        { day: 'Saturday', type: 'Easy', desc: 'Short knee test run', mins: 28 },
        { day: 'Sunday', type: 'Easy', desc: 'Rushcliffe parkrun with brother', mins: 47 },
      ],
    },
    // Week 4 — build
    {
      note: 'Return to full training. Knee settled. Build week replacing the planned drop-back.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run', mins: 62 },
        { day: 'Thursday', type: 'Easy', desc: 'Easy aerobic run', mins: 55 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 60 },
        { day: 'Sunday', type: 'Long', desc: 'Long slow run — aerobic base', mins: 75 },
      ],
    },
    // Week 5 — Greece (drop-back)
    {
      note: 'GREECE 1–11 Jun. Full week away. Run if possible — short easy efforts only, heat will push HR up.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy run — Greece', mins: 45 },
        { day: 'Thursday', type: 'Easy', desc: 'Easy run — Greece', mins: 45 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy run — Greece', mins: 55 },
        { day: 'Sunday', type: 'Easy', desc: 'Easy run — Greece', mins: 60 },
      ],
    },
    // Week 6 — Greece (drop-back)
    {
      note: 'Still in Greece until 11 Jun. Back Thu evening. Saturday and Sunday first runs back.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy run — Greece', mins: 45 },
        { day: 'Thursday', type: 'Easy', desc: 'Easy run — Greece', mins: 45 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy run — first back from Greece', mins: 55 },
        { day: 'Sunday', type: 'Easy', desc: 'Easy aerobic run', mins: 60 },
      ],
    },
    // Week 7 — first full week back
    {
      note: 'First full week back post-Greece. Wednesday still not introduced. Long run to 85 min.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run', mins: 55 },
        { day: 'Thursday', type: 'Easy', desc: 'Easy aerobic run', mins: 60 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 65 },
        { day: 'Sunday', type: 'Long', desc: 'Long slow run — aerobic base', mins: 85 },
      ],
    },
    // Week 8 — build + WED introduced
    {
      note: 'Wednesday easy run introduced — first 5-session week. Keep it very easy, below 120 bpm. Long run to 90 min.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run', mins: 55 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run — very easy, below 120 bpm', mins: 35 },
        { day: 'Thursday', type: 'Easy', desc: 'Easy aerobic run', mins: 60 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 70 },
        { day: 'Sunday', type: 'Long', desc: 'Long slow run — aerobic base', mins: 90 },
      ],
    },
    // Week 9 — drop-back
    {
      note: 'Drop-back week. Absorb the last 3 weeks. Every session easy.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run', mins: 45 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run', mins: 30 },
        { day: 'Thursday', type: 'Easy', desc: 'Easy aerobic run', mins: 48 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 55 },
        { day: 'Sunday', type: 'Long', desc: 'Easy long run', mins: 65 },
      ],
    },
    // Week 10 — build
    {
      note: 'Long run hits 100 min for the first time. Stay patient with pace. Nutrition practice begins.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run', mins: 57 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run', mins: 40 },
        { day: 'Thursday', type: 'Easy', desc: 'Easy aerobic run', mins: 62 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 72 },
        { day: 'Sunday', type: 'Long', desc: 'Long slow run — first 100 min long run', mins: 100 },
      ],
    },
    // Week 11 — build
    {
      note: 'Long run to 110 min. Take gels from 45 min in. Cadence focus — target 88 spm.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run', mins: 60 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run', mins: 40 },
        { day: 'Thursday', type: 'Easy', desc: 'Easy aerobic run', mins: 65 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 75 },
        { day: 'Sunday', type: 'Long', desc: 'Long slow run — gel practice from 45 min', mins: 110 },
      ],
    },
    // Week 12 — drop-back
    {
      note: 'Drop-back week. Cut volume but keep all 5 sessions.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run', mins: 48 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run', mins: 35 },
        { day: 'Thursday', type: 'Easy', desc: 'Easy aerobic run', mins: 52 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 58 },
        { day: 'Sunday', type: 'Long', desc: 'Easy long run', mins: 75 },
      ],
    },
    // Week 13 — build
    {
      note: 'Long run to 2 hours for the first time. Proper race day nutrition practice. Gel every 20-25 min.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run', mins: 62 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run', mins: 42 },
        { day: 'Thursday', type: 'Easy', desc: 'Easy aerobic run', mins: 67 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 80 },
        { day: 'Sunday', type: 'Long', desc: 'Long slow run — first 2h long run, full gel practice', mins: 120 },
      ],
    },
    // Week 14 — recalibrated post-injury
    {
      note: 'Recalibrated after injury disruption — realistic build from current fitness. TUE: 55 min easy + 4 x 20 sec strides. THU: 60 min easy + 4 x 20 sec strides. SAT: 65 min easy. SUN: 80 min easy long run below 134 bpm.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run + 4 x 20 sec strides', mins: 55 },
        { day: 'Thursday', type: 'Easy', desc: 'Easy aerobic run + 4 x 20 sec strides', mins: 60 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 65 },
        { day: 'Sunday', type: 'Long', desc: 'Easy long run — below 134 bpm', mins: 80 },
      ],
    },
    // Week 15 — fartlek begins
    {
      note: 'Fartlek begins Thursday. TUE: 55 min easy + 5 x 20 sec strides. THU: 10 min warm up + 6 x 1 min harder effort, 90 sec easy recovery + 10 min cool down. No strides on fartlek days. SAT/SUN easy.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run + 5 x 20 sec strides', mins: 55 },
        { day: 'Thursday', type: 'Fartlek', desc: 'Fartlek — 10 min WU + 6 x 1 min harder effort, 90 sec easy recovery + 10 min CD', mins: 60 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 65 },
        { day: 'Sunday', type: 'Long', desc: 'Easy long run', mins: 75 },
      ],
    },
    // Week 16 — 5K time trial
    {
      note: '5K TIME TRIAL Saturday 22 Aug — Holme Pierrepont parkrun. TUE: 55 min easy + 5 x 20 sec strides. THU: 10 min warm up + 8 x 1 min fartlek, 90 sec easy recovery + 10 min cool down. No strides Thursday. SAT: race it all out. SUN: 80 min easy to flush the legs.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run + 5 x 20 sec strides', mins: 55 },
        { day: 'Thursday', type: 'Fartlek', desc: 'Fartlek — 10 min WU + 8 x 1 min harder effort, 90 sec easy recovery + 10 min CD', mins: 60 },
        { day: 'Saturday', type: 'Race', desc: '5K TIME TRIAL — Holme Pierrepont parkrun', mins: 25 },
        { day: 'Sunday', type: 'Easy', desc: 'Easy recovery run — flush the legs', mins: 80 },
      ],
    },
    // Week 17 — mini taper before quality block
    {
      note: 'Mini taper before quality block. TUE: 55 min easy + 4 x 20 sec strides. THU: 55 min easy + 4 x 20 sec strides. SAT: 45 min easy, no strides. No Sunday long run.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run + 4 x 20 sec strides', mins: 55 },
        { day: 'Thursday', type: 'Easy', desc: 'Easy aerobic run + 4 x 20 sec strides', mins: 55 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 45 },
      ],
    },
    // Week 18 — NSM rep intro
    {
      note: 'First quality sessions — NSM rep format. TUE: 10 min warm up + 4 x 3 min at 157-163 bpm, 60 sec jog recovery + 10 min cool down. THU: 10 min warm up + 3 x 6 min at 160-166 bpm, 60 sec jog recovery + 10 min cool down. Last rep should approach but not exceed 166 bpm.',
      sessions: [
        { day: 'Tuesday', type: 'Intervals', desc: 'NSM reps — 4 x 3 min at 157-163 bpm, 60 sec jog recovery', mins: 45 },
        { day: 'Thursday', type: 'Intervals', desc: 'NSM reps — 3 x 6 min at 160-166 bpm, 60 sec jog recovery', mins: 55 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 55 },
        { day: 'Sunday', type: 'Easy', desc: 'Easy aerobic run', mins: 65 },
      ],
    },
  ]

  // Base phase starts on a Tuesday (5 May 2026)
  // Find Monday of that week: 4 May 2026
  const firstMonday = '2026-05-04'

  weekTemplates.forEach((template, i) => {
    const weekMonday = addDays(firstMonday, i * 7)
    const sessions: TrainingSession[] = template.sessions.map((s) => ({
      day: s.day,
      date: sessionDate(weekMonday, s.day),
      type: s.type,
      description: s.desc,
      plannedMinutes: s.mins,
    }))
    weeks.push({ weekNumber: i + 1, startDate: weekMonday, sessions, note: (template as { note?: string }).note })
  })

  return weeks
}

// DEVELOPMENT PHASE — 12 weeks, starting 8 Sep 2026
function buildDevelopmentPhase(): TrainingWeek[] {
  const weeks: TrainingWeek[] = []
  const firstMonday = '2026-09-07' // Monday of week containing 8 Sep

  const weekTemplates = [
    // Week 1 — 10K block: build reps
    {
      note: 'Build reps. TUE: 5 x 3 min at 157-163 bpm, 60 sec jog recovery. THU: 4 x 6 min at 160-166 bpm, 60 sec jog recovery. Sunday easy long run below 134 bpm.',
      sessions: [
        { day: 'Tuesday', type: 'Intervals', desc: 'NSM reps — 5 x 3 min at 157-163 bpm, 60 sec jog recovery', mins: 45 },
        { day: 'Thursday', type: 'Intervals', desc: 'NSM reps — 4 x 6 min at 160-166 bpm, 60 sec jog recovery', mins: 55 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 55 },
        { day: 'Sunday', type: 'Long', desc: 'Easy long run — below 134 bpm', mins: 70 },
      ],
    },
    // Week 2 — 10K block: drop-back
    {
      note: 'Drop-back week. TUE: 4 x 3 min only, 60 sec jog recovery. THU: easy run, no reps. Cut volume 30%.',
      sessions: [
        { day: 'Tuesday', type: 'Intervals', desc: 'NSM reps — 4 x 3 min at 157-163 bpm, 60 sec jog recovery', mins: 45 },
        { day: 'Thursday', type: 'Easy', desc: 'Easy aerobic run — no reps', mins: 45 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 50 },
        { day: 'Sunday', type: 'Easy', desc: 'Easy aerobic run', mins: 60 },
      ],
    },
    // Week 3 — 10K block: taper
    {
      note: 'Race week taper. TUE: 4 x 3 min at 10K effort, 60 sec jog recovery — last quality session. THU: 20 min easy + 4 x 20 sec strides. SAT: 25 min easy shakeout, relaxed.',
      sessions: [
        { day: 'Tuesday', type: 'Intervals', desc: '10K taper — 4 x 3 min at 10K effort, 60 sec jog recovery', mins: 40 },
        { day: 'Thursday', type: 'Strides', desc: '20 min easy + 4 x 20 sec strides', mins: 30 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy shakeout — relaxed', mins: 25 },
      ],
    },
    // Week 4 — VITALITY 10K
    {
      note: 'VITALITY 10K — 27 September 2026. Target sub-44:00 (4:21/km). Warm up: 10 min easy jog, 4 x 20 sec strides (60 sec walk between), 2 min walk to start. Start 25 min before your wave. Go out at 4:20-4:22/km and hold. Don\'t go faster than 4:15/km in first 2km regardless of how good you feel.',
      sessions: [
        { day: 'Sunday', type: 'Race', desc: 'VITALITY 10K — Target sub-44:00 (4:21/km)', mins: 50 },
      ],
    },
    // Week 5
    {
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run', mins: 60 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run', mins: 55 },
        { day: 'Thursday', type: 'Tempo', desc: 'Warm up + 40 min marathon tempo', mins: 70 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 75 },
        { day: 'Sunday', type: 'Long', desc: 'Long run with 50 min at marathon pace', mins: 155 },
      ],
    },
    // Week 6
    {
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run', mins: 60 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run', mins: 55 },
        { day: 'Thursday', type: 'Intervals', desc: '8×1km at LT2 with 90s jog recovery', mins: 70 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 75 },
        { day: 'Sunday', type: 'Long', desc: 'Long run with 60 min at marathon pace', mins: 160 },
      ],
    },
    // Week 7
    {
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run', mins: 60 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run', mins: 55 },
        { day: 'Thursday', type: 'Tempo', desc: 'Warm up + 45 min marathon tempo', mins: 70 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 80 },
        { day: 'Sunday', type: 'Long', desc: 'Long run with 70 min at marathon pace', mins: 165 },
      ],
    },
    // Week 8 — recovery
    {
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy recovery run', mins: 50 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run', mins: 45 },
        { day: 'Thursday', type: 'Easy', desc: 'Easy recovery run', mins: 50 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 65 },
        { day: 'Sunday', type: 'Long', desc: 'Easy long run', mins: 120 },
      ],
    },
    // Week 9
    {
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run', mins: 65 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run', mins: 55 },
        { day: 'Thursday', type: 'Intervals', desc: '10×1km at LT2 with 90s jog recovery', mins: 75 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 80 },
        { day: 'Sunday', type: 'Long', desc: 'Long run — 80 min at marathon pace', mins: 170 },
      ],
    },
    // Week 10
    {
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run', mins: 65 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run', mins: 55 },
        { day: 'Thursday', type: 'Tempo', desc: 'Warm up + 50 min marathon tempo', mins: 75 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 80 },
        { day: 'Sunday', type: 'Long', desc: 'Long run — 90 min at marathon pace', mins: 175 },
      ],
    },
    // Week 11
    {
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run', mins: 65 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run', mins: 60 },
        { day: 'Thursday', type: 'Intervals', desc: '5×2km at LT2 with 2 min jog recovery', mins: 75 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 80 },
        { day: 'Sunday', type: 'Long', desc: 'Long run — race simulation effort', mins: 180 },
      ],
    },
    // Week 12 — transition recovery
    {
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy recovery run', mins: 50 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run', mins: 45 },
        { day: 'Thursday', type: 'Easy', desc: 'Easy recovery run', mins: 50 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 65 },
        { day: 'Sunday', type: 'Long', desc: 'Easy long run — development phase finale', mins: 130 },
      ],
    },
  ]

  weekTemplates.forEach((template, i) => {
    const weekMonday = addDays(firstMonday, i * 7)
    const sessions: TrainingSession[] = template.sessions.map((s) => ({
      day: s.day,
      date: sessionDate(weekMonday, s.day),
      type: s.type,
      description: s.desc,
      plannedMinutes: s.mins,
    }))
    weeks.push({ weekNumber: i + 1, startDate: weekMonday, sessions, note: (template as { note?: string }).note })
  })

  return weeks
}

// PEAK PHASE — 14 weeks, starting 1 Dec 2026
function buildPeakPhase(): TrainingWeek[] {
  const weeks: TrainingWeek[] = []
  const firstMonday = '2026-11-30' // Monday of week containing 1 Dec

  const weekTemplates = [
    // Week 1
    {
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run', mins: 60 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run', mins: 55 },
        { day: 'Thursday', type: 'Marathon Pace', desc: 'Warm up + 45 min at marathon pace (170 bpm / 4:15/km)', mins: 70 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 75 },
        { day: 'Sunday', type: 'Long', desc: '30 km long run with last 10 km at marathon pace', mins: 175 },
      ],
    },
    // Week 2
    {
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run', mins: 60 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run', mins: 55 },
        { day: 'Thursday', type: 'Marathon Pace', desc: 'Warm up + 50 min at marathon pace', mins: 75 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 75 },
        { day: 'Sunday', type: 'Long', desc: '32 km long run with last 12 km at marathon pace', mins: 185 },
      ],
    },
    // Week 3
    {
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run', mins: 65 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run', mins: 55 },
        { day: 'Thursday', type: 'Intervals', desc: '5×1 mile at LT2 with 2 min recovery', mins: 75 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 80 },
        { day: 'Sunday', type: 'Long', desc: '33 km long run — strong finish', mins: 190 },
      ],
    },
    // Week 4 — recovery
    {
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy recovery run', mins: 50 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run', mins: 45 },
        { day: 'Thursday', type: 'Easy', desc: 'Easy recovery run', mins: 50 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 65 },
        { day: 'Sunday', type: 'Long', desc: 'Easy long run', mins: 140 },
      ],
    },
    // Week 5
    {
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run', mins: 65 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run', mins: 55 },
        { day: 'Thursday', type: 'Marathon Pace', desc: 'Warm up + 55 min at marathon pace', mins: 75 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 80 },
        { day: 'Sunday', type: 'Long', desc: '34 km long run with last 15 km at marathon pace', mins: 195 },
      ],
    },
    // Week 6
    {
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run', mins: 65 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run', mins: 60 },
        { day: 'Thursday', type: 'Intervals', desc: '3×3km at LT2 with 3 min recovery', mins: 80 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 80 },
        { day: 'Sunday', type: 'Long', desc: '35 km long run — peak long run', mins: 200 },
      ],
    },
    // Week 7
    {
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run', mins: 65 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run', mins: 60 },
        { day: 'Thursday', type: 'Marathon Pace', desc: 'Warm up + 60 min at marathon pace', mins: 80 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 80 },
        { day: 'Sunday', type: 'Long', desc: '35 km long run — repeat peak run', mins: 200 },
      ],
    },
    // Week 8 — recovery
    {
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy recovery run', mins: 50 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run', mins: 45 },
        { day: 'Thursday', type: 'Easy', desc: 'Easy recovery run', mins: 50 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 65 },
        { day: 'Sunday', type: 'Long', desc: 'Easy long run', mins: 150 },
      ],
    },
    // Week 9
    {
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run', mins: 65 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run', mins: 60 },
        { day: 'Thursday', type: 'Marathon Pace', desc: 'Warm up + 65 min at marathon pace', mins: 80 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 80 },
        { day: 'Sunday', type: 'Long', desc: '33 km long run — strong marathon pace finish', mins: 195 },
      ],
    },
    // Week 10
    {
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run', mins: 65 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run', mins: 60 },
        { day: 'Thursday', type: 'Intervals', desc: '4×2 miles at LT2 with 3 min recovery', mins: 80 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 80 },
        { day: 'Sunday', type: 'Long', desc: '32 km long run with 20 km at marathon pace', mins: 190 },
      ],
    },
    // Week 11
    {
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run', mins: 65 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run', mins: 60 },
        { day: 'Thursday', type: 'Marathon Pace', desc: 'Warm up + 60 min at marathon pace', mins: 80 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 75 },
        { day: 'Sunday', type: 'Long', desc: '30 km long run — begin taper down', mins: 180 },
      ],
    },
    // Week 12 — begin taper
    {
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run', mins: 55 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run', mins: 50 },
        { day: 'Thursday', type: 'Marathon Pace', desc: 'Warm up + 45 min at marathon pace', mins: 65 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 65 },
        { day: 'Sunday', type: 'Long', desc: '26 km long run', mins: 155 },
      ],
    },
    // Week 13
    {
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run', mins: 50 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run', mins: 45 },
        { day: 'Thursday', type: 'Marathon Pace', desc: 'Warm up + 35 min at marathon pace', mins: 55 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 55 },
        { day: 'Sunday', type: 'Long', desc: '22 km long run', mins: 135 },
      ],
    },
    // Week 14 — final peak week
    {
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run', mins: 45 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run', mins: 40 },
        { day: 'Thursday', type: 'Strides', desc: 'Easy + 6×20s race pace strides', mins: 45 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 45 },
        { day: 'Sunday', type: 'Long', desc: '18 km easy run — peak phase done', mins: 110 },
      ],
    },
  ]

  weekTemplates.forEach((template, i) => {
    const weekMonday = addDays(firstMonday, i * 7)
    const sessions: TrainingSession[] = template.sessions.map((s) => ({
      day: s.day,
      date: sessionDate(weekMonday, s.day),
      type: s.type,
      description: s.desc,
      plannedMinutes: s.mins,
    }))
    weeks.push({ weekNumber: i + 1, startDate: weekMonday, sessions })
  })

  return weeks
}

// TAPER PHASE — 3 weeks, starting 6 April 2027
function buildTaperPhase(): TrainingWeek[] {
  const weeks: TrainingWeek[] = []
  const firstMonday = '2027-04-05'

  const weekTemplates = [
    // Taper week 1
    {
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run', mins: 40 },
        { day: 'Thursday', type: 'Marathon Pace', desc: 'Warm up + 25 min at marathon pace', mins: 45 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 40 },
        { day: 'Sunday', type: 'Long', desc: '16 km easy run', mins: 95 },
      ],
    },
    // Taper week 2
    {
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run', mins: 35 },
        { day: 'Thursday', type: 'Marathon Pace', desc: 'Warm up + 15 min at marathon pace + 4×100m strides', mins: 40 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy shakeout run', mins: 30 },
        { day: 'Sunday', type: 'Easy', desc: '10 km easy run', mins: 55 },
      ],
    },
    // Race week
    {
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy shakeout — 20 min', mins: 20 },
        { day: 'Thursday', type: 'Strides', desc: '15 min easy + 4×100m strides', mins: 20 },
        { day: 'Saturday', type: 'Easy', desc: '10 min easy shakeout', mins: 10 },
        { day: 'Sunday', type: 'Race', desc: 'LONDON MARATHON — Target 2:58:00', mins: 178 },
      ],
    },
  ]

  weekTemplates.forEach((template, i) => {
    const weekMonday = addDays(firstMonday, i * 7)
    const sessions: TrainingSession[] = template.sessions.map((s) => ({
      day: s.day,
      date: sessionDate(weekMonday, s.day),
      type: s.type,
      description: s.desc,
      plannedMinutes: s.mins,
    }))
    weeks.push({ weekNumber: i + 1, startDate: weekMonday, sessions })
  })

  return weeks
}

export const TRAINING_PLAN: Record<string, Phase> = {
  base: {
    id: 'base',
    name: 'Base Phase',
    startDate: PHASE_STARTS.base,
    endDate: '2026-09-07',
    weeks: buildBasePhase(),
  },
  development: {
    id: 'development',
    name: 'Development Phase',
    startDate: PHASE_STARTS.development,
    endDate: '2026-11-29',
    weeks: buildDevelopmentPhase(),
  },
  peak: {
    id: 'peak',
    name: 'Peak Phase',
    startDate: PHASE_STARTS.peak,
    endDate: '2027-04-05',
    weeks: buildPeakPhase(),
  },
  taper: {
    id: 'taper',
    name: 'Taper',
    startDate: PHASE_STARTS.taper,
    endDate: '2027-04-27',
    weeks: buildTaperPhase(),
  },
}

export function getAllSessions(): TrainingSession[] {
  return Object.values(TRAINING_PLAN).flatMap((phase) =>
    phase.weeks.flatMap((week) => week.sessions)
  )
}

export function getCurrentPhase(): string {
  const today = new Date().toISOString().split('T')[0]
  for (const [id, phase] of Object.entries(TRAINING_PLAN)) {
    if (today >= phase.startDate && today <= phase.endDate) return id
  }
  if (today < TRAINING_PLAN.base.startDate) return 'base'
  return 'taper'
}
