// ─── Page Map ───
const PAGE_MAP = {
  's-feed': 'feed.html',
  's-rooms': 'rooms.html',
  's-messages': 'messages.html',
  's-more3': 'index.html',
  's-more3-search': 'search.html',
  's-forms': 'forms.html',
  's-help': 'help.html',
  's-pages': 'pages.html',
  's-events': 'events.html',
  's-athletics': 'athletics.html',
  's-documents': 'documents.html',
  's-dining': 'dining.html',
  's-staff': 'staff.html',
  's-about': 'about.html',
  's-parent-resources': 'parent-resources.html',
  's-volunteer-form': 'volunteer-form.html',
  's-success-ptconf': 'success-ptconf.html',
  's-success-bus-routes': 'success-bus-routes.html',
  's-success-volunteer': 'success-volunteer.html',
  's-success-parent-resources': 'success-parent-resources.html',
};

// ─── Navigation ───
function show(id) {
  if (PAGE_MAP[id]) {
    window.location.href = PAGE_MAP[id];
  }
}

function showMore() {
  show('s-more3');
}

// ─── State Persistence ───
function saveState() {
  try {
    const state = {
      m3Recents: m3Recents,
      fsApplied: fsApplied,
      fsSelSchools: [...fsSelSchools],
      fsSelTags: [...fsSelTags],
      evFilterSchools: [...evFilterSchools],
      evFilterTags: [...evFilterTags],
      atFilterSchools: [...atFilterSchools],
      atFilterTags: [...atFilterTags],
      selDate: selDate,
      weekOff: weekOff,
      evView: evView,
      atSelDate: atSelDate,
      atWeekOff: atWeekOff,
      atView: atView,
    };
    sessionStorage.setItem('sv1-state', JSON.stringify(state));
  } catch(e) {}
}

function loadState() {
  try {
    const raw = sessionStorage.getItem('sv1-state');
    if (!raw) return;
    const state = JSON.parse(raw);
    if (state.m3Recents) m3Recents = state.m3Recents;
    if (state.fsApplied) Object.assign(fsApplied, state.fsApplied);
    if (state.fsSelSchools) fsSelSchools = new Set(state.fsSelSchools);
    if (state.fsSelTags) fsSelTags = new Set(state.fsSelTags);
    if (state.evFilterSchools) evFilterSchools = new Set(state.evFilterSchools);
    if (state.evFilterTags) evFilterTags = new Set(state.evFilterTags);
    if (state.atFilterSchools) atFilterSchools = new Set(state.atFilterSchools);
    if (state.atFilterTags) atFilterTags = new Set(state.atFilterTags);
    if (state.selDate) selDate = state.selDate;
    if (state.weekOff !== undefined) weekOff = state.weekOff;
    if (state.evView) evView = state.evView;
    if (state.atSelDate) atSelDate = state.atSelDate;
    if (state.atWeekOff !== undefined) atWeekOff = state.atWeekOff;
    if (state.atView) atView = state.atView;
  } catch(e) {}
}

// ─── Filter Bottom Sheet ───
const FILTER_CONFIG = {
  staff: {
    schools: ['Lincoln Elem', 'Washington MS'],
    tags: [
      {label:'Administration', value:'administration'},
      {label:'Teaching',       value:'teaching'},
      {label:'Library',        value:'library'},
      {label:'Athletics',      value:'athletics'},
    ]
  },
  documents: {
    schools: ['Lincoln Elem', 'Washington MS'],
    tags: [
      {label:'Handbook',  value:'handbook'},
      {label:'Policy',    value:'policy'},
      {label:'Nutrition', value:'nutrition'},
      {label:'Supplies',  value:'supplies'},
    ]
  },
  forms: {
    schools: ['Lincoln Elem', 'Washington MS'],
    tags: [
      {label:'Permission', value:'permission'},
      {label:'Health',     value:'health'},
      {label:'Enrollment', value:'enrollment'},
      {label:'Volunteer',  value:'volunteer'},
      {label:'Field Trip', value:'field-trip'},
      {label:'Emergency',  value:'emergency'},
      {label:'Supplies',   value:'supplies'},
    ]
  },
  pages: {
    schools: ['Lincoln Elem', 'Washington MS'],
    tags: [
      {label:'General Info',   value:'general'},
      {label:'Newsletters',    value:'newsletter'},
      {label:'Programs',       value:'programs'},
      {label:'Transportation', value:'transportation'},
      {label:'Nutrition',      value:'nutrition'},
      {label:'Calendar',       value:'calendar'},
      {label:'Policy',         value:'policy'},
      {label:'Athletics',      value:'athletics'},
    ]
  },
  dining: {
    schools: ['Washington MS'],
    tags: []
  },
  events: {
    schools: ['Lincoln Elem', 'Washington MS', 'Brookwood ISD'],
    tags: [
      {label:'Performing Arts', value:'performing-arts'},
      {label:'Sports',          value:'sports'},
      {label:'Academic',        value:'academic'},
      {label:'Field Trip',      value:'field-trip'},
      {label:'Community',       value:'community'},
      {label:'District',        value:'district'},
    ]
  },
  athletics: {
    schools: ['Lincoln Elem', 'Washington MS', 'Brookwood ISD'],
    tags: [
      {label:'Game',         value:'game'},
      {label:'Tournament',   value:'tournament'},
      {label:'Track & Field',value:'track-field'},
    ]
  },
};

let fsCurrentSection = null;
let fsActiveTab = 'school';
let fsSelSchools = new Set();
let fsSelTags = new Set();
const fsApplied = {};

function updateFilterBadge(section) {
  const badge = document.getElementById('fbadge-' + section);
  if (!badge) return;
  const count = fsApplied[section] || 0;
  badge.textContent = count;
  badge.classList.toggle('visible', count > 0);
}

function openFilterSheet(section) {
  fsCurrentSection = section;
  fsActiveTab = 'school';
  document.getElementById('fsheet-overlay').classList.add('open');
  document.getElementById('fsheet').classList.add('open');
  switchFilterTab('school');
  renderFilterSchools();
  renderFilterTags();
}

function closeFilterSheet() {
  document.getElementById('fsheet-overlay').classList.remove('open');
  document.getElementById('fsheet').classList.remove('open');
}

function switchFilterTab(tab) {
  fsActiveTab = tab;
  document.getElementById('fstab-school').classList.toggle('active', tab === 'school');
  document.getElementById('fstab-tags').classList.toggle('active', tab === 'tags');
  document.getElementById('fsheet-school').style.display = tab === 'school' ? '' : 'none';
  document.getElementById('fsheet-tags').style.display = tab === 'tags' ? '' : 'none';
  const hasTags = (FILTER_CONFIG[fsCurrentSection]?.tags || []).length > 0;
  document.getElementById('fstab-tags').style.display = hasTags ? '' : 'none';
}

