import { Phase, TrainingWeek, TrainingSession } from './types'

// Training days: Tue, Thu, Sat, Sun (+ Wed from week 8 of base)
// Phase start dates
export const PHASE_STARTS = {
  base: '2026-05-05',        // 18 weeks
  development: '2026-09-08', // 12 weeks
  peak: '2026-11-30',        // 18 weeks
  taper: '2027-04-05',       // 3 weeks
  race: '2027-04-24', // Saturday
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
    // Week 5 — volume rebuild post-race, no quality yet (CTL 26, needs 30+ before intensity returns)
    // Weeks 6-12 rewritten 15 Oct 2026: steady easy volume, one steady run, then one sub-threshold session
    {
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run', mins: 55 },
        { day: 'Thursday', type: 'Easy', desc: 'Easy aerobic run', mins: 60 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run', mins: 55 },
        { day: 'Sunday', type: 'Long', desc: 'Easy long run — below 148 bpm throughout', mins: 60 },
      ],
    },
    // Week 6
    {
      note: 'Rewritten 15 Oct. Steady easy volume. Easy runs HR under 150 (lab LT1 156).',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 42 },
        { day: 'Thursday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 56 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 55 },
        { day: 'Sunday', type: 'Long', desc: 'Easy long run — HR under 150, 75 min cap', mins: 75 },
      ],
    },
    // Week 7
    {
      note: 'Steady volume week 1. Thursday steady run added: top of aerobic range, never over LT1 (156).',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 45 },
        { day: 'Thursday', type: 'Steady', desc: 'Steady — 15 min easy, then HR 148-155 (never over 156), last 5 min easy', mins: 55 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 55 },
        { day: 'Sunday', type: 'Long', desc: 'Easy long run — HR under 150, 75 min cap', mins: 75 },
      ],
    },
    // Week 8
    {
      note: 'Steady volume week 2.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 55 },
        { day: 'Thursday', type: 'Steady', desc: 'Steady — 15 min easy, then HR 148-155 (never over 156), last 5 min easy', mins: 55 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 60 },
        { day: 'Sunday', type: 'Long', desc: 'Easy long run — HR under 150, 75 min cap', mins: 75 },
      ],
    },
    // Week 9
    {
      note: 'Steady volume week 3.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 55 },
        { day: 'Thursday', type: 'Steady', desc: 'Steady — 15 min easy, then HR 148-155 (never over 156), last 5 min easy', mins: 60 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 60 },
        { day: 'Sunday', type: 'Long', desc: 'Easy long run — HR under 150, 75 min cap', mins: 75 },
      ],
    },
    // Week 10
    {
      note: 'Steady volume week 4. Gate for next week: CTL above 30, 4 runs a week for 2 weeks, no niggles. Otherwise repeat this week.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 55 },
        { day: 'Thursday', type: 'Steady', desc: 'Steady — 15 min easy, then HR 148-155 (never over 156), last 5 min easy', mins: 60 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 60 },
        { day: 'Sunday', type: 'Long', desc: 'Easy long run — HR under 150, 75 min cap', mins: 75 },
      ],
    },
    // Week 11
    {
      note: 'First sub-threshold session. Reps HR 157-163, should feel too easy. Stop if anything tweaks.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 55 },
        { day: 'Thursday', type: 'Intervals', desc: 'Sub-threshold — 10 min WU + 5 x 3 min at 4:50-5:00/km (HR 157-163), 60 sec jog + 10 min CD', mins: 45 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 60 },
        { day: 'Sunday', type: 'Long', desc: 'Easy long run — HR under 150, 75 min cap', mins: 75 },
      ],
    },
    // Week 12
    {
      note: 'Sub-threshold week 2. Development phase finale.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 55 },
        { day: 'Thursday', type: 'Intervals', desc: 'Sub-threshold — 10 min WU + 6 x 3 min at 4:50-5:00/km (HR 157-163), 60 sec jog + 10 min CD', mins: 50 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 65 },
        { day: 'Sunday', type: 'Long', desc: 'Easy long run — HR under 150, 75 min cap', mins: 75 },
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

// PEAK PHASE — 18 weeks, 30 Nov 2026 to 4 Apr 2027 (rewritten 18 Oct 2026 for the 3:10 A goal)
// Zones from the May 2024 lab test: easy under 150, LT1 156, sub-threshold reps 157-163, LT2 170.
// One quality day (Thursday) plus a marathon-pace finish on the long run from week 7. 3 build weeks + 1 recovery.
function buildPeakPhase(): TrainingWeek[] {
  const weeks: TrainingWeek[] = []
  const firstMonday = '2026-11-30' // Monday of week containing 1 Dec

  const weekTemplates = [
    // Week 1
    {
      note: 'Peak 1. Build block 1 of 4. Thursday reps carry on from Development; long run starts growing.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 55 },
        { day: 'Thursday', type: 'Intervals', desc: 'Sub-threshold — 15 min WU + 6 x 4 min at HR 157-163 (~4:45-4:55/km), 60 sec jog + 10 min CD', mins: 54 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 60 },
        { day: 'Sunday', type: 'Long', desc: 'Easy long run — HR under 150', mins: 85 },
      ],
    },
    // Week 2
    {
      note: 'Peak 2.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 60 },
        { day: 'Thursday', type: 'Intervals', desc: 'Sub-threshold — 15 min WU + 5 x 5 min at HR 157-163 (~4:45-4:55/km), 60 sec jog + 10 min CD', mins: 54 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 60 },
        { day: 'Sunday', type: 'Long', desc: 'Easy long run — HR under 150', mins: 95 },
      ],
    },
    // Week 3
    {
      note: 'Peak 3. Strides added on Tuesday.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run + 6 x 20 sec strides — HR under 150', mins: 60 },
        { day: 'Thursday', type: 'Intervals', desc: 'Sub-threshold — 15 min WU + 6 x 5 min at HR 157-163 (~4:45-4:55/km), 60 sec jog + 10 min CD', mins: 60 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 65 },
        { day: 'Sunday', type: 'Long', desc: 'Easy long run — HR under 150', mins: 105 },
      ],
    },
    // Week 4
    {
      note: 'Peak 4 — recovery week over Christmas. Cut volume, keep it easy and flexible around plans.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 45 },
        { day: 'Thursday', type: 'Intervals', desc: 'Sub-threshold — 15 min WU + 4 x 4 min at HR 157-163 (~4:45-4:55/km), 60 sec jog + 10 min CD', mins: 44 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 50 },
        { day: 'Sunday', type: 'Long', desc: 'Easy long run — HR under 150', mins: 80 },
      ],
    },
    // Week 5
    {
      note: 'Peak 5. Build block 2. Wednesday easy run comes back: five runs a week from here.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run + 6 x 20 sec strides — HR under 150', mins: 60 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run — HR under 150, keep it very easy', mins: 35 },
        { day: 'Thursday', type: 'Intervals', desc: 'Sub-threshold — 15 min WU + 4 x 8 min at HR 157-163 (~4:45-4:55/km), 90 sec jog + 10 min CD', mins: 62 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 60 },
        { day: 'Sunday', type: 'Long', desc: 'Easy long run — HR under 150', mins: 110 },
      ],
    },
    // Week 6
    {
      note: 'Peak 6.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run + 6 x 20 sec strides — HR under 150', mins: 60 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 40 },
        { day: 'Thursday', type: 'Intervals', desc: 'Sub-threshold — 15 min WU + 5 x 8 min at HR 157-163 (~4:45-4:55/km), 90 sec jog + 10 min CD', mins: 71 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 65 },
        { day: 'Sunday', type: 'Long', desc: 'Easy long run — HR under 150', mins: 120 },
      ],
    },
    // Week 7
    {
      note: 'Peak 7. First marathon-pace finish on the long run. Only one new thing this week.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run + 6 x 20 sec strides — HR under 150', mins: 60 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 40 },
        { day: 'Thursday', type: 'Intervals', desc: 'Sub-threshold — 15 min WU + 5 x 8 min at HR 157-163 (~4:45-4:55/km), 90 sec jog + 10 min CD', mins: 71 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 65 },
        { day: 'Sunday', type: 'Long', desc: 'Long run — easy (HR under 150), last 20 min at marathon pace 4:30/km (HR under 165)', mins: 125 },
      ],
    },
    // Week 8
    {
      note: 'Peak 8 — recovery week. Thursday light, long run easy.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 50 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 35 },
        { day: 'Thursday', type: 'Intervals', desc: 'Sub-threshold — 15 min WU + 4 x 5 min at HR 157-163 (~4:45-4:55/km), 60 sec jog + 10 min CD', mins: 48 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 55 },
        { day: 'Sunday', type: 'Long', desc: 'Easy long run — HR under 150', mins: 95 },
      ],
    },
    // Week 9
    {
      note: 'Peak 9. Build block 3. Longer sub-threshold reps.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run + 6 x 20 sec strides — HR under 150', mins: 65 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 45 },
        { day: 'Thursday', type: 'Intervals', desc: 'Sub-threshold — 15 min WU + 3 x 12 min at HR 157-163 (~4:45-4:55/km), 120 sec jog + 10 min CD', mins: 65 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 65 },
        { day: 'Sunday', type: 'Long', desc: 'Long run — easy (HR under 150), last 30 min at marathon pace 4:30/km (HR under 165)', mins: 135 },
      ],
    },
    // Week 10
    {
      note: 'Peak 10.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run + 6 x 20 sec strides — HR under 150', mins: 65 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 45 },
        { day: 'Thursday', type: 'Intervals', desc: 'Sub-threshold — 15 min WU + 4 x 10 min at HR 157-163 (~4:45-4:55/km), 90 sec jog + 10 min CD', mins: 70 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 70 },
        { day: 'Sunday', type: 'Long', desc: 'Long run — easy (HR under 150), last 35 min at marathon pace 4:30/km (HR under 165)', mins: 140 },
      ],
    },
    // Week 11
    {
      note: 'Peak 11.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run + 6 x 20 sec strides — HR under 150', mins: 65 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 45 },
        { day: 'Thursday', type: 'Intervals', desc: 'Sub-threshold — 15 min WU + 3 x 15 min at HR 157-163 (~4:45-4:55/km), 120 sec jog + 10 min CD', mins: 74 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 70 },
        { day: 'Sunday', type: 'Long', desc: 'Long run — easy (HR under 150), last 40 min at marathon pace 4:30/km (HR under 165)', mins: 145 },
      ],
    },
    // Week 12
    {
      note: 'Peak 12 — recovery week with a half marathon tune-up on Sunday (race or solo time trial, event to confirm). Target sub-1:30 checks 3:10 is on.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run + 6 x 20 sec strides — HR under 150', mins: 50 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 35 },
        { day: 'Thursday', type: 'Intervals', desc: '15 min WU + 4 x 3 min at HR 157-163, 60 sec jog + 10 min CD — sharpener', mins: 40 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy 20 min + 4 x 20 sec strides', mins: 25 },
        { day: 'Sunday', type: 'Race', desc: 'HALF MARATHON TUNE-UP — even pacing, aim 4:15-4:20/km', mins: 110 },
      ],
    },
    // Week 13
    {
      note: 'Peak 13. Build block 4. Easy week after the half for the first 3 days, then back to the plan.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 50 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 40 },
        { day: 'Thursday', type: 'Intervals', desc: 'Sub-threshold — 15 min WU + 3 x 15 min at HR 157-163 (~4:45-4:55/km), 120 sec jog + 10 min CD', mins: 74 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 70 },
        { day: 'Sunday', type: 'Long', desc: 'Long run — easy (HR under 150), last 40 min at marathon pace 4:30/km (HR under 165)', mins: 150 },
      ],
    },
    // Week 14
    {
      note: 'Peak 14.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run + 6 x 20 sec strides — HR under 150', mins: 65 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 45 },
        { day: 'Thursday', type: 'Intervals', desc: 'Sub-threshold — 15 min WU + 2 x 20 min at HR 157-163 (~4:45-4:55/km), 180 sec jog + 10 min CD', mins: 68 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 70 },
        { day: 'Sunday', type: 'Long', desc: 'Long run — easy (HR under 150), last 45 min at marathon pace 4:30/km (HR under 165)', mins: 160 },
      ],
    },
    // Week 15
    {
      note: 'Peak 15.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run + 6 x 20 sec strides — HR under 150', mins: 60 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 45 },
        { day: 'Thursday', type: 'Intervals', desc: 'Sub-threshold — 15 min WU + 3 x 15 min at HR 157-163 (~4:45-4:55/km), 120 sec jog + 10 min CD', mins: 74 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 65 },
        { day: 'Sunday', type: 'Long', desc: 'Long run — easy (HR under 150), last 50 min at marathon pace 4:30/km (HR under 165)', mins: 170 },
      ],
    },
    // Week 16
    {
      note: 'Peak 16 — recovery week.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 50 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 40 },
        { day: 'Thursday', type: 'Intervals', desc: 'Sub-threshold — 15 min WU + 4 x 6 min at HR 157-163 (~4:45-4:55/km), 60 sec jog + 10 min CD', mins: 52 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 60 },
        { day: 'Sunday', type: 'Long', desc: 'Easy long run — HR under 150', mins: 110 },
      ],
    },
    // Week 17
    {
      note: 'Peak 17. Biggest week.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run + 6 x 20 sec strides — HR under 150', mins: 60 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 45 },
        { day: 'Thursday', type: 'Intervals', desc: 'Sub-threshold — 15 min WU + 2 x 20 min at HR 157-163 (~4:45-4:55/km), 180 sec jog + 10 min CD', mins: 68 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 65 },
        { day: 'Sunday', type: 'Long', desc: 'Long run — easy (HR under 150), last 55 min at marathon pace 4:30/km (HR under 165)', mins: 175 },
      ],
    },
    // Week 18
    {
      note: 'Peak 18. Final long run (~32 km), three weeks before race day.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run + 6 x 20 sec strides — HR under 150', mins: 60 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 45 },
        { day: 'Thursday', type: 'Intervals', desc: 'Sub-threshold — 15 min WU + 3 x 12 min at HR 157-163 (~4:45-4:55/km), 120 sec jog + 10 min CD', mins: 65 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 65 },
        { day: 'Sunday', type: 'Long', desc: 'Long run — easy (HR under 150), last 60 min at marathon pace 4:30/km (HR under 165) — dress rehearsal: race kit, race breakfast, 120 g carbs/hr', mins: 180 },
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

