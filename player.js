// player.js
(async function(){
  const channelsUrl = window.CHANNELS_JSON || 'sports_channels.json';
  const videoEl = document.getElementById('videoElement');
  const channelsDiv = document.getElementById('channels');
  const qualitySelect = document.getElementById('qualitySelect');
  const currentChannelTitle = document.getElementById('currentChannel');
  const filterInput = document.getElementById('filterInput');

  let channels = {};
  let currentStreams = null;
  let activePlayer = null;
  let lastUrl = null;

  // تحميل ملف القنوات
  try {
    const r = await fetch(channelsUrl);
    channels = await r.json();
  } catch(e) {
    alert('تعذّر تحميل ملف القنوات');
    return;
  }

  // بناء واجهة القنوات
  function buildChannels(filter='') {
    channelsDiv.innerHTML = '';
    Object.keys(channels).forEach(name => {
      if (filter && !name.toLowerCase().includes(filter.toLowerCase())) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'channel-btn';
      wrapper.innerHTML = `
        <div class="channel-logo">${name.split(' ')[0]}</div>
        <div class="channel-meta"><div class="channel-name">${name}</div></div>
      `;
      wrapper.onclick = () => selectChannel(name);
      channelsDiv.appendChild(wrapper);
    });
  }
  buildChannels();

  filterInput.addEventListener('input', (e)=>{
    buildChannels(e.target.value);
  });

  // اختيار قناة
  function selectChannel(name) {
    currentStreams = channels[name];
    currentChannelTitle.textContent = name;
    qualitySelect.innerHTML = '';

    const order = ['4K','FHD','HD','SD','Stream'];
    order.forEach(q=>{
      if (currentStreams[q]) {
        const o = document.createElement('option');
        o.value = currentStreams[q];
        o.textContent = q;
        qualitySelect.appendChild(o);
      }
    });

    if (qualitySelect.options.length>0) {
      qualitySelect.selectedIndex = 0;
      playStream(qualitySelect.value);
    } else {
      alert('لا توجد جودات لهذه القناة');
    }
  }

  qualitySelect.addEventListener('change', ()=> playStream(qualitySelect.value));

  // تنظيف أي مشغل سابق
  function cleanup() {
    if (activePlayer) {
      try {
        activePlayer.detachMediaElement && activePlayer.detachMediaElement(videoEl);
        activePlayer.unload && activePlayer.unload();
        activePlayer.destroy && activePlayer.destroy();
      } catch(e) {}
      activePlayer = null;
    }
    try {
      videoEl.pause();
      videoEl.removeAttribute('src');
      videoEl.load();
    } catch(e){}
  }

  // تشغيل عبر mpegts.js فقط
  function playStream(url) {
    lastUrl = url;
    cleanup();

    if (window.mpegts && mpegts.getFeatureList && mpegts.getFeatureList().mseLivePlayback) {
      const p = mpegts.createPlayer({
        type: 'mpegts',
        url: url,
        isLive: true,
        enableWorker: true
      });
      activePlayer = p;
      p.attachMediaElement(videoEl);
      p.load();
      p.play && p.play();
    } else {
      alert('المتصفح لا يدعم mpegts.js');
    }
  }

  // auto-select first channel
  const firstKey = Object.keys(channels)[0];
  if (firstKey) selectChannel(firstKey);

})();
