/* ═══════════════════════════════════════════════════════════════
   gdi-extras.js v2.2 — COMPLETO
   • M20: playlist no extras — recolhível (Alfacon), ✓ confiável
     (chave dupla + auto-cura), filtro, 🔄 cache, 💾 playlist.json
   • Correção do bug "nome vira tamanho": seletor do span do tamanho
     agora pega só filho DIRETO do item (el.lastElementChild)
   • M13 v2: card Continuar com retry no user:ready
   • M10 v3: foco força player a 100% (CSS + inline)
   • M5 v3: auto-assistido grava nas duas chaves
   ═══════════════════════════════════════════════════════════════ */
console.log('[GDI Extras Modular] v2.2 carregado');

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
#gdi-pom-root,#gdi-sleep-btn{opacity:.30;transition:opacity .25s ease;}
#gdi-pom-root:hover,#gdi-sleep-btn:hover{opacity:.95;}
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

// ── Loader dos módulos — observa #content (páginas de vídeo montam o DOM async) ──
(function(){
  let timer=null;
  function runAll(){
    (window.GDI_MODULES||[]).forEach(m=>{
      try{ if(m&&typeof m.init==='function') m.init(); }
      catch(e){ console.error('[GDI módulo]',m&&m.name,e); }
    });
  }
  function schedule(){clearTimeout(timer);timer=setTimeout(runAll,80);}
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

// ═══ M4: ATALHOS (N/P, J = próxima não assistida, ]/[ trechos) ═══
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

// ═══ M5 v3: CRONÔMETRO + AUTO-ASSISTIDO 90% (chave dupla via M20) ═══
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

// ═══ M6: MARCAS NA TIMELINE + NOTAS + REVISÃO + EXPORT (md/anki) + DUPLO-TOQUE ═══
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
    document.body.appendChild(m);
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
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),5000);
    showToast(notes.length+' anota\u00e7\u00e3o'+(notes.length>1?'\u00f5es':'')+' exportada'+(notes.length>1?'s':''));
  }
  window.GDI_REVIEW_SPAN=SPAN;
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
      Bus.onGlobal('user:ready',render);
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
      skipBtn.innerHTML=S
        ?'<i class="bi bi-skip-forward-fill"></i> Pular introdu\u00e7\u00e3o ('+gdiFmtTime(S)+')'
        :'<i class="bi bi-skip-forward-fill"></i> Pular introdu\u00e7\u00e3o';
      skipBtn.style.display=show?'block':'none';
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
  const frames=new Map();let gen=0;
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

// ═══ M10 v3: MODOS DE FOCO + BOTÃO ASSISTIDO (chave dupla) ═══
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
  window.GDI_MODULES.push({name:'focus-modes',init:function(){
    const slot=document.getElementById('gdi-slot-modes');
    if(!slot||slot.dataset.m10)return;
    slot.dataset.m10='1';
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
      const study=document.getElementById('gdi-study');if(!study)return;
      const grid=study.querySelector('.gdi-study-grid');
      const right=study.querySelector('.gdi-study-right');
      const left=study.querySelector('.gdi-study-left');
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
    Bus.onGlobal('watched:changed',updBtn);
    Bus.onGlobal('user:ready',updBtn);
    Bus.onGlobal('video:switched',()=>setTimeout(updBtn,150));
  }});
})();

