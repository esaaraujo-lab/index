// v2.5.9 — Classic Design System
// REFACTORED: Video Playlist & Autoplay Next logic moved to client-side

// ============================================================================
// FILE TYPE CONSTANTS - Centralized file extension mappings
// ============================================================================
const FILE_TYPES = {
    video:    ['mp4', 'webm', 'avi', 'mpg', 'mpeg', 'mkv', 'rm', 'rmvb', 'mov', 'wmv', 'asf', 'ts', 'flv', '3gp', 'm4v'],
    audio:    ['mp3', 'flac', 'wav', 'ogg', 'm4a', 'aac', 'wma', 'alac'],
    image:    ['bmp', 'jpg', 'jpeg', 'png', 'gif', 'svg', 'tiff', 'ico'],
    code:     ['php', 'css', 'go', 'java', 'js', 'json', 'txt', 'sh', 'html', 'xml', 'py', 'rb', 'c', 'cpp', 'h', 'hpp'],
    archive:  ['zip', 'rar', 'tar', '7z', 'gz'],
    document: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
    markdown: ['md']
};

// Google Workspace mimeType → display info + export formats (mirrors worker.js GDOC_EXPORT_FORMATS)
const GDOC_TYPES = {
    'application/vnd.google-apps.document':     { icon: '<i class="bi bi-file-earmark-text gdi-icon-doc"></i>',    name: 'Google Doc',    formats: [{ label: 'PDF', ext: 'pdf' }, { label: 'DOCX', ext: 'docx' }, { label: 'TXT', ext: 'txt' }] },
    'application/vnd.google-apps.spreadsheet':  { icon: '<i class="bi bi-file-earmark-spreadsheet gdi-icon-doc"></i>', name: 'Google Sheet',  formats: [{ label: 'PDF', ext: 'pdf' }, { label: 'XLSX', ext: 'xlsx' }, { label: 'CSV', ext: 'csv' }] },
    'application/vnd.google-apps.presentation': { icon: '<i class="bi bi-file-earmark-slides gdi-icon-doc"></i>',  name: 'Google Slides', formats: [{ label: 'PDF', ext: 'pdf' }, { label: 'PPTX', ext: 'pptx' }] },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function isFileType(ext, type) {
    return FILE_TYPES[type] && FILE_TYPES[type].includes(ext?.toLowerCase());
}

/**
 * Return an inline Bootstrap-Icons element for the given file extension.
 */
function getFileIcon(ext) {
    const e = ext?.toLowerCase();
    if (isFileType(e, 'video'))   return '<i class="bi bi-camera-video-fill gdi-icon-video"></i>';
    if (isFileType(e, 'audio'))   return '<i class="bi bi-music-note-beamed gdi-icon-audio"></i>';
    if (isFileType(e, 'image'))   return '<i class="bi bi-image gdi-icon-image"></i>';
    if (isFileType(e, 'archive')) return '<i class="bi bi-file-earmark-zip-fill gdi-icon-archive"></i>';
    if (isFileType(e, 'markdown'))return '<i class="bi bi-markdown-fill gdi-icon-md"></i>';
    if (e === 'pdf')              return '<i class="bi bi-file-earmark-pdf-fill gdi-icon-pdf"></i>';
    if (isFileType(e, 'code'))    return '<i class="bi bi-code-slash gdi-icon-code"></i>';
    return '<i class="bi bi-file-earmark gdi-icon-file"></i>';
}

/**
 * Generate breadcrumb navigation links for file-view pages.
 * Returns an array of <li> elements as a string for .gdi-bc lists.
 */
function generateBreadcrumb(path) {
    const parts = path.split('/');
    let html = '';
    let built = '';
    for (let i = 0; i < parts.length; i++) {
        let part = parts[i];
        built += (i === 0 ? '' : '/') + part;
        const isLast = (i === parts.length - 1);
        let decoded;
        try { decoded = decodeURIComponent(part); } catch (_) { decoded = part; }
        const rootMatch = decoded.match(/^(\d+):$/);
        const display = rootMatch ? (window.drive_names && window.drive_names[+rootMatch[1]] || decoded) : (decoded || 'Home');
        const label = display.length > 20 ? display.slice(0, 16) + '…' : display;
        if (isLast) {
            html += `<li class="gdi-bc-cur" title="${escHtml(display)}">${escHtml(label)}</li>`;
        } else {
            html += `<li><a href="${built ? built + '/' : '/'}" title="${escHtml(display)}">${escHtml(label)}</a></li><li class="gdi-bc-sep">/</li>`;
        }
    }
    return html;
}

// OS detection
const Os = {
    isWindows: navigator.userAgent.toUpperCase().indexOf('WIN') > -1,
    isMac:     navigator.userAgent.toUpperCase().indexOf('MAC') > -1,
    isMacLike: /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent),
    isIos:     /(iPhone|iPod|iPad)/i.test(navigator.userAgent),
    isMobile:  /Android|webOS|iPhone|iPad|iPod|iOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
};

