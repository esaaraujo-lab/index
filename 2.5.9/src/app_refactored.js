const FILE_TYPES={video:["mp4","webm","avi","mpg","mpeg","mkv","rm","rmvb","mov","wmv","asf","ts","flv","3gp","m4v"],audio:["mp3","flac","wav","ogg","m4a","aac","wma","alac"],image:["bmp","jpg","jpeg","png","gif","svg","tiff","ico"],code:["php","css","go","java","js","json","txt","sh","html","xml","py","rb","c","cpp","h","hpp"],archive:["zip","rar","tar","7z","gz"],document:["pdf","doc","docx","xls","xlsx","ppt","pptx"],markdown:["md"]},GDOC_TYPES={"application/vnd.google-apps.document":{icon:'<i class="bi bi-file-earmark-text gdi-icon-doc"></i>',name:"Google Doc",formats:[{label:"PDF",ext:"pdf"},{label:"DOCX",ext:"docx"},{label:"TXT",ext:"txt"}]},"application/vnd.google-apps.spreadsheet":{icon:'<i class="bi bi-file-earmark-spreadsheet gdi-icon-doc"></i>',name:"Google Sheet",formats:[{label:"PDF",ext:"pdf"},{label:"XLSX",ext:"xlsx"},{label:"CSV",ext:"csv"}]},"application/vnd.google-apps.presentation":{icon:'<i class="bi bi-file-earmark-slides gdi-icon-doc"></i>',name:"Google Slides",formats:[{label:"PDF",ext:"pdf"},{label:"PPTX",ext:"pptx"}]}};

function isFileType(i,e){return FILE_TYPES[e]&&FILE_TYPES[e].includes(i?.toLowerCase())}

function getFileIcon(i){const e=i?.toLowerCase();return isFileType(e,"video")?'<i class="bi bi-camera-video-fill gdi-icon-video"></i>':isFileType(e,"audio")?'<i class="bi bi-music-note-beamed gdi-icon-audio"></i>':isFileType(e,"image")?'<i class="bi bi-image gdi-icon-image"></i>':isFileType(e,"archive")?'<i class="bi bi-file-earmark-zip-fill gdi-icon-archive"></i>':isFileType(e,"markdown")?'<i class="bi bi-markdown-fill gdi-icon-md"></i>':e==="pdf"?'<i class="bi bi-file-earmark-pdf-fill gdi-icon-pdf"></i>':isFileType(e,"code")?'<i class="bi bi-code-slash gdi-icon-code"></i>':'<i class="bi bi-file-earmark gdi-icon-file"></i>'}

function generateBreadcrumb(i){const e=i.split("/");let t="",n="";for(let a=0;a<e.length;a++){let c=e[a];n+=(a===0?"":"/")+c;const l=a===e.length-1;let d;try{d=decodeURIComponent(c)}catch{d=c}const o=d.match(/^(\d+):$/),s=o?window.drive_names&&window.drive_names[+o[1]]||d:d||"Home",r=s.length>20?s.slice(0,16)+"\u2026":s;l?t+=`<li class="gdi-bc-cur" title="${escHtml(s)}">${escHtml(r)}</li>`:t+=`<li><a href="${n?n+"/":"/"}" title="${escHtml(s)}">${escHtml(r)}</a></li><li class="gdi-bc-sep">/</li>`}return t}

const Os={isWindows:navigator.userAgent.toUpperCase().indexOf("WIN")>-1,isMac:navigator.userAgent.toUpperCase().indexOf("MAC")>-1,isMacLike:/(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent),isIos:/(iPhone|iPod|iPad)/i.test(navigator.userAgent),isMobile:/Android|webOS|iPhone|iPad|iPod|iOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)};

function getDocumentHeight(){const i=document;return Math.max(i.body.scrollHeight,i.documentElement.scrollHeight,i.body.offsetHeight,i.documentElement.offsetHeight,i.body.clientHeight,i.documentElement.clientHeight)}

function getQueryVariable(i){const t=window.location.search.substring(1).split("&");for(let n=0;n<t.length;n++){const a=t[n].split("=");if(a[0]==i)return a.slice(1).join("=")}return!1}

