/* ─── Tab navigation ─────────────────────────────────────────── */
function goToTab(id){
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  var btn=document.querySelector('.tab-btn[data-tab="'+id+'"]');
  var panel=document.getElementById('tab-'+id);
  if(btn)btn.classList.add('active');
  if(panel)panel.classList.add('active');
  document.querySelector('.main-content').scrollIntoView({behavior:'smooth',block:'start'});
  if(id==='getstarted')setTimeout(animateScoreBars,120);
  if(id==='tracker')buildTracker();
  if(id==='schedule')buildSchedule();
  if(id==='flashcards'){loadDeck('english',document.querySelector('.pack-tab'));}
  if(id==='practice'){loadPractice('eng-conv',document.querySelector('.topic-btn'));}
}
document.querySelectorAll('.tab-btn').forEach(function(b){
  b.addEventListener('click',function(){goToTab(b.dataset.tab);});
});

/* ─── GET STARTED state ────────────────────────────────────────── */
var STEPS=8;
var curStep=parseInt(localStorage.getItem('gs_step')||'1');
var selDays=JSON.parse(localStorage.getItem('gs_days')||'[]');
var doneSessions=JSON.parse(localStorage.getItem('gs_sessions')||'[]');
var stepNames=['Welcome','Your scores','What\'s tested','Your game plan','How to use this site','Your schedule','Before you start','You\'re ready'];
var stepPcts=[12.5,25,37.5,50,62.5,75,87.5,100];

function saveState(){
  localStorage.setItem('gs_step',curStep);
  localStorage.setItem('gs_days',JSON.stringify(selDays));
  localStorage.setItem('gs_sessions',JSON.stringify(doneSessions));
}

function showStep(n){
  document.querySelectorAll('.gs-step').forEach(function(s){s.classList.remove('active');});
  var el=document.getElementById('gs-s'+n);
  if(el)el.classList.add('active');
  document.getElementById('gs-step-label').textContent='Step '+n+' of '+STEPS;
  document.getElementById('gs-step-name').textContent=stepNames[n-1];
  document.getElementById('gs-progress-fill').style.width=stepPcts[n-1]+'%';
  if(n===2)setTimeout(animateScoreBars,100);
  if(n===6)restoreDayPicker();
}

function gsNext(){
  if(curStep<STEPS){curStep++;saveState();showStep(curStep);}
}
function gsPrev(){
  if(curStep>1){curStep--;saveState();showStep(curStep);}
}

/* score bars */
function animateScoreBars(){
  document.querySelectorAll('.sr-bar').forEach(function(b){
    var t=b.dataset.w+'%';
    b.style.width='0%';
    requestAnimationFrame(function(){requestAnimationFrame(function(){b.style.width=t;});});
  });
}

/* day picker */
function toggleDay(btn){
  var day=btn.dataset.day;
  if(btn.classList.contains('selected')){
    btn.classList.remove('selected');
    selDays=selDays.filter(function(d){return d!==day;});
  } else {
    if(selDays.length>=3)return;
    btn.classList.add('selected');
    selDays.push(day);
  }
  updateDayFeedback();
  saveState();
}

var w1Topics=[
  'English · Grammar flashcards — comma rules, verb tenses',
  'English · Conventions practice + error log',
  'Math · Functions lesson + 5 note cards'
];

function updateDayFeedback(){
  var fb=document.getElementById('day-feedback');
  var prev=document.getElementById('day-preview');
  var btn=document.getElementById('days-next-btn');
  var n=selDays.length;
  if(n<3){
    fb.textContent=n===0?'Pick 3 days to continue.':n+' of 3 selected — pick '+(3-n)+' more.';
    if(prev)prev.style.display='none';
    if(btn)btn.disabled=true;
  } else {
    fb.textContent='✓ Great choice. Here\'s your first week:';
    if(btn)btn.disabled=false;
    buildDayPreview();
    if(prev)prev.style.display='block';
  }
}

function buildDayPreview(){
  var c=document.getElementById('dp-content');
  if(!c)return;
  c.innerHTML=selDays.map(function(day,i){
    return '<div class="dp-row"><span class="dp-day">'+day+'</span><span class="dp-what">Session '+(i+1)+' · '+w1Topics[i]+'</span></div>';
  }).join('');
}

function restoreDayPicker(){
  document.querySelectorAll('.day-btn').forEach(function(b){
    if(selDays.indexOf(b.dataset.day)>-1)b.classList.add('selected');
    else b.classList.remove('selected');
  });
  updateDayFeedback();
}

/* setup checklist */
function updateSetup(){
  var boxes=document.querySelectorAll('.setup-cb');
  var done=[].filter.call(boxes,function(b){return b.checked;}).length;
  var pct=Math.round(done/boxes.length*100);
  var fill=document.getElementById('sp-fill');
  var label=document.getElementById('setup-label');
  var btn=document.getElementById('setup-next-btn');
  if(fill)fill.style.width=pct+'%';
  if(label)label.textContent=done+' of '+boxes.length+' checked';
  if(btn)btn.disabled=done<boxes.length;
}

/* init */
showStep(curStep);

/* ─── LESSONS ──────────────────────────────────────────────────── */
function showLesson(id,btn){
  document.querySelectorAll('.lesson').forEach(function(l){l.classList.remove('active');});
  document.querySelectorAll('.ln-btn').forEach(function(b){b.classList.remove('active');});
  var el=document.getElementById('lesson-'+id);
  if(el)el.classList.add('active');
  if(btn)btn.classList.add('active');
  document.querySelector('.lesson-content').scrollIntoView({behavior:'smooth',block:'start'});
}