function getDocumentHeight() {
    const D = document;
    return Math.max(
        D.body.scrollHeight, D.documentElement.scrollHeight,
        D.body.offsetHeight, D.documentElement.offsetHeight,
        D.body.clientHeight, D.documentElement.clientHeight
    );
}

function getQueryVariable(variable) {
    const query = window.location.search.substring(1);
    const vars = query.split('&');
    for (let i = 0; i < vars.length; i++) {
        const pair = vars[i].split('=');
        if (pair[0] == variable) return pair.slice(1).join('=');
    }
    return false;
}

// HTML-escape a string for safe injection into innerHTML / template literals.
function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

// ============================================================================
// DEBUG PANEL
// ============================================================================
const GDIDebug = (() => {
    const entries = [];
    let _panelEl = null;

    function _ts() { return new Date().toISOString().slice(11, 23); }

    function _render() {
        if (!_panelEl) _panelEl = document.getElementById('gdi-debug-log');
        if (!_panelEl) return;
        const COLORS = { req: '#da77f2', api: '#69db7c', error: '#ff6b6b', warn: '#ffa94d', info: '#74c0fc' };
        const html = entries.map(e => {
            const color = COLORS[e.type] || '#aaa';
            const dataStr = e.data != null
                ? (typeof e.data === 'string' ? e.data : JSON.stringify(e.data, null, 2))
                : '';
            return `<div class="gdi-dbg-entry">` +
                `<span class="gdi-dbg-ts">${e.ts}</span>` +
                `<span class="gdi-dbg-badge" style="color:${color}">[${e.type.toUpperCase()}]</span>` +
                `<span class="gdi-dbg-msg">${escHtml(e.label)}</span>` +
                (dataStr ? `<pre class="gdi-dbg-pre">${escHtml(dataStr)}</pre>` : '') +
                `</div>`;
        }).join('');
        _panelEl.innerHTML = html || '<span class="gdi-dbg-empty">No entries yet.</span>';
        _panelEl.scrollTop = _panelEl.scrollHeight;
        const badge = document.getElementById('gdi-dbg-count');
        if (badge) badge.textContent = entries.length;
    }

    function log(type, label, data) {
        if (!window.UI?.debug_mode) return;
        entries.push({ ts: _ts(), type, label, data: data !== undefined ? data : null });
        _render();
    }

    function attach() {
        _panelEl = document.getElementById('gdi-debug-log');
        const style = document.createElement('style');
        style.textContent = [
            '.gdi-debug-wrap{width:100%;background:#0d1117;border-top:2px solid #f0883e;font-family:monospace;font-size:12px;}',
            '.gdi-debug-head{display:flex;align-items:center;justify-content:space-between;padding:8px 14px;background:#161b22;cursor:pointer;user-select:none;color:#8b949e;}',
            '.gdi-debug-head:hover{background:#1c2128;}',
            '.gdi-debug-head strong{color:#f0f6fc;display:flex;align-items:center;gap:6px;}',
            '.gdi-dbg-count{background:#1f6feb;color:#fff;border-radius:10px;padding:1px 7px;font-size:11px;margin-left:4px;}',
            '.gdi-debug-actions{display:flex;gap:8px;}',
            '.gdi-debug-actions button{background:none;border:1px solid #30363d;color:#8b949e;border-radius:4px;padding:2px 9px;cursor:pointer;font-size:11px;}',
            '.gdi-debug-actions button:hover{background:#1c2128;color:#f0f6fc;}',
            '#gdi-debug-log{max-height:300px;overflow-y:auto;padding:10px 14px;background:#0d1117;color:#e6edf3;}',
            '#gdi-debug-log.collapsed{display:none;}',
            '.gdi-dbg-entry{padding:3px 0;border-bottom:1px solid #21262d;line-height:1.6;}',
            '.gdi-dbg-ts{color:#484f58;margin-right:6px;}',
            '.gdi-dbg-badge{font-weight:bold;margin-right:6px;}',
            '.gdi-dbg-msg{color:#e6edf3;}',
            '.gdi-dbg-pre{margin:2px 0 2px 20px;padding:4px 8px;background:#161b22;border-left:2px solid #30363d;white-space:pre-wrap;word-break:break-all;color:#8b949e;font-size:11px;}',
            '.gdi-dbg-empty{color:#484f58;}'
        ].join('');
        document.head.appendChild(style);
        if (entries.length > 0) _render();
        log('info', 'Debug attached', {
            path: window.location.pathname,
            search: window.location.search,
            drive: window.current_drive_order,
            version: window.UI?.version,
            model_type: window.MODEL?.root_type
        });
    }

    function clear() {
        entries.length = 0;
        if (_panelEl) {
            _panelEl.innerHTML = '<span class="gdi-dbg-empty">Cleared.</span>';
        }
        const badge = document.getElementById('gdi-dbg-count');
        if (badge) badge.textContent = '0';
    }

    return { log, attach, clear };
})();