function fsheetCheckSvg() {
  return `<svg class="fcheck-svg" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#fff" stroke-width="2.5"><polyline points="2 6 5 9 10 3"/></svg>`;
}

function renderFilterSchools() {
  const cfg = FILTER_CONFIG[fsCurrentSection];
  if (!cfg) return;
  const c = document.getElementById('fsheet-school');
  c.innerHTML = '<div class="fsheet-list">' +
    cfg.schools.map(s => {
      const sel = fsSelSchools.has(s);
      return `<div class="fsheet-row${sel?' sel':''}" data-maze-id="filter-school-${s}" onclick="toggleFilterChip('school','${s}')">
        <span class="fsheet-row-label">${s}</span>
        <div class="fsheet-row-check">${fsheetCheckSvg()}</div>
      </div>`;
    }).join('') + '</div>';
}

function renderFilterTags() {
  const cfg = FILTER_CONFIG[fsCurrentSection];
  if (!cfg || !cfg.tags.length) return;
  const c = document.getElementById('fsheet-tags');
  c.innerHTML = '<div class="fsheet-list">' +
    cfg.tags.map(t => {
      const sel = fsSelTags.has(t.value);
      return `<div class="fsheet-row${sel?' sel':''}" data-maze-id="filter-tag-${t.value}" onclick="toggleFilterChip('tag','${t.value}')">
        <span class="fsheet-row-label">${t.label}</span>
        <div class="fsheet-row-check">${fsheetCheckSvg()}</div>
      </div>`;
    }).join('') + '</div>';
}

function toggleFilterChip(type, value) {
  if (type === 'school') {
    fsSelSchools.has(value) ? fsSelSchools.delete(value) : fsSelSchools.add(value);
    renderFilterSchools();
  } else {
    fsSelTags.has(value) ? fsSelTags.delete(value) : fsSelTags.add(value);
    renderFilterTags();
  }
}

function clearFilters() {
  fsSelSchools.clear();
  fsSelTags.clear();
  renderFilterSchools();
  renderFilterTags();
  applyFiltersToSection(fsCurrentSection, new Set(), new Set());
  fsApplied[fsCurrentSection] = 0;
  updateFilterBadge(fsCurrentSection);
}

function applyFilters() {
  applyFiltersToSection(fsCurrentSection, fsSelSchools, fsSelTags);
  fsApplied[fsCurrentSection] = fsSelSchools.size + fsSelTags.size;
  updateFilterBadge(fsCurrentSection);
  closeFilterSheet();
  saveState();
}

function applyFiltersToSection(section, schools, tags) {
  if (section === 'events' || section === 'athletics') {
    if (section === 'events') { evFilterSchools = schools; evFilterTags = tags; applyEvFilter(); }
    else                       { atFilterSchools = schools; atFilterTags = tags; applyAtFilter(); }
    return;
  }
  const containerMap = {
    staff:     '#s-staff .scroll',
    documents: '#s-documents .scroll',
    dining:    '#s-dining .scroll',
    forms:     '#forms-district',
    pages:     '#s-pages .scroll',
  };
  const containerSel = containerMap[section];
  if (!containerSel) return;
  const container = document.querySelector(containerSel);
  if (!container) return;

  const rows = container.querySelectorAll('.list-row');
  rows.forEach(row => {
    const subEl = row.querySelector('.list-row-sub');
    const nameEl = row.querySelector('.list-row-name');
    const subText = subEl ? subEl.textContent : '';
    const tagVal = nameEl ? (nameEl.dataset.tag || '') : '';

    const schoolPass = schools.size === 0 || [...schools].some(s => subText.includes(s));
    const tagPass    = tags.size === 0    || tags.has(tagVal);
    row.style.display = (schoolPass && tagPass) ? '' : 'none';
  });
}

let evFilterSchools = new Set();
let evFilterTags = new Set();
let atFilterSchools = new Set();
let atFilterTags = new Set();

function applyEvFilter() {
  document.querySelectorAll('#ev-schedule .ev-card, #ev-schedule .allday-card').forEach(card => {
    const org = card.dataset.org || '';
    const type = card.dataset.type || '';
    const schoolPass = evFilterSchools.size === 0 || [...evFilterSchools].some(s => org.includes(s));
    const tagPass    = evFilterTags.size === 0    || evFilterTags.has(type);
    card.style.display = (schoolPass && tagPass) ? '' : 'none';
  });
}

function applyAtFilter() {
  document.querySelectorAll('#at-schedule .ev-card').forEach(card => {
    const org = card.dataset.org || '';
    const type = card.dataset.type || '';
    const schoolPass = atFilterSchools.size === 0 || [...atFilterSchools].some(s => org.includes(s));
    const tagPass    = atFilterTags.size === 0    || atFilterTags.has(type);
    card.style.display = (schoolPass && tagPass) ? '' : 'none';
  });
}