// TAPER PHASE — 3 weeks, 5 April to race day Saturday 24 April 2027
function buildTaperPhase(): TrainingWeek[] {
  const weeks: TrainingWeek[] = []
  const firstMonday = '2027-04-05'

  const weekTemplates = [
    // Taper week 1
    {
      note: 'Taper 1. Volume down about 20%, keep some sharpness.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run + 6 x 20 sec strides — HR under 150', mins: 55 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 40 },
        { day: 'Thursday', type: 'Intervals', desc: 'Sub-threshold — 15 min WU + 3 x 10 min at HR 157-163, 90 sec jog + 10 min CD', mins: 58 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 55 },
        { day: 'Sunday', type: 'Long', desc: 'Long run — easy (HR under 150), last 30 min at marathon pace 4:30/km (HR under 165)', mins: 120 },
      ],
    },
    // Taper week 2
    {
      note: 'Taper 2. Volume down about 40%. Last marathon-pace session Thursday.',
      sessions: [
        { day: 'Tuesday', type: 'Easy', desc: 'Easy aerobic run + 6 x 20 sec strides — HR under 150', mins: 45 },
        { day: 'Wednesday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 35 },
        { day: 'Thursday', type: 'Marathon Pace', desc: '15 min WU + 20 min at marathon pace 4:30/km + 10 min CD', mins: 45 },
        { day: 'Saturday', type: 'Easy', desc: 'Easy aerobic run — HR under 150', mins: 45 },
        { day: 'Sunday', type: 'Long', desc: 'Easy 80 min, last 15 at marathon pace', mins: 80 },
      ],
    },
    // Taper week 3
    {
      note: 'Race week. Carb load from Thursday. Race Saturday 24 April: go out at 4:30-4:32/km, nothing faster than 4:28 in the first 5 km.',
      sessions: [
        { day: 'Monday', type: 'Easy', desc: 'Easy 30 min', mins: 30 },
        { day: 'Tuesday', type: 'Easy', desc: 'Easy 35 min + 4 x 1 min at marathon pace', mins: 35 },
        { day: 'Thursday', type: 'Strides', desc: 'Easy 25 min + 4 x 20 sec strides', mins: 25 },
        { day: 'Friday', type: 'Easy', desc: '10 min easy shakeout', mins: 10 },
        { day: 'Saturday', type: 'Race', desc: 'LONDON MARATHON — Saturday 24 April. A goal 3:10:00 (4:30/km)', mins: 190 },
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
    endDate: '2027-04-04',
    weeks: buildPeakPhase(),
  },
  taper: {
    id: 'taper',
    name: 'Taper',
    startDate: PHASE_STARTS.taper,
    endDate: '2027-04-24',
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