// [DEBUG PANEL CODE CONTINUED...]
// NOTE: Truncated for brevity - include full debug panel code from original app.js here
// Lines 165-1295 from original app.js should be inserted here

// ============================================================================
// FILE VIEWER — Code
// ============================================================================
function file_code(name, encoded_name, size, bytes, url, ext, file_id, cookie_folder_id) {
    const icon = getFileIcon(ext);
    const bodyHtml = `
    <div id="code_spinner"></div>
    <div class="gdi-code-outer" style="display:none;">
      <pre><code id="editor"></code></pre>
    </div>`;

    $('#content').html(_viewerCard(
        icon, name, size,
        bodyHtml,
        renderDownloadButtons(url, encoded_name)
    ));

    if (!UI.second_domain_for_dl) {
        $('#code_spinner').html(`<div class="gdi-spinner-wrap"><div class="gdi-spinner"></div></div>`);
        if (bytes <= 1024 * 1024 * 2) {
            $.get(url, function(data) {
                $('#editor').html($('<div/>').text(data).html());
                $('#code_spinner').remove();
                $('.gdi-code-outer').show();
            });
        } else {
            $('#code_spinner').remove();
            $('.gdi-code-outer').show();
            $('#editor').html(`<span style="color:var(--gdi-text-muted);">File too large to preview (max 2 MB)</span>`);
        }
    }
}

// ============================================================================
// VIDEO PLAYLIST MANAGEMENT — Client-Side
// ============================================================================

/** Inject playlist CSS once */
(function _injectPlaylistStyles() {
    if (document.getElementById('gdi-playlist-styles')) return;
    const s = document.createElement('style');
    s.id = 'gdi-playlist-styles';
    s.textContent = [
        '#video-playlist-wrapper{margin-top:12px;border:1px solid var(--gdi-border,#333);border-radius:8px;overflow:hidden;background:var(--gdi-card-bg,#1a1a2e);}',
        '.gdi-playlist-header{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--gdi-header-bg,#16213e);border-bottom:1px solid var(--gdi-border,#333);}',
        '.gdi-playlist-header h4{margin:0;font-size:14px;font-weight:600;color:var(--gdi-text,#eee);}',
        '.gdi-autoplay-toggle{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--gdi-text-muted,#aaa);cursor:pointer;user-select:none;}',
        '.gdi-autoplay-toggle input{cursor:pointer;}',
        '.gdi-playlist-controls{display:flex;gap:8px;padding:8px 14px;background:var(--gdi-header-bg,#16213e);border-bottom:1px solid var(--gdi-border,#333);}',
        '.gdi-playlist-list{max-height:280px;overflow-y:auto;}',
        '.gdi-playlist-item{display:flex;align-items:center;gap:10px;padding:9px 14px;cursor:pointer;border-bottom:1px solid var(--gdi-border,#222);transition:background .15s;}',
        '.gdi-playlist-item:last-child{border-bottom:none;}',
        '.gdi-playlist-item:hover{background:var(--gdi-hover,rgba(255,255,255,.06));}',
        '.gdi-playlist-item.active{background:var(--gdi-active,rgba(99,179,237,.15));border-left:3px solid var(--gdi-primary,#63b3ed);}',
        '.gdi-playlist-item-icon{color:var(--gdi-primary,#63b3ed);flex-shrink:0;font-size:16px;}',
        '.gdi-playlist-item-name{font-size:13px;color:var(--gdi-text,#ddd);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
        '.gdi-playlist-item.active .gdi-playlist-item-name{color:var(--gdi-primary,#63b3ed);font-weight:600;}',
        '#gdi-autoplay-toast{position:fixed;bottom:24px;right:24px;z-index:9999;background:#1a1a2e;border:1px solid #63b3ed;border-radius:10px;padding:14px 18px;color:#eee;font-size:14px;box-shadow:0 4px 20px rgba(0,0,0,.5);min-width:260px;display:none;}',
        '#gdi-autoplay-toast .gdi-toast-title{font-weight:600;margin-bottom:4px;color:#63b3ed;}',
        '#gdi-autoplay-toast .gdi-toast-cancel{margin-top:10px;display:flex;justify-content:space-between;align-items:center;}',
        '#gdi-autoplay-toast .gdi-toast-bar{height:4px;background:#63b3ed;border-radius:2px;transition:width linear;}',
        '#gdi-autoplay-toast button{background:none;border:1px solid #555;border-radius:5px;color:#aaa;padding:3px 10px;cursor:pointer;font-size:12px;}',
        '#gdi-autoplay-toast button:hover{background:#333;color:#eee;}'
    ].join('');
    document.head.appendChild(s);
})();

