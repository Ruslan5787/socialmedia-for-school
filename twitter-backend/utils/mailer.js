import nodemailer from "nodemailer";
import dotenv from "dotenv";
import Event from "../models/eventModel.js";

dotenv.config();

const transporter = nodemailer.createTransport({
    host: 'smtp.mail.ru',
    port: 465,
    secure: true, // true для порта 465 (SSL)
    auth: {
        user: process.env.EMAIL_USER, // ваш email на Mail.ru
        pass: process.env.EMAIL_PASS, // пароль приложения или обычный пароль
    },
});

const sendWelcomeEmail = async (to, username) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Добро пожаловать!',
        html: `<h1>Привет, ${username}!</h1><p>Спасибо за регистрацию в нашем приложении!</p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Письмо успешно отправлено');
    } catch (error) {
        console.log('Ошибка при отправке письма:', error);
    }
};

const sendFollowUserEmail = async (to, followUsername) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject: "Оформлена подписка",
            html: `<p>Вы подписались на ${followUsername}</p>`,
        };

        await transporter.sendMail(mailOptions);
        console.log('Письмо успешно отправлено');
    } catch (error) {
        console.log('Ошибка при отправке письма:', error);
    }
}

const sendNotificationAboutNewEventEmail = async (to, event) => {
    try {
        const {
            name, description, date, time, status, price, address, img
        } = event;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject: "Новое мероприятие",
            html: `<div>
                ${img === "" ? "" : `<img src="${img}" alt="Изображение к мероприятию"/>`}
                <h3>${date} в ${time} будет "${name.toLocaleLowerCase()}".</h3>
                <p>${description}</p>
                <p>Статус - ${status}</p>
                <p>Адрес - ${address}</p>
                <p>Посещение - ${price === 0 ? "бесплатное" : `${price} руб.`}</p>
            </div>`,
        };

        await transporter.sendMail(mailOptions);
        console.log('Письмо успешно отправлено');
    } catch (error) {
        console.log('Ошибка при отправке письма:', error);
    }
}

const sendEventReminderEmail = async () => {
    try {
        // Находим все мероприятия
        const events = await Event.find()
            .populate('viewUsers')
            .populate('status');

        const now = new Date();

        for (const event of events) {
            // Комбинируем дату и время мероприятия
            const [hours, minutes] = event.Time.split(':');
            const eventDateTime = new Date(event.Date);
            eventDateTime.setHours(hours, minutes);

            // Проверяем, осталось ли 3 часа до мероприятия
            const timeDiff = (eventDateTime - now) / (1000 * 60 * 60); // Разница в часах
            if (timeDiff > 2.9 && timeDiff < 3.1) { // Окно в 12 минут (2.9-3.1 часа)
                // Находим группу, связанную с мероприятием
                const group = await Group.findOne({events: event._id}).populate('users');
                if (!group) continue;

                // Проверяем каждого пользователя группы
                console.log("GROUP USERS" + group.users)
                for (const user of group.users) {
                    // Если пользователь не просмотрел мероприятие
                    if (!event.viewUsers.includes(user._id)) {
                        console.log(user)
                        await sendReminderEmail(user.email, event);
                    }
                }
            }
        }
    } catch (error) {
        console.log('Ошибка при отправке напоминаний:', error);
    }
};

// Функция отправки напоминания
const sendReminderEmail = async (to, event) => {
    try {
        const {name, description, date, Time, status, price, address, img} = event;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject: `Напоминание о мероприятии: ${name}`,
            html: `<div>
                ${img ? `<img style={{ width: 300px, margin: 0 auto; }} src="${img}" alt="Изображение мероприятия"/>` : ''}
                <h3>Напоминание: "${name}" через 3 часа!</h3>
                <p>Дата и время: ${date.toLocaleDateString()} в ${Time}</p>
                <p>${description}</p>
                <p>Адрес: ${address || 'Не указан'}</p>
                <p>Стоимость: ${price === 0 ? 'Бесплатно' : `${price} руб.`}</p>
                <p>Пожалуйста, ознакомьтесь с информацией о мероприятии!</p>
            </div>`,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Напоминание отправлено на ${to}`);
    } catch (error) {
        console.log('Ошибка при отправке напоминания:', error);
    }
};

export { sendWelcomeEmail, sendFollowUserEmail, sendNotificationAboutNewEventEmail, sendReminderEmail, sendEventReminderEmail };