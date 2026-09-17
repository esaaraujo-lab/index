/* ═══════════════════════════════════════════════════════════════
   gdi-extras.js v2.6-fix — COMPLETO
   ★FIX PRINCIPAL (o travamento de verdade): o M20 tinha um
     MutationObserver observando a própria lista que ele reescrevia.
     Quando o render demorava >150ms (playlists grandes), o observer
     se auto-disparava INFINITAMENTE: render → mutação → observer →
     render → … A main thread ficava presa para sempre — por isso o
     "Aguardar ou fechar" do Chrome nunca resolvia. O observer foi
     REMOVIDO; a playlist agora re-renderiza só via Bus.
   Outras correções: teto de 600 itens + 1 listener delegado (M20),
     listeners globais fora do init (M10/M6), observer do M14
     desconectado ao trocar de página, M9 não reconstrói na mesma
     aula, M7 só toca no DOM quando muda, M22 limita cursos.
   ═══════════════════════════════════════════════════════════════ */
console.log('[GDI Extras Modular] v2.6-fix carregado');
const GDI_ROOT=()=>document.documentElement; // UI flutuante vive aqui (fora do body)

window.GDI_MODULES = window.GDI_MODULES || [];

// ── CSS dos módulos (injetado 1×) ──
(function(){if(document.getElementById('gdi-extras-style'))return;const s=document.createElement('style');s.id='gdi-extras-style';s.textContent=`
.gdi-debug-wrap{width:100%;background:#0d1117;border-top:2px solid #f0883e;font-family:monospace;font-size:12px;}
.gdi-debug-head{display:flex;align-items:center;justify-content:space-between;padding:8px 14px;background:#161b22;cursor:pointer;user-select:none;color:#8b949e;}
.gdi-debug-head:hover{background:#1c2128;}
.gdi-debug-head strong{color:#f0f6fc;display:flex;align-items:center;gap:6px;}
.gdi-dbg-count{background:#1f6feb;color:#fff;border-radius:10px;padding:1px 7px;font-size:11px;margin-left:4px;}
.gdi-debug-actions{display:flex;gap:8px;}
.gdi-debug-actions button{background:none;border:1px solid #30363d;color:#8b949e;border-radius:4px;padding:2px 9px;cursor:pointer;font-size:11px;}
.gdi-debug-actions button:hover{background:#1c2128;color:#f0f6fc;}
#gdi-debug-log{max-height:300px;overflow-y:auto;padding:10px 14px;background:#0d1117;color:#e6edf3;}
#gdi-debug-log.collapsed{display:none;}
.gdi-dbg-entry{padding:3px 0;border-bottom:1px solid #21262d;line-height:1.6;}
.gdi-dbg-ts{color:#484f58;margin-right:6px;}
.gdi-dbg-badge{font-weight:bold;margin-right:6px;}
.gdi-dbg-msg{color:#e6edf3;}
.gdi-dbg-pre{margin:2px 0 2px 20px;padding:4px 8px;background:#161b22;border-left:2px solid #30363d;white-space:pre-wrap;word-break:break-all;color:#8b949e;font-size:11px;}
.gdi-dbg-empty{color:#484f58;}
.gdi-mat-head{display:flex;align-items:center;justify-content:space-between;font-size:14px;color:#e6edf3;}
.gdi-mat-head strong{display:flex;align-items:center;gap:6px;}
#gdi-mat-status{font-size:11px;color:#8b949e;}
.gdi-mat-tabs{display:flex;flex-wrap:wrap;gap:6px;}
.gdi-mat-tab{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;
  min-width:74px;padding:7px 8px;border-radius:10px;cursor:pointer;user-select:none;
  background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:#c9d1d9;transition:all .15s;}
.gdi-mat-tab i{font-size:20px;}
.gdi-mat-tab span{font-size:10px;font-weight:600;letter-spacing:.02em;}
.gdi-mat-tab:hover{background:rgba(255,255,255,.13);color:#fff;}
.gdi-mat-tab.active{background:var(--bs-primary,#1f6feb);border-color:var(--bs-primary,#1f6feb);color:#fff;}
.gdi-mat-body{height:calc(100dvh - 250px);min-height:420px;border:1px solid rgba(255,255,255,.12);
  border-radius:12px;overflow:hidden;background:#161b22;position:relative;}
body.gdi-fm .gdi-mat-body{height:calc(100dvh - 180px);min-height:480px;}
.gdi-notes{border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:10px;background:rgba(0,0,0,.18);}
.gdi-notes-head{display:flex;justify-content:space-between;align-items:center;font-size:13px;color:#e6edf3;margin-bottom:6px;flex-wrap:wrap;gap:6px;}
#gdi-note-input{width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:8px;
  color:#e6edf3;padding:8px;font-size:13px;resize:vertical;min-height:44px;}
.gdi-notes-actions{display:flex;align-items:center;gap:8px;margin-top:6px;}
#gdi-note-time{font-size:11px;color:#7aa2ff;font-variant-numeric:tabular-nums;cursor:pointer;}
#gdi-note-save{margin-left:auto;background:var(--bs-primary,#1f6feb);border:0;color:#fff;border-radius:7px;
  padding:5px 12px;font-size:12px;cursor:pointer;}
#gdi-notes-list{margin-top:8px;max-height:200px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;}
.gdi-note{display:flex;gap:8px;align-items:flex-start;background:rgba(255,255,255,.05);border-radius:8px;padding:6px 8px;font-size:12px;}
.gdi-note-time{color:#7aa2ff;cursor:pointer;white-space:nowrap;font-variant-numeric:tabular-nums;font-size:11px;margin-top:2px;}
.gdi-note-text{flex:1;color:#e6edf3;word-break:break-word;}
.gdi-note-del{background:none;border:0;color:#8b949e;cursor:pointer;font-size:13px;padding:0 2px;}
.gdi-note-del:hover{color:#ff6b6b;}
.gdi-notes-empty{color:#8b949e;font-size:12px;text-align:center;padding:6px;}
#gdi-pom-root{opacity:.30;transition:opacity .25s ease;}
#gdi-pom-root:hover{opacity:.95;}
#gdi-sleep-btn{opacity:.8;transition:opacity .25s ease;}
#gdi-sleep-btn:hover{opacity:1;}
#gdi-note-marks{position:relative;height:16px;margin-top:4px;cursor:pointer;display:none;}
.gdi-note-mark{position:absolute;top:3px;width:10px;height:10px;border-radius:50%;background:#7aa2ff;
  border:2px solid #0b0e14;transform:translateX(-50%);transition:transform .12s,background .12s;}
.gdi-note-mark:hover{background:#ffd43b;transform:translateX(-50%) scale(1.35);}
#gdi-progress-line{margin-top:6px;display:flex;align-items:center;gap:8px;font-size:12px;color:#8b949e;flex-wrap:wrap;}
#gdi-home-card{animation:gdi-card-in .3s ease;}
@keyframes gdi-card-in{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
.gdi-player-wrap{position:relative;}
#gdi-skip-intro{position:absolute;right:14px;bottom:64px;z-index:20;background:rgba(13,15,20,.92);
  border:1px solid rgba(255,255,255,.4);color:#fff;border-radius:8px;padding:8px 14px;font-size:13px;
  cursor:pointer;display:none;box-shadow:0 6px 20px rgba(0,0,0,.5);}
#gdi-skip-intro:hover{background:rgba(45,50,62,.95);}
.gdi-modprog{margin-left:8px;font-size:11px;color:#8b949e;background:rgba(255,255,255,.06);
  border-radius:6px;padding:2px 8px;white-space:nowrap;}
.gdi-modprog b{color:#8ab4ff;font-weight:600;}
.gdi-pdf-controls{display:flex;align-items:center;gap:10px;padding:8px 16px;border-bottom:1px solid rgba(255,255,255,.12);flex-wrap:wrap;}
/* ★FIX: playlist por classes (igual ao core) — sem estilo inline por item */
.gdi-playlist-item{padding:8px 12px;margin:3px 0;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;font-size:13px;background:rgba(255,255,255,0.05);color:var(--gdi-text,#e6edf3);transition:background .15s;}
.gdi-playlist-item:hover{background:rgba(255,255,255,0.12);}
.gdi-playlist-item>div:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:80%;}
.gdi-playlist-item.cur{background:var(--bs-primary,#1f6feb);color:#fff;}
.gdi-playlist-item.watched{opacity:.75;}
.gdi-playlist-item.watched .bi-check-circle-fill{color:#3fb950;}
.gdi-pl-size{font-size:11px;opacity:.8;white-space:nowrap;}
#gdi-pom-root{position:fixed;bottom:76px;right:16px;z-index:10000;font-family:inherit;}
#gdi-pom-fab{position:relative;width:50px;height:50px;border-radius:50%;cursor:pointer;
  background:conic-gradient(var(--pom-c,#1f6feb) calc(var(--pom-p,0)*1%),rgba(255,255,255,.09) 0);
  display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(0,0,0,.5);
  transition:transform .18s;user-select:none;-webkit-tap-highlight-color:transparent;}
#gdi-pom-fab:hover{transform:scale(1.08);}
#gdi-pom-fab::after{content:'';position:absolute;inset:3px;border-radius:50%;
  background:rgba(14,15,22,.97);border:1px solid rgba(255,255,255,.12);}
#gdi-pom-fab>span{position:relative;z-index:1;font-size:22px;}
@keyframes gdi-pom-pulse{0%,100%{box-shadow:0 6px 20px rgba(0,0,0,.5);}
  50%{box-shadow:0 0 0 10px rgba(255,90,90,.22),0 6px 20px rgba(0,0,0,.5);}}
#gdi-pom-fab.warning{animation:gdi-pom-pulse .8s ease-in-out infinite;}
#gdi-pom-panel{position:absolute;bottom:60px;right:0;width:254px;
  background:rgba(15,16,24,.86);-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);
  border:1px solid rgba(255,255,255,.12);border-radius:16px;box-shadow:0 16px 48px rgba(0,0,0,.55);
  padding:16px 16px 12px;transform-origin:bottom right;transform:scale(.85) translateY(10px);
  opacity:0;pointer-events:none;transition:transform .22s cubic-bezier(.34,1.45,.64,1),opacity .18s;}
#gdi-pom-panel.open{transform:scale(1) translateY(0);opacity:1;pointer-events:all;}
.gdi-pom-phase-label{font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;
  margin-bottom:6px;text-align:center;color:#8b949e;}
#gdi-pom-display{font-size:46px;font-weight:800;text-align:center;color:#f0f6fc;
  letter-spacing:.04em;font-variant-numeric:tabular-nums;line-height:1;}
#gdi-pom-progress{height:4px;background:rgba(255,255,255,.1);border-radius:2px;margin:12px 0 10px;overflow:hidden;}
#gdi-pom-progress-bar{height:4px;border-radius:2px;width:100%;transition:width .3s linear,background .4s;}
#gdi-pom-sessions-dots{display:flex;gap:5px;justify-content:center;margin-bottom:10px;}
.gdi-pom-dot{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.14);transition:background .3s,transform .3s;}
.gdi-pom-dot.done{background:#1f6feb;transform:scale(1.15);}
#gdi-pom-btns{display:flex;gap:6px;justify-content:center;margin-bottom:6px;}
.gdi-pom-btn{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.13);color:#e6edf3;
  border-radius:8px;padding:6px 12px;cursor:pointer;font-size:12px;transition:background .15s;white-space:nowrap;}
.gdi-pom-btn:hover{background:rgba(255,255,255,.18);}
#gdi-pom-divider{height:1px;background:rgba(255,255,255,.08);margin:10px 0 8px;}
#gdi-pom-cfg{display:flex;flex-direction:column;gap:6px;}
.gdi-pom-cfg-row,.gdi-pom-switch{display:flex;align-items:center;justify-content:space-between;font-size:11px;color:#8b949e;}
.gdi-pom-switch{cursor:pointer;}
.gdi-pom-switch input{accent-color:#1f6feb;cursor:pointer;}
.gdi-pom-cfg-row input{width:44px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.13);
  border-radius:6px;color:#f0f6fc;text-align:center;padding:2px 4px;font-size:11px;}
#gdi-pom-flash{position:fixed;inset:0;z-index:9999;pointer-events:none;opacity:0;transition:opacity .15s;}
`;document.head.appendChild(s);})();

// ── Loader dos módulos (anti-tempestade) ──
// ★FIX: debounce 80→150ms
(function(){
  let timer=null,lastRun=0;
  function runAll(){
    if(Date.now()-lastRun<100){schedule();return;}
    lastRun=Date.now();
    (window.GDI_MODULES||[]).forEach(m=>{
      try{ if(m&&typeof m.init==='function') m.init(); }
      catch(e){ console.error('[GDI módulo]',m&&m.name,e); }
    });
  }
  function schedule(){clearTimeout(timer);timer=setTimeout(runAll,150);}
  function bindContent(){
    const c=document.getElementById('content');
    if(c&&!c.__gdiModObs){c.__gdiModObs=true;
      new MutationObserver(schedule).observe(c,{childList:true});}
  }
  Bus.onGlobal('page:change',schedule);
  document.addEventListener('DOMContentLoaded',()=>{bindContent();schedule();});
  window.addEventListener('load',()=>{bindContent();schedule();});
  bindContent();
})();

// ═══ M1: SENHAS PROTEGIDAS ═══
(function(){
  const _PWK='gdi-'+(window.location.host||'local');
  function _pwXor(s){let o='';for(let i=0;i<s.length;i++)o+=String.fromCharCode(s.charCodeAt(i)^_PWK.charCodeAt(i%_PWK.length));return o}
  window.gdiSetPw=function(p,v){try{localStorage.setItem('gdi_pw_'+btoa(encodeURIComponent(p)),btoa(encodeURIComponent(_pwXor(String(v)))))}catch(_){}};
  window.gdiGetPw=function(p){try{
    const v=localStorage.getItem('gdi_pw_'+btoa(encodeURIComponent(p)));
    if(v==null)return'';
    return _pwXor(decodeURIComponent(atob(v)));
  }catch(_){return''}};
  try{
    if(localStorage.getItem('gdi_pw_migrated'))return;
    const del=[];
    for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);
      if(k&&k.indexOf('password')===0){const v=localStorage.getItem(k);if(v)gdiSetPw(k.slice(8),v);del.push(k);}}
    del.forEach(k=>localStorage.removeItem(k));
    localStorage.setItem('gdi_pw_migrated','1');
    if(del.length)console.log('[módulo senhas]',del.length,'senhas migradas');
  }catch(_){}
})();

// ═══ M2: AUTENTICAÇÃO (Entrar/Sair) ═══
(function(){
  window.gdiRenderAuth=function(){
    const slot=document.getElementById('gdi-auth-slot');
    if(!slot)return;
    const st=GDIUser.auth();
    if(st==='in'){
      slot.innerHTML='<a class="gdi-nav-btn" href="/logout" title="Sua conta \u2014 clique para sair (o progresso fica salvo nela)" onclick="try{GDIUser.flush()}catch(_){}"><i class="bi bi-person-check"></i><span class="d-none d-md-inline">Sair</span></a>';
    }else if(st==='out'){
      slot.innerHTML='<a class="gdi-nav-btn" href="/login" title="Entrar na sua conta para salvar o progresso"><i class="bi bi-box-arrow-in-right"></i><span class="d-none d-md-inline">Entrar</span></a>';
    }
  };
  window.GDI_MODULES.push({name:'auth',init:function(){window.gdiRenderAuth();}});
  Bus.onGlobal('auth:change',()=>window.gdiRenderAuth());
})();

// ═══ M3: VELOCIDADE DO VÍDEO SALVA ═══
(function(){
  const RKEY='gdi-rate';let applying=false;
  const getR=()=>{const v=parseFloat(localStorage.getItem(RKEY));return(v>=0.25&&v<=4)?v:null};
  document.addEventListener('ratechange',e=>{
    const v=e.target;if(!v||v.tagName!=='VIDEO'||applying)return;
    const r=v.playbackRate;if(r&&r>=0.25&&r<=4)try{localStorage.setItem(RKEY,String(r))}catch(_){}
  },true);
  const apply=v=>{const r=getR();if(!r||Math.abs(v.playbackRate-r)<0.01)return;
    applying=true;try{v.playbackRate=r}catch(_){}applying=false;};
  document.addEventListener('play',e=>{const v=e.target;if(v&&v.tagName==='VIDEO')apply(v)},true);
  document.addEventListener('loadedmetadata',e=>{const v=e.target;if(v&&v.tagName==='VIDEO')apply(v)},true);
})();

// ═══ M4: ATALHOS (N/P, J, ]/[ trechos) ═══
(function(){
  let marksVideo=null;
  Bus.onGlobal('media:ready',({type,el})=>{if(type==='video')marksVideo=el;});
  function notesNow(){try{return GDIUser.getNotes(window.location.pathname)||[]}catch(_){return[]}}
  document.addEventListener('keydown',e=>{
    const t=e.target;
    if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;
    if(e.ctrlKey||e.metaKey||e.altKey)return;
    const k=e.key.toLowerCase();
    if(k==='n'){const b=document.getElementById('gdi-btn-next');if(b&&!b.disabled){e.preventDefault();b.click();}}
    else if(k==='p'){const b=document.getElementById('gdi-btn-prev');if(b&&!b.disabled){e.preventDefault();b.click();}}
    else if(k==='j'){
      const pv=window.playlistVideos;if(!pv||!pv.length)return;
      const start=(typeof window.currentIndex==='number'&&window.currentIndex>=0)?window.currentIndex+1:0;
      for(let i2=start;i2<pv.length;i2++){
        let w=false;try{const raw=(pv[i2].pageUrl||'').split('?')[0];
          w=GDIUser.isWatched(raw)||(window.gdiNormKey&&GDIUser.isWatched(gdiNormKey(raw)));}catch(_){}
        if(!w){e.preventDefault();window.switchVideo(i2);return;}
      }
      showToast('Todas as aulas \u00e0 frente j\u00e1 foram assistidas \u2713');
    }
    else if(e.key===']'||e.key==='['){
      const v=marksVideo;if(!v)return;
      const notes=notesNow().slice().sort((a,b)=>a.t-b.t);if(!notes.length)return;
      const t2=v.currentTime;
      if(e.key===']'){const nx=notes.find(n=>n.t>t2+0.5);
        if(nx){try{v.currentTime=nx.t;v.play().catch(()=>{});}catch(_){}showToast('\u2192 trecho '+gdiFmtTime(nx.t));}}
      else{const pv=[...notes].reverse().find(n=>n.t<t2-1.5);
        if(pv){try{v.currentTime=pv.t;v.play().catch(()=>{});}catch(_){}showToast('\u2190 trecho '+gdiFmtTime(pv.t));}}
    }
  });
})();

// ═══ M5 v3: CRONÔMETRO + AUTO-ASSISTIDO 90% ═══
(function(){
  Bus.onGlobal('media:ready',({type,el})=>{
    if(type!=='video'||!el||el.__m5v3)return;
    el.__m5v3=true;
    const LAST_KEY=()=>window.location.pathname+(window.location.search||'');
    el.addEventListener('timeupdate',()=>{
      const el2=document.getElementById('gdi-note-time');
      if(el2)el2.textContent=gdiFmtTime(el.currentTime);
      if(!el.__autoW&&isFinite(el.duration)&&el.duration>60&&el.currentTime/el.duration>=0.9){
        el.__autoW=true;
        try{
          if(window.gdiMarkVideo)gdiMarkVideo();
          else GDIUser.markWatched(window.location.pathname);
          GDIUser.setLast(LAST_KEY());
        }catch(_){}
        Bus.emit('watched:changed');
      }
    });
    el.addEventListener('loadedmetadata',()=>{
      const el3=document.getElementById('gdi-note-time');
      if(el3)el3.textContent='00:00';
    });
    const nt=document.getElementById('gdi-note-time');
    if(nt&&!nt.__seekB){nt.__seekB=true;
      nt.addEventListener('click',()=>{
        const v=document.querySelector('video');
        if(v&&nt.textContent.includes(':')){
          const pp=nt.textContent.split(':');
          const sec=(parseInt(pp[0],10)||0)*60+(parseInt(pp[1],10)||0);
          try{v.currentTime=sec;v.play().catch(()=>{});}catch(_){}
        }
      });
    }
  });
})();

