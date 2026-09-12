const PORTAL_CONFIG = {
    portalName: 'Компьютерная Инженерия',
    specialty: 'Компьютерная Инженерия',
    group: 'КИ-21',
    // Вставьте сюда ссылку Google Docs с доступом "Все, у кого есть ссылка — читатель".
    googleDocsUrl: 'https://docs.google.com/spreadsheets/d/1DXo_Kz-FPiFVTzYuLtD39iGJaU4rSoae/edit?usp=sharing&ouid=103262135116944635122&rtpof=true&sd=true'
};

const quickLinks = [
    { logo: 'https://cdn.simpleicons.org/googlesheets/34A853', title: 'Таблица пропусков', button: 'Открыть таблицу', description: 'Открыть таблицу пропусков группы.', href: 'schedule.html' },
    { logo: 'https://cdn.simpleicons.org/zoom/2D8CFF', title: 'Zoom', button: 'Открыть Zoom', description: 'Ссылки на онлайн-занятия в Zoom.', href: 'zoom.html' },
    { logo: 'https://cdn.simpleicons.org/googleclassroom/0F9D58', title: 'Google Classroom', button: 'Открыть Classroom', description: 'Онлайн-занятия и учебные материалы.', href: 'classroom.html' }
];

document.body.classList.add('page-loading');

document.addEventListener('DOMContentLoaded', () => {
    preparePageTransitions();

    document.querySelectorAll('[data-portal-name]').forEach((element) => element.textContent = PORTAL_CONFIG.portalName);
    document.querySelectorAll('[data-specialty]').forEach((element) => element.textContent = PORTAL_CONFIG.specialty);
    document.querySelectorAll('[data-group]').forEach((element) => element.textContent = PORTAL_CONFIG.group);

    const activePage = document.body.dataset.page;
    const activeLink = document.querySelector(`[data-nav="${activePage}"]`);
    if (activeLink) activeLink.classList.add('active');

    const menuButton = document.querySelector('.menu-toggle');
    const navigation = document.querySelector('.site-nav');
    if (menuButton && navigation) {
        menuButton.addEventListener('click', () => {
            const isOpen = navigation.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', String(isOpen));
        });
        navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
            navigation.classList.remove('open');
            menuButton.setAttribute('aria-expanded', 'false');
        }));
    }

    document.querySelectorAll('[data-google-docs-link]').forEach((link) => {
        if (PORTAL_CONFIG.googleDocsUrl === 'YOUR_GOOGLE_DOCS_URL') {
            link.addEventListener('click', (event) => event.preventDefault());
            link.classList.add('disabled-link');
            link.setAttribute('aria-disabled', 'true');
        } else {
            link.href = PORTAL_CONFIG.googleDocsUrl;
        }
    });

    if (activePage === 'schedule') setupDocsViewer();
    if (activePage === 'home') renderQuickLinks();

    requestAnimationFrame(() => {
        document.body.classList.remove('page-loading');
        document.body.classList.add('page-ready');
    });
});

function preparePageTransitions() {
    const transition = document.createElement('div');
    transition.className = 'route-transition';
    transition.setAttribute('aria-hidden', 'true');
    document.body.appendChild(transition);

    document.querySelectorAll('a[href]').forEach((link) => {
        link.addEventListener('click', (event) => {
            if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            if (link.target === '_blank' || link.hasAttribute('download')) return;

            const nextUrl = new URL(link.href, window.location.href);
            const isInternalPage = nextUrl.origin === window.location.origin && /\.html$/.test(nextUrl.pathname);
            if (!isInternalPage || nextUrl.href === window.location.href) return;

            event.preventDefault();
            transition.classList.add('is-active');
            document.body.classList.add('page-exiting');

            window.setTimeout(() => {
                window.location.href = nextUrl.href;
            }, 320);
        });
    });
}

function renderQuickLinks() {
    const container = document.getElementById('quick-links');
    if (!container) return;
    container.innerHTML = quickLinks.map((link) => `
        <article class="quick-card fade-in">
            <span class="card-icon"><img class="card-logo" src="${link.logo}" alt="Логотип ${link.title}"></span>
            <h3>${link.title}</h3>
            <p>${link.description}</p>
            <a class="button" href="${link.href}">${link.button}</a>
        </article>
    `).join('');
}

function setupDocsViewer() {
    const frame = document.getElementById('docs-frame');
    const fallback = document.getElementById('docs-fallback');
    if (!frame || !fallback || PORTAL_CONFIG.googleDocsUrl === 'YOUR_GOOGLE_DOCS_URL') {
        if (frame) frame.hidden = true;
        fallback.hidden = false;
        return;
    }

    frame.src = getDocsPreviewUrl(PORTAL_CONFIG.googleDocsUrl);
    frame.addEventListener('error', () => {
        frame.hidden = true;
        fallback.hidden = false;
    });
}

function getDocsPreviewUrl(url) {
    if (url.includes('/edit')) {
        return url.replace(/\/edit[^/]*/, '/preview');
    }

    return url;
}

function renderResources(containerId, items, sectionName, buttonText, emptyMessage) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (items.length === 0) {
        container.innerHTML = `<p class="empty-state">${emptyMessage}</p>`;
        return;
    }

    container.innerHTML = items.map((item) => {
        const link = item.url
            ? `<a class="button button-primary" href="${item.url}" target="_blank" rel="noopener noreferrer">${buttonText}</a>`
            : '<span class="details-note">Ссылка пока не добавлена.</span>';

        return `
            <article class="resource-card fade-in">
                <span class="card-icon"><img class="card-logo" src="${getResourceLogo(sectionName)}" alt="Логотип ${sectionName}"></span>
                <h2>${item.name}</h2>
                ${item.teacher ? `<p class="meta">${item.teacher}</p>` : ''}
                <p>${item.description || ''}</p>
                ${link}
            </article>
        `;
    }).join('');
}

function getResourceLogo(sectionName) {
    if (sectionName === 'Zoom') return 'https://cdn.simpleicons.org/zoom/2D8CFF';
    if (sectionName === 'Google Classroom') return 'https://cdn.simpleicons.org/googleclassroom/0F9D58';
    return 'https://cdn.simpleicons.org/telegram/229ED9';
}