// ═══ M11: MODO DESCANSO (áudio + despertar) ═══
(function(){
  let wakeBound=false;
  window.GDI_MODULES.push({name:'sleep-mode',init:function(){
    if(!document.querySelector('.gdi-player-wrap')&&!document.getElementById('aplayer-container'))return;
    if(document.getElementById('gdi-sleep-btn'))return;
    const isVideoPage=!!document.querySelector('.gdi-player-wrap');
    const overlay=document.createElement('div');
    overlay.id='gdi-sleep-overlay';
    overlay.style.cssText='position:fixed;inset:0;z-index:8000;background:#000;opacity:0;pointer-events:none;transition:opacity 3s ease;cursor:pointer;';
    overlay.title='Clique para sair do modo descanso';
    document.body.appendChild(overlay);
    const btn=document.createElement('button');
    btn.id='gdi-sleep-btn';
    btn.innerHTML='<i class="bi bi-moon-stars-fill"></i>';
    btn.title=isVideoPage?'Modo descanso (apenas \u00e1udio) \u2014 clique para ligar':'Modo descanso';
    btn.style.cssText='position:fixed;bottom:76px;left:16px;z-index:8001;background:rgba(18,18,28,0.92);border:1.5px solid rgba(255,255,255,0.15);border-radius:50%;width:40px;height:40px;color:#74c0fc;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,0.5);';
    document.body.appendChild(btn);
    let sleeping=false,fadeTimer=null;
    const FADE_DELAY=8000,FADE_TARGET=0.97;
    function enter(){
      if(sleeping)return;
      try{if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen();}catch(e){}
      sleeping=true;
      overlay.style.pointerEvents='all';
      overlay.style.opacity=String(FADE_TARGET);
      btn.innerHTML='<i class="bi bi-sun-fill"></i>';
      btn.style.color='#ffd43b';
    }
    function exit(){
      sleeping=false;
      overlay.style.opacity='0';
      overlay.style.pointerEvents='none';
      btn.innerHTML='<i class="bi bi-moon-stars-fill"></i>';
      btn.style.color='#74c0fc';
      clearTimeout(fadeTimer);
    }
    function sched(){clearTimeout(fadeTimer);fadeTimer=setTimeout(enter,FADE_DELAY);}
    function cancel(){clearTimeout(fadeTimer);if(sleeping)exit();}
    overlay.addEventListener('click',exit);
    btn.addEventListener('click',()=>{sleeping?exit():enter();});
    Bus.onGlobal('media:ready',({type,el,ap})=>{
      if(ap){
        if(ap.__gdiSleep)return;ap.__gdiSleep=true;
        try{ap.on('play',sched);ap.on('pause',cancel);ap.on('ended',cancel);}catch(_){}
        return;
      }
      if(type==='video'&&el&&!el.__gdiSleepEnd){
        el.__gdiSleepEnd=true;
        try{el.addEventListener('ended',exit);}catch(_){}
      }
    });
    if(!wakeBound){
      wakeBound=true;
      ['mousemove','keydown','touchstart'].forEach(ev=>{
        document.addEventListener(ev,()=>{
          if(sleeping){
            exit();
            const a=window._gdiAPlayer;
            if(a&&a.audio&&!a.audio.paused)sched();
          }
        },{passive:true});
      });
    }
  }});
})();

// ═══ M12: POMODORO v2.4 ═══
(function(){
  window.GDI_MODULES.push({name:'pomodoro',init:function(){
    if(window.__gdiPomodoroBooted)return;
    window.__gdiPomodoroBooted=true;
    const $id=x=>document.getElementById(x);
    const fmt=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(Math.floor(s%60)).padStart(2,'0');
    const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
    const safeParse=s=>{try{return JSON.parse(s)}catch(e){return null}};
    const flashEl=document.createElement('div');flashEl.id='gdi-pom-flash';document.body.appendChild(flashEl);
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
    document.body.appendChild(root);
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
    document.addEventListener('click',e=>{if(panelOpen&&!root.contains(e.target)){panelOpen=false;$id('gdi-pom-panel').classList.remove('open');}},{capture:true});
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
    new MutationObserver(()=>{if(!document.body.contains(root))document.body.appendChild(root);
      if(!document.body.contains(flashEl))document.body.appendChild(flashEl);}).observe(document.body,{childList:true});
    updateUI();
    console.log('[GDI Pomodoro] v2.4 pronto');
  }});
})();