// ═══ M6: MARCAS + NOTAS + REVISÃO + EXPORT + DUPLO-TOQUE ═══
(function(){
  let mv=null,reviewOn=false;
  const SPAN=20;
  Bus.onGlobal('media:ready',({type,el})=>{
    if(type!=='video'||!el||el.__m6)return;
    el.__m6=true;mv=el;
    el.addEventListener('loadedmetadata',draw);
    el.addEventListener('timeupdate',tick);
  });
  function notesNow(){try{return GDIUser.getNotes(window.location.pathname)||[]}catch(_){return[]}}
  function draw(){
    const bar=document.getElementById('gdi-note-marks');if(!bar)return;
    const dur=(mv&&isFinite(mv.duration))?mv.duration:0;
    const notes=notesNow();
    bar.innerHTML='';
    if(!dur||!notes.length){bar.style.display='none';return;}
    bar.style.display='block';
    notes.forEach(nt=>{
      const d=document.createElement('div');d.className='gdi-note-mark';
      d.style.left=Math.min(100,Math.max(0,nt.t/dur*100))+'%';
      d.title=gdiFmtTime(nt.t)+' \u2014 '+nt.text;
      d.addEventListener('click',()=>{if(mv){try{mv.currentTime=nt.t;mv.play().catch(()=>{});}catch(_){}}});
      bar.appendChild(d);
    });
  }
  function tick(){
    if(!reviewOn)return;
    const v=mv;if(!v)return;
    const notes=notesNow().slice().sort((a,b)=>a.t-b.t);
    if(!notes.length){reviewOn=false;document.getElementById('gdi-review-btn')?.classList.remove('active');return;}
    const t=v.currentTime;
    let idx=-1;for(let i=0;i<notes.length;i++)if(notes[i].t<=t)idx=i;
    if(idx<0)return;
    const nxt=notes[idx+1];
    if(nxt&&t>=notes[idx].t+SPAN&&t<nxt.t){try{v.currentTime=nxt.t;}catch(_){}}
    else if(!nxt&&t>=notes[idx].t+SPAN){
      reviewOn=false;
      document.getElementById('gdi-review-btn')?.classList.remove('active');
      showToast('Revis\u00e3o conclu\u00edda \u2713');
    }
  }
  function exportMenu(){
    const old=document.getElementById('gdi-exp-menu');
    if(old){old.remove();return;}
    const btn=document.getElementById('gdi-notes-export');
    const m=document.createElement('div');m.id='gdi-exp-menu';
    const r=btn.getBoundingClientRect();
    m.style.cssText='position:fixed;z-index:10001;background:rgba(15,16,24,.97);border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:6px;display:flex;flex-direction:column;gap:4px;box-shadow:0 10px 30px rgba(0,0,0,.5);left:'+Math.max(8,r.left-60)+'px;top:'+(r.bottom+6)+'px;';
    m.innerHTML=`<button class="gdi-mode-btn" id="gdi-exp-md" style="justify-content:flex-start;font-size:12px;"><i class="bi bi-markdown"></i> Markdown (.md)</button>
    <button class="gdi-mode-btn" id="gdi-exp-anki" style="justify-content:flex-start;font-size:12px;"><i class="bi bi-collection"></i> Anki / texto (.txt)</button>`;
    GDI_ROOT().appendChild(m);
    document.getElementById('gdi-exp-md').onclick=()=>{m.remove();doExport('md');};
    document.getElementById('gdi-exp-anki').onclick=()=>{m.remove();doExport('anki');};
    setTimeout(()=>document.addEventListener('click',function h(e2){
      if(!m.contains(e2.target)){m.remove();document.removeEventListener('click',h);}
    }),0);
  }
  function doExport(fmt){
    const notes=notesNow().slice().sort((a,b)=>a.t-b.t);
    if(!notes.length){showToast('Nenhuma anota\u00e7\u00e3o para exportar');return;}
    let name='aula';try{name=decodeURIComponent(window.location.pathname.split('/').pop()||'aula')}catch(_){}
    const base=(name.replace(/\.[a-z0-9]+$/i,'')||'aula')+' \u2014 anota\u00e7\u00f5es';
    let content,type,ext;
    if(fmt==='anki'){
      content=notes.map(nt=>nt.text.replace(/\t/g,' ')+'\t'+name+' \u2014 '+gdiFmtTime(nt.t)).join('\n');
      type='text/plain;charset=utf-8';ext='anki.txt';
    }else{
      content='# Anota\u00e7\u00f5es \u2014 '+name+'\n\n'+notes.map(nt=>'- **['+gdiFmtTime(nt.t)+']** '+nt.text).join('\n')+'\n';
      type='text/markdown;charset=utf-8';ext='md';
    }
    const blob=new Blob([content],{type});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=base+'.'+ext;
    GDI_ROOT().appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),5000);
    showToast(notes.length+' anota\u00e7\u00e3o'+(notes.length>1?'\u00f5es':'')+' exportada'+(notes.length>1?'s':''));
  }
  window.GDI_REVIEW_SPAN=SPAN;
  // ★FIX: user:ready registrado UMA vez (dispatcher), não 1× por página de vídeo
  if(!window.__gdiM6UR){window.__gdiM6UR=true;
    Bus.onGlobal('user:ready',()=>{try{window.__gdiM6Render&&window.__gdiM6Render()}catch(_){}});}
  window.GDI_MODULES.push({name:'marks-ui',init:function(){
    const wrap=document.querySelector('.gdi-player-wrap');
    if(wrap&&!document.getElementById('gdi-note-marks')){
      const bar=document.createElement('div');bar.id='gdi-note-marks';
      wrap.insertAdjacentElement('afterend',bar);
    }
    if(wrap&&Os.isMobile&&!wrap.__gdiDblTap){
      wrap.__gdiDblTap=true;
      let lt=0,lx=0;
      wrap.addEventListener('touchend',e=>{
        const now=Date.now();
        const x=(e.changedTouches&&e.changedTouches[0]&&e.changedTouches[0].clientX)||0;
        if(now-lt<320&&Math.abs(x-lx)<90){
          const rect=wrap.getBoundingClientRect();
          const v=wrap.querySelector('video');
          if(v&&isFinite(v.duration)&&v.duration>0){
            const fwd=(x-rect.left)>rect.width/2;
            v.currentTime=Math.min(Math.max(0,v.currentTime+(fwd?10:-10)),Math.max(0,v.duration-0.5));
            showToast((fwd?'\u2192 +10s \u2192 ':'\u2190 -10s \u2190 ')+gdiFmtTime(v.currentTime));
          }
          lt=0;
        }else{lt=now;lx=x;}
      },{passive:true});
    }
    const head=document.querySelector('.gdi-notes-head');
    if(head&&!head.dataset.gdiNotes){
      head.dataset.gdiNotes='1';
      const w=document.createElement('div');w.style.cssText='display:flex;gap:6px;';
      w.innerHTML=`<button id="gdi-notes-export" class="gdi-mode-btn" style="padding:3px 10px;font-size:11px;" title="Baixar anota\u00e7\u00f5es"><i class="bi bi-download"></i> Exportar</button>
      <button id="gdi-review-btn" class="gdi-mode-btn" style="padding:3px 10px;font-size:11px;" title="Tocar s\u00f3 os trechos anotados (${SPAN}s cada)"><i class="bi bi-fast-forward-fill"></i> Revis\u00e3o</button>`;
      head.appendChild(w);
      document.getElementById('gdi-notes-export').addEventListener('click',exportMenu);
      document.getElementById('gdi-review-btn').addEventListener('click',()=>{
        reviewOn=!reviewOn;
        document.getElementById('gdi-review-btn').classList.toggle('active',reviewOn);
        if(reviewOn){
          const notes=notesNow().slice().sort((a,b)=>a.t-b.t);
          if(mv&&notes.length){
            const nx=notes.find(n=>n.t>mv.currentTime-0.5)||notes[0];
            try{mv.currentTime=nx.t;mv.play().catch(()=>{});}catch(_){}
          }
          showToast('Modo revis\u00e3o LIGADO \u2014 '+SPAN+'s por trecho ( ] e [ pulam entre eles)');
        }else showToast('Modo revis\u00e3o desligado');
      });
    }
    const slot=document.getElementById('gdi-slot-left');
    if(slot&&!document.getElementById('gdi-notes')){
      slot.insertAdjacentHTML('beforeend',`
      <div class="gdi-notes" id="gdi-notes">
        <div class="gdi-notes-head"><strong>\ud83d\udcdd Minhas anota\u00e7\u00f5es</strong><span id="gdi-notes-count" style="font-size:11px;color:#8b949e;"></span></div>
        <textarea id="gdi-note-input" rows="2" placeholder="Digite sua anota\u00e7\u00e3o para esta aula\u2026"></textarea>
        <div class="gdi-notes-actions">
          <span id="gdi-note-time" title="Clique para ir a este momento do v\u00eddeo">00:00</span>
          <button id="gdi-note-save"><i class="bi bi-save me-1"></i>Salvar</button>
        </div>
        <div id="gdi-notes-list"><div class="gdi-notes-empty">Carregando suas anota\u00e7\u00f5es\u2026</div></div>
      </div>`);
      document.getElementById('gdi-note-save').addEventListener('click',()=>{
        const ta=document.getElementById('gdi-note-input');
        const txt=(ta.value||'').trim();
        if(!txt){showToast('Digite a anota\u00e7\u00e3o antes de salvar');return;}
        const v=document.querySelector('video');
        const tNow=v&&isFinite(v.currentTime)?v.currentTime:0;
        GDIUser.addNote(window.location.pathname,tNow,txt);
        ta.value='';
        render();
        showToast('Anota\u00e7\u00e3o salva na sua conta');
      });
      const nt=document.getElementById('gdi-note-time');
      if(nt&&!nt.__seekB){nt.__seekB=true;
        nt.addEventListener('click',()=>{
          const v=document.querySelector('video');
          if(v&&nt.textContent.includes(':')){
            const pp=nt.textContent.split(':');
            const sec=(parseInt(pp[0],10)||0)*60+(parseInt(pp[1],10)||0);
            try{v.currentTime=sec;v.play().catch(()=>{});}catch(_){}
          }
        });
      }
      Bus.on('video:switched',()=>{
        const ta=document.getElementById('gdi-note-input');
        if(ta&&ta.value.trim()){ta.value='';showToast('Rascunho descartado ao trocar de aula');}
        render();
      });
      GDIUser.ready().then(render).catch(()=>{});
      window.__gdiM6Render=render; // ★FIX: dispatcher global único
    }
    function render(){
      const listEl=document.getElementById('gdi-notes-list');
      const cntEl=document.getElementById('gdi-notes-count');
      if(!listEl)return;
      const notes=GDIUser.getNotes(window.location.pathname);
      if(cntEl)cntEl.textContent=notes.length?notes.length+' nota'+(notes.length>1?'s':''):'';
      if(!notes.length){listEl.innerHTML='<div class="gdi-notes-empty">Nenhuma anota\u00e7\u00e3o ainda. Digite acima e salve.</div>';draw();return;}
      const sorted=[...notes].map((nt,idx)=>({...nt,idx})).sort((x,y)=>x.t-y.t);
      listEl.innerHTML=sorted.map(nt=>`
        <div class="gdi-note">
          <span class="gdi-note-time" data-seek="${nt.idx}" title="Ir para este momento">${gdiFmtTime(nt.t)}</span>
          <span class="gdi-note-text">${escHtml(nt.text)}</span>
          <button class="gdi-note-del" data-del="${nt.idx}" title="Excluir"><i class="bi bi-x-lg"></i></button>
        </div>`).join('');
      listEl.querySelectorAll('[data-seek]').forEach(el=>{
        el.addEventListener('click',()=>{
          const nt=GDIUser.getNotes(window.location.pathname)[+el.dataset.seek];
          const v=document.querySelector('video');
          if(nt&&v){try{v.currentTime=nt.t;v.play().catch(()=>{});}catch(_){}}
        });
      });
      listEl.querySelectorAll('[data-del]').forEach(el=>{
        el.addEventListener('click',()=>{GDIUser.delNote(window.location.pathname,+el.dataset.del);render();});
      });
      draw();
    }
    draw();
  }});
  Bus.onGlobal('user:ready',()=>{try{draw()}catch(_){}});
})();

// ═══ M7: PULAR INTRO POR CURSO ═══
(function(){
  let skipBtn=null;
  function courseKey(){
    try{const fl=window.playlistVideos[window.currentIndex]?.folder;if(fl)return fl;}catch(_){}
    return window.location.pathname.split('/').slice(0,-1).join('/')+'/';
  }
  Bus.onGlobal('media:ready',({type,el})=>{
    if(type!=='video'||!el||el.__m7)return;
    el.__m7=true;
    const upd=()=>{
      if(!skipBtn||!document.body.contains(skipBtn))return;
      const S=GDIUser.getIntro(courseKey());
      const tm=el.currentTime;
      let show=false;
      if(S&&S>0)show=tm>0.4&&tm<S-0.3&&tm<180;
      else show=tm>1&&tm<120;
      // ★FIX: só toca no DOM quando muda (era reescrito a cada timeupdate)
      const html=S
        ?'<i class="bi bi-skip-forward-fill"></i> Pular introdu\u00e7\u00e3o ('+gdiFmtTime(S)+')'
        :'<i class="bi bi-skip-forward-fill"></i> Pular introdu\u00e7\u00e3o';
      if(skipBtn.innerHTML!==html)skipBtn.innerHTML=html;
      const disp=show?'block':'none';
      if(skipBtn.style.display!==disp)skipBtn.style.display=disp;
    };
    el.addEventListener('timeupdate',upd);
    el.addEventListener('seeked',()=>setTimeout(upd,80));
    el.addEventListener('play',upd);
  });
  window.GDI_MODULES.push({name:'skip-intro',init:function(){
    const wrap=document.querySelector('.gdi-player-wrap');
    if(!wrap)return;
    if(!skipBtn||!document.body.contains(skipBtn)){
      skipBtn=document.createElement('button');
      skipBtn.id='gdi-skip-intro';
      skipBtn.innerHTML='<i class="bi bi-skip-forward-fill"></i> Pular introdu\u00e7\u00e3o';
      wrap.appendChild(skipBtn);
      skipBtn.addEventListener('click',()=>{
        const v=document.querySelector('.gdi-player-wrap video');if(!v)return;
        const ck=courseKey();
        if(!GDIUser.getIntro(ck)){
          GDIUser.setIntro(ck,Math.max(1,Math.round(v.currentTime)));
          showToast('Intro de '+gdiFmtTime(v.currentTime|0)+' memorizada para este curso \u2713');
        }
        try{v.currentTime=GDIUser.getIntro(ck)||v.currentTime;v.play().catch(()=>{});}catch(_){}
        skipBtn.style.display='none';
      });
    }
  }});
})();

// ═══ M9: MATERIAIS (PDFs por aula) ═══
(function(){
  const frames=new Map();let gen=0,lastKey='';
  function classify(name){
    const n2=name.toLowerCase();
    if(/mapa/.test(n2))                       return{l:'Mapa Mental', i:'bi-diagram-3',              ord:4};
    if(/simulado/.test(n2))                   return{l:'Minissimulado',i:'bi-stopwatch',             ord:2};
    if(/quest|exerc|prova/.test(n2))          return{l:'Exerc\u00edcios',  i:'bi-ui-checks',              ord:1};
    if(/resumo|iara|\bia\b|intelig/.test(n2)) return{l:'Resumo IA',   i:'bi-stars',                  ord:3};
    return                                    {l:'Material',    i:'bi-file-earmark-text-fill',ord:0};
  }
  function courseBase(){
    let nm='';
    try{nm=window.playlistVideos[window.currentIndex]?.origName||''}catch(_){}
    if(!nm){try{nm=decodeURIComponent(window.location.pathname.split('/').filter(Boolean).pop()||'')}catch(_){nm=''}}
    return nm.replace(/\.[a-z0-9]+$/i,'').toLowerCase().trim();
  }
  function ensurePanel(){
    const right=document.getElementById('gdi-slot-right');
    if(!right)return null;
    if(!right.dataset.m9){
      right.dataset.m9='1';
      right.innerHTML=`<div class="gdi-mat-head"><strong><i class="bi bi-journal-bookmark-fill" style="color:#7aa2ff;"></i> Materiais da aula</strong><span id="gdi-mat-status"></span></div>
      <div class="gdi-mat-tabs" id="gdi-mat-tabs"><span class="gdi-mat-loading">Buscando PDFs da aula\u2026</span></div>
      <div class="gdi-mat-body" id="gdi-mat-body"></div>`;
    }
    return{
      tabsEl:document.getElementById('gdi-mat-tabs'),
      bodyEl:document.getElementById('gdi-mat-body'),
      statusEl:document.getElementById('gdi-mat-status')
    };
  }
  async function build(){
    const myGen=++gen;
    const p=window.location.pathname;
    if(p.endsWith('/')||p.includes('/fallback'))return;
    // ★FIX: loader re-roda os módulos várias vezes na MESMA aula — não reconstruir
    if(p===lastKey){
      const tabs=document.getElementById('gdi-mat-tabs');
      const body=document.getElementById('gdi-mat-body');
      if(tabs&&body&&(tabs.querySelector('.gdi-mat-tab')||body.querySelector('.gdi-mat-empty')))return;
    }
    let panel=null;
    for(let i=0;i<40;i++){
      panel=ensurePanel();
      if(panel&&panel.tabsEl&&panel.bodyEl)break;
      if(myGen!==gen)return;
      await sleep(200);
    }
    if(!panel||!panel.tabsEl||!panel.bodyEl)return;
    const{tabsEl,bodyEl,statusEl}=panel;
    const UI=window.UI||{};
    const curPath=window.location.pathname;
    const fPath=curPath.split("/").slice(0,-1).join("/")+"/";
    const pPath=curPath.split("/").slice(0,-2).join("/")+"/";
    tabsEl.innerHTML='<span class="gdi-mat-loading">Buscando PDFs da aula\u2026</span>';
    if(statusEl)statusEl.textContent='';
    bodyEl.innerHTML='';
    const isPdf=x=>(x.fileExtension||'').toLowerCase()==='pdf'||/pdf/i.test(x.mimeType||'');
    try{
      let found=[];
      const here=await gdiListAllFiles(fPath,gdiGetPw(fPath));
      found=here.filter(isPdf);
      if(!found.length){
        const subs=here.filter(x=>x.mimeType==='application/vnd.google-apps.folder').slice(0,20);
        for(const sf of subs){
          const fp=fPath+encodeURIComponent(sf.name)+'/';
          found=found.concat((await gdiListAllFiles(fp,gdiGetPw(fp))).filter(isPdf));
          if(found.length)break;
        }
      }
      if(!found.length)found=(await gdiListAllFiles(pPath,gdiGetPw(pPath))).filter(isPdf);
      const seen=new Set();const uniq=[];
      found.forEach(x=>{if(!seen.has(x.name)){seen.add(x.name);uniq.push(x)}});
      const pdfs=uniq.slice(0,12);
      if(myGen!==gen)return;
      if(!pdfs.length){
        if(tabsEl.isConnected){
          tabsEl.innerHTML='';
          if(statusEl)statusEl.textContent='sem PDF';
          if(bodyEl)bodyEl.innerHTML=`<div class="gdi-mat-empty"><i class="bi bi-file-earmark-x" style="font-size:34px;"></i><div>Nenhum material PDF encontrado para esta aula.</div></div>`;
          lastKey=p;
        }
        return;
      }
      const base=courseBase();
      const items=pdfs.map(x=>{
        const cls=classify(x.name);
        const b2=UI.second_domain_for_dl?UI.downloaddomain+x.link:window.location.origin+x.link;
        const url=b2+(x.link.includes('?')?'&':'?')+'inline=true';
        const match=base&&x.name.toLowerCase().includes(base)?0:1;
        return{name:x.name,label:cls.l,icon:cls.i,ord:cls.ord,match,url};
      });
      items.sort((x,y)=>x.match-y.match||x.ord-y.ord||x.name.localeCompare(y.name,undefined,{numeric:true}));
      const used={};
      items.forEach((it,idx)=>{
        used[it.label]=(used[it.label]||0)+1;
        it.tabLabel=used[it.label]>1?it.label+' '+used[it.label]:it.label;
        it.idx=idx;
      });
      if(!tabsEl.isConnected)return;
      tabsEl.innerHTML=items.map(it=>`
        <div class="gdi-mat-tab" data-mat="${it.idx}" title="${escHtml(it.name)}">
          <i class="bi ${it.icon}"></i><span>${escHtml(it.tabLabel)}</span>
        </div>`).join('');
      if(statusEl)statusEl.textContent=items.length+' PDF'+(items.length>1?'s':'');
      const isMobile=Os.isMobile;
      function show(idx){
        if(!tabsEl.isConnected||!bodyEl.isConnected)return;
        tabsEl.querySelectorAll('.gdi-mat-tab').forEach(t=>t.classList.toggle('active',+t.dataset.mat===idx));
        if(isMobile){
          bodyEl.innerHTML=`<div class="gdi-mat-empty">
            <i class="bi bi-file-earmark-pdf" style="font-size:38px;color:#7aa2ff;"></i>
            <div style="text-align:center;padding:0 16px;">
              <div style="font-weight:600;margin-bottom:4px;">${escHtml(items[idx].name)}</div>
              <div style="font-size:11px;color:#8b949e;margin-bottom:14px;">Toque para abrir o PDF</div>
            </div>
            <a href="${items[idx].url}" target="_blank" rel="noopener" class="gdi-mode-btn" style="text-decoration:none;justify-content:center;min-width:200px;">
              <i class="bi bi-box-arrow-up-right"></i> Abrir material
            </a>
          </div>`;
          return;
        }
        let ifr=frames.get(items[idx].url);
        if(!ifr){
          ifr=document.createElement('iframe');
          ifr.src=items[idx].url;ifr.loading='lazy';
          ifr.title=items[idx].name;
          frames.set(items[idx].url,ifr);
        }
        bodyEl.innerHTML='';bodyEl.appendChild(ifr);
      }
      tabsEl.querySelectorAll('.gdi-mat-tab').forEach(t=>{
        t.addEventListener('click',()=>show(+t.dataset.mat));
      });
      show(0);
      lastKey=p;
      console.log('[GDI Materiais] aula:',base||'(sem nome)','\u2192',items.length,'PDFs:',items.map(x=>x.tabLabel).join(' | '));
    }catch(err){
      if(myGen!==gen)return;
      if(statusEl)statusEl.textContent='sem PDF';
      if(bodyEl)bodyEl.innerHTML=`<div class="gdi-mat-empty"><i class="bi bi-wifi-off" style="font-size:34px;"></i><div>N\u00e3o foi poss\u00edvel carregar os materiais.</div></div>`;
    }
  }
  Bus.onGlobal('video:switched',()=>{setTimeout(build,80);});
  window.GDI_MODULES.push({name:'materials',init:build});
})();

