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
    { id: "library", href: "library.html", label: "Бібліотека" }
  ];

  const AUTHOR = "Дарина Проволовська";
  const BRAND_STYLE =
    "мінімалістичний «матове скло» на темно-синьому фоні; палітра: #081F44 (фон), #143660, #1F3F74, #4569AD (акцент), #B9C8E6 (світлий акцент/текст); шрифти Manrope (заголовки) та Inter (текст), курсивні акценти Playfair Display; багато повітря, без перевантаження";

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
            { type: "select", name: "nformat", label: "Формат", options: ["Markdown (для освітнього простору)", "Інтерактивний HTML (KaTeX, перевір себе)", "Для друку A4", "Суцільний текст із заголовками"], value: "Markdown (для освітнього простору)" },
            { type: "switch", name: "nbrand", label: "Мій фірмовий стиль (для HTML)", value: true }
          ]
        },
        { title: "Перевірка знань", fields: TEST_FIELDS(false) },
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
        { title: "Побажання", fields: [EXTRA] }
      ],
      build: buildUniversal
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
      if (hasFinal) {
        out += "\nФінальне завдання (Заняття " + (n + 1) + "):\n\n";
        out += "* Формат: [" + v.cfinalfmt + "]\n";
        out += "* Хід завдання: [сценарій, легенда гри, ролі та таймінг]\n";
        out += "* Результат: [як саме учні продемонструють засвоєні за " + n + " занять навички]\n";
      }
    }

    if (wantDet) {
      out += "\n# Формат детальної структури\nДля кожного заняття:\n";
      out += "- Номер заняття\n- Назва заняття\n- Хід заняття (з таймінгом " + durEach + " і пропорцією теорія/практика)\n- Практика\n- Мета заняття\n- Ауткам заняття\n";
      const d = v.cdetail || [];
      if (d.includes("Вступний гачок")) out += "- Вступний гачок: 1–2 речення — цікавий факт, парадокс або статистика, що одразу захоплює увагу\n";
      if (d.includes("Ключові питання")) out += "- 3–4 ключові питання для наукової дискусії\n";
      if (d.includes("Вартісні пойнти")) out += "- Вартісні пойнти: на чому наголосити, які неочевидні висновки підсвітити\n";
      if (d.includes("Матеріали та симуляції")) out += "- Матеріали: конкретні симуляції (PhET, Stellarium, NASA Eyes), датасети, обладнання\n";
      if (d.includes("Питання для рефлексії")) out += "- Цінні думки та відкриті питання для рефлексії\n";
      out += "Наприкінці кожного заняття — одне речення-місток до наступного.\n";
      if (hasFinal) out += "\nЗаняття " + (n + 1) + " (" + low(v.cfinalfmt) + "): сценарій і розподіл ролей, хід із таймінгом, як кожна роль інтегрує конкретні заняття курсу, критерії оцінювання за аргументованістю позицій.\n";
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
    out += ++i + ". **Матеріали, ілюстрації та інструменти** — конкретні симуляції (PhET, Stellarium, NASA Eyes тощо), датасети, відео з назвами.\n";
    out += ++i + ". **Цінні думки та питання для рефлексії** — світоглядні або відкриті наукові питання, які варто залишити учням на подумати.\n";
    if (v.shw) out += ++i + ". **Домашнє завдання** — базове + за бажанням.\n";
    out += ++i + ". **Фінальне слово** — короткий підсумок і місток до наступної теми" + (v.nextTopic ? " («" + v.nextTopic.split("(")[0].trim() + "»)" : "") + ".\n";
    if (v.sblitz && +v.sbank > 0) out += ++i + ". **Банк бліц-питань** — " + v.sbank + " питань з відповідями, згрупованих за блоками заняття.\n";
    out += testPart(v);
    out += "\n# Формат відповіді\n";
    const f = v.sform || "";
    if (f.startsWith("Таблиці")) out += "Markdown з таблицями, щоб коректно вставлялося в Google Docs / Word. Без вступних слів перед сценарієм.\n";
    else if (f.startsWith("Документ HTML")) out += "Один самодостатній HTML-документ (таблиці, KaTeX для формул, коректний друк A4); стиль: " + BRAND_STYLE + ".\n";
    else out += "Звичайний текст із підзаголовками, таблиці замінені списками.\n";
    out += quality(v, ["Сума таймінгу — рівно " + v.duration + "; на кожне нове поняття — не менше 5 хв.", "Логіка від минулої теми до наступної простежується в усьому сценарії."]);
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
    if (v.nformat && v.nformat.includes("HTML") && v.nbrand) out += "- Візуальний стиль: " + BRAND_STYLE + ".\n";
    out += testPart(v);
    out += "\n# Формат відповіді\n" + notesFormat(v) + "\n";
    out += quality(v);
    return out;
  }

  function notesFormat(v) {
    const f = v.nformat || "";
    if (f.startsWith("Markdown")) return "Markdown з LaTeX-формулами, без вступних слів — одразу конспект.";
    if (f.startsWith("Інтерактивний")) return "Один самодостатній HTML-файл: KaTeX через CDN, розділи з розгортанням, блок «Перевір себе» з прихованими відповідями, схеми вбудованим SVG, коректний друк.";
    if (f.startsWith("Для друку")) return "HTML, оптимізований для друку на A4: поля, без зайвих заливок, формули KaTeX.";
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
    if (what.includes("Сценарій заняття")) out += ++n + ". Сценарій заняття: короткий опис (хід заняття | практика | ауткам), вступний гачок, опис та проблематика (5 питань), основні цілі (концептуальна / математична / фізична / світоглядна), обладнання, таблиця «Часові рамки | Хід думок | Вартісні пойнти» на " + v.duration + " з ⚡ бліц-питаннями після блоків і посиланнями на слайди (сл. N), питання для рефлексії, фінальне слово-місток" + (+v.sbank > 0 ? ", банк із " + v.sbank + " бліц-питань з відповідями" : "") + ".\n";
    if (what.includes("Презентація")) out += ++n + ". Презентація — " + (v.slides || 20) + " слайдів, мінімум тексту, максимум візуалізацій; послайдово «Слайд N: що зображено / теза» з нотатками доповідача; номери збігаються зі сценарієм.\n";
    if (what.includes("Конспект для учня")) out += ++n + ". Конспект для учня (Markdown, дружній тон): головна ідея, словничок 2–3 термінів простими словами, ключовий висновок, питання для самоперевірки.\n";
    if (what.includes("Теоретичний конспект для викладача")) out += ++n + ". Теоретичний конспект для викладача — чистий текст-оповідь як розділ науково-популярного підручника (~" + (v.nwords || 9000) + " слів): сторітелінг, історичний контекст, вставки 📌 «Запам'ятати», 🧭 «Довідка», 💡 «Цікавий факт»; без реплік, питань до аудиторії та інструкцій щодо проведення.\n";
    if (what.includes("Картки-питання")) out += ++n + ". Картки-питання — " + (v.ccount || 20) + " шт.: бліц, «чому?», парадокси, «що буде, якщо…», з короткими відповідями.\n";
    out += "\n# Формат\n- " + v.uformat + "\n";
    if (v.uformat && v.uformat.startsWith("HTML") && v.ubrand) out += "- Візуальний стиль: " + BRAND_STYLE + ".\n";
    if (v.uflow && v.uflow.startsWith("Поетапно")) out += "- Спершу покажи короткий план комплекту (5–10 рядків) і дочекайся мого «далі». Потім видавай по одному матеріалу за відповідь, у порядку списку.\n";
    else out += "- Видай усе однією відповіддю, кожен матеріал під окремим заголовком першого рівня.\n";
    out += testPart(v);
    if (v.test) out += "- Тест оформи окремим матеріалом комплекту.\n";
    out += quality(v, ["Матеріали не дублюють один одного дослівно: сценарій — для викладача, презентація — для показу, конспект — для учня."]);
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
  });

  window.KZ = { icon, store };
})();

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
    { id: "library", href: "library.html", label: "Бібліотека" }
  ];

  const AUTHOR = "Дарина Проволовська";
  const BRAND_STYLE =
    "строго мій фірмовий стиль, не змінюй його: темно-синій фон-градієнт #081F44 → #143660 → #1F3F74, акцент #4569AD, світлий акцент #B9C8E6, текст #EEF3FC; панелі «матове скло» (напівпрозорі, blur, тонка світла рамка, радіус 24px); шрифти Manrope (заголовки), Inter (текст), курсивні акценти Playfair Display; жодних інших кольорів, шрифтів і CSS-фреймворків";

  /* Замкнений шаблон HTML-документа (конспект, сценарій). ШІ копіює <style> дослівно і лише заповнює зміст. */
  const DOC_TEMPLATE = `<!doctype html>
<html lang="uk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>[Тема] · Конспект</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600;700&family=Playfair+Display:ital,wght@1,500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js" onload="renderMathInElement(document.body,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}]})"></script>
<style>
:root{--night:#081F44;--deep:#143660;--dive:#1F3F74;--sail:#4569AD;--lilac:#B9C8E6;--text:#EEF3FC;--soft:rgba(238,243,252,.74);--glass:rgba(185,200,230,.09);--line:rgba(214,226,248,.2)}
*{box-sizing:border-box}
body{margin:0;font:16px/1.65 Inter,system-ui,sans-serif;color:var(--text);background:radial-gradient(120% 80% at 80% 0%,var(--dive),var(--deep) 40%,var(--night) 80%) fixed var(--night)}
.page{max-width:820px;margin:0 auto;padding:48px 20px 64px}
.eyebrow{font:600 12px Manrope,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--lilac)}
h1,h2,h3{font-family:Manrope,sans-serif;letter-spacing:-.02em;line-height:1.15;margin:0}
h1{font-size:clamp(34px,6vw,54px);margin:10px 0 14px}
h1 em,.accent{font-family:"Playfair Display",Georgia,serif;font-style:italic;font-weight:500;color:var(--lilac)}
.lead{font-size:18px;color:var(--soft);margin:0 0 32px}
.card{background:var(--glass);border:1px solid var(--line);border-radius:24px;padding:26px;margin:0 0 20px;backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:0 10px 36px rgba(2,10,28,.35)}
.card h2{font-size:24px;margin-bottom:12px}
.card h2 .num{font-family:"Playfair Display",serif;font-style:italic;font-weight:500;color:var(--lilac);margin-right:10px}
.card h3{font-size:18px;margin:18px 0 8px}
p{margin:0 0 12px}
.formula{margin:16px 0;padding:16px 18px;border-radius:16px;background:rgba(4,15,36,.5);border:1px solid var(--line);overflow-x:auto;text-align:center}
.where{font-size:14px;color:var(--soft)}
.callout{margin:16px 0;padding:14px 16px 14px 46px;border-radius:16px;position:relative;border:1px solid var(--line);background:rgba(69,105,173,.18)}
.callout::before{position:absolute;left:14px;top:13px;font-size:18px}
.callout.remember::before{content:"📌"}
.callout.info::before{content:"🧭"}
.callout.fact::before{content:"💡"}
.callout.warn{background:rgba(185,200,230,.08)}
.callout.warn::before{content:"⚠️"}
.callout b:first-child{display:block;font-family:Manrope,sans-serif;margin-bottom:2px}
table{width:100%;border-collapse:collapse;margin:14px 0;font-size:15px}
th,td{padding:10px 12px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}
th{font:600 13px Manrope,sans-serif;color:var(--lilac);text-transform:uppercase;letter-spacing:.06em}
dl.terms{margin:0}dl.terms dt{font-weight:600;color:var(--lilac);margin-top:10px}dl.terms dd{margin:2px 0 0}
details{margin:10px 0;border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,.04)}
summary{cursor:pointer;padding:12px 16px;font-weight:600;list-style:none}
summary::-webkit-details-marker{display:none}
summary::after{content:"＋";float:right;color:var(--lilac)}
details[open] summary::after{content:"－"}
details>div{padding:0 16px 14px;color:var(--soft)}
.gap{display:inline-block;min-width:90px;border-bottom:2px dashed var(--lilac)}
svg{max-width:100%;height:auto}
footer{margin-top:36px;font-size:13px;color:rgba(238,243,252,.5);text-align:center}
@media (max-width:600px){.page{padding:32px 16px 48px}.card{padding:20px 16px;border-radius:20px}}
@media print{body{background:#fff;color:#081F44}.card{box-shadow:none;backdrop-filter:none;background:#fff;border-color:#B9C8E6;break-inside:avoid}h1 em,.accent,.eyebrow,th,dl.terms dt,.card h2 .num{color:#4569AD}.lead,.where,details>div{color:#143660}.formula{background:#F2F5FB}}
</style>
</head>
<body>
<main class="page">
<span class="eyebrow">[Предмет · Клас]</span>
<h1>[Тема] <em>[2–3 слова-акцент]</em></h1>
<p class="lead">[Головна ідея одним реченням]</p>
<section class="card"><h2><span class="num">01</span>[Назва розділу]</h2>
  [зміст розділу]
</section>
<footer>© Дарина Проволовська · [поточний рік]</footer>
</main>
</body>
</html>`;

  function styleLock() {
    return "\n# ФІРМОВИЙ СТИЛЬ — СТРОГО, НЕ ЗМІНЮВАТИ\n" +
      "Оформи результат як ОДИН HTML-файл строго за шаблоном нижче.\n" +
      "- Блок <head> і весь <style> скопіюй ДОСЛІВНО, символ у символ. ЗАБОРОНЕНО змінювати, додавати чи видаляти будь-які CSS-правила, кольори, шрифти, розміри, відступи.\n" +
      "- ЗАБОРОНЕНО: атрибут style=\"\", власні класи, інші шрифти, CSS-фреймворки (Tailwind, Bootstrap), інші бібліотеки, крім KaTeX із шаблону, зовнішні зображення.\n" +
      "- Міняй лише текст у квадратних дужках і вміст <main>, використовуючи ТІЛЬКИ ці компоненти:\n" +
      "  • розділ: <section class=\"card\"><h2><span class=\"num\">01</span>Назва</h2>…</section> (номери 01, 02, 03…)\n" +
      "  • підзаголовок: <h3>; текст: <p>, <ul>, <ol>, <strong>, <em>\n" +
      "  • формула: <div class=\"formula\">$$…$$</div>, одразу під нею <p class=\"where\">де … — … (одиниця СІ)</p>; формули в тексті — $…$\n" +
      "  • вставки: <div class=\"callout remember\"><b>Запам'ятай</b>…</div>, <div class=\"callout info\"><b>Довідка</b>…</div>, <div class=\"callout fact\"><b>Цікавий факт</b>…</div>, <div class=\"callout warn\"><b>Типова помилка</b>…</div>\n" +
      "  • таблиця: звичайна <table> з <th>\n" +
      "  • словничок: <dl class=\"terms\"><dt>Термін</dt><dd>Пояснення простими словами</dd></dl>\n" +
      "  • «Перевір себе»: <details><summary>Питання</summary><div>Відповідь</div></details>\n" +
      "  • пропуск для заповнення: <span class=\"gap\"></span>\n" +
      "  • схема: вбудований <svg> без фону, лише кольори #B9C8E6, #4569AD, #EEF3FC, підписи шрифтом Inter\n" +
      "- Якщо для елемента немає компонента — використай звичайний тег без стилів. Дизайн не обговорюй і не «покращуй».\n" +
      "- Віддай лише код HTML в одному блоці, без пояснень до і після.\n\n" +
      "```html\n" + DOC_TEMPLATE + "\n```\n";
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
        { title: "Побажання", fields: [EXTRA] }
      ],
      build: buildUniversal
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
      if (hasFinal) {
        out += "\nФінальне завдання (Заняття " + (n + 1) + "):\n\n";
        out += "* Формат: [" + v.cfinalfmt + "]\n";
        out += "* Хід завдання: [сценарій, легенда гри, ролі та таймінг]\n";
        out += "* Результат: [як саме учні продемонструють засвоєні за " + n + " занять навички]\n";
      }
    }

    if (wantDet) {
      out += "\n# Формат детальної структури\nДля кожного заняття:\n";
      out += "- Номер заняття\n- Назва заняття\n- Хід заняття (з таймінгом " + durEach + " і пропорцією теорія/практика)\n- Практика\n- Мета заняття\n- Ауткам заняття\n";
      const d = v.cdetail || [];
      if (d.includes("Вступний гачок")) out += "- Вступний гачок: 1–2 речення — цікавий факт, парадокс або статистика, що одразу захоплює увагу\n";
      if (d.includes("Ключові питання")) out += "- 3–4 ключові питання для наукової дискусії\n";
      if (d.includes("Вартісні пойнти")) out += "- Вартісні пойнти: на чому наголосити, які неочевидні висновки підсвітити\n";
      if (d.includes("Матеріали та симуляції")) out += "- Матеріали: конкретні симуляції (PhET, Stellarium, NASA Eyes), датасети, обладнання\n";
      if (d.includes("Питання для рефлексії")) out += "- Цінні думки та відкриті питання для рефлексії\n";
      out += "Наприкінці кожного заняття — одне речення-місток до наступного.\n";
      if (hasFinal) out += "\nЗаняття " + (n + 1) + " (" + low(v.cfinalfmt) + "): сценарій і розподіл ролей, хід із таймінгом, як кожна роль інтегрує конкретні заняття курсу, критерії оцінювання за аргументованістю позицій.\n";
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
    if (html) out += "- Блок «Перевір себе» — питання з прихованими відповідями; ключові терміни — у словничку; кожна формула — з поясненням величин.\n";
    out += testPart(v);
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
    if (what.includes("Сценарій заняття")) out += ++n + ". Сценарій заняття: короткий опис (хід заняття | практика | ауткам), вступний гачок, опис та проблематика (5 питань), основні цілі (концептуальна / математична / фізична / світоглядна), обладнання, таблиця «Часові рамки | Хід думок | Вартісні пойнти» на " + v.duration + " з ⚡ бліц-питаннями після блоків і посиланнями на слайди (сл. N), питання для рефлексії, фінальне слово-місток" + (+v.sbank > 0 ? ", банк із " + v.sbank + " бліц-питань з відповідями" : "") + ".\n";
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
    out += quality(v, ["Матеріали не дублюють один одного дослівно: сценарій — для викладача, презентація — для показу, конспект — для учня."]);
    if (uhtml) out += styleLock();
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
  });

  window.KZ = { icon, store };
})();

/* ---------- кнопка «Вгору» ---------- */
.totop {
  position: fixed; right: 18px; bottom: 18px; z-index: 40;
  width: 48px; height: 48px; border-radius: 50%;
  display: grid; place-items: center;
  border: 1px solid var(--glass-border);
  background: rgba(8, 31, 68, .7); color: var(--text);
  -webkit-backdrop-filter: var(--blur); backdrop-filter: var(--blur);
  font: 700 20px var(--f-display); cursor: pointer;
  box-shadow: 0 10px 28px rgba(2, 10, 28, .45);
  opacity: 0; pointer-events: none; transform: translateY(10px);
  transition: opacity .25s, transform .25s, background .2s;
}
.totop.show { opacity: 1; pointer-events: auto; transform: none; }
.totop:hover { background: var(--sailing); }
.totop:focus-visible { outline: 3px solid var(--lilac); outline-offset: 3px; }
@media (max-width: 980px) { .jump { right: 76px; } }
