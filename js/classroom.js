// Добавляйте классы Google Classroom здесь.
const classroomLessons = [
    { name: 'Компьютерная Графика', teacher: 'Мазур Анна Дмитровна', description: 'Задания и учебные материалы.', url: 'https://classroom.google.com/c/ODc3ODk4MTU5MzQ5?cjc=vqhchcfs' },
    { name: 'Офисные технологии', teacher: 'Вакарчук Анна Олександровна', description: 'Занятия, задания и объявления.', url: 'https://classroom.google.com/c/ODc4MTgyMzI2MTYz?cjc=aqzrop43' }
];

renderResources('classroom-list', classroomLessons, 'Google Classroom', 'Открыть Classroom', 'Ссылки Classroom пока не добавлены.');