// ═══ M10 v5: MODOS DE FOCO + BOTÃO ASSISTIDO ═══
(function(){
  if(!document.getElementById('gdi-focus-style')){
    const s=document.createElement('style');s.id='gdi-focus-style';s.textContent=`
body.gdi-fv .gdi-study-grid,body.gdi-fm .gdi-study-grid{grid-template-columns:1fr!important;}
body.gdi-fv .gdi-study-right{display:none!important;}
body.gdi-fm .gdi-study-left{display:none!important;}
body.gdi-fv .gdi-study-left{width:100%!important;max-width:100%!important;}
body.gdi-fv .gdi-player-wrap{width:100%!important;max-width:100%!important;}
body.gdi-fv .gdi-player-wrap video,
body.gdi-fv .gdi-player-wrap .plyr,
body.gdi-fv .gdi-player-wrap .plyr__video-wrapper,
body.gdi-fv .gdi-player-wrap .video-js,
body.gdi-fv .gdi-player-wrap .dplayer,
body.gdi-fv .gdi-player-wrap .dplayer-video-wrap,
body.gdi-fv .gdi-player-wrap .dplayer-video,
body.gdi-fv .gdi-player-wrap .jwplayer,
body.gdi-fv .gdi-player-wrap #player,
body.gdi-fv .gdi-player-wrap #vplayer,
body.gdi-fv .gdi-player-wrap #player-container,
body.gdi-fv .gdi-player-wrap iframe{
  width:100%!important;max-width:100%!important;max-height:none!important;
  margin-left:auto!important;margin-right:auto!important;display:block!important;}`;
    document.head.appendChild(s);
  }
  function isDone(){
    const key=window.gdiVideoKey?window.gdiVideoKey():window.location.pathname;
    let done=false;
    try{
      done=GDIUser.isWatched(key);
      if(!done&&window.gdiNormKey)done=GDIUser.isWatched(gdiNormKey(key));
      if(!done)done=GDIUser.isWatched(window.location.pathname);
    }catch(_){}
    return done;
  }
  function updBtn(){
    const wb=document.getElementById('gdi-watched-btn');
    if(!wb)return;
    const done=isDone();
    wb.classList.toggle('done',done);
    wb.innerHTML=done?'<i class="bi bi-eye-fill"></i><span>Assistida \u2713</span>':'<i class="bi bi-eye"></i><span>Assistido</span>';
  }
  function findLayout(){
    const study=document.getElementById('gdi-study');
    const wrap=document.querySelector('.gdi-player-wrap');
    if(study){
      const grid=study.querySelector('.gdi-study-grid');
      const left=(grid||study).querySelector('.gdi-study-left');
      const right=(grid||study).querySelector('.gdi-study-right');
      if(grid&&(left||right))return{grid,left,right};
    }
    const rightEl=document.getElementById('gdi-slot-right')||document.getElementById('gdi-mat-body');
    if(wrap&&rightEl&&rightEl!==wrap){
      let p=wrap.parentElement;
      while(p&&p!==document.body&&!p.contains(rightEl))p=p.parentElement;
      if(p&&p!==document.body&&p.contains(wrap)){
        const col=el=>{let n=el;while(n&&n.parentElement&&n.parentElement!==p)n=n.parentElement;return n;};
        return{grid:p,left:col(wrap),right:col(rightEl)};
      }
    }
    return{grid:null,left:null,right:null};
  }
  // ★FIX: registrados UMA vez no escopo do IIFE (antes: +3 handlers
  //       globais por página de vídeo, acumulando para sempre)
  Bus.onGlobal('watched:changed',updBtn);
  Bus.onGlobal('user:ready',updBtn);
  Bus.onGlobal('video:switched',()=>setTimeout(updBtn,150));
  window.GDI_MODULES.push({name:'focus-modes',init:function(){
    const study=document.getElementById('gdi-study');
    const wrap=document.querySelector('.gdi-player-wrap');
    if(!study&&!wrap)return;
    let slot=document.getElementById('gdi-slot-modes');
    let created=false;
    if(!slot){
      const host=study?study.querySelector('.gdi-study-left'):null;
      slot=document.createElement('div');
      slot.id='gdi-slot-modes';
      slot.style.cssText='display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:0 0 10px 0;';
      if(host)host.insertBefore(slot,host.firstChild);
      else if(wrap&&wrap.parentElement)wrap.parentElement.insertBefore(slot,wrap);
      else if(study)study.insertBefore(slot,study.firstChild);
      else return;
      created=true;
    }
    if(slot.dataset.m10)return;
    slot.dataset.m10='1';
    console.log('[GDI M10] v5 ativo \u2014 slot '+(created?'CRIADO pelo extras (o core n\u00e3o fornece)':'do core'));
    slot.innerHTML=`
      <button class="gdi-mode-btn" data-mode="split" title="Tela dividida (v\u00eddeo + material)"><i class="bi bi-layout-split"></i><span class="d-none d-md-inline">Dividido</span></button>
      <button class="gdi-mode-btn" data-mode="fv" title="Foco na aula (v\u00eddeo em largura total)"><i class="bi bi-lightning-charge-fill"></i><span class="d-none d-md-inline">Foco na aula</span></button>
      <button class="gdi-mode-btn" data-mode="fm" title="Foco no material (s\u00f3 PDF, zoom autom\u00e1tico)"><i class="bi bi-file-earmark-pdf-fill"></i><span class="d-none d-md-inline">Foco no material</span></button>
      <button class="gdi-watched-btn" id="gdi-watched-btn" title="Marcar esta aula como assistida"><i class="bi bi-eye"></i><span>Assistido</span></button>`;
    function zoom(){
      const z=document.body.classList.contains('gdi-fm')?'150':'100';
      const ifr=document.querySelector('#gdi-mat-body iframe');
      if(ifr){const base=ifr.src.split('#')[0];if(!base.endsWith('.html'))ifr.src=base+'#zoom='+z;}
    }
    function applyLayout(m){
      const{grid,left,right}=findLayout();
      if(grid){
        if(m==='fv'||m==='fm')grid.style.setProperty('grid-template-columns','1fr','important');
        else grid.style.removeProperty('grid-template-columns');
      }
      if(right){
        if(m==='fv')right.style.setProperty('display','none','important');
        else right.style.removeProperty('display');
      }
      if(left){
        if(m==='fm')left.style.setProperty('display','none','important');
        else left.style.removeProperty('display');
      }
    }
    function setMode(m){
      document.body.classList.toggle('gdi-fv',m==='fv');
      document.body.classList.toggle('gdi-fm',m==='fm');
      try{localStorage.setItem('gdi-study-mode',m)}catch(_){}
      slot.querySelectorAll('.gdi-mode-btn[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===m));
      applyLayout(m);
      if(m!=='fv')setTimeout(zoom,60);
    }
    slot.querySelectorAll('.gdi-mode-btn[data-mode]').forEach(b=>{
      b.addEventListener('click',()=>setMode(b.dataset.mode));
    });
    let saved='split';try{saved=localStorage.getItem('gdi-study-mode')||'split'}catch(_){}
    setMode(['fv','fm','split'].includes(saved)?saved:'split');
    const wb=document.getElementById('gdi-watched-btn');
    if(wb&&!wb.dataset.b){
      wb.dataset.b='1';
      wb.addEventListener('click',()=>{
        const done=isDone();
        if(done){window.gdiUnmarkVideo?gdiUnmarkVideo():GDIUser.unmarkWatched(window.location.pathname);}
        else{window.gdiMarkVideo?gdiMarkVideo():GDIUser.markWatched(window.location.pathname);}
        showToast(done?'Aula desmarcada':'Aula marcada como assistida \u2713');
      });
    }
    updBtn();
  }});
})();

// ═══ M11 v3.2: MODO DESCANSO — UI fora do body ═══
(function(){
  let btn=null,overlay=null,sleeping=false,bound=false,wakeGuard=0;
  const fsEl=()=>document.fullscreenElement||document.webkitFullscreenElement||null;
  const wrapEl=()=>document.querySelector('.gdi-player-wrap');
  const onAudioPage=()=>!!document.getElementById('aplayer-container');
  function ensureEls(){
    const needOv=!overlay||!overlay.isConnected;
    const needBt=!btn||!btn.isConnected;
    if(!needOv&&!needBt)return;
    if(needOv){
      overlay=document.createElement('div');
      overlay.id='gdi-sleep-overlay';
      overlay.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#000;opacity:0;pointer-events:none;transition:opacity 2.5s ease;cursor:pointer;';
      overlay.title='Clique para sair do modo descanso';
      overlay.addEventListener('click',()=>exitSleep());
    }
    if(needBt){
      btn=document.createElement('button');
      btn.id='gdi-sleep-btn';
      btn.innerHTML='<i class="bi bi-moon-stars-fill"></i>';
      btn.title='Modo descanso (apenas \u00e1udio) \u2014 clique para ligar';
      btn.style.cssText='position:fixed;bottom:76px;left:16px;z-index:2147483001;background:rgba(18,18,28,0.92);border:1.5px solid rgba(255,255,255,0.25);border-radius:50%;width:40px;height:40px;color:#74c0fc;font-size:16px;cursor:pointer;display:none;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,0.5);';
      btn.addEventListener('click',e=>{e.stopPropagation();sleeping?exitSleep():enterSleep();});
    }
    if(!overlay.parentElement)GDI_ROOT().appendChild(overlay);
    if(!btn.parentElement)GDI_ROOT().appendChild(btn);
  }
  function enterSleep(){
    if(sleeping)return;
    sleeping=true;
    wakeGuard=Date.now()+2500;
    overlay.style.transition='opacity 2.5s ease';
    overlay.style.pointerEvents='all';
    overlay.style.opacity='0.97';
    btn.innerHTML='<i class="bi bi-sun-fill"></i>';
    btn.style.color='#ffd43b';
    btn.title='Sair do modo descanso';
  }
  function exitSleep(){
    if(!sleeping)return;
    sleeping=false;
    overlay.style.transition='opacity .5s ease';
    overlay.style.opacity='0';
    overlay.style.pointerEvents='none';
    btn.innerHTML='<i class="bi bi-moon-stars-fill"></i>';
    btn.style.color='#74c0fc';
    btn.title='Modo descanso (apenas \u00e1udio) \u2014 clique para ligar';
  }
  function syncFs(){
    ensureEls();
    const fs=fsEl();
    const wrap=wrapEl();
    const video=!!wrap,audio=onAudioPage();
    if(!video&&!audio){btn.style.display='none';if(sleeping)exitSleep();return;}
    let fsOk=false;
    if(fs&&fs.tagName!=='VIDEO'){
      if(!video)fsOk=true;
      else fsOk=fs===document.documentElement||fs===document.body||fs===wrap||fs.contains(wrap)||wrap.contains(fs);
    }
    const host=fsOk?fs:GDI_ROOT();
    if(btn.parentElement!==host)host.appendChild(btn);
    if(overlay.parentElement!==host)host.appendChild(overlay);
    btn.style.display=(video&&!fsOk)?'none':'flex';
    if(sleeping&&video&&!fsOk)exitSleep();
  }
  function bindOnce(){
    if(bound)return;bound=true;
    document.addEventListener('fullscreenchange',syncFs);
    document.addEventListener('webkitfullscreenchange',syncFs);
    ['mousemove','mousedown','keydown','touchstart'].forEach(ev=>{
      document.addEventListener(ev,e=>{
        if(!sleeping||Date.now()<wakeGuard)return;
        if(ev!=='mousemove'&&e.target&&btn&&(e.target===btn||btn.contains(e.target)))return;
        exitSleep();
      },{passive:true});
    });
    Bus.onGlobal('media:ready',({type,el})=>{
      if(type==='video'&&el&&!el.__gdiSleepEnd){
        el.__gdiSleepEnd=true;
        try{el.addEventListener('ended',()=>exitSleep());}catch(_){}
      }
    });
  }
  window.GDI_MODULES.push({name:'sleep-mode',init:function(){
    ensureEls();bindOnce();syncFs();
  }});
  console.log('[GDI M11] v3.2 descanso registrado');
})();

// ═══ M12: POMODORO v2.5 (UI fora do body) ═══
(function(){
  window.GDI_MODULES.push({name:'pomodoro',init:function(){
    if(window.__gdiPomodoroBooted)return;
    window.__gdiPomodoroBooted=true;
    const $id=x=>document.getElementById(x);
    const fmt=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(Math.floor(s%60)).padStart(2,'0');
    const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
    const safeParse=s=>{try{return JSON.parse(s)}catch(e){return null}};
    const flashEl=document.createElement('div');flashEl.id='gdi-pom-flash';
    const root=document.createElement('div');root.id='gdi-pom-root';
    root.innerHTML=`
    <div id="gdi-pom-fab" title="Pomodoro"><span>🍅</span></div>
    <div id="gdi-pom-panel">
      <div class="gdi-pom-phase-label" id="gdi-pom-phase-label">🍅 Foco</div>
      <div id="gdi-pom-display">25:00</div>
      <div id="gdi-pom-progress"><div id="gdi-pom-progress-bar"></div></div>
      <div id="gdi-pom-sessions-dots"></div>
      <div id="gdi-pom-btns">
        <button class="gdi-pom-btn" id="gdi-pom-start">▶ Iniciar</button>
        <button class="gdi-pom-btn" id="gdi-pom-skip" title="Pular fase">⏭</button>
        <button class="gdi-pom-btn" id="gdi-pom-reset" title="Zerar">↺</button>
      </div>
      <div id="gdi-pom-divider"></div>
      <div id="gdi-pom-cfg">
        <div class="gdi-pom-cfg-row"><span>🍅 Foco (min)</span><input id="gdi-pom-c-work" type="number" min="1" max="90" value="25"></div>
        <div class="gdi-pom-cfg-row"><span>☕ Pausa curta</span><input id="gdi-pom-c-short" type="number" min="1" max="30" value="5"></div>
        <div class="gdi-pom-cfg-row"><span>🛋 Pausa longa</span><input id="gdi-pom-c-long" type="number" min="1" max="60" value="15"></div>
        <div class="gdi-pom-cfg-row"><span>🔁 Sessões p/ longa</span><input id="gdi-pom-c-sess" type="number" min="1" max="10" value="4"></div>
        <label class="gdi-pom-switch"><span>▶ Auto-iniciar próxima fase</span><input id="gdi-pom-c-auto" type="checkbox" checked></label>
      </div>
    </div>`;
    GDI_ROOT().appendChild(flashEl);
    GDI_ROOT().appendChild(root);
    if(!document.querySelector('video,audio')&&!window._gdiAPlayer)root.style.display='none';
    const CKEY='gdi-pom-cfg-v2',SKEY='gdi-pom-state-v2';
    let cfg=Object.assign({work:25,short:5,long:15,sessions:4,autoStart:true},safeParse(localStorage.getItem(CKEY))||{});
    let st={phase:'work',total:cfg.work*60,remain:cfg.work*60,dots:0,running:false,endAt:0};
    let timer=null,lastWarn=-1,panelOpen=false,baseTitle=document.title,dotsCache='';
    function check(){
      const has=!!(document.querySelector('video,audio')||window._gdiAPlayer);
      root.style.display=has?'':'none';
      if(!has&&panelOpen){panelOpen=false;$id('gdi-pom-panel')?.classList.remove('open');}
    }
    function refreshBase(){baseTitle=document.title.replace(/^\d\d:\d\d \S+ \u00b7 /,'');if(st.running)updateUI();}
    Bus.onGlobal('media:ready',()=>setTimeout(check,50));
    Bus.onGlobal('page:change',()=>{setTimeout(check,30);setTimeout(refreshBase,60);});
    Bus.onGlobal('title:change',()=>setTimeout(refreshBase,30));
    function persist(){try{localStorage.setItem(SKEY,JSON.stringify({phase:st.phase,total:st.total,remain:st.remain,running:st.running,dots:st.dots,endAt:st.endAt}))}catch(e){}}
    (function(){const s=safeParse(localStorage.getItem(SKEY));if(!s)return;
      st.phase=s.phase||'work';st.dots=s.dots||0;st.total=s.total||st.total;
      st.remain=(s.remain!=null&&s.remain>0)?s.remain:st.total;st.running=false;st.endAt=0;})();
    let actx=null;
    function beep(f,dur,type,vol){dur=dur||.3;type=type||'sine';vol=vol==null?.35:vol;
      try{actx=actx||new(window.AudioContext||window.webkitAudioContext)();
        if(actx.state==='suspended')actx.resume();
        const o=actx.createOscillator(),g=actx.createGain();
        o.connect(g);g.connect(actx.destination);
        o.type=type;o.frequency.value=f;
        g.gain.setValueAtTime(vol,actx.currentTime);
        g.gain.exponentialRampToValueAtTime(.0001,actx.currentTime+dur);
        o.start();o.stop(actx.currentTime+dur);}catch(e){}}
    function alarm(isBreak){const notes=isBreak?[660,880,1100]:[1100,880,660];
      notes.forEach((f,i)=>setTimeout(()=>beep(f,.4,'sine',.5),i*300));
      setTimeout(()=>notes.forEach((f,i)=>setTimeout(()=>beep(f,.3,'sine',.35),i*280)),1100);}
    function flash(c){flashEl.style.background=c;flashEl.style.opacity='.4';setTimeout(()=>{flashEl.style.opacity='0'},600);}
    function notify(t,b){if(!('Notification' in window))return;
      if(Notification.permission==='granted'){try{new Notification(t,{body:b})}catch(e){}}
      else if(Notification.permission==='default')Notification.requestPermission();}
    function info(){
      if(st.phase==='work')return{label:'🍅 Foco',c:'#1f6feb',fl:'#001a40'};
      if(st.phase==='short')return{label:'☕ Pausa',c:'#2f9e44',fl:'#002a10'};
      return{label:'🛋 Pausa longa',c:'#7048e8',fl:'#1a0040'};}
    function dots(){
      const key=st.dots+'/'+cfg.sessions;if(key===dotsCache)return;dotsCache=key;
      const inC=st.dots%cfg.sessions;
      const lit=st.dots>0&&inC===0?cfg.sessions:inC;
      let h='';for(let i=0;i<cfg.sessions;i++)h+='<div class="gdi-pom-dot'+(i<lit?' done':'')+'"></div>';
      const el=$id('gdi-pom-sessions-dots');if(el)el.innerHTML=h;}
    function updateUI(){
      const d=info(),time=fmt(st.remain),warn=st.running&&st.remain<=10&&st.remain>0;
      const pct=st.total?st.remain/st.total*100:0;
      const disp=$id('gdi-pom-display');
      if(disp){disp.textContent=time;disp.style.color=warn?'#ff6b6b':'#f0f6fc';}
      const lab=$id('gdi-pom-phase-label');
      if(lab){lab.textContent=d.label;lab.style.color=d.c;}
      const bar=$id('gdi-pom-progress-bar');
      if(bar){bar.style.width=pct+'%';bar.style.background=warn?'#ff6b6b':d.c;}
      const fab=$id('gdi-pom-fab');
      if(fab){fab.style.setProperty('--pom-p',String(100-pct));
        fab.style.setProperty('--pom-c',st.running?d.c:'rgba(255,255,255,.14)');
        fab.classList.toggle('warning',!!warn);}
      const btn=$id('gdi-pom-start');
      if(btn)btn.textContent=st.running?'⏸ Pausar':'▶ '+(st.remain<st.total?'Continuar':'Iniciar');
      dots();
      if(st.running){
        if(!/^\d\d:\d\d \S+ \u00b7 /.test(document.title))baseTitle=document.title;
        const emoji=st.phase==='work'?'🍅':st.phase==='short'?'☕':'🛋';
        document.title=fmt(st.remain)+' '+emoji+' \u00b7 '+baseTitle;
      }}
    function startLoop(){clearInterval(timer);st.running=true;
      timer=setInterval(()=>{st.remain=Math.max(0,Math.round((st.endAt-Date.now())/1000));
        if(st.remain<=0){next();return;}
        if(st.remain<=10&&st.remain!==lastWarn){lastWarn=st.remain;beep(880+(10-st.remain)*20,.12,'square',.3);}
        updateUI();},250);
      lastWarn=-1;updateUI();}
    function start(){st.endAt=Date.now()+st.remain*1000;persist();startLoop();}
    function pause(){clearInterval(timer);timer=null;st.running=false;
      document.title=document.title.replace(/^\d\d:\d\d \S+ \u00b7 /,'');persist();updateUI();}
    function reset(){pause();st.phase='work';st.dots=0;st.total=cfg.work*60;st.remain=st.total;st.endAt=0;dotsCache='';persist();updateUI();}
    function next(){clearInterval(timer);timer=null;st.running=false;
      if(st.phase==='work'){st.dots++;const long=st.dots%cfg.sessions===0;
        st.phase=long?'long':'short';st.total=(long?cfg.long:cfg.short)*60;
        flash(info().fl);alarm(true);
        notify(long?'Pausa longa! 🛋':'Pausa! ☕',fmt(st.total)+' de descanso. Você merece!');
      }else{
        if(st.phase==='long'){st.dots=0;dotsCache='';}
        st.phase='work';st.total=cfg.work*60;
        flash(info().fl);alarm(false);
        notify('Hora de focar! 🍅',cfg.work+' minutos de concentração.');}
      st.remain=st.total;
      if(cfg.autoStart){st.endAt=Date.now()+st.total*1000;persist();startLoop();}
      else{persist();updateUI();}}
    $id('gdi-pom-fab').addEventListener('click',()=>{panelOpen=!panelOpen;$id('gdi-pom-panel').classList.toggle('open',panelOpen);if(panelOpen)updateUI();});
    document.addEventListener('click',e=>{if(panelOpen&&!root.contains(e.target)){panelOpen=false;$id('gdi-pom-panel')?.classList.remove('open');}},{capture:true});
    $id('gdi-pom-start').addEventListener('click',()=>st.running?pause():start());
    $id('gdi-pom-skip').addEventListener('click',next);
    $id('gdi-pom-reset').addEventListener('click',reset);
    function loadCfg(){$id('gdi-pom-c-work').value=cfg.work;$id('gdi-pom-c-short').value=cfg.short;$id('gdi-pom-c-long').value=cfg.long;$id('gdi-pom-c-sess').value=cfg.sessions;$id('gdi-pom-c-auto').checked=!!cfg.autoStart;}
    loadCfg();
    ['gdi-pom-c-work','gdi-pom-c-short','gdi-pom-c-long','gdi-pom-c-sess'].forEach(id=>{
      $id(id).addEventListener('change',()=>{
        cfg.work=clamp(parseInt($id('gdi-pom-c-work').value)||25,1,90);
        cfg.short=clamp(parseInt($id('gdi-pom-c-short').value)||5,1,30);
        cfg.long=clamp(parseInt($id('gdi-pom-c-long').value)||15,1,60);
        cfg.sessions=clamp(parseInt($id('gdi-pom-c-sess').value)||4,1,10);
        localStorage.setItem(CKEY,JSON.stringify(cfg));
        loadCfg();
        if(!st.running){st.phase='work';st.dots=0;dotsCache='';st.total=cfg.work*60;st.remain=st.total;persist();updateUI();}});});
    $id('gdi-pom-c-auto').addEventListener('change',e=>{cfg.autoStart=e.target.checked;localStorage.setItem(CKEY,JSON.stringify(cfg));});
    updateUI();
    console.log('[GDI Pomodoro] v2.5 pronto');
  }});
})();

// ═══ M13 v19.6: CARD "CONTINUAR" EM CASCATA ═══
(function(){
  // ★FIX: guarda contra registro duplo caso o script seja reexecutado
  if(window.__GDI_M13__)return;
  window.__GDI_M13__=true;
  const DBG=true;
  const log=(...a)=>{if(DBG)try{console.log('[GDI M13]',...a)}catch(_){}};
  function stripExt(s){return String(s||'').replace(/\.[a-z0-9]{1,5}$/i,'').trim()}
  const GENERIC_WORDS=/^(aula|aulas|v\u00eddeo|videos?|li[cç][aã]o|li[cç][oõ]es|lesson|lessons|class|classes|modulo|m\u00f3dulo|module|modulos|m\u00f3dulos|modules|parte|partes|pt|cap|caps|capitulo|cap\u00edtulo|ext|ep|eps|episodio|epis\u00f3dio|live|revisao|revis\u00e3o|arquivo|file)$/i;
  function isGenericName(raw){
    const n=stripExt(raw).toLowerCase();
    if(!n)return true;
    const reduced=n.replace(/[\s\-_.:,;|()/\\]+/g,' ').split(' ')
      .filter(w=>w&&!/^\d+$/.test(w)&&!GENERIC_WORDS.test(w)&&!GENERIC_WORDS.test(w.replace(/\d+$/,'')))
      .join('');
    return reduced.length===0;
  }
  function realNameOf(path){
    const seg=normPath(path).split('/').filter(Boolean);
    let name=stripExt(seg[seg.length-1]||'');
    if(isGenericName(name)){
      for(let j=seg.length-2;j>=0;j--){
        if(/^\d+:$/.test(seg[j]))break;
        if(!isGenericName(seg[j])){name=stripExt(seg[j]);break;}
      }
    }
    return name||'Aula';
  }
  let rescue=null,rescueAt=0;
  function ensureRescue(force){
    if(!force&&rescue&&Date.now()-rescueAt<60000)return;
    fetch('/userstate',{credentials:'same-origin'})
      .then(r=>r.ok?r.json():null)
      .then(j=>{
        if(j&&typeof j==='object'){
          rescue=j;rescueAt=Date.now();
          log('estado obtido do /userstate \u2014 resume:',Object.keys(j.resume||{}).length,'| history:',(j.history||[]).length);
          setTimeout(continueCardInit,30);
        }
      })
      .catch(e=>log('falha no /userstate:',e));
  }
  function stateD(){
    try{
      if(window.GDIUser&&GDIUser.loaded()){const d=GDIUser.dump();if(d)return d;}
    }catch(_){}
    if(rescue)return rescue;
    try{
      if(window.GDIUser){const d=GDIUser.dump();if(d&&Object.keys(d).length)return d;}
    }catch(_){}
    return null;
  }
  function authIn(){
    try{if(window.GDIUser&&typeof GDIUser.auth==='function')return GDIUser.auth()!=='out';}catch(_){}
    return true;
  }
  function getResumeOf(d,key){
    try{
      if(window.GDIUser&&GDIUser.loaded()&&typeof GDIUser.getResume==='function'){
        const r=GDIUser.getResume(key);if(r)return r;
      }
    }catch(_){}
    return (d&&d.resume&&d.resume[key])||null;
  }
  function resumeKeyFor(path){
    const p=String(path||'');
    if(p.indexOf('/fallback?')===0){
      try{return '/fallback::'+(new URLSearchParams(p.split('?')[1]||'').get('id')||'')}catch(_){return ''}
    }
    return p.split('?')[0];
  }
  function normPath(p){
    try{return decodeURIComponent(String(p||'').split('?')[0].replace(/\/+$/,''))}catch(_){return String(p||'').split('?')[0].replace(/\/+$/,'')}
  }
  function low(p){return normPath(p).toLowerCase()}
  function okPath(x){
    try{
      if(typeof window.gdiOkPath!=='function')return true;
      return !!window.gdiOkPath(x);
    }catch(_){return true}
  }
  function subtreePrefix(){
    const cur=low(window.location.pathname);
    if(cur==='')return'';
    const m=/^\/(\d+):$/.exec(cur);
    if(m)return'/'+m[1]+':';
    return cur;
  }
  function inSubtree(path){
    const pre=subtreePrefix();
    if(pre==='')return true;
    const lp=low(path);
    return lp.indexOf(pre+'/')===0||lp===pre;
  }
  function playerHref(p){
    const s=String(p||'');
    if(!s||s.indexOf('/fallback')===0)return'';
    return s.includes('?')?s+'&a=view':s+'?a=view';
  }
  async function safeGo(ev){
    const a=ev.currentTarget;
    const href=a.getAttribute('href')||'';
    if(!href||!href.startsWith('/'))return;
    ev.preventDefault();
    try{
      const r=await fetch(href,{method:'HEAD',redirect:'manual',credentials:'same-origin'});
      if(r.status>=300&&r.status<400){
        const loc=(r.headers.get('location')||'')+' '+(r.url||'');
        if(/login/i.test(loc)){showToast('Sess\u00e3o expirada \u2014 entre para retomar');location.href='/login';return;}
      }
    }catch(_){}
    location.href=href;
  }
  function nameInfo(target){
    const cur=normPath(window.location.pathname);
    const isDriveRoot=/^\/\d+:$/.test(cur);
    const tNorm=normPath(target);
    let rest=tNorm;
    if(!isDriveRoot&&tNorm.indexOf(cur+'/')===0)rest=tNorm.slice(cur.length+1);
    const seg=rest.split('/').filter(Boolean);
    if(isDriveRoot&&/^\d+:$/.test(seg[0]||''))seg.shift();
    if(seg.length&&/^\d+:$/.test(seg[0])){
      const dn=(window.drive_names||[])[parseInt(seg[0],10)];
      if(dn)seg[0]=dn;
    }
    let src=seg.length-1;
    let name=stripExt(seg[src]||'');
    if(isGenericName(name)){
      for(let j=seg.length-2;j>=0;j--){
        if(/^\d+:$/.test(seg[j]))break;
        if(!isGenericName(seg[j])){src=j;name=stripExt(seg[j]);break;}
      }
    }
    const folder=src>0?seg[src-1]:'';
    let drivePart='';
    if(isDriveRoot&&window.drive_names&&window.drive_names[window.current_drive_order])drivePart=window.drive_names[window.current_drive_order];
    return{name:name||'Aula',folder,drive:drivePart};
  }
  function srsDueCount(){
    const d=stateD();if(!d)return 0;
    const now=Date.now();let n=0;
    for(const k in(d.notes||{})){
      (d.notes[k]||[]).forEach(x=>{
        const id=k+'|'+x.at;
        const e=d.srs&&d.srs[id];
        const due=e?e.due:(x.at+86400000);
        if(due<=now)n++;
      });
    }
    return n;
  }
  function srsOpen(){
    const old=document.getElementById('gdi-srs-panel');
    if(old){old.remove();return;}
    const d=stateD()||{};
    const now=Date.now();
    const due=[];
    for(const k in(d.notes||{})){
      (d.notes[k]||[]).forEach(x=>{
        const id=k+'|'+x.at;
        const e=d.srs&&d.srs[id];
        const t=e?e.due:(x.at+86400000);
        if(t<=now)due.push({id,key:k,at:x.at,text:x.text,t:x.t,due:t});
      });
    }
    due.sort((a,b)=>a.due-b.due);
    const ov=document.createElement('div');ov.id='gdi-srs-panel';
    ov.style.cssText='position:fixed;inset:0;z-index:10002;background:rgba(5,7,10,.82);display:flex;align-items:center;justify-content:center;padding:20px;';
    GDI_ROOT().appendChild(ov);
    let idx=0;
    function render(){
      if(idx>=due.length){
        ov.innerHTML='<div style="background:#161b22;border:1px solid #30363d;border-radius:16px;padding:34px;max-width:480px;text-align:center;color:#e6edf3;font-family:system-ui;"><div style="font-size:40px;">\ud83c\udf89</div><h3 style="margin:8px 0">Revis\u00e3o conclu\u00edda!</h3><p style="color:#8b949e;font-size:13px">As anota\u00e7\u00f5es voltam em 1, 7 e 30 dias at\u00e9 ficarem graduadas.</p><br><button class="gdi-mode-btn" id="gdi-srs-close">Fechar</button></div>';
        document.getElementById('gdi-srs-close').addEventListener('click',()=>ov.remove());
        return;
      }
      const n=due[idx];
      let lbl='Aula';try{lbl=decodeURIComponent(String(n.key).split('?')[0].split('/').filter(Boolean).pop()||'Aula').replace(/\.[a-z0-9]+$/i,'')}catch(_){}
      ov.innerHTML=`<div style="background:#161b22;border:1px solid #30363d;border-radius:16px;padding:22px;max-width:540px;width:100%;color:#e6edf3;font-family:system-ui;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <span style="font-size:11px;color:#8b949e;text-transform:uppercase;">\ud83e\uddd0 Revis\u00e3o ${idx+1} de ${due.length}</span>
          <button class="gdi-mode-btn" id="gdi-srs-close" style="padding:2px 8px;font-size:11px;">\u2715</button>
        </div>
        <div style="font-size:12px;color:#7aa2ff;margin-bottom:4px;">${escHtml(realNameOf(n.key))}${n.t!=null?' \u00b7 '+gdiFmtTime(n.t):''}</div>
        <div style="font-size:15px;line-height:1.5;margin-bottom:16px;">${escHtml(n.text)}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button id="gdi-srs-good" class="gdi-btn gdi-btn-primary"><i class="bi bi-check2"></i> Lembrei</button>
          <button id="gdi-srs-again" class="gdi-mode-btn"><i class="bi bi-arrow-repeat"></i> N\u00e3o lembrei</button>
          <a class="gdi-mode-btn" data-gdi-go href="${escHtml(playerHref(n.key))}"><i class="bi bi-play-fill"></i> Abrir aula</a>
        </div></div>`;
      document.getElementById('gdi-srs-close').addEventListener('click',()=>ov.remove());
      document.getElementById('gdi-srs-good').addEventListener('click',()=>{try{GDIUser.srsGrade(n.id,true)}catch(_){}idx++;render();});
      document.getElementById('gdi-srs-again').addEventListener('click',()=>{try{GDIUser.srsGrade(n.id,false)}catch(_){}idx++;render();});
      ov.querySelectorAll('[data-gdi-go]').forEach(a=>a.addEventListener('click',safeGo));
    }
    render();
  }
  function ghostScore(path){
    const seg=normPath(path).split('/').filter(Boolean);
    if(seg.length<2)return 0;
    return seg[seg.length-1].indexOf(seg[seg.length-2]+' - ')===0?1:0;
  }
  function pickCandidates(){
    const d=stateD();if(!d)return[];
    const seen=new Set(),out=[];
    const add=(k,at)=>{
      if(!k)return;
      const key=normPath(k);
      if(seen.has(key)||!inSubtree(k)||!okPath(k))return;
      seen.add(key);
      out.push({path:String(k).split('?')[0],at:Number(at)||0});
    };
    if(d.watched)for(const k in d.watched)add(k,d.watched[k]&&d.watched[k].at);
    if(d.resume)for(const k in d.resume)add(k,d.resume[k]&&d.resume[k].at);
    if(d.last&&d.last.path)add(d.last.path,d.last.at);
    (Array.isArray(d.history)?d.history:[]).forEach(h=>{if(h&&h.path)add(h.path,h.at)});
    out.sort((a,b)=>(ghostScore(a.path)-ghostScore(b.path))||(b.at-a.at));
    return out;
  }
  const vCache=new Map();
  function verify(path){
    if(vCache.has(path))return Promise.resolve(vCache.get(path));
    const pr=fetch(path,{method:'POST',credentials:'same-origin'})
      .then(r=>{vCache.set(path,r.ok);return r.ok})
      .catch(()=>{vCache.set(path,true);return true});
    vCache.set(path,pr);
    return pr;
  }
  async function bestTarget(){
    const cands=pickCandidates();
    for(const c of cands.slice(0,4)){
      if(await verify(c.path))return c.path;
    }
    return null;
  }
  function dbg(){
    const d=stateD();
    return{
      url:window.location.pathname,
      subarvore:subtreePrefix()||'(tudo)',
      gdiUserCarregado:!!(window.GDIUser&&GDIUser.loaded&&GDIUser.loaded()),
      fonteDados:(window.GDIUser&&GDIUser.loaded())?'GDIUser':(rescue?'resgate /userstate':'nenhuma'),
      candidatos:pickCandidates().slice(0,3).map(c=>c.path),
      history:Array.isArray(d&&d.history)?d.history.length:0
    };
  }
  window.gdiM13Debug=function(){const x=dbg();console.log('[GDI M13] diagnóstico:',x);return x;};
  let rendering=false;
  async function continueCardInit(){
    if(rendering)return;
    const d0=stateD();
    if(!d0){
      ensureRescue();
      const n=(continueCardInit.__n=(continueCardInit.__n||0)+1);
      if(n<=12)setTimeout(continueCardInit,750);
      return;
    }
    continueCardInit.__n=0;
    rendering=true;
    try{await renderCard(d0);}
    catch(e){log('erro no render:',e)}
    finally{rendering=false;}
  }
  async function renderCard(d){
    if(document.querySelector('#content .gdi-study'))return;
    const target=await bestTarget();
    if(document.querySelector('#content .gdi-study'))return;
    const host=document.querySelector('#content .gdi-wrap')||document.getElementById('content');
    if(!host)return;
    const p=window.location.pathname;
    const isHome=p==='/'||/^\/\d+:\/?$/.test(p);
    const days=new Set();
    const addDay=ts=>{if(ts)days.add(new Date(ts).toDateString())};
    for(const k in d.watched)addDay(d.watched[k]&&d.watched[k].at);
    for(const k in d.resume)addDay(d.resume[k]&&d.resume[k].at);
    if(d.last)addDay(d.last.at);
    for(const k in d.notes)(d.notes[k]||[]).forEach(n=>addDay(n.at));
    let streak=0;const day=new Date();
    const has=dt=>days.has(dt.toDateString());
    if(!has(day))day.setDate(day.getDate()-1);
    while(has(day)){streak++;day.setDate(day.getDate()-1);}
    let hours=0;
    for(const k in d.resume){const r=d.resume[k]||{};hours+=Math.min(r.t||0,(r.d>0?r.d:r.t)||0)}
    hours/=3600;
    const due=srsDueCount();
    const hMap=new Map();
    (Array.isArray(d.history)?d.history:[]).forEach(h=>{
      if(!h||!h.path||h.path===p||!inSubtree(h.path)||!okPath(h.path))return;
      const k=normPath(h.path);
      const prev=hMap.get(k);
      if(!prev||(Number(h.at)||0)>=(Number(prev.at)||0))hMap.set(k,h);
    });
    const hist=[...hMap.values()].sort((a,b)=>(Number(b.at)||0)-(Number(a.at)||0)).slice(0,6);
    const chips=hist.map(h=>({h,label:realNameOf(h.path)}));
    const cc={};
    chips.forEach(c=>{cc[c.label]=(cc[c.label]||0)+1});
    chips.forEach(c=>{if(cc[c.label]>1)c.label=(c.label+' \u00b7 '+stripExt(c.h.name||'')).slice(0,30)});
    if(!target&&!streak&&!hours&&!hist.length&&!due){
      const old0=document.getElementById('gdi-home-card');
      if(old0)old0.remove();
      log('sem dados utiliz\u00e1veis nesta sub\u00e1rvore \u2014 card oculto',dbg());
      return;
    }
    const lbl=target?nameInfo(target):null;
    const rKey=target?resumeKeyFor(target):'';
    const r=target?getResumeOf(d,rKey):null;
    const canSrs=!!(window.GDIUser&&typeof GDIUser.srsGrade==='function');
    const sig=String(target)+'|'+hist.map(h=>normPath(h.path)).join(',')+'|'+due+'|'+streak;
    const old=document.getElementById('gdi-home-card');
    if(old&&continueCardInit.__sig===sig)return;
    continueCardInit.__sig=sig;
    if(old)old.remove();
    const btn=target?`<a class="gdi-btn gdi-btn-primary" data-gdi-go href="${escHtml(playerHref(target))}"><i class="bi bi-play-fill"></i> Retomar</a>`:'';
    let html='<div id="gdi-home-card" class="gdi-panel" style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;padding:12px 16px;margin-bottom:14px;">';
    if(target){
      let head;
      if(lbl.drive)head='Continuar em '+lbl.drive+(lbl.folder?' \u2192 '+lbl.folder:'');
      else if(lbl.folder)head='Continuar em '+lbl.folder;
      else head='Continuar';
      const sub=r?('parou em '+gdiFmtTime(r.t)):'sem posi\u00e7\u00e3o salva';
      html+=`<div style="display:flex;align-items:center;gap:12px;min-width:0;flex:1;">
        <i class="bi bi-play-circle-fill" style="font-size:30px;color:#7aa2ff;"></i>
        <div style="min-width:0;">
          <div style="font-size:11px;color:#8b949e;text-transform:uppercase;letter-spacing:.06em;">${escHtml(head)}</div>
          <div style="font-weight:600;color:#f0f6fc;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(lbl.name)}</div>
          <div style="font-size:12px;color:#8b949e;">${escHtml(sub)}</div>
        </div></div>${btn}`;
    }
    if(isHome){
      html+=`<div style="display:flex;gap:16px;font-size:12px;color:#8b949e;flex-wrap:wrap;">
        ${streak>0?`<span><i class="bi bi-fire" style="color:#ff922b;"></i> ${streak} dia${streak>1?'s':''} seguidos</span>`:''}
        ${hours>0?`<span><i class="bi bi-clock-history"></i> \u2248 ${String(hours.toFixed(1)).replace('.',',')}h assistidas</span>`:''}
      </div>`;
      if(due>0&&canSrs)html+=`<div style="flex-basis:100%;margin-top:2px;"><button id="gdi-srs-open" class="gdi-mode-btn" style="font-size:12px;"><i class="bi bi-mortarboard-fill" style="color:#ffd43b;"></i> Revisar ${due} anota\u00e7\u00e3${due>1?'\u00f5es':'o'} de hoje</button></div>`;
    }else if(streak>0){
      html+=`<span style="font-size:12px;color:#8b949e;"><i class="bi bi-fire" style="color:#ff922b;"></i> ${streak} dia${streak>1?'s':''}</span>`;
    }
    if(chips.length){
      html+=`<div style="flex-basis:100%;display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:2px;">
        <span style="font-size:11px;color:#8b949e;">Recentes aqui:</span>
        ${chips.map(c=>`<a class="gdi-mode-btn" data-gdi-go style="padding:2px 8px;font-size:11px;" href="${escHtml(playerHref(c.h.path))}" title="${escHtml(normPath(c.h.path))}">${escHtml(c.label.slice(0,26))}</a>`).join('')}
      </div>`;
    }
    html+='</div>';
    host.insertAdjacentHTML('afterbegin',html);
    // ★FIX: listeners presos ao CARD (antes pegava todos [data-gdi-go] do wrapper)
    const card=document.getElementById('gdi-home-card');
    if(card){
      card.querySelectorAll('[data-gdi-go]').forEach(a=>a.addEventListener('click',safeGo));
      card.querySelector('#gdi-srs-open')?.addEventListener('click',srsOpen);
    }
    log('card renderizado \u2014 alvo verificado:',target||'(nenhum)','| nome:',lbl?lbl.name:'-');
  }
  window.GDI_MODULES.push({name:'continue-card',init:continueCardInit});
  Bus.onGlobal('user:ready',()=>setTimeout(continueCardInit,50));
  Bus.onGlobal('video:switched',()=>{
    if(!(window.GDIUser&&GDIUser.loaded())&&Date.now()-rescueAt>15000)ensureRescue(true);
    setTimeout(continueCardInit,250);
  });
  log('v19.6-fix registrado');
})();

// ═══ M14: PROGRESSOS ═══
(function(){
  let busy=false;
  function modProgress(){
    if(!GDIUser.loaded())return;
    const rows=[...document.querySelectorAll('#list a.gdi-row')]
      .filter(a=>a.querySelector('.gdi-row-icon i.bi-folder-fill')&&!a.querySelector('.gdi-modprog'))
      .slice(0,30);
    (async()=>{
      for(const row of rows){
        if(!document.body.contains(row))return;
        const href=row.getAttribute('href')||'';
        if(!href||href.startsWith('/fallback'))continue;
        const files=await gdiListAllFiles(href,gdiGetPw(href));
        if(!document.body.contains(row))continue;
        let total=0,done=0;
        for(const f of files){
          if(f.mimeType==='application/vnd.google-apps.folder')continue;
          if(!FILE_TYPES.video.includes((f.fileExtension||'').toLowerCase()))continue;
          if(/\.part-/i.test(f.name))continue;
          const bytes=Number(f.size)||0;if(bytes>0&&bytes<1024*1024)continue;
          total++;
          try{if(GDIUser.isWatched(href+encodeURIComponent(f.name)))done++;}catch(_){}
        }
        if(total>0&&document.body.contains(row)){
          const pct=Math.round(done/total*100);
          const el=document.createElement('span');
          el.className='gdi-modprog';
          el.innerHTML=`<b>${done}/${total}</b> \u00b7 ${pct}%`;
          el.title='Progresso de v\u00eddeos nesta pasta';
          row.querySelector('.gdi-row-acts')?.appendChild(el);
        }
        await sleep(40);
      }
    })();
  }
  function line(){
    const countEl=document.getElementById('count');
    if(!countEl||!countEl.classList.contains('show')){document.getElementById('gdi-progress-line')?.remove();return;}
    const rows=document.querySelectorAll('#list div.gdi-row');
    let done=0,total=0,firstTodo='';
    rows.forEach(row=>{
      if(!row.querySelector('.gdi-row-icon i.bi-camera-video-fill'))return;
      const a=row.querySelector('a.gdi-row-name');if(!a)return;
      const href=a.getAttribute('href')||'';
      if(href.startsWith('/fallback'))return;
      total++;
      let w=false;try{w=GDIUser.isWatched(href.split('?')[0])}catch(_){}
      if(w)done++;else if(!firstTodo)firstTodo=href;
    });
    const hasFolders=!!document.querySelector('#list a.gdi-row .gdi-row-icon i.bi-folder-fill');
    const el0=document.getElementById('gdi-progress-line');
    if((!total&&!hasFolders)||!GDIUser.loaded()){if(el0)el0.remove();return;}
    let el=el0;
    if(!el){el=document.createElement('div');el.id='gdi-progress-line';countEl.insertAdjacentElement('afterend',el);}
    let html='';
    if(total){
      const pct=Math.round(done/total*100);
      html+=`<i class="bi bi-bar-chart-fill" style="color:#7aa2ff;"></i>
        <span>${done}/${total} assistido${done===1?'':'s'} (${pct}%)</span>
        <div style="flex:1;max-width:160px;height:5px;background:rgba(255,255,255,.1);border-radius:3px;overflow:hidden;">
          <div style="height:5px;width:${pct}%;background:${pct>=100?'#1a7f37':'#1f6feb'};transition:width .4s;"></div>
        </div>`;
      if(firstTodo)html+=`<button id="gdi-next-lesson" class="gdi-mode-btn" style="padding:2px 8px;font-size:11px;" data-href="${escHtml(firstTodo)}" title="Abrir a primeira aula ainda n\u00e3o assistida"><i class="bi bi-play-fill"></i> N\u00e3o assistida</button>`;
    }
    if(hasFolders)html+=`<button id="gdi-course-btn" class="gdi-mode-btn" style="padding:2px 8px;font-size:11px;" title="Somar o progresso de TODAS as subpastas"><i class="bi bi-diagram-3"></i> Progresso do curso</button>`;
    el.innerHTML=html;
    el.querySelector('#gdi-next-lesson')?.addEventListener('click',function(){location.href=this.dataset.href;});
    el.querySelector('#gdi-course-btn')?.addEventListener('click',course);
  }
  async function course(){
    if(busy)return;busy=true;
    const btn=document.getElementById('gdi-course-btn');
    if(btn){btn.disabled=true;btn.innerHTML='<i class="bi bi-hourglass-split"></i> calculando\u2026';}
    try{
      const folders=[...document.querySelectorAll('#list a.gdi-row')]
        .filter(a=>a.querySelector('.gdi-row-icon i.bi-folder-fill'))
        .map(a=>a.getAttribute('href')||'')
        .filter(h=>h&&!h.startsWith('/fallback'));
      let done=0,total=0;
      const root=trimChar(window.location.pathname,'/')+'/';
      const bases=[root,...folders.map(f=>f.endsWith('/')?f:f+'/')];
      for(const base of bases){
        const files=await gdiListAllFiles(base,gdiGetPw(base));
        for(const f of files){
          if(f.mimeType==='application/vnd.google-apps.folder')continue;
          if(!FILE_TYPES.video.includes((f.fileExtension||'').toLowerCase()))continue;
          if(/\.part-/i.test(f.name))continue;
          const bytes=Number(f.size)||0;if(bytes>0&&bytes<1024*1024)continue;
          total++;
          try{if(GDIUser.isWatched(base+encodeURIComponent(f.name)))done++;}catch(_){}
        }
      }
      const line=document.getElementById('gdi-progress-line');
      if(line){
        const pct=total?Math.round(done/total*100):0;
        line.insertAdjacentHTML('beforeend',`<span style="color:#e6edf3;"><i class="bi bi-mortarboard-fill" style="color:#3fb950;"></i> Curso: <b>${done}/${total}</b> aulas (${pct}%)</span>`);
        if(btn)btn.remove();
      }
    }catch(_){showToast('N\u00e3o foi poss\u00edvel calcular o progresso do curso');}
    finally{busy=false;}
  }
  window.GDI_MODULES.push({name:'progress',init:function(){
    const c=document.getElementById('count');
    if(c&&!c.__m14){c.__m14=true;
      // ★FIX: desconecta o observer da página anterior (vazamento por página)
      if(window.__gdiM14obs){try{window.__gdiM14obs.disconnect()}catch(_){}}
      const obs=new MutationObserver(()=>line());
      obs.observe(c,{childList:true,characterData:true,subtree:true});
      window.__gdiM14obs=obs;}
    line();modProgress();
  }});
  Bus.onGlobal('user:ready',()=>{try{line()}catch(_){}});
})();

// ═══ M16: PWA best-effort ═══
(function(){
  try{
    if(!document.querySelector('link[rel="manifest"]')){
      const origin=window.location.origin;
      const MAN={name:(document.siteName||'Drive')+' Estudos',short_name:'Estudos',start_url:origin+'/',scope:origin+'/',display:'standalone',background_color:'#0b0e14',theme_color:'#0b0e14',icons:[]};
      const l=document.createElement('link');l.rel='manifest';
      l.href=URL.createObjectURL(new Blob([JSON.stringify(MAN)],{type:'application/manifest+json'}));
      document.head.appendChild(l);
    }
  }catch(_){}
  if('serviceWorker' in navigator&&location.protocol==='https:'){
    navigator.serviceWorker.register('/gdi-sw.js',{scope:'/'})
      .then(()=>console.log('[GDI PWA] offline ativo'))
      .catch(()=>console.log('[GDI PWA] offline opcional desativado'));
  }
})();

// ═══ M17: VISUALIZADOR DE PDF (pdf.js) ═══
(function(){
  window.file_pdf = function(i,e,t,n,a,c){
    const l=`<div class="gdi-wrap">
  <div class="gdi-viewer">
    <div class="gdi-breadcrumb-wrap"><ol class="gdi-bc">${_viewerBreadcrumb()}</ol></div>
    <div class="gdi-viewer-card">
      <div class="gdi-file-header">
        <span class="gdi-file-header-icon"><i class="bi bi-file-earmark-pdf-fill gdi-icon-pdf"></i></span>
        <div class="gdi-file-header-info">
          <div class="gdi-file-header-name">${escHtml(i)}</div>
          <div class="gdi-file-header-meta">${escHtml(t)}</div>
        </div>
      </div>
      <div class="gdi-viewer-body no-pad">
        <div class="gdi-pdf-controls">
          <button id="pdf-prev" class="gdi-btn gdi-btn-ghost gdi-btn-icon"><i class="bi bi-chevron-left"></i></button>
          <span style="font-size:13px;color:var(--gdi-text-muted);">Page <span id="pdf-page-num">1</span> / <span id="pdf-page-count">?</span></span>
          <button id="pdf-next" class="gdi-btn gdi-btn-ghost gdi-btn-icon"><i class="bi bi-chevron-right"></i></button>
          <input id="pdf-zoom" type="range" min="50" max="200" value="100" style="width:100px;" title="Zoom">
          <span id="pdf-zoom-val">100%</span>
        </div>
        <div style="padding:16px;">
          <div id="pdf-spinner" class="gdi-spinner-wrap"><div class="gdi-spinner"></div></div>
          <canvas id="pdf-canvas" style="max-width:100%;display:block;margin:auto;"></canvas>
        </div>
      </div>
      <div class="gdi-viewer-footer">${renderDownloadButtons(n,e)}</div>
    </div>
  </div>
</div>`;
    $("#content").html(l);
    let d=null,o=1,s=1;
    function r(){
      const p=document.getElementById("pdf-canvas"),g=p.getContext("2d");
      pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";
      function f(u){
        d.getPage(u).then(function(h){
          const m=h.getViewport({scale:s});
          p.height=m.height,p.width=m.width,
          h.render({canvasContext:g,viewport:m}).promise.then(function(){
            $("#pdf-spinner").hide();
          }),
          document.getElementById("pdf-page-num").textContent=u;
        });
      }
      pdfjsLib.getDocument(n).promise.then(function(u){
        d=u,document.getElementById("pdf-page-count").textContent=u.numPages,f(o);
      }).catch(function(u){
        $("#pdf-spinner").html(`<div class="gdi-alert gdi-alert-error">Could not load PDF: ${u.message}</div>`);
      }),
      document.getElementById("pdf-prev").addEventListener("click",function(){o>1&&(o--,f(o))}),
      document.getElementById("pdf-next").addEventListener("click",function(){d&&o<d.numPages&&(o++,f(o))}),
      document.getElementById("pdf-zoom").addEventListener("input",function(){s=parseInt(this.value)/100,document.getElementById("pdf-zoom-val").textContent=this.value+"%",f(o)});
    }
    if(typeof pdfjsLib<"u")r();
    else{
      const p=document.createElement("script");
      p.src="https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js",
      p.onload=r,
      p.onerror=function(){$("#pdf-spinner").html('<div class="gdi-alert gdi-alert-error">Failed to load PDF viewer.</div>')},
      document.head.appendChild(p);
    }
  };
})();

// ═══ M18: PAINEL DE DEBUG ═══
const GDIDebug=(()=>{const i=[];let e=null;function t(){return new Date().toISOString().slice(11,23)}function n(){if(e||(e=document.getElementById("gdi-debug-log")),!e)return;const d={req:"#da77f2",api:"#69db7c",error:"#ff6b6b",warn:"#ffa94d",info:"#74c0fc"},o=i.map(r=>{const p=d[r.type]||"#aaa",g=r.data!=null?typeof r.data=="string"?r.data:JSON.stringify(r.data,null,2):"";return`<div class="gdi-dbg-entry"><span class="gdi-dbg-ts">${r.ts}</span><span class="gdi-dbg-badge" style="color:${p}">[${r.type.toUpperCase()}]</span><span class="gdi-dbg-msg">${escHtml(r.label)}</span>`+(g?`<pre class="gdi-dbg-pre">${escHtml(g)}</pre>`:"")+"</div>"}).join("");e.innerHTML=o||'<span class="gdi-dbg-empty">No entries yet.</span>',e.scrollTop=e.scrollHeight;const s=document.getElementById("gdi-dbg-count");s&&(s.textContent=i.length)}function a(d,o,s){window.UI?.debug_mode&&(i.push({ts:t(),type:d,label:o,data:s!==void 0?s:null}),n())}function c(){e=document.getElementById("gdi-debug-log"),i.length>0&&n(),a("info","Debug attached",{path:window.location.pathname,search:window.location.search,drive:window.current_drive_order,version:window.UI?.version,model_type:window.MODEL?.root_type})}function l(){i.length=0,e&&(e.innerHTML='<span class="gdi-dbg-empty">Cleared.</span>');const d=document.getElementById("gdi-dbg-count");d&&(d.textContent="0")}return{log:a,attach:c,clear:l}})();
window.GDIDebug=GDIDebug;

if(window.UI?.debug_mode){const i=window.fetch.bind(window);window.fetch=async function(t,n){const a=typeof t=="string"?t:t.url||String(t),c=(n?.method||"GET").toUpperCase();let l;try{l=n?.body?JSON.parse(n.body):void 0}catch{l=n?.body}GDIDebug.log("req",`\u2192 ${c} ${a}`,l!==void 0?l:null);const d=Date.now();try{const o=await i(t,n),s=o.clone();let r;try{r=await s.json()}catch{r=null}return GDIDebug.log(o.ok?"api":"error",`\u2190 ${o.status} ${a} (${Date.now()-d}ms)`,r),o}catch(o){throw GDIDebug.log("error",`\u2717 FETCH FAILED: ${a}`,String(o)),o}};const e=console.error.bind(console);console.error=function(...t){GDIDebug.log("error",t.map(n=>n instanceof Error?n.stack||n.message:typeof n=="object"?JSON.stringify(n):String(n)).join(" ")),e(...t)},window.addEventListener("error",t=>{GDIDebug.log("error",`Uncaught: ${t.message}`,`${t.filename}:${t.lineno}:${t.colno}`)}),window.addEventListener("unhandledrejection",t=>{GDIDebug.log("error",`UnhandledPromise: ${String(t.reason)}`)})}

window.GDI_MODULES.push({name:'debug',init:function(){
  if(!(window.UI&&window.UI.debug_mode))return;
  if(document.getElementById('gdi-debug-wrap'))return;
  const wrap=document.createElement('div');
  wrap.className='gdi-debug-wrap';wrap.id='gdi-debug-wrap';
  wrap.innerHTML=`<div class="gdi-debug-head" onclick="document.getElementById('gdi-debug-log').classList.toggle('collapsed')">
    <strong><i class="bi bi-bug-fill" style="color:#f0883e;"></i> GDI Debug <span id="gdi-dbg-count" class="gdi-dbg-count">0</span></strong>
    <div class="gdi-debug-actions">
      <button onclick="event.stopPropagation();GDIDebug.clear()">Clear</button>
      <button onclick="event.stopPropagation();document.getElementById('gdi-debug-log').classList.toggle('collapsed')">Toggle</button>
    </div></div>
  <div id="gdi-debug-log" class="collapsed"></div>`;
  GDI_ROOT().appendChild(wrap);
  try{GDIDebug.attach()}catch(_){}
}});

// ═══ M19: TÍTULO LIMPO DA ABA ═══
(function(){
  const MAX=64;
  const POMO=/^\d\d:\d\d\s+[^\s\u00b7]+\s+\u00b7\s+/;
  const dec=s=>{try{return decodeURIComponent(String(s||''))}catch(_){return String(s||'')}};
  const clean=s=>dec(s).replace(/\s+/g,' ').trim();
  function segs(p){return clean(String(p||'').split('?')[0]).split('/').filter(Boolean)}
  function build(name,parent){
    name=(name||'').replace(/\.[a-z0-9]{1,5}$/i,'').trim();
    parent=(parent&&!/^\d+:$/.test(parent))?parent:'';
    let t=parent?parent+' \u00b7 '+name:name;
    if(t.length>MAX)t=(name||'').slice(0,MAX);
    return t;
  }
  function fromPlaylist(){
    try{
      const pv=window.playlistVideos,ci=window.currentIndex;
      if(pv&&typeof ci==='number'&&ci>=0&&pv[ci]){
        const m=pv[ci];
        const ps=segs(m.pageUrl||'');
        return build(clean(m.name||m.origName||''),ps.length>=2?ps[ps.length-2]:'');
      }
    }catch(_){}
    return null;
  }
  function fromUrl(){
    const seg=segs(window.location.pathname);
    if(!seg.length)return null;
    const first=seg[0]||'';
    if(first.indexOf(':')!==-1&&!/^\d+:$/.test(first))return null;
    if(/^\d+:$/.test(first)){
      if(seg.length===1){
        const dn=window.drive_names&&window.drive_names[parseInt(first,10)];
        return dn||null;
      }
      return build(seg[seg.length-1],seg.length>=3?seg[seg.length-2]:'');
    }
    return null;
  }
  function apply(){
    try{
      const cur=document.title||'';
      if(POMO.test(cur))return;
      const next=fromPlaylist()||fromUrl();
      if(!next||next===cur)return;
      document.title=next;
    }catch(_){}
  }
  function bindTitle(){
    const el=document.querySelector('title');
    if(!el){setTimeout(bindTitle,400);return;}
    new MutationObserver(apply).observe(el,{childList:true,characterData:true,subtree:true});
  }
  bindTitle();
  setInterval(apply,1500);
  Bus.onGlobal('page:change',apply);
  Bus.onGlobal('title:change',apply);
  Bus.onGlobal('video:switched',()=>setTimeout(apply,150));
  Bus.onGlobal('media:ready',apply);
  window.GDI_MODULES.push({name:'clean-title',init:apply});
  apply();
  console.log('[GDI M19] t\u00edtulo limpo ativo');
})();

// ═══ M20: PLAYLIST — SEM OBSERVER (★ o fix do congelamento) ═══
// O MutationObserver que vivia aqui se auto-disparava infinitamente
// quando o render demorava >150ms (playlists grandes) — era o loop
// que travava a aba para sempre. Removido. Re-render só via Bus.
// Também: teto de 600 itens no DOM e UM listener delegado.
(function(){
  const LS_OPEN='gdi-playlist-open',LS_HIDE='gdi-hide-watched',PL_CAP=600;
  const norm=p=>{try{return decodeURIComponent(String(p||'').split('?')[0])}catch(_){return String(p||'').split('?')[0]}};
  window.gdiNormKey=norm;
  window.gdiVideoKey=function(){
    try{const pv=window.playlistVideos,ci=window.currentIndex;
      if(pv&&typeof ci==='number'&&ci>=0&&pv[ci]&&pv[ci].pageUrl)return pv[ci].pageUrl.split('?')[0];
    }catch(_){}
    return window.location.pathname;
  };
  window.gdiMarkVideo=function(){
    try{GDIUser.markWatched(norm(window.gdiVideoKey()))}catch(_){}
    try{GDIUser.markWatched(window.location.pathname)}catch(_){}
    Bus.emit('watched:changed');
  };
  window.gdiUnmarkVideo=function(){
    [window.gdiVideoKey(),window.location.pathname].forEach(k=>{
      try{GDIUser.unmarkWatched(k);GDIUser.unmarkWatched(norm(k))}catch(_){}
    });
    Bus.emit('watched:changed');
  };
  function isW(m){
    const raw=(m.pageUrl||'').split('?')[0];
    try{return GDIUser.isWatched(raw)||GDIUser.isWatched(norm(raw))}catch(_){return false}
  }
  function items(){return window.playlistVideos||[]}
  function cur(){const i=window.currentIndex;return(typeof i==='number'&&i>=0)?i:-1}
  function parentPath(){return window.location.pathname.split('/').slice(0,-2).join('/')+'/'}
  function healKeys(){
    const i=cur();if(i<0)return;const m=items()[i];if(!m)return;
    const raw=(m.pageUrl||'').split('?')[0];
    let a=false,b=false,c=false;
    try{a=GDIUser.isWatched(raw);b=GDIUser.isWatched(norm(raw));c=GDIUser.isWatched(window.location.pathname)}catch(_){}
    try{if((a||b)&&!c)GDIUser.markWatched(window.location.pathname);
        if(c&&!(a||b))GDIUser.markWatched(norm(raw));}catch(_){}
  }
  function renderItems(){
    const list=document.getElementById('gdi-playlist-list');
    if(!list)return;
    const pv=items(),ci=cur();
    if(!pv.length){list.innerHTML='<div class="gdi-notes-empty">Nenhuma aula encontrada.</div>';return;}
    const hide=localStorage.getItem(LS_HIDE)==='1';
    const shown=pv.length>PL_CAP?pv.slice(0,PL_CAP):pv;
    let h='';
    shown.forEach((m,idx)=>{
      const w=isW(m),c=idx===ci;
      if(hide&&w&&!c)return;
      const nm=m.name||m.origName||'(sem nome)';
      h+=`<div class="gdi-playlist-item${c?' cur':''}${w&&!c?' watched':''}" data-idx="${idx}" title="${escHtml(nm)}">
        <div><i class="bi bi-${c?'play-fill':w?'check-circle-fill':'film'} me-2"></i><span style="font-weight:${c?'600':'400'};">${escHtml(nm)}</span></div>
        <span class="gdi-pl-size">${w?'\u2713 ':''}${escHtml(m.size||'')}</span>
      </div>`;
    });
    if(pv.length>shown.length)h+=`<div style="padding:6px 12px;font-size:11px;color:#8b949e;">\u2026 +${pv.length-shown.length} aulas (Pr\u00f3xima/Anterior e a tecla J alcan\u00e7am todas)</div>`;
    list.innerHTML=h||'<div class="gdi-notes-empty">Todas assistidas (filtro ativo).</div>';
    if(pv[ci]){const el=list.querySelector('.gdi-playlist-item[data-idx="'+ci+'"]');
      if(el)try{el.scrollIntoView({block:'nearest'})}catch(_){}}
  }
  function renderMeta(){
    const pv=items(),ci=cur();
    const cnt=document.getElementById('gdi-pl-count')||document.getElementById('gdi-playlist-count');
    if(cnt)cnt.textContent=pv.length?`${ci+1} / ${pv.length}`:'';
  }
  function syncWatchedBtn(){
    const wb=document.getElementById('gdi-watched-btn');if(!wb)return;
    let done=false;
    try{done=GDIUser.isWatched(window.gdiVideoKey())||GDIUser.isWatched(norm(window.gdiVideoKey()))||GDIUser.isWatched(window.location.pathname)}catch(_){}
    wb.classList.toggle('done',done);
    wb.innerHTML=done?'<i class="bi bi-eye-fill"></i><span>Assistida \u2713</span>':'<i class="bi bi-eye"></i><span>Assistido</span>';
  }
  function refreshAll(){healKeys();renderItems();renderMeta();syncWatchedBtn();}
  function downloadJSON(){
    const pv=items();
    if(pv.length<2){showToast('Playlist muito curta para exportar');return;}
    const data=pv.map(v=>({n:v.origName||v.name,f:v.folderLabel||null,
      s:v.sizeBytes||0,l:v.rawLink||'',m:v.mimeType||'',fd:v.folder||'',t:v.thumbRaw||''}));
    const blob=new Blob([JSON.stringify(data,null,1)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='playlist.json';
    GDI_ROOT().appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),5000);
    showToast('playlist.json baixado \u2014 suba na pasta SUPERIOR do curso');
  }
  function ensureUI(){
    let wrap=document.getElementById('gdi-playlist-wrap');
    if(!wrap){
      // ★FIX: app.min.js modular usa slots vazios (#gdi-slot-left) sem o
      // markup da playlist. Cria o wrap dentro do slot se não existir.
      const slot=document.getElementById('gdi-slot-left')||document.querySelector('.gdi-study-left');
      if(!slot)return null;
      wrap=document.createElement('div');
      wrap.id='gdi-playlist-wrap';
      slot.appendChild(wrap);
    }
    if(wrap.dataset.m20)return wrap;
    wrap.dataset.m20='1';
    wrap.innerHTML=`
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;gap:6px;flex-wrap:wrap;">
      <button id="gdi-pl-toggle" class="gdi-mode-btn" style="padding:4px 10px;font-size:12px;flex:1;justify-content:flex-start;min-width:0;" title="Mostrar/ocultar a playlist">
        <i class="bi bi-collection-play me-2"></i><strong style="font-size:13px;">Playlist</strong>
        <span id="gdi-pl-count" style="font-size:11px;color:#8b949e;margin-left:6px;"></span>
        <i id="gdi-pl-chev" class="bi bi-chevron-down" style="margin-left:auto;"></i>
      </button>
      <button id="gdi-pl-filter" class="gdi-mode-btn" style="padding:4px 9px;font-size:11px;" title="Esconder aulas j\u00e1 assistidas"><i class="bi bi-funnel"></i></button>
      <button id="gdi-pl-reload" class="gdi-mode-btn" style="padding:4px 9px;font-size:11px;" title="Descartar o cache e reescanear as pastas"><i class="bi bi-arrow-clockwise"></i></button>
      <button id="gdi-pl-json" class="gdi-mode-btn" style="padding:4px 9px;font-size:11px;" title="Baixar playlist.json"><i class="bi bi-filetype-json"></i></button>
    </div>
    <div id="gdi-playlist-body" style="overflow-y:auto;border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:6px;background:rgba(0,0,0,.2);max-height:240px;">
      <div id="gdi-playlist-list"></div>
    </div>`;
    const body=wrap.querySelector('#gdi-playlist-body');
    const chev=wrap.querySelector('#gdi-pl-chev');
    const setOpen=v=>{
      body.style.display=v?'block':'none';
      chev.className='bi bi-chevron-'+(v?'up':'down');
      try{localStorage.setItem(LS_OPEN,v?'1':'0')}catch(_){}
    };
    let open=false;try{open=localStorage.getItem(LS_OPEN)==='1'}catch(_){}
    setOpen(open);
    wrap.querySelector('#gdi-pl-toggle').addEventListener('click',()=>setOpen(body.style.display==='none'));
    const fBtn=wrap.querySelector('#gdi-pl-filter');
    const fSync=()=>{const on=localStorage.getItem(LS_HIDE)==='1';
      fBtn.classList.toggle('active',on);
      fBtn.innerHTML='<i class="bi bi-funnel'+(on?'-fill':'')+'"></i>';};
    fBtn.addEventListener('click',()=>{
      const on=localStorage.getItem(LS_HIDE)==='1';
      localStorage.setItem(LS_HIDE,on?'0':'1');fSync();renderItems();});
    fSync();
    wrap.querySelector('#gdi-pl-reload').addEventListener('click',()=>{
      try{localStorage.removeItem('gdi-xpl::'+(window.location.host||'')+'::'+parentPath())}catch(_){}
      try{Object.keys(sessionStorage).forEach(k=>{if(k.indexOf('gdi-pljson-probe')===0)sessionStorage.removeItem(k)})}catch(_){}
      showToast('Cache apagado \u2014 reescaneando\u2026');
      setTimeout(()=>location.reload(),600);
    });
    wrap.querySelector('#gdi-pl-json').addEventListener('click',downloadJSON);
    return wrap;
  }
  window.GDI_MODULES.push({name:'playlist-ui',init:function(){
    // ★FIX: roda em qualquer página de vídeo (tem #gdi-slot-left ou
    // #gdi-study), não exige #gdi-playlist-wrap pré-existente.
    const slot=document.getElementById('gdi-slot-left')||document.querySelector('.gdi-study-left');
    const existing=document.getElementById('gdi-playlist-wrap');
    if(!slot&&!existing)return;
    ensureUI();
    const list=document.getElementById('gdi-playlist-list');
    // ★FIX: UM listener delegado no container (era 1 por aula + observer infinito)
    if(list&&!list.__m20deleg){
      list.__m20deleg=true;
      list.addEventListener('click',e=>{
        const it=e.target.closest('.gdi-playlist-item');
        if(!it)return;
        const k=parseInt(it.dataset.idx,10);
        if(!isNaN(k)&&items()[k]&&window.switchVideo)window.switchVideo(k);
      });
    }
    refreshAll();
  }});
  // ★FIX: polling — buildPlaylist() no app.min.js é assíncrono; quando
  // ele popula window.playlistVideos, o init já rodou. Re-renderiza
  // quando detecta mudança no tamanho da playlist.
  let _plLen=-1,_plPoll=0;
  function _plPollFn(){
    const n=items().length;
    if(n!==_plLen){
      _plLen=n;
      if(n>0){ensureUI();refreshAll();}
    }
    if(++_plPoll<80&&_plPoll<80)setTimeout(_plPollFn,750); // ~60s
  }
  setTimeout(_plPollFn,500);
  Bus.onGlobal('watched:changed',()=>setTimeout(refreshAll,30));
  Bus.onGlobal('video:switched',()=>setTimeout(refreshAll,120));
  Bus.onGlobal('user:ready',()=>setTimeout(refreshAll,60));
})();

// ═══ M22 v2: CENTRAL DE ESTUDOS — painel + botão FORA do body ═══
(function(){
  const LS_CARDS='gdi-cards-v1',LS_GOAL='gdi-goal-min',LS_WATCH='gdi-watch-v1',LS_MAR='gdi-marathon',LS_MARINTRO='gdi-marathon-intro';
  const log=(...a)=>{try{console.log('[GDI M22]',...a)}catch(_){}};
  const dec=s=>{try{return decodeURIComponent(String(s||''))}catch(_){return String(s||'')}};
  const norm=p=>dec(String(p||'').split('?')[0].replace(/\/+$/,''));
  const low=p=>norm(p).toLowerCase();
  const stripExt=s=>String(s||'').replace(/\.[a-z0-9]{1,5}$/i,'').trim();
  const lsGet=(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(_){return d}};
  const lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}};
  const fmtMin=m=>{m=Math.round(m);return m>=60?Math.floor(m/60)+'h'+String(m%60).padStart(2,'0'):m+'min'};
  const dayKey=t=>{const d=new Date(t||Date.now());return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
  const dateBr=t=>new Date(t).toLocaleDateString('pt-BR');
  let rescue=null,rescueAt=0;
  function ensureState(){
    if(rescue&&Date.now()-rescueAt<60000)return Promise.resolve(rescue);
    return fetch('/userstate',{credentials:'same-origin'}).then(r=>r.ok?r.json():null).then(j=>{
      if(j&&typeof j==='object'){rescue=j;rescueAt=Date.now();}
      return rescue;
    }).catch(()=>rescue);
  }
  function stateD(){
    try{if(window.GDIUser&&GDIUser.loaded()){const d=GDIUser.dump();if(d)return d;}}catch(_){}
    return rescue;
  }
  function watchedLow(d){
    const s=new Set();const w=(d&&d.watched)||{};
    for(const k in w)s.add(low(k));
    return s;
  }
  function courseKeyOf(p){
    const seg=norm(p).split('/').filter(Boolean);
    if(!seg.length||!/^\d+:$/.test(seg[0]))return null;
    if(seg.length<=2)return seg[0];
    return [seg[0],...seg.slice(1,-1).slice(0,2)].join('/');
  }
  const courseName=ck=>ck.split('/').filter(Boolean).slice(1).join(' / ')||ck;
  function driveNameOf(ck){
    const m=/^\/(\d+):/.exec(ck||'');
    return(window.drive_names&&m&&window.drive_names[+m[1]])||'';
  }
  function collectCourses(){
    const d=stateD()||{};
    const map=new Map();
    const add=(p,at,wd)=>{
      const ck=courseKeyOf(p);if(!ck)return;
      let c=map.get(ck);
      if(!c){c={key:ck,lastAt:0,lessons:new Set(),watched:0};map.set(ck,c);}
      c.lessons.add(low(p));
      if(wd)c.watched++;
      const a=Number(at)||0;if(a>c.lastAt)c.lastAt=a;
    };
    const w=(d&&d.watched)||{},r=(d&&d.resume)||{};
    for(const k in w)add(k,w[k]&&w[k].at,true);
    for(const k in r)add(k,r[k]&&r[k].at,false);
    (Array.isArray(d.history)?d.history:[]).forEach(h=>{if(h&&h.path)add(h.path,h.at,false)});
    return [...map.values()].filter(c=>c.lessons.size).sort((a,b)=>b.lastAt-a.lastAt);
  }
  const GW=/^(aula|aulas|v\u00eddeo|videos?|li[cç][aã]o|li[cç][oõ]es|licoes|lesson|class|modulo|m\u00f3dulo|module|parte|pt|cap|capitulo|ext|ep|live|arquivo|file)$/i;
  function isGeneric(n){
    n=stripExt(n).toLowerCase();if(!n)return true;
    return n.replace(/[\s\-_.:,;|()/\\]+/g,' ').split(' ')
      .filter(w2=>w2&&!/^\d+$/.test(w2)&&!GW.test(w2)&&!GW.test(w2.replace(/\d+$/,''))).join('')==='';
  }
  function realName(p){
    const seg=norm(p).split('/').filter(Boolean);
    let nm=stripExt(seg[seg.length-1]||'');
    if(isGeneric(nm))for(let j=seg.length-2;j>=0;j--){
      if(/^\d+:$/.test(seg[j]))break;
      if(!isGeneric(seg[j])){nm=stripExt(seg[j]);break;}
    }
    return nm||'Aula';
  }
  const vCache=new Map();
  function exists(p){
    if(vCache.has(p))return Promise.resolve(vCache.get(p));
    const pr=fetch(String(p).split('?')[0],{method:'POST',credentials:'same-origin'})
      .then(r2=>{vCache.set(p,r2.ok);return r2.ok})
      .catch(()=>{vCache.set(p,true);return true});
    vCache.set(p,pr);return pr;
  }
  const ghost=p=>{const s=norm(p).split('/').filter(Boolean);return s.length>=2&&s[s.length-1].indexOf(s[s.length-2]+' - ')===0;};
  function bestIn(courseKey){
    const d=stateD();
    if(!d)return Promise.resolve(null);
    const pre=low(courseKey);
    const inC=p=>{const l=low(p);return l===pre||l.indexOf(pre+'/')===0;};
    const cands=[],seen=new Set();
    const add=(k,at)=>{
      if(!k)return;const key=low(k);
      if(seen.has(key)||!inC(k))return;seen.add(key);
      cands.push({path:String(k).split('?')[0],at:Number(at)||0});
    };
    const w=(d&&d.watched)||{},r=(d&&d.resume)||{};
    for(const k in w)add(k,w[k]&&w[k].at);
    for(const k in r)add(k,r[k]&&r[k].at);
    if(d.last&&d.last.path)add(d.last.path,d.last.at);
    (Array.isArray(d.history)?d.history:[]).forEach(h=>{if(h&&h.path)add(h.path,h.at)});
    cands.sort((a,b)=>(ghost(a.path)-ghost(b.path))||(b.at-a.at));
    return (async()=>{
      for(const c of cands.slice(0,3)){if(await exists(c.path))return c.path;}
      return null;
    })();
  }
  let playing=false,mark=0;
  document.addEventListener('play',e=>{if(e.target&&e.target.tagName==='VIDEO'){playing=true;mark=Date.now();}},true);
  document.addEventListener('pause',e=>{if(e.target&&e.target.tagName==='VIDEO'){playing=false;flushWatch();}},true);
  document.addEventListener('ended',e=>{if(e.target&&e.target.tagName==='VIDEO'){playing=false;flushWatch();}},true);
  function flushWatch(){
    if(!mark)return;
    const sec=(Date.now()-mark)/1000;
    mark=playing?Date.now():0;
    if(sec>0&&sec<300){const w=lsGet(LS_WATCH,{});const k=dayKey();w[k]=(w[k]||0)+sec;lsSet(LS_WATCH,w);}
  }
  setInterval(flushWatch,30000);
  const todayMin=()=>Math.round((lsGet(LS_WATCH,{})[dayKey()]||0)/60);
  const goalMin=()=>Math.max(10,Math.min(480,parseInt(lsGet(LS_GOAL,60),10)||60));
  setInterval(()=>{
    const card=document.getElementById('gdi-home-card');
    if(!card)return;
    let chip=document.getElementById('gdi-goal-chip');
    if(!chip){
      chip=document.createElement('div');chip.id='gdi-goal-chip';
      chip.style.cssText='flex-basis:100%;margin-top:2px;font-size:12px;color:#8b949e;display:flex;align-items:center;gap:8px;';
      card.appendChild(chip);
    }
    const t=todayMin(),g=goalMin();
    chip.innerHTML=`<span>\ud83c\udfaf Meta hoje: ${fmtMin(t)} / ${fmtMin(g)}</span>
      <div style="flex:1;max-width:220px;height:5px;background:rgba(255,255,255,.1);border-radius:3px;overflow:hidden;">
        <div style="height:5px;width:${Math.min(100,Math.round(t/g*100))}%;background:${t>=g?'#2f9e44':'#1f6feb'};transition:width .4s;"></div>
      </div>${t>=g?'<span style="color:#2f9e44;">\u2713 meta batida!</span>':''}`;
  },20000);
  const marOn=()=>lsGet(LS_MAR,false)===true;
  const marIntro=()=>lsGet(LS_MARINTRO,true)!==false;
  function marCourseKey(){
    try{
      const m=window.playlistVideos&&window.playlistVideos[window.currentIndex];
      if(m&&m.folder){const f=norm(m.folder);return f.endsWith('/')?f:f+'/';}
    }catch(_){}
    return window.location.pathname.split('/').slice(0,-1).join('/')+'/';
  }
  Bus.onGlobal('media:ready',({type,el})=>{
    if(type!=='video'||!el||el.__m22mar)return;
    el.__m22mar=true;
    el.addEventListener('ended',()=>{
      if(!marOn())return;
      const pv=window.playlistVideos;
      if(!pv||!pv.length)return;
      const wl=watchedLow(stateD());
      const isW=i=>{
        const raw=String(pv[i].pageUrl||'').split('?')[0];
        if(wl.has(low(raw)))return true;
        try{return !!(window.GDIUser&&GDIUser.isWatched&&GDIUser.isWatched(raw));}catch(_){return false;}
      };
      const ci=typeof window.currentIndex==='number'?window.currentIndex:-1;
      for(let i=ci+1;i<pv.length;i++){
        if(!isW(i)){
          showToast('\u25b6 Maratona: '+stripExt(pv[i].name||pv[i].origName||''));
          setTimeout(()=>{try{window.switchVideo(i);}catch(_){}},1800);
          return;
        }
      }
      showToast('Maratona: todas as aulas \u00e0 frente j\u00e1 foram assistidas \u2713');
    });
    const tryIntro=()=>{
      if(!marOn()||!marIntro())return;
      try{
        const S=window.GDIUser&&GDIUser.getIntro&&GDIUser.getIntro(marCourseKey());
        if(S&&S>0&&el.currentTime<S-1&&el.currentTime<300)el.currentTime=S;
      }catch(_){}
    };
    el.addEventListener('loadedmetadata',()=>setTimeout(tryIntro,300));
    el.addEventListener('play',tryIntro);
  });
  const cards=()=>lsGet(LS_CARDS,[]);
  const saveCards=c=>lsSet(LS_CARDS,c);
  const dueCards=()=>cards().filter(c=>(c.due||0)<=Date.now());
  let FC={active:false,flip:null,grade:null};
  let panel=null,tab='cursos';
  function openPanel(t){
    if(t)tab=t;
    if(!panel){
      panel=document.createElement('div');panel.id='gdi-central';
      panel.addEventListener('click',e=>{if(e.target===panel)closePanel();});
      GDI_ROOT().appendChild(panel);
    }
    panel.style.display='flex';
    renderPanel();
    ensureState().then(()=>{if(panel&&panel.style.display!=='none')renderPanel();});
  }
  function closePanel(){FC.active=false;if(panel)panel.style.display='none';}
  function renderPanel(){
    if(!panel)return;
    const t=todayMin(),g=goalMin(),pct=Math.min(100,Math.round(t/g*100));
    panel.innerHTML=`<div class="gdi-central-box">
      <div class="gdi-central-head">
        <b style="color:#f0f6fc;font-size:16px;">\ud83d\udcda Central de Estudos</b>
        <span style="color:#8b949e;font-size:12px;">Meta hoje: ${fmtMin(t)}/${fmtMin(g)}</span>
        <div style="flex:1;max-width:160px;height:6px;background:rgba(255,255,255,.1);border-radius:3px;overflow:hidden;"><div style="height:6px;width:${pct}%;background:${t>=g?'#2f9e44':'#1f6feb'};"></div></div>
        <input id="gdi-goal-set" type="number" min="10" max="480" value="${g}" title="Meta di\u00e1ria (minutos)" style="width:56px;background:rgba(255,255,255,.07);border:1px solid #30363d;border-radius:6px;color:#f0f6fc;text-align:center;padding:3px 5px;font-size:12px;">
        <button class="gdi-mode-btn" id="gdi-central-x" style="padding:4px 10px;">\u2715</button>
      </div>
      <div class="gdi-central-tabs">
        <button class="gdi-central-tab ${tab==='cursos'?'active':''}" data-t="cursos">\ud83d\udccd Meus Cursos</button>
        <button class="gdi-central-tab ${tab==='stats'?'active':''}" data-t="stats">\ud83d\udcca Estat\u00edsticas</button>
        <button class="gdi-central-tab ${tab==='fc'?'active':''}" data-t="fc">\ud83e\uddf0 Flashcards</button>
        <button class="gdi-central-tab ${tab==='mar'?'active':''}" data-t="mar">\ud83d\ude80 Maratona</button>
      </div>
      <div class="gdi-central-body" id="gdi-central-body"></div>
    </div>`;
    panel.querySelector('#gdi-central-x').onclick=closePanel;
    panel.querySelector('#gdi-goal-set').addEventListener('change',e=>{
      const v=Math.max(10,Math.min(480,parseInt(e.target.value,10)||60));
      lsSet(LS_GOAL,v);renderPanel();
    });
    panel.querySelectorAll('.gdi-central-tab').forEach(b=>b.onclick=()=>{tab=b.dataset.t;FC.active=false;renderPanel();});
    const body=panel.querySelector('#gdi-central-body');
    if(tab==='cursos')renderCursos(body);
    else if(tab==='stats')renderStats(body);
    else if(tab==='fc')renderFlash(body);
    else renderMarathon(body);
  }
  async function renderCursos(box){
    const cs=collectCourses();
    if(!cs.length){box.innerHTML='<div class="gdi-notes-empty">Nenhum estudo registrado ainda.</div>';return;}
    box.innerHTML='<div class="gdi-courses"></div>';
    const grid=box.firstChild;
    // ★FIX: 12 cursos (era 24) — cada um dispara até 3 POSTs de verificação
    cs.slice(0,12).forEach(c=>{
      const el=document.createElement('div');el.className='gdi-course';
      el.innerHTML=`<b title="${escHtml(courseName(c.key))}">${escHtml(courseName(c.key))}</b>
        <small>${escHtml(driveNameOf(c.key))||'\u2014'} \u00b7 ${c.lessons.size} aula${c.lessons.size>1?'s':''}${c.watched?` \u00b7 ${c.watched} conclu\u00edda${c.watched>1?'s':''}`:''} \u00b7 \u00faltima: ${c.lastAt?dateBr(c.lastAt):'\u2014'}</small>
        <button class="gdi-mode-btn" style="font-size:12px;" disabled><i class="bi bi-hourglass-split"></i> Verificando\u2026</button>`;
      grid.appendChild(el);
      const btn=el.querySelector('button');
      bestIn(c.key).then(target=>{
        if(target){
          btn.disabled=false;
          btn.innerHTML=`<i class="bi bi-play-fill"></i> Continuar: ${escHtml(realName(target).slice(0,28))}`;
          btn.onclick=()=>{location.href=target+(target.includes('?')?'&':'?')+'a=view';};
        }else{
          btn.disabled=true;
          btn.innerHTML='<i class="bi bi-check2"></i> Nada pendente encontrado';
        }
      });
    });
  }
  function renderStats(box){
    const d=stateD()||{};
    const chip=(ic,tx)=>`<span style="background:#161b22;border:1px solid #21262d;border-radius:8px;padding:6px 10px;font-size:12px;color:#e6edf3;">${ic} ${tx}</span>`;
    const acts={};
    const addA=t=>{if(!t)return;const k=dayKey(t);acts[k]=(acts[k]||0)+1;};
    const w=(d.watched)||{},r=(d.resume)||{};
    for(const k in w)addA(w[k]&&w[k].at);
    for(const k in r)addA(r[k]&&r[k].at);
    if(d.last&&d.last.at)addA(d.last.at);
    for(const k in(d.notes||{}))(d.notes[k]||[]).forEach(n=>addA(n.at));
    (Array.isArray(d.history)?d.history:[]).forEach(h=>addA(h&&h.at));
    const days=new Set(Object.keys(acts));
    let streak=0;const dd=new Date();
    const hasD=t=>days.has(dayKey(t));
    if(!hasD(dd))dd.setDate(dd.getDate()-1);
    while(hasD(dd)){streak++;dd.setDate(dd.getDate()-1);}
    const today=new Date();today.setHours(12,0,0,0);
    const begin=new Date(today);begin.setDate(begin.getDate()-91);begin.setDate(begin.getDate()-begin.getDay());
    const n=Math.round((today-begin)/86400000)+1;
    let heat='';
    for(let i=0;i<n;i++){
      const t=new Date(begin.getTime()+i*86400000);
      const a=acts[dayKey(t)]||0;
      const lvl=a===0?0:a===1?1:a<=3?2:a<=6?3:4;
      heat+=`<i class="${lvl?'l'+lvl:''}" title="${dateBr(t)} \u00b7 ${a} atividade${a===1?'':'s'}"></i>`;
    }
    const ws=new Date();ws.setHours(0,0,0,0);ws.setDate(ws.getDate()-ws.getDay());
    let wkMin=0;
    const watch=lsGet(LS_WATCH,{});
    for(const k in watch){const p=k.split('-').map(Number);const t=new Date(p[0],p[1]-1,p[2],12);if(t>=ws)wkMin+=watch[k];}
    wkMin=Math.round(wkMin/60);
    const per={};
    for(const k in r){const ck=courseKeyOf(k);if(!ck)continue;const x=r[k]||{};per[ck]=(per[ck]||0)+Math.min(x.t||0,(x.d>0?x.d:x.t)||0);}
    const top=Object.entries(per).map(([ck,s])=>({ck,h:s/3600})).sort((a,b)=>b.h-a.h).slice(0,8);
    const maxH=top.length?Math.max(top[0].h,.1):1;
    let notesN=0;for(const k in(d.notes||{}))notesN+=(d.notes[k]||[]).length;
    let srsDue=0;const now=Date.now();
    for(const k in(d.notes||{}))(d.notes[k]||[]).forEach(x=>{const e=d.srs&&d.srs[k+'|'+x.at];if((e?e.due:(x.at+86400000))<=now)srsDue++;});
    const totalH=Object.values(per).reduce((a,b)=>a+b,0)/3600;
    box.innerHTML=`
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">
        ${chip('\ud83d\udd25',streak+' dia'+(streak===1?'':'s')+' seguidos')}
        ${chip('\u23f1\ufe0f',fmtMin(todayMin())+' hoje')}
        ${chip('\ud83d\udcca',fmtMin(wkMin)+' na semana')}
        ${chip('\u2753','\u2248'+totalH.toFixed(1).replace('.',',')+'h no total')}
        ${chip('\u2705',Object.keys(w).length+' conclu\u00eddas')}
        ${chip('\u25b6',Object.keys(r).length+' em andamento')}
        ${chip('\ud83d\udcdd',notesN+' anota\u00e7\u00f5es')}
        ${srsDue?chip('\ud83c\udf93',srsDue+' revis\u00f5es vencidas'):''}
      </div>
      <h4 style="color:#8b949e;font-size:11px;text-transform:uppercase;letter-spacing:.06em;margin:0 0 8px;">\u00daltimos 3 meses \u00b7 atividades por dia</h4>
      <div class="heat" style="margin-bottom:18px;overflow-x:auto;padding-bottom:4px;">${heat}</div>
      <h4 style="color:#8b949e;font-size:11px;text-transform:uppercase;letter-spacing:.06em;margin:0 0 8px;">Horas por curso (estimativa)</h4>
      ${top.map(t2=>`<div style="margin-bottom:8px;min-width:260px;max-width:640px;">
        <div style="display:flex;justify-content:space-between;font-size:12px;color:#e6edf3;margin-bottom:3px;">
          <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:78%;">${escHtml(courseName(t2.ck))}</span>
          <span style="color:#8b949e;">${t2.h.toFixed(1).replace('.',',')}h</span>
        </div>
        <div style="height:6px;background:rgba(255,255,255,.08);border-radius:3px;overflow:hidden;"><div style="height:6px;width:${Math.max(3,Math.round(t2.h/maxH*100))}%;background:#1f6feb;"></div></div>
      </div>`).join('')||'<div class="gdi-notes-empty">Sem dados ainda.</div>'}`;
  }
  function renderFlash(box){
    const cs=cards(),due=dueCards();
    const currentAula=(document.querySelector('.gdi-player-wrap')&&window.gdiVideoKey)?norm(window.gdiVideoKey()):'';
    const inp='background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:8px;color:#e6edf3;padding:8px;font-size:13px;';
    box.innerHTML=`
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:14px;">
        <b style="color:#f0f6fc;">${cs.length} cart\u00e3o${cs.length===1?'':'\u00f5es'}</b>
        <span style="color:#8b949e;font-size:12px;">${due.length} vencido${due.length===1?'':'s'}</span>
        <button id="gdi-fc-study" class="gdi-btn gdi-btn-primary" style="font-size:12px;" ${due.length?'':'disabled'}><i class="bi bi-play-fill"></i> Estudar (${due.length})</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:14px;max-width:640px;">
        <input id="gdi-fc-f" placeholder="Frente (pergunta)" style="${inp}">
        <input id="gdi-fc-b" placeholder="Verso (resposta)" style="${inp}">
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
          <button id="gdi-fc-add" class="gdi-mode-btn" style="font-size:12px;"><i class="bi bi-plus-lg"></i> Adicionar</button>
          ${currentAula?`<span style="font-size:11px;color:#8b949e;">aula atual: ${escHtml(realName(currentAula).slice(0,30))}</span>`:''}
        </div>
      </div>
      <div id="gdi-fc-list" style="display:flex;flex-direction:column;gap:6px;max-width:640px;"></div>`;
    const list=box.querySelector('#gdi-fc-list');
    function drawList(){
      const all=cards();
      list.innerHTML=all.length?'':'<div class="gdi-notes-empty">Nenhum cart\u00e3o ainda \u2014 crie o primeiro acima.</div>';
      all.slice().reverse().forEach(c=>{
        const row=document.createElement('div');row.className='gdi-note';
        row.innerHTML=`<span style="flex:1;word-break:break-word;"><b style="color:#f0f6fc;">${escHtml(String(c.f).slice(0,70))}</b><br><span style="color:#8b949e;">${escHtml(String(c.b).slice(0,90))}</span></span>
          <span style="font-size:10px;color:#8b949e;white-space:nowrap;">${(c.due||0)<=Date.now()?'<b style="color:#ffd43b;">hoje</b>':dateBr(c.due)}</span>
          <button class="gdi-note-del" title="Excluir"><i class="bi bi-x-lg"></i></button>`;
        row.querySelector('button').onclick=()=>{saveCards(cards().filter(x=>x.id!==c.id));drawList();};
        list.appendChild(row);
      });
    }
    drawList();
    box.querySelector('#gdi-fc-add').onclick=()=>{
      const f=box.querySelector('#gdi-fc-f').value.trim();
      const b=box.querySelector('#gdi-fc-b').value.trim();
      if(!f||!b){showToast('Preencha frente e verso');return;}
      const all=cards();
      all.push({id:Date.now()+'-'+Math.random().toString(36).slice(2,7),f,b,path:currentAula||'',at:Date.now(),box:0,due:Date.now()+86400000});
      saveCards(all);
      box.querySelector('#gdi-fc-f').value='';box.querySelector('#gdi-fc-b').value='';
      drawList();showToast('Cart\u00e3o adicionado');
    };
    box.querySelector('#gdi-fc-study').onclick=()=>studyFlash(box);
  }
  function studyFlash(box){
    const queue=dueCards();
    if(!queue.length){renderFlash(box);return;}
    let i=0,ok=0;
    function draw(){
      if(i>=queue.length){
        FC.active=false;
        box.innerHTML=`<div style="text-align:center;padding:30px;">
          <div style="font-size:40px;">\ud83c\udf89</div>
          <h3 style="color:#f0f6fc;">Revis\u00e3o conclu\u00edda!</h3>
          <p style="color:#8b949e;font-size:13px;">${ok}/${queue.length} lembradas de primeira.</p>
          <button class="gdi-mode-btn" id="gdi-fc-back" style="margin-top:8px;">Voltar aos cart\u00f5es</button>
        </div>`;
        box.querySelector('#gdi-fc-back').onclick=()=>renderFlash(box);
        return;
      }
      const c=queue[i];
      box.innerHTML=`
        <div style="text-align:center;color:#8b949e;font-size:12px;margin-bottom:10px;">Cart\u00e3o ${i+1}/${queue.length} \u00b7 [espa\u00e7o] vira \u00b7 [1] esqueci \u00b7 [2] quase \u00b7 [3] lembrei</div>
        <div class="gdi-fc" id="gdi-fc-card" title="Clique para virar">
          <div style="font-size:18px;color:#f0f6fc;text-align:center;">${escHtml(c.f)}</div>
          <div id="gdi-fc-back2" style="display:none;font-size:15px;color:#7aa2ff;border-top:1px solid #21262d;padding-top:12px;text-align:center;">${escHtml(c.b)}</div>
        </div>
        <div id="gdi-fc-btns" style="display:none;gap:8px;justify-content:center;margin-top:14px;flex-wrap:wrap;">
          <button class="gdi-mode-btn" data-g="1">1 \u00b7 Esqueci</button>
          <button class="gdi-mode-btn" data-g="2">2 \u00b7 Quase</button>
          <button class="gdi-btn gdi-btn-primary" data-g="3">3 \u00b7 Lembrei</button>
        </div>`;
      const card=box.querySelector('#gdi-fc-card'),bk=box.querySelector('#gdi-fc-back2'),btns=box.querySelector('#gdi-fc-btns');
      const flip=()=>{bk.style.display='';btns.style.display='flex';};
      card.onclick=flip;
      box.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>grade(+b.dataset.g));
      FC.flip=flip;
      FC.grade=grade;
      FC.active=true;
    }
    function grade(g){
      const c=queue[i];
      const all=cards();
      const ix=all.findIndex(x=>x.id===c.id);
      if(ix>=0){
        const day=86400000,steps=[1,7,30,90];
        if(g===1){all[ix].box=0;all[ix].due=Date.now()+day;}
        else if(g===2){all[ix].due=Date.now()+3*day;}
        else{all[ix].box=Math.min((all[ix].box||0)+1,3);all[ix].due=Date.now()+steps[all[ix].box]*day;}
        saveCards(all);
      }
      if(g===3)ok++;
      i++;draw();
    }
    draw();
  }
  function renderMarathon(box){
    const on=marOn(),intro=marIntro();
    const sw=(id,chk,tit,sub)=>`<label style="display:flex;justify-content:space-between;align-items:center;gap:14px;background:#161b22;border:1px solid #21262d;border-radius:12px;padding:14px;cursor:pointer;">
      <span><b style="color:#f0f6fc;">${tit}</b><br><small style="color:#8b949e;">${sub}</small></span>
      <input type="checkbox" id="${id}" ${chk?'checked':''} style="accent-color:#1f6feb;width:20px;height:20px;cursor:pointer;flex-shrink:0;"></label>`;
    box.innerHTML=`<div style="max-width:560px;display:flex;flex-direction:column;gap:12px;">
      ${sw('gdi-mar-on',on,'\ud83d\ude80 Modo Maratona','Ao terminar uma aula, abre sozinho a pr\u00f3xima n\u00e3o assistida da playlist')}
      ${sw('gdi-mar-intro',intro,'\u23e9 Pular introdu\u00e7\u00e3o autom\u00e1tico','Usa o tempo memorizado pelo bot\u00e3o "Pular introdu\u00e7\u00e3o" (M7)')}
      <p style="color:#8b949e;font-size:12px;">Vale nas p\u00e1ginas de aula com playlist. O check \u2713 da aula continua sendo dado pelo auto-assistido (90%).</p>
    </div>`;
    box.querySelector('#gdi-mar-on').addEventListener('change',e=>{
      lsSet(LS_MAR,e.target.checked);
      showToast('Modo Maratona '+(e.target.checked?'LIGADO \ud83d\ude80':'desligado'));
    });
    box.querySelector('#gdi-mar-intro').addEventListener('change',e=>lsSet(LS_MARINTRO,e.target.checked));
  }
  if(!document.getElementById('gdi-central-style')){
    const s=document.createElement('style');s.id='gdi-central-style';s.textContent=`
#gdi-central-fab{position:fixed;bottom:76px;right:76px;z-index:9999;width:44px;height:44px;border-radius:50%;cursor:pointer;background:rgba(18,18,28,.92);border:1.5px solid rgba(255,255,255,.15);color:#7aa2ff;font-size:19px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,.5);opacity:.45;transition:opacity .25s;}
#gdi-central-fab:hover{opacity:1;}
#gdi-central{position:fixed;inset:0;z-index:10001;background:rgba(5,7,10,.85);display:none;align-items:center;justify-content:center;padding:16px;}
.gdi-central-box{background:#0f1218;border:1px solid #21262d;border-radius:16px;max-width:980px;width:100%;max-height:calc(100dvh - 40px);display:flex;flex-direction:column;overflow:hidden;}
.gdi-central-head{display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid #21262d;flex-wrap:wrap;}
.gdi-central-tabs{display:flex;gap:4px;padding:6px 12px 0;border-bottom:1px solid #21262d;flex-wrap:wrap;}
.gdi-central-tab{background:none;border:0;color:#8b949e;padding:9px 14px;cursor:pointer;font-size:13px;border-bottom:2px solid transparent;}
.gdi-central-tab.active{color:#f0f6fc;border-bottom-color:#1f6feb;}
.gdi-central-body{overflow-y:auto;padding:16px 18px;}
.gdi-courses{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px;}
.gdi-course{background:#161b22;border:1px solid #21262d;border-radius:12px;padding:12px;}
.gdi-course b{color:#f0f6fc;font-size:14px;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.gdi-course small{color:#8b949e;font-size:11px;display:block;margin:4px 0 10px;}
.heat{display:grid;grid-auto-flow:column;grid-template-rows:repeat(7,10px);gap:3px;width:max-content;}
.heat i{width:10px;height:10px;border-radius:2px;background:#161b22;display:block;}
.heat i.l1{background:#0e4429}.heat i.l2{background:#006d32}.heat i.l3{background:#26a641}.heat i.l4{background:#39d353}
.gdi-fc{background:#161b22;border:1px solid #30363d;border-radius:14px;padding:26px 20px;min-height:170px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;cursor:pointer;max-width:560px;margin:0 auto;}
`;document.head.appendChild(s);
  }
  if(!document.getElementById('gdi-central-fab')){
    const b=document.createElement('button');
    b.id='gdi-central-fab';b.title='Central de Estudos (tecla C)';b.textContent='\ud83d\udcda';
    b.onclick=()=>openPanel('cursos');
    GDI_ROOT().appendChild(b);
  }
  document.addEventListener('keydown',e=>{
    const t=e.target;
    if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;
    if(e.ctrlKey||e.metaKey||e.altKey)return;
    if(e.key==='Escape'){closePanel();return;}
    const k=e.key.toLowerCase();
    if(k==='c'){
      if(panel&&panel.style.display!=='none')closePanel();
      else openPanel();
      return;
    }
    if(!FC.active||!panel||panel.style.display==='none')return;
    if(e.code==='Space'){e.preventDefault();FC.flip&&FC.flip();}
    else if(e.key==='1'||e.key==='2'||e.key==='3'){FC.grade&&FC.grade(+e.key);}
  });
  log('central de estudos ativa (v2.6 \u2014 sem observer, sem loop)');
})();

