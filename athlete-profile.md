# Athlete Profile — Mike Robinson

## Sport
Marathon runner (road)

## Goal races
- **Vitality 10K** — 27 September 2026, target sub-44:00 (4:21/km)
- **London Marathon** — 27 April 2027, target 2:58:00 (4:13/km)

## Current phase
Development (started 8 Sep 2026, 12 weeks). Currently in Week 3 — race week taper for Vitality 10K.

## Max HR
194 bpm (observed 5 Sep 2026, 5K time trial at Holme Pierrepont parkrun)

## Heart rate zones
| Zone | Name | HR range |
|---|---|---|
| 1 | Recovery | < 117 |
| 2 | Easy / Aerobic | 117–148 |
| 3 | Tempo | 149–163 |
| 4 | Threshold | 164–175 |
| 5 | VO2max | 176–194 |

## Key paces (as of Sep 2026)
| Pace type | Per km |
|---|---|
| Easy | 6:30–6:50 |
| Marathon (target) | 4:13 |
| Tempo | 5:00–5:15 |
| Threshold | 4:40–4:50 |
| 5K race | 4:11 (adjusted, ~20:54 without traffic in first km) |
| 10K race (target) | 4:21 |

## Key benchmarks
- Berlin Marathon: 3:37 (Sep 2024)
- 5K TT: 21:33 (5 Sep 2026, Holme Pierrepont parkrun, max HR 194)
- Vitality 10K: 43:56 (27 Sep 2026, 4:24/km avg)
- Easy run avg HR: 135–140
- Easy run avg pace: 6:30–6:50/km

## Current niggles
- None active (as of 5 Oct 2026). Hamstring (post-NSM reps), calf (race week), and peroneal (carbon shoes at Vitality) all resolved.

## Injury history
- Knee issue during Base W3 (May 2026)

## Training structure
- Base: 18 weeks from 5 May 2026 (Tue/Thu/Sat/Sun, Wed added from W8)
- Development: 12 weeks from 8 Sep 2026 (NSM reps, 10K block, then marathon-specific)
- Peak: 14 weeks from 1 Dec 2026
- Taper: 3 weeks from 6 Apr 2027
- Full plan defined in `lib/trainingData.ts`

## Data sources
- Garmin watch synced to Intervals.icu (intervals-mcp server) and Strava
- Strava connection for per-km splits (lib/strava.ts, auto-refresh)

## Training notes
- Typical run days: Tuesday, Thursday, Saturday, Sunday (+ Wednesday in higher volume weeks)
- Easy runs sit at top of Z2 (135–140 HR). Long runs prescribed below 134 bpm.
- Structured speed work introduced Base W15 (fartlek), NSM reps from W18.

---

## Coaching philosophy

Written 4 October 2026 after a full review of Mike's training data (May–Oct 2026), interview, and deep research into the Norwegian Singles Method.

### What I'm training for and why

London Marathon, 27 April 2027. The target time (sub-3:00) is ambitious but secondary. The real objective is to maximise aerobic capacity before the marathon-specific block begins, then let race fitness reveal what time is realistic. This is not about chasing a number on a clock. It's about building the biggest engine possible and racing the body I've built, not the body I wish I had.

### The method: Norwegian Singles, adapted for marathon

The coaching philosophy is rooted in the Norwegian Singles Method — the community-developed adaptation of the Ingebrigtsen/Bakken double-threshold system, simplified for runners with jobs, families and limited training hours. The key influences:

- **Kristoffer Ingebrigtsen** — the eldest Ingebrigtsen brother who lost 25kg and ran 1:12 for the half marathon training once per day with a full-time job. His approach: three sub-threshold sessions per week, easy runs genuinely easy, conservative progression, no dreading workouts. His results came from restraint and consistency, not heroic efforts.
- **James Copeland (sirpoc84)** — went from a 28-minute 5K to 15:01 and a 2:24 debut marathon in his 40s on roughly 7 hours per week. His core insight: maximise chronic training load (CTL) within limited time by replacing VO2max intervals and mixed-intensity sessions with frequent sub-threshold work. Same stimulus, less fatigue, faster recovery, more total quality volume.
- **Stephen Seiler** — the sport scientist who observed (not invented) the 80/20 intensity distribution in elite endurance athletes. 80%+ of sessions below LT1, the remaining 15-20% at threshold or above. The Norwegian Singles method operationalises this research for time-limited athletes.

