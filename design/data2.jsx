// ===== Mock data for cabinet, admin, news, knowledge =====

const APPLICATIONS = [
  { id: 'QA-2026-001847', service: 'damu-msb',     date: '24 апр. 2026', sum: '120 000 000 ₸', status: 'review',  step: 2 },
  { id: 'QA-2026-001712', service: 'kazex-prefin', date: '18 апр. 2026', sum: '85 000 000 ₸',  status: 'docs',    step: 1 },
  { id: 'QA-2026-001568', service: 'guarantee-50', date: '12 апр. 2026', sum: '50 000 000 ₸',  status: 'approved',step: 4 },
  { id: 'QA-2026-001401', service: 'agrokap-tech', date: '02 апр. 2026', sum: '30 000 000 ₸',  status: 'rejected',step: 3 },
  { id: 'QA-2026-001102', service: 'damu-start',   date: '15 мар. 2026', sum: '15 000 000 ₸',  status: 'approved',step: 4 },
  { id: 'QA-2026-000987', service: 'inno-grant',   date: '02 мар. 2026', sum: '40 000 000 ₸',  status: 'review',  step: 2 },
];

const STATUS_META = {
  review:   { label: 'На рассмотрении',      cls: 'badge-blue' },
  docs:     { label: 'Требуются документы',  cls: 'badge-amber' },
  approved: { label: 'Одобрено',             cls: 'badge-green' },
  rejected: { label: 'Отклонено',            cls: 'badge-red' },
  draft:    { label: 'Черновик',             cls: 'badge-gray' },
};

const NOTIFICATIONS = [
  { id: 1, time: '2 ч назад',  title: 'Заявка QA-2026-001568 одобрена',           kind: 'success', read: false },
  { id: 2, time: '5 ч назад',  title: 'Требуются дополнительные документы',        kind: 'warn',    read: false },
  { id: 3, time: 'Вчера',      title: 'Запущен новый раунд грантов «ИнноФонд»',     kind: 'info',    read: true },
  { id: 4, time: '24 апр.',    title: 'Заявка QA-2026-001847 принята к рассмотрению', kind: 'info', read: true },
];

const KB_CATEGORIES = [
  { id: 'start',  title: 'С чего начать',         count: 8,  icon: 'Sparkle' },
  { id: 'apply',  title: 'Подача заявки',         count: 12, icon: 'Document' },
  { id: 'docs',   title: 'Документы',             count: 9,  icon: 'Briefcase' },
  { id: 'edit',   title: 'ЭЦП и eGov',           count: 6,  icon: 'Shield' },
  { id: 'fin',    title: 'Финансирование',        count: 14, icon: 'Coins' },
  { id: 'faq',    title: 'Часто задаваемые',      count: 23, icon: 'Info' },
];

const KB_ARTICLES = [
  { id: 'a1', cat: 'start', title: 'Как зарегистрироваться на портале Qolday AI', read: '3 мин', date: '20 апр. 2026' },
  { id: 'a2', cat: 'apply', title: 'Пошаговая инструкция по подаче заявки на финансирование', read: '7 мин', date: '18 апр. 2026' },
  { id: 'a3', cat: 'edit',  title: 'Установка и настройка NCALayer для подписания ЭЦП', read: '5 мин', date: '14 апр. 2026' },
  { id: 'a4', cat: 'docs',  title: 'Какие документы нужны для подачи заявки на кредит', read: '4 мин', date: '12 апр. 2026' },
  { id: 'a5', cat: 'fin',   title: 'Различия между льготным и коммерческим финансированием', read: '6 мин', date: '08 апр. 2026' },
  { id: 'a6', cat: 'faq',   title: 'Что делать, если заявка отклонена', read: '4 мин', date: '02 апр. 2026' },
  { id: 'a7', cat: 'start', title: 'Как выбрать подходящую программу поддержки', read: '5 мин', date: '28 мар. 2026' },
  { id: 'a8', cat: 'apply', title: 'Сроки рассмотрения заявок и как их отслеживать', read: '3 мин', date: '22 мар. 2026' },
];