function escHtml(i){return String(i).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;")}

const GDIDebug=(()=>{const i=[];let e=null;function t(){return new Date().toISOString().slice(11,23)}function n(){if(e||(e=document.getElementById("gdi-debug-log")),!e)return;const d={req:"#da77f2",api:"#69db7c",error:"#ff6b6b",warn:"#ffa94d",info:"#74c0fc"},o=i.map(r=>{const p=d[r.type]||"#aaa",g=r.data!=null?typeof r.data=="string"?r.data:JSON.stringify(r.data,null,2):"";return`<div class="gdi-dbg-entry"><span class="gdi-dbg-ts">${r.ts}</span><span class="gdi-dbg-badge" style="color:${p}">[${r.type.toUpperCase()}]</span><span class="gdi-dbg-msg">${escHtml(r.label)}</span>`+(g?`<pre class="gdi-dbg-pre">${escHtml(g)}</pre>`:"")+"</div>"}).join("");e.innerHTML=o||'<span class="gdi-dbg-empty">No entries yet.</span>',e.scrollTop=e.scrollHeight;const s=document.getElementById("gdi-dbg-count");s&&(s.textContent=i.length)}function a(d,o,s){window.UI?.debug_mode&&(i.push({ts:t(),type:d,label:o,data:s!==void 0?s:null}),n())}function c(){e=document.getElementById("gdi-debug-log");const d=document.createElement("style");d.textContent=[".gdi-debug-wrap{width:100%;background:#0d1117;border-top:2px solid #f0883e;font-family:monospace;font-size:12px;}",".gdi-debug-head{display:flex;align-items:center;justify-content:space-between;padding:8px 14px;background:#161b22;cursor:pointer;user-select:none;color:#8b949e;}",".gdi-debug-head:hover{background:#1c2128;}",".gdi-debug-head strong{color:#f0f6fc;display:flex;align-items:center;gap:6px;}",".gdi-dbg-count{background:#1f6feb;color:#fff;border-radius:10px;padding:1px 7px;font-size:11px;margin-left:4px;}",".gdi-debug-actions{display:flex;gap:8px;}",".gdi-debug-actions button{background:none;border:1px solid #30363d;color:#8b949e;border-radius:4px;padding:2px 9px;cursor:pointer;font-size:11px;}",".gdi-debug-actions button:hover{background:#1c2128;color:#f0f6fc;}","#gdi-debug-log{max-height:300px;overflow-y:auto;padding:10px 14px;background:#0d1117;color:#e6edf3;}","#gdi-debug-log.collapsed{display:none;}",".gdi-dbg-entry{padding:3px 0;border-bottom:1px solid #21262d;line-height:1.6;}",".gdi-dbg-ts{color:#484f58;margin-right:6px;}",".gdi-dbg-badge{font-weight:bold;margin-right:6px;}",".gdi-dbg-msg{color:#e6edf3;}",".gdi-dbg-pre{margin:2px 0 2px 20px;padding:4px 8px;background:#161b22;border-left:2px solid #30363d;white-space:pre-wrap;word-break:break-all;color:#8b949e;font-size:11px;}",".gdi-dbg-empty{color:#484f58;}"].join(""),document.head.appendChild(d),i.length>0&&n(),a("info","Debug attached",{path:window.location.pathname,search:window.location.search,drive:window.current_drive_order,version:window.UI?.version,model_type:window.MODEL?.root_type})}function l(){i.length=0,e&&(e.innerHTML='<span class="gdi-dbg-empty">Cleared.</span>');const d=document.getElementById("gdi-dbg-count");d&&(d.textContent="0")}return{log:a,attach:c,clear:l}})();

if(window.UI?.debug_mode){const i=window.fetch.bind(window);window.fetch=async function(t,n){const a=typeof t=="string"?t:t.url||String(t),c=(n?.method||"GET").toUpperCase();let l;try{l=n?.body?JSON.parse(n.body):void 0}catch{l=n?.body}GDIDebug.log("req",`\u2192 ${c} ${a}`,l!==void 0?l:null);const d=Date.now();try{const o=await i(t,n),s=o.clone();let r;try{r=await s.json()}catch{r=null}return GDIDebug.log(o.ok?"api":"error",`\u2190 ${o.status} ${a} (${Date.now()-d}ms)`,r),o}catch(o){throw GDIDebug.log("error",`\u2717 FETCH FAILED: ${a}`,String(o)),o}};const e=console.error.bind(console);console.error=function(...t){GDIDebug.log("error",t.map(n=>n instanceof Error?n.stack||n.message:typeof n=="object"?JSON.stringify(n):String(n)).join(" ")),e(...t)},window.addEventListener("error",t=>{GDIDebug.log("error",`Uncaught: ${t.message}`,`${t.filename}:${t.lineno}:${t.colno}`)}),window.addEventListener("unhandledrejection",t=>{GDIDebug.log("error",`UnhandledPromise: ${String(t.reason)}`)})}

function trimChar(i,e){return e?i.replace(new RegExp("^\\"+e+"+|\\"+e+"+$","g"),""):i.trim()}

function applyTheme(i){document.documentElement.setAttribute("data-bs-theme",i);const e=document.getElementById("theme-icon");e&&(e.className=i==="dark"?"bi bi-moon-stars":"bi bi-sun")}

function toggleTheme(){const e=(document.documentElement.getAttribute("data-bs-theme")||"dark")==="dark"?"light":"dark";localStorage.setItem("gdi-theme",e),applyTheme(e)}

(function(){const e=localStorage.getItem("gdi-theme")||"dark";applyTheme(e)})();

function sleep(i){return new Promise(e=>setTimeout(e,i))}

function init(){const UI=window.UI||{};document.siteName=$("title").html();const i=`
<div id="nav"></div>
<div id="content" style="padding-top:54px;${UI.fixed_footer?" padding-bottom:200px;":""}"></div>

<div class="modal fade" id="SearchModel" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="SearchModelLabel">Result</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body" id="modal-body-space"></div>
      <div class="modal-footer" id="modal-body-space-buttons"></div>
    </div>
  </div>
</div>

<div id="gdi-toast-container"></div>

${UI.show_quota?`<div id="gdi-quota-bar" style="padding:6px 16px;background:rgba(0,0,0,0.18);font-size:12px;color:var(--gdi-text-muted,#aaa);display:none;">
  <span id="gdi-quota-text"></span>
  <div style="height:4px;background:rgba(255,255,255,0.12);border-radius:2px;margin-top:4px;"><div id="gdi-quota-fill" style="height:4px;border-radius:2px;width:0%;background:#4caf50;transition:width 0.4s;"></div></div>
</div>`:""}
<footer class="gdi-footer"${UI.hide_footer?' style="display:none;"':""}>
  ${UI.credit?'<span>Redesigned by <a href="https://www.npmjs.com/package/@googledrive/index" target="_blank">TheFirstSpeedster</a></span> &middot; ':""}
  <span>&copy; ${UI.copyright_year||new Date().getFullYear()} <a href="${UI.company_link||'#'}" target="_blank">${UI.company_name||'Drive'}</a></span>
</footer>
${UI.debug_mode?`
<div class="gdi-debug-wrap" id="gdi-debug-wrap">
  <div class="gdi-debug-head" onclick="document.getElementById('gdi-debug-log').classList.toggle('collapsed')">
    <strong><i class="bi bi-bug-fill" style="color:#f0883e;"></i> GDI Debug <span id="gdi-dbg-count" class="gdi-dbg-count">0</span></strong>
    <div class="gdi-debug-actions">
      <button onclick="event.stopPropagation();GDIDebug.clear()">Clear</button>
      <button onclick="event.stopPropagation();document.getElementById('gdi-debug-log').classList.toggle('collapsed')">Toggle</button>
    </div>
  </div>
  <div id="gdi-debug-log" class="collapsed"></div>
</div>`:""}`;$("body").html(i)}

function title(i){try{i=decodeURI(i)}catch{}const e=window.current_drive_order||0,t=(window.drive_names&&window.drive_names[e])||"Drive";i=i.replace(`/${e}:`,"");const n=window.MODEL||{};n.is_search_page?$("title").html(`${t} - Search: ${n.q||""}`):$("title").html(`${t} - ${i}`)}

function nav(i){const e=window.MODEL||{},t=window.current_drive_order||0,n=(window.drive_names&&window.drive_names[t])||"Drive",a=window.drive_names||[],UI=window.UI||{},c=e.is_search_page&&e.q||"";let l="";a.forEach((r,p)=>{l+=`<li><a class="dropdown-item${p===t?" active":""}" href="/${p}:/">
          <i class="bi bi-folder2-open"></i> ${r}</a></li>`});const d=UI.logo_image?`<img src="${UI.logo_link_name}" alt="${UI.company_name}" height="28">`:`<i class="bi bi-cloud-fill"></i> ${UI.logo_link_name}`,o=(e.root_type===undefined||e.root_type<2)?`
      <div class="gdi-nav-search">
        <form class="gdi-search-form" method="get" action="/${t}:search">
          <input class="gdi-search-input" name="q" type="search" placeholder="Search files\u2026" value="${escHtml(c)}">
          <button class="gdi-search-btn" type="submit"><i class="bi bi-search"></i></button>
        </form>
      </div>`:"",s=`
<nav class="gdi-nav">
  <div class="gdi-nav-inner">
    <a class="gdi-logo" href="/${t}:/">${d}</a>
    <div class="gdi-nav-sep"></div>
    ${o}
    <div class="gdi-nav-actions">
      <div class="dropdown">
        <button class="gdi-nav-btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          <i class="bi bi-grid-3x3-gap-fill"></i>
          <span class="d-none d-md-inline">${escHtml(n)}</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end">${l}</ul>
      </div>
      <div class="gdi-nav-sep"></div>
      <button id="theme-toggle" class="gdi-nav-btn" onclick="toggleTheme()" title="Toggle theme">
        <i class="bi bi-moon-stars" id="theme-icon"></i>
      </button>
      ${UI.show_logout_button?'<a class="gdi-nav-btn" href="/logout" title="Logout"><i class="bi bi-box-arrow-right"></i></a>':""}
    </div>
  </div>
</nav>`;$("#nav").html(s),applyTheme(localStorage.getItem("gdi-theme")||"dark")}

function render(i){i.indexOf("?")>=0&&(i=i.substr(0,i.indexOf("?"))),title(i),nav(i);const e=/\/\d+:$/g;if(i.includes("/fallback")){window.scroll_status={event_bound:!1,loading_lock:!1};const t=getQueryVariable("a"),n=decodeURIComponent(getQueryVariable("id")||"");return t?fallback(n,!0):list(null,n,!0)}else window.MODEL?.is_search_page?(window.scroll_status={event_bound:!1,loading_lock:!1},render_search_result_list()):i.match(e)||i.slice(-1)=="/"?(window.scroll_status={event_bound:!1,loading_lock:!1},list(i)):file(i)}

function requestListPath(i,e,t,n,a=3,c=!1){const l={id:e.id||"",type:"folder",password:e.password||"",page_token:e.page_token||"",page_index:e.page_index||0},d=a!=null&&a>=0?a:3;$("#update").show(),$("#update").html('<div class="gdi-alert gdi-alert-info">Connecting\u2026</div>'),c&&(i="/0:fallback");async function o(s){try{const r=await fetch(c?"/0:fallback":i,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(l)});if(!r.ok)throw new Error("Request failed with status "+r.status);const p=await r.json();p&&p.error&&p.error.code===401?($("#update").hide(),askPassword(i)):p&&p.data===null?(document.getElementById("spinner")?.remove(),$("#list").html(`<div class="gdi-empty"><i class="bi bi-exclamation-circle"></i><p>Server didn't send any data.</p></div>`),$("#update").hide()):p&&p.data&&(t(p,i,l),$("#update").hide())}catch(r){s>0?($("#update").html(`<div class="gdi-alert gdi-alert-info">Retrying\u2026 (${s} left)</div>`),await sleep(2e3),await o(s-1)):($("#update").html('<div class="gdi-alert gdi-alert-error">Unable to connect. Please try again.</div>'),$("#list").html(`<div class="gdi-empty"><i class="bi bi-wifi-off"></i><p>${escHtml(String(r))}</p></div>`),$("#update").hide())}}o(d)}

function requestSearch(i,e,t=3){const n={q:i.q||null,page_token:i.page_token||null,page_index:i.page_index||0};async function a(c){try{const l=await fetch(`/${window.current_drive_order||0}:search`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)});if(!l.ok)throw new Error("Request failed with status "+l.status);const d=await l.json();d&&d.data===null?($("#spinner").remove(),$("#list").html('<div class="gdi-empty"><i class="bi bi-search"></i><p>No results found.</p></div>'),$("#update").remove()):d&&d.data&&(e&&e(d,n),$("#update").remove())}catch{c>0?($("#update").html(`<div class="gdi-alert gdi-alert-info">Retrying\u2026 (${c} left)</div>`),await sleep(2e3),await a(c-1)):($("#update").html(`<div class="gdi-alert gdi-alert-error">Unable to connect after ${t} attempts.</div>`),$("#list").html('<div class="gdi-empty"><i class="bi bi-wifi-off"></i><p>Connection failed.</p></div>'),$("#spinner").remove())}}$("#update").html('<div class="gdi-alert gdi-alert-info">Searching\u2026</div>'),a(t)}

