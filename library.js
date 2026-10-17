/* =========================================================
   Бібліотека: книжки на поличках, заповнення зверху вниз
   ========================================================= */
(function () {
  "use strict";

  const TYPE = {
    "Презентація": { sym: "П", cls: "sail" },
    "Сценарій": { sym: "С", cls: "" },
    "Конспект": { sym: "К", cls: "light" },
    "Картки": { sym: "?", cls: "deep" },
    "Комплект": { sym: "∑", cls: "light" }
  };
  const MIN_SHELVES = 4;
  const GAP = 10;

  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  // стабільний «випадковий» розмір книжки за назвою
  const hash = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); };

  function bookSize(m) {
    const h = hash(m.title + (m.url || ""));
    return { w: 46 + (h % 4) * 6, h: 172 + (h % 5) * 8, tilt: h % 9 === 0 };
  }

  let filter = "Усі";
  let query = "";

  function items() {
    const all = Array.isArray(window.MATERIALS) ? window.MATERIALS : [];
    return all.filter(m =>
      (filter === "Усі" || m.subject === filter) &&
      (!query || (m.title + " " + (m.type || "") + " " + (m.grade || "")).toLowerCase().includes(query))
    );
  }

  function render() {
    const box = document.getElementById("bookcase");
    if (!box) return;
    const list = items();
    const total = (window.MATERIALS || []).length;

    // ширина полиці → скільки книжок уміщується; книжки розкладаються зверху вниз
    const shelfW = Math.max(240, box.clientWidth - 60);
    const shelves = [];
    let row = [], used = 0;
    list.forEach(m => {
      const s = bookSize(m);
      const need = s.w + GAP + (s.tilt ? 20 : 0);
      if (used + need > shelfW && row.length) { shelves.push(row); row = []; used = 0; }
      row.push({ m, s }); used += need;
    });
    if (row.length) shelves.push(row);
    while (shelves.length < MIN_SHELVES) shelves.push([]);

    let html = "";
    if (!list.length) {
      html += '<div class="empty">' + (total
        ? "<h3>Нічого не знайдено</h3><p>Спробуй інший фільтр або запит.</p>"
        : '<h3>Полиці поки <span class="accent">порожні</span></h3><p>Щойно з’являться готові матеріали, вони стануть сюди книжками — від верхньої полиці донизу.</p>') + "</div>";
    }
    shelves.forEach((r, i) => {
      html += '<div class="shelf"><span class="label">Полиця ' + (i + 1) + "</span>" +
        r.map(({ m, s }, k) => {
          const t = TYPE[m.type] || { sym: "•", cls: "" };
          const title = esc(m.title) + (m.grade ? " · " + esc(m.grade) : "");
          return '<a class="book ' + t.cls + (s.tilt ? " tilt" : "") + '" href="' + esc(m.url || "#") + '" style="--w:' + s.w + "px;--h:" + s.h + "px;animation-delay:" + (k * 40 + i * 120) + 'ms" title="' + esc((m.type || "") + ": " + m.title + (m.grade ? " (" + m.grade + ")" : "")) + '" target="_blank" rel="noopener">' +
            '<span class="spine">' + title + '</span><span class="sym">' + t.sym + "</span></a>";
        }).join("") +
        "</div>";
    });
    box.innerHTML = html;
  }

  function mountFilter() {
    const f = document.getElementById("lib-filter");
    if (!f) return;
    f.innerHTML = ["Усі", "Фізика", "Астрономія"].map((o, i) =>
      '<input type="radio" name="libf" id="libf' + i + '" value="' + o + '"' + (i === 0 ? " checked" : "") + '><label for="libf' + i + '">' + o + "</label>"
    ).join("");
    f.addEventListener("change", e => { filter = e.target.value; render(); });
    const s = document.getElementById("lib-search");
    if (s) s.addEventListener("input", () => { query = s.value.trim().toLowerCase(); render(); });
  }

  document.addEventListener("DOMContentLoaded", () => {
    mountFilter();
    render();
    let t;
    window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(render, 150); });
  });
})();