/* ─── PRACTICE ─────────────────────────────────────────────────── */
var QUIZZES={
  'eng-conv':{
    title:'English: Conventions of Standard English',
    qs:[
      {
        text:'Choose the best version of the underlined portion:',
        context:'"After the long hike[,] we finally sat down to eat."',
        q:'What punctuation, if any, belongs after "hike"?',
        opts:['No punctuation','A comma','A semicolon','A colon'],
        ans:1,
        explain:'Rule: Use a comma after an introductory phrase. "After the long hike" is an introductory phrase — it comes before the main subject "we." A comma is required here.'
      },
      {
        text:'Identify the error:',
        context:'"She loves to run, she goes every morning before work."',
        q:'What is wrong with this sentence?',
        opts:['Nothing — it\'s correct','Comma splice: two sentences joined by just a comma','Wrong verb tense','Missing subject'],
        ans:1,
        explain:'This is a comma splice — two complete sentences ("She loves to run" and "she goes every morning") are joined only by a comma. Fix: "She loves to run; she goes every morning" or "She loves to run, and she goes every morning."'
      },
      {
        text:'Choose the correct option:',
        context:'"Everyone in both classes __ to submit their assignments by Friday."',
        q:'Which verb correctly fills the blank?',
        opts:['are required','were required','require','is required'],
        ans:3,
        explain:'"Everyone" is always singular — it takes a singular verb. Even though "both classes" comes between the subject and verb, the subject is still "everyone." → "Everyone...is required."'
      },
      {
        text:'Identify the error:',
        context:'"The dog wagged it\'s tail and barked."',
        q:'What is wrong?',
        opts:['The verb "barked" is wrong','Nothing — it\'s correct','"it\'s" should be "its"','Missing comma'],
        ans:2,
        explain:'"It\'s" = "it is." "Its" = belonging to it (possession). The tail belongs to the dog, so we need the possessive form: "its tail." Test: "The dog wagged it is tail" — doesn\'t make sense, so use "its."'
      },
      {
        text:'Choose the best option:',
        context:'"The results of the experiment, which took three years to complete __ surprising."',
        q:'What punctuation belongs in the blank?',
        opts:['No punctuation',', (comma)','— (dash)','; (semicolon)'],
        ans:1,
        explain:'The phrase "which took three years to complete" is a nonessential clause — extra info that can be removed without changing the main meaning. It needs commas on BOTH sides: "The results of the experiment, which took three years to complete, were surprising."'
      },
      {
        text:'Identify the error:',
        context:'"She walked into the room, looks around, and sat down."',
        q:'What type of error is this?',
        opts:['Subject-verb agreement','Comma splice','Verb tense inconsistency','Pronoun error'],
        ans:2,
        explain:'The sentence switches tenses: "walked" (past) → "looks" (present) → "sat" (past). Tense must be consistent. Correct: "She walked into the room, looked around, and sat down." — all past tense.'
      },
      {
        text:'Choose the best version:',
        context:'"The box of chocolates ___ left on the counter."',
        q:'Which verb is correct?',
        opts:['were','are','was','have been'],
        ans:2,
        explain:'The subject is "box" (singular), not "chocolates." The phrase "of chocolates" is a prepositional phrase that modifies "box" — cross it out and you see: "The box...was left." Singular subject = singular verb.'
      },
      {
        text:'Choose the correct version:',
        context:'"She likes running, to swim, and dance."',
        q:'What is wrong and how should it be fixed?',
        opts:['Nothing is wrong','Parallel structure error: "running, swimming, and dancing"','Wrong verb tense','Missing comma'],
        ans:1,
        explain:'This is a parallel structure error. All items in a list must be in the same grammatical form. "Running" is an -ing gerund. All items must match: "She likes running, swimming, and dancing."'
      }
    ]
  },
  'eng-transitions':{
    title:'English: Transition Words',
    qs:[
      {
        text:'Choose the best transition word:',
        context:'"She studied every night for a month. ___, she scored higher than expected."',
        q:'Which transition best connects these ideas?',
        opts:['However','As a result','In contrast','For example'],
        ans:1,
        explain:'"As a result" signals cause and effect. She studied hard (cause) → she scored well (effect). "However" would imply the scoring was surprising in a contradictory way, but studying leading to good scores is expected, not contradictory.'
      },
      {
        text:'Choose the best transition:',
        context:'"The movie received poor reviews. ___, it became a box office hit."',
        q:'Which word best fills the blank?',
        opts:['Therefore','Furthermore','Nevertheless','For instance'],
        ans:2,
        explain:'"Nevertheless" (or "However") signals contrast — despite the poor reviews, it did well. The two sentences contradict each other, so a contrast transition is needed. "Therefore" implies cause/effect, which doesn\'t fit.'
      },
      {
        text:'Choose the best transition:',
        context:'"The team practiced daily. ___, they worked on their communication skills."',
        q:'Which transition fits best?',
        opts:['However','In addition','As a result','Although'],
        ans:1,
        explain:'"In addition" (or "Furthermore") signals that the second sentence is adding more of the same — both sentences describe things the team did. It\'s addition, not contrast or cause/effect.'
      },
      {
        text:'Identify the relationship:',
        context:'"First, she read the instructions. Then, she assembled the furniture."',
        q:'What type of transition is "first...then"?',
        opts:['Contrast','Cause/effect','Time sequence','Emphasis'],
        ans:2,
        explain:'"First...then" are time/sequence transitions. They indicate the order in which events happened. Other time transitions: subsequently, afterward, finally, previously, meanwhile.'
      },
      {
        text:'Choose the best word:',
        context:'"Many animals are endangered. ___, the mountain gorilla population has dropped below 1,000."',
        q:'Which transition introduces a specific example?',
        opts:['However','Consequently','For instance','Furthermore'],
        ans:2,
        explain:'"For instance" (or "For example," "Specifically") introduces a specific example of the general statement made in the first sentence. The gorilla detail is a specific case of "many animals are endangered."'
      }
    ]
  },
  'sci-data':{
    title:'Science: Interpretation of Data',
    qs:[
      {
        text:'Read the graph description and answer:',
        context:'A graph shows temperature (°C) on the x-axis from 0 to 100, and reaction rate (mol/sec) on the y-axis from 0 to 50. The line rises steeply from 0 to 40°C, then levels off between 40–70°C, then drops sharply after 70°C.',
        q:'At which temperature range was reaction rate highest?',
        opts:['0–20°C','40–70°C','70–100°C','0–40°C'],
        ans:1,
        explain:'The line "levels off" between 40–70°C, which means the reaction rate is at its maximum in that range and staying constant (flat/level). Leveling off on a graph means the value is at its highest plateau before dropping.'
      },
      {
        text:'Read the description and answer:',
        context:'Table: Plant height after 4 weeks with different water amounts. 100mL→5cm, 200mL→12cm, 300mL→18cm, 400mL→16cm, 500mL→10cm.',
        q:'What is the general relationship between water and plant height, based on this data?',
        opts:['More water always increases height','Less water always increases height','Height increases up to a point, then decreases with more water','There is no relationship'],
        ans:2,
        explain:'The data shows height goes up from 100mL to 300mL, peaks at 300mL (18cm), then decreases at 400mL and 500mL. This is called an "optimal range" — too little OR too much water reduces growth. Always describe the full trend, not just part of it.'
      },
      {
        text:'Interpret the data:',
        context:'Two scientists (Scientist A and Scientist B) measure the boiling point of a liquid. Scientist A records: 98°C, 99°C, 100°C, 99°C. Scientist B records: 95°C, 103°C, 97°C, 101°C.',
        q:'Whose results are more precise, and why?',
        opts:['Scientist A — results are closer together','Scientist B — results have a wider range','Both are equally precise','Precision cannot be determined'],
        ans:0,
        explain:'Precision = how close repeated measurements are to each other (consistency). Scientist A\'s results (98–100) are clustered closely together. Scientist B\'s (95–103) vary widely. Precision is different from accuracy — A is more precise regardless of whether the true boiling point is exactly 100°C.'
      },
      {
        text:'Read the passage and answer:',
        context:'A scatter plot shows study hours on the x-axis (1–10 hours) and test score on the y-axis (50–100%). The data points form a pattern rising from bottom-left to upper-right, with most points close to an imaginary line.',
        q:'What does this scatter plot show?',
        opts:['No relationship between study hours and score','A negative relationship: more hours = lower scores','A positive relationship: more hours = higher scores','Study hours have no effect after 5 hours'],
        ans:2,
        explain:'Points rising from bottom-left to upper-right = positive correlation. As x (study hours) increases, y (score) also increases. If points went from top-left to bottom-right, it would be negative correlation. Points scattered randomly = no correlation.'
      },
      {
        text:'Analyze the data:',
        context:'A table shows three trials of an experiment measuring how long a sugar cube takes to dissolve in water at 20°C. Trial 1: 45 sec. Trial 2: 43 sec. Trial 3: 47 sec.',
        q:'What is the average (mean) dissolving time across all three trials?',
        opts:['43 seconds','45 seconds','47 seconds','46 seconds'],
        ans:1,
        explain:'Mean = sum ÷ count. (45 + 43 + 47) ÷ 3 = 135 ÷ 3 = 45 seconds. Scientists run multiple trials to reduce the effect of random error — the average across trials gives a more reliable result than any single trial.'
      }
    ]
  },
  'sci-models':{
    title:'Science: Evaluation of Models & Claims',
    qs:[
      {
        text:'Evaluate the evidence:',
        context:'Claim: "Exercise increases metabolism and burns more calories than rest." A study found that people who exercised 30 minutes per day burned an average of 300 more calories daily than those who did not exercise.',
        q:'Does this evidence support, weaken, or not affect the claim?',
        opts:['Supports the claim','Weakens the claim','Neither supports nor weakens','Not enough information'],
        ans:0,
        explain:'The claim says exercise burns more calories. The evidence directly shows exercising people burned 300 more calories than non-exercising people. This is exactly what the claim predicts → it SUPPORTS the claim. Ask: "If the claim were true, would we expect this result?" Yes → supports.'
      },
      {
        text:'Evaluate the evidence:',
        context:'Claim: "Higher altitudes cause lower boiling points for water." At sea level (0m altitude), water boils at 100°C. At 2,000m altitude, water boils at 95°C. At 5,000m altitude, water boils at 83°C.',
        q:'Does this data support or weaken the claim?',
        opts:['Weakens the claim','Supports the claim','Is irrelevant to the claim','The claim cannot be evaluated'],
        ans:1,
        explain:'The claim says higher altitude → lower boiling point. The data shows: as altitude increases (0→2,000→5,000m), boiling point decreases (100→95→83°C). The data is perfectly consistent with the claim → SUPPORTS it.'
      },
      {
        text:'Evaluate new information:',
        context:'Claim: "Caffeine improves cognitive performance in all people." A new study finds that in people who regularly drink coffee, caffeine has NO measurable effect on cognitive test scores.',
        q:'How does this new finding affect the original claim?',
        opts:['Strongly supports the claim','Weakens the claim — it shows caffeine doesn\'t always improve performance','Is irrelevant to the claim','Proves the claim completely wrong'],
        ans:1,
        explain:'The claim says caffeine improves performance in ALL people. The new study shows it has NO effect in regular coffee drinkers. This is a counterexample — it shows the claim is not universally true → WEAKENS it. Note: it doesn\'t disprove it entirely (caffeine may still work in non-regular drinkers), but it weakens the "all people" part.'
      },
      {
        text:'Determine relevance:',
        context:'Claim: "Plants grow faster in red light than in blue light." New finding: Plants grown in red light have slightly thicker stems than those grown in blue light.',
        q:'Does the stem thickness finding support, weaken, or neither affect the growth rate claim?',
        opts:['Supports the growth rate claim','Weakens the growth rate claim','Neither — stem thickness is a different variable than growth rate','Proves red light is better'],
        ans:2,
        explain:'The claim is specifically about GROWTH RATE (how fast plants grow). Stem thickness is a different measurement — it tells us about plant structure, not speed of growth. This finding is neither consistent nor inconsistent with the growth rate claim → it\'s irrelevant to the specific claim being tested.'
      },
      {
        text:'Identify what strengthens the experiment:',
        context:'A scientist claims that salt water freezes at a lower temperature than fresh water. She tests ONE cup of salt water and ONE cup of fresh water. Salt water freezes at -5°C, fresh water at 0°C.',
        q:'What change would most strengthen confidence in this conclusion?',
        opts:['Use warmer temperatures','Test many more samples of each type','Use less salt in the saltwater','Conduct the experiment in a different location'],
        ans:1,
        explain:'Testing only one sample of each is a major weakness — results could be due to random variation or error. Testing many more samples increases sample size, which makes the results more reliable and the conclusion more trustworthy. This is the single most common "what would improve this experiment" answer on the ACT.'
      }
    ]
  },
  'math-functions':{
    title:'Math: Functions',
    qs:[
      {
        text:'Evaluate the function:',
        context:'f(x) = 3x + 2',
        q:'What is f(5)?',
        opts:['13','15','17','10'],
        ans:2,
        explain:'Replace every x with 5: f(5) = 3(5) + 2 = 15 + 2 = 17. The rule for evaluating any function: whatever is inside the parentheses replaces x everywhere in the formula.'
      },
      {
        text:'Evaluate the function:',
        context:'g(x) = x² − 4x + 1',
        q:'What is g(3)?',
        opts:['4','−2','10','-4'],
        ans:1,
        explain:'Replace x with 3: g(3) = (3)² − 4(3) + 1 = 9 − 12 + 1 = −2. Be careful with negative numbers and exponents — always square the entire input value, including its sign.'
      },
      {
        text:'Composite function:',
        context:'f(x) = x + 3 and g(x) = 2x',
        q:'What is f(g(4))?',
        opts:['10','11','14','8'],
        ans:1,
        explain:'Work inside out. First find g(4): g(4) = 2(4) = 8. Then find f(8): f(8) = 8 + 3 = 11. For f(g(x)), always solve the inner function (g) first, then plug that result into the outer function (f).'
      },
      {
        text:'Reading a function graph:',
        context:'A graph of f(x) passes through the points (0, 3), (1, 5), (2, 7), (3, 9), (4, 11).',
        q:'What is f(2)?',
        opts:['2','7','9','5'],
        ans:1,
        explain:'The question asks for the output when the input is 2. Find x = 2 on the x-axis, then read the corresponding y-value. The graph passes through (2, 7), so f(2) = 7.'
      },
      {
        text:'Function from a word problem:',
        context:'A cab company charges $3.00 base fee plus $1.50 per mile. The cost C as a function of miles m is C(m) = 1.5m + 3.',
        q:'How much does a 6-mile ride cost?',
        opts:['$9.00','$11.00','$12.00','$10.50'],
        ans:2,
        explain:'C(6) = 1.5(6) + 3 = 9 + 3 = $12.00. Always read word problems carefully: the "base fee" is the constant (added regardless of miles), and the "per mile" rate is the coefficient of m. This is a linear function of the form f(x) = mx + b.'
      },
      {
        text:'Domain of a function:',
        context:'h(x) = 1/(x − 5)',
        q:'Which value of x is NOT in the domain of h(x)?',
        opts:['x = 0','x = 1','x = 5','x = −5'],
        ans:2,
        explain:'The domain is all values x can take. Division by zero is undefined, so x − 5 cannot equal zero. Set x − 5 = 0 → x = 5. Therefore x = 5 is excluded from the domain. All other real numbers are allowed.'
      }
    ]
  },
  'math-stats':{
    title:'Math: Statistics & Probability',
    qs:[
      {
        text:'Find the mean:',
        context:'Data set: 8, 12, 15, 7, 18',
        q:'What is the mean of this data set?',
        opts:['12','15','13.5','12'],
        ans:0,
        explain:'Mean = sum ÷ count. (8 + 12 + 15 + 7 + 18) ÷ 5 = 60 ÷ 5 = 12. The mean is the arithmetic average — add all values, then divide by how many values there are.'
      },
      {
        text:'Find the median:',
        context:'Data set: 3, 7, 9, 2, 15, 6, 11',
        q:'What is the median?',
        opts:['7','9','6','8'],
        ans:0,
        explain:'Step 1: Sort in order: 2, 3, 6, 7, 9, 11, 15. Step 2: Find the middle value. With 7 numbers, the middle is the 4th value = 7. If there were 8 numbers, you\'d average the 4th and 5th.'
      },
      {
        text:'Calculate probability:',
        context:'A bag contains 4 red marbles, 6 blue marbles, and 5 green marbles. One marble is drawn at random.',
        q:'What is the probability of drawing a blue marble?',
        opts:['6/15','4/15','1/3','2/5'],
        ans:3,
        explain:'P(blue) = favorable outcomes ÷ total outcomes = 6 ÷ (4+6+5) = 6/15 = 2/5. Always simplify fractions when possible. 6/15 ÷ 3/3 = 2/5.'
      },
      {
        text:'Calculate probability:',
        context:'A bag contains 4 red marbles, 6 blue marbles, and 5 green marbles.',
        q:'What is the probability of drawing a marble that is NOT red?',
        opts:['4/15','11/15','1/4','3/4'],
        ans:1,
        explain:'P(NOT red) = 1 − P(red) = 1 − 4/15 = 11/15. Alternatively: count all non-red marbles = 6 blue + 5 green = 11, out of 15 total → 11/15. The "complement" method (1 minus the probability you DON\'T want) is often faster.'
      },
      {
        text:'Independent events:',
        context:'A fair coin is flipped twice.',
        q:'What is the probability of getting heads both times?',
        opts:['1/2','1/3','1/4','1/8'],
        ans:2,
        explain:'For two independent events (one doesn\'t affect the other), multiply their probabilities. P(heads) = 1/2 for each flip. P(heads AND heads) = 1/2 × 1/2 = 1/4.'
      },
      {
        text:'Range and outliers:',
        context:'Data set: 5, 8, 9, 7, 6, 100, 8',
        q:'Which value is an outlier, and what is the range of the data?',
        opts:['100 is an outlier; range = 95','No outliers; range = 95','100 is an outlier; range = 100','8 is an outlier; range = 92'],
        ans:0,
        explain:'An outlier is a value far from the rest. 100 is clearly separated from 5–9. Range = max − min = 100 − 5 = 95. Outliers can dramatically affect the mean but don\'t change the median as much — that\'s why median is sometimes more useful than mean.'
      }
    ]
  }
};