### The five principles

**1. Restraint is the work**

The defining feature of this philosophy. Sub-threshold sessions sit 5-10 seconds per km slower than LT2 pace, targeting 2-3 mmol/L blood lactate. The effort feels "too easy" — that's the point. You accumulate more quality volume by never crossing the line into real threshold work, which means you can repeat the session every other day without the fatigue debt. Sirpoc84's rule: "9/10 runners will push too hard." Mike's data confirms he's not the exception — every injury in this cycle appeared when intensity arrived. The watch keeps pace honest. No exceptions.

**2. Consistency beats peak load**

Mike's biggest performance limiter is not fitness — it's volume consistency. Weekly km has bounced between 8km and 41km over the last 6 months. The best training block (Aug 3-16: four weeks of 36-37km, 4 runs, stable HRV) produced steady CTL gains with zero niggles. The worst periods all share one trait: disrupted rhythm followed by an attempt to "catch up". This philosophy never chases missed volume. A bad week is absorbed, not compensated for. The target is a narrow band of weekly volume maintained for months, not occasional big weeks separated by recovery craters.

**3. Easy means easy, and that's non-negotiable**

Mike already does this well — easy runs sit at 135-140 HR (solidly Z2, well below LT1 at 148). This is the foundation the entire method is built on. Easy runs exist to build aerobic base and enable recovery from quality sessions. They are not "moderate" runs. They are not "I felt good so I pushed a bit". Heart rate ceiling on easy days: 148 bpm (LT1). If it creeps above on Mapperley hills, slow down or walk. No ego.

Sources: Seiler's 80/20 research; sirpoc84's rule of <70% HRmax on easy days; Kristoffer Ingebrigtsen's discipline of running 6:30-6:45/km on easy days regardless of how he felt.

**4. Introduce intensity like you're defusing a bomb**

Mike's injury pattern is clear and consistent: easy volume — fine; speed work arrives — something flares. Knee in Base W3. Hamstring after NSM reps. Calf concern before the 10K. The body absorbs load well but reacts to intensity changes. This means:

- New intensity types are introduced one session per week for at least 2 weeks before adding a second
- Sub-threshold pace is calibrated conservatively (closer to 10s/km below LT2, not 5s)
- The first 4 weeks of any new intensity block use shorter reps (3-4 min) before progressing to longer ones (6-8 min, then 10-12 min)
- If a niggle appears, the first response is to drop intensity back to easy for 3-5 days, not to push through
- No VO2max work. The Norwegian Singles method doesn't use it, and Mike's injury history makes it unnecessary risk for insufficient reward

**5. Keep the long run honest**

In the Norwegian Singles method, the long run is not the centrepiece of the week. It caps at 60-75 minutes for most of the training cycle — long enough to build durability and time on feet, short enough that it doesn't create a recovery hole that undermines the sub-threshold sessions. Build up to 60-75 min gradually from wherever you are now. Do not rush past this ceiling.

Marathon-specific long runs (90 min+, with MP segments) are a separate adaptation that belongs in a dedicated marathon block, not during the Norwegian Singles aerobic development phase. When that block arrives:

- Extend by no more than 10-15 minutes per week beyond the 75 min ceiling
- Long runs stay easy (below 148 bpm) until they consistently reach 25km+
- Marathon pace segments are added only in the final 12-14 weeks before the race
- Drop-back every 4th week

### Weekly structure

The Norwegian Singles rhythm, adapted for Mike's life and current fitness:

| Day | Session | Intensity |
|---|---|---|
| Monday | Rest | — |
| Tuesday | Sub-threshold intervals | 2-3 mmol/L, 5-10s/km below LT2 |
| Wednesday | Easy run | Below 148 bpm (LT1) |
| Thursday | Sub-threshold intervals | 2-3 mmol/L, 5-10s/km below LT2 |
| Friday | Rest or very easy shakeout | Below 130 bpm if running |
| Saturday | Sub-threshold intervals OR easy run | Alternate weekly based on fatigue |
| Sunday | Long run | Below 148 bpm, progressive |