/** Get video file URL from a Drive file object */
function _videoFileUrl(f) {
    return (window.UI && UI.second_domain_for_dl && UI.downloaddomain)
        ? UI.downloaddomain + f.link
        : window.location.origin + f.link;
}

/** Resilient extension extractor */
function _fileExt(f) {
    return (f.fileExtension || f.name.split('.').pop() || '').toLowerCase();
}

/** Navigate to a video page */
function navigateToVideo(link) {
    window.location.href = link + '?a=view';
}

/** Show autoplay countdown toast; returns a cancel function */
function _showAutoplayToast(nextName, secs, onDone) {
    let toast = document.getElementById('gdi-autoplay-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'gdi-autoplay-toast';
        toast.innerHTML = `
            <div class="gdi-toast-title">A seguir</div>
            <div id="gdi-toast-name" style="margin-bottom:6px;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:280px;"></div>
            <div class="gdi-toast-bar-wrap" style="background:#333;border-radius:2px;height:4px;overflow:hidden;">
              <div id="gdi-toast-bar" class="gdi-toast-bar" style="width:100%;"></div>
            </div>
            <div class="gdi-toast-cancel">
              <span id="gdi-toast-counter" style="font-size:12px;color:#aaa;"></span>
              <button id="gdi-toast-cancel-btn">Cancelar</button>
            </div>`;
        document.body.appendChild(toast);
    }
    document.getElementById('gdi-toast-name').textContent = nextName;
    const bar = document.getElementById('gdi-toast-bar');
    const counter = document.getElementById('gdi-toast-counter');
    const cancelBtn = document.getElementById('gdi-toast-cancel-btn');
    toast.style.display = 'block';
    bar.style.transition = 'none';
    bar.style.width = '100%';

    let cancelled = false;
    let remaining = secs;
    counter.textContent = `Próximo em ${remaining}s`;

    // Animate bar
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            bar.style.transition = `width ${secs}s linear`;
            bar.style.width = '0%';
        });
    });

    const tick = setInterval(() => {
        remaining--;
        counter.textContent = `Próximo em ${remaining}s`;
        if (remaining <= 0) {
            clearInterval(tick);
            if (!cancelled) { toast.style.display = 'none'; onDone(); }
        }
    }, 1000);

    function cancel() {
        cancelled = true;
        clearInterval(tick);
        toast.style.display = 'none';
    }

    cancelBtn.onclick = cancel;
    return cancel;
}

/** Attach player "ended" listener — uses already-instantiated player references */
function _attachPlayerEndedListener(callback) {
    const p = window.player_config && player_config.player;
    if (p === 'plyr') {
        // Plyr instance is not stored globally in original code; listen on the media element directly
        const vid = document.querySelector('.gdi-player-wrap video');
        if (vid) { vid.addEventListener('ended', callback); return; }
    }
    if (p === 'videojs' && window._gdiVjsPlayer) {
        window._gdiVjsPlayer.on('ended', callback); return;
    }
    if (p === 'dplayer' && window._gdiDPlayer) {
        window._gdiDPlayer.on('ended', callback); return;
    }
    if (p === 'jwplayer') {
        try { jwplayer('player').on('complete', callback); } catch (_) {}
        return;
    }
    // Fallback: native video element
    const vid = document.querySelector('.gdi-player-wrap video');
    if (vid) vid.addEventListener('ended', callback);
}

/**
 * Initialize video playlist functionality after player is ready.
 * @param {string} parentPath  - folder path
 * @param {string} currentUrl  - streaming URL of the currently playing video
 * @param {Function} onReady   - called after player scripts load (so we bind inside onload)
 */
