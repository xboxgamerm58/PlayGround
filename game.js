(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const app = { screen: 'title', scene: 0, dialogue: 0, visited: new Set(), selected: null, wrong: 0, cluePages: new Set(), muted: true, trialSolved: false };
  const scenes = [
    { place: 'THE MAIN HALL', char: 'Mara Venn', role: 'ULTIMATE SOUND DESIGNER', tone: 'tone-rose', caption: 'A new sound in a familiar silence', lines: [
      ['Mara', 'The bell tower just rang. One note. Nine twelve on the dot.'],
      ['Mara', 'But the tower has been sealed since the storm knocked out its mechanism three years ago.'],
      ['Mara', 'And the voice on the intercom said someone here already knew it would ring.'],
      ['Mara', 'I’m Mara. Sound is my specialty. I know what I heard—and what I didn’t.'],
    ]},
    { place: 'THE MAIN HALL', char: 'Ivo Sato', role: 'ULTIMATE CLOCKMAKER', tone: 'tone-gold', caption: 'Time is a machine with a memory', lines: [
      ['Ivo', 'Before anyone panics: the tower clock is not connected to the bell. Hasn’t been for years.'],
      ['Mara', 'You’re certain?'], ['Ivo', 'I repaired its hands this afternoon. The bell itself needs a person to pull the release.'],
      ['Ivo', 'And someone just made sure the whole campus heard it.'],
    ]},
    { place: 'THE MAIN HALL', char: 'Rin Okafor', role: 'ULTIMATE ARCHIVIST', tone: 'tone-teal', caption: 'Paper remembers what people forget', lines: [
      ['Rin', 'The intercom is old, but the control room logs every broadcast.'],
      ['Rin', 'At nine twelve, a message went out on a channel that should be dead. It said: “The second hand is lying.”'],
      ['Mara', 'That’s not what I heard. The voice said, “Someone here already knew.”'],
      ['Rin', 'Maybe both messages were sent. We need to find where the signal came from.'],
    ]},
    { place: 'THE MAIN HALL', char: 'Theo Bell', role: 'ULTIMATE BOTANIST', tone: 'tone-violet', caption: 'The smallest details leave roots', lines: [
      ['Theo', 'The storm doors locked at nine. No one has left or come in.'],
      ['Theo', 'There are eight of us in this building. Someone knows why that bell rang.'],
      ['Mara', 'Then let’s check the places that could tell us.'],
      ['Narrator', 'The group splits up. Four locations. Four chances to uncover the truth.'],
    ]},
  ];
  const locations = [
    { id: 'booth', name: 'Broadcast Booth', desc: 'A voice without a witness', art: 'booth', symbol: '◉', tint: '', detail: 'The booth smells faintly of hot dust. The main microphone is off, but a small auxiliary recorder is still warm.', clueName: 'Warm Auxiliary Recorder', clue: 'A pocket recorder captured the bell ringing from inside the booth. The tower’s bell could not have been heard this clearly from the hall.', },
    { id: 'library', name: 'Archive Library', desc: 'Old records, new questions', art: 'library', symbol: '▤', tint: 'gold', detail: 'A ledger sits open on the desk. A loose page has been torn out, but the carbon copy beneath it kept an impression.', clueName: 'Imprint in the Ledger', clue: 'The log shows a maintenance request for the auxiliary intercom channel, signed out at 8:40 PM. The return signature is smudged.', },
    { id: 'gallery', name: 'East Gallery', desc: 'A portrait turned to the wall', art: 'gallery', symbol: '◇', tint: 'teal', detail: 'A framed photograph of the old bell tower hangs crooked. Behind it, the wall has a narrow service hatch—recently opened.', clueName: 'Fresh Screw Marks', clue: 'The hatch leads to a service passage connecting the east gallery to the bell tower. Fine brass dust clings to the frame.', },
    { id: 'control', name: 'Clockworks Room', desc: 'The clock keeps its own time', art: 'control', symbol: '⌁', tint: 'gold', detail: 'A stopped wall clock reads 9:12. Its hands are fixed in place, but the pendulum is still gently swaying.', clueName: 'Stopped Clock at 9:12', clue: 'The clock was stopped by hand, not by the storm. Its pendulum is moving because someone passed through very recently.', },
  ];
  const questions = [
    { prompt: 'Mara says the bell sounded from the tower—but the recording places it inside the booth. What does that tell us?', quote: '“I heard the bell from the hall. It had to be the tower.”', speaker: 'MARA VENN', answers: ['The bell was real, but its sound was played through the booth.', 'Mara imagined the bell because she was tired.', 'The tower clock rang the bell automatically.', 'The recording must have been edited after the fact.'], correct: 0, explain: 'Exactly. The auxiliary recorder captured the bell from close range. The tower was only part of the illusion.' },
    { prompt: 'The clockworks show the time was fixed at 9:12, and the archive log has an unsigned return. What was the culprit trying to hide?', quote: '“The second hand is lying.”', speaker: 'THE INTERCOM', answers: ['That the storm had damaged the clock.', 'The time the auxiliary intercom channel was used.', 'That the bell had never been repaired.', 'The identity of the student who heard it first.'], correct: 1, explain: 'Right. Stopping the clock created a false time cue. The unsigned maintenance log connects the broadcast to the clockworks.' },
    { prompt: 'Fresh brass dust is on the gallery hatch. How did the culprit make the bell sound like it came from the tower?', quote: '“No one has left or come in.”', speaker: 'THEO BELL', answers: ['They used the service passage and a recording in the booth.', 'They climbed outside the tower during the storm.', 'They rang the school’s fire alarm.', 'They sent the sound over a phone call.'], correct: 0, explain: 'The service passage connects the hatch to the bell tower. A recording in the booth did the rest.' },
    { prompt: 'Who had the access and the know-how to stage the false bell?', quote: '“I repaired its hands this afternoon.”', speaker: 'IVO SATO', answers: ['Mara Venn, the sound designer.', 'Rin Okafor, the archivist.', 'Ivo Sato, the clockmaker.', 'Theo Bell, the botanist.'], correct: 2, explain: 'Ivo had just accessed the clock, knew the service route, and had signed out the auxiliary channel under an incomplete log.' },
  ];
  const cast = {
    'Mara': { name: 'Mara Venn', role: 'ULTIMATE SOUND DESIGNER', tone: 'tone-rose', badge: 'S' },
    'Ivo': { name: 'Ivo Sato', role: 'ULTIMATE CLOCKMAKER', tone: 'tone-gold', badge: 'T' },
    'Rin': { name: 'Rin Okafor', role: 'ULTIMATE ARCHIVIST', tone: 'tone-teal', badge: 'A' },
    'Theo': { name: 'Theo Bell', role: 'ULTIMATE BOTANIST', tone: 'tone-violet', badge: 'B' },
    'Narrator': { name: 'MERIDIAN ARCHIVE', role: 'CASE FILE 01', tone: 'tone-blue', badge: '01' },
  };
  const titleScreen = $('#titleScreen'), gameScreen = $('#gameScreen'), playArea = $('#playArea'), modal = $('#modalLayer');
  function updateProgress() {
    const value = app.screen === 'title' ? 0 : app.screen === 'story' ? Math.min(7 + app.scene * 15 + Math.floor(app.dialogue * 3), 59) : app.screen === 'investigation' || app.screen === 'detail' ? 60 + app.visited.size * 8 : app.screen === 'trial' ? 75 + Math.floor((app.cluePages.size / questions.length) * 24) : 100;
    $('#progressFill').style.width = `${value}%`; $('#progressText').textContent = `${String(value).padStart(2, '0')}%`;
    const label = { title: 'A STORY IN ONE CHAPTER', story: 'THE CLOSED CAMPUS', investigation: 'INVESTIGATION', detail: 'INVESTIGATION', trial: 'CLASS TRIAL', verdict: 'THE VERDICT' }[app.screen];
    $('#phaseTag').textContent = label || ''; $('#caseStatus').innerHTML = `<i></i> ${label || 'STORY'}`;
  }
  function begin() { app.screen = 'story'; app.scene = 0; app.dialogue = 0; app.visited.clear(); app.cluePages.clear(); app.wrong = 0; titleScreen.classList.add('hidden'); gameScreen.classList.remove('hidden'); renderStory(); }
  function avatar(character, caption) {
    const person = cast[character] || cast.Narrator;
    return `<div class="character ${person.tone}" aria-label="${person.name}"><span class="hair"></span><span class="head"></span><span class="fringe"></span><span class="eye left"></span><span class="eye right"></span><span class="mouth"></span><span class="neck"></span><span class="coat"></span><span class="badge">${person.badge}</span></div><div class="stage-caption">${caption}</div>`;
  }
  function renderStory() {
    app.screen = 'story'; const scene = scenes[app.scene]; const [speaker, text] = scene.lines[app.dialogue];
    const person = cast[speaker] || { name: speaker, role: 'MERIDIAN STUDENT', tone: scene.tone, badge: 'M' };
    const last = app.dialogue === scene.lines.length - 1;
    const action = last ? (app.scene === scenes.length - 1 ? 'BEGIN INVESTIGATION' : 'CONTINUE') : 'NEXT';
    playArea.innerHTML = `<div class="story-view"><div class="scene-heading"><span class="location">${scene.place}</span><span>—</span><span>${String(app.scene + 1).padStart(2, '0')} / 04</span></div><div class="story-stage"><div class="stage-grid"></div><div class="stage-halo"></div>${avatar(speaker === 'Narrator' ? 'Narrator' : speaker, scene.caption)}</div><div class="dialogue-box"><div class="speaker-line"><span class="speaker-name">${person.name}</span><span class="speaker-role">${person.role}</span></div><div class="dialogue-text">${text}</div><div class="dialogue-footer"><span class="dialogue-hint">${last ? 'THE CASE IS OPEN' : 'CLICK OR TAP TO CONTINUE'}</span><button class="next-button" id="nextLine">${action}<span>→</span></button></div></div></div>`;
    $('#nextLine').addEventListener('click', () => {
      if (!last) { app.dialogue++; renderStory(); }
      else if (app.scene < scenes.length - 1) { app.scene++; app.dialogue = 0; renderStory(); }
      else renderInvestigation();
    });
    playArea.querySelector('.story-stage').addEventListener('click', (event) => { if (!event.target.closest('button')) $('#nextLine').click(); }); updateProgress();
  }
  function renderInvestigation() {
    app.screen = 'investigation';
    const cards = locations.map((loc, i) => `<button class="location-card ${app.visited.has(loc.id) ? 'visited' : ''}" data-loc="${loc.id}"><span class="location-index">0${i + 1} / LOCATION</span><span class="location-art art-${loc.art}"></span><span class="location-name">${loc.name}</span><span class="location-desc">${loc.desc}</span>${app.visited.has(loc.id) ? '<span class="clue-stamp">CLUE FOUND</span>' : ''}</button>`).join('');
    playArea.innerHTML = `<div class="investigation-view"><div class="view-kicker"><span>FIELD NOTES / MERIDIAN INSTITUTE</span><b>● ACTIVE</b></div><h2 class="view-title">Search the campus.</h2><p class="view-intro">The bell rang from a sealed tower. Something here doesn’t add up. Visit the locations and collect evidence before the group meets again.</p><div class="location-grid">${cards}</div><div class="investigation-bottom"><span class="evidence-count">EVIDENCE <b>${app.visited.size} / ${locations.length}</b></span><button class="trial-button" id="startTrial" ${app.visited.size < locations.length ? 'disabled' : ''}>${app.visited.size < locations.length ? 'FIND ALL THE CLUES' : 'CALL THE CLASS TRIAL'} →</button></div></div>`;
    playArea.querySelectorAll('.location-card').forEach(button => button.addEventListener('click', () => showLocation(button.dataset.loc)));
    $('#startTrial').addEventListener('click', () => { if (app.visited.size === locations.length) { app.screen = 'trial'; app.selected = null; app.trialSolved = false; renderTrial(); } }); updateProgress();
  }
  function showLocation(id) {
    const loc = locations.find(item => item.id === id); app.screen = 'detail';
    playArea.innerHTML = `<div class="location-detail"><button class="back-button" id="backLocations">← &nbsp; ALL LOCATIONS</button><div class="detail-scene"><div class="scene-symbol ${loc.tint}">${loc.symbol}</div></div><h2 class="detail-heading">${loc.name}</h2><p class="detail-text">${loc.detail}</p><div class="found-clue"><b>EVIDENCE ADDED / ${loc.clueName.toUpperCase()}</b>${loc.clue}</div><button class="trial-button detail-action" id="finishLocation">${app.visited.has(id) ? 'RETURN TO LOCATIONS' : 'ADD TO CASE FILE'} →</button></div>`;
    app.visited.add(id); $('#backLocations').addEventListener('click', renderInvestigation); $('#finishLocation').addEventListener('click', renderInvestigation); updateProgress();
  }
  function evidenceCards(index) {
    return locations.map((loc, i) => `<button class="evidence-card ${app.selected === i ? 'selected' : ''}" data-index="${i}" data-evidence="${i}">${loc.clueName}<small>${loc.clue.slice(0, 76)}…</small></button>`).join('');
  }
  function renderTrial() {
    app.screen = 'trial'; const solvedOffset = app.trialSolved ? 1 : 0; const qIndex = Math.min(Math.max(0, app.cluePages.size - solvedOffset), questions.length - 1); const q = questions[qIndex];
    const feedback = app.trialSolved ? `<div class="trial-feedback good">${q.explain}</div>` : `<div class="trial-feedback" id="feedback">Choose the piece of evidence that proves it.</div>`;
    const buttons = q.answers.map((answer, i) => `<button class="evidence-card ${app.selected === i ? 'selected' : ''}" data-index="0${i + 1}" data-evidence="${i}">${answer}<small>${i === 0 ? locations[(qIndex === 0 ? 0 : qIndex === 1 ? 1 : qIndex === 2 ? 2 : 3)].clueName.toUpperCase() : 'TESTIMONY / CLASS TRIAL'}</small></button>`).join('');
    const dots = questions.map((_, i) => `<i class="${i < app.cluePages.size ? 'done' : i === qIndex ? 'current' : ''}"></i>`).join('');
    playArea.innerHTML = `<div class="trial-view"><div class="trial-top"><span>MERIDIAN INSTITUTE / CLASS TRIAL</span><b>DEBATE ${String(qIndex + 1).padStart(2, '0')} / 04</b></div><h2 class="trial-title">Connect the evidence.</h2><p class="trial-prompt">${q.prompt}</p><div class="trial-person"><span class="mini-avatar">${q.speaker.charAt(0)}</span><span class="trial-person-name">${q.speaker}<small class="trial-person-role">TESTIMONY ON THE STAND</small></span><span class="trial-person-quote">${q.quote}</span></div><div class="evidence-label">SELECT THE STRONGEST CONTRADICTION</div><div class="evidence-grid">${buttons}</div>${feedback}<div class="trial-bottom"><div class="trial-dots">${dots}</div><button class="submit-button" id="submitEvidence" ${app.selected === null && !app.trialSolved ? 'disabled' : ''}>${app.trialSolved ? 'CONTINUE →' : 'PRESENT EVIDENCE →'}</button></div></div>`;
    playArea.querySelectorAll('.evidence-card').forEach(button => button.addEventListener('click', () => { if (app.trialSolved) return; app.selected = Number(button.dataset.evidence); renderTrial(); }));
    $('#submitEvidence').addEventListener('click', () => {
      if (app.selected === null || app.trialSolved) return;
      if (app.selected === q.correct) { app.trialSolved = true; app.cluePages.add(qIndex); renderTrial(); $('#submitEvidence').addEventListener('click', advanceTrial); }
      else { app.wrong++; const f = $('#feedback'); f.className = 'trial-feedback bad'; f.textContent = app.wrong % 2 ? 'That evidence doesn’t prove the contradiction. Read the testimony again and look for the physical clue.' : 'Not quite. The strongest evidence is the clue that directly contradicts what the speaker claims.'; app.selected = null; setTimeout(() => { if ($('#feedback')) renderTrial(); }, 1150); }
    });
    updateProgress();
  }
  function advanceTrial() { if (app.cluePages.size >= questions.length) renderVerdict(); else { app.selected = null; app.trialSolved = false; renderTrial(); } }
  function renderVerdict() {
    app.screen = 'verdict';
    playArea.innerHTML = `<div class="verdict-view"><div class="verdict-inner"><div class="verdict-seal">CASE<br>CLOSED</div><div class="verdict-kicker">THE LAST BELL / FINAL REPORT</div><h2 class="verdict-title">The truth was<br>in the silence.</h2><p class="verdict-copy">Ivo had used the service passage to reach the bell tower, then played a recording through the booth’s auxiliary channel. He stopped the clock at 9:12 to turn a sound into an alibi. But the recorder kept the truth: the bell never rang in the tower at all.</p><p class="verdict-quote">“Time doesn’t lie. People make it say things.”</p><p class="verdict-copy">As the group steps out beneath the quiet clock, a new message crackles through the intercom.<br><b>“That was only the first bell.”</b></p><div class="verdict-actions"><button class="secondary-button" id="reviewCase">REVIEW THE CASE FILE</button><button class="trial-button" id="playAgain">PLAY AGAIN ↗</button></div></div></div>`;
    $('#reviewCase').addEventListener('click', renderInvestigation); $('#playAgain').addEventListener('click', begin); updateProgress();
  }
  function showMenu() {
    modal.classList.remove('hidden'); modal.innerHTML = `<div class="modal-card"><h2 id="modalTitle">Case options</h2><p>Your progress is saved for this session. You can return to the title screen or continue where you left off.</p><div class="modal-actions"><button class="modal-restart" id="restartGame">RESTART CASE</button><button class="modal-continue" id="closeMenu">CONTINUE PLAYING</button></div></div>`;
    $('#closeMenu').addEventListener('click', () => modal.classList.add('hidden')); $('#restartGame').addEventListener('click', () => { modal.classList.add('hidden'); begin(); });
  }
  $('#startButton').addEventListener('click', begin); $('#menuButton').addEventListener('click', showMenu);
  $('#homeLink').addEventListener('click', event => { event.preventDefault(); if (app.screen !== 'title') showMenu(); });
  $('#soundButton').addEventListener('click', event => { app.muted = !app.muted; event.currentTarget.innerHTML = app.muted ? '♪<span class="sound-label">SOUND</span>' : '♫<span class="sound-label">ON</span>'; event.currentTarget.setAttribute('aria-label', app.muted ? 'Turn sound on' : 'Turn sound off'); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !modal.classList.contains('hidden')) modal.classList.add('hidden'); else if (event.key === 'Enter' && app.screen === 'story') { const next = $('#nextLine'); if (next) next.click(); } });
  updateProgress();
})();