var currentQuiz=null;
var answered=[];

function loadPractice(id,btn){
  document.querySelectorAll('.topic-btn').forEach(function(b){b.classList.remove('active');});
  if(btn)btn.classList.add('active');
  currentQuiz=id;
  answered=new Array(QUIZZES[id].qs.length).fill(null);
  renderQuiz();
}

function renderQuiz(){
  var quiz=QUIZZES[currentQuiz];
  var container=document.getElementById('quiz-container');
  var letters=['A','B','C','D'];
  var html='<h3 style="font-size:1rem;font-weight:600;margin-bottom:1rem;color:var(--muted)">'+quiz.title+'</h3>';
  quiz.qs.forEach(function(q,qi){
    html+='<div class="quiz-q" id="qq'+qi+'">';
    html+='<div class="q-num">Question '+(qi+1)+' of '+quiz.qs.length+'</div>';
    html+='<div class="q-text">'+q.text+'</div>';
    if(q.context)html+='<div class="q-context">'+q.context+'</div>';
    html+='<div style="font-size:14px;font-weight:600;margin-bottom:10px">'+q.q+'</div>';
    html+='<div class="q-options">';
    q.opts.forEach(function(opt,oi){
      html+='<button class="q-opt" id="opt_'+qi+'_'+oi+'" onclick="selectOpt('+qi+','+oi+')">';
      html+='<span class="opt-letter">'+letters[oi]+'</span><span>'+opt+'</span></button>';
    });
    html+='</div>';
    html+='<div class="q-explain" id="exp'+qi+'">'+
      '<strong>Explanation:</strong> '+q.explain+'</div>';
    html+='</div>';
  });
  html+='<div class="submit-row"><button class="btn-primary" onclick="scoreQuiz()">Check my score</button>';
  html+='<button class="btn-secondary" onclick="loadPractice(currentQuiz,null)">Reset</button></div>';
  html+='<div id="quiz-score-box" style="display:none"></div>';
  container.innerHTML=html;
}

