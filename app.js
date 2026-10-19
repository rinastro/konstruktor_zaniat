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
    { id: "course", href: "course.html", label: "Курс" },
    { id: "scenario", href: "scenario.html", label: "Сценарії" },
    { id: "presentation", href: "presentation.html", label: "Презентації" },
    { id: "notes", href: "notes.html", label: "Конспекти" },
    { id: "cards", href: "cards.html", label: "Картки" },
    { id: "universal", href: "universal.html", label: "Усе й одразу" },
    { id: "reflection", href: "reflection.html", label: "Рефлексія" },
    { id: "library", href: "library.html", label: "Бібліотека" }
  ];

  const AUTHOR = "Дарина Проволовська";
  const BRAND_STYLE =
    "строго мій фірмовий стиль, не змінюй його: темно-синій фон-градієнт #081F44 → #143660 → #1F3F74, акцент #4569AD, світлий акцент #B9C8E6, текст #EEF3FC; панелі «матове скло» (напівпрозорі, blur, тонка світла рамка, радіус 24px); шрифти Manrope (заголовки), Inter (текст), курсивні акценти Playfair Display; жодних інших кольорів, шрифтів і CSS-фреймворків";

  /* Замкнений шаблон HTML-документа лежить в окремому файлі shablon-konspektu.html.
     Щоб змінити дизайн конспектів — редагуй тільки той файл. */
  let DOC_TEMPLATE = "";
  function loadTemplate() {
    fetch("shablon-konspektu.html", { cache: "no-cache" })
      .then(r => (r.ok ? r.text() : ""))
      .then(t => { DOC_TEMPLATE = t.trim(); document.dispatchEvent(new Event("kz:template")); })
      .catch(() => {});
  }

  function styleLock() {
    return "\n# ФІРМОВИЙ СТИЛЬ — СТРОГО, НЕ ЗМІНЮВАТИ\n" +
      "Оформи результат як ОДИН HTML-файл строго за шаблоном нижче.\n" +
      "- Скопіюй ДОСЛІВНО, символ у символ: увесь <head> разом із <style>, блок <div class=\"tools\"> (кнопки «Розмір шрифту», «Друк», «Вгору») і фінальний <script>. ЗАБОРОНЕНО змінювати, додавати чи видаляти будь-які CSS-правила, кольори, шрифти, розміри, відступи, кнопки та скрипт.\n" +
      "- ЗАБОРОНЕНО: атрибут style=\"\", власні класи, інші шрифти, CSS-фреймворки (Tailwind, Bootstrap), інші бібліотеки, крім KaTeX із шаблону, зовнішні зображення.\n" +
      "- Змінюй лише текст у квадратних дужках у <header class=\"hero\"> і вміст <main>: секції-зразки заміни реальним змістом. <nav class=\"toc\"> залиш порожнім — зміст збудується сам.\n" +
      "- Використовуй ТІЛЬКИ ці компоненти (як у зразку):\n" +
      "  • розділ: <section class=\"card\"><h2><span class=\"num\">01</span>Назва</h2>…</section> (номери 01, 02, 03…)\n" +
      "  • підзаголовок: <h3>; текст: <p>, <ul>, <ol>, <strong>, <em>\n" +
      "  • формула: <div class=\"formula\">$$…$$</div>, одразу під нею <p class=\"where\">де … — … (одиниця СІ)</p>; формули в тексті — $…$\n" +
      "  • вставки: <div class=\"callout remember\"><b>Запам'ятай</b>…</div> (зелена), <div class=\"callout info\"><b>Довідка</b>…</div> (синя, також для прикладів розв'язання), <div class=\"callout fact\"><b>Цікавий факт</b>…</div> (рожева), <div class=\"callout warn\"><b>Типова помилка</b>…</div>\n" +
      "  • таблиця: звичайна <table> з першим рядком <th>\n" +
      "  • словничок: <dl class=\"terms\"><dt>Термін</dt><dd>Пояснення простими словами</dd></dl>\n" +
      "  • питання тесту: <div class=\"q\"><p><strong>1.</strong> Питання?</p><ul class=\"options\"><li>А) …</li><li>Б) …</li></ul></div>\n" +
      "  • відповіді та «Перевір себе»: <details><summary>Питання або «Відповіді та пояснення»</summary><div>…</div></details>\n" +
      "  • пропуск для заповнення: <span class=\"gap\"></span>\n" +
      "  • схема: вбудований <svg> без фону і без атрибута style; кольори лише #081F44 і #13284A (текст, контури), #4569AD (лінії), #E679A6 і #587954 (акценти), #B9C8E6 (заливки); підписи font-family=\"Inter\", не менше 14px\n" +
      "- Якщо для елемента немає компонента — використай звичайний тег без стилів. Дизайн не обговорюй і не «покращуй».\n" +
      "- Віддай лише код HTML в одному блоці, без пояснень до і після.\n\n" +
      (DOC_TEMPLATE
        ? "```html\n" + DOC_TEMPLATE + "\n```\n"
        : "[Шаблон ще не завантажився — онови сторінку конструктора і скопіюй промпт ще раз.]\n");
  }

  const icon = {
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
    let d = "M0 " + (200 - amp);
    for (let x = 0; x < 2880; x += len) d += " q" + len / 4 + " " + -amp + " " + len / 2 + " 0 t" + len / 2 + " 0";
    d += " V400 H0 Z";
    return '<svg class="' + cls + '" viewBox="0 0 2880 400" preserveAspectRatio="none" aria-hidden="true"><path fill="' + color + '" d="' + d + '"/></svg>';
  }

  function mountShell() {
    const page = document.body.dataset.page || "index";
    const ocean = document.createElement("div");
    ocean.className = "ocean";
    ocean.setAttribute("aria-hidden", "true");
    ocean.innerHTML = '<img class="curl" src="wave.webp" alt="" decoding="async">' +
      waveRow("w1", "#4569AD", 46, 480) + waveRow("w2", "#1F3F74", 34, 360) + waveRow("w3", "#081F44", 26, 640);
    document.body.prepend(ocean);

    const top = document.getElementById("top");
    if (top) {
      top.className = "topbar";
      top.innerHTML = '<div class="wrap"><div class="bar glass">' +
        '<a class="brand" href="index.html"><span class="mark"></span>Конструктор занять</a>' +
        '<nav class="nav" aria-label="Розділи">' +
        PAGES.map(p => '<a href="' + p.href + '"' + (p.id === page ? ' aria-current="page"' : "") + ">" + p.label + "</a>").join("") +
        "</nav></div></div>";
      const cur = top.querySelector('[aria-current="page"]');
      const nav = top.querySelector(".nav");
      if (cur && nav) nav.scrollLeft = cur.offsetLeft - nav.clientWidth / 2 + cur.clientWidth / 2;
    }

    // номер розділу в підписі сторінки — за порядком у меню
    const eb = document.querySelector(".page-head .eyebrow");
    const idx = PAGES.findIndex(p => p.id === page);
    if (eb && idx > 0) eb.textContent = eb.textContent.replace(/\(\s*\d+\s*·/, "( " + String(idx).padStart(2, "0") + " ·");

    // кнопка «Вгору»
    const up = document.createElement("button");
    up.type = "button";
    up.className = "totop";
    up.setAttribute("aria-label", "Повернутися вгору");
    up.title = "Вгору";
    up.textContent = "↑";
    up.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    document.body.appendChild(up);
    window.addEventListener("scroll", () => up.classList.toggle("show", window.scrollY > 500), { passive: true });

    const foot = document.getElementById("foot");
    if (foot) {
      foot.className = "footer";
      foot.innerHTML = '<div class="wrap"><div class="row"><span>© ' + AUTHOR + ", " + new Date().getFullYear() +
        "</span><span>Конструктор занять з фізики та астрономії</span></div></div>";
    }
  }

  /* ---------- спільні поля (основа заняття) ---------- */
  const GRADES = ["7 клас", "8 клас", "9 клас", "10 клас", "11 клас", "13–16 років (змішана група)", "Підготовка до НМТ", "Олімпіадна група", "Студенти / дорослі"];
  const BASE_SECTIONS = [
    {
      title: "Основа заняття", hint: "спільна для всіх сторінок", fields: [
        { type: "seg", name: "subject", label: "Предмет", options: ["Фізика", "Астрономія", "Фізика + астрономія"], value: "Фізика", full: true },
        { type: "text", name: "topic", label: "Тема заняття", placeholder: "Напр.: Сонячна система", full: true },
        { type: "select", name: "grade", label: "Клас / вік", options: GRADES, value: "9 клас" },
        { type: "select", name: "duration", label: "Тривалість", options: ["45 хв", "60 хв", "90 хв"], value: "45 хв" },
        { type: "seg", name: "level", label: "Рівень глибини", options: ["Базовий", "Високий шкільний, з формулами", "Поглиблений / олімпіадний"], value: "Високий шкільний, з формулами", full: true },
        { type: "seg", name: "group", label: "Формат", options: ["Групове", "Індивідуальне"], value: "Групове" },
        { type: "seg", name: "mode", label: "Де", options: ["Онлайн", "Офлайн"], value: "Офлайн" },
        { type: "select", name: "program", label: "Орієнтир програми", options: ["Чинна шкільна програма (НУШ)", "Підготовка до НМТ", "Олімпіадна програма", "Неформальна освіта, без обмежень"], value: "Неформальна освіта, без обмежень", full: true }
      ]
    },
    {
      title: "Місце в курсі", hint: "щоб заняття було зв'язане з іншими", fields: [
        { type: "text", name: "course", label: "Назва курсу", placeholder: "Напр.: Космічні структури" },
        { type: "text", name: "lessonNo", label: "Номер заняття", placeholder: "Напр.: 3" },
        { type: "text", name: "prevTopic", label: "Минула тема", placeholder: "Напр.: Світло та його швидкість", full: true },
        { type: "textarea", name: "nextTopic", label: "Наступна тема (і її ауткам)", placeholder: "Напр.: Відстані до зір (учні вміють пояснити паралакс…)", rows: 2, full: true }
      ]
    },
    {
      title: "Зміст заняття", fields: [
        { type: "textarea", name: "plan", label: "Хід заняття / план", placeholder: "Звідки взялося «наше місце»: геоцентрична і геліоцентрична моделі… Масштаб… Астрономічна одиниця…", rows: 5, full: true },
        { type: "textarea", name: "practice", label: "Практика", placeholder: "Групове завдання «Сонячна система на нитці» (1 а. о. = 10 см)…", rows: 3, full: true },
        { type: "textarea", name: "aim", label: "Мета та ауткам заняття", placeholder: "Учні розуміють, що астрономічна одиниця — природна «лінійка» Сонячної системи…", rows: 3, full: true },
        { type: "formulas", name: "formulas", label: "Ключові формули", placeholder: "r_п = a(1 - e)\nr_а = a(1 + e)\nT^2 = a^3", rows: 3, full: true, hint: "Можна LaTeX або звичайним записом — по одній на рядок." },
        { type: "textarea", name: "material", label: "Матеріал / готовий сценарій (необов'язково)", placeholder: "Встав текст теорії, уривок підручника або вже готовий сценарій…", rows: 5, full: true, hint: "Асистент спиратиметься саме на цей текст і не вигадуватиме зайвого." }
      ]
    }
  ];

  const TEST_FIELDS = (on) => ([
    { type: "switch", name: "test", label: "Додати тест", value: on, controls: "testbox" },
    {
      type: "group", id: "testbox", fields: [
        { type: "number", name: "tcount", label: "Кількість питань", value: 8, min: 1, max: 60 },
        { type: "seg", name: "tlevel", label: "Складність", options: ["Однакова", "Зростає", "Три рівні"], value: "Зростає" },
        { type: "chips", name: "ttypes", label: "Типи завдань", options: ["Одна правильна", "Кілька правильних", "На відповідність", "Послідовність", "Розрахункова задача", "Так / ні", "Відкрита відповідь"], value: ["Одна правильна", "Розрахункова задача"], full: true },
        { type: "select", name: "tplace", label: "Де розмістити", options: ["Окремим блоком у кінці", "Короткі перевірки після кожного розділу", "І там, і там"], value: "Окремим блоком у кінці" },
        { type: "select", name: "tformat", label: "Формат тесту", options: ["Звичайний текст", "Інтерактивний HTML з перевіркою", "Формат для Google Forms", "Формат для Kahoot / Quizizz (таблиця)"], value: "Звичайний текст" },
        { type: "switch", name: "tkey", label: "Ключ відповідей", value: true },
        { type: "switch", name: "texplain", label: "Пояснення до кожної відповіді", value: true }
      ]
    }
  ]);

  const EXTRA = { type: "textarea", name: "extra", label: "Додаткові побажання", placeholder: "Напр.: більше прикладів з повсякденного життя, згадати місію JWST, український слід в астрономії…", rows: 3, full: true };
  /* ---------- рефлексія: спільні прийоми та поля ---------- */
  const REFL_STEPS = [
    "Зв'язок із метою — повернутися до мети, поставленої на початку («Чи досягли ми того, що планували?»)",
    "Емоційний стан — швидка перевірка атмосфери: як почуваються учні",
    "Когнітивний підсумок — що учень забирає з собою: конкретне знання чи навичка, сформульовані його словами",
    "Дія / інтрига на майбутнє — як це застосувати і який наступний крок (питання-місток до наступного заняття)"
  ];
  const REFL_TECH = {
    "Плюс — мінус — цікаво": "«Плюс» — що вдалося й сподобалося; «Мінус» — що було складно чи лишилося незрозумілим; «Цікаво» — який факт чи задача здивували найбільше",
    "Незакінчені речення": "«Сьогодні я зрозумів(ла), що…», «Найбільше мене зацікавило…», «Мені ще варто попрацювати над…»",
    "Сходи успіху": "учень ставить себе на сходинку: від «нічого не зрозумів(ла)» до «можу пояснити іншому»",
    "Шкала настрою (смайлики / колір)": "вибір смайлика, кольору чи «зорі настрою», що відповідає стану наприкінці заняття (аналог «чарівного дерева» / «букета настрою»)",
    "3-2-1": "3 нові речі, 2 цікаві факти, 1 питання, що лишилося",
    "Квиток на вихід": "одне коротке питання по суті теми — швидка перевірка розуміння на виході",
    "Поясни молодшому": "одним-двома реченнями пояснити головну ідею заняття п'ятикласнику / бабусі",
    "Питання-місток": "одне інтригуюче питання, відповідь на яке буде на наступному занятті"
  };
  const REFL_TECH_NAMES = Object.keys(REFL_TECH);
  const REFL_LESSON = { name: "rtype", in: ["Після заняття (3–5 хв)"] };
  const REFL_COURSE = { name: "rtype", in: ["На весь курс (підсумкове опитування)"] };

  // блок рефлексії, який вбудовується в інші конструктори
  const REFL_FIELDS = (on, extra) => ([
    { type: "switch", name: "refl", label: "Додати рефлексію наприкінці заняття", value: on, controls: "reflbox" },
    {
      type: "group", id: "reflbox", fields: (extra || []).concat([
        { type: "select", name: "rtime", label: "Тривалість рефлексії", options: ["3 хв", "5 хв", "7 хв"], value: "5 хв" },
        { type: "switch", name: "rformula", label: "За формулою: мета → емоції → що забираю → дія / інтрига", value: true },
        { type: "chips", name: "rtech", label: "Прийоми", options: REFL_TECH_NAMES, value: ["Плюс — мінус — цікаво", "Незакінчені речення"], full: true }
      ])
    }
  ]);

  function reflCore(v) {
    let t = "Рефлексія — не формальність на хвилину, а усвідомлене підбиття підсумків: вона пов'язує тему з досвідом учня, перевіряє його емоційний стан і розуміння матеріалу. Три рівні: емоції, «що нового?», «як це застосувати?». Тривалість — " + (v.rtime || "5 хв") + ".\n";
    if (v.rformula !== false) t += "Побудуй її за формулою:\n" + REFL_STEPS.map((s, i) => (i + 1) + ". " + s).join("\n") + "\n";
    const tech = v.rtech && v.rtech.length ? v.rtech : ["Плюс — мінус — цікаво", "Незакінчені речення"];
    t += "Прийоми:\n" + tech.map(n => "- «" + n + "» — " + (REFL_TECH[n] || "")).join("\n") + "\n";
    t += "Формулювання конкретні, з термінами й явищами саме цього заняття" + (v.topic ? " («" + v.topic + "»)" : "") + " і під вік (" + (v.grade || "учні") + "); жодних загальних «чи сподобався урок?».\n";
    return t;
  }

  function reflPart(v, where) {
    if (!v.refl) return "";
    return "\n# Рефлексія\n" + reflCore(v) + (where ? where + "\n" : "");
  }

  const NOTE_TYPES = ["Короткий конспект для учня (Markdown)", "Повний конспект для учня", "Теоретичний конспект для викладача (оповідь)", "Робочий зошит з пропусками"];
  const isTeacherNotes = { name: "ntype", in: [NOTE_TYPES[2]] };
  const isStudentNotes = { name: "ntype", in: [NOTE_TYPES[0], NOTE_TYPES[1], NOTE_TYPES[3]] };

  /* ---------- конфіги сторінок ---------- */
  const CONFIGS = {
    course: {
      base: false,
      sections: [
        {
          title: "Курс", fields: [
            { type: "select", name: "cmode", label: "Що створити", options: ["Силабус курсу", "Детальна структура кожного заняття", "Силабус + детальна структура занять"], value: "Силабус курсу", full: true },
            { type: "seg", name: "subject", label: "Предмет", options: ["Фізика", "Астрономія", "Фізика + астрономія"], value: "Фізика + астрономія", full: true },
            { type: "text", name: "ctopic", label: "Тематика курсу", placeholder: "Напр.: Сонячна система", full: true },
            { type: "text", name: "cname", label: "Назва курсу", placeholder: "Порожньо — ШІ запропонує сам" },
            { type: "text", name: "cnamehint", label: "Ідея для назви", placeholder: "Напр.: пов'язана зі структурами та інформацією" },
            { type: "textarea", name: "coutcomes", label: "Ключові аутками курсу", placeholder: "Учні навчились пояснювати механіку Сонячної системи, розуміти принцип утворення люків Кірквуда, розрізняти транснептунові об'єкти…", rows: 4, full: true },
            { type: "select", name: "grade", label: "Цільова аудиторія", options: GRADES, value: "13–16 років (змішана група)" },
            { type: "seg", name: "level", label: "Рівень", options: ["Базовий", "Високий шкільний, з формулами", "Поглиблений / олімпіадний"], value: "Високий шкільний, з формулами", full: true }
          ]
        },
        {
          title: "Обсяг і формат", fields: [
            { type: "number", name: "clessons", label: "Навчальних занять", value: 5, min: 1, max: 30 },
            { type: "select", name: "cfinalfmt", label: "Підсумкове заняття", options: ["Рольова гра", "Командна гра / квест", "Дебати / симуляція засідання", "Проєкт / дослідження", "Залік у формі гри", "Без підсумкового заняття"], value: "Рольова гра" },
            { type: "chips", name: "cdur", label: "Тривалість заняття", options: ["45 хв", "60 хв", "90 хв"], value: ["45 хв", "60 хв"], full: true },
            { type: "select", name: "cratio", label: "Теорія / практика", options: ["30% теорії / 70% практики", "20% теорії / 80% практики", "40% теорії / 60% практики", "50% / 50%", "На розсуд, окремо для кожного заняття"], value: "30% теорії / 70% практики", full: true },
            { type: "chips", name: "capproach", label: "Підхід", options: ["Дослідницький підхід", "Експерименти", "Робота з даними", "Симуляції", "Логічне мислення", "Критичне мислення", "Без сухого завчання формул", "Сторітелінг", "Гейміфікація"], value: ["Дослідницький підхід", "Експерименти", "Логічне мислення", "Без сухого завчання формул"], full: true },
            { type: "switch", name: "ctie", label: "Кожне заняття строго пов'язане з минулим і наступним", value: true }
          ]
        },
        {
          title: "Каркас (якщо вже є)", fields: [
            { type: "textarea", name: "cframe", label: "Каркас занять", placeholder: "Заняття 1. Ньютон — нерелятивістська гравітація, маса та інертність…\nЗаняття 2. Ейнштейн — викривлення простору-часу…", rows: 6, full: true },
            { type: "textarea", name: "cfinalscript", label: "Сценарій фіналу / ролі", placeholder: "Група ділиться на 4 фракції: вчені ЦЕРНу, інспектори МАГАТЕ, маркетологи, комітет з етики…", rows: 4, full: true },
            { type: "chips", name: "cdetail", label: "Для детальної структури додати", options: ["Вступний гачок", "Ключові питання", "Вартісні пойнти", "Матеріали та симуляції", "Питання для рефлексії"], value: ["Вступний гачок", "Вартісні пойнти", "Матеріали та симуляції"], full: true, showIf: { name: "cmode", in: ["Детальна структура кожного заняття", "Силабус + детальна структура занять"] } }
          ]
        },
        { title: "Рефлексія", hint: "після занять і в кінці курсу", fields: REFL_FIELDS(true, [
          { type: "chips", name: "rwhere", label: "Де", options: ["Коротка рефлексія після кожного заняття", "Підсумкова рефлексія курсу на фінальному занятті"], value: ["Коротка рефлексія після кожного заняття", "Підсумкова рефлексія курсу на фінальному занятті"], full: true }
        ]) },
        { title: "Побажання", fields: [EXTRA] }
      ],
      build: buildCourse
    },
    scenario: {
      sections: [
        {
          title: "Параметри сценарію", fields: [
            { type: "select", name: "ltype", label: "Тип заняття", options: ["Вивчення нового матеріалу", "Розв'язування задач", "Закріплення та узагальнення", "Лабораторна / практична робота", "Комбіноване", "Підготовка до олімпіади"], value: "Вивчення нового матеріалу" },
            { type: "number", name: "qcount", label: "Питань у проблематиці", value: 5, min: 2, max: 8 },
            { type: "chips", name: "sgoals", label: "Основні цілі", options: ["Концептуальна", "Математична", "Фізична", "Світоглядна"], value: ["Концептуальна", "Математична", "Фізична", "Світоглядна"], full: true },
            { type: "chips", name: "smethods", label: "Методична основа", options: ["Inquiry-based learning", "Гейміфікація / челендж", "Peer-to-peer, робота в командах", "Демонстраційний дослід", "Віртуальні симуляції", "Робота з даними", "Модель у масштабі", "Гіпотеза «ЯКЩО… ТО… ТОМУ ЩО…»", "Історія відкриттів", "Астрономічне спостереження"], value: ["Inquiry-based learning", "Гейміфікація / челендж", "Peer-to-peer, робота в командах", "Віртуальні симуляції"], full: true },
            { type: "switch", name: "sblitz", label: "⚡ Бліц-питання з відповідями після кожного блоку", value: true },
            { type: "number", name: "sbank", label: "Банк бліц-питань у кінці", value: 80, min: 0, max: 200, showIf: { name: "sblitz", on: true } },
            { type: "switch", name: "sslides", label: "Посилання на слайди презентації (сл. N)", value: true },
            { type: "switch", name: "sdialog", label: "Репліки викладача для ключових блоків", value: true },
            { type: "switch", name: "sequip", label: "Обладнання: для викладача / для учнів", value: true },
            { type: "switch", name: "sdiff", label: "Диференціація для сильніших і тих, кому складно", value: false },
            { type: "switch", name: "shw", label: "Домашнє завдання", value: false },
            { type: "select", name: "sform", label: "Формат видачі", options: ["Таблиці Markdown (для Google Docs / Word)", "Документ HTML у фірмовому стилі", "Звичайний текст з підзаголовками"], value: "Таблиці Markdown (для Google Docs / Word)", full: true }
          ]
        },
        { title: "Перевірка знань", fields: TEST_FIELDS(false) },
        { title: "Рефлексія", hint: "3–5 хв наприкінці", fields: REFL_FIELDS(true) },
        { title: "Побажання", fields: [EXTRA] }
      ],
      build: buildScenario
    },
    presentation: {
      sections: [
        {
          title: "Параметри презентації", fields: [
            { type: "number", name: "slides", label: "Кількість слайдів", value: 20, min: 3, max: 80 },
            { type: "select", name: "pformat", label: "Що має видати асистент", options: ["Послайдовий план (Слайд N: що зображено / теза)", "Готова HTML-презентація (один файл)", "Таблиця для Canva / PowerPoint", "Markdown для Marp / Slidev", "Файл .pptx (якщо асистент вміє)"], value: "Послайдовий план (Слайд N: що зображено / теза)" },
            { type: "seg", name: "pstyle", label: "Подача", options: ["Мінімум тексту, максимум візуалізацій", "Науково-популярна", "Академічна"], value: "Мінімум тексту, максимум візуалізацій", full: true },
            { type: "chips", name: "pinclude", label: "Включити", options: ["Титульний слайд", "Вступний гачок", "Ключові питання заняття", "Історія відкриттів", "Формули з поясненням величин", "Графіки та схеми", "Модель у масштабі / порівняння", "Задача з розв'язанням", "Слайди-ігри та челенджі", "Слайди для бліц-питань", "Посилання на симуляції", "Місток до наступної теми"], value: ["Титульний слайд", "Вступний гачок", "Ключові питання заняття", "Графіки та схеми", "Задача з розв'язанням", "Слайди-ігри та челенджі", "Місток до наступної теми"], full: true },
            { type: "switch", name: "psync", label: "Номери слайдів узгоджені зі сценарієм (сл. N)", value: true },
            { type: "switch", name: "pnotes", label: "Нотатки доповідача до кожного слайда", value: true },
            { type: "switch", name: "pimg", label: "Для кожного слайда — що знайти / згенерувати (зображення, джерело)", value: true },
            { type: "switch", name: "pbrand", label: "Мій фірмовий стиль (палітра цього сайту)", value: true },
            { type: "number", name: "pmaxwords", label: "Макс. слів на слайді", value: 25, min: 5, max: 120 }
          ]
        },
        { title: "Перевірка знань", fields: TEST_FIELDS(false) },
        { title: "Рефлексія", hint: "3–5 хв наприкінці", fields: REFL_FIELDS(true) },
        { title: "Побажання", fields: [EXTRA] }
      ],
      build: buildPresentation
    },
    notes: {
      sections: [
        {
          title: "Параметри конспекту", fields: [
            { type: "select", name: "ntype", label: "Тип конспекту", options: NOTE_TYPES, value: NOTE_TYPES[0], full: true },
            { type: "number", name: "nwords", label: "Обсяг, слів", value: 9000, min: 1000, max: 20000, showIf: isTeacherNotes },
            { type: "number", name: "nhours", label: "Час опрацювання, год", value: 2, min: 1, max: 6, showIf: isTeacherNotes },
            { type: "chips", name: "nblocks", label: "Довідкові вставки", options: ["📌 Запам'ятати", "🧭 Довідка", "💡 Цікавий факт", "🇺🇦 Український слід"], value: ["📌 Запам'ятати", "🧭 Довідка", "💡 Цікавий факт"], full: true, showIf: isTeacherNotes },
            { type: "number", name: "npages", label: "Обсяг, сторінок A4", value: 1, min: 1, max: 12, showIf: isStudentNotes },
            { type: "seg", name: "ntone", label: "Тон", options: ["Дружній", "Збалансований", "Академічний"], value: "Дружній", full: true, showIf: isStudentNotes },
            { type: "chips", name: "ninclude", label: "Включити", options: ["Головна ідея уроку", "Словничок 2–3 термінів простими словами", "Ключовий висновок", "Питання для самоперевірки", "Таблиця величин і одиниць СІ", "Розв'язані приклади", "Схеми / рисунки (SVG)", "Типові помилки", "Цікавий факт"], value: ["Головна ідея уроку", "Словничок 2–3 термінів простими словами", "Ключовий висновок", "Питання для самоперевірки"], full: true, showIf: isStudentNotes },
            { type: "select", name: "nformat", label: "Формат", options: ["HTML-конспект у стилі сайту", "HTML для друку A4", "Markdown (для освітнього простору)", "Суцільний текст із заголовками"], value: "HTML-конспект у стилі сайту", full: true },
            { type: "switch", name: "nbrand", label: "Замкнений фірмовий стиль — ШІ не може змінювати дизайн", value: true, showIf: { name: "nformat", in: ["HTML-конспект у стилі сайту", "HTML для друку A4"] } }
          ]
        },
        { title: "Перевірка знань", fields: TEST_FIELDS(false) },
        { title: "Рефлексія", hint: "самооцінка в кінці конспекту", showIf: isStudentNotes, fields: REFL_FIELDS(false) },
        { title: "Побажання", fields: [EXTRA] }
      ],
      build: buildNotes
    },
    cards: {
      sections: [
        {
          title: "Параметри карток", fields: [
            { type: "number", name: "ccount", label: "Кількість карток", value: 20, min: 3, max: 200 },
            { type: "seg", name: "clevel", label: "Складність", options: ["Легкі", "Змішані", "Складні"], value: "Змішані" },
            { type: "chips", name: "ctypes", label: "Типи питань", options: ["Бліц (коротке питання — коротка відповідь)", "Чому так?", "Парадокси та хибні уявлення", "Оцінки за порядком величини", "Явища в повсякденні", "Історія відкриттів", "Що буде, якщо…?", "Астрономічні спостереження", "Міні-задачі", "Формула → зміст"], value: ["Бліц (коротке питання — коротка відповідь)", "Чому так?", "Парадокси та хибні уявлення", "Що буде, якщо…?"], full: true },
            { type: "seg", name: "canswer", label: "Відповідь", options: ["Коротка (1–2 речення)", "Розгорнута з поясненням"], value: "Коротка (1–2 речення)", full: true },
            { type: "select", name: "cformat", label: "Формат видачі", options: ["Інтерактивні HTML-фліп-картки", "Таблиця: питання | відповідь", "CSV для Anki (front;back)", "JSON"], value: "Інтерактивні HTML-фліп-картки", full: true },
            { type: "switch", name: "cgroup", label: "Згрупувати за блоками заняття", value: false },
            { type: "switch", name: "chint", label: "Підказка до кожної картки", value: false },
            { type: "switch", name: "cmcq", label: "Варіанти відповідей (картка-тест)", value: false },
            { type: "switch", name: "cbrand", label: "Мій фірмовий стиль (для HTML)", value: true }
          ]
        },
        { title: "Рефлексія", hint: "3–5 хв наприкінці", fields: REFL_FIELDS(false) },
        { title: "Побажання", fields: [EXTRA] }
      ],
      build: buildCards
    },
    universal: {
      sections: [
        {
          title: "Що створити", fields: [
            { type: "chips", name: "uwhat", label: "Матеріали", options: ["Сценарій заняття", "Презентація", "Конспект для учня", "Теоретичний конспект для викладача", "Картки-питання"], value: ["Сценарій заняття", "Презентація", "Конспект для учня", "Картки-питання"], full: true },
            { type: "number", name: "slides", label: "Слайдів у презентації", value: 20, min: 3, max: 80 },
            { type: "number", name: "sbank", label: "Бліц-питань у банку сценарію", value: 80, min: 0, max: 200 },
            { type: "number", name: "nwords", label: "Слів у теорії для викладача", value: 9000, min: 1000, max: 20000 },
            { type: "number", name: "ccount", label: "Карток-питань", value: 20, min: 3, max: 200 },
            { type: "select", name: "uformat", label: "Формат усіх матеріалів", options: ["Як зручно для кожного типу", "Markdown з LaTeX", "HTML-файли (кожен окремо)"], value: "Як зручно для кожного типу" },
            { type: "select", name: "uflow", label: "Як видавати", options: ["Поетапно: спершу план, далі по одному матеріалу", "Усе однією відповіддю, розділами"], value: "Поетапно: спершу план, далі по одному матеріалу" },
            { type: "switch", name: "ubrand", label: "Мій фірмовий стиль (для HTML)", value: true }
          ]
        },
        { title: "Перевірка знань", fields: TEST_FIELDS(false) },
        { title: "Рефлексія", hint: "3–5 хв наприкінці", fields: REFL_FIELDS(true) },
        { title: "Побажання", fields: [EXTRA] }
      ],
      build: buildUniversal
    },
    reflection: {
      base: false,
      sections: [
        {
          title: "Що за рефлексія", fields: [
            { type: "seg", name: "rtype", label: "Тип", options: ["Після заняття (3–5 хв)", "На весь курс (підсумкове опитування)"], value: "Після заняття (3–5 хв)", full: true },
            { type: "seg", name: "subject", label: "Предмет", options: ["Фізика", "Астрономія", "Фізика + астрономія"], value: "Фізика + астрономія", full: true },
            { type: "select", name: "grade", label: "Клас / вік", options: GRADES, value: "7 клас" },
            { type: "seg", name: "mode", label: "Де", options: ["Онлайн", "Офлайн"], value: "Офлайн" },
            { type: "text", name: "course", label: "Назва курсу", placeholder: "Напр.: 220 Вольт" },
            { type: "text", name: "lessonNo", label: "Номер заняття", placeholder: "Напр.: 3", showIf: REFL_LESSON },
            { type: "text", name: "topic", label: "Тема заняття", placeholder: "Напр.: Сонячна система — масштабування порожнечі", full: true, showIf: REFL_LESSON },
            { type: "textarea", name: "aim", label: "Мета та ауткам заняття", placeholder: "До неї рефлексія повертається на першому кроці…", rows: 3, full: true, showIf: REFL_LESSON },
            { type: "textarea", name: "rhighlights", label: "Що було на занятті", placeholder: "Досліди, задачі, симуляції, «вау-моменти», що могло бути складним…", rows: 3, full: true, showIf: REFL_LESSON },
            { type: "text", name: "nextTopic", label: "Наступна тема (для питання-містка)", placeholder: "Напр.: Відстані до зір", full: true, showIf: REFL_LESSON }
          ]
        },
        {
          title: "Рефлексія після заняття", hint: "емоції · що нового · як застосувати", showIf: REFL_LESSON, fields: [
            { type: "select", name: "rtime", label: "Тривалість", options: ["3 хв", "5 хв", "7 хв"], value: "5 хв" },
            { type: "select", name: "rchannel", label: "Як учні відповідають", options: ["Усно / жестами біля слайда", "Стікери або картки", "Письмово в зошиті", "У чаті (онлайн)", "Mentimeter / Google Forms"], value: "Усно / жестами біля слайда" },
            { type: "switch", name: "rformula", label: "За формулою: мета → емоції → що забираю → дія / інтрига", value: true },
            { type: "chips", name: "rtech", label: "Прийоми", options: REFL_TECH_NAMES, value: ["Плюс — мінус — цікаво", "Незакінчені речення", "Питання-місток"], full: true },
            { type: "switch", name: "rvariants", label: "2–3 варіанти, щоб чергувати від заняття до заняття", value: false }
          ]
        },
        {
          title: "Про курс", showIf: REFL_COURSE, fields: [
            { type: "number", name: "rcount", label: "Скільки занять", value: 5, min: 2, max: 30 },
            { type: "select", name: "rgoal", label: "Головна мета курсу", options: ["Зацікавити предметом", "Дати базу", "Навчити досліджувати", "Підготувати до олімпіади", "Поєднання"], value: "Зацікавити предметом" },
            { type: "textarea", name: "rlessons", label: "Теми занять і ключові моменти", placeholder: "1. Що таке фізика і як ми вимірюємо світ — дослід з маятником…\n2. …\n(назва + 1–2 ключові ідеї, досліди, симуляції, «вау-моменти»)", rows: 6, full: true },
            { type: "textarea", name: "coutcomes", label: "Ключові аутками курсу", placeholder: "З чим учні мали вийти…", rows: 2, full: true }
          ]
        },
        {
          title: "Учні", showIf: REFL_COURSE, fields: [
            { type: "text", name: "rsize", label: "Скільки дітей", placeholder: "Напр.: 12" },
            { type: "select", name: "rmood", label: "Група", options: ["Мотивовані «фанати»", "Змішана", "Частина прийшла «бо батьки записали»"], value: "Змішана" },
            { type: "select", name: "rfill", label: "Як заповнюють", options: ["Усно / жестами біля слайдів", "Роздруківка на папері", "Google Forms на телефонах", "Mentimeter", "Kahoot / Quizizz", "Комбіновано: слайди + форма на телефоні"], value: "Комбіновано: слайди + форма на телефоні", full: true }
          ]
        },
        {
          title: "Підсумкове опитування", showIf: REFL_COURSE, fields: [
            { type: "select", name: "rlen", label: "Тривалість", options: ["15 хв", "25 хв", "40 хв"], value: "25 хв" },
            { type: "number", name: "rqcount", label: "Питань", value: 25, min: 8, max: 60 },
            { type: "chips", name: "rprio", label: "Пріоритети (у порядку важливості — що обрано, те глибше)", options: ["Що запам'ятали й зрозуміли", "Емоції та формат занять", "Ставлення до фізики й астрономії", "Мій стиль викладання", "Продовження: чи хочуть і про що"], value: ["Що запам'ятали й зрозуміли", "Емоції та формат занять", "Ставлення до фізики й астрономії", "Мій стиль викладання", "Продовження: чи хочуть і про що"], full: true },
            { type: "chips", name: "rqtypes", label: "Типи питань", options: ["Шкали 1–5 / смайлики", "Вибір варіантів", "Відкриті питання", "Закінчи речення", "Ранжування тем", "Сходи успіху", "До / після", "Творчі (курс як планета)"], value: ["Шкали 1–5 / смайлики", "Вибір варіантів", "Відкриті питання", "Закінчи речення", "Ранжування тем", "До / після", "Творчі (курс як планета)"], full: true },
            { type: "seg", name: "rtone", label: "Тон", options: ["Серйозний, на рівних", "Ігровий космічний сюжет", "Серйозний зміст + легка космічна обгортка"], value: "Серйозний зміст + легка космічна обгортка", full: true },
            { type: "seg", name: "ranon", label: "Анонімність", options: ["Анонімно", "З іменами", "Ім'я за бажанням"], value: "Анонімно" },
            { type: "switch", name: "rknow", label: "Міні «згадай і поясни» по кожному заняттю (без оцінок)", value: true },
            { type: "switch", name: "rshow", label: "Показати дітям спільні результати (хмара слів, графік)", value: true },
            { type: "switch", name: "rtest", label: "На цьому ж занятті ще й тест — полегшити тон", value: false },
            { type: "chips", name: "rpurpose", label: "Для чого мені дані", options: ["Покращити наступний потік", "Звіт для школи / батьків", "Щоденник занять", "Вибір теми продовження"], value: ["Покращити наступний потік", "Щоденник занять"], full: true }
          ]
        },
        {
          title: "Результат", fields: [
            { type: "select", name: "rformat", label: "Що має видати асистент", options: ["Послайдовий план презентації з текстом питань", "Готова HTML-презентація (один файл)", "Анкета для Google Forms", "Роздруківка A4 для учня", "Сценарій проведення для викладача"], value: "Послайдовий план презентації з текстом питань", full: true },
            { type: "switch", name: "rscript", label: "Репліки викладача: як запустити й завершити рефлексію", value: true },
            { type: "switch", name: "ranalysis", label: "Як читати відповіді: сигнал → що змінити", value: true },
            { type: "switch", name: "pbrand", label: "Мій фірмовий стиль (для HTML)", value: true }
          ]
        },
        { title: "Побажання", fields: [EXTRA] }
      ],
      build: buildReflection
    }
  };

  /* ---------- рендер полів ---------- */
  let uid = 0;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function renderField(f) {
    const html = renderInner(f);
    if (!f.showIf) return html;
    const s = f.showIf;
    return '<div class="cond' + (f.full || f.type === "switch" ? " full" : "") + '" data-if="' + s.name + '" data-in="' + esc(s.in ? s.in.join("|") : "") + '"' + (s.on ? ' data-on="1"' : "") + ">" + html + "</div>";
  }

  function renderInner(f) {
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
    const s = sec.showIf;
    const cond = s ? ' cond" data-if="' + s.name + '" data-in="' + esc(s.in ? s.in.join("|") : "") + '"' + (s.on ? ' data-on="1"' : "") : '"';
    return '<section class="panel glass' + cond + '><div class="panel-title"><span class="step">' + n + "</span><h2>" + sec.title + "</h2>" +
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
      } else if (el.type === "checkbox") v[el.name] = el.checked;
      else if (el.type === "radio") { if (el.checked) v[el.name] = el.value; }
      else v[el.name] = el.value.trim();
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
      else if (el.tagName === "SELECT") { if ([...el.options].some(o => o.value === val)) el.value = val; }
      else el.value = val;
    });
  }

  const BASE_NAMES = BASE_SECTIONS.flatMap(s => s.fields.map(f => f.name));

  /* ---------- допоміжне для промптів ---------- */
  const list = arr => (arr && arr.length ? arr.join(", ") : "на твій розсуд");
  const block = (title, text) => (text ? "\n### " + title + '\n"""\n' + text + '\n"""\n' : "");
  const subjGen = v => v.subject === "Астрономія" ? "астрономії" : v.subject === "Фізика + астрономія" ? "фізики та астрономії" : "фізики";
  const low = s => (s || "").toLowerCase();

  function header(v, task, role) {
    let out = "# Роль\n" + (role || "Ти — досвідчений викладач STEM-дисциплін та методист з " + subjGen(v) + ", який пояснює складне просто, точно й цікаво.") +
      " Пишеш українською, дотримуєшся сучасної української термінології та одиниць СІ.\n\n";
    out += "# Завдання\n" + task + "\n\n";
    out += "# Вихідні дані\n";
    if (v.course) out += "- Курс: «" + v.course + "»" + (v.lessonNo ? ", заняття №" + v.lessonNo : "") + "\n";
    out += "- Предмет: " + v.subject + "\n";
    out += "- Тема: " + (v.topic || "[тему не вказано — запитай мене перед початком]") + "\n";
    out += "- Аудиторія: " + v.grade + "; рівень глибини — " + low(v.level) + "\n";
    out += "- Формат: " + low(v.group) + ", " + low(v.mode) + ", тривалість " + v.duration + "\n";
    out += "- Орієнтир: " + v.program + "\n";
    if (v.prevTopic) out += "- Минула тема: " + v.prevTopic + "\n";
    if (v.nextTopic) out += "- Наступна тема: " + v.nextTopic + "\n";
    out += block("Хід заняття / план — дотримуйся цієї логіки", v.plan);
    out += block("Практика", v.practice);
    out += block("Мета та ауткам заняття", v.aim);
    out += block("Ключові формули — обов'язково використай і поясни", v.formulas);
    out += block("Матеріал / сценарій — головне джерело змісту", v.material);
    if (!v.material && !v.plan) out += "\n(Матеріал не надано — спирайся на перевірені факти шкільного й науково-популярного рівня за цією темою.)\n";
    return out;
  }

  function testPart(v) {
    if (!v.test) return "";
    let t = "\n# Тест\n";
    t += "- Кількість питань: " + (v.tcount || 8) + "\n";
    t += "- Типи завдань: " + list(v.ttypes) + "\n";
    t += "- Складність: " + (v.tlevel === "Три рівні" ? "три рівні (початковий / середній / достатній-високий), позначені" : v.tlevel === "Зростає" ? "від простого до складного" : "однакова") + "\n";
    t += "- Розміщення: " + v.tplace + "\n- Формат: " + v.tformat + "\n";
    if (v.tkey) t += "- Ключ відповідей — окремо, після тесту.\n";
    if (v.texplain) t += "- До кожної відповіді — коротке пояснення, чому вона правильна, а дистрактори — ні.\n";
    t += "- Дистрактори — правдоподібні (типові помилки учнів), задачі — з реалістичними числами та одиницями.\n";
    return t;
  }

  function quality(v, extraLines) {
    let q = "\n# Перевір перед відповіддю\n";
    q += "- 100% фактологічна точність: дати, імена, числа, одиниці СІ, порядки величин.\n";
    q += "- Позначення величин однакові в усіх частинах і збігаються з ключовими формулами.\n";
    q += "- Формули — у LaTeX: $...$ у рядку, $$...$$ окремим рядком.\n";
    q += "- Нічого не вигадуй: якщо даних бракує — познач [уточнити] і продовжуй.\n";
    (extraLines || []).forEach(l => (q += "- " + l + "\n"));
    if (v.extra) q += "\n# Додаткові побажання\n" + v.extra + "\n";
    return q;
  }

  const GOAL_TEXT = {
    "Концептуальна": "**Концептуальна:** які поняття й ідеї учні розрізняють і розуміють",
    "Математична": "**Математична:** що учні обчислюють, переводять, оцінюють (з формулами)",
    "Фізична": "**Фізична:** які явища й закони учні пояснюють",
    "Світоглядна": "**Світоглядна:** як змінюється погляд учнів на науку та світ"
  };

  /* ---------- курс ---------- */
  function buildCourse(v) {
    const n = Math.max(1, parseInt(v.clessons, 10) || 5);
    const hasFinal = v.cfinalfmt && v.cfinalfmt !== "Без підсумкового заняття";
    const dur = v.cdur && v.cdur.length ? v.cdur.join(" або ") : "45 хв";
    const durEach = v.cdur && v.cdur.length > 1 ? "для " + v.cdur.join(" та ") : "для " + dur;
    const mode = v.cmode || "";
    const wantSyl = mode.startsWith("Силабус");
    const wantDet = mode !== "Силабус курсу";
    const theme = v.ctopic || "[тематику не вказано — запитай мене]";
    const rw = v.rwhere || [];
    const reflEach = v.refl && rw.some(x => x.startsWith("Коротка"));
    const reflFinal = v.refl && rw.some(x => x.startsWith("Підсумкова"));

    let out = "# Роль\nТи — досвідчений методист та викладач STEM-дисциплін. Пишеш українською.\n\n";
    out += "# Завдання\n";
    if (wantSyl) out += "Розроби детальну програму (силабус) інтерактивного курсу з " + subjGen(v) + ". Тематика курсу: «" + theme + "»" + (v.coutcomes ? " (" + v.coutcomes + ")" : "") + ".\n";
    if (wantDet) out += (wantSyl ? "Після силабусу розпиши" : "Розпиши") + " детальну структуру кожного з " + n + " занять курсу" + (v.cname ? " «" + v.cname + "»" : "") + ". Заняття мають бути інтерактивними, базуватися на дослідницькому підході (без сухого заучування формул), містити роботу з даними або симуляціями та спонукати учнів до критичного мислення.\n";
    if (!wantSyl && v.coutcomes) out += "\nКлючові аутками курсу (цілі): " + v.coutcomes + "\n";

    out += "\n# Вимоги до курсу\n";
    out += "1. Обсяг: " + n + " навчальних занять" + (hasFinal ? " + 1 підсумкове заняття" : "") + ".\n";
    if (hasFinal) out += "2. Формат фіналу: " + (n + 1) + "-те заняття — " + low(v.cfinalfmt) + (v.cfinalfmt.startsWith("Залік") ? " з рефлексією" : " (без класичного оцінювання чи нудних заліків)") + ".\n";
    out += (hasFinal ? "3" : "2") + ". Таймінг: тривалість заняття — " + dur + ". Для кожного заняття пропиши пропорційний розподіл часу між теорією та практикою (" + (v.cratio && !v.cratio.startsWith("На розсуд") ? "орієнтир — " + v.cratio : "наприклад, 30% теорії / 70% практики, інтерактивів або симуляцій") + ").\n";
    out += (hasFinal ? "4" : "3") + ". Підхід: курс неформатний, з акцентом на: " + list(v.capproach) + "." + (v.ctie ? " Усі теми логічно випливають одна з одної: кожне заняття строго пов'язане з минулим і наступним." : "") + "\n";
    out += "- Аудиторія: " + v.grade + "; рівень — " + low(v.level) + ".\n";
    out += block("Каркас занять — збережи цю послідовність і зміст", v.cframe);
    out += block("Сценарій фіналу / ролі — розвинь і доповни", v.cfinalscript);

    if (wantSyl) {
      out += "\n# Формат виводу силабусу\nВикористай суворо наведену нижче структуру, не додаючи зайвих вступних слів.\n\n";
      out += "Силабус курсу: [" + (v.cname ? v.cname : "Запропонуй влучну назву" + (v.cnamehint ? " (" + v.cnamehint + ")" : "")) + "]\n\n";
      out += "* Опис курсу: [3–5 речень: інтригуючий контекст, чому тема важлива зараз, і ключові питання, над якими подумаємо на курсі]\n";
      out += "* Назва курсу:\n";
      out += "* Цільова аудиторія: [" + v.grade + "; базовий чи поглиблений]\n";
      out += "* Вимоги до учасників: [що мають знати до початку]\n";
      out += "* Ключова ідея курсу: [на що учасники мають вийти? Щоб що цей курс? Чому це важливо?]\n";
      out += "* Ключові аутками курсу (цілі): [1–3: з чим учні вийдуть, що відкриють для себе, чому здивуються]\n\n";
      out += "Структура курсу: (для кожного з " + n + " занять розпиши детально за цим шаблоном)\n\n";
      out += "* Заняття [Номер]: [Тема заняття]\n";
      out += "   * Хід заняття: [таймінг: що робимо і скільки часу це займає, у пропорції " + durEach + "]\n";
      out += "   * Практика: [конкретний експеримент, робота з даними або симуляцією]\n";
      out += "   * Ауткам заняття: [що конкретно зрозуміють / зроблять учні]\n";
      if (reflEach) out += "   * Рефлексія: [" + (v.rtime || "5 хв") + ": прийом і 2–3 конкретні питання / незакінчені речення під тему заняття]\n";
      if (hasFinal) {
        out += "\nФінальне завдання (Заняття " + (n + 1) + "):\n\n";
        out += "* Формат: [" + v.cfinalfmt + "]\n";
        out += "* Хід завдання: [сценарій, легенда гри, ролі та таймінг]\n";
        out += "* Результат: [як саме учні продемонструють засвоєні за " + n + " занять навички]\n";
      }
    }

    if (wantDet) {
      out += "\n# Формат детальної структури\nДля кожного заняття:\n";
      out += "- Номер заняття\n- Назва заняття\n- Хід заняття (з таймінгом " + durEach + " і пропорцією теорія/практика" + (reflEach ? "; останні " + (v.rtime || "5 хв") + " — рефлексія" : "") + ")\n- Практика\n- Мета заняття\n- Ауткам заняття\n";
      if (reflEach) out += "- Рефлексія: прийом, конкретні питання під тему заняття, як вона повертає до мети й веде до наступного заняття\n";
      const d = v.cdetail || [];
      if (d.includes("Вступний гачок")) out += "- Вступний гачок: 1–2 речення — цікавий факт, парадокс або статистика, що одразу захоплює увагу\n";
      if (d.includes("Ключові питання")) out += "- 3–4 ключові питання для наукової дискусії\n";
      if (d.includes("Вартісні пойнти")) out += "- Вартісні пойнти: на чому наголосити, які неочевидні висновки підсвітити\n";
      if (d.includes("Матеріали та симуляції")) out += "- Матеріали: конкретні симуляції (PhET, Stellarium, NASA Eyes), датасети, обладнання\n";
      if (d.includes("Питання для рефлексії")) out += "- Цінні думки та відкриті питання для рефлексії\n";
      out += "Наприкінці кожного заняття — одне речення-місток до наступного.\n";
      if (hasFinal) out += "\nЗаняття " + (n + 1) + " (" + low(v.cfinalfmt) + "): сценарій і розподіл ролей, хід із таймінгом, як кожна роль інтегрує конкретні заняття курсу, критерії оцінювання за аргументованістю позицій.\n";
    }
    if (reflEach || reflFinal) {
      out += "\n# Рефлексія в курсі\n";
      if (reflEach) out += "## Після кожного заняття\n" + reflCore(v) + "Прийоми чергуй між заняттями, щоб рефлексія не ставала рутиною; питання-місток кожного заняття веде до теми наступного.\n";
      if (reflFinal) out += "## Підсумкова рефлексія курсу\nНа " + (hasFinal ? "фінальному (" + (n + 1) + "-му)" : "останньому") + " занятті заклади 10–15 хв на підсумкову рефлексію: повернення до ключових аутками курсу, шкала вражень по кожному заняттю, що учні забирають із собою, як змінилося їхнє ставлення до " + subjGen(v) + ", що хочуть вивчати далі. Анонімно, з візуалізацією спільних результатів (напр., хмара слів). Опиши її структуру й 8–12 ключових питань.\n";
    }
    out += quality(v, ["Зміст відповідає віку аудиторії; таймінг кожного заняття реалістичний і в сумі дає повну тривалість."]);
    return out;
  }

  /* ---------- сценарій ---------- */
  function buildScenario(v) {
    const title = "Заняття" + (v.lessonNo ? " " + v.lessonNo : "") + (v.topic ? ". " + v.topic : "");
    let out = header(v, "Розпиши повний сценарій одного заняття (" + low(v.ltype) + ", " + v.duration + "). Заняття має бути інтерактивним, базуватися на дослідницькому підході (без сухого заучування формул), містити роботу з даними, моделями або симуляціями та спонукати учнів до критичного мислення." + (v.prevTopic || v.nextTopic ? " Воно має бути строго пов'язане з минулою і наступною темою." : ""));
    out += "\n# Структура сценарію (суворо в такому порядку)\n";
    out += "**" + title + "**\n\n";
    let i = 0;
    out += ++i + ". **Короткий опис заняття** — таблиця з трьох рядків: «Хід заняття» (суцільний абзац: про що заняття і в якій логіці) | «Практика» (усі активності, задачі, ігри) | «Ауткам заняття» (що конкретно вмітимуть учні).\n";
    out += ++i + ". **Вступна частина** — вступний гачок: 2–4 речення з яскравою масштабною аналогією, парадоксом чи фактом, що одразу захоплює увагу і підводить до теми.\n";
    out += ++i + ". **Опис та проблематика** — " + (v.qcount || 5) + " нумерованих ключових питань, що стимулюють наукову дискусію і разом покривають усе заняття.\n";
    out += ++i + ". **Основні цілі**:\n" + (v.sgoals && v.sgoals.length ? v.sgoals : Object.keys(GOAL_TEXT)).map(g => "   - " + (GOAL_TEXT[g] || g)).join("\n") + "\n";
    out += ++i + ". **Методична основа** — " + list(v.smethods) + ".\n";
    if (v.sequip) out += ++i + ". **Обладнання та матеріали** — окремо «Для викладача» і «Для учнів» (на групу), з дешевими замінниками.\n";
    out += ++i + ". **Хід заняття** — таблиця з колонками «Часові рамки | Хід думок | Вартісні пойнти», похвилинно (00:00–03:00, 03:00–09:00 …) на всі " + v.duration + ".\n";
    out += "   - «Хід думок»: назва блоку жирним, що робимо і що питаємо" + (v.sslides ? ", номери слайдів (сл. N)" : "") + ", задачі — з повним розв'язанням і числами, ігри — з правилами.\n";
    if (v.sblitz) out += "   - Після кожного блоку в «Хід думок» — «⚡ Бліц:» 3–5 коротких питань, відповіді курсивом після тире.\n";
    out += "   - «Вартісні пойнти»: на чому викладач має наголосити, неочевидні висновки, типові пастки (позначай **Обережно:**), цікаві деталі.\n";
    if (v.sdialog) out += ++i + ". **Репліки викладача** — живий текст для вступу, ключового пояснення та підсумку (без канцеляриту).\n";
    if (v.sdiff) out += ++i + ". **Диференціація** — завдання для сильніших і підтримка для тих, кому складно.\n";
    if (v.refl) out += ++i + ". **Рефлексія (" + (v.rtime || "5 хв") + ")** — останній блок у «Хід заняття» і окремо тут: репліки викладача, конкретні питання / незакінчені речення під тему, що учні роблять (руки, стікери, смайлики, чат), як викладач використає відповіді.\n";
    out += ++i + ". **Матеріали, ілюстрації та інструменти** — конкретні симуляції (PhET, Stellarium, NASA Eyes тощо), датасети, відео з назвами.\n";
    out += ++i + ". **Цінні думки та питання для рефлексії** — світоглядні або відкриті наукові питання, які варто залишити учням на подумати.\n";
    if (v.shw) out += ++i + ". **Домашнє завдання** — базове + за бажанням.\n";
    out += ++i + ". **Фінальне слово** — короткий підсумок і місток до наступної теми" + (v.nextTopic ? " («" + v.nextTopic.split("(")[0].trim() + "»)" : "") + ".\n";
    if (v.sblitz && +v.sbank > 0) out += ++i + ". **Банк бліц-питань** — " + v.sbank + " питань з відповідями, згрупованих за блоками заняття.\n";
    out += testPart(v);
    out += "\n# Формат відповіді\n";
    const f = v.sform || "";
    if (f.startsWith("Таблиці")) out += "Markdown з таблицями, щоб коректно вставлялося в Google Docs / Word. Без вступних слів перед сценарієм.\n";
    else if (f.startsWith("Документ HTML")) out += "Один самодостатній HTML-документ за шаблоном із розділу «ФІРМОВИЙ СТИЛЬ» нижче: кожен пункт структури — окрема картка, «Хід заняття» — таблиця, ⚡ бліц — <details>, вартісні пойнти — callout info, «Обережно» — callout warn.\n";
    else out += "Звичайний текст із підзаголовками, таблиці замінені списками.\n";
    out += reflPart(v, "Рефлексія входить у загальний таймінг заняття (останні " + (v.rtime || "5 хв") + ")" + (v.sslides ? " і має свій слайд (сл. N)" : "") + ".");
    out += quality(v, ["Сума таймінгу — рівно " + v.duration + "; на кожне нове поняття — не менше 5 хв.", "Логіка від минулої теми до наступної простежується в усьому сценарії."]);
    if (f.startsWith("Документ HTML")) out += styleLock().replace("· Конспект", "· Сценарій");
    return out;
  }

  /* ---------- презентація ---------- */
  function buildPresentation(v) {
    let out = header(v, "Напиши презентацію до цього заняття на " + (v.slides || 20) + " слайдів. Дизайн передбачає мінімум тексту, максимум візуалізацій, схем і графіків.");
    out += "\n# Вимоги до презентації\n";
    out += "- Кількість слайдів: " + (v.slides || 20) + " (з титульним і підсумковим).\n";
    out += "- Подача: " + low(v.pstyle) + "; не більше " + (v.pmaxwords || 25) + " слів на слайді — усе інше в нотатки.\n";
    out += "- Один слайд — одна думка. Ключову формулу — окремо, з поясненням кожної величини та одиниць.\n";
    out += "- Обов'язково включи: " + list(v.pinclude) + ".\n";
    if (v.psync) out += "- Послідовність і номери слайдів мають збігатися з ходом заняття, щоб у сценарії можна було посилатися «сл. N».\n";
    if (v.pnotes) out += "- До кожного слайда — нотатки доповідача: що сказати, яке питання поставити, на що звернути увагу.\n";
    if (v.pimg) out += "- Для кожного слайда — що саме зобразити: конкретне фото / схема / графік і де взяти (NASA, ESA, Wikimedia) або промпт для генерації.\n";
    if (v.pbrand) out += "- Візуальний стиль: " + BRAND_STYLE + ".\n";
    out += testPart(v);
    out += reflPart(v, "На презентації — 1–2 слайди рефлексії перед фінальним: короткі питання / незакінчені речення великим шрифтом, візуальна шкала (сходи, смайлики, кольори) і питання-місток до наступного заняття." + (v.pnotes ? " У нотатках — як провести рефлексію і що робити з відповідями." : ""));
    out += "\n# Формат відповіді\n";
    const f = v.pformat || "";
    if (f.startsWith("Послайдовий")) out += "Послайдова структура:\nСлайд 1: [що зображено] — [теза / текст на слайді]\nСлайд 2: …\n" + (v.pnotes ? "Під кожним слайдом — «Нотатки:» 2–4 речення.\n" : "");
    else if (f.startsWith("Готова HTML")) out += "Один самодостатній HTML-файл: перемикання слайдів стрілками/свайпом, нумерація, адаптивність, формули через KaTeX (CDN), схеми — вбудованим SVG.\n";
    else if (f.startsWith("Таблиця")) out += "Таблиця: № | заголовок | текст на слайді | візуал | нотатки доповідача.\n";
    else if (f.startsWith("Markdown")) out += "Markdown для Marp: слайди розділені `---`, нотатки в `<!-- -->`, формули в LaTeX.\n";
    else out += "Файл .pptx. Якщо створити файл неможливо — видай послайдову структуру.\n";
    out += quality(v);
    return out;
  }

  /* ---------- конспект ---------- */
  function buildNotes(v) {
    const t = v.ntype || NOTE_TYPES[0];
    if (t === NOTE_TYPES[2]) return buildTeacherNotes(v);
    const short = t === NOTE_TYPES[0];
    const workbook = t === NOTE_TYPES[3];
    let out = header(v, short
      ? "Згенеруй короткий структурований конспект для учнів до цього заняття — дружнім тоном, готовий до копіювання в освітній простір."
      : workbook
        ? "Створи робочий зошит до заняття: конспект, у якому ключові слова й частини формул замінені пропусками для заповнення."
        : "Створи повний конспект для учня обсягом " + (v.npages || 2) + " стор. A4 — такий, за яким можна повторити тему самостійно.");
    out += "\n# Вимоги до конспекту\n";
    out += "- Тон: " + low(v.ntone) + ", звертання до учня на «ти».\n";
    if (!short) out += "- Обсяг: приблизно " + (v.npages || 1) + " стор. A4.\n";
    out += "- Має містити: " + list(v.ninclude) + ".\n";
    out += "- Для кожної формули: що означає кожна величина, одиниці СІ, коли формулу можна застосовувати.\n";
    if (workbook) out += "- Пропуски позначай ______; наприкінці — ключ для самоперевірки.\n";
    const html = (v.nformat || "").startsWith("HTML");
    if (v.refl) out += "- Наприкінці — блок «Моя рефлексія» для самостійного заповнення учнем: " + (v.rtech && v.rtech.length ? v.rtech.join(", ") : "незакінчені речення, сходи успіху") + "; у кожному пункті місце для відповіді" + (html ? " (<span class=\"gap\"></span>)" : "") + ".\n";
    if (html) out += "- Блок «Перевір себе» — питання з прихованими відповідями; ключові терміни — у словничку; кожна формула — з поясненням величин.\n";
    out += testPart(v);
    if (v.refl) out += "\n# Рефлексія\n" + reflCore(v).replace(/ Тривалість — [^.]+\./, "") + "Сформулюй її як самооцінку учня після опрацювання конспекту.\n";
    out += "\n# Формат відповіді\n" + notesFormat(v) + "\n";
    out += quality(v);
    if (html && v.nbrand) out += styleLock();
    return out;
  }

  function notesFormat(v) {
    const f = v.nformat || "";
    if (f.startsWith("Markdown")) return "Markdown з LaTeX-формулами, без вступних слів — одразу конспект.";
    if (f === "HTML-конспект у стилі сайту") return v.nbrand ? "Один самодостатній HTML-файл за шаблоном із розділу «ФІРМОВИЙ СТИЛЬ» нижче." : "Один самодостатній HTML-файл: KaTeX через CDN, розділи-картки, блок «Перевір себе» з прихованими відповідями, схеми вбудованим SVG, коректний друк.";
    if (f.startsWith("HTML для друку")) return "Один HTML-файл, зручний для друку на A4: розділи не розриваються між сторінками, без зайвого тексту" + (v.nbrand ? ", строго за шаблоном із розділу «ФІРМОВИЙ СТИЛЬ» нижче (у шаблоні вже є стилі для друку)." : ", формули KaTeX.");
    return "Суцільний зв'язний текст із заголовками розділів.";
  }

  function buildTeacherNotes(v) {
    let out = "Ти — автор науково-популярних підручників (як National Geographic Kids, кращі шкільні хрестоматії). Твоя суперсила — перетворювати суху інформацію на захопливу, зв'язну розповідь, зберігаючи 100% фактологічну точність. Пишеш українською.\n\n";
    out += "ЗАВДАННЯ:\nНапиши ПОВНИЙ ТЕОРЕТИЧНИЙ КОНСПЕКТ на тему нижче — матеріал для глибокого вивчення, розрахований приблизно на " + (v.nhours || 2) + " год читання/засвоєння.\n\n";
    out += "Це має бути ЧИСТИЙ ТЕКСТ-ОПОВІДЬ (як розділ підручника чи енциклопедії), а НЕ сценарій заняття.\n\n";
    out += "СУВОРО ЗАБОРОНЕНО:\n- будь-які репліки на кшталт \"Викладач каже...\", \"Вчитель:\", \"Ведучий:\"\n- будь-які питання до аудиторії (\"А як ви думаєте?\", \"Чи знаєте ви?\")\n- будь-які інструкції щодо проведення заняття, активності, вправи, \"підніміть руку\", \"обговоріть у групах\" тощо\n- звернення до \"дітей\" або \"слухачів\" напряму (\"Уявіть, друзі...\")\n- таймінги на кшталт \"⏱ 12 хв\" чи \"[АКТИВНІСТЬ]\"\n\n";
    out += "Це має читатись як текст, написаний ДЛЯ вчителя, щоб він сам вивчив матеріал — а вже потім своїми словами переказав дітям.\n\n";
    out += "ВХІДНІ ДАНІ:\n";
    out += "- Тема: [ " + (v.topic || "вкажи тему") + " ]\n";
    if (v.course) out += "- Курс: [ " + v.course + (v.lessonNo ? ", заняття №" + v.lessonNo : "") + " ]\n";
    out += "- Минула тема: [ " + (v.prevTopic || "—") + " ]\n";
    out += "- Наступна тема: [ " + (v.nextTopic || "—") + " ]\n";
    out += "- Вік дітей, яким матеріал буде переказано: [ " + v.grade + " ]\n";
    out += "- Рівень глибини: [ " + v.level + (v.level && v.level.startsWith("Високий") ? ", але з розжовуванням" : "") + " ]\n";
    out += "- Обов'язкові підтеми/план: [ " + (v.plan || "на твій розсуд, логічно від причин до наслідків") + " ]\n";
    if (v.formulas) out += "- Ключові формули: [ " + v.formulas.replace(/\n/g, "; ") + " ]\n";
    const scen = [v.practice && "Практика: " + v.practice, v.aim && "Мета й ауткам: " + v.aim, v.material].filter(Boolean).join("\n");
    if (scen) out += "- Сценарій: [ " + scen + " ]\n";
    out += "\nЯК ПИСАТИ ТЕКСТ:\n\n";
    out += "1. СТРУКТУРА\n   - Логічна послідовність розділів: від витоків/причин — до розвитку — до наслідків/сучасного значення.\n   - Кожен розділ має заголовок і чіткий смисловий місток до наступного (\"Це стало передумовою того, що...\", \"Паралельно з цим...\").\n   - Не пропускай причинно-наслідкові зв'язки: завжди пояснюй ЧОМУ сталося те чи інше, а не лише ЩО сталося.\n\n";
    out += "2. СТОРІТЕЛІНГ\n   - Кожен розділ відкривай не сухим фактом, а сценою, конкретною людиною, ситуацією або парадоксом — і вже через це підводь до пояснення.\n   - У кожному великому розділі — 1-2 яскраві історичні епізоди чи маловідомі деталі, які ілюструють суть явища.\n   - Мова жива, образна, з метафорами, зрозумілими для вказаного віку, але без спрощення чи викривлення фактів.\n\n";
    out += "3. ІСТОРИЧНИЙ КОНТЕКСТ\n   - Перед ключовими подіями коротко описуй епоху: що відбувалося навколо, які були умови, настрої, обмеження того часу.\n\n";
    const blocks = v.nblocks && v.nblocks.length ? v.nblocks : ["📌 Запам'ятати", "🧭 Довідка", "💡 Цікавий факт"];
    const bdesc = { "📌 Запам'ятати": "ключові дати, терміни, цифри, визначення, формули", "🧭 Довідка": "короткі пояснення понять чи персоналій", "💡 Цікавий факт": "короткий маловідомий епізод чи деталь", "🇺🇦 Український слід": "внесок українських учених і установ у тему" };
    out += "4. ВИДІЛЕННЯ СУХОЇ ІНФОРМАЦІЇ\n   Всередині оповідного тексту виділяй довідкові вставки окремими блоками:\n" + blocks.map(b => "   - " + b.replace(/^(\S+) (.*)$/, "$1 «$2»") + " — " + (bdesc[b] || "")).join("\n") + "\n   Ці блоки мають бути короткими вставками всередині розповіді, а не окремим \"питанням для дітей\" чи завданням.\n\n";
    out += "5. ФОРМАТ\n   - Суцільний зв'язний текст із заголовками розділів. Формули — у LaTeX ($...$), з розжовуванням кожної величини.\n   - Наприкінці кожного розділу — 2-3 речення підсумку простими словами.\n   - У самому кінці — короткий загальний підсумок усієї теми (без питань, без \"рефлексії\", просто виклад головної думки).\n\n";
    out += "ОБСЯГ: розрахуй так, щоб матеріалу вистачило на ґрунтовне " + (v.nhours || 2) + "-годинне опрацювання теми — орієнтовно " + Math.round((v.nwords || 9000) * 0.9 / 500) * 500 + "–" + Math.round((v.nwords || 9000) * 1.2 / 500) * 500 + " слів залежно від теми.\n\n";
    out += "Розкривай кожен пункт плану настільки глибоко, наскільки потребує тема — не узагальнюй і не скорочуй. Якщо відповідь обірветься, продовж з того самого місця, коли я напишу «далі».\n";
    if (v.extra) out += "\nДОДАТКОВО:\n" + v.extra + "\n";
    if ((v.nformat || "").startsWith("HTML") && v.nbrand) {
      out += "\nОФОРМЛЕННЯ: кожен розділ — окрема картка; вставки 📌 → callout remember, 🧭 → callout info, 💡 → callout fact; підсумок розділу — <p><strong>…</strong></p> наприкінці картки.\n";
      out += styleLock();
    }
    return out;
  }

  /* ---------- картки ---------- */
  function buildCards(v) {
    let out = header(v, "Створи " + (v.ccount || 20) + " цікавих карток «питання — відповідь» за темою заняття, щоб розбудити інтерес і перевірити розуміння.");
    out += "\n# Вимоги до карток\n";
    out += "- Кількість: " + (v.ccount || 20) + "; складність: " + low(v.clevel) + ".\n";
    out += "- Типи питань: " + list(v.ctypes) + ". Чергуй типи, без повторів за змістом.\n";
    out += "- Відповідь: " + low(v.canswer) + "; точна, без «води».\n";
    out += "- Питання — з несподіваним ракурсом, побутовою ситуацією, «а що, якби…».\n";
    if (v.cgroup) out += "- Згрупуй картки за блоками заняття (за ходом заняття / планом).\n";
    if (v.chint) out += "- До кожної картки — підказка, що не розкриває відповідь.\n";
    if (v.cmcq) out += "- До кожної картки — 4 варіанти відповіді, один правильний.\n";
    if (v.refl) out += "- Наприкінці колоди — 3–5 окремих карток-рефлексій (позначені «Рефлексія»), без правильної відповіді: на звороті — підказка, як можна відповісти.\n";
    out += reflPart(v, "Картки-рефлексії відповідають прийомам вище і темі заняття.");
    out += "\n# Формат відповіді\n";
    const f = v.cformat || "";
    if (f.startsWith("Інтерактивні")) out += "Один самодостатній HTML-файл з картками, що перевертаються по кліку/дотику, перемішуванням, лічильником «знаю / повторити», KaTeX для формул" + (v.cbrand ? "; стиль: " + BRAND_STYLE : "") + ".\n";
    else if (f.startsWith("Таблиця")) out += "Markdown-таблиця: № | тип | питання | " + (v.chint ? "підказка | " : "") + "відповідь.\n";
    else if (f.startsWith("CSV")) out += "CSV для імпорту в Anki, роздільник «;», поля: front;back" + (v.chint ? ";hint" : "") + ". Формули — у форматі MathJax Anki: \\( ... \\). Лише сам CSV у блоці коду.\n";
    else out += "JSON-масив об'єктів { \"type\", \"question\", " + (v.chint ? "\"hint\", " : "") + (v.cmcq ? "\"options\", " : "") + "\"answer\" }.\n";
    out += quality(v);
    return out;
  }

  /* ---------- усе й одразу ---------- */
  function buildUniversal(v) {
    const what = v.uwhat && v.uwhat.length ? v.uwhat : ["Сценарій заняття"];
    let out = header(v, "Підготуй повний комплект матеріалів до одного заняття: " + low(what.join(", ")) + ". Усі матеріали узгоджені між собою: однакові позначення, приклади, номери слайдів і логіка.");
    out += "\n# Склад комплекту\n";
    let n = 0;
    if (what.includes("Сценарій заняття")) out += ++n + ". Сценарій заняття: короткий опис (хід заняття | практика | ауткам), вступний гачок, опис та проблематика (5 питань), основні цілі (концептуальна / математична / фізична / світоглядна), обладнання, таблиця «Часові рамки | Хід думок | Вартісні пойнти» на " + v.duration + " з ⚡ бліц-питаннями після блоків і посиланнями на слайди (сл. N), питання для рефлексії, " + (v.refl ? "рефлексія наприкінці (" + (v.rtime || "5 хв") + ") за розділом «Рефлексія» нижче, " : "") + "фінальне слово-місток" + (+v.sbank > 0 ? ", банк із " + v.sbank + " бліц-питань з відповідями" : "") + ".\n";
    if (what.includes("Презентація")) out += ++n + ". Презентація — " + (v.slides || 20) + " слайдів, мінімум тексту, максимум візуалізацій; послайдово «Слайд N: що зображено / теза» з нотатками доповідача; номери збігаються зі сценарієм.\n";
    if (what.includes("Конспект для учня")) out += ++n + ". Конспект для учня (Markdown, дружній тон): головна ідея, словничок 2–3 термінів простими словами, ключовий висновок, питання для самоперевірки.\n";
    if (what.includes("Теоретичний конспект для викладача")) out += ++n + ". Теоретичний конспект для викладача — чистий текст-оповідь як розділ науково-популярного підручника (~" + (v.nwords || 9000) + " слів): сторітелінг, історичний контекст, вставки 📌 «Запам'ятати», 🧭 «Довідка», 💡 «Цікавий факт»; без реплік, питань до аудиторії та інструкцій щодо проведення.\n";
    if (what.includes("Картки-питання")) out += ++n + ". Картки-питання — " + (v.ccount || 20) + " шт.: бліц, «чому?», парадокси, «що буде, якщо…», з короткими відповідями.\n";
    out += "\n# Формат\n- " + v.uformat + "\n";
    const uhtml = v.uformat && v.uformat.startsWith("HTML") && v.ubrand;
    if (uhtml) out += "- Сценарій і конспекти оформи строго за шаблоном із розділу «ФІРМОВИЙ СТИЛЬ» нижче; презентацію й картки — " + BRAND_STYLE + ".\n";
    if (v.uflow && v.uflow.startsWith("Поетапно")) out += "- Спершу покажи короткий план комплекту (5–10 рядків) і дочекайся мого «далі». Потім видавай по одному матеріалу за відповідь, у порядку списку.\n";
    else out += "- Видай усе однією відповіддю, кожен матеріал під окремим заголовком першого рівня.\n";
    out += testPart(v);
    if (v.test) out += "- Тест оформи окремим матеріалом комплекту.\n";
    out += reflPart(v, "Рефлексія наскрізна: блок у сценарії, слайд у презентації" + (what.includes("Конспект для учня") ? ", блок «Моя рефлексія» в конспекті учня" : "") + " — однакові питання й прийоми.");
    out += quality(v, ["Матеріали не дублюють один одного дослівно: сценарій — для викладача, презентація — для показу, конспект — для учня."]);
    if (uhtml) out += styleLock();
    return out;
  }

  /* ---------- рефлексія ---------- */
  function reflFormat(v, lesson) {
    const f = v.rformat || "";
    if (f.startsWith("Послайдовий")) return "Послайдова структура: «Слайд N: [заголовок] — [текст питання / варіанти відповіді] — [візуал]». Під кожним слайдом — «Нотатки:» що сказати і скільки часу.";
    if (f.startsWith("Готова HTML")) return "Один самодостатній HTML-файл-презентація: перемикання стрілками/свайпом, нумерація, великий шрифт для проєктора, шкали й смайлики — вбудованим SVG" + (v.pbrand ? "; стиль: " + BRAND_STYLE : "") + ".";
    if (f.startsWith("Анкета")) return "Анкета для Google Forms: для кожного питання — тип поля Google Forms (лінійна шкала, кілька варіантів, прапорці, сітка, короткий / розгорнутий текст), текст, варіанти, обов'язкове чи ні; розділи форми = блоки.";
    if (f.startsWith("Роздруківка")) return "Аркуш A4 для учня" + (lesson ? " (можна розрізати на 2–4 картки)" : " (2–4 сторінки)") + ": питання з місцем для відповіді, шкали й смайлики для обведення, без зайвого тексту.";
    return "Сценарій проведення для викладача: таблиця «Час | Що робимо / кажемо | Що роблять учні | Навіщо».";
  }

  function buildReflection(v) {
    const lesson = !(v.rtype || "").startsWith("На весь курс");
    let out = "# Роль\nТи — досвідчений методист і викладач " + subjGen(v) + ", що вміє говорити з підлітками на рівних і будувати рефлексію, яка дає вчителю справжні дані, а учням — відчуття сенсу. Пишеш українською.\n\n";
    if (lesson) {
      out += "# Завдання\nСтвори рефлексію на завершення заняття (" + (v.rtime || "5 хв") + "). Це не формальність на хвилину, а усвідомлене підбиття підсумків, що пов'язує тему з досвідом учня, перевіряє його емоційний стан і розуміння матеріалу.\n\n";
      out += "# Вихідні дані\n";
      if (v.course) out += "- Курс: «" + v.course + "»" + (v.lessonNo ? ", заняття №" + v.lessonNo : "") + "\n";
      out += "- Предмет: " + v.subject + "\n- Тема: " + (v.topic || "[тему не вказано — запитай мене]") + "\n- Аудиторія: " + v.grade + "; " + low(v.mode) + "\n- Як учні відповідають: " + low(v.rchannel) + "\n";
      if (v.nextTopic) out += "- Наступна тема: " + v.nextTopic + "\n";
      out += block("Мета та ауткам заняття", v.aim) + block("Що було на занятті", v.rhighlights);
      out += "\n# Як побудувати\n" + reflCore(v);
      out += "- Три рівні обов'язково: емоції, «що нового?» (конкретне знання), «як застосувати?» (зв'язок із життям / наступним кроком).\n";
      out += "- Розклади по хвилинах, щоб вкластися рівно в " + (v.rtime || "5 хв") + "; кожен прийом — з точним текстом питання / незакінченого речення під цю тему.\n";
      out += "- Спосіб відповіді має підходити до формату «" + low(v.rchannel) + "» і " + low(v.mode) + " заняття; голос кожного учня має бути почутий, а не лише найактивніших.\n";
      if (v.rvariants) out += "- Дай 2–3 варіанти рефлексії на різних прийомах, щоб чергувати від заняття до заняття.\n";
      if (v.rscript) out += "- Репліки викладача: як перейти до рефлексії, як реагувати на «нічого не зрозумів» без осуду, як завершити (подяка + інтрига).\n";
      if (v.ranalysis) out += "- Наприкінці — «Як читати відповіді»: які сигнали можуть з'явитися (багато «мінусів» на одній ідеї, низькі сходинки, плутанина в термінах) і що змінити на наступному занятті.\n";
    } else {
      const n = v.rcount || 5;
      const prio = v.rprio && v.rprio.length ? v.rprio : ["Що запам'ятали й зрозуміли", "Емоції та формат занять"];
      out += "# Завдання\nСтвори підсумкову рефлексію-опитування на весь курс із " + n + " занять — серйозну, концентровану на учнях, на " + (v.rlen || "25 хв") + ", яка вміщується в презентацію. Мета: щоб учні усвідомили свій шлях за курс, а я отримала чесні й корисні дані.\n\n";
      out += "# Вихідні дані\n";
      out += "- Курс: " + (v.course ? "«" + v.course + "»" : "[назву не вказано]") + "; предмет: " + v.subject + "\n";
      out += "- Аудиторія: " + v.grade + (v.rsize ? ", " + v.rsize + " учнів" : "") + "; група: " + low(v.rmood) + "; " + low(v.mode) + "\n";
      out += "- Головна мета курсу: " + low(v.rgoal) + "\n- Як заповнюють: " + low(v.rfill) + "\n- Анонімність: " + low(v.ranon) + "\n";
      out += block("Теми занять і ключові моменти — посилайся на них конкретно", v.rlessons) + block("Ключові аутками курсу", v.coutcomes);
      if (!v.rlessons) out += "\n(Теми занять не вказано — запитай мене про них перед початком.)\n";
      out += "\n# Структура опитування\nПриблизно " + (v.rqcount || 25) + " питань, згрупованих у тематичні блоки; у кожному блоці — заголовок, мета блоку (для мене) і питання.\n";
      out += "1. **Старт** — 1 слайд: навіщо ця рефлексія, як відповідати, " + (v.ranon === "З іменами" ? "що відповіді бачитиму лише я" : "що відповіді анонімні") + "; налаштування на чесність («тут немає правильних відповідей»).\n";
      out += "2. **Місія курсу** — повернення до мети: що ми планували на початку і чи досягли цього.\n";
      out += "Далі блоки за моїми пріоритетами (перші — найглибші, з більшою кількістю питань):\n";
      const PB = {
        "Що запам'ятали й зрозуміли": "**Що я забираю** — по кожному з " + n + " занять: найяскравіше, що запам'ятав(ла)" + (v.rknow ? "; міні «згадай і поясни» (одне коротке питання на розуміння до кожного заняття, без оцінок)" : "") + "; самооцінка «Сходи успіху» по ключових ідеях курсу; ранжування тем від найзрозумілішої до найскладнішої",
        "Емоції та формат занять": "**Враження** — шкала / смайлики по кожному заняттю; що з форматів зайшло найбільше (досліди, симуляції, задачі, ігри, обговорення); «Плюс — мінус — цікаво» по курсу",
        "Ставлення до фізики й астрономії": "**Я і наука** — «до / після»: як змінилося ставлення до фізики й астрономії; чи бачу їх тепер у повсякденні; чи відчуваю себе дослідником",
        "Мій стиль викладання": "**Як мене навчали** — темп, зрозумілість пояснень, атмосфера, чи міг(могла) поставити питання; що викладачці залишити, а що змінити (анонімно, м'яко сформульовано)",
        "Продовження: чи хочуть і про що": "**Що далі** — чи хочу продовження; які теми / питання лишилися; що хочу дослідити сам(а)"
      };
      prio.forEach((p, i) => (out += (i + 3) + ". " + (PB[p] || p) + ".\n"));
      out += (prio.length + 3) + ". **Фінал** — творче завершення" + (v.rqtypes && v.rqtypes.includes("Творчі (курс як планета)") ? " («якби курс був планетою / зорею — якою?»)" : "") + ", одне речення-послання наступному потоку, подяка" + (v.rshow ? "; слайд зі спільними результатами (хмара слів, графік настрою по заняттях)" : "") + ".\n";
      out += "\n# Вимоги\n";
      out += "- Типи питань: " + list(v.rqtypes) + ". Чергуй типи, щоб учні не втомлювались; відкритих питань — не більше третини.\n";
      out += "- Тон: " + low(v.rtone) + ". Говори з учнями (" + v.grade + ") на рівних, без дитячого сюсюкання й без канцеляриту.\n";
      if (v.rtest) out += "- На цьому ж занятті є тест — зроби рефлексію легшою за тоном і темпом, без повторної перевірки знань.\n";
      out += "- Кожне питання конкретне: називай заняття, досліди й ідеї курсу, а не «чи сподобався курс?». Без навідних питань.\n";
      out += "- Біля кожного питання: тип, варіанти відповіді (для шкал — підписи крайніх значень), орієнтовний час.\n";
      out += "- Загальний таймінг — рівно " + (v.rlen || "25 хв") + ", з короткими перебивками-«вдихами» між блоками.\n";
      if (v.rscript) out += "- Репліки викладача: вступ, переходи між блоками, завершення.\n";
      if (v.ranalysis) out += "- Наприкінці — «Як аналізувати результати»: таблиця «Питання / блок | Що показує | Тривожний сигнал | Що змінити в курсі», з урахуванням цілей: " + list(v.rpurpose) + ".\n";
    }
    out += "\n# Формат відповіді\n" + reflFormat(v, lesson) + "\n";
    if (v.extra) out += "\n# Додаткові побажання\n" + v.extra + "\n";
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

    const sections = (cfg.base === false ? [] : BASE_SECTIONS).concat(cfg.sections);
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
      '<div class="tip"><b>Порада.</b> Скопіюй промпт і встав у новий чат асистента. Тема, «Місце в курсі» та «Зміст заняття» зберігаються — на інших сторінках вони вже будуть заповнені.</div>' +
      "</div></aside>" +
      '<a class="jump" href="#prompt" id="b-jump">Промпт ↓</a>';

    const form = document.getElementById("form");
    const pre = document.getElementById("prompt");
    const KEY_BASE = "kz-base", KEY_PAGE = "kz-" + page;

    writeForm(form, store.get(KEY_BASE));
    writeForm(form, store.get(KEY_PAGE));

    function syncVisibility(v) {
      form.querySelectorAll("[data-controls]").forEach(sw => {
        const box = document.getElementById(sw.dataset.controls);
        if (box) box.hidden = !sw.checked;
      });
      form.querySelectorAll(".cond").forEach(c => {
        const val = v[c.dataset.if];
        const show = c.dataset.on ? !!val : c.dataset.in.split("|").includes(val);
        c.hidden = !show;
      });
      // нумерація лише видимих блоків
      let n = 0;
      form.querySelectorAll(":scope > .panel").forEach(p => {
        const st = p.querySelector(".panel-title .step");
        if (!p.hidden && st) st.textContent = String(++n).padStart(2, "0");
      });
    }

    function update() {
      const v = readForm(form);
      syncVisibility(v);
      const base = {}, own = {};
      Object.keys(v).forEach(k => (BASE_NAMES.includes(k) ? (base[k] = v[k]) : (own[k] = v[k])));
      store.set(KEY_BASE, Object.assign(store.get(KEY_BASE) || {}, base));
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
    document.addEventListener("kz:template", update);

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
      const name = (page + "-" + (v.topic || v.ctopic || "zaniattia")).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
      const blob = new Blob([pre.textContent], { type: "text/plain;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = name + ".txt";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
    document.getElementById("b-reset").addEventListener("click", () => {
      if (!confirm("Очистити поля цієї сторінки? Спільна основа (тема, курс, зміст заняття) теж очиститься.")) return;
      store.del(KEY_BASE); store.del(KEY_PAGE);
      location.reload();
    });

    const jump = document.getElementById("b-jump");
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(es => es.forEach(e => (jump.style.visibility = e.isIntersecting ? "hidden" : "visible"))).observe(document.querySelector(".output"));
    }

    update();
  }

  document.addEventListener("DOMContentLoaded", () => {
    mountShell();
    mountBuilder();
    if (document.getElementById("builder")) loadTemplate();
  });

  window.KZ = { icon, store };
})();