// ═══════════════════════════════════════════════════════════════
// M-FERRETO: TEMA VISUAL FERRETO PARA OS MÓDULOS EXTRAS
// Carrega fontes (Poppins/Rubik/Inter), fixa tokens e reaplica a
// linguagem visual Ferreto (coral #ff8b9f / teal #5ddeda) sobre os
// componentes próprios deste extras (debug, pomodoro, notas,
// materiais, playlist, sleep, skip-intro, continue-card, progress,
// central de estudos). Não altera lógica dos módulos.
// ═══════════════════════════════════════════════════════════════
(function(){
  if(window.__gdiFerretoExtras)return;window.__gdiFerretoExtras=true;
  console.log('[GDI Extras] M-FERRETO tema aplicado');

  // ── 1) Fontes Ferreto (Poppins / Rubik / Inter) ──
  if(!document.getElementById('gdi-ferreto-fonts')){
    const f=document.createElement('link');
    f.id='gdi-ferreto-fonts';f.rel='stylesheet';
    f.href='https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Rubik:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(f);
  }
  if(!document.querySelector('link[rel="preconnect"][href*="fonts.gstatic"]')){
    const p=document.createElement('link');p.rel='preconnect';p.crossOrigin='';p.href='https://fonts.gstatic.com';document.head.appendChild(p);
  }

  // ── 2) Tokens (espelha app.min.js p/ tornar extras autossuficiente) ──
  if(!document.getElementById('gdi-ferreto-tokens')){
    const t=document.createElement('style');t.id='gdi-ferreto-tokens';t.textContent=`
:root{
  --ferreto-primary:#ff8b9f;--ferreto-primary-600:#f5697f;--ferreto-secondary:#5ddeda;
  --ferreto-accent:#c026d3;--ferreto-radius:16px;--ferreto-radius-sm:10px;
  --ferreto-font-display:'Poppins','Rubik',system-ui,sans-serif;
  --ferreto-font-body:'Rubik','Inter',system-ui,sans-serif;
  --ferreto-grad:linear-gradient(135deg,#ff8b9f 0%,#c026d3 55%,#5ddeda 130%);
  --ferreto-grad-soft:linear-gradient(135deg,rgba(255,139,159,.16),rgba(93,222,218,.12));
  --ferreto-glow:rgba(255,139,159,.35);
}
[data-bs-theme="dark"]{
  --ferreto-bg:#070910;--ferreto-bg-2:#0d1119;
  --ferreto-surface:rgba(22,27,38,.72);--ferreto-surface-2:rgba(255,255,255,.045);--ferreto-surface-3:rgba(255,255,255,.08);
  --ferreto-border:rgba(255,255,255,.09);--ferreto-border-strong:rgba(255,255,255,.16);
  --ferreto-text:#f3f5fa;--ferreto-text-muted:#9aa4b8;--ferreto-text-faint:#6b7488;
}
[data-bs-theme="light"]{
  --ferreto-bg:#f4f5fb;--ferreto-bg-2:#e9ebf5;
  --ferreto-surface:rgba(255,255,255,.78);--ferreto-surface-2:rgba(255,255,255,.6);--ferreto-surface-3:rgba(15,23,42,.05);
  --ferreto-border:rgba(15,23,42,.1);--ferreto-border-strong:rgba(15,23,42,.18);
  --ferreto-text:#1f2540;--ferreto-text-muted:#5a6478;--ferreto-text-faint:#9aa1b4;
  --ferreto-glow:rgba(255,139,159,.28);
}
`;document.head.appendChild(t);
  }

  // ── 3) Estilização Ferreto dos componentes extras ──
  if(!document.getElementById('gdi-ferreto-extras-style')){
    const s=document.createElement('style');s.id='gdi-ferreto-extras-style';s.textContent=`

/* Debug panel */
.gdi-debug-wrap{background:var(--ferreto-bg-2)!important;border-top:2px solid var(--ferreto-primary)!important;border-radius:0!important;}
.gdi-debug-head{background:var(--ferreto-surface)!important;color:var(--ferreto-text-muted)!important;}
.gdi-debug-head:hover{background:var(--ferreto-surface-3)!important;}
.gdi-debug-head strong{color:var(--ferreto-text)!important;font-family:var(--ferreto-font-display)!important;}
.gdi-dbg-count{background:var(--ferreto-grad)!important;color:#fff!important;}
.gdi-debug-actions button{background:var(--ferreto-surface-2)!important;border-color:var(--ferreto-border)!important;color:var(--ferreto-text-muted)!important;border-radius:999px!important;padding:3px 12px!important;font-size:11px!important;}
.gdi-debug-actions button:hover{background:var(--ferreto-primary)!important;color:#fff!important;border-color:var(--ferreto-primary)!important;}
#gdi-debug-log{background:var(--ferreto-bg-2)!important;color:var(--ferreto-text)!important;}
.gdi-dbg-entry{border-bottom-color:var(--ferreto-border)!important;}
.gdi-dbg-pre{background:var(--ferreto-surface)!important;border-left-color:var(--ferreto-primary)!important;color:var(--ferreto-text-muted)!important;}

/* Materiais (tabs + body) */
.gdi-mat-head strong{color:var(--ferreto-text)!important;font-family:var(--ferreto-font-display)!important;}
#gdi-mat-status{color:var(--ferreto-text-muted)!important;}
.gdi-mat-tab{background:var(--ferreto-surface-2)!important;border-color:var(--ferreto-border)!important;color:var(--ferreto-text-muted)!important;border-radius:12px!important;transition:all .15s!important;}
.gdi-mat-tab i{color:var(--ferreto-secondary)!important;}
.gdi-mat-tab span{font-family:var(--ferreto-font-body)!important;}
.gdi-mat-tab:hover{background:var(--ferreto-surface-3)!important;color:var(--ferreto-text)!important;transform:translateY(-1px);}
.gdi-mat-tab.active{background:var(--ferreto-grad)!important;border:0!important;color:#fff!important;box-shadow:0 6px 16px -8px var(--ferreto-glow);}
.gdi-mat-tab.active i{color:#fff!important;}
.gdi-mat-body{background:var(--ferreto-surface)!important;border-color:var(--ferreto-border)!important;border-radius:var(--ferreto-radius)!important;}
.gdi-mat-empty{color:var(--ferreto-text-muted)!important;}
.gdi-mat-loading{color:var(--ferreto-text-muted)!important;}

/* Notas */
.gdi-notes{background:var(--ferreto-surface-2)!important;border-color:var(--ferreto-border)!important;border-radius:var(--ferreto-radius-sm)!important;}
.gdi-notes-head{color:var(--ferreto-text)!important;font-family:var(--ferreto-font-display)!important;}
#gdi-note-input{background:var(--ferreto-surface-2)!important;border-color:var(--ferreto-border)!important;color:var(--ferreto-text)!important;border-radius:10px!important;font-family:var(--ferreto-font-body)!important;}
#gdi-note-input:focus{border-color:var(--ferreto-primary)!important;box-shadow:0 0 0 4px var(--ferreto-glow)!important;outline:none!important;}
#gdi-note-time{color:var(--ferreto-primary)!important;}
#gdi-note-save{background:var(--ferreto-grad)!important;color:#fff!important;border:0!important;border-radius:999px!important;font-family:var(--ferreto-font-body)!important;font-weight:600!important;box-shadow:0 6px 16px -8px var(--ferreto-glow);}
#gdi-note-save:hover{filter:brightness(1.08);}
#gdi-notes-list{scrollbar-width:thin;}
.gdi-note{background:var(--ferreto-surface-3)!important;border-radius:10px!important;}
.gdi-note-time{color:var(--ferreto-primary)!important;}
.gdi-note-text{color:var(--ferreto-text)!important;}
.gdi-note-del{color:var(--ferreto-text-muted)!important;}
.gdi-note-del:hover{color:#ff6b6b!important;}
.gdi-note-mark{background:var(--ferreto-primary)!important;}
.gdi-note-mark:hover{background:#ffd43b!important;}

/* Pomodoro FAB + painel */
#gdi-pom-fab{background:conic-gradient(var(--ferreto-primary) calc(var(--pom-p,0)*1%),var(--ferreto-surface-3) 0)!important;box-shadow:0 6px 22px rgba(0,0,0,.5),0 0 0 1px var(--ferreto-border-strong)!important;}
#gdi-pom-fab::after{background:var(--ferreto-bg-2)!important;border-color:var(--ferreto-border)!important;}
#gdi-pom-fab>span{color:var(--ferreto-text)!important;}
#gdi-pom-fab.warning{animation:gdi-pom-pulse .8s ease-in-out infinite;}
@keyframes gdi-pom-pulse{0%,100%{box-shadow:0 6px 22px rgba(0,0,0,.5),0 0 0 1px var(--ferreto-border-strong);}50%{box-shadow:0 0 0 12px rgba(255,139,159,.25),0 6px 22px rgba(0,0,0,.5);}}
#gdi-pom-panel{background:var(--ferreto-surface)!important;-webkit-backdrop-filter:blur(20px)!important;backdrop-filter:blur(20px)!important;border-color:var(--ferreto-border-strong)!important;border-radius:var(--ferreto-radius)!important;box-shadow:0 20px 56px rgba(0,0,0,.6)!important;color:var(--ferreto-text)!important;}

/* Sleep button */
#gdi-sleep-btn{color:var(--ferreto-text-muted)!important;background:var(--ferreto-surface-2)!important;border:1px solid var(--ferreto-border)!important;border-radius:999px!important;}
#gdi-sleep-btn:hover{color:var(--ferreto-primary)!important;background:var(--ferreto-surface-3)!important;}

/* Skip intro */
#gdi-skip-intro{background:var(--ferreto-surface)!important;border:1px solid var(--ferreto-border-strong)!important;color:var(--ferreto-text)!important;border-radius:999px!important;font-family:var(--ferreto-font-body)!important;font-weight:600!important;box-shadow:0 8px 24px rgba(0,0,0,.5)!important;}
#gdi-skip-intro:hover{background:var(--ferreto-grad)!important;color:#fff!important;border:0!important;}

/* Progress / module prog chips */
#gdi-progress-line{color:var(--ferreto-text-muted)!important;}
.gdi-modprog{background:var(--ferreto-surface-2)!important;color:var(--ferreto-text-muted)!important;border-radius:999px!important;border:1px solid var(--ferreto-border)!important;}
.gdi-modprog b{color:var(--ferreto-secondary)!important;}

/* Continue card + Home card */
#gdi-home-card,.gdi-continue-card{background:var(--ferreto-surface)!important;border:1px solid var(--ferreto-border)!important;border-radius:var(--ferreto-radius)!important;box-shadow:0 6px 22px -10px rgba(0,0,0,.4)!important;-webkit-backdrop-filter:blur(14px)!important;backdrop-filter:blur(14px)!important;}

/* Playlist count badge */
#gdi-playlist-count{color:var(--ferreto-text-muted)!important;}

/* Player nav buttons (Anterior/Próxima) */
#gdi-player-nav .gdi-mode-btn{justify-content:center;}

/* Nota: marks sobre o player */
#gdi-note-marks .gdi-note-mark{border-color:var(--ferreto-bg-2)!important;}

/* Central de estudos (M22) — painel flutuante */
.gdi-fc-panel,.gdi-fc-root,[class*="gdi-fc"]{background:var(--ferreto-surface)!important;border-color:var(--ferreto-border-strong)!important;border-radius:var(--ferreto-radius)!important;-webkit-backdrop-filter:blur(18px)!important;backdrop-filter:blur(18px)!important;color:var(--ferreto-text)!important;}

/* Scrollbar dos painéis internos */
#gdi-notes-list::-webkit-scrollbar,#gdi-debug-log::-webkit-scrollbar{width:8px;}
#gdi-notes-list::-webkit-scrollbar-thumb,#gdi-debug-log::-webkit-scrollbar-thumb{background:var(--ferreto-surface-3);border-radius:20px;}

`;document.head.appendChild(s);
  }

  // ── 4) Garante data-bs-theme em <html> p/ os tokens casarem ──
  if(!document.documentElement.getAttribute('data-bs-theme')){
    document.documentElement.setAttribute('data-bs-theme',localStorage.getItem('gdi-theme')||'dark');
  }

  // ── 5) FIX modal serrilhada (belt-and-suspenders do CSS) ──
  // Força repaint quando qualquer modal abre, acabando com o
  // "serrilhado até clicar" mesmo em browsers teimosos.
  document.addEventListener('shown.bs.modal',function(ev){
    const dlg=ev.target&&ev.target.querySelector&&ev.target.querySelector('.modal-dialog');
    if(!dlg)return;
    dlg.style.transform='translateZ(0)';
    void dlg.offsetHeight;
    setTimeout(function(){dlg.style.transform='';},0);
  },true);
})();

