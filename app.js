const KEY="schoolHelper_v1";
const defaultState={
  profile:{name:"Ученик",className:"10А"},
  homework:[
    {id:1,subject:"Математика",text:"№532, 534",date:"2026-08-15",done:false},
    {id:2,subject:"Русский язык",text:"Упражнение 201",date:"2026-08-16",done:false},
    {id:3,subject:"История",text:"Параграф 12, вопросы",date:"2026-08-17",done:false}
  ],
  grades:{
    "Математика":[5,4,4,3,4,5],
    "Русский язык":[4,4,3,4,5],
    "История":[5,5,4,4,5],
    "Физика":[4,3,4,4]
  },
  settings:{theme:"dark",accent:"#8057e8",notifications:true,sound:true,apiKey:"",geminiModel:"gemini-2.5-flash"}
};
let state=load();
let route="home";

function load(){try{return {...defaultState,...JSON.parse(localStorage.getItem(KEY))}}catch{return structuredClone(defaultState)}}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function avg(a){return a.length?a.reduce((x,y)=>x+y,0)/a.length:0}
function quarterGrade(x){return Math.floor(x+0.5)}
function fmtDate(d){return new Intl.DateTimeFormat("ru-RU",{day:"numeric",month:"short"}).format(new Date(d+"T00:00:00"))}
function esc(s=""){return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function setRoute(r){route=r; render()}
function render(){
  applySettings();
  document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x.dataset.route===route));
  const views={home:homeView,homework:homeworkView,grades:gradesView,goals:goalsView,settings:settingsView};
  document.getElementById("screen").innerHTML=views[route]();
  bind();
}
function applySettings(){
  document.documentElement.style.setProperty("--accent",state.settings.accent);
  const light=state.settings.theme==="light";
  if(light){
    document.documentElement.style.setProperty("--bg","#f4f3f8");
    document.documentElement.style.setProperty("--panel","#fff");
    document.documentElement.style.setProperty("--panel2","#faf9fd");
    document.documentElement.style.setProperty("--text","#171625");
    document.documentElement.style.setProperty("--muted","#747381");
  }else{
    document.documentElement.style.setProperty("--bg","#0e1020");
    document.documentElement.style.setProperty("--panel","#171a2d");
    document.documentElement.style.setProperty("--panel2","#1d2036");
    document.documentElement.style.setProperty("--text","#f6f5fb");
    document.documentElement.style.setProperty("--muted","#9b9caf");
  }
}
function homeView(){
  const upcoming=state.homework.filter(x=>!x.done).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,3);
  const subjects=Object.entries(state.grades);
  return `<section class="hero"><h1>Привет, ${esc(state.profile.name)} 👋</h1><p>Учёба сегодня — успех завтра. Всё важное в одном месте.</p></section>
  <div class="section-head"><h2>Ближайшие задания</h2><button class="link" data-action="addHomework">+ Добавить</button></div>
  ${upcoming.length?upcoming.map(homeworkCard).join(""):`<div class="card empty"><b>Заданий пока нет</b>Добавь домашку, чтобы ничего не забыть.</div>`}
  <div class="section-head"><h2>Средние баллы</h2><button class="link" data-route2="grades">Все оценки →</button></div>
  <div class="card">${subjects.slice(0,4).map(([s,g])=>{let a=avg(g);return `<div style="margin-bottom:15px"><div class="row"><span>${esc(s)}</span><b>${a.toFixed(2)}</b></div><div class="progress"><i style="width:${Math.min(a/5*100,100)}%"></i></div></div>`}).join("")}</div>
  <div class="section-head"><h2>Расписание с фото</h2></div>
  <div class="card"><div class="photo-box"><div style="font-size:28px;margin-bottom:8px">📷</div><b>Распознать расписание</b><p class="small muted">Укажи класс в настройках, выбери фото — Gemini найдёт нужную колонку.</p><label class="primary" style="margin-top:10px;padding:11px">Выбрать фото<input id="schedulePhoto" type="file" accept="image/*"></label></div><div id="scheduleResult" style="margin-top:10px"></div></div>
  <div class="stat-grid"><div class="stat"><b>${state.homework.filter(x=>x.done).length}</b><span>выполнено ДЗ</span></div><div class="stat"><b>${subjects.length}</b><span>предметов</span></div></div>`;
}
function homeworkCard(x){
 return `<div class="card"><div class="item"><div class="subject-icon">▤</div><div class="item-main"><strong>${esc(x.subject)}</strong><span>${esc(x.text)}</span></div><span class="date">${fmtDate(x.date)}</span><button class="check ${x.done?"done":""}" data-action="toggleHomework" data-id="${x.id}" aria-label="Готово"></button></div></div>`;
}
function homeworkView(){
 return `<div class="section-head"><h1 style="font-size:25px;margin:0">Домашние задания</h1><button class="icon-btn" data-action="addHomework">＋</button></div>
 <div class="tabs"><button class="tab active">Все</button><button class="tab">Сегодня</button><button class="tab">Ближайшие</button></div>
 ${state.homework.sort((a,b)=>a.date.localeCompare(b.date)).map(homeworkCard).join("") || `<div class="empty">Нет заданий</div>`}
 <button class="primary" data-action="addHomework">＋ Добавить задание</button>`;
}
function gradesView(){
 const entries=Object.entries(state.grades);
 return `<div class="section-head"><h1 style="font-size:25px;margin:0">Оценки</h1><button class="icon-btn" data-action="addGrade">＋</button></div>
 <div class="tabs">${entries.map(([s])=>`<button class="tab">${esc(s)}</button>`).join("")}</div>
 ${entries.map(([s,g])=>{const a=avg(g),q=quarterGrade(a);return `<div class="card"><div class="row"><div><b>${esc(s)}</b><div class="small muted">Итог за четверть: <strong>${q}</strong></div></div><button class="icon-btn" data-action="addGrade" data-subject="${esc(s)}">＋</button></div><div class="grade-row">${g.map(v=>`<span class="grade g${v}">${v}</span>`).join("")}</div><div class="row"><span class="small muted">Средний балл</span><b>${a.toFixed(2)}</b></div><div class="progress"><i style="width:${a/5*100}%"></i></div></div>`}).join("")}`;
}
function goalsView(){
 const subjects=Object.keys(state.grades); const s=subjects[0]||"Математика"; const g=state.grades[s]||[]; const a=avg(g);
 return `<div class="section-head"><h1 style="font-size:25px;margin:0">Цель на четверть</h1></div>
 <div class="card"><h2 style="margin-top:0">Какую оценку хочешь получить?</h2><div class="theme-row" style="grid-template-columns:1fr 1fr"><button class="theme-btn selected" id="goal4">4</button><button class="theme-btn" id="goal5">5</button></div>
 <div class="field" style="margin-top:15px"><label>Предмет</label><select id="goalSubject">${subjects.map(x=>`<option>${esc(x)}</option>`).join("")}</select></div><div id="goalResult" style="margin-top:14px">${goalResult(s,4)}</div></div>`;
}
function goalResult(subject,target){
 const g=state.grades[subject]||[]; const a=avg(g);
 if(!g.length)return `<div class="notice">Добавь оценки по предмету — тогда я рассчитаю цель.</div>`;
 if(quarterGrade(a)>=target)return `<div class="notice success"><b>Уже получается ${quarterGrade(a)}!</b><br>Средний балл ${a.toFixed(2)} → по твоему правилу это ${quarterGrade(a)}.</div>`;
 let best=null;
 for(let n=1;n<=20;n++){
   const needed=target===5?5:4;
   const na=(g.reduce((x,y)=>x+y,0)+n*needed)/(g.length+n);
   if(quarterGrade(na)>=target){best={n,needed,na};break}
 }
 return best?`<div class="notice success"><b>Нужно ещё ${best.n} оцен${best.n===1?"ку":"ки"} ${best.needed}.</b><br>Тогда средний будет ≈ ${best.na.toFixed(2)} → итог ${target}.</div>`:`<div class="notice">При добавлении максимальных оценок цель пока не достигается.</div>`;
}
function settingsView(){
 const s=state.settings;
 return `<div class="section-head"><h1 style="font-size:25px;margin:0">Настройки</h1></div>
 <div class="card"><h3 style="margin-top:0">Профиль</h3><div class="form"><div class="field"><label>Имя</label><input id="profileName" value="${esc(state.profile.name)}"></div><div class="field"><label>Класс</label><input id="profileClass" value="${esc(state.profile.className)}" placeholder="Например, 10А"></div><button class="primary" data-action="saveProfile">Сохранить</button></div></div>
 <div class="card"><h3 style="margin-top:0">Внешний вид</h3><div class="theme-row">${["light","dark","system"].map(t=>`<button class="theme-btn ${s.theme===t?"selected":""}" data-theme="${t}">${t==="light"?"☀ Светлая":t==="dark"?"☾ Тёмная":"◐ Авто"}</button>`).join("")}</div><p class="small muted">Цвет акцента</p><div class="color-row">${["#8057e8","#2878e5","#24ad80","#e8a32e","#e65d62"].map(c=>`<button class="color ${s.accent===c?"selected":""}" style="background:${c}" data-color="${c}"></button>`).join("")}</div></div>
 <div class="card"><h3 style="margin-top:0">Распознавание расписания</h3><div class="notice">Класс <b>${esc(state.profile.className)}</b> автоматически подставляется в запрос. Если поменяешь класс выше, промпт тоже изменится.</div><div class="field" style="margin-top:12px"><label>Gemini API ключ</label><input id="apiKey" type="password" value="${esc(s.apiKey)}" placeholder="Вставь свой API key"></div><div class="field" style="margin-top:12px"><label>Модель Gemini</label><input id="geminiModel" value="${esc(s.geminiModel)}" placeholder="gemini-2.5-flash"></div><button class="primary" data-action="saveApi">Сохранить ключ</button><p class="small muted">Ключ хранится только в localStorage на этом устройстве. Для GitHub Pages общий ключ в код не зашивается. Важно: ключ в браузере всё равно технически можно извлечь из устройства/запроса, поэтому для публичного коммерческого приложения лучше использовать серверный proxy.</p></div>
 <div class="card"><h3 style="margin-top:0">Прочее</h3>${settingRow("Уведомления","Напоминать о ближайших заданиях","notifications",s.notifications)}${settingRow("Звуки","Звуки интерфейса","sound",s.sound)}</div>
 <div class="card"><button class="secondary" data-action="reset" style="width:100%">Сбросить все данные</button></div>`;
}
function settingRow(title,sub,key,val){return `<div class="setting"><div><strong>${title}</strong><span>${sub}</span></div><button class="switch ${val?"on":""}" data-toggle="${key}"><i></i></button></div>`}
function bind(){
 document.querySelectorAll("[data-route]").forEach(b=>b.onclick=()=>setRoute(b.dataset.route));
 document.querySelectorAll("[data-route2]").forEach(b=>b.onclick=()=>setRoute(b.dataset.route2));
 document.querySelectorAll("[data-action]").forEach(b=>b.onclick=()=>actions(b.dataset.action,b.dataset));
 document.querySelectorAll("[data-theme]").forEach(b=>b.onclick=()=>{state.settings.theme=b.dataset.theme;save();render()});
 document.querySelectorAll("[data-color]").forEach(b=>b.onclick=()=>{state.settings.accent=b.dataset.color;save();render()});
 document.querySelectorAll("[data-toggle]").forEach(b=>b.onclick=()=>{state.settings[b.dataset.toggle]=!state.settings[b.dataset.toggle];save();render()});
 const photo=document.getElementById("schedulePhoto"); if(photo)photo.onchange=handleSchedule;
 const gs=document.getElementById("goalSubject"); if(gs)gs.onchange=()=>{document.getElementById("goalResult").innerHTML=goalResult(gs.value,document.getElementById("goal5").classList.contains("selected")?5:4)};
 const g4=document.getElementById("goal4"),g5=document.getElementById("goal5"); if(g4&&g5){g4.onclick=()=>{g4.classList.add("selected");g5.classList.remove("selected");document.getElementById("goalResult").innerHTML=goalResult(gs.value,4)};g5.onclick=()=>{g5.classList.add("selected");g4.classList.remove("selected");document.getElementById("goalResult").innerHTML=goalResult(gs.value,5)}}
}
function actions(a,d){
 if(a==="toggleHomework"){const x=state.homework.find(x=>x.id==d.id);if(x)x.done=!x.done;save();render()}
 if(a==="addHomework")openHomeworkModal();
 if(a==="addGrade")openGradeModal(d.subject||"");
 if(a==="saveProfile"){state.profile.name=document.getElementById("profileName").value||"Ученик";state.profile.className=document.getElementById("profileClass").value||"10А";save();render()}
 if(a==="saveApi"){state.settings.apiKey=document.getElementById("apiKey").value.trim();state.settings.geminiModel=document.getElementById("geminiModel").value.trim()||"gemini-2.5-flash";save();alert("Настройки Gemini сохранены на этом устройстве.");render()}
 if(a==="reset"&&confirm("Удалить все данные приложения?")){localStorage.removeItem(KEY);state=load();render()}
}
function modal(html){document.getElementById("modalRoot").innerHTML=`<div class="modal-backdrop" id="backdrop"><div class="modal">${html}</div></div>`;document.getElementById("backdrop").onclick=e=>{if(e.target.id==="backdrop")closeModal()}}
function closeModal(){document.getElementById("modalRoot").innerHTML=""}
function openHomeworkModal(){
 modal(`<div class="modal-head"><h3>Новое домашнее задание</h3><button class="close" onclick="closeModal()">×</button></div><div class="form"><div class="field"><label>Предмет</label><input id="hSubject" placeholder="Математика"></div><div class="field"><label>Задание</label><textarea id="hText" placeholder="Например: №532, 534"></textarea></div><div class="field"><label>Дата сдачи</label><input id="hDate" type="date" value="${new Date().toISOString().slice(0,10)}"></div><button class="primary" id="saveH">Добавить</button></div>`);
 document.getElementById("saveH").onclick=()=>{const s=document.getElementById("hSubject").value.trim(),t=document.getElementById("hText").value.trim(),d=document.getElementById("hDate").value;if(!s||!t||!d)return alert("Заполни предмет, задание и дату.");state.homework.push({id:Date.now(),subject:s,text:t,date:d,done:false});save();closeModal();render()}
}
function openGradeModal(subject=""){
 modal(`<div class="modal-head"><h3>Добавить оценку</h3><button class="close" onclick="closeModal()">×</button></div><div class="form"><div class="field"><label>Предмет</label><input id="gSubject" value="${esc(subject)}" placeholder="Математика"></div><div class="field"><label>Оценка</label><select id="gValue"><option>5</option><option>4</option><option>3</option><option>2</option></select></div><button class="primary" id="saveG">Добавить оценку</button></div>`);
 document.getElementById("saveG").onclick=()=>{const s=document.getElementById("gSubject").value.trim(),v=Number(document.getElementById("gValue").value);if(!s)return alert("Укажи предмет.");state.grades[s]??=[];state.grades[s].push(v);save();closeModal();render()}
}
async function handleSchedule(e){
 const file=e.target.files?.[0]; if(!file)return;
 const out=document.getElementById("scheduleResult");
 if(!state.settings.apiKey){out.innerHTML=`<div class="notice danger">Сначала добавь Gemini API ключ в Настройках.</div>`;return}
 out.innerHTML=`<div class="notice">⏳ Распознаю расписание для класса <b>${esc(state.profile.className)}</b>…</div>`;
 try{
   const base64=await fileToBase64(file);
   const prompt=`Ты — парсер школьного расписания. На изображении находится таблица расписания разных классов. Найди именно колонку класса "${state.profile.className}". Игнорируй название класса. Выпиши уроки этой колонки строго сверху вниз, в порядке уроков. Верни только JSON-массив строк, например ["Математика","Русский язык","История"]. Если ячейка пустая, пропусти её. Не добавляй номера уроков, комментарии или markdown.`;
   const url=`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(state.settings.geminiModel)}:generateContent?key=${encodeURIComponent(state.settings.apiKey)}`;
   const body={contents:[{parts:[{text:prompt},{inlineData:{mimeType:file.type||"image/jpeg",data:base64.split(",")[1]}}]}],generationConfig:{temperature:0.1,responseMimeType:"application/json"}};
   const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
   const data=await r.json(); if(!r.ok)throw new Error(data.error?.message||"Ошибка Gemini API");
   const raw=data.candidates?.[0]?.content?.parts?.map(x=>x.text||"").join("")||"[]";
   let arr; try{arr=JSON.parse(raw)}catch{arr=raw.replace(/```json|```/g,"").trim().split(/\n+/).filter(Boolean)}
   out.innerHTML=`<div class="notice success"><b>Расписание для ${esc(state.profile.className)}</b></div><div class="result-list" style="margin-top:8px">${(Array.isArray(arr)?arr:[]).map((x,i)=>`<div class="result-line"><b>${i+1}.</b> ${esc(String(x))}</div>`).join("")||`<div class="notice">Не удалось получить список уроков.</div>`}</div>`;
 }catch(err){out.innerHTML=`<div class="notice danger"><b>Не удалось распознать.</b><br>${esc(err.message)}</div>`}
}
function fileToBase64(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file)})}
render();