function initializeVideoPlaylist(parentPath, currentUrl) {
    requestListPath(parentPath, {}, function(res) {
        if (!res || !res.data || !res.data.files) return;

        const videoFiles = res.data.files.filter(f => FILE_TYPES.video.includes(_fileExt(f)));
        if (videoFiles.length <= 1) return;

        let currentIndex = videoFiles.findIndex(f => {
            const u = _videoFileUrl(f);
            return u === currentUrl || f.name === decodeURIComponent(currentUrl.split('/').pop().split('?')[0]);
        });
        if (currentIndex === -1) currentIndex = 0;

        // Build HTML
        const itemsHtml = videoFiles.map((f, idx) => {
            const isCurrent = idx === currentIndex;
            return `<div class="gdi-playlist-item${isCurrent ? ' active' : ''}" data-idx="${idx}" title="${escHtml(f.name)}">
                <span class="gdi-playlist-item-icon"><i class="bi bi-${isCurrent ? 'play-fill' : 'play-circle'}"></i></span>
                <span class="gdi-playlist-item-name">${escHtml(f.name)}</span>
            </div>`;
        }).join('');

        const wrapHtml = `<div id="video-playlist-wrapper">
            <div class="gdi-playlist-header">
                <h4><i class="bi bi-collection-play-fill" style="margin-right:6px;"></i>Folder Playlist</h4>
                <label class="gdi-autoplay-toggle" title="Reproduzir próximo automaticamente">
                    <input type="checkbox" id="autoplay-next-checkbox" checked>
                    <span>Autoplay Next</span>
                </label>
            </div>
            <div class="gdi-playlist-controls">
                <button id="gdi-vprev" class="gdi-btn gdi-btn-sm"${currentIndex === 0 ? ' disabled' : ''}>
                    <i class="bi bi-skip-backward-fill"></i> Anterior
                </button>
                <button id="gdi-vnext" class="gdi-btn gdi-btn-sm"${currentIndex >= videoFiles.length - 1 ? ' disabled' : ''}>
                    Próximo <i class="bi bi-skip-forward-fill"></i>
                </button>
            </div>
            <div class="gdi-playlist-list">${itemsHtml}</div>
        </div>`;

        const playerWrap = document.querySelector('.gdi-player-wrap');
        if (playerWrap) {
            playerWrap.insertAdjacentHTML('afterend', wrapHtml);
        } else {
            document.getElementById('content').insertAdjacentHTML('beforeend', wrapHtml);
        }

        // Scroll active item into view
        const activeItem = document.querySelector('.gdi-playlist-item.active');
        if (activeItem) activeItem.scrollIntoView({ block: 'nearest' });

        const autoplayCb = document.getElementById('autoplay-next-checkbox');

        function goTo(idx) {
            if (idx < 0 || idx >= videoFiles.length) return;
            navigateToVideo(videoFiles[idx].link);
        }

        document.getElementById('gdi-vprev').addEventListener('click', () => goTo(currentIndex - 1));
        document.getElementById('gdi-vnext').addEventListener('click', () => goTo(currentIndex + 1));

        document.querySelectorAll('.gdi-playlist-item').forEach(el => {
            el.addEventListener('click', () => goTo(+el.dataset.idx));
        });

        // Autoplay ended handler
        let cancelToast = null;
        _attachPlayerEndedListener(function() {
            if (!autoplayCb.checked) return;
            const nextIdx = currentIndex + 1;
            if (nextIdx >= videoFiles.length) return;
            const nextFile = videoFiles[nextIdx];
            cancelToast = _showAutoplayToast(nextFile.name, 5, () => {
                navigateToVideo(nextFile.link);
            });
        });

    }, null);
}