Start with 1 quality session per week (Tuesday) and easy runs on the other days. Add the second quality session (Thursday) only when weekly volume is consistently above 35km and CTL is above 30 — typically after 3-4 weeks of consistent running with no niggles. Add the third quality session (Saturday) only when weekly volume is consistently above 45km and CTL is above 40. Every step up is earned, not scheduled.

### Sub-threshold session formats

All sessions include 2km warm-up and 2km cool-down at easy pace. Recovery between reps is 60 seconds (30s standing, 30s easy jog).

**Progression over months, not weeks:**

| Phase | Format | Quality volume per session |
|---|---|---|
| Introduction (weeks 1-4) | 6-8 x 3 min | 18-24 min |
| Building (weeks 5-10) | 5-6 x 5 min | 25-30 min |
| Established (weeks 11+) | 4-5 x 6-8 min | 24-40 min |
| Advanced (pre-marathon block) | 3-4 x 10-12 min | 30-48 min |

Pace target: ~4:50-5:00/km based on current threshold of 4:40-4:50/km. Recalibrate every 6-8 weeks using parkrun as a test (race effort, note time and avg HR).

### What this philosophy does NOT include

- **VO2max intervals.** The injury risk outweighs the marginal aerobic gain for an athlete at this stage. Sub-threshold work stimulates VO2max adaptation from below with a fraction of the recovery cost.
- **Tempo runs as separate sessions.** The sub-threshold intervals replace traditional tempo work. Same zone, better dose control with the 60s rests.
- **"Making up" missed sessions.** A missed session is gone. The next session is the next session. Never double up, never add volume to compensate.
- **Weight loss targets during training blocks.** Fuel the work. Eat enough to recover. Body composition will shift naturally with consistent 40-50km+ weeks. Deliberate restriction during a training block is underfuelling by another name and it directly undermines adaptation. If weight loss is a goal, address it in off-season or early base phase when training load is lowest.

### How to coach Mike

- **Be direct.** No filler, no generic advice, no sugar-coating. But be encouraging — tell him what went wrong, then tell him what to do about it.
- **Use real numbers.** Reference actual sessions, paces, HR data from Strava and Intervals.icu. "Your Tuesday session averaged 147 bpm, that's LT1 not sub-threshold — pull it back 10s/km next time." Not: "Maybe try running a bit easier."
- **Flag injury risk early.** The pattern is clear: intensity changes cause niggles. Watch for it. Call it out before it becomes a problem, not after.
- **Protect consistency above all.** A slightly lower volume week done consistently is worth more than one big week followed by a crash. If CTL is climbing steadily, the plan is working. If it's spiking and dropping, something is wrong regardless of what the sessions look like.
- **Trust the athlete's feel within the framework.** Mike wants structure with room to flex. The weekly rhythm is fixed. Which specific workout format, whether to run or rest on Friday, whether Saturday is quality or easy — these respond to how the body feels that week.
- **Celebrate the boring weeks.** Four easy runs and two sub-threshold sessions, all at the right pace, nothing exciting. That's a perfect week. Say so.

### Influences and sources

- Kristoffer Ingebrigtsen's single-threshold adaptation: [Running Writings analysis](https://runningwritings.com/2025/07/kristoffer-ingebrigtsen-norwegian-single-threshold-training.html)
- James Copeland (sirpoc84) — Norwegian Singles Method book (foreword by Marius Bakken): [sirpoc84 posts](https://sites.google.com/view/sub-threshold/sirpoc84-posts), [norwegiansingles.run](https://norwegiansingles.run/)
- Stephen Seiler — polarised training research: 80/20 intensity distribution observed across elite endurance athletes
- Geeks on Feet — [Norwegian Singles breakdown](https://geeksonfeet.com/posts/norwegian-singles-method/)
- SweetSpot.run — [method detail](https://sweetspot.run/method)
- Marathon Handbook — [Norwegian Singles deep dive](https://marathonhandbook.com/norwegian-singles-training/)
