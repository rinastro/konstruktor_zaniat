/* =========================================================
   Конструктор занять · спільна логіка
   - шапка, футер, хвиля на фоні
   - рендер форм за конфігом і збирання промпту
   - автозбереження (спільні поля «основи» — для всіх сторінок)
   ========================================================= */
(function () {
  "use strict";

  /* ---------- навігація ---------- */
  const PAGES = [
    { id: "index", href: "index.html", label: "Головна" },
    { id: "presentation", href: "presentation.html", label: "Презентації" },
    { id: "scenario", href: "scenario.html", label: "Сценарії" },
    { id: "notes", href: "notes.html", label: "Конспекти" },
    { id: "cards", href: "cards.html", label: "Картки-питання" },
    { id: "universal", href: "universal.html", label: "Усе й одразу" },
    { id: "library", href: "library.html", label: "Бібліотека" }
  ];

  const AUTHOR = "Дарина Проволовська";
  const BRAND_STYLE =
    "мінімалістичний «матове скло» на темно-синьому фоні; палітра: #081F44 (фон), #143660, #1F3F74, #4569AD (акцент), #B9C8E6 (світлий акцент/текст); шрифти Manrope (заголовки) та Inter (текст), курсивні акценти Playfair Display; багато повітря, без перевантаження";

  const icon = {
    arrow: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M6 11l6 6 6-6M4 21h16"/></svg>',
    ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
    reset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"/></svg>'
  };

  /* ---------- безпечне сховище ---------- */
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  };

  /* ---------- оболонка сторінки ---------- */
  function waveRow(cls, color, amp, len) {
    // хвиля, що повторюється двічі по ширині, щоб анімація була безшовною
    let d = "M0 " + (200 - amp);
    for (let x = 0; x < 2880; x += len) {
      d += " q" + len / 4 + " " + -amp + " " + len / 2 + " 0 t" + len / 2 + " 0";
    }
    d += " V400 H0 Z";
    return '<svg class="' + cls + '" viewBox="0 0 2880 400" preserveAspectRatio="none" aria-hidden="true"><path fill="' + color + '" d="' + d + '"/></svg>';
  }

  function mountShell() {
    const page = document.body.dataset.page || "index";

    const ocean = document.createElement("div");
    ocean.className = "ocean";
    ocean.setAttribute("aria-hidden", "true");
    ocean.innerHTML =
      '<img class="curl" src="wave.webp" alt="" decoding="async">' +
      waveRow("w1", "#4569AD", 46, 480) +
      waveRow("w2", "#1F3F74", 34, 360) +
      waveRow("w3", "#081F44", 26, 640);
    document.body.prepend(ocean);

    const top = document.getElementById("top");
    if (top) {
      top.className = "topbar";
      top.innerHTML =
        '<div class="wrap"><div class="bar glass">' +
        '<a class="brand" href="index.html"><span class="mark"></span>Конструктор занять</a>' +
        '<nav class="nav" aria-label="Розділи">' +
        PAGES.map(p => '<a href="' + p.href + '"' + (p.id === page ? ' aria-current="page"' : "") + ">" + p.label + "</a>").join("") +
        "</nav></div></div>";
      const cur = top.querySelector('[aria-current="page"]');
      const nav = top.querySelector(".nav");
      if (cur && nav) nav.scrollLeft = cur.offsetLeft - nav.clientWidth / 2 + cur.clientWidth / 2;
    }

    const foot = document.getElementById("foot");
    if (foot) {
      foot.className = "footer";
      foot.innerHTML =
        '<div class="wrap"><div class="row"><span>© ' + AUTHOR + ", " + new Date().getFullYear() +
        '</span><span>Конструктор занять з фізики та астрономії</span></div></div>';
    }
  }

  /* ---------- спільні поля ---------- */
  const BASE_FIELDS = [
    { type: "seg", name: "subject", label: "Предмет", options: ["Фізика", "Астрономія", "Фізика + астрономія"], value: "Фізика", full: true },
    { type: "text", name: "topic", label: "Тема заняття", placeholder: "Напр.: Закони Кеплера", full: true },
    { type: "select", name: "grade", label: "Клас / група", options: ["7 клас", "8 клас", "9 клас", "10 клас", "11 клас", "Підготовка до НМТ", "Олімпіадна група", "Студенти / дорослі"], value: "9 клас" },
    { type: "select", name: "duration", label: "Тривалість", options: ["30 хв", "45 хв", "60 хв", "80 хв", "90 хв"], value: "45 хв" },
    { type: "seg", name: "level", label: "Рівень", options: ["Базовий", "Профільний", "Поглиблений / олімпіадний"], value: "Базовий", full: true },
    { type: "seg", name: "group", label: "Формат", options: ["Групове", "Індивідуальне"], value: "Групове" },
    { type: "seg", name: "mode", label: "Де", options: ["Онлайн", "Офлайн"], value: "Онлайн" },
    { type: "select", name: "program", label: "Орієнтир програми", options: ["Чинна шкільна програма (НУШ)", "Підготовка до НМТ", "Олімпіадна програма", "Без обмежень"], value: "Чинна шкільна програма (НУШ)", full: true },
    { type: "textarea", name: "material", label: "Матеріал (основа змісту)", placeholder: "Встав текст теорії, уривок підручника, свої нотатки…", rows: 7, full: true, hint: "Асистент спиратиметься саме на цей текст і не вигадуватиме зайвого." },
    { type: "textarea", name: "plan", label: "План заняття", placeholder: "1. Актуалізація: …\n2. Нове: …\n3. Задачі: …\n4. Підсумок", rows: 5, full: true },
    { type: "formulas", name: "formulas", label: "Ключові формули", placeholder: "T^2/a^3 = const\nF = G\\frac{m_1 m_2}{r^2}\nv_1 = \\sqrt{GM/R}", rows: 4, full: true, hint: "Можна LaTeX або звичайним записом — по одній на рядок." }
  ];

  const TEST_FIELDS = (prefix, on) => ([
    { type: "switch", name: prefix + "test", label: "Додати тест", value: on, controls: prefix + "testbox" },
    {
      type: "group", id: prefix + "testbox", fields: [
        { type: "number", name: prefix + "tcount", label: "Кількість питань", value: 8, min: 1, max: 60 },
        { type: "seg", name: prefix + "tlevel", label: "Складність", options: ["Однакова", "Зростає", "Три рівні"], value: "Зростає" },
        { type: "chips", name: prefix + "ttypes", label: "Типи завдань", options: ["Одна правильна", "Кілька правильних", "На відповідність", "Послідовність", "Розрахункова задача", "Так / ні", "Відкрита відповідь"], value: ["Одна правильна", "Розрахункова задача"], full: true },
        { type: "select", name: prefix + "tplace", label: "Де розмістити", options: ["Окремим блоком у кінці", "Короткі перевірки після кожного розділу", "І там, і там"], value: "Окремим блоком у кінці" },
        { type: "select", name: prefix + "tformat", label: "Формат тесту", options: ["Звичайний текст", "Інтерактивний HTML з перевіркою", "Формат для Google Forms", "Формат для Kahoot / Quizizz (таблиця)"], value: "Звичайний текст" },
        { type: "switch", name: prefix + "tkey", label: "Ключ відповідей", value: true },
        { type: "switch", name: prefix + "texplain", label: "Пояснення до кожної відповіді", value: true }
      ]
    }
  ]);

  const EXTRA = { type: "textarea", name: "extra", label: "Додаткові побажання", placeholder: "Напр.: більше прикладів з повсякденного життя, згадати місію JWST, без складних похідних…", rows: 3, full: true };

  /* ---------- конфіги сторінок ---------- */
  const CONFIGS = {
    presentation: {
      sections: [
        {
          title: "Параметри презентації", fields: [
            { type: "number", name: "slides", label: "Кількість слайдів", value: 14, min: 3, max: 60 },
            { type: "select", name: "pformat", label: "Що має видати асистент", options: ["Готова HTML-презентація (один файл)", "Структура слайдів для Canva / PowerPoint", "Markdown для Marp / Slidev", "Файл .pptx (якщо асистент вміє)"], value: "Готова HTML-презентація (один файл)" },
            { type: "seg", name: "pstyle", label: "Подача", options: ["Мінімалістична", "Науково-популярна", "Академічна"], value: "Мінімалістична", full: true },
            { type: "chips", name: "pinclude", label: "Включити", options: ["Титульний слайд", "Мета й очікувані результати", "Мотиваційне питання / проблема", "Історична довідка", "Формули з поясненням величин", "Ідеї схем та ілюстрацій", "Задача з розв'язанням", "Посилання на симуляції (PhET, Stellarium)", "Рефлексія", "Домашнє завдання"], value: ["Титульний слайд", "Мотиваційне питання / проблема", "Формули з поясненням величин", "Ідеї схем та ілюстрацій", "Задача з розв'язанням", "Домашнє завдання"], full: true },
            { type: "switch", name: "pnotes", label: "Нотатки доповідача до кожного слайда", value: true },
            { type: "switch", name: "pbrand", label: "Мій фірмовий стиль (палітра цього сайту)", value: true },
            { type: "number", name: "pmaxwords", label: "Макс. слів на слайді", value: 40, min: 10, max: 120 }
          ]
        },
        { title: "Перевірка знань", fields: TEST_FIELDS("", false) },
        { title: "Побажання", fields: [EXTRA] }
      ],
      build: buildPresentation
    },
    scenario: {
      sections: [
        {
          title: "Параметри сценарію", fields: [
            { type: "select", name: "ltype", label: "Тип заняття", options: ["Вивчення нового матеріалу", "Розв'язування задач", "Закріплення та узагальнення", "Лабораторна / практична робота", "Контроль знань", "Комбіноване", "Підготовка до олімпіади"], value: "Вивчення нового матеріалу" },
            { type: "number", name: "spages", label: "Обсяг сценарію, сторінок A4", value: 3, min: 1, max: 15 },
            { type: "chips", name: "smethods", label: "Методи та прийоми", options: ["Евристична бесіда", "Демонстраційний дослід", "Віртуальні симуляції", "Робота в парах / групах", "Мозковий штурм", "Перевернутий клас", "Кейс з реального життя", "Астрономічне спостереження", "Гейміфікація"], value: ["Евристична бесіда", "Віртуальні симуляції", "Кейс з реального життя"], full: true },
            { type: "switch", name: "stiming", label: "Таймінг кожного етапу у хвилинах", value: true },
            { type: "switch", name: "sdialog", label: "Репліки викладача й очікувані відповіді учнів", value: true },
            { type: "switch", name: "sdiff", label: "Диференціація: завдання для сильніших і для тих, кому складно", value: true },
            { type: "switch", name: "sonline", label: "Підказки для онлайн-формату (дошка, демонстрація екрана)", value: false },
            { type: "switch", name: "shw", label: "Домашнє завдання з критеріями", value: true },
            { type: "select", name: "sform", label: "Форма подачі", options: ["Таблиця: етап | час | дії викладача | дії учнів | матеріали", "Покроковий текст з підзаголовками", "Коротка шпаргалка на 1 сторінку + детальна версія"], value: "Таблиця: етап | час | дії викладача | дії учнів | матеріали", full: true }
          ]
        },
        { title: "Перевірка знань", fields: TEST_FIELDS("", true) },
        { title: "Побажання", fields: [EXTRA] }
      ],
      build: buildScenario
    },
    notes: {
      sections: [
        {
          title: "Параметри конспекту", fields: [
            { type: "number", name: "npages", label: "Обсяг, сторінок A4", value: 2, min: 1, max: 12 },
            { type: "select", name: "nformat", label: "Формат", options: ["Інтерактивний HTML (KaTeX, розгортання, перевір себе)", "Для друку A4 (HTML/PDF-готовий)", "Markdown з LaTeX", "Робочий зошит з пропусками"], value: "Інтерактивний HTML (KaTeX, розгортання, перевір себе)" },
            { type: "seg", name: "ntone", label: "Мова подачі", options: ["Простими словами", "Збалансовано", "Академічно"], value: "Збалансовано", full: true },
            { type: "chips", name: "ninclude", label: "Включити", options: ["Ключові визначення", "Таблиця величин і одиниць СІ", "Виведення формул", "Розв'язані приклади", "Схеми / рисунки (SVG)", "Типові помилки", "Цікавий факт", "Питання для самоперевірки", "Міні-словник термінів", "Mind-map теми"], value: ["Ключові визначення", "Таблиця величин і одиниць СІ", "Розв'язані приклади", "Схеми / рисунки (SVG)", "Типові помилки", "Питання для самоперевірки"], full: true },
            { type: "number", name: "nexamples", label: "Розв'язаних прикладів", value: 2, min: 0, max: 10 },
            { type: "switch", name: "nbrand", label: "Мій фірмовий стиль (палітра цього сайту)", value: true }
          ]
        },
        { title: "Перевірка знань", fields: TEST_FIELDS("", true) },
        { title: "Побажання", fields: [EXTRA] }
      ],
      build: buildNotes
    },
    cards: {
      sections: [
        {
          title: "Параметри карток", fields: [
            { type: "number", name: "ccount", label: "Кількість карток", value: 20, min: 3, max: 100 },
            { type: "seg", name: "clevel", label: "Складність", options: ["Легкі", "Змішані", "Складні"], value: "Змішані" },
            { type: "chips", name: "ctypes", label: "Типи питань", options: ["Чому так?", "Парадокси та хибні уявлення", "Оцінки за порядком величини", "Явища в повсякденні", "Історія відкриттів", "Що буде, якщо…?", "Астрономічні спостереження", "Міні-задачі", "Формула → зміст"], value: ["Чому так?", "Парадокси та хибні уявлення", "Явища в повсякденні", "Що буде, якщо…?"], full: true },
            { type: "seg", name: "canswer", label: "Відповідь", options: ["Коротка (1–2 речення)", "Розгорнута з поясненням"], value: "Коротка (1–2 речення)", full: true },
            { type: "select", name: "cformat", label: "Формат видачі", options: ["Інтерактивні HTML-фліп-картки", "Таблиця: питання | відповідь", "CSV для Anki (front;back)", "JSON"], value: "Інтерактивні HTML-фліп-картки", full: true },
            { type: "switch", name: "chint", label: "Підказка до кожної картки", value: true },
            { type: "switch", name: "cmcq", label: "Варіанти відповідей (картка-тест)", value: false },
            { type: "switch", name: "cbrand", label: "Мій фірмовий стиль (для HTML)", value: true }
          ]
        },
        { title: "Побажання", fields: [EXTRA] }
      ],
      build: buildCards
    },
    universal: {
      sections: [
        {
          title: "Що створити", fields: [
            { type: "chips", name: "uwhat", label: "Матеріали", options: ["Презентація", "Сценарій заняття", "Конспект для учня", "Картки-питання"], value: ["Презентація", "Сценарій заняття", "Конспект для учня", "Картки-питання"], full: true },
            { type: "number", name: "slides", label: "Слайдів у презентації", value: 12, min: 3, max: 60 },
            { type: "number", name: "spages", label: "Сторінок сценарію", value: 3, min: 1, max: 15 },
            { type: "number", name: "npages", label: "Сторінок конспекту", value: 2, min: 1, max: 12 },
            { type: "number", name: "ccount", label: "Карток-питань", value: 15, min: 3, max: 100 },
            { type: "select", name: "uformat", label: "Формат усіх матеріалів", options: ["HTML-файли (кожен окремо)", "Markdown з LaTeX", "Як зручно для кожного типу"], value: "HTML-файли (кожен окремо)" },
            { type: "select", name: "uflow", label: "Як видавати", options: ["Поетапно: спершу план, далі по одному матеріалу", "Усе однією відповіддю, розділами"], value: "Поетапно: спершу план, далі по одному матеріалу" },
            { type: "switch", name: "ubrand", label: "Мій фірмовий стиль (палітра цього сайту)", value: true }
          ]
        },
        { title: "Перевірка знань", fields: TEST_FIELDS("", true) },
        { title: "Побажання", fields: [EXTRA] }
      ],
      build: buildUniversal
    }
  };

  /* ---------- рендер полів ---------- */
  let uid = 0;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function renderField(f) {
    const id = "f_" + f.name + "_" + (++uid);
    const cls = "field" + (f.full ? " full" : "");
    const hint = f.hint ? "<small>" + esc(f.hint) + "</small>" : "";
    switch (f.type) {
      case "text":
        return '<div class="' + cls + '"><label for="' + id + '">' + f.label + '</label><input type="text" id="' + id + '" name="' + f.name + '" placeholder="' + esc(f.placeholder || "") + '">' + hint + "</div>";
      case "number":
        return '<div class="' + cls + '"><label for="' + id + '">' + f.label + '</label><input type="number" id="' + id + '" name="' + f.name + '" value="' + f.value + '" min="' + (f.min || 0) + '" max="' + (f.max || 999) + '" inputmode="numeric">' + hint + "</div>";
      case "select":
        return '<div class="' + cls + '"><label for="' + id + '">' + f.label + '</label><select id="' + id + '" name="' + f.name + '">' +
          f.options.map(o => "<option" + (o === f.value ? " selected" : "") + ">" + esc(o) + "</option>").join("") + "</select>" + hint + "</div>";
      case "textarea":
      case "formulas": {
        let tools = "";
        if (f.type === "formulas") {
          const snips = ["\\frac{a}{b}", "x^{2}", "\\sqrt{x}", "\\vec{F}", "\\Delta", "\\cdot", "\\omega", "\\lambda", "\\rho", "\\varphi", "M_\\odot", "\\approx"];
          tools = '<div class="formula-tools">' + snips.map(s => '<button type="button" data-snip="' + esc(s) + '">' + esc(s) + "</button>").join("") + "</div>";
        }
        return '<div class="' + cls + '"><label for="' + id + '">' + f.label + '</label><textarea id="' + id + '" name="' + f.name + '" rows="' + (f.rows || 4) + '"' + (f.type === "formulas" ? ' class="mono"' : "") + ' placeholder="' + esc(f.placeholder || "") + '"></textarea>' + tools + hint + "</div>";
      }
      case "seg":
      case "chips": {
        const multi = f.type === "chips";
        const vals = multi ? (f.value || []) : [f.value];
        return '<div class="' + cls + '"><span class="label" id="' + id + '">' + f.label + '</span><div class="' + f.type + '" role="group" aria-labelledby="' + id + '">' +
          f.options.map((o, i) => {
            const oid = id + "_" + i;
            return '<input type="' + (multi ? "checkbox" : "radio") + '" id="' + oid + '" name="' + f.name + '" value="' + esc(o) + '"' + (vals.includes(o) ? " checked" : "") + '><label for="' + oid + '">' + esc(o) + "</label>";
          }).join("") + "</div>" + hint + "</div>";
      }
      case "switch":
        return '<div class="field full"><label class="switch"><input type="checkbox" name="' + f.name + '"' + (f.value ? " checked" : "") + (f.controls ? ' data-controls="' + f.controls + '"' : "") + '><span class="track"></span><span>' + f.label + "</span></label></div>";
      case "group":
        return '<div class="subblock full" id="' + f.id + '"><div class="grid">' + f.fields.map(renderField).join("") + "</div></div>";
    }
    return "";
  }

  function renderSection(sec, n) {
    return '<section class="panel glass"><div class="panel-title"><span class="step">' + n + "</span><h2>" + sec.title + "</h2>" +
      (sec.hint ? '<span class="hint">' + sec.hint + "</span>" : "") + '</div><div class="grid">' + sec.fields.map(renderField).join("") + "</div></section>";
  }

  /* ---------- читання/запис форми ---------- */
  function readForm(form) {
    const v = {};
    form.querySelectorAll("input, select, textarea").forEach(el => {
      if (!el.name) return;
      if (el.type === "checkbox" && el.closest(".chips")) {
        v[el.name] = v[el.name] || [];
        if (el.checked) v[el.name].push(el.value);
      } else if (el.type === "checkbox") {
        v[el.name] = el.checked;
      } else if (el.type === "radio") {
        if (el.checked) v[el.name] = el.value;
      } else {
        v[el.name] = el.value.trim();
      }
    });
    return v;
  }

  function writeForm(form, v) {
    if (!v) return;
    form.querySelectorAll("input, select, textarea").forEach(el => {
      if (!el.name || !(el.name in v)) return;
      const val = v[el.name];
      if (el.type === "checkbox" && el.closest(".chips")) el.checked = Array.isArray(val) && val.includes(el.value);
      else if (el.type === "checkbox") el.checked = !!val;
      else if (el.type === "radio") el.checked = el.value === val;
      else el.value = val;
    });
  }

  const BASE_NAMES = BASE_FIELDS.map(f => f.name);

  /* ---------- допоміжне для промптів ---------- */
  const list = arr => (arr && arr.length ? arr.join(", ") : "на твій розсуд");
  const block = (title, text) => (text ? "\n### " + title + '\n"""\n' + text + '\n"""\n' : "");

  function subjectRole(v) {
    const s = v.subject === "Астрономія" ? "астрономії" : v.subject === "Фізика + астрономія" ? "фізики та астрономії" : "фізики";
    return s;
  }

  function header(v, task) {
    const s = subjectRole(v);
    let out = "# Роль\nТи — досвідчений методист і викладач " + s + ", який пояснює складне просто, точно й цікаво. Пишеш українською, дотримуєшся сучасної української термінології та одиниць СІ.\n\n";
    out += "# Завдання\n" + task + "\n\n";
    out += "# Вихідні дані\n";
    out += "- Предмет: " + v.subject + "\n";
    out += "- Тема: " + (v.topic || "[тему не вказано — запитай мене перед початком]") + "\n";
    out += "- Аудиторія: " + v.grade + ", рівень — " + (v.level || "").toLowerCase() + "\n";
    out += "- Формат заняття: " + (v.group || "").toLowerCase() + ", " + (v.mode || "").toLowerCase() + ", тривалість " + v.duration + "\n";
    out += "- Орієнтир: " + v.program + "\n";
    out += block("Матеріал — головне джерело змісту", v.material);
    if (!v.material) out += "\n(Матеріал не надано — спирайся на стандартний шкільний курс за цією темою.)\n";
    out += block("План заняття — дотримуйся його структури", v.plan);
    out += block("Ключові формули — обов'язково використай і поясни", v.formulas);
    return out;
  }

  function testPart(v, p) {
    p = p || "";
    if (!v[p + "test"]) return "";
    let t = "\n# Тест\n";
    t += "- Кількість питань: " + (v[p + "tcount"] || 8) + "\n";
    t += "- Типи завдань: " + list(v[p + "ttypes"]) + "\n";
    t += "- Складність: " + (v[p + "tlevel"] === "Три рівні" ? "три рівні (початковий / середній / достатній-високий), позначені" : v[p + "tlevel"] === "Зростає" ? "від простого до складного" : "однакова") + "\n";
    t += "- Розміщення: " + v[p + "tplace"] + "\n";
    t += "- Формат: " + v[p + "tformat"] + "\n";
    if (v[p + "tkey"]) t += "- Додай ключ відповідей окремо, після тесту.\n";
    if (v[p + "texplain"]) t += "- До кожної відповіді — коротке пояснення, чому вона правильна, а дистрактори — ні.\n";
    t += "- Дистрактори мають бути правдоподібними (типові помилки учнів), розрахункові задачі — з реалістичними числами та одиницями.\n";
    return t;
  }

  function quality(v, extraLines) {
    let q = "\n# Перевір перед відповіддю\n";
    q += "- Фізична та астрономічна коректність, правильні одиниці СІ й порядки величин.\n";
    q += "- Позначення величин однакові в усіх частинах і збігаються з ключовими формулами.\n";
    q += "- Формули — у LaTeX: $...$ у рядку, $$...$$ окремим рядком.\n";
    q += "- Нічого не вигадуй: якщо даних бракує — познач [уточнити] і продовжуй.\n";
    q += "- Зміст відповідає віку й рівню аудиторії та вкладається в тривалість заняття.\n";
    (extraLines || []).forEach(l => (q += "- " + l + "\n"));
    if (v.extra) q += "\n# Додаткові побажання\n" + v.extra + "\n";
    return q;
  }

  /* ---------- збирачі промптів ---------- */
  function buildPresentation(v) {
    let out = header(v, "Створи презентацію до заняття на " + (v.slides || 14) + " слайдів.");
    out += "\n# Вимоги до презентації\n";
    out += "- Кількість слайдів: рівно " + (v.slides || 14) + " (з урахуванням титульного та підсумкового).\n";
    out += "- Подача: " + (v.pstyle || "").toLowerCase() + "; не більше " + (v.pmaxwords || 40) + " слів тексту на слайді — решта в нотатки.\n";
    out += "- Один слайд — одна думка. Ключову формулу виділяй окремо й під нею пояснюй кожну величину з одиницями.\n";
    out += "- Обов'язково включи: " + list(v.pinclude) + ".\n";
    if (v.pnotes) out += "- До кожного слайда — нотатки доповідача: що сказати, яке питання поставити класу, на що звернути увагу.\n";
    if (v.pbrand) out += "- Візуальний стиль: " + BRAND_STYLE + ".\n";
    out += testPart(v);
    out += "\n# Формат відповіді\n";
    const f = v.pformat || "";
    if (f.startsWith("Готова HTML")) out += "Один самодостатній HTML-файл: перемикання слайдів стрілками/свайпом, нумерація, адаптивність, формули через KaTeX (CDN), схеми — вбудованим SVG. Без зовнішніх зображень, яких може не бути.\n";
    else if (f.startsWith("Структура")) out += "Таблиця: № | заголовок | текст на слайді | візуал (що намалювати/знайти) | нотатки доповідача. Після таблиці — короткий список зображень для пошуку.\n";
    else if (f.startsWith("Markdown")) out += "Markdown для Marp: слайди розділені `---`, нотатки в `<!-- -->`, формули в LaTeX.\n";
    else out += "Файл .pptx. Якщо створити файл неможливо — видай структуру слайдів таблицею.\n";
    out += quality(v);
    return out;
  }

  function buildScenario(v) {
    let out = header(v, "Склади детальний сценарій заняття (" + (v.ltype || "").toLowerCase() + ") обсягом приблизно " + (v.spages || 3) + " стор. A4.");
    out += "\n# Вимоги до сценарію\n";
    out += "- Почни з: мета (навчальна, розвивальна, виховна), очікувані результати, обладнання та ресурси.\n";
    out += "- Етапи заняття мають відповідати плану і разом вкладатися в " + v.duration + ".\n";
    if (v.stiming) out += "- Для кожного етапу вкажи час у хвилинах; сума — рівно тривалість заняття.\n";
    out += "- Методи та прийоми: " + list(v.smethods) + ".\n";
    if (v.sdialog) out += "- Пропиши ключові репліки та запитання викладача і очікувані відповіді учнів (зокрема типові хибні).\n";
    if (v.sdiff) out += "- Диференціація: додаткові завдання для сильніших учнів і підтримка для тих, кому складно.\n";
    if (v.sonline || v.mode === "Онлайн") out += "- Підкажи, як провести етапи онлайн: інтерактивна дошка, демонстрація екрана, симуляції за посиланням, швидкі опитування.\n";
    if (v.shw) out += "- Домашнє завдання з критеріями оцінювання (базове + за бажанням).\n";
    out += "- Розв'язування задач — з повним розв'язанням: «Дано / Знайти / Розв'язання / Відповідь».\n";
    out += testPart(v);
    out += "\n# Формат відповіді\n" + (v.sform || "") + ".\n";
    out += quality(v, ["Таймінг реалістичний: на нове поняття — не менше 5–7 хв."]);
    return out;
  }

  function buildNotes(v) {
    let out = header(v, "Створи конспект для учня обсягом " + (v.npages || 2) + " стор. A4 — такий, за яким можна повторити тему самостійно.");
    out += "\n# Вимоги до конспекту\n";
    out += "- Мова подачі: " + (v.ntone || "").toLowerCase() + ", звертання до учня на «ти».\n";
    out += "- Структура за планом заняття, короткі абзаци, логічні підзаголовки.\n";
    out += "- Включи: " + list(v.ninclude) + ".\n";
    out += "- Розв'язаних прикладів: " + (v.nexamples ?? 2) + ", у форматі «Дано / Знайти / Розв'язання / Відповідь».\n";
    out += "- Для кожної ключової формули: що означає кожна величина, одиниці СІ, коли формулу можна застосовувати.\n";
    if (v.nbrand) out += "- Візуальний стиль: " + BRAND_STYLE + ".\n";
    out += testPart(v);
    out += "\n# Формат відповіді\n";
    const f = v.nformat || "";
    if (f.startsWith("Інтерактивний")) out += "Один самодостатній HTML-файл: KaTeX через CDN, розділи з розгортанням, блок «Перевір себе» з прихованими відповідями, схеми вбудованим SVG, коректний друк (@media print).\n";
    else if (f.startsWith("Для друку")) out += "HTML, оптимізований для друку на A4: поля, без зайвих кольорових заливок, нумерація сторінок, формули KaTeX.\n";
    else if (f.startsWith("Markdown")) out += "Markdown з LaTeX-формулами та таблицями.\n";
    else out += "Робочий зошит: ключові слова й частини формул замінені пропусками ______, наприкінці — ключ для самоперевірки.\n";
    out += quality(v);
    return out;
  }

  function buildCards(v) {
    let out = header(v, "Створи " + (v.ccount || 20) + " цікавих карток «питання — відповідь» за темою, щоб розбудити інтерес і перевірити розуміння.");
    out += "\n# Вимоги до карток\n";
    out += "- Кількість: " + (v.ccount || 20) + "; складність: " + (v.clevel || "").toLowerCase() + ".\n";
    out += "- Типи питань: " + list(v.ctypes) + ". Чергуй типи, без повторів за змістом.\n";
    out += "- Відповідь: " + (v.canswer || "").toLowerCase() + "; точна з погляду фізики, без «води».\n";
    out += "- Питання формулюй так, щоб хотілося подумати: несподіваний ракурс, побутова ситуація, «а що, якби…».\n";
    if (v.chint) out += "- До кожної картки — підказка, що не розкриває відповідь.\n";
    if (v.cmcq) out += "- До кожної картки — 4 варіанти відповіді, один правильний.\n";
    out += "\n# Формат відповіді\n";
    const f = v.cformat || "";
    if (f.startsWith("Інтерактивні")) out += "Один самодостатній HTML-файл з картками, що перевертаються по кліку/дотику, перемішуванням, лічильником «знаю / повторити», KaTeX для формул" + (v.cbrand ? "; стиль: " + BRAND_STYLE : "") + ".\n";
    else if (f.startsWith("Таблиця")) out += "Markdown-таблиця: № | тип | питання | " + (v.chint ? "підказка | " : "") + "відповідь.\n";
    else if (f.startsWith("CSV")) out += "CSV для імпорту в Anki, роздільник «;», поля: front;back" + (v.chint ? ";hint" : "") + ". Формули — у форматі MathJax Anki: \\( ... \\). Лише сам CSV у блоці коду.\n";
    else out += "JSON-масив об'єктів { \"type\", \"question\", " + (v.chint ? "\"hint\", " : "") + (v.cmcq ? "\"options\", " : "") + "\"answer\" }.\n";
    out += quality(v);
    return out;
  }

  function buildUniversal(v) {
    const what = v.uwhat && v.uwhat.length ? v.uwhat : ["Презентація"];
    let out = header(v, "Підготуй повний комплект матеріалів до одного заняття: " + what.join(", ").toLowerCase() + ". Усі матеріали мають бути узгоджені між собою: однакові позначення, приклади й логіка.");
    out += "\n# Склад комплекту\n";
    let n = 0;
    if (what.includes("Презентація")) out += ++n + ". Презентація — " + (v.slides || 12) + " слайдів, мінімум тексту, нотатки доповідача, формули з поясненням величин, задача з розв'язанням.\n";
    if (what.includes("Сценарій заняття")) out += ++n + ". Сценарій заняття — ~" + (v.spages || 3) + " стор.: мета, етапи з таймінгом на " + v.duration + ", репліки викладача й очікувані відповіді, диференціація, домашнє завдання.\n";
    if (what.includes("Конспект для учня")) out += ++n + ". Конспект для учня — ~" + (v.npages || 2) + " стор.: визначення, таблиця величин і одиниць, розв'язані приклади, типові помилки, питання для самоперевірки.\n";
    if (what.includes("Картки-питання")) out += ++n + ". Картки-питання — " + (v.ccount || 15) + " шт.: «чому?», парадокси, побутові явища, «що буде, якщо…», з короткими відповідями.\n";
    out += "\n# Формат\n- " + v.uformat + (v.uformat && v.uformat.startsWith("HTML") ? " — самодостатні, KaTeX через CDN, схеми вбудованим SVG." : "") + "\n";
    if (v.ubrand) out += "- Візуальний стиль: " + BRAND_STYLE + ".\n";
    if (v.uflow && v.uflow.startsWith("Поетапно")) out += "- Спершу покажи короткий план комплекту (5–10 рядків) і дочекайся мого «далі». Потім видавай по одному матеріалу за відповідь, у порядку списку.\n";
    else out += "- Видай усе однією відповіддю, кожен матеріал під окремим заголовком першого рівня.\n";
    out += testPart(v);
    if (v.test) out += "- Тест оформи окремим матеріалом комплекту.\n";
    out += quality(v, ["Матеріали не дублюють один одного дослівно: презентація — для показу, сценарій — для викладача, конспект — для учня."]);
    return out;
  }

  /* ---------- конструктор ---------- */
  function toast(msg) {
    let t = document.querySelector(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("show"), 2200);
  }

  function mountBuilder() {
    const page = document.body.dataset.page;
    const cfg = CONFIGS[page];
    const root = document.getElementById("builder");
    if (!cfg || !root) return;

    const sections = [{ title: "Основа заняття", hint: "спільна для всіх сторінок", fields: BASE_FIELDS }].concat(cfg.sections);
    root.innerHTML =
      '<form id="form" class="inputs" autocomplete="off" onsubmit="return false">' + sections.map((s, i) => renderSection(s, String(i + 1).padStart(2, "0"))).join("") + "</form>" +
      '<aside class="output"><div class="panel glass">' +
      '<div class="panel-title"><span class="step">→</span><h2>Готовий промпт</h2><span class="hint">оновлюється наживо</span></div>' +
      '<pre id="prompt" tabindex="0" aria-live="polite"></pre>' +
      '<div class="stats"><span id="st-chars"></span><span id="st-words"></span></div>' +
      '<div class="actions">' +
      '<button class="btn primary" type="button" id="b-copy">' + icon.copy + "Копіювати</button>" +
      '<a class="btn" id="b-claude" target="_blank" rel="noopener">' + icon.ext + "Claude</a>" +
      '<a class="btn" id="b-gpt" target="_blank" rel="noopener">' + icon.ext + "ChatGPT</a>" +
      '<button class="btn" type="button" id="b-save">' + icon.down + ".txt</button>" +
      '<button class="btn ghost" type="button" id="b-reset">' + icon.reset + "Очистити</button>" +
      "</div>" +
      '<div class="tip"><b>Порада.</b> Скопіюй промпт і встав у новий чат асистента. Поля «Основи» зберігаються — перейди на іншу сторінку, і тема з матеріалом уже будуть там.</div>' +
      "</div></aside>" +
      '<a class="jump" href="#prompt" id="b-jump">Промпт ↓</a>';

    const form = document.getElementById("form");
    const pre = document.getElementById("prompt");
    const KEY_BASE = "kz-base", KEY_PAGE = "kz-" + page;

    writeForm(form, store.get(KEY_BASE));
    writeForm(form, store.get(KEY_PAGE));

    function syncGroups() {
      form.querySelectorAll("[data-controls]").forEach(sw => {
        const box = document.getElementById(sw.dataset.controls);
        if (box) box.hidden = !sw.checked;
      });
    }

    function update() {
      syncGroups();
      const v = readForm(form);
      const base = {}, own = {};
      Object.keys(v).forEach(k => (BASE_NAMES.includes(k) ? (base[k] = v[k]) : (own[k] = v[k])));
      store.set(KEY_BASE, base);
      store.set(KEY_PAGE, own);
      const text = cfg.build(v).replace(/\n{3,}/g, "\n\n").trim();
      pre.textContent = text;
      document.getElementById("st-chars").textContent = text.length.toLocaleString("uk-UA") + " символів";
      document.getElementById("st-words").textContent = "≈ " + text.split(/\s+/).length.toLocaleString("uk-UA") + " слів";
      const q = encodeURIComponent(text);
      const long = q.length > 7500;
      const claude = document.getElementById("b-claude"), gpt = document.getElementById("b-gpt");
      claude.href = long ? "https://claude.ai/new" : "https://claude.ai/new?q=" + q;
      gpt.href = long ? "https://chatgpt.com/" : "https://chatgpt.com/?q=" + q;
      claude.dataset.long = gpt.dataset.long = long ? "1" : "";
    }

    form.addEventListener("input", update);
    form.addEventListener("change", update);

    form.addEventListener("click", e => {
      const b = e.target.closest("[data-snip]");
      if (!b) return;
      const ta = b.closest(".field").querySelector("textarea");
      const s = b.dataset.snip;
      const a = ta.selectionStart ?? ta.value.length, z = ta.selectionEnd ?? ta.value.length;
      ta.value = ta.value.slice(0, a) + s + ta.value.slice(z);
      ta.focus();
      ta.selectionStart = ta.selectionEnd = a + s.length;
      update();
    });

    async function copy() {
      const text = pre.textContent;
      try { await navigator.clipboard.writeText(text); }
      catch (e) {
        const ta = document.createElement("textarea");
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); } catch (_) {}
        ta.remove();
      }
    }

    document.getElementById("b-copy").addEventListener("click", async () => { await copy(); toast("Промпт скопійовано"); });
    ["b-claude", "b-gpt"].forEach(id => document.getElementById(id).addEventListener("click", async e => {
      if (e.currentTarget.dataset.long) { await copy(); toast("Промпт довгий — скопійовано, встав його в чат"); }
    }));
    document.getElementById("b-save").addEventListener("click", () => {
      const v = readForm(form);
      const name = (page + "-" + (v.topic || "zaniattia")).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
      const blob = new Blob([pre.textContent], { type: "text/plain;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = name + ".txt";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
    document.getElementById("b-reset").addEventListener("click", () => {
      if (!confirm("Очистити поля цієї сторінки? Спільна основа (тема, матеріал, план, формули) теж очиститься.")) return;
      store.del(KEY_BASE); store.del(KEY_PAGE);
      location.reload();
    });

    const jump = document.getElementById("b-jump");
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(es => es.forEach(e => (jump.style.visibility = e.isIntersecting ? "hidden" : "visible"))).observe(document.querySelector(".output"));
    }

    update();
  }

  /* ---------- старт ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    mountShell();
    mountBuilder();
  });

  window.KZ = { icon, store };
})();