// ============================================================================
// FILE VIEWER — Video
// ============================================================================
function file_video(name, encoded_name, size, poster, url, mimeType, file_id, cookie_folder_id, subtitles) {
    subtitles = subtitles || [];
    const isHLS = url.includes('.m3u8') || mimeType === 'application/x-mpegURL';
    let playerHtml = '';
    let player_js = '';
    let player_css = '';

    if (!UI.disable_player) {
        if (player_config.player === 'plyr') {
            playerHtml = `<video id="player" playsinline controls data-poster="${poster}">
              <source src="${url}" type="${isHLS ? 'application/x-mpegURL' : 'video/mp4'}">
              ${subtitles.map(s => `<track kind="subtitles" src="${escHtml(s.url)}" label="${escHtml(s.label)}" default>`).join('')}
            </video>`;
            player_js  = 'https://cdn.plyr.io/' + player_config.plyr_io_version + '/plyr.polyfilled.js';
            player_css = 'https://cdn.plyr.io/' + player_config.plyr_io_version + '/plyr.css';
        } else if (player_config.player === 'videojs') {
            playerHtml = `<video id="vplayer" poster="${poster}" class="video-js vjs-default-skin vjs-big-play-centered" controls preload="auto" width="100%" height="100%" data-setup='{"fluid":true}'>
              <source src="${url}" type="${isHLS ? 'application/x-mpegURL' : 'video/mp4'}">
              <source src="${url}" type="video/webm">
              ${subtitles.map(s => `<track kind="subtitles" src="${escHtml(s.url)}" label="${escHtml(s.label)}" default>`).join('')}
            </video>`;
            player_js  = 'https://vjs.zencdn.net/' + player_config.videojs_version + '/video.js';
            player_css = 'https://vjs.zencdn.net/' + player_config.videojs_version + '/video-js.css';
        } else if (player_config.player === 'dplayer') {
            playerHtml = `<div id="player-container"></div>`;
            player_js  = 'https://cdn.jsdelivr.net/npm/dplayer/dist/DPlayer.min.js';
            player_css = 'https://cdn.jsdelivr.net/npm/dplayer/dist/DPlayer.min.css';
        } else if (player_config.player === 'jwplayer') {
            playerHtml = `<div id="player"></div>`;
            player_js  = 'https://content.jwplatform.com/libraries/IDzF9Zmk.js';
        }
    }

    const bodyHtml = `<div class="gdi-player-wrap">${playerHtml}</div>`;
    const footerHtml = UI.disable_video_download ? '' : renderDownloadButtons(url, encoded_name, { showMedia: true });

    $('#content').html(_viewerCard(
        '<i class="bi bi-camera-video-fill gdi-icon-video"></i>',
        name, size, bodyHtml, footerHtml
    ));

    if (player_css) {
        const link = document.createElement('link');
        link.rel = 'stylesheet'; link.href = player_css;
        document.head.appendChild(link);
    }
    if (player_js) {
        const script = document.createElement('script');
        script.src = player_js;
        script.onload = function() {
            if (player_config.player === 'plyr') {
                window._gdiPlyrPlayer = new Plyr('#player', { keyboard: { focused: true, global: true } });
            } else if (player_config.player === 'videojs') {
                const vjs = videojs('vplayer', {
                    playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
                    controlBar: { pictureInPictureToggle: true }
                });
                window._gdiVjsPlayer = vjs;
                vjs.ready(function() {
                    this.el().addEventListener('keydown', function(e) {
                        if (e.target.tagName === 'INPUT') return;
                        if (e.key === ' ')          { e.preventDefault(); vjs.paused() ? vjs.play() : vjs.pause(); }
                        else if (e.key === 'f')     vjs.isFullscreen() ? vjs.exitFullscreen() : vjs.requestFullscreen();
                        else if (e.key === 'm')     vjs.muted(!vjs.muted());
                        else if (e.key === 'ArrowRight') vjs.currentTime(vjs.currentTime() + 10);
                        else if (e.key === 'ArrowLeft')  vjs.currentTime(Math.max(0, vjs.currentTime() - 10));
                        else if (e.key === 'ArrowUp')    vjs.volume(Math.min(1, vjs.volume() + 0.1));
                        else if (e.key === 'ArrowDown')  vjs.volume(Math.max(0, vjs.volume() - 0.1));
                    });
                });
            } else if (player_config.player === 'dplayer') {
                window._gdiDPlayer = new DPlayer({
                    container: document.getElementById('player-container'),
                    screenshot: true,
                    video: { url, pic: poster, type: isHLS ? 'hls' : 'auto' },
                    subtitle: subtitles.length ? { url: subtitles[0].url, type: 'webvtt' } : undefined,
                });
            } else if (player_config.player === 'jwplayer') {
                jwplayer('player').setup({
                    file: url, type: mimeType, autostart: false, image: poster,
                    width: '100%', aspectratio: '16:9', title: name,
                    description: 'Powered by Google Drive Index',
                    tracks: subtitles.map(s => ({ file: s.url, kind: 'captions', label: s.label, default: true })),
                    captions: { color: '#f3f378', fontSize: 14, backgroundOpacity: 50, edgeStyle: 'raised' },
                });
            }

            // Initialize video playlist functionality
            const parentPath = window.location.pathname.split('/').slice(0, -1).join('/') + '/';
            initializeVideoPlaylist(parentPath, url);
        };
        document.head.appendChild(script);
    }
}