function list(i,e="",t=!1){const n=window.location.pathname,a=trimChar(n,"/").split("/");let c="/",l='<li><a href="/">Home</a></li><li class="gdi-bc-sep">/</li>';if(a.length>1)for(const p in a){const g=a[p];let f;try{f=decodeURIComponent(g)}catch{f=g}f=f.replace(/\//g,"%2F");const u=f.match(/^(\d+):$/),h=u&&window.drive_names&&window.drive_names[+u[1]]||f,m=h.length>18?h.slice(0,14)+"\u2026":h;if(c+=g+"/",!m)break;Number(p)===a.length-1?l+=`<li class="gdi-bc-cur" title="${escHtml(h)}">${escHtml(m)}</li>`:l+=`<li><a href="${c}" title="${escHtml(h)}">${escHtml(m)}</a></li><li class="gdi-bc-sep">/</li>`}const d=`
<div class="gdi-wrap">
  <div id="update"></div>
  <div id="head_md" class="gdi-panel gdi-markdown" style="display:none;"></div>
  <div id="select_items" class="gdi-select-bar" style="display:none;">
    <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
      <input type="checkbox" id="select-all-checkboxes"> Select all
    </label>
    <button id="handle-multiple-items-copy" class="gdi-btn gdi-btn-ghost">
      <i class="bi bi-clipboard"></i> Copy selected
    </button>
  </div>
  <div class="gdi-breadcrumb-wrap">
    <ol class="gdi-bc" id="folderne">${l}</ol>
  </div>
  <div class="gdi-panel">
    <div class="gdi-toolbar">
      <input id="folder-filter" class="gdi-filter-input" type="search" placeholder="Filter files\u2026" autocomplete="off">
    </div>
    <div class="gdi-list-header" id="list-header">
      <span class="gdi-col-name gdi-sort-header" data-sort="name">Name</span>
      <span class="gdi-col-size gdi-sort-header" data-sort="size">Size</span>
      <span class="gdi-col-date gdi-sort-header" data-sort="date">Modified</span>
      <span class="gdi-col-acts"></span>
    </div>
    <div id="list"></div>
    <div id="count" class="gdi-count-bar"></div>
  </div>
  <div id="readme_md" class="gdi-panel gdi-markdown" style="display:none;"></div>
</div>`;$("#content").html(d);const o=localStorage.getItem("password"+i);$("#list").html('<div class="gdi-spinner-wrap" id="spinner"><div class="gdi-spinner"></div></div>'),$("#readme_md").hide().html(""),$("#head_md").hide().html("");function s(p,g,f){$("#list").data("nextPageToken",p.nextPageToken).data("curPageIndex",p.curPageIndex),$("#spinner").remove(),p.nextPageToken===null?($(window).off("scroll"),window.scroll_status.event_bound=!1,window.scroll_status.loading_lock=!1,t?append_files_to_fallback_list(g,p.data.files):append_files_to_list(g,p.data.files)):(t?append_files_to_fallback_list(g,p.data.files):append_files_to_list(g,p.data.files),window.scroll_status.event_bound!==!0&&($(window).on("scroll",function(){if($(this).scrollTop()+$(this).height()>getDocumentHeight()-(Os.isMobile?130:80)){if(window.scroll_status.loading_lock===!0)return;window.scroll_status.loading_lock=!0,$('<div id="spinner" class="gdi-spinner-wrap"><div class="gdi-spinner"></div></div>').insertBefore("#readme_md");const u=$("#list");t?requestListPath(g,{id:e,password:f.password,page_token:u.data("nextPageToken"),page_index:u.data("curPageIndex")+1},s,null,5,!0):requestListPath(g,{password:f.password,page_token:u.data("nextPageToken"),page_index:u.data("curPageIndex")+1},s,null)}}),window.scroll_status.event_bound=!0)),window.scroll_status.loading_lock===!0&&(window.scroll_status.loading_lock=!1)}t?requestListPath(i,{id:e,password:o},s,null,3,!0):requestListPath(i,{password:o},s,null);const r=document.getElementById("handle-multiple-items-copy");r&&r.addEventListener("click",()=>{const p=document.querySelectorAll("input.gdi-row-check:checked");if(!p.length){alert("No items selected!");return}const g=Array.from(p).map(f=>f.value).join("\n");navigator.clipboard.writeText(g).catch(()=>{const f=document.createElement("textarea");f.value=g,document.body.appendChild(f),f.select(),document.execCommand("copy"),document.body.removeChild(f)}),showToast(`${p.length} link${p.length>1?"s":""} copied`)})}

function askPassword(i){$("#spinner").remove();const e=prompt("This folder is password protected. Enter the password:","");e!=null&&e!=""?(localStorage.setItem("password"+i,e),list(i)):history.go(-1)}

let _folderFilterBound=!1;function initFolderFilter(){const i=document.getElementById("folder-filter");!i||_folderFilterBound||(_folderFilterBound=!0,i.addEventListener("input",function(){const e=this.value.toLowerCase();document.querySelectorAll("#list .gdi-row").forEach(t=>{const n=(t.dataset.name||t.textContent).toLowerCase();t.style.display=!e||n.includes(e)?"":"none"})}))}

let _sortState={col:null,dir:1};function initColumnSort(){const i=document.querySelectorAll("#list-header .gdi-sort-header");i.forEach(e=>{e.addEventListener("click",function(){const t=this.dataset.sort;_sortState.col===t?_sortState.dir*=-1:(_sortState.col=t,_sortState.dir=1),i.forEach(n=>n.classList.remove("asc","desc")),this.classList.add(_sortState.dir===1?"asc":"desc"),sessionStorage.setItem("gdi-sort",JSON.stringify(_sortState)),sortFileList(t,_sortState.dir)})});try{const e=JSON.parse(sessionStorage.getItem("gdi-sort"));e&&e.col&&(_sortState=e)}catch{}}

function sortFileList(i,e){const t=$("#list"),n=t.children(".gdi-row").toArray();n.sort((a,c)=>{if(i==="size")return e*((parseFloat($(a).data("bytes"))||0)-(parseFloat($(c).data("bytes"))||0));if(i==="date")return e*(new Date($(a).data("date"))-new Date($(c).data("date")));const l=($(a).data("name")||"").toLowerCase(),d=($(c).data("name")||"").toLowerCase();return e*l.localeCompare(d)}),n.forEach(a=>t.append(a))}

function append_files_to_list(i,e){const UI=window.UI||{},t=$("#list"),n=t.data("nextPageToken")===null,a=t.data("curPageIndex")=="0";let c="",l=0,d=!1;for(const o in e){const s=e[o],r=encodeURIComponent(s.name).replace(/\//g,"%2F")+"/",p=i+r.replace(/#/g,"%23").replace(/\?/g,"%3F");if(s.modifiedTime=utc2delhi(s.modifiedTime),s.mimeType=="application/vnd.google-apps.folder")c+=`<a href="${p}" class="gdi-row countitems" data-name="${escHtml(s.name.toLowerCase())}" data-date="${s.modifiedTime||""}">
  <span class="gdi-row-icon"><i class="bi bi-folder-fill gdi-icon-folder"></i></span>
  <span class="gdi-row-name">${escHtml(s.name)}</span>
  <span class="gdi-row-size"></span>
  <span class="gdi-row-date">${UI.display_time?s.modifiedTime:""}</span>
  <span class="gdi-row-acts"></span>
</a>`;else{const g=Number(s.size);l+=g,s.size=formatFileSize(s.size),d=!0;const f=s.fileExtension,u=UI.second_domain_for_dl?UI.downloaddomain+s.link:window.location.origin+s.link,h=encodeURIComponent(s.name);let m=i+h+"?a=view";const v=i+h;n&&s.name=="README.md"&&UI.render_readme_md&&get_file(v,s,function(b){markdown("#readme_md",b),$("img").addClass("img-fluid")}),s.name=="HEAD.md"&&UI.render_head_md&&get_file(v,s,function(b){markdown("#head_md",b),$("img").addClass("img-fluid")});const w=GDOC_TYPES[s.mimeType],y=w?w.icon:getFileIcon(f),_=w&&UI.display_download?w.formats.map(b=>`<a class="gdi-act-btn" href="${u}&fmt=${b.ext}" title="Export as ${b.label}" download><span style="font-size:10px;font-weight:600;">${b.label}</span></a>`).join(""):"";c+=`<div class="gdi-row countitems size_items" data-name="${escHtml(s.name.toLowerCase())}" data-bytes="${g}" data-date="${s.modifiedTime||""}">
  ${UI.allow_selecting_files?`<input class="gdi-row-check" type="checkbox" value="${u}">`:""}
  <span class="gdi-row-icon">${y}</span>
  <a class="gdi-row-name" href="${m}" title="${escHtml(s.name)}" data-size="${UI.display_size?s.size:""}">${escHtml(s.name)}</a>
  <span class="gdi-row-size">${UI.display_size?s.size:""}</span>
  <span class="gdi-row-date">${UI.display_time?s.modifiedTime:""}</span>
  <span class="gdi-row-acts">
    ${UI.allow_selecting_files?`<button class="gdi-act-btn" onclick="copyShareUrl(this.closest('.gdi-row').querySelector('.gdi-row-name').href)" title="Copy link"><i class="bi bi-link-45deg"></i></button>`:""}
    ${w?_:UI.display_download?`<a class="gdi-act-btn" href="${u}" title="Download"><i class="bi bi-download"></i></a>`:""}
  </span>
</div>`}}if(d&&UI.allow_selecting_files&&(document.getElementById("select_items").style.display="flex"),t.html((t.data("curPageIndex")=="0"?"":t.html())+c),_folderFilterBound=!1,initFolderFilter(),initColumnSort(),n){const o=formatFileSize(l)||"0 Bytes",s=t.find(".countitems").length,r=t.find(".size_items").length,p=s===0?"Empty folder":`${s} item${s===1?"":"s"}`,g=r>0?` &middot; ${r} file${r===1?"":"s"}, ${o}`:"";$("#count").addClass("show").html(p+g)}}

function append_files_to_fallback_list(i,e){const UI=window.UI||{};try{const t=$("#list"),n=t.data("nextPageToken")===null;let a="",c=0,l=!1;for(const d in e){const o=e[d],s="/fallback?id="+encodeURIComponent(o.id);if(o.modifiedTime=utc2delhi(o.modifiedTime),o.mimeType=="application/vnd.google-apps.folder")a+=`<a href="${s}" class="gdi-row countitems" data-name="${escHtml(o.name.toLowerCase())}" data-date="${o.modifiedTime||""}">
  <span class="gdi-row-icon"><i class="bi bi-folder-fill gdi-icon-folder"></i></span>
  <span class="gdi-row-name">${escHtml(o.name)}</span>
  <span class="gdi-row-size"></span>
  <span class="gdi-row-date">${UI.display_time?o.modifiedTime:""}</span>
  <span class="gdi-row-acts"></span>
</a>`;else{const r=Number(o.size);c+=r,o.size=formatFileSize(o.size),l=!0;const p=o.fileExtension,g=UI.second_domain_for_dl?UI.downloaddomain+o.link:window.location.origin+o.link,f=s+"&a=view";n&&o.name=="README.md"&&UI.render_readme_md&&get_file(s,o,function(u){markdown("#readme_md",u),$("img").addClass("img-fluid")}),o.name=="HEAD.md"&&UI.render_head_md&&get_file(s,o,function(u){markdown("#head_md",u),$("img").addClass("img-fluid")}),a+=`<div class="gdi-row countitems size_items" data-name="${escHtml(o.name.toLowerCase())}" data-bytes="${r}" data-date="${o.modifiedTime||""}">
  ${UI.allow_selecting_files?`<input class="gdi-row-check" type="checkbox" value="${g}">`:""}
  <span class="gdi-row-icon">${getFileIcon(p)}</span>
  <a class="gdi-row-name" href="${f}" title="${escHtml(o.name)}" data-size="${UI.display_size?o.size:""}">${escHtml(o.name)}</a>
  <span class="gdi-row-size">${UI.display_size?o.size:""}</span>
  <span class="gdi-row-date">${UI.display_time?o.modifiedTime:""}</span>
  <span class="gdi-row-acts">
    ${UI.allow_selecting_files?`<button class="gdi-act-btn" onclick="copyShareUrl(this.closest('.gdi-row').querySelector('.gdi-row-name').href)" title="Copy link"><i class="bi bi-link-45deg"></i></button>`:""}
    ${UI.display_download?`<a class="gdi-act-btn" href="${g}" title="Download"><i class="bi bi-download"></i></a>`:""}
  </span>
</div>`}}if(l&&UI.allow_selecting_files&&(document.getElementById("select_items").style.display="flex"),t.html((t.data("curPageIndex")=="0"?"":t.html())+a),n){const d=formatFileSize(c)||"0 Bytes",o=t.find(".countitems").length,s=t.find(".size_items").length,r=o===0?"Empty folder":`${o} item${o===1?"":"s"}`,p=s>0?` &middot; ${s} file${s===1?"":"s"}, ${d}`:"";$("#count").addClass("show").html(r+p)}}catch(t){console.error(t)}}

function render_search_result_list(){const i=window.MODEL?.q||"",e=`
<div class="gdi-wrap">
  <div id="update"></div>
  <div class="gdi-search-header">
    Search results for <span class="gdi-search-query">"${escHtml(i)}"</span>
  </div>
  <div id="select_items" class="gdi-select-bar" style="display:none;">
    <label style="display:flex;align-items:center;gap:6px;cursor:pointer;">
      <input type="checkbox" id="select-all-checkboxes"> Select all
    </label>
    <button id="handle-multiple-items-copy" class="gdi-btn gdi-btn-ghost">
      <i class="bi bi-clipboard"></i> Copy selected
    </button>
  </div>
  <div class="gdi-panel">
    <div id="list"></div>
    <div id="count" class="gdi-count-bar"></div>
  </div>
  <div id="readme_md" style="display:none;"></div>
</div>`;$("#content").html(e),$("#list").html('<div class="gdi-spinner-wrap" id="spinner"><div class="gdi-spinner"></div></div>');function t(a,c){$("#list").data("nextPageToken",a.nextPageToken).data("curPageIndex",a.curPageIndex),$("#spinner").remove(),a.nextPageToken===null?($(window).off("scroll"),window.scroll_status.event_bound=!1,window.scroll_status.loading_lock=!1,append_search_result_to_list(a.data.files)):(append_search_result_to_list(a.data.files),window.scroll_status.event_bound!==!0&&($(window).on("scroll",function(){if($(this).scrollTop()+$(this).height()>getDocumentHeight()-(Os.isMobile?130:80)){if(window.scroll_status.loading_lock===!0)return;window.scroll_status.loading_lock=!0,$('<div id="spinner" class="gdi-spinner-wrap"><div class="gdi-spinner"></div></div>').insertBefore("#count");const l=$("#list");requestSearch({q:i,page_token:l.data("nextPageToken"),page_index:l.data("curPageIndex")+1},t)}}),window.scroll_status.event_bound=!0)),window.scroll_status.loading_lock===!0&&(window.scroll_status.loading_lock=!1)}requestSearch({q:i},t);const n=document.getElementById("handle-multiple-items-copy");n&&n.addEventListener("click",()=>{const a=document.querySelectorAll("input.gdi-row-check:checked");if(!a.length){alert("No items selected!");return}const c=Array.from(a).map(l=>l.value).join("\n");navigator.clipboard.writeText(c).catch(()=>{const l=document.createElement("textarea");l.value=c,document.body.appendChild(l),l.select(),document.execCommand("copy"),document.body.removeChild(l)}),showToast(`${a.length} link${a.length>1?"s":""} copied`)})}

function append_search_result_to_list(i){const UI=window.UI||{};try{const e=$("#list"),t=e.data("nextPageToken")===null;let n="",a=0,c=!1;for(const l in i){const d=i[l];d.size==null&&(d.size=""),d.modifiedTime=utc2delhi(d.modifiedTime);const o=typeof d.rootIdx=="number"?d.rootIdx:-1;if(d.mimeType=="application/vnd.google-apps.folder")n+=`<a style="cursor:pointer;" onclick="onSearchResultItemClick('${escHtml(d.id)}', false, ${o})" data-bs-toggle="modal" data-bs-target="#SearchModel"
  class="gdi-row countitems" data-name="${escHtml(d.name.toLowerCase())}" data-date="${d.modifiedTime||""}">
  <span class="gdi-row-icon"><i class="bi bi-folder-fill gdi-icon-folder"></i></span>
  <span class="gdi-row-name">${escHtml(d.name)}</span>
  <span class="gdi-row-size"></span>
  <span class="gdi-row-date">${UI.display_time?d.modifiedTime:""}</span>
  <span class="gdi-row-acts"></span>
</a>`;else{c=!0;const s=Number(d.size);a+=s,d.size=formatFileSize(d.size);const r=d.fileExtension,p=UI.second_domain_for_dl?UI.downloaddomain+d.link:window.location.origin+d.link;n+=`<div class="gdi-row countitems size_items" data-name="${escHtml(d.name.toLowerCase())}" data-bytes="${s}" data-date="${d.modifiedTime||""}">
  ${UI.allow_selecting_files?`<input class="gdi-row-check" type="checkbox" value="${p}">`:""}
  <span class="gdi-row-icon">${getFileIcon(r)}</span>
  <span class="gdi-row-name" onclick="onSearchResultItemClick('${escHtml(d.id)}', true, ${o})" data-bs-toggle="modal" data-bs-target="#SearchModel" style="cursor:pointer;" data-size="${UI.display_size?d.size:""}">${escHtml(d.name)}</span>
  <span class="gdi-row-size">${UI.display_size?d.size:""}</span>
  <span class="gdi-row-date">${UI.display_time?d.modifiedTime:""}</span>
  <span class="gdi-row-acts">
    ${UI.display_download?`<a class="gdi-act-btn" href="${p}" title="Download"><i class="bi bi-download"></i></a>`:""}
  </span>
</div>`}}if(c&&UI.allow_selecting_files&&(document.getElementById("select_items").style.display="flex"),e.html((e.data("curPageIndex")=="0"?"":e.html())+n),t){const l=formatFileSize(a)||"0 Bytes",d=e.find(".countitems").length,o=e.find(".size_items").length;if(d===0)$("#count").addClass("show").html("No results found");else{const s=`${d} result${d===1?"":"s"}`,r=o>0?` &middot; ${l}`:"";$("#count").addClass("show").html(s+r)}}}catch(e){console.error(e)}}

function onSearchResultItemClick(i,e,t){const n=`/fallback?id=${encodeURIComponent(i)}${e?"&a=view":""}`;function a(){const d=document.getElementById("SearchModel"),o=d&&window.bootstrap?.Modal?.getInstance(d);o&&o.hide(),window.location.href=n}if(t===-2){a();return}$("#SearchModelLabel").html("Loading\u2026"),$("#modal-body-space").html('<div class="gdi-spinner-wrap"><div class="gdi-spinner"></div></div>');const c=t>=0?t:0;async function l(){try{const d=await fetch(`/${c}:id2path`,{method:"POST",body:JSON.stringify({id:i}),headers:{"Content-Type":"application/json"}});if(d.ok){const o=await d.json();if(o.path){const s=o.path.replace(/#/g,"%23").replace(/\?/g,"%3F");$("#SearchModelLabel").html("Open file"),$("#modal-body-space").html(`
                      <a class="gdi-btn gdi-btn-primary me-2" href="${s}${e?"?a=view":""}">Open</a>
                      <a class="gdi-btn gdi-btn-ghost" href="${s}${e?"?a=view":""}" target="_blank">Open in new tab</a>`);return}}}catch{}a()}l()}

function get_file(i,e,t){const n="file_path_"+i+e.modifiedTime,a=localStorage.getItem(n);if(a!=null)return t(a);$.get(i,function(c){localStorage.setItem(n,c),t(c)})}

async function fallback(i,e){if(e){const t=await getCookie("root_id")||"";$("#content").html('<div class="gdi-wrap"><div class="gdi-spinner-wrap" style="height:150px;" id="spinner"><div class="gdi-spinner"></div></div></div>'),fetch("/0:fallback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:i})}).then(n=>{if(!n.ok)throw new Error("Request failed");return n.json()}).then(n=>dispatchFileView(n,t)).catch(n=>{$("#content").html(renderErrorCard(n))})}else return list(i,!0)}

async function file(i){const e=await getCookie("root_id")||"";$("#content").html('<div class="gdi-wrap"><div class="gdi-spinner-wrap" style="height:150px;" id="spinner"><div class="gdi-spinner"></div></div></div>'),fetch("",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({path:i})}).then(t=>{if(!t.ok)throw new Error("Request failed");return t.json()}).then(t=>dispatchFileView(t,e)).catch(t=>{$("#content").html(renderErrorCard(t))})}

function dispatchFileView(i,e){const UI=window.UI||{},t=i.mimeType,n=i.fileExtension;if(t==="application/vnd.google-apps.folder"){window.location.href=window.location.pathname+"/";return}if(!n&&!t)return;const a=i.name,c=encodeURIComponent(a),l=formatFileSize(i.size),d=UI.second_domain_for_dl?UI.downloaddomain+i.link:window.location.origin+i.link,o=i.id;if(t&&GDOC_TYPES[t])file_workspace(a,l,t,d);else if(FILE_TYPES.video.includes(n)||t&&t.includes("video")){const s=i.thumbnailLink?i.thumbnailLink.replace("s220","s0"):UI.poster;file_video(a,c,l,s,d,t,o,e)}else FILE_TYPES.audio.includes(n)||t&&t.includes("audio")?file_audio(a,c,l,d,o,e):FILE_TYPES.image.includes(n)||t&&t.includes("image")?file_image(a,c,l,d,o,e):n==="pdf"||t&&t.includes("pdf")?file_pdf(a,c,l,d,o,e):FILE_TYPES.code.includes(n)?file_code(a,c,l,i.size,d,n,o,e):file_others(a,c,l,d,o,e)}

function renderErrorCard(i){return`<div class="gdi-wrap">
  <div class="gdi-viewer">
    <div class="gdi-viewer-card">
      <div class="gdi-file-header">
        <span class="gdi-file-header-icon"><i class="bi bi-exclamation-triangle-fill" style="color:#dc2626;"></i></span>
        <div class="gdi-file-header-info">
          <div class="gdi-file-header-name">Unable to load file</div>
          <div class="gdi-file-header-meta">${escHtml(String(i))}</div>
        </div>
      </div>
      <div class="gdi-viewer-footer">
        <a href="/" class="gdi-btn gdi-btn-primary"><i class="bi bi-house"></i> Home</a>
        <a href="javascript:history.back()" class="gdi-btn gdi-btn-ghost ms-2"><i class="bi bi-arrow-left"></i> Back</a>
      </div>
    </div>
  </div>
</div>`}

function renderDownloadButtons(i,e,t={}){const n=btoa(i),a=t.showMedia?`
      <li><a class="dropdown-item" href="iina://weblink?url=${i}"><i class="bi bi-play-circle me-2"></i>IINA</a></li>
      <li><a class="dropdown-item" href="potplayer://${i}"><i class="bi bi-play-circle me-2"></i>PotPlayer</a></li>
      <li><a class="dropdown-item" href="vlc://${i}"><i class="bi bi-play-circle me-2"></i>VLC Mobile</a></li>
      <li><a class="dropdown-item" href="${i}"><i class="bi bi-play-circle me-2"></i>VLC Desktop</a></li>
      <li><a class="dropdown-item" href="nplayer-${i}"><i class="bi bi-play-circle me-2"></i>nPlayer</a></li>
      <li><a class="dropdown-item" href="intent://${i}#Intent;type=video/any;package=is.xyz.mpv;scheme=https;end;"><i class="bi bi-play-circle me-2"></i>mpv Android</a></li>
      <li><a class="dropdown-item" href="mpv://${n}"><i class="bi bi-play-circle me-2"></i>mpv x64</a></li>
      <li><a class="dropdown-item" href="intent:${i}#Intent;package=com.mxtech.videoplayer.ad;S.title=${e};end"><i class="bi bi-play-circle me-2"></i>MX Player (Free)</a></li>
      <li><a class="dropdown-item" href="intent:${i}#Intent;package=com.mxtech.videoplayer.pro;S.title=${e};end"><i class="bi bi-play-circle me-2"></i>MX Player (Pro)</a></li>
      <li><hr class="dropdown-divider"></li>`:"";return`<div class="gdi-dl-wrap">
  <div class="gdi-dl-url-row">
    <span class="gdi-dl-url-text" id="dlurl" title="${escHtml(i)}">${escHtml(i)}</span>
    <button class="gdi-btn gdi-btn-ghost gdi-btn-icon" type="button" onclick="copyShareUrl(${escHtml(JSON.stringify(i))})" title="Copy URL"><i class="bi bi-clipboard"></i></button>
  </div>
  <div class="gdi-dl-actions">
    <a href="${i}" class="gdi-btn gdi-btn-primary"><i class="bi bi-download"></i> Download</a>
    <div class="dropdown">
      <button type="button" class="gdi-btn gdi-btn-ghost gdi-btn-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" title="More options"><i class="bi bi-three-dots-vertical"></i></button>
      <ul class="dropdown-menu">
        ${a}
        <li><a class="dropdown-item" href="intent:${i}#Intent;component=idm.internet.download.manager/idm.internet.download.manager.Downloader;S.title=${e};end"><i class="bi bi-cloud-download me-2"></i>1DM Free</a></li>
        <li><a class="dropdown-item" href="intent:${i}#Intent;component=idm.internet.download.manager.adm.lite/idm.internet.download.manager.Downloader;S.title=${e};end"><i class="bi bi-cloud-download me-2"></i>1DM Lite</a></li>
        <li><a class="dropdown-item" href="intent:${i}#Intent;component=idm.internet.download.manager.plus/idm.internet.download.manager.Downloader;S.title=${e};end"><i class="bi bi-cloud-download me-2"></i>1DM+ Plus</a></li>
      </ul>
    </div>
  </div>
</div>`}

function copyShareUrl(i){navigator.clipboard.writeText(i).then(()=>showToast("Link copied!")).catch(()=>{const e=document.createElement("textarea");e.value=i,document.body.appendChild(e),e.select(),document.execCommand("copy"),document.body.removeChild(e),showToast("Link copied!")})}

function showToast(i){let e=document.getElementById("gdi-toast-container");e||(e=document.createElement("div"),e.id="gdi-toast-container",document.body.appendChild(e));const t=document.createElement("div");t.className="gdi-toast",t.innerHTML=`<i class="bi bi-check-circle-fill"></i> ${i}`,e.appendChild(t),setTimeout(()=>{t.classList.add("gdi-toast-out"),setTimeout(()=>t.remove(),200)},2400)}

function _viewerBreadcrumb(){return generateBreadcrumb(window.location.pathname)}

function _viewerCard(i,e,t,n,a){return`<div class="gdi-wrap">
  <div class="gdi-viewer">
    <div class="gdi-breadcrumb-wrap">
      <ol class="gdi-bc">${_viewerBreadcrumb()}</ol>
    </div>
    <div class="gdi-viewer-card">
      <div class="gdi-file-header">
        <span class="gdi-file-header-icon">${i}</span>
        <div class="gdi-file-header-info">
          <div class="gdi-file-header-name">${escHtml(e)}</div>
          <div class="gdi-file-header-meta">${escHtml(t)}</div>
        </div>
      </div>
      <div class="gdi-viewer-body">${n}</div>
      ${a?`<div class="gdi-viewer-footer">${a}</div>`:""}
    </div>
  </div>
</div>`}

function file_others(i,e,t,n,a,c){const l=getFileIcon(i.split(".").pop());$("#content").html(_viewerCard(l,i,t,'<p class="mb-3" style="color:var(--gdi-text-muted);font-size:13px;">No preview available for this file type.</p>',renderDownloadButtons(n,e)))}

function file_workspace(i,e,t,n){const a=GDOC_TYPES[t],c=a?a.icon:'<i class="bi bi-file-earmark-text"></i>',l=a?a.name:"Workspace File",o=(a?a.formats:[]).map(r=>`<a class="btn btn-sm btn-outline-secondary me-2 mb-2" href="${n}&fmt=${r.ext}" download="${escHtml(i)}.${r.ext}">
           <i class="bi bi-download me-1"></i>${r.label}
         </a>`).join(""),s=`
      <p style="color:var(--gdi-text-muted);font-size:13px;margin-bottom:12px;">
        This is a <strong>${escHtml(l)}</strong>. It cannot be previewed here \u2014 choose a format to export and download.
      </p>
      <div>${o}</div>`;$("#content").html(_viewerCard(c,i,e,s,""))}

function file_code(i,e,t,n,a,c,l,d){const UI=window.UI||{},o=getFileIcon(c);$("#content").html(_viewerCard(o,i,t,`
    <div id="code_spinner"></div>
    <div class="gdi-code-outer" style="display:none;">
      <pre><code id="editor"></code></pre>
    </div>`,renderDownloadButtons(a,e))),UI.second_domain_for_dl||($("#code_spinner").html('<div class="gdi-spinner-wrap"><div class="gdi-spinner"></div></div>'),n<=1024*1024*2?$.get(a,function(r){$("#editor").html($("<div/>").text(r).html()),$("#code_spinner").remove(),$(".gdi-code-outer").show()}):($("#code_spinner").remove(),$(".gdi-code-outer").show(),$("#editor").html('<span style="color:var(--gdi-text-muted);">File too large to preview (max 2 MB)</span>')))}

function file_video(i,e,t,n,a,c,l,d,o){
const UI=window.UI||{},player_config=window.player_config||{};
o=o||[];
const s=a.includes(".m3u8")||c==="application/x-mpegURL";
let r="",p="",g="";
if(!UI.disable_player){
  if(player_config.player==="plyr"){
    r=`<video id="player" playsinline controls autoplay data-poster="${n}">
      <source src="${a}" type="${s?"application/x-mpegURL":"video/mp4"}">
      ${o.map(h=>`<track kind="subtitles" src="${escHtml(h.url)}" label="${escHtml(h.label)}" default>`).join("")}
    </video>`;
    p="https://cdn.plyr.io/"+player_config.plyr_io_version+"/plyr.polyfilled.js";
    g="https://cdn.plyr.io/"+player_config.plyr_io_version+"/plyr.css";
  } else if(player_config.player==="videojs"){
    r=`<video id="vplayer" poster="${n}" class="video-js vjs-default-skin vjs-big-play-centered" controls autoplay preload="auto" width="100%" height="100%" data-setup='{"fluid":true,"autoplay":true}'>
      <source src="${a}" type="${s?"application/x-mpegURL":"video/mp4"}">
      <source src="${a}" type="video/webm">
      ${o.map(h=>`<track kind="subtitles" src="${escHtml(h.url)}" label="${escHtml(h.label)}" default>`).join("")}
    </video>`;
    p="https://vjs.zencdn.net/"+player_config.videojs_version+"/video.js";
    g="https://vjs.zencdn.net/"+player_config.videojs_version+"/video-js.css";
  } else if(player_config.player==="dplayer"){
    r='<div id="player-container"></div>';
    p="https://cdn.jsdelivr.net/npm/dplayer/dist/DPlayer.min.js";
    g="https://cdn.jsdelivr.net/npm/dplayer/dist/DPlayer.min.css";
  } else if(player_config.player==="jwplayer"){
    r='<div id="player"></div>';
    p="https://content.jwplatform.com/libraries/IDzF9Zmk.js";
  }
}

const f=`<div class="gdi-player-wrap" style="width:100%;margin:0 auto;">${r}</div>
<div id="gdi-player-nav" style="display:none;justify-content:space-between;align-items:center;margin-top:10px;gap:8px;">
  <button id="gdi-btn-prev" class="gdi-btn gdi-btn-ghost" style="flex:1;" title="Aula anterior"><i class="bi bi-skip-start-fill"></i> Anterior</button>
  <span id="gdi-nav-info" style="font-size:12px;color:var(--gdi-text-muted,#aaa);white-space:nowrap;"></span>
  <button id="gdi-btn-next" class="gdi-btn gdi-btn-ghost" style="flex:1;justify-content:flex-end;" title="Próxima aula">Próxima <i class="bi bi-skip-end-fill"></i></button>
</div>
<div id="gdi-playlist-wrap" style="margin-top:16px;display:none;">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
    <strong style="font-size:14px;"><i class="bi bi-collection-play me-2"></i>Playlist</strong>
    <span id="gdi-playlist-count" style="font-size:12px;color:var(--gdi-text-muted,#aaa);"></span>
  </div>
  <div id="gdi-playlist-list" style="max-height:260px;overflow-y:auto;border:1px solid rgba(255,255,255,0.12);border-radius:8px;padding:6px;background:rgba(0,0,0,0.2);"></div>
</div>`;

const u=UI.disable_video_download?"":renderDownloadButtons(a,e,{showMedia:true});
$("#content").html(_viewerCard('<i class="bi bi-camera-video-fill gdi-icon-video"></i>',i,t,f,u));
$(".gdi-viewer").css({"max-width":"1200px","width":"96%","margin":"0 auto"});

if(g){const h=document.createElement("link");h.rel="stylesheet";h.href=g;document.head.appendChild(h);}
window._gdiPlayerInstance=null;

function initPlayerEvents(){
  if(player_config.player==="plyr"){
    const m=new Plyr("#player",{autoplay:true,keyboard:{focused:true,global:true}});
    window._gdiPlayerInstance=m;
    m.on("ready",()=>m.play().catch(()=>{}));
    m.on("ended",playNextInPlaylist);
  } else if(player_config.player==="videojs"){
    const m=videojs("vplayer",{autoplay:true,playbackRates:[.5,.75,1,1.25,1.5,2],controlBar:{pictureInPictureToggle:true}});
    window._gdiPlayerInstance=m;
    m.ready(function(){
      this.play().catch(()=>{});
      this.el().addEventListener("keydown",function(v){
        if(v.target.tagName==="INPUT") return;
        if(v.key===" "){v.preventDefault();m.paused()?m.play():m.pause();}
        else if(v.key==="f") m.isFullscreen()?m.exitFullscreen():m.requestFullscreen();
        else if(v.key==="m") m.muted(!m.muted());
        else if(v.key==="ArrowRight") m.currentTime(m.currentTime()+10);
        else if(v.key==="ArrowLeft") m.currentTime(Math.max(0,m.currentTime()-10));
        else if(v.key==="ArrowUp") m.volume(Math.min(1,m.volume()+.1));
        else if(v.key==="ArrowDown") m.volume(Math.max(0,m.volume()-.1));
      });
    });
    m.on("ended",playNextInPlaylist);
  } else if(player_config.player==="dplayer"){
    const m=new DPlayer({container:document.getElementById("player-container"),autoplay:true,screenshot:true,
      video:{url:a,pic:n,type:s?"hls":"auto"},
      subtitle:o.length?{url:o[0].url,type:"webvtt"}:undefined});
    window._gdiPlayerInstance=m;
    m.play();
    m.on("ended",playNextInPlaylist);
  } else if(player_config.player==="jwplayer"){
    const m=jwplayer("player").setup({file:a,type:c,autostart:true,image:n,width:"100%",aspectratio:"16:9",title:i,
      description:"Powered by Google Drive Index",
      tracks:o.map(v=>({file:v.url,kind:"captions",label:v.label,default:true})),
      captions:{color:"#f3f378",fontSize:14,backgroundOpacity:50,edgeStyle:"raised"}});
    window._gdiPlayerInstance=m;
    m.on("complete",playNextInPlaylist);
  }
}

if(p){
  if(window.Plyr||window.videojs||window.DPlayer||window.jwplayer) initPlayerEvents();
  else{const h=document.createElement("script");h.src=p;h.onload=initPlayerEvents;document.head.appendChild(h);}
}

let playlistVideos=[],currentIndex=-1;

function renderPlaylistUI(){
  if(!playlistVideos.length) return;
  let h="";
  playlistVideos.forEach((m,v)=>{
    const w=v===currentIndex;
    const y=w?"background:var(--bs-primary,#1f6feb);color:#fff;":"background:rgba(255,255,255,0.05);color:var(--gdi-text,#e6edf3);";
    h+=`<div class="gdi-playlist-item" data-idx="${v}" style="padding:8px 12px;margin:3px 0;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;font-size:13px;transition:background 0.2s;${y}">
      <div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:80%;">
        <i class="bi bi-${w?"play-fill":"film"} me-2"></i>
        <span style="font-weight:${w?"600":"400"};">${escHtml(m.name)}</span>
      </div>
      <span style="font-size:11px;opacity:0.8;">${m.size||""}</span>
    </div>`;
  });
  $("#gdi-playlist-list").html(h);
  $("#gdi-playlist-count").text(`${currentIndex+1} / ${playlistVideos.length}`);
  $("#gdi-playlist-wrap").show();
  // Update prev/next nav bar
  const navBar=document.getElementById("gdi-player-nav");
  if(navBar && playlistVideos.length>1){
    navBar.style.display="flex";
    document.getElementById("gdi-nav-info").textContent=`${currentIndex+1} / ${playlistVideos.length}`;
    const prevBtn=document.getElementById("gdi-btn-prev");
    const nextBtn=document.getElementById("gdi-btn-next");
    prevBtn.disabled=currentIndex<=0;
    prevBtn.style.opacity=currentIndex<=0?"0.4":"1";
    nextBtn.disabled=currentIndex>=playlistVideos.length-1;
    nextBtn.style.opacity=currentIndex>=playlistVideos.length-1?"0.4":"1";
  }
  $(".gdi-playlist-item").off("click").on("click",function(){
    const m=parseInt($(this).data("idx"));
    if(!isNaN(m)&&playlistVideos[m]) switchVideo(m);
  });
}

// Bind prev/next buttons
document.getElementById("gdi-btn-prev")?.addEventListener("click",()=>{
  if(currentIndex>0) switchVideo(currentIndex-1);
});
document.getElementById("gdi-btn-next")?.addEventListener("click",()=>{
  if(currentIndex<playlistVideos.length-1) switchVideo(currentIndex+1);
});

function switchVideo(h){
  if(h<0||h>=playlistVideos.length) return;
  currentIndex=h;
  const m=playlistVideos[currentIndex];
  if(m.pageUrl) history.pushState(null,m.name,m.pageUrl);
  $(".gdi-file-header-name").text(m.name);
  $(".gdi-file-header-meta").text(m.size);
  const v=window.drive_names?window.drive_names[window.current_drive_order||0]:"Drive";
  $("title").html(`${v} - ${m.name}`);
  if(!UI.disable_video_download) $(".gdi-viewer-footer").html(renderDownloadButtons(m.streamUrl,encodeURIComponent(m.name),{showMedia:true}));
  if(player_config.player==="plyr"&&window._gdiPlayerInstance)
    window._gdiPlayerInstance.source={type:"video",title:m.name,sources:[{src:m.streamUrl,type:m.streamUrl.includes(".m3u8")||m.mimeType==="application/x-mpegURL"?"application/x-mpegURL":"video/mp4"}]},window._gdiPlayerInstance.play().catch(()=>{});
  else if(player_config.player==="videojs"&&window._gdiPlayerInstance)
    window._gdiPlayerInstance.src({src:m.streamUrl,type:m.streamUrl.includes(".m3u8")||m.mimeType==="application/x-mpegURL"?"application/x-mpegURL":"video/mp4"}),window._gdiPlayerInstance.play().catch(()=>{});
  else if(player_config.player==="dplayer"&&window._gdiPlayerInstance)
    window._gdiPlayerInstance.switchVideo({url:m.streamUrl,pic:m.poster,type:m.streamUrl.includes(".m3u8")||m.mimeType==="application/x-mpegURL"?"hls":"auto"}),window._gdiPlayerInstance.play();
  else if(player_config.player==="jwplayer"&&window._gdiPlayerInstance)
    window._gdiPlayerInstance.load([{file:m.streamUrl,type:m.mimeType,image:m.poster,title:m.name}]),window._gdiPlayerInstance.play();
  else{const w=document.getElementById("player")||document.getElementById("vplayer");if(w){w.src=m.streamUrl;w.play().catch(()=>{});}}
  renderPlaylistUI();
}

function playNextInPlaylist(){
  if(currentIndex>=0&&currentIndex<playlistVideos.length-1) switchVideo(currentIndex+1);
}

// Build playlist: first try current folder, if only 1 video → scan parent folder's subfolders
const currentPath=window.location.pathname;
const folderPath=currentPath.split("/").slice(0,-1).join("/")+"/";
const parentPath=currentPath.split("/").slice(0,-2).join("/")+"/";

function buildPlaylistFromFiles(files,basePath){
  const videos=[];
  files.forEach(v=>{
    if(FILE_TYPES.video.includes(v.fileExtension)||v.mimeType&&v.mimeType.includes("video")){
      const w=encodeURIComponent(v.name);
      const y=UI.second_domain_for_dl?UI.downloaddomain+v.link:window.location.origin+v.link;
      const _=basePath+w+"?a=view";
      const b=v.thumbnailLink?v.thumbnailLink.replace("s220","s0"):UI.poster;
      videos.push({id:v.id,name:v.name,size:formatFileSize(v.size),streamUrl:y,pageUrl:_,mimeType:v.mimeType,poster:b,folder:basePath});
    }
  });
  return videos;
}

async function loadCrossFolderPlaylist(){
  // Get parent folder listing
  return new Promise((resolve)=>{
    requestListPath(parentPath,{},function(parentData){
      if(!parentData||!parentData.data||!parentData.data.files){resolve([]);return;}
      const subFolders=parentData.data.files.filter(f=>f.mimeType==="application/vnd.google-apps.folder");
      if(!subFolders.length){resolve([]);return;}
      // Sort folders by name
      subFolders.sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true,sensitivity:'base'}));
      const allVideos=[];
      let done=0;
      subFolders.forEach(folder=>{
        const fpath=parentPath+encodeURIComponent(folder.name)+"/";
        requestListPath(fpath,{},function(folderData){
          if(folderData&&folderData.data&&folderData.data.files){
            const vids=buildPlaylistFromFiles(folderData.data.files,fpath);
            // Take first video file from each subfolder (typically 001 - aula.mp4)
            if(vids.length>0) allVideos.push({sortKey:folder.name,video:vids[0]});
          }
          done++;
          if(done===subFolders.length){
            allVideos.sort((a,b)=>a.sortKey.localeCompare(b.sortKey,undefined,{numeric:true,sensitivity:'base'}));
            resolve(allVideos.map(x=>x.video));
          }
        },null);
      });
    },null);
  });
}

requestListPath(folderPath,{},async function(h){
  if(!h||!h.data||!h.data.files) return;
  const m=h.data.files;
  let videos=buildPlaylistFromFiles(m,folderPath);

  // Cross-folder mode: if only 0 or 1 video in current folder, try parent
  if(videos.length<=1){
    const crossVideos=await loadCrossFolderPlaylist();
    if(crossVideos.length>1){
      playlistVideos=crossVideos;
      currentIndex=playlistVideos.findIndex(v=>v.name===i||v.streamUrl===a);
      if(currentIndex===-1){
        // Add current video if not found
        playlistVideos.unshift({name:i,size:t,streamUrl:a,pageUrl:window.location.href,mimeType:c,poster:n,folder:folderPath});
        currentIndex=0;
      }
      renderPlaylistUI();
      return;
    }
  }

  playlistVideos=videos;
  currentIndex=playlistVideos.findIndex(v=>v.name===i||v.streamUrl===a);
  if(currentIndex===-1&&playlistVideos.length>0){
    playlistVideos.unshift({name:i,size:t,streamUrl:a,pageUrl:window.location.href,mimeType:c,poster:n,folder:folderPath});
    currentIndex=0;
  }
  renderPlaylistUI();
},null);}
function file_audio(i,e,t,n,a,c,l){const UI=window.UI||{};l=l||[{name:i,url:n,cover:UI.audioposter}];const d=UI.disable_player?"":'<div id="aplayer-container" style="max-width:680px;margin:0 auto;"></div>',o=UI.disable_audio_download?"":renderDownloadButtons(n,e,{showMedia:!0});if($("#content").html(_viewerCard('<i class="bi bi-music-note-beamed gdi-icon-audio"></i>',i,t,d,o)),UI.disable_player)return;const s=document.createElement("link");s.rel="stylesheet",s.href="https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.css",document.head.appendChild(s);const r=document.createElement("script");if(r.src="https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.js",r.onload=function(){window._gdiAPlayer=new APlayer({container:document.getElementById("aplayer-container"),mini:!1,autoplay:!1,theme:"#4d9fec",loop:"all",order:"list",preload:"auto",volume:.7,listFolded:!1,audio:l})},document.head.appendChild(r),l.length<=1){const p=window.location.pathname.split("/").slice(0,-1).join("/")+"/";requestListPath(p,{},function(g){if(!g||!g.data||!g.data.files)return;const f=g.data.files.filter(u=>FILE_TYPES.audio.includes(u.fileExtension));if(f.length>1){const u=f.map(m=>({name:m.name,url:UI.second_domain_for_dl?UI.downloaddomain+m.link:window.location.origin+m.link,cover:UI.audioposter}));window._gdiAPlayer&&window._gdiAPlayer.destroy(),window._gdiAPlayer=new APlayer({container:document.getElementById("aplayer-container"),mini:!1,loop:"all",order:"list",preload:"auto",volume:.7,audio:u});const h=u.findIndex(m=>m.url===n);h>0&&window._gdiAPlayer.list.switch(h)}},null)}}

function file_pdf(i,e,t,n,a,c){const l=`<div class="gdi-wrap">
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
</div>`;$("#content").html(l);let d=null,o=1,s=1;function r(){const p=document.getElementById("pdf-canvas"),g=p.getContext("2d");pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";function f(u){d.getPage(u).then(function(h){const m=h.getViewport({scale:s});p.height=m.height,p.width=m.width,h.render({canvasContext:g,viewport:m}).promise.then(function(){$("#pdf-spinner").hide()}),document.getElementById("pdf-page-num").textContent=u})}pdfjsLib.getDocument(n).promise.then(function(u){d=u,document.getElementById("pdf-page-count").textContent=u.numPages,f(o)}).catch(function(u){$("#pdf-spinner").html(`<div class="gdi-alert gdi-alert-error">Could not load PDF: ${u.message}</div>`)}),document.getElementById("pdf-prev").addEventListener("click",function(){o>1&&(o--,f(o))}),document.getElementById("pdf-next").addEventListener("click",function(){d&&o<d.numPages&&(o++,f(o))}),document.getElementById("pdf-zoom").addEventListener("input",function(){s=parseInt(this.value)/100,document.getElementById("pdf-zoom-val").textContent=this.value+"%",f(o)})}if(typeof pdfjsLib<"u")r();else{const p=document.createElement("script");p.src="https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js",p.onload=r,p.onerror=function(){$("#pdf-spinner").html('<div class="gdi-alert gdi-alert-error">Failed to load PDF viewer.</div>')},document.head.appendChild(p)}}

function file_image(i,e,t,n,a,c){const l=`<div class="gdi-wrap">
  <div class="gdi-viewer">
    <div class="gdi-breadcrumb-wrap"><ol class="gdi-bc">${_viewerBreadcrumb()}</ol></div>
    <div class="gdi-viewer-card">
      <div class="gdi-file-header">
        <span class="gdi-file-header-icon"><i class="bi bi-image gdi-icon-image"></i></span>
        <div class="gdi-file-header-info">
          <div class="gdi-file-header-name">${escHtml(i)}</div>
          <div class="gdi-file-header-meta">${escHtml(t)}</div>
        </div>
      </div>
      <div class="gdi-viewer-body no-pad">
        <div class="gdi-img-wrap">
          <img src="${n}" alt="${escHtml(i)}" loading="lazy">
        </div>
      </div>
      <div class="gdi-viewer-footer">${renderDownloadButtons(n,e)}</div>
    </div>
  </div>
</div>`;$("#content").html(l)}

function formatDateTime(i){return i?new Date(i).toLocaleString():""}
const utc2delhi=formatDateTime;

function formatFileSize(i){const e=Number(i);return isNaN(e)||e<0?"":e>=1099511627776?(e/1099511627776).toFixed(2)+" TB":e>=1073741824?(e/1073741824).toFixed(2)+" GB":e>=1048576?(e/1048576).toFixed(2)+" MB":e>=1024?(e/1024).toFixed(2)+" KB":e>1?e+" bytes":e===1?"1 byte":"0 bytes"}

function markdown(i,e){const t=marked.parse(e);$(i).show().html(t)}

async function getCookie(i){const e=i+"=",t=document.cookie.split(";");for(let n=0;n<t.length;n++){let a=t[n];for(;a.charAt(0)==" ";)a=a.substring(1);if(a.indexOf(e)==0)return a.substring(e.length)}return null}

document.addEventListener("change",function(i){i.target&&i.target.id==="select-all-checkboxes"&&document.querySelectorAll("input.gdi-row-check").forEach(t=>{t.checked=i.target.checked})});

window.onpopstate=function(){render(window.location.pathname)};

function fetchQuota(){const i=window.current_drive_order||0;fetch(`/${i}:quota`).then(e=>{if(!e.ok)throw new Error("quota fetch failed");return e.json()}).then(e=>{const t=e.storageQuota;if(!t)return;const n=Number(t.usage||0),a=Number(t.limit||0),c=document.getElementById("gdi-quota-bar"),l=document.getElementById("gdi-quota-text"),d=document.getElementById("gdi-quota-fill");if(!c||!l||!d)return;const o=a>0?Math.min(100,n/a*100):0,s=o>90?"#f44336":o>70?"#ff9800":"#4caf50";l.textContent=a>0?`${formatFileSize(n)} used of ${formatFileSize(a)} (${o.toFixed(1)}%)`:`${formatFileSize(n)} used`,d.style.width=o+"%",d.style.background=s,c.style.display="block"}).catch(()=>{})}

$(function(){init(),window.UI?.debug_mode&&GDIDebug.attach(),window.UI?.show_quota&&fetchQuota(),new URLSearchParams(window.location.search).get("embed")==="1"&&document.body.classList.add("embed-mode"),render(window.location.pathname)});
// ============================================================
// POMODORO TIMER - GDI Study Extension
// ============================================================
(function initPomodoro() {
  const CSS = `
#gdi-pomodoro{position:fixed;bottom:80px;right:18px;z-index:9999;background:rgba(20,20,30,0.96);border:1.5px solid rgba(255,255,255,0.13);border-radius:14px;padding:14px 18px 12px;box-shadow:0 8px 32px rgba(0,0,0,0.45);min-width:190px;font-family:inherit;transition:opacity 0.2s;}
#gdi-pomodoro.gdi-pom-mini{min-width:auto;padding:8px 12px;}
#gdi-pom-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;gap:8px;}
#gdi-pom-title{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#74c0fc;}
#gdi-pom-phase{font-size:10px;color:#aaa;margin-left:4px;}
#gdi-pom-time{font-size:36px;font-weight:700;color:#f0f6fc;text-align:center;letter-spacing:.04em;margin:4px 0 10px;font-variant-numeric:tabular-nums;}
#gdi-pom-bar-wrap{height:4px;background:rgba(255,255,255,0.1);border-radius:2px;margin-bottom:10px;}
#gdi-pom-bar{height:4px;border-radius:2px;background:#1f6feb;width:100%;transition:width 0.9s linear,background 0.4s;}
#gdi-pom-controls{display:flex;gap:6px;justify-content:center;}
.gdi-pom-btn{background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.13);color:#e6edf3;border-radius:7px;padding:4px 10px;cursor:pointer;font-size:12px;transition:background 0.15s;}
.gdi-pom-btn:hover{background:rgba(255,255,255,0.18);}
#gdi-pom-config{display:flex;flex-direction:column;gap:5px;margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.08);}
.gdi-pom-cfg-row{display:flex;align-items:center;justify-content:space-between;font-size:11px;color:#aaa;}
.gdi-pom-cfg-row input{width:44px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.13);border-radius:5px;color:#f0f6fc;text-align:center;padding:2px 4px;font-size:11px;}
#gdi-pom-flash{position:fixed;inset:0;z-index:99998;pointer-events:none;opacity:0;transition:opacity 0.18s;}
#gdi-pom-toggle{position:fixed;bottom:80px;right:18px;z-index:9998;background:rgba(20,20,30,0.92);border:1.5px solid rgba(255,255,255,0.13);border-radius:50%;width:40px;height:40px;display:none;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,0.4);}
#gdi-pom-sessions{font-size:10px;color:#aaa;text-align:center;margin-bottom:4px;}
`;

  const styleEl = document.createElement('style');
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  // Flash overlay
  const flash = document.createElement('div');
  flash.id = 'gdi-pom-flash';
  document.body.appendChild(flash);

  // Widget HTML
  const wrap = document.createElement('div');
  wrap.id = 'gdi-pomodoro';
  wrap.innerHTML = `
    <div id="gdi-pom-header">
      <span><span id="gdi-pom-title">🍅 Pomodoro</span><span id="gdi-pom-phase"></span></span>
      <div style="display:flex;gap:4px;">
        <button class="gdi-pom-btn" id="gdi-pom-cfg-toggle" title="Configurar">⚙</button>
        <button class="gdi-pom-btn" id="gdi-pom-hide" title="Minimizar">–</button>
      </div>
    </div>
    <div id="gdi-pom-sessions"></div>
    <div id="gdi-pom-time">25:00</div>
    <div id="gdi-pom-bar-wrap"><div id="gdi-pom-bar"></div></div>
    <div id="gdi-pom-controls">
      <button class="gdi-pom-btn" id="gdi-pom-start">▶ Iniciar</button>
      <button class="gdi-pom-btn" id="gdi-pom-skip">⏭ Pular</button>
      <button class="gdi-pom-btn" id="gdi-pom-reset">↺</button>
    </div>
    <div id="gdi-pom-config" style="display:none;">
      <div class="gdi-pom-cfg-row"><span>Foco (min)</span><input id="gdi-pom-cfg-work" type="number" min="1" max="90" value="25"></div>
      <div class="gdi-pom-cfg-row"><span>Pausa curta</span><input id="gdi-pom-cfg-short" type="number" min="1" max="30" value="5"></div>
      <div class="gdi-pom-cfg-row"><span>Pausa longa</span><input id="gdi-pom-cfg-long" type="number" min="1" max="60" value="15"></div>
      <div class="gdi-pom-cfg-row"><span>Sessões p/ pausa longa</span><input id="gdi-pom-cfg-sess" type="number" min="1" max="10" value="4"></div>
    </div>
  `;
  document.body.appendChild(wrap);

  // Minimized toggle button
  const toggleBtn = document.createElement('div');
  toggleBtn.id = 'gdi-pom-toggle';
  toggleBtn.innerHTML = '🍅';
  toggleBtn.title = 'Mostrar Pomodoro';
  toggleBtn.style.display = 'none';
  document.body.appendChild(toggleBtn);
  toggleBtn.style.cssText += 'display:none;align-items:center;justify-content:center;';

  // State
  let cfg = { work: 25, short: 5, long: 15, sessions: 4 };
  let phase = 'work'; // 'work' | 'short' | 'long'
  let totalSecs = cfg.work * 60;
  let remainSecs = totalSecs;
  let running = false;
  let timer = null;
  let completedSessions = 0;

  // AudioContext for beep
  function playBeep(freq = 880, dur = 0.4, type = 'sine') {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = type; osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.start(); osc.stop(ctx.currentTime + dur);
    } catch(e) {}
  }

  function playAlarm(isWork) {
    // Triple beep sequence
    const notes = isWork ? [880, 1100, 880] : [660, 880, 660];
    notes.forEach((f, i) => setTimeout(() => playBeep(f, 0.35, 'sine'), i * 380));
  }

  function flashScreen(color) {
    flash.style.background = color;
    flash.style.opacity = '0.35';
    setTimeout(() => { flash.style.opacity = '0'; }, 700);
  }

  function phaseLabel() {
    if (phase === 'work') return ' — Foco';
    if (phase === 'short') return ' — Pausa curta';
    return ' — Pausa longa';
  }

  function phaseColor() {
    if (phase === 'work') return '#1f6feb';
    if (phase === 'short') return '#2f9e44';
    return '#7048e8';
  }

  function phaseBg() {
    if (phase === 'work') return '#1a3a5c';
    if (phase === 'short') return '#1a3a2a';
    return '#2a1a4a';
  }

  function fmt(s) {
    const m = Math.floor(s / 60), sec = s % 60;
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  }

  function updateUI() {
    document.getElementById('gdi-pom-time').textContent = fmt(remainSecs);
    document.getElementById('gdi-pom-phase').textContent = phaseLabel();
    const bar = document.getElementById('gdi-pom-bar');
    bar.style.width = (remainSecs / totalSecs * 100) + '%';
    bar.style.background = phaseColor();
    wrap.style.borderColor = phaseColor() + '55';
    document.getElementById('gdi-pom-sessions').textContent = `Sessão ${completedSessions % cfg.sessions || (running || completedSessions === 0 ? 1 : cfg.sessions)} de ${cfg.sessions}`;
    document.getElementById('gdi-pom-start').textContent = running ? '⏸ Pausar' : '▶ ' + (remainSecs < totalSecs && !running ? 'Continuar' : 'Iniciar');
    document.title = running ? `${fmt(remainSecs)} ${phaseLabel()} | ${document.siteName || 'GDI'}` : (document.siteName || 'GDI');
  }

  function nextPhase() {
    clearInterval(timer);
    running = false;
    if (phase === 'work') {
      completedSessions++;
      if (completedSessions % cfg.sessions === 0) {
        phase = 'long'; totalSecs = cfg.long * 60;
        flashScreen('#7048e8');
        playAlarm(false);
        notify('Pausa longa! Você merece 🎉', `${cfg.long} minutos de descanso.`);
      } else {
        phase = 'short'; totalSecs = cfg.short * 60;
        flashScreen('#2f9e44');
        playAlarm(false);
        notify('Pausa curta! ☕', `${cfg.short} minutos para respirar.`);
      }
    } else {
      phase = 'work'; totalSecs = cfg.work * 60;
      flashScreen('#1f6feb');
      playAlarm(true);
      notify('Hora de focar! 🍅', `${cfg.work} minutos de concentração.`);
    }
    remainSecs = totalSecs;
    updateUI();
    // Auto-start next phase
    startTimer();
  }

  function startTimer() {
    clearInterval(timer);
    running = true;
    timer = setInterval(() => {
      if (remainSecs <= 0) { nextPhase(); return; }
      remainSecs--;
      if (remainSecs <= 5 && remainSecs > 0) playBeep(440 + remainSecs * 20, 0.15, 'square');
      updateUI();
    }, 1000);
    updateUI();
  }

  function pauseTimer() { clearInterval(timer); running = false; updateUI(); }

  function resetTimer() {
    pauseTimer();
    phase = 'work'; totalSecs = cfg.work * 60; remainSecs = totalSecs;
    completedSessions = 0;
    updateUI();
  }

  function notify(title, body) {
    if (Notification.permission === 'granted') new Notification(title, { body, icon: '' });
    else if (Notification.permission !== 'denied') Notification.requestPermission();
  }

  Notification.requestPermission && Notification.requestPermission();

  // Load config from localStorage
  try {
    const saved = JSON.parse(localStorage.getItem('gdi-pomodoro-cfg') || '{}');
    if (saved.work) cfg = { ...cfg, ...saved };
    document.getElementById('gdi-pom-cfg-work').value = cfg.work;
    document.getElementById('gdi-pom-cfg-short').value = cfg.short;
    document.getElementById('gdi-pom-cfg-long').value = cfg.long;
    document.getElementById('gdi-pom-cfg-sess').value = cfg.sessions;
    totalSecs = cfg.work * 60; remainSecs = totalSecs;
  } catch(e) {}

  updateUI();

  // Events
  document.getElementById('gdi-pom-start').addEventListener('click', () => {
    running ? pauseTimer() : startTimer();
  });

  document.getElementById('gdi-pom-skip').addEventListener('click', nextPhase);
  document.getElementById('gdi-pom-reset').addEventListener('click', resetTimer);

  document.getElementById('gdi-pom-cfg-toggle').addEventListener('click', () => {
    const c = document.getElementById('gdi-pom-config');
    c.style.display = c.style.display === 'none' ? 'flex' : 'none';
  });

  document.getElementById('gdi-pom-hide').addEventListener('click', () => {
    wrap.style.display = 'none';
    toggleBtn.style.display = 'flex';
  });

  toggleBtn.addEventListener('click', () => {
    wrap.style.display = '';
    toggleBtn.style.display = 'none';
  });

  ['gdi-pom-cfg-work','gdi-pom-cfg-short','gdi-pom-cfg-long','gdi-pom-cfg-sess'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
      cfg = {
        work: parseInt(document.getElementById('gdi-pom-cfg-work').value) || 25,
        short: parseInt(document.getElementById('gdi-pom-cfg-short').value) || 5,
        long: parseInt(document.getElementById('gdi-pom-cfg-long').value) || 15,
        sessions: parseInt(document.getElementById('gdi-pom-cfg-sess').value) || 4,
      };
      localStorage.setItem('gdi-pomodoro-cfg', JSON.stringify(cfg));
      if (!running) { totalSecs = cfg.work * 60; remainSecs = totalSecs; phase = 'work'; updateUI(); }
    });
  });
})();
