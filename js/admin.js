const loginView = document.getElementById('login-view');
const dashboardView = document.getElementById('dashboard-view');
const loginMessage = document.getElementById('login-message');
const dashboardMessage = document.getElementById('dashboard-message');
const client = getSupabaseClient();
let settings = null;

document.addEventListener('DOMContentLoaded', initializeAdmin);

async function initializeAdmin() {
    if (!client) {
        showMessage(loginMessage, 'Сначала укажите URL и anon key Supabase в js/supabase-config.js.', true);
        document.querySelector('#login-form button').disabled = true;
        return;
    }

    document.getElementById('login-form').addEventListener('submit', signIn);
    document.getElementById('logout-button').addEventListener('click', signOut);
    document.getElementById('settings-form').addEventListener('submit', saveSettings);
    document.getElementById('quick-link-form').addEventListener('submit', addQuickLink);
    document.getElementById('resource-form').addEventListener('submit', addResource);
    document.getElementById('schedule-file').addEventListener('change', uploadSchedule);

    const { data: { session } } = await client.auth.getSession();
    if (session) await openDashboard(session);
}

async function signIn(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    showMessage(loginMessage, 'Проверяем доступ...');
    const { data, error } = await client.auth.signInWithPassword({ email: form.get('email'), password: form.get('password') });
    if (error) return showMessage(loginMessage, error.message, true);
    await openDashboard(data.session);
}

async function openDashboard(session) {
    const { data: admin, error } = await client.from('admin_users').select('user_id').eq('user_id', session.user.id).maybeSingle();
    if (error || !admin) {
        await client.auth.signOut();
        return showMessage(loginMessage, 'У этой учётной записи нет прав администратора.', true);
    }
    loginView.hidden = true;
    dashboardView.hidden = false;
    document.getElementById('admin-email').textContent = session.user.email;
    await refreshDashboard();
}

async function signOut() {
    await client.auth.signOut();
    dashboardView.hidden = true;
    loginView.hidden = false;
}

async function refreshDashboard() {
    const [settingsResult, linksResult, resourcesResult] = await Promise.all([
        client.from('site_settings').select('*').eq('id', 1).single(),
        client.from('quick_links').select('*').order('sort_order'),
        client.from('resources').select('*').order('section').order('sort_order')
    ]);
    if (settingsResult.error || linksResult.error || resourcesResult.error) return showMessage(dashboardMessage, 'Не удалось загрузить данные панели.', true);
    settings = settingsResult.data;
    fillSettingsForm(settings);
    renderQuickLinksAdmin(linksResult.data || []);
    renderResourcesAdmin(resourcesResult.data || []);
}

function fillSettingsForm(data) {
    const form = document.getElementById('settings-form');
    Object.entries({ portal_name: data.portal_name, specialty: data.specialty, group_name: data.group_name, google_docs_url: data.google_docs_url, schedule_pdf_url: data.schedule_pdf_url }).forEach(([name, value]) => { form.elements[name].value = value || ''; });
}

async function saveSettings(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const { error } = await client.from('site_settings').update({ portal_name: form.get('portal_name'), specialty: form.get('specialty'), group_name: form.get('group_name'), google_docs_url: form.get('google_docs_url'), schedule_pdf_url: form.get('schedule_pdf_url'), updated_at: new Date().toISOString() }).eq('id', 1);
    showMessage(dashboardMessage, error ? error.message : 'Настройки сохранены.', Boolean(error));
}

async function uploadSchedule(event) {
    const file = event.target.files[0];
    if (!file) return;
    const fileName = `schedule-${Date.now()}.pdf`;
    const { error: uploadError } = await client.storage.from('schedule-pdfs').upload(fileName, file, { contentType: 'application/pdf', upsert: false });
    if (uploadError) return showMessage(dashboardMessage, uploadError.message, true);
    const { data } = client.storage.from('schedule-pdfs').getPublicUrl(fileName);
    document.querySelector('#settings-form [name="schedule_pdf_url"]').value = data.publicUrl;
    showMessage(dashboardMessage, 'PDF загружен. Нажмите «Сохранить настройки», чтобы опубликовать его.');
}

async function addQuickLink(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const { error } = await client.from('quick_links').insert({ title: form.get('title'), description: form.get('description'), button_text: form.get('button_text'), href: form.get('href'), logo: form.get('logo'), is_external: isExternalUrl(form.get('href')) });
    if (error) return showMessage(dashboardMessage, error.message, true);
    event.currentTarget.reset();
    await refreshDashboard();
    showMessage(dashboardMessage, 'Ссылка добавлена.');
}

async function addResource(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const { error } = await client.from('resources').insert({ section: form.get('section'), name: form.get('name'), teacher: form.get('teacher'), description: form.get('description'), url: form.get('url') });
    if (error) return showMessage(dashboardMessage, error.message, true);
    event.currentTarget.reset();
    await refreshDashboard();
    showMessage(dashboardMessage, 'Ресурс добавлен.');
}

function renderQuickLinksAdmin(items) {
    document.getElementById('quick-links-list').innerHTML = items.map((item) => `<div class="admin-list-item"><div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.href)}</small></div><button class="button" type="button" data-delete-link="${item.id}">Удалить</button></div>`).join('') || '<p class="admin-muted">Ссылок пока нет.</p>';
    document.querySelectorAll('[data-delete-link]').forEach((button) => button.addEventListener('click', () => deleteRecord('quick_links', button.dataset.deleteLink)));
}

function renderResourcesAdmin(items) {
    document.getElementById('resources-list').innerHTML = items.map((item) => `<div class="admin-list-item"><div><strong>${escapeHtml(item.name)} <small>(${escapeHtml(item.section)})</small></strong><small>${escapeHtml(item.url || 'Ссылка не добавлена')}</small></div><button class="button" type="button" data-delete-resource="${item.id}">Удалить</button></div>`).join('') || '<p class="admin-muted">Ресурсов пока нет.</p>';
    document.querySelectorAll('[data-delete-resource]').forEach((button) => button.addEventListener('click', () => deleteRecord('resources', button.dataset.deleteResource)));
}

async function deleteRecord(table, id) {
    if (!window.confirm('Удалить эту запись?')) return;
    const { error } = await client.from(table).delete().eq('id', id);
    if (error) return showMessage(dashboardMessage, error.message, true);
    await refreshDashboard();
    showMessage(dashboardMessage, 'Запись удалена.');
}

function isExternalUrl(url) { return /^https?:\/\//i.test(url); }
function escapeHtml(value) { return String(value || '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[character])); }
function showMessage(element, message, isError = false) { element.textContent = message; element.classList.toggle('error', isError); }