// ─── Data Constants ───
const M3_ALL_ITEMS=[
  {lb:'Events',          sub:'Universal',              ic:'#ic-cal',    tgt:'s-events'},
  {lb:'Athletics',       sub:'Universal',              ic:'#ic-sport',  tgt:'s-athletics'},
  {lb:'Documents',       sub:'Universal',              ic:'#ic-doc',    tgt:'s-documents'},
  {lb:'Dining',          sub:'Universal \u00b7 Washington', ic:'#ic-dining', tgt:'s-dining'},
  {lb:'Staff Directory', sub:'Universal',              ic:'#ic-people', tgt:'s-staff'},
  {lb:'Help Center',     sub:'Universal',              ic:'#ic-help',   tgt:null},
  {lb:'Forms',           sub:'Universal',              ic:'#ic-doc',    tgt:'s-forms'},
  {lb:'Pages',           sub:'Universal',              ic:'#ic-doc',    tgt:'s-pages'},
  // Forms by school
  {lb:'Permission Slip',       sub:'Forms \u00b7 Lincoln Elem',  ic:'#ic-doc', tgt:'s-forms'},
  {lb:'Emergency Contact Form',sub:'Forms \u00b7 Lincoln Elem',  ic:'#ic-doc', tgt:'s-forms'},
  {lb:'Enrollment Forms',      sub:'Forms \u00b7 Lincoln Elem',  ic:'#ic-doc', tgt:'s-forms'},
  {lb:'Health Form',           sub:'Forms \u00b7 Lincoln Elem',  ic:'#ic-doc', tgt:'s-forms'},
  {lb:'Volunteer Form',        sub:'Forms \u00b7 Lincoln Elem',  ic:'#ic-doc', tgt:'s-volunteer-form'},
  {lb:'Field Trip Permission',   sub:'Forms \u00b7 Washington MS', ic:'#ic-doc', tgt:'s-forms'},
  {lb:'Health & Medication Form',sub:'Forms \u00b7 Washington MS', ic:'#ic-doc', tgt:'s-forms'},
  {lb:'Supply Request',          sub:'Forms \u00b7 Washington MS', ic:'#ic-doc', tgt:'s-forms'},
  // Pages by school
  {lb:'About Us',                 sub:'Pages \u00b7 Lincoln Elem',  ic:'#ic-info', tgt:'s-pages'},
  {lb:'PTA Newsletter \u2014 Spring 2026', sub:'Pages \u00b7 Lincoln Elem', ic:'#ic-doc', tgt:'s-pages'},
  {lb:'After School Programs',    sub:'Pages \u00b7 Lincoln Elem',  ic:'#ic-doc', tgt:'s-pages'},
  {lb:'Bus Routes & Pickup Times',sub:'Pages \u00b7 Lincoln Elem',  ic:'#ic-doc', tgt:'s-success-bus-routes'},
  {lb:'Cafeteria & Nutrition Info',sub:'Pages \u00b7 Lincoln Elem', ic:'#ic-doc', tgt:'s-pages'},
  {lb:'Staff Spotlight',          sub:'Pages \u00b7 Lincoln Elem',  ic:'#ic-doc', tgt:'s-pages'},
  {lb:'About Us',                 sub:'Pages \u00b7 Washington MS', ic:'#ic-info', tgt:'s-pages'},
  {lb:'Drama Club',               sub:'Pages \u00b7 Washington MS', ic:'#ic-doc', tgt:'s-pages'},
  {lb:'Academic Calendar 2025\u201326',sub:'Pages \u00b7 Washington MS', ic:'#ic-doc', tgt:'s-pages'},
  {lb:'Parent Resources',         sub:'Pages \u00b7 Washington MS', ic:'#ic-doc', tgt:'s-parent-resources'},
  {lb:'Technology & Device Policy',sub:'Pages \u00b7 Washington MS',ic:'#ic-doc', tgt:'s-pages'},
  {lb:'Athletics Schedule \u2014 Spring',sub:'Pages \u00b7 Washington MS',ic:'#ic-doc', tgt:'s-pages'},
  // Staff by name
  {lb:'Ms. Sandra Craig',    sub:'Staff \u00b7 Lincoln Elem',  ic:'#ic-people', tgt:'s-staff'},
  {lb:'Mr. James Rivera',    sub:'Staff \u00b7 Lincoln Elem',  ic:'#ic-people', tgt:'s-staff'},
  {lb:'Ms. Amy Leung',       sub:'Staff \u00b7 Lincoln Elem',  ic:'#ic-people', tgt:'s-staff'},
  {lb:'Ms. Maria Wong',      sub:'Staff \u00b7 Lincoln Elem',  ic:'#ic-people', tgt:'s-staff'},
  {lb:'Mr. Robert Davis',    sub:'Staff \u00b7 Washington MS', ic:'#ic-people', tgt:'s-staff'},
  {lb:'Ms. Kaitlyn Henson',  sub:'Staff \u00b7 Washington MS', ic:'#ic-people', tgt:'s-staff'},
  {lb:'Mr. Brian Moore',     sub:'Staff \u00b7 Washington MS', ic:'#ic-people', tgt:'s-staff'},
  {lb:'Mr. Chris Stevens',   sub:'Staff \u00b7 Washington MS', ic:'#ic-people', tgt:'s-staff'},
];

let m3Recents=[
  {lb:'Events', sub:'Universal', ic:'#ic-cal', tgt:'s-events'},
  {lb:'Dining', sub:'Universal \u00b7 Washington', ic:'#ic-dining', tgt:'s-dining'},
];

// ─── More 3 Search ───
function openM3Search(from){
  // Store where we came from
  const fromPage = from || detectCurrentPage();
  try { sessionStorage.setItem('sv1-search-from', fromPage); } catch(e) {}
  saveState();
  window.location.href = 'search.html';
}

function closeM3Search(){
  let fromPage = 'index.html';
  try { fromPage = sessionStorage.getItem('sv1-search-from') || 'index.html'; } catch(e) {}
  // Map screen IDs to filenames if needed
  if (PAGE_MAP[fromPage]) fromPage = PAGE_MAP[fromPage];
  window.location.href = fromPage;
}

function detectCurrentPage() {
  const path = window.location.pathname;
  const file = path.split('/').pop() || 'index.html';
  return file;
}

function m3ClearSearch(){
  const inp=document.getElementById('m3-search-input');
  if(inp){inp.value='';inp.focus();}
  const clr=document.getElementById('m3-clear-btn');
  if(clr)clr.style.display='none';
  m3RenderResults('');
}

function m3SearchUpdate(val){
  const clr=document.getElementById('m3-clear-btn');
  if(clr)clr.style.display=val?'block':'none';
  m3RenderResults(val.trim());
}

function m3RenderResults(query){
  const c=document.getElementById('m3-search-results');if(!c)return;
  if(!query){
    let h=`<div class="section-hdr">Recent</div><div style="background:#fff;">`;
    if(m3Recents.length){m3Recents.forEach(r=>{h+=m3ResultRow(r,true);});}
    else{h+=`<div style="padding:14px 16px;font-size:14px;color:#747474;">No recent searches yet.</div>`;}
    h+='</div>';
    c.innerHTML=h;return;
  }
  const q=query.toLowerCase();
  const results=M3_ALL_ITEMS.filter(it=>it.lb.toLowerCase().includes(q)||it.sub.toLowerCase().includes(q));
  if(!results.length){c.innerHTML=`<div style="padding:48px 24px;text-align:center;color:#747474;font-size:14px;">No results for "<strong style="color:#2d2d2d;">${query}</strong>"</div>`;return;}
  let h=`<div class="section-hdr">${results.length} result${results.length!==1?'s':''}</div><div style="background:#fff;">`;
  results.forEach(r=>{h+=m3ResultRow(r,false);});
  h+='</div>';
  c.innerHTML=h;
}