const NEWS_FULL = [
  { id: 1, org: 'demeu',   date: '24 апр. 2026', title: 'Снижена ставка по программе «Demeu Old» до 9% годовых', tag: 'Программы', readTime: '3 мин', featured: true,
    excerpt: 'С 1 мая 2026 года вступают в силу обновлённые условия льготного финансирования малого и среднего бизнеса.' },
  { id: 2, org: 'kazex',   date: '22 апр. 2026', title: 'KazExport открыл представительство в Ташкенте', tag: 'Новости', readTime: '2 мин',
    excerpt: 'Новый офис будет работать с экспортёрами текстиля, продовольствия и машиностроения.' },
  { id: 3, org: 'innofnd', date: '18 апр. 2026', title: 'Запущен новый раунд грантов для tech-стартапов', tag: 'Гранты', readTime: '4 мин',
    excerpt: 'Подача заявок открыта до 30 июня 2026. Гранты до 50 млн тенге для проектов в области ИТ и биотех.' },
  { id: 4, org: 'astana',  date: '15 апр. 2026', title: 'Astana Capital Bank снизил минимальный порог инвестиций', tag: 'Инвестиции', readTime: '3 мин',
    excerpt: 'Минимальный размер инвестиционного раунда снижен до 200 млн тенге.' },
  { id: 5, org: 'agrokap', date: '11 апр. 2026', title: 'Новые условия лизинга сельхозтехники в АПК', tag: 'Агросектор', readTime: '5 мин',
    excerpt: 'Аванс снижен с 20% до 15%, добавлены сезонные графики платежей.' },
  { id: 6, org: 'guarant', date: '08 апр. 2026', title: 'Расширены отрасли для гарантирования кредитов', tag: 'Гарантии', readTime: '3 мин',
    excerpt: 'В программу включены креативные индустрии, образование и здравоохранение.' },
  { id: 7, org: 'demeu',   date: '04 апр. 2026', title: 'Программа «Старт» доступна в новых регионах', tag: 'Программы', readTime: '2 мин',
    excerpt: 'Участие в программе расширилось на Туркестанскую и Западно-Казахстанскую области.' },
];

const ADMIN_STATS = [
  { label: 'Всего заявок',      value: '12 487', delta: '+8.2%', trend: 'up' },
  { label: 'На рассмотрении',   value: '342',    delta: '+15',   trend: 'up' },
  { label: 'Одобрено за месяц', value: '1 856',  delta: '+12.4%',trend: 'up' },
  { label: 'Активных пользователей', value: '8 234', delta: '−2.1%', trend: 'down' },
];

const ADMIN_CHART_DAYS = [
  { d: '01', v: 32 }, { d: '04', v: 41 }, { d: '07', v: 38 }, { d: '10', v: 52 },
  { d: '13', v: 49 }, { d: '16', v: 65 }, { d: '19', v: 71 }, { d: '22', v: 58 },
  { d: '25', v: 84 }, { d: '28', v: 79 },
];

const CONTACTS_ORGS = MOCK.ORGS.map((o, i) => ({
  ...o,
  phone: `+7 (7172) ${70 + i}-${10 + i * 7}-${20 + i * 3}`,
  email: `info@${o.id}.kz`,
  address: ['пр. Мангилик Ел, 55А', 'ул. Достык, 18', 'пр. Кабанбай батыра, 11', 'ул. Сыганак, 70', 'пр. Туран, 24', 'ул. Орынбор, 8'][i],
  hours: 'Пн–Пт, 09:00–18:00',
}));

window.MOCK2 = { APPLICATIONS, STATUS_META, NOTIFICATIONS, KB_CATEGORIES, KB_ARTICLES, NEWS_FULL, ADMIN_STATS, ADMIN_CHART_DAYS, CONTACTS_ORGS };
