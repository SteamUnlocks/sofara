// matches.js - جلب المباريات من API Football
(function(){
  const API_KEY = "b20a424ae97a9a108fd99f5da5590f91";
  const BASE_URL = "https://v3.football.api-sports.io";

  const matchesList = document.getElementById("matchesList");
  const resultsList = document.getElementById("resultsList");

  function ymd(date = new Date()){
    const y = date.getFullYear();
    const m = String(date.getMonth()+1).padStart(2,'0');
    const d = String(date.getDate()).padStart(2,'0');
    return `${y}-${m}-${d}`;
  }

  async function fetchFixtures(dateStr) {
    try {
      const res = await fetch(`${BASE_URL}/fixtures?date=${dateStr}`, {
        headers: { "x-apisports-key": API_KEY }
      });
      const data = await res.json();
      return data.response || [];
    } catch (err) {
      console.error("fetchFixtures error", err);
      return [];
    }
  }

  function renderMatches(items, container, emptyMsg) {
    container.innerHTML = "";
    if (!items || items.length === 0) {
      container.innerHTML = `<tr><td colspan="5">${emptyMsg}</td></tr>`;
      return;
    }
    items.forEach(ev => {
      const league = ev.league?.name || "";
      const home = ev.teams?.home?.name || "Home";
      const away = ev.teams?.away?.name || "Away";
      const homeLogo = ev.teams?.home?.logo || "";
      const awayLogo = ev.teams?.away?.logo || "";
      const date = ev.fixture?.date ? new Date(ev.fixture.date) : null;
      const time = date ? date.toLocaleTimeString("ar-EG", {hour:"2-digit", minute:"2-digit"}) : "";
      const score = ev.goals?.home != null ? `${ev.goals.home} - ${ev.goals.away}` : "—";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${time}</td>
        <td class="team"><img src="${homeLogo}" alt=""> ${home}</td>
        <td class="team"><img src="${awayLogo}" alt=""> ${away}</td>
        <td>${league}</td>
        <td>${score}</td>
      `;
      container.appendChild(tr);
    });
  }

  async function load() {
    const today = ymd(new Date());
    matchesList.innerHTML = "<tr><td colspan='5'>جارٍ تحميل مباريات اليوم...</td></tr>";
    const todays = await fetchFixtures(today);
    renderMatches(todays, matchesList, "لا توجد مباريات اليوم.");

    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const ystr = ymd(yesterday);
    resultsList.innerHTML = "<tr><td colspan='5'>جارٍ تحميل آخر النتائج...</td></tr>";
    const yMatches = await fetchFixtures(ystr);
    renderMatches(yMatches, resultsList, "لا توجد نتائج أمس.");
  }

  load();
  setInterval(load, 5 * 60 * 1000);
})();