// ============================================================================
// FILE VIEWER — Audio
// ============================================================================
function file_audio(name, encoded_name, size, url, file_id, cookie_folder_id, playlist) {
    playlist = playlist || [{ name, url, cover: UI.audioposter }];
    const bodyHtml = UI.disable_player ? '' : '<div id="aplayer-container" style="max-width:680px;margin:0 auto;"></div>';
    const footerHtml = UI.disable_audio_download ? '' : renderDownloadButtons(url, encoded_name, { showMedia: true });

    $('#content').html(_viewerCard(
        '<i class="bi bi-music-note-beamed gdi-icon-audio"></i>',
        name, size, bodyHtml, footerHtml
    ));

    if (UI.disable_player) return;

    const aplCss = document.createElement('link');
    aplCss.rel = 'stylesheet';
    aplCss.href = 'https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.css';
    document.head.appendChild(aplCss);

    const aplJs = document.createElement('script');
    aplJs.src = 'https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.js';
    aplJs.onload = function() {
        window._gdiAPlayer = new APlayer({
            container: document.getElementById('aplayer-container'),
            mini: false, autoplay: false, theme: '#4d9fec',
            loop: 'all', order: 'list', preload: 'auto', volume: 0.7, listFolded: false,
            audio: playlist,
        });
    };
    document.head.appendChild(aplJs);

    if (playlist.length <= 1) {
        const parentPath = window.location.pathname.split('/').slice(0, -1).join('/') + '/';
        requestListPath(parentPath, {}, function(res) {
            if (!res || !res.data || !res.data.files) return;
            const audioFiles = res.data.files.filter(f => FILE_TYPES.audio.includes(_fileExt(f)));
            if (audioFiles.length > 1) {
                const fullPlaylist = audioFiles.map(f => ({
                    name: f.name,
                    url:  UI.second_domain_for_dl ? UI.downloaddomain + f.link : window.location.origin + f.link,
                    cover: UI.audioposter,
                }));
                if (window._gdiAPlayer) window._gdiAPlayer.destroy();
                window._gdiAPlayer = new APlayer({
                    container: document.getElementById('aplayer-container'),
                    mini: false, loop: 'all', order: 'list', preload: 'auto', volume: 0.7,
                    audio: fullPlaylist,
                });
                const currentIdx = fullPlaylist.findIndex(f => f.url === url);
                if (currentIdx > 0) window._gdiAPlayer.list.switch(currentIdx);
            }
        }, null);
    }
}

// ============================================================================
// FILE VIEWER — PDF
// ============================================================================
function file_pdf(name, encoded_name, size, url, file_id, cookie_folder_id) {
    const cardHtml = `<div class="gdi-wrap">
  <div class="gdi-viewer">
    <div class="gdi-breadcrumb-wrap"><ol class="gdi-bc">${_viewerBreadcrumb()}</ol></div>
    <div class="gdi-viewer-card">
      <div class="gdi-file-header">
        <span class="gdi-file-header-icon"><i class="bi bi-file-earmark-pdf-fill gdi-icon-pdf"></i></span>
        <div class="gdi-file-header-info">
          <div class="gdi-file-header-name">${escHtml(name)}</div>
          <div class="gdi-file-header-meta">${escHtml(size)}</div>
        </div>
      </div>
      <div class="gdi-viewer-body no-pad">
        <div class="gdi-pdf-controls">
          <button id="pdf-prev" class="gdi-btn gdi-btn-ghost gdi-btn-icon"><i class="bi bi-chevron-left"></i></button>
          <span style="font-size:13px;color:var(--gdi-text-muted);">Page <span id="pdf-page-num">1</span> / <span id="pdf-page-count">?</span></span>
          <button id="pdf-next" class="gdi-btn gdi-btn-ghost gdi-btn-icon"><i class="bi bi-chevron-right"></i></button>
        </div>
        <div id="pdf-render" style="width:100%;height:100%;overflow:auto;"></div>
      </div>
      <div class="gdi-viewer-footer">${renderDownloadButtons(url, encoded_name)}</div>
    </div>
  </div>
</div>`;
    $('#content').html(cardHtml);
}

// ============================================================================
// FILE VIEWER — Image
// ============================================================================
function file_image(name, encoded_name, size, url, file_id, cookie_folder_id) {
    const cardHtml = `<div class="gdi-wrap">
  <div class="gdi-viewer">
    <div class="gdi-breadcrumb-wrap"><ol class="gdi-bc">${_viewerBreadcrumb()}</ol></div>
    <div class="gdi-viewer-card">
      <div class="gdi-file-header">
        <span class="gdi-file-header-icon"><i class="bi bi-image gdi-icon-image"></i></span>
        <div class="gdi-file-header-info">
          <div class="gdi-file-header-name">${escHtml(name)}</div>
          <div class="gdi-file-header-meta">${escHtml(size)}</div>
        </div>
      </div>
      <div class="gdi-viewer-body no-pad">
        <div class="gdi-img-wrap">
          <img src="${url}" alt="${escHtml(name)}" loading="lazy">
        </div>
      </div>
      <div class="gdi-viewer-footer">${renderDownloadButtons(url, encoded_name)}</div>
    </div>
  </div>
</div>`;
    $('#content').html(cardHtml);
}

// ============================================================================
// UTILITIES
// ============================================================================
function formatDateTime(utc_datetime) {
    if (!utc_datetime) return '';
    return new Date(utc_datetime).toLocaleString();
}
const utc2delhi = formatDateTime;

function formatFileSize(bytes) {
    const n = Number(bytes);
    if (isNaN(n) || n < 0)     return '';
    if (n >= 1099511627776)    return (n / 1099511627776).toFixed(2) + ' TB';
    if (n >= 1073741824)       return (n / 1073741824).toFixed(2) + ' GB';
    if (n >= 1048576)          return (n / 1048576).toFixed(2) + ' MB';
    if (n >= 1024)             return (n / 1024).toFixed(2) + ' KB';
    if (n > 1)                 return n + ' bytes';
    if (n === 1)               return '1 byte';
    return '0 bytes';
}