function m3ResultRow(item,isRecent){
  const clockIc=`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#909090" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
  const sectionIc=`<svg width="18" height="18"><use href="${item.ic}"/></svg>`;
  const lbEsc = item.lb.replace(/'/g,"\\'");
  const subEsc = item.sub.replace(/'/g,"\\'");
  const icEsc = item.ic.replace(/'/g,"\\'");
  const tgtEsc = (item.tgt||'').replace(/'/g,"\\'");
  const nav=item.tgt?`data-maze-id="more3-search-result-${item.lb}" onclick="m3NavTo('${lbEsc}','${subEsc}','${icEsc}','${tgtEsc}')" style="cursor:pointer;"`:`style="cursor:default;"`;
  return `<div class="more-item" ${nav}>
    <div style="width:20px;height:20px;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#2d2d2d;">${isRecent?clockIc:sectionIc}</div>
    <div style="flex:1;min-width:0;">
      <div style="font-size:15px;color:#2d2d2d;font-weight:500;">${item.lb}</div>
      <div style="font-size:12px;color:#747474;margin-top:2px;">${item.sub}</div>
    </div>
    <span class="more-chev">\u203a</span>
  </div>`;
}

function m3NavTo(lb,sub,ic,tgt){
  m3Recents=m3Recents.filter(r=>!(r.lb===lb&&r.sub===sub));
  m3Recents.unshift({lb,sub,ic,tgt});
  if(m3Recents.length>5)m3Recents.length=5;
  saveState();
  if(tgt && PAGE_MAP[tgt]) {
    window.location.href = PAGE_MAP[tgt];
  }
}

// ─── Events ───
const DAY_A=['Su','M','T','W','Th','F','Sa'];
const MON_L=['January','February','March','April','May','June','July','August','September','October','November','December'];
const EV_TYPE_MAP={
  'Spirit Week \u2014 Day 3':        'district',
  'Spring Concert':             'performing-arts',
  'Drama Club Showcase':        'performing-arts',
  'Basketball vs Jefferson MS': 'sports',
  'No School \u2014 Spring Break':   'district',
  'Parent-Teacher Conferences': 'academic',
  'Science Museum Field Trip':  'field-trip',
  'Spring Carnival':            'community',
};
const EV={
  '2026-03-19':{allDay:[{title:'Spirit Week \u2014 Day 3',org:'Brookwood ISD'}],timed:[{time:'6:30 PM',status:'UPCOMING',org:'Lincoln Elem',title:'Spring Concert',desc:'Join us for the annual spring concert in the school gymnasium. Doors open at 6:00 PM. All families welcome.',addr:'210 Lincoln Ave, Brookwood, TX'}]},
  '2026-03-20':{allDay:[],timed:[{time:'9:30 AM',status:'UPCOMING',org:'Washington MS',title:'Drama Club Showcase',desc:"Students present this semester's performances. Seating is first come, first served.",addr:'450 Washington Blvd, Brookwood, TX'}]},
  '2026-03-21':{allDay:[],timed:[{time:'6:00 PM',status:'UPCOMING',org:'Washington MS',title:'Basketball vs Jefferson MS',desc:'Home game. Come support the Tigers! Concessions will be available.',addr:'450 Washington Blvd, Brookwood, TX'}]},
  '2026-03-26':{allDay:[{title:'No School \u2014 Spring Break',org:'Brookwood ISD'}],timed:[]},
  '2026-03-27':{allDay:[{title:'No School \u2014 Spring Break',org:'Brookwood ISD'}],timed:[]},
  '2026-03-28':{allDay:[],timed:[{time:'3:00 PM',status:'UPCOMING',org:'Lincoln Elem',title:'Parent-Teacher Conferences',desc:'Schedule your conference slot through the school office. Evening slots until 7:00 PM.',addr:'210 Lincoln Ave, Brookwood, TX'}]},
  '2026-04-02':{allDay:[{title:'Science Museum Field Trip',org:'Washington MS'}],timed:[]},
  '2026-04-10':{allDay:[],timed:[{time:'11:00 AM',status:'UPCOMING',org:'Lincoln Elem',title:'Spring Carnival',desc:'Annual spring carnival with games, food, and activities for the whole family.',addr:'210 Lincoln Ave, Brookwood, TX'}]}
};
function hasEv(d){const x=EV[d];return x&&(x.allDay.length>0||x.timed.length>0);}
function ds(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
let evView='schedule',selDate='2026-03-19',weekOff=0;
function getWeekSun(off){const t=new Date(2026,2,17);const s=new Date(t);s.setDate(t.getDate()-t.getDay()+off*7);return s;}
function evMonthLabel() {
  const d = new Date(selDate + 'T00:00:00');
  return MON_L[d.getMonth()] + ' ' + d.getDate();
}
function evMonthYearLabel() {
  const d = new Date(selDate + 'T00:00:00');
  return MON_L[d.getMonth()] + ' ' + d.getFullYear();
}
function setEvDropdownLabel(l){const el=document.getElementById('ev-dropdown-label');if(el)el.textContent=l;}
function renderTabs(){
  const sun=getWeekSun(weekOff),inner=document.getElementById('dt-inner');if(!inner)return;
  inner.innerHTML='';
  for(let i=0;i<7;i++){
    const d=new Date(sun);d.setDate(sun.getDate()+i);
    const dstr=ds(d),isSel=dstr===selDate,hasDot=hasEv(dstr);
    const el=document.createElement('div');el.className='dt-tab';el.onclick=()=>pickDay(dstr);
    if(isSel)el.style.borderBottom='2.5px solid #2d2d2d';
    el.innerHTML=`<div class="dt-dot${hasDot?'':' hide'}"></div><div style="font-size:16px;font-weight:${isSel?700:500};color:${isSel?'#2d2d2d':'#646464'};line-height:20px;">${d.getDate()}</div><div style="font-size:11px;color:${isSel?'#2d2d2d':'#646464'};text-transform:uppercase;">${DAY_A[d.getDay()]}</div>`;
    inner.appendChild(el);
  }
}
function pickDay(dstr){
  selDate=dstr;
  const t=new Date(2026,2,17),ts=new Date(t);ts.setDate(t.getDate()-t.getDay());
  const d=new Date(dstr+'T00:00:00'),ds2=new Date(d);ds2.setDate(d.getDate()-d.getDay());
  weekOff=Math.round((ds2-ts)/(7*86400000));renderTabs();renderSchedule();
  setEvDropdownLabel('Schedule');
}
function prevWeek(){weekOff--;renderTabs();setEvDropdownLabel('Schedule');}
function nextWeek(){weekOff++;renderTabs();setEvDropdownLabel('Schedule');}
function renderSchedule(){
  const c=document.getElementById('ev-schedule');if(!c)return;
  const data=EV[selDate];
  if(!data||(data.allDay.length===0&&data.timed.length===0)){const _ed=new Date(selDate+'T00:00:00'),_elabel=MON_L[_ed.getMonth()]+' '+_ed.getDate();c.innerHTML=`<div style="padding:48px 24px;text-align:center;"><div style="font-size:40px;margin-bottom:12px;">\ud83d\udcc5</div><div style="font-size:16px;font-weight:600;color:#2d2d2d;margin-bottom:6px;">No events on ${_elabel}</div><div style="font-size:14px;color:#747474;">Select another day or navigate weeks</div></div>`;return;}
  let h='';
  (data.allDay||[]).forEach(ev=>{const _atag=EV_TYPE_MAP[ev.title]||'district';h+=`<div class="allday-card" data-org="${ev.org}" data-type="${_atag}"><div class="allday-top"><div><div class="allday-label">All Day</div><div class="allday-org">${ev.org}</div></div><div class="allday-red-dot"></div></div><div class="allday-title">${ev.title}</div></div>`;});
  (data.timed||[]).forEach(ev=>{const _etag=EV_TYPE_MAP[ev.title]||'community';const _isPT=ev.title==='Parent-Teacher Conferences';h+=`<div class="ev-card" data-org="${ev.org}" data-type="${_etag}"${_isPT?' data-ptlink data-maze-id="ptconf-link" style="cursor:pointer;"':''}><div class="ev-card-hdr"><div class="ev-card-r1"><span class="ev-time">${ev.time}</span><span class="ev-status">${ev.status}</span><span class="ev-keb">\u00b7\u00b7\u00b7</span></div><div class="ev-card-org">${ev.org}</div></div><div class="ev-card-body"><div class="ev-title">${ev.title}</div><div class="ev-desc">${ev.desc} <span class="ev-desc-more">more</span></div><div class="ev-addr"><svg width="11" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${ev.addr}</div></div><div class="ev-actions"><button class="ev-btn-share">SHARE</button><button class="ev-btn-add">ADD TO CALENDAR</button></div></div>`;});
  c.onclick=function(e){if(e.target.closest('[data-ptlink]'))show('s-success-ptconf');};
  c.innerHTML=h;
  applyEvFilter();
}
const IC_CAL=`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
const IC_LIST=`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3" cy="6" r="1.2" fill="currentColor"/><circle cx="3" cy="12" r="1.2" fill="currentColor"/><circle cx="3" cy="18" r="1.2" fill="currentColor"/></svg>`;

// Close view menus on outside tap
document.addEventListener('click', function(e){
  if(!e.target.closest('#ev-view-btn') && !e.target.closest('#ev-view-menu')) closeEvViewMenu();
  if(!e.target.closest('#at-view-btn') && !e.target.closest('#at-view-menu')) closeAtViewMenu();
});

function openEvViewMenu(e){
  e.stopPropagation();
  const m=document.getElementById('ev-view-menu');
  if(m) m.style.display=m.style.display==='none'?'block':'none';
}
function closeEvViewMenu(){
  const m=document.getElementById('ev-view-menu');
  if(m)m.style.display='none';
}
function setEvView(view){
  evView=view;
  closeEvViewMenu();
  const isSched=view==='schedule', isMon=view==='month', isCal=view==='calendar';
  document.getElementById('ev-sched-wrap').style.display=isSched?'block':'none';
  document.getElementById('ev-month-wrap').style.display=isMon?'block':'none';
  document.getElementById('ev-cal-wrap').style.display=isCal?'block':'none';
  document.getElementById('dtbar').style.display=isSched?'flex':'none';
  ['schedule','month','calendar'].forEach(v=>{
    const el=document.getElementById('evmenu-check-'+v);
    if(el)el.style.opacity=v===view?'1':'0';
  });
  if(isSched){setEvDropdownLabel('Schedule');renderTabs();renderSchedule();}
  else if(isMon){setEvDropdownLabel('Month');renderMonthList();}
  else{renderCal();}
}
function toggleEvView(){ setEvView('calendar'); }
function goToday(){
  selDate='2026-03-17';weekOff=0;
  setEvView(evView==='calendar'||evView==='month'?evView:'schedule');
  selDate='2026-03-17';weekOff=0;
  if(evView==='schedule'){setEvDropdownLabel('Schedule');renderTabs();renderSchedule();}
}
function renderMonthList(){
  const c=document.getElementById('ev-month-list');if(!c)return;
  const today=new Date(selDate+'T00:00:00');
  const allEntries=[];
  Object.keys(EV).sort().forEach(dstr=>{
    const d=new Date(dstr+'T00:00:00');
    if(d<today) return;
    const data=EV[dstr];
    (data.allDay||[]).forEach(ev=>{allEntries.push({dstr,ev,allDay:true});});
    (data.timed||[]).forEach(ev=>{allEntries.push({dstr,ev,allDay:false});});
  });
  if(!allEntries.length){
    c.innerHTML=`<div style="padding:48px 24px;text-align:center;"><div style="font-size:40px;margin-bottom:12px;">\ud83d\udcc5</div><div style="font-size:16px;font-weight:600;color:#2d2d2d;margin-bottom:6px;">No upcoming events</div></div>`;
    return;
  }
  let h='';let lastMonth='';
  allEntries.forEach(({dstr,ev,allDay})=>{
    const d=new Date(dstr+'T00:00:00');
    const monthKey=MON_L[d.getMonth()]+' '+d.getFullYear();
    const monAbbr=MON_L[d.getMonth()].slice(0,3);
    const dayNum=d.getDate();
    if(monthKey!==lastMonth){
      h+=`<div style="padding:14px 16px 6px;font-size:13px;font-weight:600;color:#747474;text-transform:uppercase;letter-spacing:.05em;background:#f8f8f8;border-bottom:1px solid #e1e1e1;">${monthKey}</div>`;
      lastMonth=monthKey;
    }
    const dateTile=`<div class="ev-date-tile"><span class="ev-date-tile-mon">${monAbbr}</span><span class="ev-date-tile-day">${dayNum}</span></div>`;
    const _etag=EV_TYPE_MAP[ev.title]||'community';
    if(allDay){
      h+=`<div class="allday-card" data-org="${ev.org}" data-type="${_etag}" style="display:flex;align-items:flex-start;">
        ${dateTile}
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
            <div style="font-size:11px;font-weight:600;color:#747474;letter-spacing:.03em;">ALL DAY</div>
            <div class="allday-red-dot" style="width:7px;height:7px;border-radius:50%;background:#CC314B;flex-shrink:0;"></div>
          </div>
          <div style="font-size:12px;color:#747474;margin-bottom:2px;">${ev.org}</div>
          <div style="font-size:15px;font-weight:600;color:#2d2d2d;">${ev.title}</div>
        </div>
      </div>`;
    } else {
      h+=`<div class="ev-card" data-org="${ev.org}" data-type="${_etag}">
        <div class="ev-card-hdr">
          <div class="ev-card-r1">
            ${dateTile}
            <div style="flex:1;min-width:0;">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px;">
                <span class="ev-time">${ev.time}</span>
                <span class="ev-status">${ev.status}</span>
                <span class="ev-keb" style="margin-left:auto;">\u00b7\u00b7\u00b7</span>
              </div>
              <div class="ev-card-org">${ev.org}</div>
            </div>
          </div>
        </div>
        <div class="ev-card-body" style="padding-left:52px;">
          <div class="ev-title">${ev.title}</div>
          <div class="ev-desc">${ev.desc} <span class="ev-desc-more">more</span></div>
          <div class="ev-addr"><svg width="11" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${ev.addr}</div>
        </div>
        <div class="ev-actions"><button class="ev-btn-share">SHARE</button><button class="ev-btn-add">ADD TO CALENDAR</button></div>
      </div>`;
    }
  });
  c.innerHTML=h;
  applyEvFilter();
}
function renderCal(){
  const c=document.getElementById('ev-cal-wrap');
  const DOW=['MON','TUE','WED','THU','FRI','SAT','SUN'];
  let h='<div style="padding-top:8px;">';
  [[2026,2],[2026,3],[2026,4]].forEach(([y,m])=>{
    h+=`<div class="cal-month" data-year="${y}"><div class="cal-month-title">${MON_L[m]} ${y}</div><div class="cal-grid">`;
    DOW.forEach(d=>h+=`<div class="cal-dow">${d}</div>`);
    const first=new Date(y,m,1),off=(first.getDay()+6)%7;
    for(let i=0;i<off;i++)h+=`<div class="cal-cell"></div>`;
    const days=new Date(y,m+1,0).getDate();
    for(let day=1;day<=days;day++){
      const dstr=y+'-'+String(m+1).padStart(2,'0')+'-'+String(day).padStart(2,'0');
      let cls='cal-cell';if(dstr===selDate)cls+=' sel';
      h+=`<div class="${cls}" onclick="pickDayFromCal('${dstr}')"><div class="cal-num">${day}</div>${hasEv(dstr)?'<div class="cal-ev-dot"></div>':''}</div>`;
    }
    h+=`</div></div>`;
  });
  c.innerHTML=h+'</div>';
  setEvDropdownLabel('Year');
  c.onscroll=function(){
    const months=c.querySelectorAll('.cal-month[data-year]');
    for(const m of months){if(m.getBoundingClientRect().bottom>c.getBoundingClientRect().top+20){setEvDropdownLabel(m.dataset.year);break;}}
  };
}
function pickDayFromCal(dstr){
  selDate=dstr;evView='schedule';
  document.getElementById('ev-sched-wrap').style.display='block';
  document.getElementById('ev-cal-wrap').style.display='none';
  document.getElementById('dtbar').style.display='flex';
  setEvDropdownLabel('Schedule');
  const t=new Date(2026,2,17),ts=new Date(t);ts.setDate(t.getDate()-t.getDay());
  const d=new Date(dstr+'T00:00:00'),ds2=new Date(d);ds2.setDate(d.getDate()-d.getDay());
  weekOff=Math.round((ds2-ts)/(7*86400000));renderTabs();renderSchedule();
}
function initEv(){
  weekOff=0;
  const emw = document.getElementById('ev-month-wrap');
  if(emw) emw.style.display='none';
  setEvView('schedule');
}

// ─── Athletics ───
const AT_DATA = {
  '2026-03-17':[{type:'game',time:'3:30 PM',status:'LIVE',org:'Lincoln Elem',home:'Lincoln Tigers',away:'Jefferson Bears',homeScore:14,awayScore:7,addr:'210 Lincoln Ave, Brookwood, TX'}],
  '2026-03-19':[{type:'game',time:'4:00 PM',status:'UPCOMING',org:'Washington MS',home:'Washington Tigers',away:'Oak Park Wolves',homeScore:0,awayScore:0,addr:'450 Washington Blvd, Brookwood, TX'}],
  '2026-03-21':[{type:'game',time:'6:00 PM',status:'UPCOMING',org:'Washington MS',home:'Washington Tigers',away:'Jefferson MS',homeScore:0,awayScore:0,addr:'450 Washington Blvd, Brookwood, TX'}],
  '2026-03-24':[{type:'tournament',time:'8:00 AM',status:'UPCOMING',org:'Brookwood ISD',title:'District Wrestling Tournament',desc:'Annual district tournament. All weight classes compete. Brackets posted day of.',addr:'100 District Blvd, Brookwood, TX'}],
  '2026-03-26':[{type:'series',time:'9:00 AM',status:'UPCOMING',org:'Lincoln Elem',home:'Lincoln Runners',away:'District Invitees',desc:'Spring Track & Field Series \u2014 Meet 2 of 4. All events run simultaneously.',addr:'210 Lincoln Ave, Brookwood, TX'}],
  '2026-04-04':[{type:'game',time:'10:00 AM',status:'UPCOMING',org:'Lincoln Elem',home:'Lincoln Tigers',away:'Madison Bears',homeScore:0,awayScore:0,addr:'210 Lincoln Ave, Brookwood, TX'}],
};
function atHasEv(d){const x=AT_DATA[d];return x&&x.length>0;}
function atDs(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
let atView='schedule',atSelDate='2026-03-17',atWeekOff=0;
function atGetWeekSun(off){const t=new Date(2026,2,17);const s=new Date(t);s.setDate(t.getDate()-t.getDay()+off*7);return s;}
function atMonthLabel() {
  const d = new Date(atSelDate + 'T00:00:00');
  return MON_L[d.getMonth()] + ' ' + d.getFullYear();
}
function atSetDropdownLabel(l){const el=document.getElementById('at-dropdown-label');if(el)el.textContent=l;}
function atRenderTabs(){
  const sun=atGetWeekSun(atWeekOff),inner=document.getElementById('at-inner');if(!inner)return;
  inner.innerHTML='';
  for(let i=0;i<7;i++){
    const d=new Date(sun);d.setDate(sun.getDate()+i);
    const dstr=atDs(d),isSel=dstr===atSelDate,hasDot=atHasEv(dstr);
    const el=document.createElement('div');el.className='dt-tab';el.onclick=()=>atPickDay(dstr);
    if(isSel)el.style.borderBottom='2.5px solid #2d2d2d';
    el.innerHTML=`<div class="dt-dot${hasDot?'':' hide'}"></div><div style="font-size:16px;font-weight:${isSel?700:500};color:${isSel?'#2d2d2d':'#646464'};line-height:20px;">${d.getDate()}</div><div style="font-size:11px;color:${isSel?'#2d2d2d':'#646464'};text-transform:uppercase;">${DAY_A[d.getDay()]}</div>`;
    inner.appendChild(el);
  }
}
function atPickDay(dstr){
  atSelDate=dstr;
  const t=new Date(2026,2,17),ts=new Date(t);ts.setDate(t.getDate()-t.getDay());
  const d=new Date(dstr+'T00:00:00'),ds2=new Date(d);ds2.setDate(d.getDate()-d.getDay());
  atWeekOff=Math.round((ds2-ts)/(7*86400000));atRenderTabs();atRenderSchedule();
  atSetDropdownLabel(atMonthLabel());
}
function atPrevWeek(){atWeekOff--;atRenderTabs();atSetDropdownLabel(atMonthLabel());}
function atNextWeek(){atWeekOff++;atRenderTabs();atSetDropdownLabel(atMonthLabel());}
function atRenderCard(ev){
  const PAW=`<svg width="20" height="20" viewBox="0 0 36 36" fill="#e05c1a"><ellipse cx="10" cy="8" rx="4" ry="5"/><ellipse cx="26" cy="8" rx="4" ry="5"/><ellipse cx="4" cy="18" rx="3.5" ry="4.5"/><ellipse cx="32" cy="18" rx="3.5" ry="4.5"/><path d="M18 14c-6 0-11 4-11 10 0 4 2.5 7 5 8.5 1.5.9 3.5 1.5 6 1.5s4.5-.6 6-1.5c2.5-1.5 5-4.5 5-8.5 0-6-5-10-11-10z"/></svg>`;
  const liveDot=`<span style="width:6px;height:6px;border-radius:50%;background:#CC314B;display:inline-block;flex-shrink:0;"></span>`;
  const statusHtml=ev.status==='LIVE'
    ?`<span style="display:flex;align-items:center;gap:4px;font-size:12px;color:#CC314B;font-weight:600;">${liveDot}LIVE</span>`
    :`<span style="font-size:12px;color:#646464;">${ev.status}</span>`;
  let bodyHtml='';
  if(ev.type==='game'){
    bodyHtml=`
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
        <div style="display:flex;align-items:center;gap:8px;flex:1;">${PAW}<span style="font-size:16px;font-weight:600;color:#2d2d2d;">${ev.home}</span></div>
        <span style="font-size:16px;font-weight:600;color:#2d2d2d;">${ev.homeScore}</span>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
        <div style="display:flex;align-items:center;gap:8px;flex:1;">${PAW}<span style="font-size:16px;font-weight:600;color:#2d2d2d;">${ev.away}</span></div>
        <span style="font-size:16px;font-weight:600;color:#2d2d2d;">${ev.awayScore}</span>
      </div>`;
  }else if(ev.type==='series'){
    bodyHtml=`
      <div style="display:flex;align-items:center;gap:8px;">${PAW}<span style="font-size:16px;font-weight:600;color:#2d2d2d;">${ev.home}</span></div>
      <div style="display:flex;align-items:center;gap:8px;">${PAW}<span style="font-size:16px;font-weight:600;color:#2d2d2d;">${ev.away}</span></div>
      <div style="font-size:15px;color:#646464;line-height:1.45;">${ev.desc}</div>`;
  }else{
    bodyHtml=`
      <div style="font-size:16px;font-weight:600;color:#2d2d2d;">${ev.title}</div>
      <div style="font-size:15px;color:#646464;line-height:1.45;">${ev.desc}</div>`;
  }
  const addrSvg=`<svg width="11" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
  const _attype=ev.type==='game'?'game':ev.type==='tournament'?'tournament':'track-field';return `<div class="ev-card" data-org="${ev.org}" data-type="${_attype}">
    <div class="ev-card-hdr">
      <div class="ev-card-r1"><span class="ev-time">${ev.time}</span><span style="flex:1;text-align:right;">${statusHtml}</span><span class="ev-keb">\u00b7\u00b7\u00b7</span></div>
      <div class="ev-card-org">${ev.org}</div>
    </div>
    <div class="ev-card-body" style="display:flex;flex-direction:column;gap:10px;">
      ${bodyHtml}
      <div class="ev-addr">${addrSvg}${ev.addr}</div>
    </div>
    <div class="ev-actions"><button class="ev-btn-share">SHARE</button><button class="ev-btn-add">ADD TO CALENDAR</button></div>
  </div>`;
}
function atRenderSchedule(){
  const c=document.getElementById('at-schedule');if(!c)return;
  const data=AT_DATA[atSelDate];
  if(!data||!data.length){const _ad=new Date(atSelDate+'T00:00:00'),_alabel=MON_L[_ad.getMonth()]+' '+_ad.getDate();c.innerHTML=`<div style="padding:48px 24px;text-align:center;"><div style="font-size:40px;margin-bottom:12px;">\ud83c\udfc6</div><div style="font-size:16px;font-weight:600;color:#2d2d2d;margin-bottom:6px;">No athletic events on ${_alabel}</div><div style="font-size:14px;color:#747474;">Select another day or navigate weeks</div></div>`;return;}
  document.getElementById('at-schedule').innerHTML=data.map(ev=>atRenderCard(ev)).join('');
  applyAtFilter();
}
function openAtViewMenu(e){
  e.stopPropagation();
  const m=document.getElementById('at-view-menu');
  if(m) m.style.display=m.style.display==='none'?'block':'none';
}
function closeAtViewMenu(){
  const m=document.getElementById('at-view-menu');
  if(m)m.style.display='none';
}
function setAtView(view){
  atView=view;
  closeAtViewMenu();
  const isSched=view==='schedule',isMon=view==='month',isCal=view==='calendar';
  document.getElementById('at-sched-wrap').style.display=isSched?'block':'none';
  document.getElementById('at-month-wrap').style.display=isMon?'block':'none';
  document.getElementById('at-cal-wrap').style.display=isCal?'block':'none';
  document.getElementById('at-dtbar').style.display=isSched?'flex':'none';
  ['schedule','month','calendar'].forEach(v=>{
    const el=document.getElementById('atmenu-check-'+v);
    if(el)el.style.opacity=v===view?'1':'0';
  });
  if(isSched){atSetDropdownLabel('Schedule');atRenderTabs();atRenderSchedule();}
  else if(isMon){atSetDropdownLabel('Month');renderAtMonthList();}
  else{atRenderCal();}
}
function atToggleView(){ setAtView('calendar'); }
function atGoToday(){
  atSelDate='2026-03-17';atWeekOff=0;
  setAtView(atView==='calendar'||atView==='month'?atView:'schedule');
  atSelDate='2026-03-17';atWeekOff=0;
  if(atView==='schedule'){atSetDropdownLabel('Schedule');atRenderTabs();atRenderSchedule();}
}
function renderAtMonthList(){
  const c=document.getElementById('at-month-list');if(!c)return;
  const today=new Date(atSelDate+'T00:00:00');
  const allEntries=[];
  Object.keys(AT_DATA).sort().forEach(dstr=>{
    const d=new Date(dstr+'T00:00:00');
    if(d<today) return;
    AT_DATA[dstr].forEach(ev=>{allEntries.push({dstr,ev});});
  });
  if(!allEntries.length){
    c.innerHTML=`<div style="padding:48px 24px;text-align:center;"><div style="font-size:40px;margin-bottom:12px;">\ud83c\udfc6</div><div style="font-size:16px;font-weight:600;color:#2d2d2d;margin-bottom:6px;">No upcoming athletic events</div></div>`;
    return;
  }
  let h='';let lastMonth='';
  allEntries.forEach(({dstr,ev})=>{
    const d=new Date(dstr+'T00:00:00');
    const monthKey=MON_L[d.getMonth()]+' '+d.getFullYear();
    const monAbbr=MON_L[d.getMonth()].slice(0,3);
    const dayNum=d.getDate();
    if(monthKey!==lastMonth){
      h+=`<div style="padding:14px 16px 6px;font-size:13px;font-weight:600;color:#747474;text-transform:uppercase;letter-spacing:.05em;background:#f8f8f8;border-bottom:1px solid #e1e1e1;">${monthKey}</div>`;
      lastMonth=monthKey;
    }
    const dateTile=`<div class="ev-date-tile"><span class="ev-date-tile-mon">${monAbbr}</span><span class="ev-date-tile-day">${dayNum}</span></div>`;
    const _attype=ev.type==='game'?'game':ev.type==='tournament'?'tournament':'track-field';
    const PAW=`<svg width="20" height="20" viewBox="0 0 36 36" fill="#e05c1a"><ellipse cx="10" cy="8" rx="4" ry="5"/><ellipse cx="26" cy="8" rx="4" ry="5"/><ellipse cx="4" cy="18" rx="3.5" ry="4.5"/><ellipse cx="32" cy="18" rx="3.5" ry="4.5"/><path d="M18 14c-6 0-11 4-11 10 0 4 2.5 7 5 8.5 1.5.9 3.5 1.5 6 1.5s4.5-.6 6-1.5c2.5-1.5 5-4.5 5-8.5 0-6-5-10-11-10z"/></svg>`;
    const liveDot=`<span style="width:6px;height:6px;border-radius:50%;background:#CC314B;display:inline-block;flex-shrink:0;"></span>`;
    const statusHtml=ev.status==='LIVE'
      ?`<span style="display:flex;align-items:center;gap:4px;font-size:12px;color:#CC314B;font-weight:600;">${liveDot}LIVE</span>`
      :`<span style="font-size:12px;color:#646464;">${ev.status}</span>`;
    let bodyHtml='';
    if(ev.type==='game'){
      bodyHtml=`
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <div style="display:flex;align-items:center;gap:8px;flex:1;">${PAW}<span style="font-size:16px;font-weight:600;color:#2d2d2d;">${ev.home}</span></div>
          <span style="font-size:16px;font-weight:600;color:#2d2d2d;">${ev.homeScore}</span>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <div style="display:flex;align-items:center;gap:8px;flex:1;">${PAW}<span style="font-size:16px;font-weight:600;color:#2d2d2d;">${ev.away}</span></div>
          <span style="font-size:16px;font-weight:600;color:#2d2d2d;">${ev.awayScore}</span>
        </div>`;
    }else if(ev.type==='series'){
      bodyHtml=`
        <div style="display:flex;align-items:center;gap:8px;">${PAW}<span style="font-size:16px;font-weight:600;color:#2d2d2d;">${ev.home}</span></div>
        <div style="display:flex;align-items:center;gap:8px;">${PAW}<span style="font-size:16px;font-weight:600;color:#2d2d2d;">${ev.away}</span></div>
        <div style="font-size:15px;color:#646464;line-height:1.45;">${ev.desc}</div>`;
    }else{
      bodyHtml=`
        <div style="font-size:16px;font-weight:600;color:#2d2d2d;">${ev.title}</div>
        <div style="font-size:15px;color:#646464;line-height:1.45;">${ev.desc}</div>`;
    }
    const addrSvg=`<svg width="11" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
    h+=`<div class="ev-card" data-org="${ev.org}" data-type="${_attype}">
      <div class="ev-card-hdr">
        <div class="ev-card-r1" style="align-items:flex-start;">
          ${dateTile}
          <div style="flex:1;min-width:0;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px;">
              <span class="ev-time">${ev.time}</span>
              <span style="flex:1;text-align:right;">${statusHtml}</span>
              <span class="ev-keb">\u00b7\u00b7\u00b7</span>
            </div>
            <div class="ev-card-org">${ev.org}</div>
          </div>
        </div>
      </div>
      <div class="ev-card-body" style="display:flex;flex-direction:column;gap:10px;padding-left:52px;">
        ${bodyHtml}
        <div class="ev-addr">${addrSvg}${ev.addr}</div>
      </div>
      <div class="ev-actions"><button class="ev-btn-share">SHARE</button><button class="ev-btn-add">ADD TO CALENDAR</button></div>
    </div>`;
  });
  c.innerHTML=h;
  applyAtFilter();
}
function atRenderCal(){
  const c=document.getElementById('at-cal-wrap');
  const DOW=['MON','TUE','WED','THU','FRI','SAT','SUN'];
  let h='<div style="padding-top:8px;">';
  [[2026,2],[2026,3],[2026,4]].forEach(([y,m])=>{
    h+=`<div class="cal-month" data-year="${y}"><div class="cal-month-title">${MON_L[m]} ${y}</div><div class="cal-grid">`;
    DOW.forEach(d=>h+=`<div class="cal-dow">${d}</div>`);
    const first=new Date(y,m,1),off=(first.getDay()+6)%7;
    for(let i=0;i<off;i++)h+=`<div class="cal-cell"></div>`;
    const days=new Date(y,m+1,0).getDate();
    for(let day=1;day<=days;day++){
      const dstr=y+'-'+String(m+1).padStart(2,'0')+'-'+String(day).padStart(2,'0');
      let cls='cal-cell';if(dstr===atSelDate)cls+=' sel';
      h+=`<div class="${cls}" onclick="atPickDayFromCal('${dstr}')"><div class="cal-num">${day}</div>${atHasEv(dstr)?'<div class="cal-ev-dot"></div>':''}</div>`;
    }
    h+=`</div></div>`;
  });
  c.innerHTML=h+'</div>';
  atSetDropdownLabel('2026');
  c.onscroll=function(){
    const months=c.querySelectorAll('.cal-month[data-year]');
    for(const m of months){if(m.getBoundingClientRect().bottom>c.getBoundingClientRect().top+20){atSetDropdownLabel(m.dataset.year);break;}}
  };
}
function atPickDayFromCal(dstr){
  atSelDate=dstr;
  const t=new Date(2026,2,17),ts=new Date(t);ts.setDate(t.getDate()-t.getDay());
  const d=new Date(dstr+'T00:00:00'),ds2=new Date(d);ds2.setDate(d.getDate()-d.getDay());
  atWeekOff=Math.round((ds2-ts)/(7*86400000));
  setAtView('schedule');
}
function initAt(){
  atWeekOff=0;
  const amw = document.getElementById('at-month-wrap');
  if(amw) amw.style.display='none';
  setAtView('schedule');
}

// ─── Stubs for M2 functions referenced in HTML ───
function m2ToggleSectionFav(k) { /* no-op in split version */ }
function syncSectionStars() { /* no-op in split version */ }

// ─── About Us school selector ───
function selectSchoolAbout(s) {
  document.querySelectorAll('#about-selector .school-pill').forEach(p => p.classList.toggle('active', p.dataset.s===s));
  ['district','lincoln','washington'].forEach(id => { document.getElementById('about-'+id).style.display=id===s?'block':'none'; });
}

// ─── Forms school tab ───
function selectSchoolForms(s) {
  document.querySelectorAll('#forms-selector .school-pill').forEach(p => p.classList.toggle('active', p.dataset.s===s));
  ['district','lincoln','washington'].forEach(id => { document.getElementById('forms-'+id).style.display=id===s?'block':'none'; });
}

// ─── Restore filter badges on load ───
function restoreFilterBadges() {
  Object.keys(fsApplied).forEach(section => updateFilterBadge(section));
}
