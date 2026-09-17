document.body.classList.add('page-loading');

document.addEventListener('DOMContentLoaded', async () => {
    const siteData = await loadSiteData();
    const settings = siteData.settings;
    preparePageTransitions();

    document.querySelectorAll('[data-portal-name]').forEach((element) => element.textContent = settings.portal_name);
    document.querySelectorAll('[data-specialty]').forEach((element) => element.textContent = settings.specialty);
    document.querySelectorAll('[data-group]').forEach((element) => element.textContent = settings.group_name);

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
        if (!settings.google_docs_url) {
            link.addEventListener('click', (event) => event.preventDefault());
            link.classList.add('disabled-link');
            link.setAttribute('aria-disabled', 'true');
        } else {
            link.href = settings.google_docs_url;
        }
    });

    if (activePage === 'schedule') setupDocsViewer(settings.google_docs_url);
    if (activePage === 'home') {
        renderQuickLinks(siteData.quickLinks);
        const scheduleUrl = settings.schedule_pdf_url || 'assets/schedule.pdf?v=3';
        document.getElementById('schedule-frame').src = scheduleUrl;
        document.getElementById('schedule-open-link').href = scheduleUrl;
        document.getElementById('schedule-download-link').href = scheduleUrl;
    }
    if (activePage === 'zoom') renderResources('zoom-list', siteData.resources.zoom, 'Zoom', 'Открыть Zoom', 'Ссылки Zoom пока не добавлены.');
    if (activePage === 'classroom') renderResources('classroom-list', siteData.resources.classroom, 'Google Classroom', 'Открыть Classroom', 'Ссылки Classroom пока не добавлены.');
    if (activePage === 'telegram') renderResources('telegram-list', siteData.resources.telegram, 'Telegram', 'Открыть Телеграмм', 'Ссылки Telegram пока не добавлены.');

    subscribeToSiteChanges(() => {
        window.clearTimeout(window.siteReloadTimer);
        window.siteReloadTimer = window.setTimeout(() => window.location.reload(), 450);
    });

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

function renderQuickLinks(quickLinks) {
    const container = document.getElementById('quick-links');
    if (!container) return;
    container.innerHTML = quickLinks.map((link) => `
        <article class="quick-card fade-in">
            <span class="card-icon"><img class="card-logo" src="${link.logo}" alt="Логотип ${link.title}"></span>
            <h3>${link.title}</h3>
            <p>${link.description}</p>
            <a class="button" href="${link.href}"${link.is_external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${link.button_text}</a>
        </article>
    `).join('');
}

function setupDocsViewer(googleDocsUrl) {
    const frame = document.getElementById('docs-frame');
    const fallback = document.getElementById('docs-fallback');
    if (!frame || !fallback || !googleDocsUrl) {
        if (frame) frame.hidden = true;
        fallback.hidden = false;
        return;
    }

    frame.src = getDocsPreviewUrl(googleDocsUrl);
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
