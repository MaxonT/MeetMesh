// core.js (cloud)
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const pad2=n=>String(n).padStart(2,'0'); const parseTime=t=>{const[a,b]=t.split(':').map(Number);return a*60+b};
const minutesToLabel=m=>{const h=Math.floor(m/60),mm=m%60,amp=h>=12?'PM':'AM',hh=((h+11)%12)+1;return `${hh}:${pad2(mm)} ${amp}`};
const API_BASE=import.meta.env.VITE_API_BASE||'http://localhost:8080'; document.querySelector('#apiBase').textContent=API_BASE;

const now=new Date(), end=new Date(); end.setDate(now.getDate()+3);
document.querySelector('#start').value=now.toISOString().slice(0,10);
document.querySelector('#end').value=end.toISOString().slice(0,10);
document.querySelector('#title').value='Team sync'; document.querySelector('#name').value='Tiger';
document.querySelector('#tz').value=Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC';

let poll=null, pollId=null, painting=null;

function getDays(a,b){const days=[],A=new Date(a+'T00:00:00'),B=new Date(b+'T00:00:00'); for(let d=new Date(A); d<=B; d.setDate(d.getDate()+1)) days.push(new Date(d)); return days;}
function buildGrid(){
  const grid=$('#grid'); grid.innerHTML='';
  const days=getDays(poll.meta.startISO,poll.meta.endISO);
  const slots=Math.floor((poll.meta.hEnd-poll.meta.hStart)/poll.meta.slot);
  const thead=document.createElement('thead'); const hr=document.createElement('tr');
  const th0=document.createElement('th'); th0.className='th-time th-day'; th0.textContent='Time'; hr.appendChild(th0);
  days.forEach(d=>{const th=document.createElement('th'); th.className='th-day'; th.textContent=d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'}); hr.appendChild(th)});
  thead.appendChild(hr); grid.appendChild(thead);
  const tb=document.createElement('tbody');
  for(let s=0;s<slots;s++){ const tr=document.createElement('tr'); const time=poll.meta.hStart+s*poll.meta.slot;
    const th=document.createElement('th'); th.className='th-time'; th.textContent=minutesToLabel(time); tr.appendChild(th);
    for(let d=0; d<days.length; d++){ const td=document.createElement('td'); td.className='cell'; td.dataset.key=`${d}-${s}`;
      td.addEventListener('mousedown',()=>startPaint(td)); td.addEventListener('mouseenter',()=>movePaint(td)); td.addEventListener('mouseup',endPaint);
      tr.appendChild(td);
    } tb.appendChild(tr);
  } grid.appendChild(tb);
}
function startPaint(td){ if(!poll)return; painting=td.classList.contains('mine')?'remove':'add'; applyMine(td.dataset.key,painting==='add'); }
function movePaint(td){ if(!painting)return; applyMine(td.dataset.key,painting==='add'); }
function endPaint(){ painting=null; }
function applyMine(k,on){ const c=document.querySelector(`td.cell[data-key="${k}"]`); if(!c)return; c.classList.toggle('mine',on); c.dataset.mine=on?'1':'0'; }
function mineKeys(){ return $$('.cell.mine').map(c=>c.dataset.key); }

async function createPoll(){
  const body={ title:$('#title').value||'Untitled', tz:$('#tz').value||'UTC', slot:parseInt($('#slot').value,10),
    startISO:$('#start').value, endISO:$('#end').value, hStart:parseTime($('#hs').value), hEnd:parseTime($('#he').value) };
  const r=await fetch(`${API_BASE}/api/polls`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  if(!r.ok){alert('Create failed');return;} poll=await r.json(); pollId=poll.id; $('#pollId').textContent=pollId; buildGrid(); await refreshAggregate();
}
async function loadPoll(){
  const id=prompt('Poll ID to load:',pollId||''); if(!id)return; const r=await fetch(`${API_BASE}/api/polls/${id}`); if(!r.ok){alert('Not found');return;}
  poll=await r.json(); pollId=poll.id; $('#pollId').textContent=pollId;
  $('#title').value=poll.meta.title; $('#slot').value=String(poll.meta.slot); $('#start').value=poll.meta.startISO; $('#end').value=poll.meta.endISO;
  $('#hs').value=`${pad2(Math.floor(poll.meta.hStart/60))}:${pad2(poll.meta.hStart%60)}`; $('#he').value=`${pad2(Math.floor(poll.meta.hEnd/60))}:${pad2(poll.meta.hEnd%60)}`; $('#tz').value=poll.meta.tz;
  buildGrid(); await refreshAggregate();
}
async function saveCloud(){
  if(!pollId){alert('Create or load a poll first');return;} const name=$('#name').value||'Me'; const cells=mineKeys();
  const r=await fetch(`${API_BASE}/api/polls/${pollId}/availability`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,cells})});
  if(!r.ok){alert('Save failed');return;} await refreshAggregate(); alert('Saved to cloud.');
}
async function refreshAggregate(){
  if(!pollId)return; const r=await fetch(`${API_BASE}/api/polls/${pollId}/aggregate`); if(!r.ok)return; const {counts}=await r.json();
  $$('.cell').forEach(c=>c.dataset.level='0'); Object.entries(counts).forEach(([k,v])=>{ const c=document.querySelector(`td.cell[data-key="${k}"]`); if(c) c.dataset.level=String(Math.min(v,4)); });
  const list=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,5); const sug=$('#suggest'); sug.innerHTML=''; if(list.length===0){sug.textContent='No data yet.'; return;}
  for(const [key,score] of list){ const [dIdx,sIdx]=key.split('-').map(Number); const start=new Date(poll.meta.startISO+'T00:00:00'); start.setDate(start.getDate()+dIdx);
    const tStart=poll.meta.hStart+sIdx*poll.meta.slot, tEnd=tStart+poll.meta.slot; const labelDate=start.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
    const labelTime=minutesToLabel(tStart)+' - '+minutesToLabel(tEnd); const div=document.createElement('div'); div.textContent=`${labelDate} · ${labelTime} — ${score} people`; sug.appendChild(div); }
}
function copyLink(){ if(!pollId){alert('Create or load a poll first');return;} const url=`${location.origin}/?poll=${encodeURIComponent(pollId)}`; navigator.clipboard.writeText(url).then(()=>alert('Share URL copied!'),()=>prompt('Copy URL:',url)); }
function importLocal(){ const code=$('#importCode').value.trim(); if(!code)return; try{ const json=decodeURIComponent(escape(atob(code))); const data=JSON.parse(json);
  $('#title').value=data.poll.title||''; $('#slot').value=String(data.poll.slot); $('#start').value=data.poll.startISO; $('#end').value=data.poll.endISO;
  $('#hs').value=`${pad2(Math.floor(data.poll.hStart/60))}:${pad2(data.poll.hStart%60)}`; $('#he').value=`${pad2(Math.floor(data.poll.hEnd/60))}:${pad2(data.poll.hEnd%60)}`; }catch(e){ alert('Invalid code'); } }
const $id=s=>document.getElementById(s);
$id('createPoll').addEventListener('click', createPoll); $id('saveCloud').addEventListener('click', saveCloud); $id('loadCloud').addEventListener('click', loadPoll); $id('copyLink').addEventListener('click', copyLink); $id('btnImport').addEventListener('click', importLocal);
// URL auto-load
const params=new URLSearchParams(location.search); const pid=params.get('poll'); if(pid){ (async()=>{ const r=await fetch(`${API_BASE}/api/polls/${pid}`); if(r.ok){ poll=await r.json(); pollId=poll.id; document.querySelector('#pollId').textContent=pollId; buildGrid(); await refreshAggregate(); } })(); }
