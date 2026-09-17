const FALLBACK_SITE_DATA = {
    settings: {
        portal_name: 'Компьютерная Инженерия',
        specialty: 'Компьютерная Инженерия',
        group_name: 'КИ-21',
        google_docs_url: 'https://docs.google.com/spreadsheets/d/1DXo_Kz-FPiFVTzYuLtD39iGJaU4rSoae/edit?usp=sharing&ouid=103262135116944635122&rtpof=true&sd=true',
        schedule_pdf_url: 'assets/schedule.pdf?v=3'
    },
    quickLinks: [
        { logo: 'https://cdn.simpleicons.org/googlesheets/34A853', title: 'Таблица пропусков', button_text: 'Открыть таблицу', description: 'Открыть таблицу пропусков группы.', href: 'schedule.html', is_external: false },
        { logo: 'https://cdn.simpleicons.org/zoom/2D8CFF', title: 'Zoom', button_text: 'Открыть Zoom', description: 'Ссылки на онлайн-занятия в Zoom.', href: 'zoom.html', is_external: false },
        { logo: 'https://cdn.simpleicons.org/googleclassroom/0F9D58', title: 'Google Classroom', button_text: 'Открыть Classroom', description: 'Онлайн-занятия и учебные материалы.', href: 'classroom.html', is_external: false },
        { logo: 'https://cdn.simpleicons.org/telegram/229ED9', title: 'Группа в Telegram', button_text: 'Открыть группу', description: 'Общение и важные объявления группы.', href: 'https://t.me/+4MD5h8O5blszYThi', is_external: true }
    ],
    resources: {
        zoom: [
            { name: 'Математика', teacher: 'Катериненко Инга Игоревна', description: 'Еженедельное онлайн-занятие.', url: 'https://us04web.zoom.us/j/8272667772?pwd=jaYbRtOfNTwK1zC-XyElsnZkszVKww' },
            { name: 'Английский язык', teacher: 'Безносюк Юлия Петровна', description: 'Онлайн-занятие по английскому языку.', url: 'https://us04web.zoom.us/j/75957798541?pwd=4bJlUuVBfA7Q5clG06oY4mQPyumdBd.1' }
        ],
        classroom: [
            { name: 'Компьютерная Графика', teacher: 'Мазур Анна Дмитровна', description: 'Задания и учебные материалы.', url: 'https://classroom.google.com/c/ODc3ODk4MTU5MzQ5?cjc=vqhchcfs' },
            { name: 'Офисные технологии', teacher: 'Вакарчук Анна Олександровна', description: 'Занятия, задания и объявления.', url: 'https://classroom.google.com/c/ODc4MTgyMzI2MTYz?cjc=aqzrop43' }
        ],
        telegram: [
            { name: 'Основная группа', description: 'Главная группа студентов.', url: 'https://t.me/+rBMRlx6CqB5kODgy' },
            { name: 'Новости специальности', description: 'Новости, объявления и важная информация.', url: '' }
        ]
    }
};

function isSupabaseConfigured() {
    return Boolean(window.supabase && window.SUPABASE_CONFIG
        && !window.SUPABASE_CONFIG.url.includes('YOUR_PROJECT')
        && !window.SUPABASE_CONFIG.anonKey.includes('YOUR_SUPABASE'));
}

function getSupabaseClient() {
    if (!isSupabaseConfigured()) return null;
    if (!window.portalSupabase) window.portalSupabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    return window.portalSupabase;
}

async function loadSiteData() {
    const client = getSupabaseClient();
    if (!client) return structuredClone(FALLBACK_SITE_DATA);

    const [settingsResult, linksResult, resourcesResult] = await Promise.all([
        client.from('site_settings').select('*').eq('id', 1).maybeSingle(),
        client.from('quick_links').select('*').eq('visible', true).order('sort_order'),
        client.from('resources').select('*').eq('visible', true).order('section').order('sort_order')
    ]);
    if (settingsResult.error || linksResult.error || resourcesResult.error) return structuredClone(FALLBACK_SITE_DATA);

    return {
        settings: settingsResult.data || FALLBACK_SITE_DATA.settings,
        quickLinks: linksResult.data || FALLBACK_SITE_DATA.quickLinks,
        resources: (resourcesResult.data || []).reduce((groups, item) => {
            (groups[item.section] ||= []).push(item);
            return groups;
        }, { zoom: [], classroom: [], telegram: [] })
    };
}

function subscribeToSiteChanges(onChange) {
    const client = getSupabaseClient();
    if (!client) return null;
    return client.channel('public-site-data')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, onChange)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'quick_links' }, onChange)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'resources' }, onChange)
        .subscribe();
}