// ═══════════════════════════════════════════════════════════════
// M-PLAYER-GUARD: WATCHDOG CONTRA VÍDEOS TRAVADOS
// Camada de segurança extra além do fix v2.6 (que removeu o loop do
// MutationObserver). Mesmo sem o loop, alguns streams do Drive
// expiram/ficam lentos e o player entra em buffering infinito sem
// evento de erro — a aba trava. Este watchdog monitora o <video>:
// se 15s sem progresso, faz retry silencioso (v.load); se travar de
// novo, mostra overlay [Recarregar][Continuar aguardando]. Também
// resolve autoplay bloqueado (hint de ▶).
// ═══════════════════════════════════════════════════════════════
(function(){
  const STALL_MS=15000;
  const FIRST_PLAY_HINT_MS=3500;

  if(!document.getElementById('gdi-stall-style')){
    const s=document.createElement('style');s.id='gdi-stall-style';s.textContent=`
.gdi-stall-overlay{position:absolute;inset:0;background:rgba(7,9,16,.82);
  -webkit-backdrop-filter:blur(7px);backdrop-filter:blur(7px);
  display:flex;align-items:center;justify-content:center;z-index:30;
  animation:ferreto-fade .2s ease;}
.gdi-stall-card{display:flex;flex-direction:column;align-items:center;gap:9px;text-align:center;padding:22px;max-width:340px;}
.gdi-stall-card .gdi-stall-ico{font-size:36px;color:var(--ferreto-primary,#ff8b9f);
  filter:drop-shadow(0 4px 14px rgba(255,139,159,.5));}
.gdi-stall-title{font-family:var(--ferreto-font-display,'Poppins',sans-serif);font-size:15px;font-weight:600;color:#fff;}
.gdi-stall-sub{font-size:12px;color:#9aa4b8;margin-bottom:8px;line-height:1.4;}
.gdi-stall-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;}
.gdi-play-hint{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:20;cursor:pointer;
  background:rgba(0,0,0,.28);opacity:0;transition:opacity .2s;pointer-events:none;}
.gdi-play-hint.show{opacity:1;pointer-events:auto;}
.gdi-play-hint .bi{font-size:54px;color:#fff;filter:drop-shadow(0 6px 20px rgba(0,0,0,.6));}
.gdi-play-hint small{position:absolute;bottom:18px;color:#fff;font-size:12px;opacity:.85;}
`;document.head.appendChild(s);
  }

  function attach(v){
    if(!v||v.__gdiGuard)return;v.__gdiGuard=true;
    const st={timer:null,retryUsed:false,lastT:v.currentTime||0,lastAt:Date.now(),
              overlay:null,hint:null,hintTimer:null};

    function clearTimer(){if(st.timer){clearTimeout(st.timer);st.timer=null;}}
    function clearOverlay(){if(st.overlay){st.overlay.remove();st.overlay=null;}}
    function arm(){clearTimer();st.timer=setTimeout(check,STALL_MS);}

    function check(){
      if(!v.parentNode){clearOverlay();clearTimer();return;}
      if(v.paused){arm();return;}
      const dt=(v.currentTime||0)-st.lastT;
      if(dt>0.1){
        st.lastT=v.currentTime||0;st.lastAt=Date.now();clearOverlay();arm();return;
      }
      if(Date.now()-st.lastAt>=STALL_MS){
        if(!st.retryUsed){
          st.retryUsed=true;
          console.warn('[GDI Player-Guard] vídeo parou — retry silencioso');
          try{
            const cur=v.currentTime;
            v.load();
            v.play().catch(function(){});
            const onCanPlay=function(){try{if(cur>0)v.currentTime=cur;}catch(_){}v.removeEventListener('loadedmetadata',onCanPlay);};
            v.addEventListener('loadedmetadata',onCanPlay,{once:true});
          }catch(_){}
          st.lastAt=Date.now();st.lastT=0;
          arm();
        }else{
          showOverlay();
        }
      }else{arm();}
    }

    function showOverlay(){
      if(st.overlay)return;
      const wrap=v.closest('.gdi-player-wrap')||v.parentNode;
      if(!wrap)return;
      st.overlay=document.createElement('div');
      st.overlay.className='gdi-stall-overlay';
      st.overlay.innerHTML=
        '<div class="gdi-stall-card">'+
          '<i class="bi bi-exclamation-triangle gdi-stall-ico"></i>'+
          '<div class="gdi-stall-title">O vídeo parece ter travado</div>'+
          '<div class="gdi-stall-sub">Sem progresso há '+Math.round(STALL_MS/1000)+'s. O stream do Drive pode ter expirado ou ficado lento.</div>'+
          '<div class="gdi-stall-actions">'+
            '<button class="gdi-btn gdi-btn-primary" data-act="reload"><i class="bi bi-arrow-clockwise"></i> Recarregar</button>'+
            '<button class="gdi-btn gdi-btn-ghost" data-act="wait">Continuar aguardando</button>'+
          '</div>'+
        '</div>';
      wrap.appendChild(st.overlay);
      st.overlay.querySelector('[data-act="reload"]').addEventListener('click',function(){
        clearOverlay();st.retryUsed=false;st.lastAt=Date.now();st.lastT=0;
        try{v.load();v.play().catch(function(){});}catch(_){}
        arm();
      });
      st.overlay.querySelector('[data-act="wait"]').addEventListener('click',function(){
        clearOverlay();st.lastAt=Date.now();arm();
      });
    }

    function showHint(){
      if(st.hint)return;
      const wrap=v.closest('.gdi-player-wrap')||v.parentNode;
      if(!wrap)return;
      st.hint=document.createElement('div');
      st.hint.className='gdi-play-hint';
      st.hint.innerHTML='<i class="bi bi-play-circle-fill"></i><small>Toque para iniciar</small>';
      st.hint.addEventListener('click',function(){
        v.muted=false;
        v.play().catch(function(){v.muted=true;v.play().catch(function(){});});
        hideHint();
      });
      wrap.appendChild(st.hint);
      requestAnimationFrame(function(){st.hint&&st.hint.classList.add('show');});
    }
    function hideHint(){if(st.hint){st.hint.remove();st.hint=null;}clearTimeout(st.hintTimer);}
    function armHint(){clearTimeout(st.hintTimer);st.hintTimer=setTimeout(function(){
      if(v.paused&&v.readyState<3)showHint();
    },FIRST_PLAY_HINT_MS);}

    v.addEventListener('timeupdate',function(){
      st.lastT=v.currentTime||0;st.lastAt=Date.now();if(st.overlay)clearOverlay();hideHint();
    });
    v.addEventListener('waiting',function(){arm();});
    v.addEventListener('playing',function(){st.lastAt=Date.now();if(st.overlay)clearOverlay();hideHint();arm();});
    v.addEventListener('stalled',function(){arm();});
    v.addEventListener('canplay',function(){hideHint();});
    v.addEventListener('play',function(){arm();armHint();});
    v.addEventListener('pause',function(){clearTimer();});
    v.addEventListener('error',function(){
      console.error('[GDI Player-Guard] erro de mídia',v.error);
      if(!st.retryUsed){st.retryUsed=true;try{v.load();v.play().catch(function(){});}catch(_){}arm();}
      else{showOverlay();}
    });
    v.addEventListener('ended',function(){clearTimer();clearOverlay();});

    arm();armHint();
    console.log('[GDI Player-Guard] monitorando vídeo');
  }

  Bus.onGlobal('media:ready',function(d){
    if(d&&d.type==='video'&&d.el)attach(d.el);
  });

  window.GDI_MODULES.push({name:'player-guard',init:function(){
    try{
      const v=document.querySelector('.gdi-player-wrap video');
      if(v)attach(v);
    }catch(_){}
  }});
})();