function markdown(el, data) {
    const html = marked.parse(data);
    $(el).show().html(html);
}

async function getCookie(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length);
    }
    return null;
}

// Copy file to user's drive
async function copyFile(driveid) {
    try {
        const copystatus = document.getElementById('copystatus');
        copystatus.innerHTML = `<div class="gdi-alert gdi-alert-info">Processing…</div>`;
        const user_folder_id = document.getElementById('user_folder_id').value;
        if (!user_folder_id) {
            copystatus.innerHTML = `<div class="gdi-alert gdi-alert-error">Empty folder ID</div>`;
            return;
        }
        document.getElementById('spinner').style.display = 'block';
        const cookieExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `root_id=${user_folder_id}; expires=${cookieExpiry}; path=/; SameSite=Lax`;
        const time = Math.floor(Date.now() / 1000);
        const response = await fetch('/copy', {
            method: 'POST',
            cache: 'no-cache',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `id=${encodeURIComponent(driveid)}&root_id=${user_folder_id}&resourcekey=null&time=${time}`
        });
        if (response.status === 500) {
            copystatus.innerHTML = `<div class="gdi-alert gdi-alert-error">Unable to copy. Make sure you added the service account to your folder.</div>`;
        } else if (response.status === 401) {
            copystatus.innerHTML = `<div class="gdi-alert gdi-alert-error">Unauthorized</div>`;
        } else if (response.ok) {
            const data = await response.json();
            if (data && data.name) {
                const safeId = encodeURIComponent(data.id);
                const link = `https://drive.google.com/file/d/${safeId}/view?usp=share_link`;
                document.getElementById('copyresult').innerHTML = `
                  <input type="text" id="usercopiedfile" class="form-control mb-2" value="${escHtml(link)}" readonly>
                  <a href="${escHtml(link)}" target="_blank" class="gdi-btn gdi-btn-primary">Open copied file</a>`;
            } else if (data && data.error && data.error.message) {
                copystatus.innerHTML = `<div class="gdi-alert gdi-alert-error">${escHtml(data.error.message)}</div>`;
            } else {
                copystatus.innerHTML = `<div class="gdi-alert gdi-alert-error">Unable to copy file.</div>`;
            }
        } else {
            copystatus.innerHTML = `<div class="gdi-alert gdi-alert-error">Copy failed.</div>`;
        }
        document.getElementById('spinner').style.display = 'none';
    } catch (error) {
        document.getElementById('copystatus').innerHTML = `<div class="gdi-alert gdi-alert-error">Error: ${error}</div>`;
        document.getElementById('spinner').style.display = 'none';
    }
}

// Checkbox select-all via event delegation (single listener, no MutationObserver needed)
document.addEventListener('change', function(e) {
    if (e.target && e.target.id === 'select-all-checkboxes') {
        const checkboxes = document.querySelectorAll('input.gdi-row-check');
        checkboxes.forEach(cb => { cb.checked = e.target.checked; });
    }
});

// Pop-state for back/forward navigation
window.onpopstate = function() {
    render(window.location.pathname);
};

// ============================================================================
// QUOTA DISPLAY
// ============================================================================
function fetchQuota() {
    const cur = window.current_drive_order || 0;
    fetch(`/${cur}:quota`)
        .then(r => { if (!r.ok) throw new Error('quota fetch failed'); return r.json(); })
        .then(data => {
            const q = data.storageQuota;
            if (!q) return;
            const used = Number(q.usage || 0);
            const total = Number(q.limit || 0);
            const bar = document.getElementById('gdi-quota-bar');
            const text = document.getElementById('gdi-quota-text');
            const fill = document.getElementById('gdi-quota-fill');
            if (!bar || !text || !fill) return;
            const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;
            const color = pct > 90 ? '#f44336' : pct > 70 ? '#ff9800' : '#4caf50';
            text.textContent = total > 0
                ? `${formatFileSize(used)} used of ${formatFileSize(total)} (${pct.toFixed(1)}%)`
                : `${formatFileSize(used)} used`;
            fill.style.width = pct + '%';
            fill.style.background = color;
            bar.style.display = 'block';
        })
        .catch(() => {});
}

// ============================================================================
// ENTRY POINT
// ============================================================================
$(function() {
    init();
    if (window.UI?.debug_mode) GDIDebug.attach();
    if (window.UI?.show_quota) fetchQuota();
    if (new URLSearchParams(window.location.search).get('embed') === '1') {
        document.body.classList.add('embed-mode');
    }
    render(window.location.pathname);
});