// ═══ M13: CARD "CONTINUAR" EM CASCATA (v19.1) ═══
// O tile reflete a SUBÁRVORE da pasta atual:
// • Home (/)                → aula mais recente global
// • Drive /6:/              → aula mais recente dentro do drive 6
// • Pasta em qualquer nível → aula mais recente DENTRO daquela pasta
//   (ex.: em DISCIPLINAS ISOLADAS mostra a última de qualquer disciplina
//    dentro dela; em MATEMÁTICA, a última de MATEMÁTICA, etc.)
// O label da pasta mostra o PRÓXIMO nível, indicando em qual ramo você parou.
(function(){
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
  // a subárvore da pasta atual: p começa com a pasta (ou é a home = tudo)
  function inSubtree(path){
    const cur=normPath(window.location.pathname);
    if(cur===''||/^\/\d+:$/.test(cur))return true;       // home: tudo
    const prefix=cur+'/';
    return normPath(path).indexOf(prefix)===0;
  }
  function pickTarget(){
    if(!gdiOkPath(window.location.pathname)&&!/^\/(\d+:)?\/?$/.test(window.location.pathname)&&!window.location.pathname.endsWith('/'))return null;
    const d=GDIUser.dump();if(!d)return null;
    let best=null,bestAt=-1;
    const consider=(k,at)=>{
      if(!k||!gdiOkPath(k))return;
      if(!inSubtree(k))return;
      const a=Number(at)||0;
      if(a>bestAt){bestAt=a;best=k;}
    };
    if(d.watched)for(const k in d.watched)consider(k,d.watched[k]&&d.watched[k].at);
    if(d.resume)for(const k in d.resume)consider(k,d.resume[k]&&d.resume[k].at);
    const last=GDIUser.getLast();
    if(last&&last.path&&gdiOkPath(last.path)){
      const a=Number(last.at)||0;
      if(a>bestAt)best=last.path;
    }
    return best;
  }
  function playerHref(p){
    const s=String(p||'');
    if(!s||!gdiOkPath(s))return'';
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
  // labels em cascata: [drive atual?] [ramo seguinte à pasta atual] [curso…]
  function labels(target){
    const cur=normPath(window.location.pathname);
    const isDriveRoot=/^\/\d+:$/.test(cur);
    const tNorm=normPath(target);
    // remove o prefixo da pasta atual do caminho da aula
    let rest=tNorm;
    if(!isDriveRoot&&tNorm.indexOf(cur+'/')===0)rest=tNorm.slice(cur.length+1);
    const seg=rest.split('/').filter(Boolean);
    let drivePart='';
    const cd=window.current_drive_order;
    if(isDriveRoot&&window.drive_names&&window.drive_names[cd])drivePart=window.drive_names[cd];
    let ramo='';
    if(seg.length>1){try{ramo=decodeURIComponent(seg[0])}catch(_){ramo=seg[0]}}
    let name;
    try{name=decodeURIComponent(seg[seg.length-1]||'')}catch(_){name=seg[seg.length-1]||''}
    return{
      name:(name||'').replace(/\.[a-z0-9]+$/i,''),
      folder:ramo||drivePart||'',
      drive:drivePart
    };
  }
  function driveLabel(){
    const cur=normPath(window.location.pathname);
    const m=/^\/(\d+):$/.exec(cur);
    const dn=window.drive_names;
    if(m&&dn&&dn[parseInt(m[1],10)])return dn[parseInt(m[1],10)];
    return '';
  }
  function srsDueCount(){
    const d=GDIUser.dump();if(!d)return 0;
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
    const due=(function(){
      const d=GDIUser.dump();if(!d)return[];
      const out=[];const now=Date.now();
      for(const k in(d.notes||{})){
        (d.notes[k]||[]).forEach(x=>{
          const id=k+'|'+x.at;
          const e=d.srs&&d.srs[id];
          const due2=e?e.due:(x.at+86400000);
          if(due2<=now)out.push({id,key:k,at:x.at,text:x.text,t:x.t,due:due2});
        });
      }
      out.sort((a,b)=>a.due-b.due);
      return out;
    })();
    const ov=document.createElement('div');ov.id='gdi-srs-panel';
    ov.style.cssText='position:fixed;inset:0;z-index:10002;background:rgba(5,7,10,.82);display:flex;align-items:center;justify-content:center;padding:20px;';
    document.body.appendChild(ov);
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
        <div style="font-size:12px;color:#7aa2ff;margin-bottom:4px;">${escHtml(lbl)}${n.t!=null?' \u00b7 '+gdiFmtTime(n.t):''}</div>
        <div style="font-size:15px;line-height:1.5;margin-bottom:16px;">${escHtml(n.text)}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button id="gdi-srs-good" class="gdi-btn gdi-btn-primary"><i class="bi bi-check2"></i> Lembrei</button>
          <button id="gdi-srs-again" class="gdi-mode-btn"><i class="bi bi-arrow-repeat"></i> N\u00e3o lembrei</button>
          <a class="gdi-mode-btn" data-gdi-go href="${escHtml(playerHref(n.key))}"><i class="bi bi-play-fill"></i> Abrir aula</a>
        </div></div>`;
      document.getElementById('gdi-srs-close').addEventListener('click',()=>ov.remove());
      document.getElementById('gdi-srs-good').addEventListener('click',()=>{GDIUser.srsGrade(n.id,true);idx++;render();});
      document.getElementById('gdi-srs-again').addEventListener('click',()=>{GDIUser.srsGrade(n.id,false);idx++;render();});
      ov.querySelectorAll('[data-gdi-go]').forEach(a=>a.addEventListener('click',safeGo));
    }
    render();
  }
  window.GDI_MODULES.push({name:'continue-card',init:function(){
    const p=window.location.pathname;
    if(!GDIUser.loaded())return;
    const wrap=document.querySelector('#content .gdi-wrap');
    if(!wrap)return;
    const old=document.getElementById('gdi-home-card');if(old)old.remove();
    const isHome=p==='/'||/^\/\d+:$/.test(p);
    const target=pickTarget();
    const logged=GDIUser.auth()!=='out';
    const d=GDIUser.dump();
    const days=new Set();
    const addDay=ts=>{if(ts)days.add(new Date(ts).toDateString())};
    if(d){for(const k in d.watched)addDay(d.watched[k].at);
      for(const k in d.resume)addDay(d.resume[k].at);
      if(d.last)addDay(d.last.at);
      for(const k in d.notes)(d.notes[k]||[]).forEach(n=>addDay(n.at));}
    let streak=0;const day=new Date();
    const has=dt=>days.has(dt.toDateString());
    if(!has(day))day.setDate(day.getDate()-1);
    while(has(day)){streak++;day.setDate(day.getDate()-1);}
    let hours=0;
    if(d)for(const k in d.resume){const r=d.resume[k];hours+=Math.min(r.t,r.d>0?r.d:r.t)}
    hours/=3600;
    const due=srsDueCount();
    // Recentes filtrados pela subárvore atual (em qualquer nível)
    const hist=(d&&d.history||[]).filter(h=>h.path&&h.path!==p&&gdiOkPath(h.path)&&(isHome||normPath(h.path).indexOf(normPath(p)+'/')===0));
    if(!target&&!streak&&!hours&&!hist.length&&!due)return;
    const lbl=target?labels(target):null;
    const rKey=target?resumeKeyFor(target):'';
    const r=target?GDIUser.getResume(rKey):null;
    const btn=target?(logged
      ?`<a class="gdi-btn gdi-btn-primary" data-gdi-go href="${escHtml(playerHref(target))}"><i class="bi bi-play-fill"></i> Retomar</a>`
      :`<a class="gdi-btn gdi-btn-primary" href="/login"><i class="bi bi-box-arrow-in-right"></i> Entrar para retomar</a>`):'';
    let html='<div id="gdi-home-card" class="gdi-panel" style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;padding:12px 16px;margin-bottom:14px;">';
    if(target){
      const topLine=lbl.drive?lbl.drive:(driveLabel()||'Continuar');
      html+=`<div style="display:flex;align-items:center;gap:12px;min-width:0;flex:1;">
        <i class="bi bi-play-circle-fill" style="font-size:30px;color:#7aa2ff;"></i>
        <div style="min-width:0;">
          <div style="font-size:11px;color:#8b949e;text-transform:uppercase;letter-spacing:.06em;">Continuar em ${escHtml(topLine)}${lbl.folder?' \u2192 '+escHtml(lbl.folder):''}</div>
          <div style="font-weight:600;color:#f0f6fc;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(lbl.name)}</div>
          <div style="font-size:12px;color:#8b949e;">${r?'parou em '+gdiFmtTime(r.t)+' \u00b7 ':''}${escHtml(lbl.drive||driveLabel()||'')}${r?'':' \u00b7 sem posi\u00e7\u00e3o salva'}</div>
        </div></div>${btn}`;
    }
    if(isHome){
      html+=`<div style="display:flex;gap:16px;font-size:12px;color:#8b949e;flex-wrap:wrap;">
        ${streak>0?`<span><i class="bi bi-fire" style="color:#ff922b;"></i> ${streak} dia${streak>1?'s':''} seguidos</span>`:''}
        ${hours>0?`<span><i class="bi bi-clock-history"></i> \u2248 ${String(hours.toFixed(1)).replace('.',',')}h assistidas</span>`:''}
      </div>`;
      if(due>0)html+=`<div style="flex-basis:100%;margin-top:2px;"><button id="gdi-srs-open" class="gdi-mode-btn" style="font-size:12px;"><i class="bi bi-mortarboard-fill" style="color:#ffd43b;"></i> Revisar ${due} anota\u00e7\u00e3${due>1?'\u00f5es':'o'} de hoje</button></div>`;
    }else if(streak>0){
      html+=`<span style="font-size:12px;color:#8b949e;"><i class="bi bi-fire" style="color:#ff922b;"></i> ${streak} dia${streak>1?'s':''}</span>`;
    }
    // Recentes: mostra também em pastas (cascata), não só na home
    if(hist.length){
      html+=`<div style="flex-basis:100%;display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:2px;">
        <span style="font-size:11px;color:#8b949e;">Recentes aqui:</span>
        ${hist.slice(0,6).map(h=>`<a class="gdi-mode-btn" data-gdi-go style="padding:2px 8px;font-size:11px;" href="${escHtml(playerHref(h.path))}" title="${escHtml(h.name||'')}">${escHtml((h.name||'').slice(0,26)||'Aula')}</a>`).join('')}
      </div>`;
    }
    html+='</div>';
    wrap.insertAdjacentHTML('afterbegin',html);
    wrap.querySelectorAll('[data-gdi-go]').forEach(a=>a.addEventListener('click',safeGo));
    document.getElementById('gdi-srs-open')?.addEventListener('click',srsOpen);
  }});
})();
// ═══ M14: PROGRESSOS (pasta, 1ª não assistida, curso, por módulo) ═══
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
      new MutationObserver(()=>line()).observe(c,{childList:true,characterData:true,subtree:true});}
    line();modProgress();
  }});
  Bus.onGlobal('user:ready',()=>{try{line()}catch(_){}});
})();

// ═══ M20: PLAYLIST — recolhível (Alfacon) + ✓ confiável + 💾 playlist.json ═══
// ★ Correção do bug "nome vira tamanho": o span do tamanho é pego por
//   el.lastElementChild (filho DIRETO), nunca por span:last-child que
//   casava com o span do nome dentro do div interno.
(function(){
  const LS_OPEN='gdi-playlist-open',LS_HIDE='gdi-hide-watched';
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
  let writing=false; // evita loop do MutationObserver
  function renderItems(){
    const list=document.getElementById('gdi-playlist-list');
    if(!list)return;
    const pv=items(),ci=cur();
    if(!pv.length){writing=true;list.innerHTML='<div class="gdi-notes-empty">Nenhuma aula encontrada.</div>';writing=false;return;}
    const hide=localStorage.getItem(LS_HIDE)==='1';
    let h='';
    pv.forEach((m,idx)=>{
      const w=isW(m),c=idx===ci;
      if(hide&&w&&!c)return;
      const nm=m.name||m.origName||'(sem nome)';
      h+=`<div class="gdi-playlist-item" data-idx="${idx}" style="padding:8px 12px;margin:3px 0;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;font-size:13px;${c?'background:var(--bs-primary,#1f6feb);color:#fff;':'background:rgba(255,255,255,0.05);color:var(--gdi-text,#e6edf3);'}">
        <div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:80%;">
          <i class="bi bi-${c?'play-fill':w?'check-circle-fill':'film'} me-2" ${w&&!c?'style="color:#3fb950;"':''}></i>
          <span style="font-weight:${c?'600':'400'};${w&&!c?'opacity:.75;':''}">${escHtml(nm)}</span>
        </div>
        <span style="font-size:11px;opacity:0.8;white-space:nowrap;">${w?'\u2713 ':''}${m.size||''}</span>
      </div>`;
    });
    writing=true;
    list.innerHTML=h||'<div class="gdi-notes-empty">Todas assistidas (filtro ativo).</div>';
    writing=false;
    list.querySelectorAll('.gdi-playlist-item').forEach(el=>{
      el.addEventListener('click',()=>{
        const k=parseInt(el.dataset.idx,10);
        if(!isNaN(k)&&items()[k]&&window.switchVideo)window.switchVideo(k);
      });
    });
    if(pv[ci]){const el=list.querySelector('.gdi-playlist-item[data-idx="'+ci+'"]');
      if(el)try{el.scrollIntoView({block:'nearest'})}catch(_){}}
  }
  function renderMeta(){
    const pv=items(),ci=cur();
    const cnt=document.getElementById('gdi-pl-count');
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
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),5000);
    showToast('playlist.json baixado \u2014 suba na pasta SUPERIOR do curso');
  }
  function ensureUI(){
    const wrap=document.getElementById('gdi-playlist-wrap');
    if(!wrap||wrap.dataset.m20)return;
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
      <button id="gdi-pl-json" class="gdi-mode-btn" style="padding:4px 9px;font-size:11px;" title="Baixar playlist.json \u2014 suba na pasta superior p/ carregar instant\u00e2neo em qualquer dispositivo"><i class="bi bi-filetype-json"></i></button>
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
    setOpen(open); // padrão: RECOLHIDA, como no Alfacon
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
  }
  window.GDI_MODULES.push({name:'playlist-ui',init:function(){
    if(!document.getElementById('gdi-playlist-wrap'))return;
    ensureUI();
    const list=document.getElementById('gdi-playlist-list');
    if(list&&!list.__m20obs){
      list.__m20obs=true;
      let lastWrite=0;
      new MutationObserver(()=>{
        if(writing||Date.now()-lastWrite<150)return; // ignora as próprias reescritas
        lastWrite=Date.now();
        setTimeout(()=>{healKeys();renderItems();renderMeta();},30);
      }).observe(list,{childList:true});
    }
    refreshAll();
  }});
  Bus.onGlobal('watched:changed',()=>setTimeout(refreshAll,30));
  Bus.onGlobal('video:switched',()=>setTimeout(refreshAll,120));
  Bus.onGlobal('user:ready',()=>setTimeout(refreshAll,60));
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

// ═══ M18: PAINEL DE DEBUG (GDIDebug) ═══
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
  document.body.appendChild(wrap);
  try{GDIDebug.attach()}catch(_){}
}});
