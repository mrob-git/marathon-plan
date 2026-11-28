// Detailed notes and a video link for each gym exercise and run-day drill, keyed by
// the GymItem id used in lib/gym.ts. The Gym tab shows these behind a "How to do it" toggle.
//
// Video links: kind 'video' is a specific YouTube video picked by its title (not
// watched by the author of this file, so swap any that turn out to be poor).
// kind 'search' opens a YouTube search, used where no single video clearly matched,
// mostly for Lawrence van Lingen's own drills.

export interface ExerciseVideo {
  url: string
  title: string
  kind: 'video' | 'search'
}

export interface ExerciseInfo {
  why: string // what it is for, in one or two sentences
  steps: string[] // how to do it, in order
  feel?: string // what it should feel like when it is right
  avoid?: string[] // common mistakes and stop signs
  video?: ExerciseVideo
}

const watch = (id: string, title: string): ExerciseVideo => ({ url: `https://www.youtube.com/watch?v=${id}`, title, kind: 'video' })
const search = (q: string): ExerciseVideo => ({
  url: `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
  title: q,
  kind: 'search',
})

export const EXERCISE_INFO: Record<string, ExerciseInfo> = {
  // --- Prep (Lawrence's self-treatment sequence) ------------------------------
  'ball-head': {
    why: "Lawrence's top self-treatment. It lengthens the back of the neck, calms nerve tension from the top down and lets your posture organise itself before you load anything.",
    steps: [
      'Stand with your weight over your heels, hips under you, shoulders over hips.',
      'Rest the heavy ball (about 3 kg) on the crown of your head. Keep the back of the neck long.',
      'Slow nods, then side to side, then small circles, then tilt and nod.',
      'Breathe in so the chest lifts and the belly fills. Breathe out and stand tall.',
    ],
    feel: 'Light and tall, as if the ball is doing the work. Tender spots at the base of the skull ease as you move.',
    avoid: ['Do not push up into the ball or brace the neck.', 'Dizziness, a tingle into the arm or a headache: stop.'],
    video: search('Lawrence van Lingen ball on head'),
  },
  'hip-openers': {
    why: 'Relaxes the deep muscles inside the pelvis (piriformis, iliacus) and frees the sacrum. Lawrence calls it the best sacral mobilisation in his programme. It comes before any lifting.',
    steps: [
      'Lie on your side with a cork block or ball notched into the pocket on the side of the hip, above the bony point, below the waist.',
      'Let the ankle and leg go heavy. Breathe slowly.',
      'Rock gently forward and back, then small wiggles, and wait for the pocket to soften.',
      'Both sides, 2 to 3 minutes each.',
    ],
    feel: 'A dull pressure that fades as you relax into it. No sharp pain, no tingling down the leg.',
    avoid: ['Not on the waist or the bone.', 'Do not force range. It is about letting go.'],
    video: watch('26E-p60CyK8', 'Side-Lying Hip Openers: A Routine for Pelvic Mobility and Sacral Alignment'),
  },
  'hip-dissoc': {
    why: 'Teaches the hip to move separately from the pelvis and low back. Lawrence rates the standing version as the most important strength exercise in the warm-up for most people.',
    steps: [
      'Stand with length on one side: weight on one leg, the other foot behind you, leaning into the standing hip.',
      'Breathe in: the back knee goes back, the glute engages, slight arch, chest opens.',
      'Breathe out: ribs come down, the hip comes up and the pelvis squares off.',
      '5 to 6 slow reps a side, 2 rounds. Progress by coming onto the forefoot of the standing leg.',
    ],
    feel: 'The movement comes from the hip. The low back stays quiet.',
    avoid: ['Do not brace or pull the belly in. The exhale does the work.', 'If the low back is doing it, make the movement smaller.'],
    video: search('Lawrence van Lingen hip dissociation'),
  },
  'pelvic-floor': {
    why: "The running-specific deep core pattern: on the exhale the pelvic floor, lower belly and glute switch on together, then fully let go. It replaces every 'engage your core' cue.",
    steps: [
      'Split stance, length on one side.',
      'Breathe out: gently lift the pelvic floor, the lower belly comes in, the glute of the standing leg engages. Hips square.',
      'Breathe in: let go completely.',
      'Then the same on the forefoot: contract, let go, and let the hip travel past the knee.',
    ],
    feel: 'A pulse, not a brace. On then off, in time with the breath.',
    avoid: ['Do not hold it on.', 'Do not hold your breath or clench the jaw.'],
    video: search('Lawrence van Lingen pelvic floor co-contraction running'),
  },
  'glute-release': {
    why: 'Softens the ligament between the sit bone and the sacrum and frees the deep hip rotators the sciatic nerve runs past. Once or twice a week only.',
    steps: [
      'Use the cork half-cylinder, never a ball.',
      'Place it in the groove between the sit bone and the sacrum at about 45 degrees and lie back on it, slightly tilted.',
      'Wiggle the foot in and out to find the pocket, then wait about a minute for it to soften.',
      'Come up onto the hands, rock forward and back, turn the foot in.',
    ],
    feel: 'A firm, deep pressure that gives way slowly.',
    avoid: ['Stay off the tailbone and the sit bone itself.', 'Tingling or shooting down the leg: come off it.', 'Not more than twice a week.'],
    video: search('Lawrence van Lingen deep gluteal release'),
  },

  // --- Calf warm-up (dropped from 28 Nov, kept for the older sessions) ---------
  'kw-rocks-bent': {
    why: 'Wakes up ankle bend with the knee bent, which is the soleus position.',
    steps: ['Foot about a hand from the wall, heel down.', 'Rock the knee forward over the second toe to the wall and back, slow.', '10 each side.'],
    feel: 'A gentle stretch low in the calf that eases with each rep.',
    avoid: ['Heel stays down.', 'No bouncing into pain.'],
    video: search('knee to wall ankle mobility rocks'),
  },
  'kw-rocks-straight': {
    why: 'The same rock with the knee straight, for the upper calf.',
    steps: ['Hands on the wall, one leg back with the knee straight and heel down.', 'Rock the hips forward and back, slow.', '10 each side.'],
    avoid: ['This is movement, not a long held stretch.'],
    video: search('dynamic straight leg calf rocks wall warm up'),
  },
  'calf-rolls': {
    why: 'Takes the calf and Achilles through rotation, which is how they work when you run.',
    steps: ['Stand on the forefeet with soft knees.', 'Roll the weight in a slow circle from the big toe side to the little toe side and back.', '8 each direction.'],
    avoid: ['Never drop the heel below the level of the forefoot.'],
    video: search('rotational calf raise ankle circles standing'),
  },

  // --- Main lifts -------------------------------------------------------------
  'hex-bar': {
    why: 'Your main strength lift. It loads the hips and the whole back chain with the weight in line with your body, and the slow lowering is what builds tendon.',
    steps: [
      'Stand in the middle of the bar, feet hip width, toes soft.',
      'Hinge and bend to the handles with a long back. Stand up tall.',
      'Lower for 3 to 4 seconds, breathing out on the way down.',
      '2 warm-up sets of 6, then the working sets. Rest about 3 minutes between sets.',
    ],
    feel: 'Smooth and strong, with 2 to 3 reps left in the tank at the end of every set.',
    avoid: [
      'Any low back pain: no hex bar today.',
      'Toes gripping, jaw clenched or breath held means the weight is too heavy.',
      'The set ends when the speed drops, not when you fail.',
    ],
    video: watch('Mza9MSaJsXI', 'How To HEX/Trap Bar Deadlift - Coaching Cues For Best Performance & Safety'),
  },
  'hip-swings': {
    why: "Lawrence's springy hip drill from his Tier B session. It trains the back leg to extend with pop, which is the running shape.",
    steps: [
      'Front foot up on the 14-inch box, length on one side.',
      'Swing the hip back and through, driving up tall off the box leg.',
      'Keep it quick and elastic, like a spring loading and letting go.',
      '8 to 10 a side. Rest about 2 minutes.',
    ],
    feel: 'Bouncy and light. Springy, not grindy.',
    avoid: ['Stop the set when the pop slows down.', 'Do not turn it into a slow, heavy step-up.'],
    video: search('Lawrence van Lingen single leg hip swings'),
  },
  'split-squats': {
    why: 'Single-leg strength in the running position, with a slow lowering for the quad and patellar tendon.',
    steps: [
      'Long split stance, front foot flat, back heel up.',
      'Lower for 3 seconds until the back knee is just off the floor. Pause.',
      'Drive up through the whole front foot.',
      'Front knee tracks over the second toe.',
    ],
    feel: 'Front thigh and glute working, hips level.',
    avoid: ['Knee drifting inwards.', 'Bouncing out of the bottom.', 'Front-of-knee pain above 2 out of 10: shorten the range.'],
    video: watch('4aqrcebiFZo', 'Split Squat: How To (3 steps to proper form)'),
  },
  cossack: {
    why: 'Side-to-side hip mobility and inner-thigh strength, which straight-line running never trains.',
    steps: [
      'Wide stance, toes slightly out.',
      'Sit down and across onto one leg, heel down, the other leg straight with its toes up.',
      'Go only as deep as stays smooth, then push back to the middle and go the other way.',
      'Bodyweight or a light kettlebell held at the chest.',
    ],
    feel: 'A stretch along the straight leg, work in the bent leg.',
    avoid: ['Heel lifting or the knee caving in.', 'Any pinch in the groin or ache at the pubic bone: stop and leave them out.'],
    video: watch('Zi_x6s6YXHo', 'Cossack Squat Tutorial for Beginners and Athletes'),
  },

  // --- Upper body and finisher ------------------------------------------------
  'push-ups': {
    why: "Lawrence's piked push-up ties the abdominals to the pelvic floor. It is a trunk exercise as much as an arm one.",
    steps: [
      'Start on hands and knees and round up as in the cat position, then go onto the tops of the feet or the toes.',
      'Lower for 3 seconds, keeping the rounded shape.',
      'Breathe out as you push up.',
    ],
    feel: 'Lower belly working, back rounded, neck long.',
    avoid: ['Sagging in the low back.', 'Holding your breath.', 'Note: this is his rounded version, not the hips-high shoulder press most videos call a pike push-up.'],
    video: search('Lawrence van Lingen push up cat piked'),
  },
  rows: {
    why: 'Pulling strength for arm swing and posture. The prone version takes the low back out of it.',
    steps: [
      'TRX: lean back with a straight body, arms long. Pull the chest to the hands, elbows close.',
      'Prone: lie face down on a bench and row the weights to the ribs.',
      'Lower under control. The way down counts.',
    ],
    feel: 'Between and below the shoulder blades.',
    avoid: ['Shoulders creeping up to the ears.', 'Hips sagging on the TRX.'],
    video: watch('N_14s8zFOms', 'Exercise Tutorial: TRX Row'),
  },
  carry: {
    why: 'The finisher. A loaded walk that links the strength work back to walking and running. The backward walk opens the hips and is kind to the Achilles.',
    steps: [
      'Pick up the weights and stand tall. Breathe freely.',
      'Walk 30 m forwards with short, quiet steps.',
      'Walk back backwards: short steps, soft toes, heel goes down.',
    ],
    feel: 'Tall and relaxed. Grip and trunk working, shoulders loose.',
    avoid: ['Leaning or rushing.', 'A weight heavy enough to make you hold your breath.', 'If the Achilles or calf complains on the backward walk, go lighter or walk it unloaded.'],
    video: watch('8RXTKE06mKc', "Farmer's Carry Tutorial"),
  },

  // --- Left ankle prehab ------------------------------------------------------
  'tib-release': {
    why: 'Eases the muscle on the front of the shin, which gets tight when the ankle is held stiff.',
    steps: [
      'Kneel or sit with a ball or roller under the muscle just outside the shin bone.',
      'Find a tender spot, hold about 30 seconds until it fades.',
      'Point and pull the foot up slowly a few times.',
    ],
    feel: 'A dull ache that eases. About 5 out of 10 at most.',
    avoid: ['Never on the shin bone itself.', 'Pinpoint bone pain or tingling into the foot: stop.'],
    video: watch('RoT0QrXV2x4', 'Tibialis Anterior Myofascial Release With Ball'),
  },
  'foot-doming': {
    why: 'Strengthens the small muscles that hold the arch, so the foot can be a stable tripod.',
    steps: [
      'Sit or stand with the foot flat.',
      'Draw the ball of the foot towards the heel so the arch lifts. The toes stay long and flat.',
      'Hold 10 seconds, relax fully. 5 reps a side, left first.',
    ],
    feel: 'A gentle working feeling under the arch.',
    avoid: ['Curling or gripping with the toes.', 'Rolling onto the outside of the foot.'],
    video: watch('UNulHSKgm8s', 'Toe Yoga & Short Foot Exercise'),
  },
  'big-toe-press': {
    why: 'Teaches the left foot to trust the base of the big toe (the first met head). That is the wobbly front point of your tripod on the left. Added 28 Nov 2026.',
    steps: [
      'Stand or sit with the foot flat.',
      'Press the big toe down into the floor and lift the other four toes.',
      'Hold 5 seconds, relax. 5 reps a side, left first.',
      'Then go straight into the balance work.',
    ],
    feel: 'Pressure under the base of the big toe and the arch lifting slightly.',
    avoid: ['The foot rolling in or out.', 'Cramp: ease off and shorten the hold.'],
    video: watch('zDUipW0cB5g', 'Toe Yoga - Physical Therapy Exercise'),
  },
  'sl-balance': {
    why: "Lawrence's test of whether the leg can hold you with as little tension as possible. Your left is less steady at the front of the foot, so the left gets the attention.",
    steps: [
      'Stand on one leg, bones stacked, eyes open.',
      'Feel three points: heel, base of the big toe, base of the little toe. Keep the base of the big toe heavy.',
      'Toes stay soft. Hold 15 to 20 seconds, 3 times, left first.',
      'Eyes closed only once 3 x 20 seconds is clean with eyes open. Start eyes closed at 5 to 10 seconds.',
    ],
    feel: 'Quiet and easy. Small corrections at the ankle, none at the hip or arms.',
    avoid: ['The moment the toes grip, the rep is over.', 'Short and clean beats one long wobbly hold.'],
    video: search('single leg balance foot tripod soft toes'),
  },
  'iso-hold': {
    why: 'A long hold on the forefoot builds tendon tolerance in the calf and Achilles without the strain of moving reps.',
    steps: [
      'Turn-and-step position: front foot on the forefoot, knee slightly in front, weight through the base of the big toe.',
      'Hold the dumbbell, rise to a mid-height heel position and hold still for 30 to 45 seconds.',
      'Breathe normally. Rest about a minute. Left side first.',
    ],
    feel: 'Steady work in the calf. No shake, no pain in the tendon.',
    avoid: ['Never let the heel drop below the level of the forefoot.', 'No bouncing.', 'Achilles stiff the next morning: back to the lighter weight.'],
    video: watch('x1LhV2nj01Q', 'Isometric Single Leg Calf Raise Hold'),
  },
  'band-eversion': {
    why: 'Strengthens the peroneals on the outside of the shin, which steady the ankle.',
    steps: [
      'Sit with the band round the forefoot, anchored on the other foot.',
      'Turn the sole outwards against the band, slowly, and return more slowly.',
      '15 reps, 2 sets a side.',
    ],
    feel: 'Work on the outside of the lower leg.',
    avoid: ['Moving from the knee or hip instead of the ankle.', 'Rushing the return.'],
    video: watch('uFz1zHMgtbE', 'How to Do a Band Ankle Eversion'),
  },

  // --- Run days: before the run -------------------------------------------------
  'back-walk': {
    why: "Lawrence's first choice for a grumpy calf or Achilles. It loads the foot toe-first, opens the front of the hip and wakes the ankle up before you run.",
    steps: [
      'Flat, clear ground. Stand tall.',
      'Reach one foot back, land on the toes and let the heel come down.',
      'Short steps, soft toes, belly button towards the front leg.',
      '2 minutes, easy pace.',
    ],
    feel: 'The calf and the front of the hip lengthen with each step. Nothing strains.',
    avoid: ['Long reaching steps.', 'Gripping with the toes.', 'Looking over your shoulder the whole time: pick a clear stretch.'],
    video: search('Lawrence van Lingen backward walking'),
  },
  'pre-balance': {
    why: 'A 30-second check that each foot can hold you quietly before you ask it to run. Your left is less steady at the front of the foot, so it goes first.',
    steps: [
      'Stand on one leg, bones stacked, eyes open.',
      'Feel three points: heel, base of the big toe, base of the little toe. Keep the base of the big toe heavy.',
      'Toes stay soft. 30 seconds a side, left first.',
      'If the toes start to grip, put the foot down and finish it as 2 x 15 seconds.',
    ],
    feel: 'Quiet and easy. Small corrections at the ankle, none at the hip or arms.',
    avoid: ['Gripping toes.', 'Eyes closed. That is the fortnightly test, not the warm-up.'],
    video: search('single leg balance foot tripod soft toes'),
  },
  'hip-hikes': {
    why: 'Switches on the side of the hip that keeps the pelvis level each time you land. Lawrence uses a few as a pre-run activation once the hips are open.',
    steps: [
      'Stand on one leg, that knee straight, the other foot just off the floor.',
      'Let the free hip drop a few centimetres, then lift it back up above level.',
      'The movement is at the pelvis. The standing knee does not bend.',
      '5 slow reps a side, left first.',
    ],
    feel: 'Work in the side of the standing hip.',
    avoid: ['Bending the standing knee.', 'Leaning the trunk sideways to fake the lift.'],
    video: watch('IDK0s3OMk48', 'Standing Hip Hike'),
  },
  'leg-swings': {
    why: 'Takes the hamstring and hip flexor through running range with movement, not a held stretch. Held stretches before a run are out for your left hamstring.',
    steps: [
      'Side on to a wall, one hand on it, standing tall.',
      'Swing the outside leg forward and back from the hip, knee soft.',
      'Start small. Let the range grow over the 10 swings.',
      '10 each leg, left first.',
    ],
    feel: 'Loose and rhythmic. The trunk stays still.',
    avoid: ['Forcing height.', 'Arching or rounding the low back to get more swing.'],
    video: watch('0XvKtEZ4i38', 'How To Do A Standing Front To Back Leg Swing'),
  },
  'ham-scoops': {
    why: 'A moving hamstring lengthener that also glides the nerve down the back of the leg, which suits your left side.',
    steps: [
      'Step one heel out in front, toes up, that knee straight.',
      'Sit the hips back and sweep both hands down past the shin and up, like scooping.',
      'Stand tall, step through and do the other leg.',
      '8 each leg.',
    ],
    feel: 'A light pull behind the thigh that goes as you stand up.',
    avoid: ['Holding the bottom position.', 'Rounding the back to reach the floor. Hinge from the hips.'],
    video: watch('JTIhj2r31bo', 'How to Do Hamstring Scoops'),
  },
  'leg-kicks': {
    why: 'The last step before running: the hamstring lengthens quickly under control, as it does at the end of each stride.',
    steps: [
      'Walk forward tall.',
      'Kick one straight leg up in front and reach the opposite hand towards the toes.',
      'Waist height at most. Control it on the way down.',
      '8 each leg.',
    ],
    feel: 'Springy and easy, never a yank.',
    avoid: ['Kicking above waist height.', 'Leaning back to get the leg higher.', 'Any pull high up near the sit bone: stop and say so in the thread.'],
    video: watch('RJrGfziKeCA', 'How To Do Walking Toy Soldier Kicks'),
  },

  // --- Run days: after the run ---------------------------------------------------
  'foot-waves': {
    why: "From Lawrence's Week 12: it lets a guarding soleus let go by moving the foot, not by pressing on the calf.",
    steps: [
      'Rest one foot on top of a foam roller, holding a wall if you need it.',
      'Toes up, then foot down, moving through each part of the foot in turn like a wave.',
      'Slow and deliberate. About 1 minute a side.',
    ],
    feel: 'The sole and the lower calf loosen. No stretch pain.',
    avoid: ['Pressing down hard.', 'Curling the toes.'],
    video: search('Lawrence van Lingen foot waves foam roller'),
  },
  'soleus-rocks': {
    why: 'Keeps ankle bend after an easy run while the calf is warm. The calf mobility work made a big difference to your soleus in November.',
    steps: [
      'Half kneel, front foot flat.',
      'Rock the front knee forward over the second toe, heel down.',
      'Ease back. 8 slow rocks a side.',
    ],
    feel: 'A stretch low in the calf, near the Achilles.',
    avoid: ['Heel lifting.', 'Knee falling inwards.', 'Skip it after sessions and long runs, when the calf has already had its load.'],
    video: watch('Hm_Iu72bJJg', 'Half Kneeling Ankle Rocks - Ankle Mobility'),
  },
  'ankle-circles': {
    why: 'A gentle finish that moves the ankle through its full range and lets the lower leg relax.',
    steps: ['Lift one foot and draw slow circles with the toes, both directions.', 'Then shake the leg out loosely.', 'About 30 seconds a side.'],
    video: search('ankle circles mobility exercise'),
  },
  'back-walk-after': {
    why: 'After a session or long run this replaces the soleus rocks. Lawrence pairs it with foot waves to relax the calf without stretching it.',
    steps: ['Flat, clear ground.', 'Reach back, toes then heel, short steps.', '2 minutes, slow.'],
    feel: 'The calves ease off with each step.',
    avoid: ['Long steps.', 'Gripping with the toes.'],
    video: search('Lawrence van Lingen backward walking'),
  },

  // --- Run days: evening -----------------------------------------------------------
  'ham-roll': {
    why: 'Eases the hamstrings the evening after a run. The left flared after reps in September, so it gets a little longer.',
    steps: [
      'Sit with the roller under one thigh, hands behind you.',
      'Roll slowly from just above the back of the knee to a hand below the sit bone.',
      'Once with the leg turned in, once turned out.',
      'On a tender spot, stop and take 3 slow breaths. 60 to 90 seconds a leg.',
    ],
    feel: 'Firm pressure you can breathe into, 5 out of 10 at most.',
    avoid: ['Never on the sit bone or behind the knee.', 'If the leg feels bruised next day, ease the pressure.'],
    video: watch('5b4tzz1BoFQ', 'How to foam roll your Hamstrings - Rollga Foam Roller'),
  },
  'ham-ball': {
    why: 'Pins one tight spot and moves the muscle under it, which shifts more than rolling does.',
    steps: [
      'Sit on a hard chair with the ball under the thigh, on a tender spot.',
      'Pressure 5 to 6 out of 10. Hold 30 seconds, breathing slowly.',
      'Then straighten and bend the knee slowly, 10 times, over the ball.',
      '2 spots a leg.',
    ],
    feel: 'A strong but bearable ache that fades as you hold.',
    avoid: ['Never on the sit bone or behind the knee.', 'Not on the morning of a session or time trial.', 'Tingling down the leg: move off the spot.', 'None in the last five days before the race.'],
    video: watch('Ng8rVFrZH6M', 'Pin and stretch massage technique with a lacrosse ball for hamstrings'),
  },
  'nerve-floss': {
    why: "Lawrence's gentle nerve slider. It balances the nerve tree after the release work, and lying on your back is the safest position for it.",
    steps: [
      'Lie on your back with the rope round one foot, as Lawrence teaches it in Week 9.',
      '10 steps, then 10 foot pumps, then 10 wiggle-waggles.',
      'Same counts on the other side. Left first.',
      'A little, with patience. It is not a stretch.',
    ],
    feel: 'Easy movement with a light pull that never builds.',
    avoid: ['Never pull into a stretch.', 'Tingling or a sharp line of pain: lower the leg and make it smaller.', 'On run days it is done here, not in the morning as well.'],
    video: search('Lawrence van Lingen rope nerve floss'),
  },
  'neck-block': {
    why: 'Part of the left-side tension plan. The neck, hip, hamstring and soleus tighten together, so the neck gets three minutes on run-day evenings.',
    steps: [
      'Ball between you and a wall.',
      'Upper trap: the top of the shoulder, halfway between neck and shoulder tip. 1 minute.',
      'Corner of the shoulder blade (levator): the top inner corner. 1 minute.',
      'Front of the shoulder, under the collarbone (pec minor). 1 minute.',
      'Light pressure, slow breathing. Left side gets the time.',
    ],
    feel: 'A dull ache that eases. The shoulder drops.',
    avoid: ['Never on the front or side of the neck itself.', 'Tingling into the arm or hand: stop.', 'No hard neck stretching afterwards.'],
    video: watch('j4VZXse7zRM', 'Upper traps & levator scapula self myofascial release with lacrosse ball'),
  },
  'bed-breathing': {
    why: 'Five minutes of slow breathing brings the nervous system down before sleep. Your left-side tightness is worse after poor sleep, so this is prescribed, not optional.',
    steps: ['Lie down, lights low.', 'In through the nose for 5 seconds, out through the nose for 6.', 'Tongue on the roof of the mouth. A soft hum on the exhale for the last 2 minutes if you like.', '5 minutes.'],
    feel: 'Heavier limbs, slower thoughts.',
    avoid: ['Forcing big breaths. Quiet and low is the aim.'],
    video: search('resonance breathing 5 seconds in 6 seconds out'),
  },

  // --- Tests ------------------------------------------------------------------
  'test-kw-cold': {
    why: 'Knee to wall measures ankle bend. Cold then warm shows what the warm-up changes.',
    steps: [
      'Foot about 10 cm from the wall, heel down.',
      'Drive the knee over the second toe to touch the wall.',
      'Move the foot back until the knee only just touches. Measure toe to wall in cm.',
      'Left first, then right. Write both down.',
    ],
    avoid: ['Heel lifting.', 'Knee swinging inwards.'],
    video: search('knee to wall test ankle dorsiflexion'),
  },
  'test-kw-warm': {
    why: 'The same test after the warm-up. If the number does not move, the warm-up is not doing much.',
    steps: ['Repeat exactly as the cold test.', 'Write both numbers next to the cold ones.'],
  },
  'test-balance': {
    why: 'Eyes closed takes away vision, so the ankle and foot have to do the work.',
    steps: ['Stand on one leg, eyes closed, toes soft.', 'Time until a foot touches down or you open your eyes.', 'Best of 2 tries a side. Target 30 seconds.'],
    avoid: ['Stand near a wall.'],
  },
  'test-heel-raise': {
    why: 'Counts how many clean bent-knee heel raises each calf can do, to compare left with right.',
    steps: [
      'Flat ground, fingertips on a wall, knee slightly bent.',
      'One rep every 2 seconds, full height each time.',
      'Stop when the height drops or the form goes. Left first, full rest, then right.',
    ],
    avoid: ['This one set is the calf work for the day.'],
    video: watch('M5zL9EEoNx8', 'Single Leg Bent Knee Calf Raise'),
  },
}

export const exerciseInfo = (id: string): ExerciseInfo | undefined => EXERCISE_INFO[id]