function selectOpt(qi,oi){
  if(answered[qi]!==null)return;
  answered[qi]=oi;
  var quiz=QUIZZES[currentQuiz];
  var correct=quiz.qs[qi].ans;
  var letters=['A','B','C','D'];
  for(var i=0;i<quiz.qs[qi].opts.length;i++){
    var btn=document.getElementById('opt_'+qi+'_'+i);
    if(btn){
      btn.disabled=true;
      if(i===oi&&oi===correct)btn.classList.add('correct');
      else if(i===oi&&oi!==correct)btn.classList.add('wrong');
      else if(i===correct)btn.classList.add('reveal');
    }
  }
  var exp=document.getElementById('exp'+qi);
  if(exp)exp.classList.add('show');
}

function scoreQuiz(){
  var quiz=QUIZZES[currentQuiz];
  var correct=0;
  quiz.qs.forEach(function(q,qi){
    if(answered[qi]===q.ans)correct++;
    selectOpt(qi,answered[qi]!==null?answered[qi]:-1);
  });
  var pct=Math.round(correct/quiz.qs.length*100);
  var msg=pct>=80?'Great work! Go log any wrong answers in your notebook.':
          pct>=60?'Good start. Review the explanations above and try again tomorrow.':
          'Not bad for a first try — read through the Lesson for this topic, then come back.';
  var box=document.getElementById('quiz-score-box');
  if(box){
    box.style.display='block';
    box.innerHTML='<div class="quiz-score"><div class="qs-num">'+correct+'/'+quiz.qs.length+'</div>'+
      '<div class="qs-label">'+pct+'% correct</div>'+
      '<div class="qs-msg">'+msg+'</div>'+
      '<button class="btn-primary" onclick="loadPractice(currentQuiz,null)">Try again</button></div>';
    box.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
}

/* ─── FLASHCARDS ───────────────────────────────────────────────── */
var DECKS={
  english:[
    {front:'What are the 6 comma rules?',back:'1. After intro phrase\n2. Before FANBOYS joining 2 sentences\n3. No comma splice (comma alone can\'t join 2 sentences)\n4. Around nonessential clauses\n5. Between list items\n6. Never between subject and verb'},
    {front:'What is a comma splice?',back:'Two complete sentences joined only by a comma — always wrong.\nFix: use a period, semicolon, or comma + FANBOYS.'},
    {front:'What are the FANBOYS conjunctions?',back:'For, And, Nor, But, Or, Yet, So\nUse a comma BEFORE these when joining two complete sentences.'},
    {front:'When do you use a semicolon?',back:'To join two complete sentences that are closely related.\nBoth sides of the semicolon MUST be complete sentences.\n"She loves math; she studies every night." ✓'},
    {front:'What is parallel structure?',back:'Items in a list must be in the same grammatical form.\nWrong: running, to swim, dance\nRight: running, swimming, dancing'},
    {front:'When do you use a colon?',back:'After a complete sentence to introduce a list or explanation.\nWhat comes BEFORE the colon must be a complete sentence.\n"I have three hobbies: reading, hiking, cooking." ✓'},
    {front:'"Its" vs "It\'s" — what\'s the difference?',back:'"It\'s" = it is\n"Its" = possession (belonging to it)\nTest: Replace with "it is" — if it makes sense, use "it\'s." If not, use "its."'},
    {front:'What makes a sentence a fragment?',back:'Missing a subject, verb, or complete thought.\n"Running through the park." = fragment (no subject)\nFix: "She was running through the park."'},
    {front:'Subject-verb agreement rule',back:'Singular subject → singular verb\nPlural subject → plural verb\nTrick: Cross out everything between subject and verb to find the real subject.'},
    {front:'Singular indefinite pronouns',back:'Always singular — take singular verbs:\nEveryone, someone, anyone, nobody, each, either, neither, one\n"Everyone IS here." ✓  "Everyone ARE here." ✗'},
    {front:'5 contrast transition words',back:'However · Nevertheless · Although · Despite · On the other hand\nUse when sentence 2 contradicts or surprises sentence 1.'},
    {front:'5 addition transition words',back:'Furthermore · In addition · Moreover · Additionally · Also\nUse when sentence 2 adds more of the same idea.'},
    {front:'5 cause/effect transitions',back:'Therefore · Consequently · As a result · Thus · So\nUse when sentence 2 is the result of sentence 1.'},
    {front:'5 time/sequence transitions',back:'First · Then · Subsequently · Meanwhile · Finally\nUse when describing events in order.'},
    {front:'The ACT wordiness rule',back:'Shorter = usually better on the ACT.\nIf two answers say the same thing, choose the shorter one.\nRedundancy (saying the same thing twice) is always wrong.'},
    {front:'Common redundant phrases to avoid',back:'"End result" → result\n"Past history" → history\n"Future plans" → plans\n"New innovation" → innovation\n"Advance forward" → advance\n"Basic fundamentals" → fundamentals'},
    {front:'When should you DELETE on the ACT?',back:'Choose DELETE when removing the underlined portion:\n1. Leaves a complete, correct sentence\n2. Doesn\'t change the meaning\n3. Removes redundant or irrelevant information'},
    {front:'Who vs. Whom',back:'Who = subject (doing the action)\nWhom = object (receiving the action)\nTest: Replace with he/she → use WHO\nReplace with him/her → use WHOM'},
    {front:'What is pronoun-antecedent agreement?',back:'A pronoun must match its antecedent in number.\nSingular noun → singular pronoun\nPlural noun → plural pronoun\n"Each student brought his or her pencil." ✓'},
    {front:'What is an ambiguous pronoun?',back:'A pronoun that could refer to more than one noun.\n"The book fell off the shelf and it broke." ← Who broke? Fix by naming the noun explicitly.'}
  ],
  science:[
    {front:'Independent variable',back:'The variable the scientist intentionally CHANGES.\nThere is usually only one.\nIt goes on the X-axis of a graph.'},
    {front:'Dependent variable',back:'The variable that is MEASURED as a result of the independent variable.\nIt "depends on" what the independent variable does.\nIt goes on the Y-axis.'},
    {front:'Control group',back:'The group where NOTHING is changed — the baseline.\nAll experimental groups are compared to the control.\n"Control" = "no treatment" group.'},
    {front:'Constant/Controlled variable',back:'Everything that is kept THE SAME across all groups.\nThis ensures any differences are caused by the independent variable, not something else.'},
    {front:'What makes a valid experiment?',back:'1. Only ONE variable changed at a time\n2. Has a control group\n3. Adequate sample size\n4. All other variables controlled\n5. Results can be reproduced'},
    {front:'Hypothesis',back:'A testable prediction made BEFORE the experiment.\nFormat: "If [condition], then [outcome] because [reason]."\nA good hypothesis can be proven true or false.'},
    {front:'How to improve an experiment (most common ACT answer)',back:'• Increase the sample size\n• Add a control group\n• Control for variables that weren\'t held constant\n• Repeat the experiment multiple times'},
    {front:'Positive vs. negative correlation on a graph',back:'Positive: line goes up-left to right → as X increases, Y increases\nNegative: line goes down-left to right → as X increases, Y decreases\nNo correlation: points scattered randomly'},
    {front:'How to evaluate a claim — the key question',back:'Ask: "If the claim is TRUE, would we EXPECT to see this evidence?"\nYes → evidence SUPPORTS the claim\nNo → evidence WEAKENS the claim\nUnrelated → evidence is irrelevant'},
    {front:'When does evidence SUPPORT a claim?',back:'When the evidence is CONSISTENT with what the claim predicts.\nThe result is what you\'d expect IF the claim were true.\nExample: Claim says more sun = faster growth. Data shows more sun → more growth. ✓ Supports.'},
    {front:'When does evidence WEAKEN a claim?',back:'When the evidence CONTRADICTS what the claim predicts.\nThe result is NOT what you\'d expect IF the claim were true.\nExample: Claim says more caffeine = better focus. Data shows no effect. ✗ Weakens.'},
    {front:'Precision vs. Accuracy',back:'Precision = how consistent repeated measurements are (close to each other)\nAccuracy = how close measurements are to the TRUE value\nYou can be precise but inaccurate (consistently wrong).'},
    {front:'What does "as X increases, Y decreases" mean on a graph?',back:'Negative relationship / negative correlation\nThe line slopes downward from left to right.\nExample: As altitude increases, air pressure decreases.'},
    {front:'How to read a table',back:'1. Read the column and row headers\n2. Find the row the question asks about\n3. Find the column the question asks about\n4. Read the value at their intersection\nAlways look at the table — never guess.'},
    {front:'Sample size — why does it matter?',back:'Larger sample size = more reliable results\nSmall samples can produce misleading results by chance.\nACT often asks: "How would increasing sample size affect results?" Answer: It would make the conclusion more reliable/valid.'}
  ],
  math:[
    {front:'How do you evaluate f(5) when f(x) = 2x + 1?',back:'Replace every x with 5:\nf(5) = 2(5) + 1 = 10 + 1 = 11\nThe rule: whatever is in the parentheses replaces x.'},
    {front:'What does f(x) mean?',back:'"f of x" — the output of function f when the input is x.\nThink of it as a machine: x goes in, f(x) comes out.\nThe formula tells you what the machine does to the input.'},
    {front:'How do you solve f(g(3))?',back:'Work inside out:\n1. Solve g(3) first\n2. Plug that result into f\nExample: f(x)=x+1, g(x)=2x → g(3)=6 → f(6)=7'},
    {front:'What is the domain of a function?',back:'All allowed INPUT values (x values).\nExclude values that cause:\n• Division by zero\n• Square root of a negative number\nExample: f(x)=1/(x-3) → domain = all real numbers except x=3'},
    {front:'What is the range of a function?',back:'All possible OUTPUT values (y values).\nOn a graph: range = all y-values the graph reaches.\nFor f(x) = x², range = y ≥ 0 (output is always 0 or positive)'},
    {front:'How do you find a function value from a graph?',back:'f(3) = ? → Go to x=3 on the x-axis.\nDraw a vertical line up to the graph.\nRead the y-value where it hits.\nIf the graph passes through (3,8), then f(3)=8.'},
    {front:'Formula for mean (average)',back:'Mean = Sum of all values ÷ Count of values\nExample: 10, 15, 20 → (10+15+20)÷3 = 45÷3 = 15\nThe mean is the most commonly tested stats concept on the ACT.'},
    {front:'How to find the median',back:'1. Sort values from smallest to largest\n2. Odd count → middle value\n3. Even count → average the two middle values\nExample: 2,5,7,9,12 → Median=7 (3rd of 5 values)'},
    {front:'What is the mode?',back:'The value that appears MOST OFTEN in a data set.\nA set can have one mode, multiple modes, or no mode.\nExample: 2,3,3,5,7,3,9 → Mode=3 (appears 3 times)'},
    {front:'Formula for range',back:'Range = Largest value − Smallest value\nMeasures the spread of the data.\nExample: 5,8,12,19,23 → Range = 23−5 = 18'},
    {front:'Probability formula',back:'P(event) = Favorable outcomes ÷ Total possible outcomes\nAlways between 0 and 1 (or 0% to 100%).\nP=0 means impossible. P=1 means certain.'},
    {front:'Probability of NOT an event',back:'P(NOT A) = 1 − P(A)\nExample: P(red) = 4/15\nP(NOT red) = 1 − 4/15 = 11/15\nThis is called the "complement" rule.'},
    {front:'Probability of two independent events (AND)',back:'P(A AND B) = P(A) × P(B)\nFor independent events (one doesn\'t affect the other), multiply.\nExample: P(heads) × P(heads) = 1/2 × 1/2 = 1/4'},
    {front:'What is an outlier?',back:'A value that is far away from the rest of the data.\nOutliers affect the MEAN significantly but not the median as much.\nThis is why median is sometimes more useful than mean.'},
    {front:'Subject-verb agreement — quick tip',back:'Cross out prepositional phrases between subject and verb.\n"The box OF CHOCOLATES was left..." → subject is "box"\n"The results OF THE EXPERIMENT were..." → subject is "results"'}
  ]
};

var curDeck='english';
var curCard=0;
var flipped=false;

function loadDeck(name,btn){
  document.querySelectorAll('.pack-tab').forEach(function(b){b.classList.remove('active');});
  if(btn)btn.classList.add('active');
  curDeck=name;
  curCard=0;
  flipped=false;
  renderCard();
}

function renderCard(){
  var deck=DECKS[curDeck];
  var card=deck[curCard];
  var fc=document.getElementById('flashcard');
  var inner=document.getElementById('fc-inner');
  var front=document.getElementById('fc-front');
  var back=document.getElementById('fc-back');
  var count=document.getElementById('fc-count');
  var fill=document.getElementById('fc-prog-fill');
  if(!fc)return;
  if(flipped)fc.classList.add('flipped');
  else fc.classList.remove('flipped');
  front.innerHTML='<div class="fc-front-label">Question</div><div class="fc-q">'+card.front.replace(/\n/g,'<br>')+'</div>';
  back.innerHTML='<div class="fc-back-label">Answer</div><div class="fc-a">'+card.back.replace(/\n/g,'<br>').replace(/✓/g,'<strong>✓</strong>').replace(/✗/g,'<strong style="color:var(--red)">✗</strong>')+'</div>';
  count.textContent='Card '+(curCard+1)+' of '+deck.length;
  fill.style.width=Math.round((curCard+1)/deck.length*100)+'%';
  var hint=document.getElementById('fc-hint');
  if(hint)hint.textContent=flipped?'Tap to flip back':'Tap to flip';
  document.getElementById('fc-prev').disabled=curCard===0;
  document.getElementById('fc-next').textContent=curCard===deck.length-1?'Start over':'Next →';
}

function flipCard(){
  flipped=!flipped;
  renderCard();
}

function fcNext(){
  var deck=DECKS[curDeck];
  if(curCard<deck.length-1){curCard++;flipped=false;}
  else{curCard=0;flipped=false;}
  renderCard();
}

function fcPrev(){
  if(curCard>0){curCard--;flipped=false;renderCard();}
}

/* ─── SCHEDULE ─────────────────────────────────────────────────── */
var SCHEDULE=[
  {
    phase:'Phase 1',title:'English Emergency',dates:'Jun 16 – Jun 29',
    why:'English is Priority #1. A score of 9 has the most room to grow. Everything else waits two weeks.',
    sessions:[
      {day:'Wk 1 · Day 1',title:'Grammar Flashcards',desc:'Read: Lessons → Comma Rules. Write the 6 comma rules on yellow index cards.',link:'eng-commas',linkLabel:'Open Comma Rules lesson',time:'45 min'},
      {day:'Wk 1 · Day 2',title:'Conventions Practice',desc:'Do: Practice → English Conventions. Log every wrong answer in your notebook.',link:'eng-conv',linkLabel:'Start practice quiz',time:'50 min',isPractice:true},
      {day:'Wk 1 · Day 3',title:'Sentence Structure',desc:'Read: Lessons → Sentence Structure. Make cards for run-ons, fragments, semicolons, and parallel structure.',link:'eng-sentences',linkLabel:'Open Sentence Structure lesson',time:'45 min'},
      {day:'Wk 2 · Day 1',title:'Transition Words',desc:'Read: Lessons → Transition Words. Write a card for each of the 5 categories.',link:'eng-transitions',linkLabel:'Open Transitions lesson',time:'45 min'},
      {day:'Wk 2 · Day 2',title:'Transitions Practice + Verbs',desc:'Do: Practice → Transitions quiz. Then: Lessons → Verb Tenses. Make cards for tense consistency and subject-verb agreement.',link:'eng-transitions-practice',linkLabel:'Start Transitions quiz',time:'55 min',isPractice:true},
      {day:'Wk 2 · Day 3',title:'Wordiness + Full English Review',desc:'Read: Lessons → Wordiness & Clarity. Review all English flashcards. Flip through your entire yellow stack.',link:'eng-wordiness',linkLabel:'Open Wordiness lesson',time:'50 min'}
    ]
  },
  {
    phase:'Phase 2',title:'Science & Math Push',dates:'Jun 30 – Jul 13',
    why:'Attack Science — especially Evaluation of Models (10%!) — while keeping English gains alive with weekly reviews.',
    sessions:[
      {day:'Wk 3 · Day 1',title:'Science: Reading Data',desc:'Read: Lessons → Reading Data. Practice reading axes, trends, and comparing multiple lines.',link:'sci-data',linkLabel:'Open Reading Data lesson',time:'50 min'},
      {day:'Wk 3 · Day 2',title:'Science: Experiment Design',desc:'Read: Lessons → Experiment Design. Make green cards for ALL 8 vocabulary terms.',link:'sci-experiment',linkLabel:'Open Experiment Design lesson',time:'45 min'},
      {day:'Wk 3 · Day 3',title:'English Review',desc:'Do: Practice → English Conventions. Keep the Phase 1 gains alive — review your yellow flashcard stack.',link:'eng-conv',linkLabel:'English practice quiz',time:'45 min',isPractice:true},
      {day:'Wk 4 · Day 1',title:'Science: Evaluating Models',desc:'Read: Lessons → Evaluating Models & Claims. This is your weakest area — go slowly and take notes.',link:'sci-models',linkLabel:'Open Evaluating Models lesson',time:'55 min'},
      {day:'Wk 4 · Day 2',title:'Science Practice + Math Functions',desc:'Do: Practice → Science: Models. Then: Lessons → Functions. Make blue cards for f(x) notation and evaluation.',link:'sci-models',linkLabel:'Start Science: Models quiz',time:'60 min',isPractice:true},
      {day:'Wk 4 · Day 3',title:'Math: Stats & Probability',desc:'Read: Lessons → Stats & Probability. Make blue cards for all 6 formulas. Work 3 examples by hand.',link:'math-stats',linkLabel:'Open Stats & Probability lesson',time:'45 min'}
    ]
  },
  {
    phase:'Phase 3',title:'Full Practice Sections',dates:'Jul 14 – Jul 27',
    why:'Time pressure is its own skill. Now that content is solid, practice working fast under real conditions.',
    sessions:[
      {day:'Wk 5 · Day 1',title:'Full English Practice',desc:'Do: Practice → English Conventions AND Transitions back to back. Time yourself. Review every wrong answer.',link:'eng-conv',linkLabel:'Start English quiz',time:'60 min',isPractice:true},
      {day:'Wk 5 · Day 2',title:'Full Science Practice',desc:'Do: Practice → Science Data AND Science Models. Log errors. Review Evaluating Models lesson if below 60%.',link:'sci-data',linkLabel:'Start Science quiz',time:'55 min',isPractice:true},
      {day:'Wk 5 · Day 3',title:'Full Math Practice',desc:'Do: Practice → Math Functions AND Math Stats back to back. Review any wrong answers in the Lessons tab.',link:'math-functions',linkLabel:'Start Math quiz',time:'55 min',isPractice:true},
      {day:'Wk 6 · Day 1',title:'English + Grammar Flashcards',desc:'Full English practice quiz. Then flip through your entire yellow flashcard stack — pull any cards you hesitate on.',link:'eng-conv',linkLabel:'English practice',time:'55 min',isPractice:true},
      {day:'Wk 6 · Day 2',title:'Science + Vocab Flashcards',desc:'Full Science practice. Then review all green flashcards. Pay special attention to the Evaluation cards.',link:'sci-models',linkLabel:'Science practice',time:'55 min',isPractice:true},
      {day:'Wk 6 · Day 3',title:'Mixed Review',desc:'Do all 3 practice quizzes back to back: English → Science → Math. Log every error. Note which topics feel weakest.',link:null,time:'75 min'}
    ]
  },
  {
    phase:'Phase 4',title:'Final Push',dates:'Jul 28 – Aug 8',
    why:'Lock everything in. One full timed practice test, then surgical review of whatever still needs work.',
    sessions:[
      {day:'Wk 7 · Day 1',title:'⭐ Full Practice Test',desc:'Find a free official ACT practice test at act.org. Do all 4 sections back to back under real conditions: no phone, timed, quiet space. This is the most important session of the summer.',link:null,time:'3–4 hours',highlight:true},
      {day:'Wk 7 · Day 2',title:'Practice Test Review',desc:'Go through every wrong answer from the practice test. Write the rule or concept for each in your error log. Make new flashcards for anything that surprised you.',link:null,time:'60 min'},
      {day:'Wk 7 · Day 3',title:'Targeted Weak Spots',desc:'Based on what the practice test revealed, drill exactly those categories. Use the Lessons + Practice tabs for the weak spots.',link:null,time:'50 min'},
      {day:'Wk 8 · Day 1',title:'Full Flashcard Review',desc:'Flip through ALL three stacks (yellow, blue, green). Pull any card you hesitate on into a "shaky" pile. Review the shaky pile twice.',link:'english',linkLabel:'Open Flashcards',time:'45 min'},
      {day:'Wk 8 · Day 2',title:'Light Mixed Drill',desc:'One round of each practice quiz. Easy day — the goal is staying warm, not grinding. If you get above 80% on all three, you\'re ready.',link:null,time:'30 min'},
      {day:'Wk 8 · Day 3',title:'🎉 Rest up.',desc:'Read your error log one last time. Then stop. Go to sleep early the night before the test. You put in the work.',link:null,time:'Aug 8',highlight:true}
    ]
  }
];

function buildSchedule(){
  var container=document.getElementById('schedule-content');
  if(!container||container.children.length>0)return;
  var html='';
  SCHEDULE.forEach(function(phase){
    html+='<div class="phase-block">';
    html+='<div class="phase-label">'+phase.phase+'</div>';
    html+='<div class="phase-title">'+phase.title+'</div>';
    html+='<div class="phase-dates">'+phase.dates+'</div>';
    html+='<div class="phase-why">'+phase.why+'</div>';
    html+='<div class="sessions-grid">';
    phase.sessions.forEach(function(s){
      html+='<div class="session'+(s.highlight?' highlight':'')+'">'+
        '<div class="session-day">'+s.day+'</div>'+
        '<div class="session-title">'+s.title+'</div>'+
        '<div class="session-desc">'+s.desc+'</div>';
      if(s.link){
        if(s.isPractice){
          html+='<span class="session-link" onclick="goToTab(\'practice\')">→ '+s.linkLabel+'</span>';
        } else if(s.link==='english'||s.link==='science'||s.link==='math'){
          html+='<span class="session-link" onclick="goToTab(\'flashcards\')">→ '+s.linkLabel+'</span>';
        } else {
          html+='<span class="session-link" onclick="goToTab(\'lessons\');setTimeout(function(){showLesson(\''+s.link+'\',document.querySelector(\'.ln-btn\'))},200)">→ '+s.linkLabel+'</span>';
        }
      }
      html+='<div class="session-time">'+s.time+'</div></div>';
    });
    html+='</div></div>';
  });
  container.innerHTML=html;
}

/* ─── TRACKER ──────────────────────────────────────────────────── */
var PHASES_T=[
  {label:'Wk 1',phase:'Phase 1'},{label:'Wk 2',phase:'Phase 1'},
  {label:'Wk 3',phase:'Phase 2'},{label:'Wk 4',phase:'Phase 2'},
  {label:'Wk 5',phase:'Phase 3'},{label:'Wk 6',phase:'Phase 3'},
  {label:'Wk 7',phase:'Phase 4'},{label:'Wk 8',phase:'Phase 4'}
];

function buildTracker(){
  var container=document.getElementById('tracker-grid');
  if(!container)return;
  container.innerHTML='';
  PHASES_T.forEach(function(wk,wi){
    var row=document.createElement('div');
    row.className='tracker-week';
    var lbl=document.createElement('span');
    lbl.className='tracker-week-label';
    lbl.textContent=wk.label;
    row.appendChild(lbl);
    var dots=document.createElement('div');
    dots.className='tracker-dots';
    for(var s=0;s<3;s++){
      var id=wi+'-'+s;
      var dot=document.createElement('div');
      dot.className='tracker-dot'+(doneSessions.indexOf(id)>-1?' done':'');
      dot.title='Week '+(wi+1)+', Session '+(s+1);
      (function(did,d){
        d.addEventListener('click',function(){toggleSession(did,d);});
      })(id,dot);
      dots.appendChild(dot);
    }
    row.appendChild(dots);
    var phase=document.createElement('span');
    phase.className='tracker-phase';
    phase.textContent=wk.phase;
    row.appendChild(phase);
    container.appendChild(row);
  });
  updateTrackerStat();
}

function toggleSession(id,dot){
  var idx=doneSessions.indexOf(id);
  if(idx>-1){doneSessions.splice(idx,1);dot.classList.remove('done');}
  else{doneSessions.push(id);dot.classList.add('done');}
  saveState();
  updateTrackerStat();
}

function updateTrackerStat(){
  var el=document.getElementById('tracker-stat');
  if(el)el.textContent=doneSessions.length+' of 24 complete';
}

/* ─── Init on load ─────────────────────────────────────────────── */
(function(){
  showStep(curStep);
  if(document.getElementById('tab-practice').classList.contains('active')){
    loadPractice('eng-conv',document.querySelector('.topic-btn'));
  }
  if(document.getElementById('tab-flashcards').classList.contains('active')){
    loadDeck('english',document.querySelector('.pack-tab'));
  }
  loadPractice('eng-conv',null);
  loadDeck('english',null);
  buildSchedule();
  buildTracker();
})();