// ═══════════════════════════════════════════════════════════════
// M-AI: WIDGET DA ISA — A MAIS BELA (tutora de estudos)
// Botão flutuante + painel de chat. PRIORIDADE de backend:
//   1) IA do navegador (Chrome Prompt API / Gemini Nano via
//      ai.languageModel — ativada por extensões Chrome). 100% local,
//      sem servidor, sem custo, funciona offline após download.
//   2) POST /api/ai (worker.js → CF Workers AI ou OpenAI-compat).
// Conversa persistida em sessionStorage. UI no <html> (fora do
// body) para sobreviver a trocas de página. Estilo Ferreto.
// ═══════════════════════════════════════════════════════════════
(function(){
  if(window.__gdiAiWidget)return;window.__gdiAiWidget=true;

  const ISA_NAME='ISA';
  const ISA_TAG='a mais bela';
  const ISA_SYS='Você é a ISA — "a mais bela" — uma tutora de estudos brasileira, ' +
    'amigável, calorosa e didática. Acompanha alunos em uma plataforma de videoaulas ' +
    '(Google Drive Index). Responda em português, de forma clara e objetiva. Ajude com ' +
    'dúvidas das aulas, resumos, explicações e organização dos estudos. Se não souber, ' +
    'diga. Seja motivadora e acolhedora. Use Markdown quando ajudar.';

  // CSS
  if(!document.getElementById('gdi-ai-style')){
    const s=document.createElement('style');s.id='gdi-ai-style';s.textContent=`
#gdi-ai-fab{position:fixed;bottom:20px;right:20px;z-index:10001;width:56px;height:56px;border-radius:50%;
  border:0;cursor:pointer;background:linear-gradient(135deg,#ff8b9f 0%,#c026d3 55%,#5ddeda 130%);
  color:#fff;font-size:24px;display:flex;align-items:center;justify-content:center;
  box-shadow:0 8px 28px -6px rgba(255,139,159,.5),0 0 0 1px rgba(255,255,255,.12);
  transition:transform .18s,box-shadow .18s;}
#gdi-ai-fab:hover{transform:scale(1.08) translateY(-2px);box-shadow:0 12px 36px -6px rgba(255,139,159,.6);}
#gdi-ai-fab .gdi-ai-fab-ico{font-size:26px;line-height:1;}
#gdi-ai-fab-badge{position:absolute;top:-2px;right:-2px;width:16px;height:16px;border-radius:50%;
  background:#5ddeda;border:2px solid var(--ferreto-bg,#070910);display:none;}
#gdi-ai-fab-badge.show{display:block;animation:gdi-ai-pulse 1.6s ease infinite;}
@keyframes gdi-ai-pulse{0%,100%{transform:scale(1);}50%{transform:scale(1.25);}}
#gdi-ai-panel{position:fixed;bottom:88px;right:20px;z-index:10001;width:380px;max-width:calc(100vw - 32px);
  height:540px;max-height:calc(100vh - 120px);display:none;flex-direction:column;
  background:var(--ferreto-surface,rgba(22,27,38,.92));
  -webkit-backdrop-filter:blur(22px);backdrop-filter:blur(22px);
  border:1px solid var(--ferreto-border-strong,rgba(255,255,255,.16));
  border-radius:18px;box-shadow:0 20px 60px -12px rgba(0,0,0,.6);
  overflow:hidden;transform-origin:bottom right;animation:gdi-ai-in .22s ease;font-family:var(--ferreto-font-body,'Rubik',sans-serif);}
@keyframes gdi-ai-in{from{opacity:0;transform:scale(.92) translateY(12px);}to{opacity:1;transform:none;}}
#gdi-ai-panel.open{display:flex;}
#gdi-ai-head{display:flex;align-items:center;gap:10px;padding:14px 16px;
  background:linear-gradient(135deg,rgba(255,139,159,.18),rgba(93,222,218,.1));
  border-bottom:1px solid var(--ferreto-border,rgba(255,255,255,.09));}
#gdi-ai-head .gdi-ai-avatar{width:38px;height:38px;border-radius:50%;flex:none;
  background:linear-gradient(135deg,#ff8b9f,#c026d3);display:flex;align-items:center;justify-content:center;
  color:#fff;font-size:18px;font-weight:700;font-family:var(--ferreto-font-display,'Poppins',sans-serif);
  box-shadow:0 0 0 2px rgba(255,255,255,.1) inset;}
#gdi-ai-head .gdi-ai-info{flex:1;min-width:0;}
#gdi-ai-head .gdi-ai-name{font-family:var(--ferreto-font-display,'Poppins',sans-serif);font-size:15px;font-weight:700;color:var(--ferreto-text,#f3f5fa);line-height:1.1;}
#gdi-ai-head .gdi-ai-name .gdi-ai-tag{font-size:10px;font-weight:500;color:var(--ferreto-secondary,#5ddeda);margin-left:5px;letter-spacing:.02em;}
#gdi-ai-head .gdi-ai-status{font-size:11px;color:var(--ferreto-text-muted,#9aa4b8);display:flex;align-items:center;gap:5px;margin-top:2px;}
#gdi-ai-head .gdi-ai-dot{width:7px;height:7px;border-radius:50%;background:#3fb950;}
#gdi-ai-head .gdi-ai-dot.local{background:#5ddeda;}
#gdi-ai-close{background:none;border:0;color:var(--ferreto-text-muted,#9aa4b8);font-size:18px;cursor:pointer;padding:4px;border-radius:8px;}
#gdi-ai-close:hover{background:var(--ferreto-surface-3,rgba(255,255,255,.08));color:var(--ferreto-text,#f3f5fa);}
#gdi-ai-body{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;}
#gdi-ai-body::-webkit-scrollbar{width:6px;}
#gdi-ai-body::-webkit-scrollbar-thumb{background:var(--ferreto-surface-3,rgba(255,255,255,.08));border-radius:20px;}
.gdi-ai-msg{display:flex;gap:8px;max-width:88%;animation:gdi-ai-in .2s ease;}
.gdi-ai-msg.user{align-self:flex-end;flex-direction:row-reverse;}
.gdi-ai-msg .gdi-ai-bubble{padding:10px 13px;border-radius:14px;font-size:13.5px;line-height:1.5;word-break:break-word;}
.gdi-ai-msg.assistant .gdi-ai-bubble{background:var(--ferreto-surface-3,rgba(255,255,255,.08));color:var(--ferreto-text,#f3f5fa);border-bottom-left-radius:4px;}
.gdi-ai-msg.user .gdi-ai-bubble{background:linear-gradient(135deg,#ff8b9f,#c026d3);color:#fff;border-bottom-right-radius:4px;}
.gdi-ai-msg .gdi-ai-bubble p{margin:0 0 6px;} .gdi-ai-msg .gdi-ai-bubble p:last-child{margin:0;}
.gdi-ai-msg .gdi-ai-bubble code{background:rgba(0,0,0,.25);padding:1px 5px;border-radius:4px;font-size:12px;}
.gdi-ai-msg .gdi-ai-bubble pre{background:rgba(0,0,0,.3);padding:8px;border-radius:8px;overflow-x:auto;margin:6px 0;}
.gdi-ai-typing{display:flex;gap:4px;padding:4px 0;}
.gdi-ai-typing span{width:7px;height:7px;border-radius:50%;background:var(--ferreto-text-muted,#9aa4b8);animation:gdi-ai-typ 1.2s ease infinite;}
.gdi-ai-typing span:nth-child(2){animation-delay:.2s;} .gdi-ai-typing span:nth-child(3){animation-delay:.4s;}
@keyframes gdi-ai-typ{0%,60%,100%{opacity:.3;transform:translateY(0);}30%{opacity:1;transform:translateY(-4px);}}
#gdi-ai-input-wrap{display:flex;gap:8px;padding:12px;border-top:1px solid var(--ferreto-border,rgba(255,255,255,.09));background:var(--ferreto-surface-2,rgba(255,255,255,.045));}
#gdi-ai-input{flex:1;background:var(--ferreto-surface-3,rgba(255,255,255,.08));border:1px solid var(--ferreto-border,rgba(255,255,255,.09));
  border-radius:999px;padding:10px 14px;color:var(--ferreto-text,#f3f5fa);font-size:13.5px;outline:none;font-family:inherit;transition:.15s;}
#gdi-ai-input:focus{border-color:var(--ferreto-primary,#ff8b9f);box-shadow:0 0 0 3px rgba(255,139,159,.25);}
#gdi-ai-input::placeholder{color:var(--ferreto-text-faint,#6b7488);}
#gdi-ai-send{width:38px;height:38px;border-radius:50%;border:0;cursor:pointer;flex:none;
  background:linear-gradient(135deg,#ff8b9f,#c026d3);color:#fff;font-size:16px;display:flex;align-items:center;justify-content:center;transition:.15s;}
#gdi-ai-send:hover{filter:brightness(1.1);transform:scale(1.05);}
#gdi-ai-send:disabled{opacity:.5;cursor:default;transform:none;}
.gdi-ai-err{font-size:12px;color:#ff8b8b;text-align:center;padding:8px;margin:0 4px;}
.gdi-ai-provider{font-size:10px;color:var(--ferreto-text-faint,#6b7488);text-align:center;padding:2px 0 6px;letter-spacing:.02em;}
.gdi-ai-provider b{color:var(--ferreto-secondary,#5ddeda);}
@media(max-width:480px){#gdi-ai-panel{right:8px;left:8px;width:auto;bottom:80px;height:calc(100vh - 160px);}}
`;document.documentElement.appendChild(s);
  }

  const STORE='gdi-ai-chat';
  let messages=[];
  try{messages=JSON.parse(sessionStorage.getItem(STORE))||[];}catch(_){}

  function save(){try{sessionStorage.setItem(STORE,JSON.stringify(messages.slice(-20)));}catch(_){}}

  function renderMd(txt){
    if(window.marked){try{return marked.parse(txt);}catch(_){}}
    return txt.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
  }
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

  // ── Detecção da IA do navegador ──
  // Chrome 127+ com "Prompt API for Gemini Nano" habilitado expõe
  // `ai.languageModel`. Extensões Chrome ativam/desativam isso.
  // Também tenta o alias antigo `window.ai`.
  let _browserAIState='unknown'; // 'unknown' | 'ready' | 'download' | 'no'
  let _browserSession=null;
  let _providerLabel='verificando…';

  async function detectBrowserAI(){
    try{
      const ai=(window.ai&&window.ai.languageModel)?window.ai.languageModel:(window.LanguageModel);
      if(ai&&typeof ai.capabilities==='function'){
        const caps=await ai.capabilities();
        if(caps&&caps.available==='readily'){_browserAIState='ready';return 'ready';}
        if(caps&&caps.available==='after-download'){_browserAIState='download';return 'download';}
        _browserAIState='no';return 'no';
      }
    }catch(_){}
    _browserAIState='no';return 'no';
  }

  async function getBrowserSession(){
    if(_browserSession)return _browserSession;
    try{
      const ai=(window.ai&&window.ai.languageModel)?window.ai.languageModel:(window.LanguageModel);
      if(!ai)return null;
      _browserSession=await ai.create({
        systemPrompt:ISA_SYS,
        temperature:0.7,
        topK:3
      });
      return _browserSession;
    }catch(e){console.warn('[ISA] não pôde criar sessão do navegador:',e);_browserSession=null;return null;}
  }

  async function callBrowserAI(history){
    const sess=await getBrowserSession();
    if(!sess)return null;
    // Prompt API mantém o contexto internamente; enviamos só a última
    // mensagem do usuário (a sessão lembra as anteriores).
    const lastUser=[...history].reverse().find(m=>m.role==='user');
    if(!lastUser)return null;
    const out=await sess.prompt(lastUser.content);
    return out||null;
  }

  function updateStatus(){
    const dot=panel.querySelector('.gdi-ai-dot');
    const st=panel.querySelector('.gdi-ai-status');
    if(!dot||!st)return;
    if(_browserAIState==='ready'){dot.classList.add('local');st.innerHTML='<span class="gdi-ai-dot local"></span> IA do navegador · 100% local';_providerLabel='IA do navegador <b>(Chrome/Gemini Nano — local)</b>';}
    else if(_browserAIState==='download'){dot.classList.remove('local');st.innerHTML='<span class="gdi-ai-dot"></span> Baixando modelo local…';_providerLabel='baixando modelo do navegador…';}
    else{dot.classList.remove('local');st.innerHTML='<span class="gdi-ai-dot"></span> 智谱AI (Zhipu) · online';_providerLabel='智谱AI <b>(Zhipu GLM · /api/ai)</b>';}
    const pv=panel.querySelector('.gdi-ai-provider');
    if(pv)pv.innerHTML='via '+_providerLabel;
  }

  // UI no <html> (fora do body) — sobrevive a trocas de página
  const root=GDI_ROOT();
  const fab=document.createElement('button');
  fab.id='gdi-ai-fab';fab.title='ISA — a mais bela · sua tutora de estudos';
  fab.innerHTML='<span class="gdi-ai-fab-ico">💖</span><span id="gdi-ai-fab-badge"></span>';
  root.appendChild(fab);

  const panel=document.createElement('div');
  panel.id='gdi-ai-panel';
  panel.innerHTML=`
    <div id="gdi-ai-head">
      <div class="gdi-ai-avatar">ISA</div>
      <div class="gdi-ai-info">
        <div class="gdi-ai-name">${ISA_NAME}<span class="gdi-ai-tag">— ${ISA_TAG}</span></div>
        <div class="gdi-ai-status"><span class="gdi-ai-dot"></span> verificando…</div>
      </div>
      <button id="gdi-ai-close" title="Fechar"><i class="bi bi-x-lg"></i></button>
    </div>
    <div id="gdi-ai-body"></div>
    <div class="gdi-ai-provider"></div>
    <div id="gdi-ai-input-wrap">
      <input id="gdi-ai-input" type="text" placeholder="Pergunte à ISA sobre a aula, peça um resumo..." autocomplete="off">
      <button id="gdi-ai-send" title="Enviar"><i class="bi bi-send-fill"></i></button>
    </div>`;
  root.appendChild(panel);

  const body=panel.querySelector('#gdi-ai-body');
  const input=panel.querySelector('#gdi-ai-input');
  const sendBtn=panel.querySelector('#gdi-ai-send');
  const badge=panel.querySelector('#gdi-ai-fab-badge');

  function addMsg(role,text){
    const m={role,text};
    messages.push(m);save();
    const el=document.createElement('div');
    el.className='gdi-ai-msg '+(role==='user'?'user':'assistant');
    el.innerHTML='<div class="gdi-ai-bubble">'+(role==='user'?esc(text):renderMd(text))+'</div>';
    body.appendChild(el);body.scrollTop=body.scrollHeight;
    return el;
  }
  function renderHistory(){
    body.innerHTML='';
    if(!messages.length){
      addMsg('assistant','Oi! Sou a **ISA — a mais bela** 💖, sua tutora de estudos.\n\nPosso ajudar com:\n- Explicar um tema da aula\n- Fazer um resumo\n- Tirar dúvidas\n- Sugerir um plano de estudos\n\nO que você precisa hoje?');
      messages.pop();save(); // saudação não conta no histórico
      return;
    }
    messages.forEach(m=>{
      const el=document.createElement('div');
      el.className='gdi-ai-msg '+(m.role==='user'?'user':'assistant');
      el.innerHTML='<div class="gdi-ai-bubble">'+(m.role==='user'?esc(m.text):renderMd(m.text))+'</div>';
      body.appendChild(el);
    });
    body.scrollTop=body.scrollHeight;
  }

  let typingEl=null;
  function showTyping(){
    typingEl=document.createElement('div');typingEl.className='gdi-ai-msg assistant';
    typingEl.innerHTML='<div class="gdi-ai-bubble"><div class="gdi-ai-typing"><span></span><span></span><span></span></div></div>';
    body.appendChild(typingEl);body.scrollTop=body.scrollHeight;
  }
  function hideTyping(){if(typingEl){typingEl.remove();typingEl=null;}}

  let busy=false;
  async function send(){
    const txt=input.value.trim();if(!txt||busy)return;
    busy=true;sendBtn.disabled=true;input.value='';
    addMsg('user',txt);
    showTyping();

    // histórico para enviar (role/content)
    const hist=messages.filter(m=>m.role!=='system').slice(-8).map(m=>({role:m.role,content:m.text}));

    let response=null,usedLocal=false;
    // 1) tenta IA do navegador
    if(_browserAIState==='ready'){
      try{
        response=await callBrowserAI(hist);
        if(response)usedLocal=true;
      }catch(e){console.warn('[ISA] IA do navegador falhou, caindo p/ servidor:',e);response=null;}
    }
    // 2) fallback servidor /api/ai
    if(!response){
      try{
        const r=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify({message:txt,messages:hist})});
        const data=await r.json();
        hideTyping();
        if(data.ok&&data.response){response=data.response;}
        else{
          const errEl=document.createElement('div');errEl.className='gdi-ai-err';
          errEl.textContent=data.error||'Não consegui responder agora. Tente novamente.';
          body.appendChild(errEl);body.scrollTop=body.scrollHeight;
          setTimeout(()=>errEl.remove(),5000);
          busy=false;sendBtn.disabled=false;input.focus();
          return;
        }
      }catch(e){
        hideTyping();
        const errEl=document.createElement('div');errEl.className='gdi-ai-err';
        errEl.textContent='Erro de conexão. Verifique sua internet.';
        body.appendChild(errEl);body.scrollTop=body.scrollHeight;
        setTimeout(()=>errEl.remove(),5000);
        busy=false;sendBtn.disabled=false;input.focus();
        return;
      }
    }
    hideTyping();
    addMsg('assistant',response);
    if(usedLocal)updateStatus(); // confirma que usou local
    busy=false;sendBtn.disabled=false;input.focus();
  }

  function toggle(){
    const open=panel.classList.toggle('open');
    if(open){badge.classList.remove('show');renderHistory();updateStatus();setTimeout(()=>input.focus(),100);}
  }
  fab.addEventListener('click',toggle);
  panel.querySelector('#gdi-ai-close').addEventListener('click',()=>panel.classList.remove('open'));
  sendBtn.addEventListener('click',send);
  input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}});

  // ── Ativação condicional ──
  // O botão 💖 só aparece se houver IA disponível: (1) IA do navegador
  // pronta, OU (2) /api/ai/status retornar enabled=true. Caso contrário
  // o widget fica oculto (display:none) mas TODO o código permanece
  // intacto — basta configurar ZHIPU_API_KEY no Cloudflare para ativar.
  function hideWidget(){fab.style.display='none';panel.style.display='none';}
  function showWidget(){fab.style.display='';panel.style.display='';}

  let _serverEnabled=null; // null=desconhecido, true/false
  function checkServerStatus(){
    return fetch('/api/ai/status',{cache:'no-store'}).then(r=>r.ok?r.json():{enabled:false}).then(d=>{ _serverEnabled=!!(d&&d.enabled); return _serverEnabled; }).catch(()=>{ _serverEnabled=false; return false; });
  }

  // detecta a IA do navegador ao carregar (1×) + status do servidor
  Promise.all([
    detectBrowserAI(),
    checkServerStatus()
  ]).then(function(){
    updateStatus();
    const browserReady=(_browserAIState==='ready');
    const serverOk=!!_serverEnabled;
    console.log('[ISA] IA do navegador:',_browserAIState,'| servidor habilitado:',serverOk);
    if(browserReady||serverOk){
      showWidget();
    }else{
      // Nenhum backend disponível — esconde o botão mas mantém o código.
      // Ativa automaticamente quando o usuário configurar ZHIPU_API_KEY.
      hideWidget();
      console.log('[ISA] widget oculto — configure ZHIPU_API_KEY no Cloudflare para ativar');
    }
  });

  // badge de novidade após 8s se nunca abriu (só se visível)
  if(!sessionStorage.getItem('gdi-ai-seen')){
    setTimeout(()=>{if(fab.style.display!=='none'&&!panel.classList.contains('open'))badge.classList.add('show');},8000);
  }
  fab.addEventListener('click',()=>{sessionStorage.setItem('gdi-ai-seen','1');},{once:true});

  console.log('[GDI Extras] M-AI widget ISA — a mais bela ativo');
})();