import { interval } from 'rxjs';
import { switchMap, map, catchError, startWith } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
import { of } from 'rxjs';

const API_URL = 'http://localhost:3000/messages/unread';

const messagesBody = document.getElementById('messages-body');
const seenMessageIds = new Set(); // Чтобы не дублировать сообщения при опросе

// 1. Создаем поток, который срабатывает каждые 5 секунд
const polling$ = interval(5000).pipe(
    startWith(0), // Сразу делаем первый запрос при загрузке
    switchMap(() => 
        ajax.getJSON(API_URL).pipe(
            // Обработка ошибок: если сервер недоступен, возвращаем пустой массив
            catchError((error) => {
                console.warn('Ошибка запроса (сервер недоступен или не 200):', error);
                return of({ messages: [] });
            })
        )
    ),
    map(data => data.messages || []) // Извлекаем массив сообщений
);

// 2. Подписываемся на поток
polling$.subscribe((messages) => {
    // Отфильтровываем те сообщения, которые мы уже показывали
    const newMessages = messages.filter(msg => !seenMessageIds.has(msg.id));
    
    if (newMessages.length > 0) {
        // Добавляем ID в Set
        newMessages.forEach(msg => seenMessageIds.add(msg.id));
        
        // Отрисовываем
        renderMessages(newMessages);
    }
});

// 3. Функция отрисовки
function renderMessages(messages) {
    // Проходим по массиву (сверху вниз), но вставляем через prepend,
    // чтобы новые оказывались выше старых.
    messages.forEach(msg => {
        const tr = document.createElement('tr');
        tr.className = 'message-row';

        // Сокращаем subject до 15 символов
        let subject = msg.subject;
        if (subject.length > 15) {
            subject = subject.substring(0, 15) + '...';
        }

        // Форматируем дату: ЧЧ:ММ ДД.ММ.ГГГГ
        // received приходит в секундах, переводим в миллисекунды
        const date = new Date(msg.received * 1000);
        const hh = String(date.getHours()).padStart(2, '0');
        const mm = String(date.getMinutes()).padStart(2, '0');
        const DD = String(date.getDate()).padStart(2, '0');
        const MM = String(date.getMonth() + 1).padStart(2, '0');
        const YYYY = date.getFullYear();
        const formattedDate = `${hh}:${mm} ${MM}.${DD}.${YYYY}`;

        // Безопасно вставляем текстовые данные (без innerHTML)
        const tdFrom = document.createElement('td');
        tdFrom.className = 'message-from';
        tdFrom.textContent = msg.from;

        const tdSubject = document.createElement('td');
        tdSubject.className = 'message-subject';
        tdSubject.textContent = subject;

        const tdDate = document.createElement('td');
        tdDate.className = 'message-date';
        tdDate.textContent = formattedDate;

        tr.appendChild(tdFrom);
        tr.appendChild(tdSubject);
        tr.appendChild(tdDate);

        // Вставляем в начало тела таблицы
        messagesBody.prepend(tr);
    });
}