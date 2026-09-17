// Добавляйте занятия Zoom здесь.
window.zoomLessons = [
    { name: 'Математика', teacher: 'Катериненко Инга Игоревна', description: 'Еженедельное онлайн-занятие.', url: 'https://us04web.zoom.us/j/8272667772?pwd=jaYbRtOfNTwK1zC-XyElsnZkszVKww' },
    { name: 'Английский язык', teacher: 'Безносюк Юлия Петровна', description: 'Онлайн-занятие по английскому языку.', url: 'https://us04web.zoom.us/j/75957798541?pwd=4bJlUuVBfA7Q5clG06oY4mQPyumdBd.1' },
    { name: 'Украинский язык/Украинская Литература', teacher: 'Нетребенко Анжела Николаевна', description: 'Онлайн-занятие по украинскому языку и украинской литературе.', url: 'https://us04web.zoom.us/j/2885398311?pwd=a3dxcjhwT3dvMjF3SjlrRjl3Q2tIZz09' },
    { name: 'Офисные Технологии', teacher: 'Вакарчук Анна Олександровна', description: 'Еженедельное онлайн-занятие по офисным технологиям.', url: 'https://us04web.zoom.us/j/2885398311?pwd=a3dxcjhwT3dvMjF3SjlrRjl3Q2tIZz09' },
    { name: 'Компьютерная Графика', teacher: 'Мазур Анна Дмитровна', description: 'Еженедельное онлайн-занятие по компьютерной графике.', url: 'https://zoom.us/j/4081880500?pwd=dG80OFhlNUloRmRMR25mdEFpeHB3UT09' },
    { name: 'История Украины', teacher: 'Плотницькая-Корпичникова Ангела Олександровна', description: 'Еженедельное онлайн-занятие по истории Украины.', url: 'https://us05web.zoom.us/j/5643438708?pwd=bW1YOGM2V1NtNjdZTTNQdi8rODlXdz09' },
    { name: 'Вступ по специальности', teacher: 'Лысенко Наталия Олексеевна ', description: 'Еженедельное онлайн-занятие по вступу по специальности.', url: 'https://us05web.zoom.us/j/9410786043?pwd=dFFSQlZPTG91b2VkUUZLN24xOXpRZz09' },
    { name: 'Физика', teacher: 'Лэсников Виктор Петрович', description: 'Еженедельное онлайн-занятие по физике.', url: 'https://us05web.zoom.us/j/9410786043?pwd=dFFSQlZPTG91b2VkUUZLN24xOXpRZz09' }
];

if (typeof renderResources === 'function' && document.getElementById('zoom-list')) {
    renderResources('zoom-list', window.zoomLessons, 'Zoom', 'Открыть Zoom', 'Ссылки Zoom пока не добавлены.');
}
