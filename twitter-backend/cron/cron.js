import https from "https";
import cron from 'node-cron';
import {sendEventReminderEmail} from "../utils/mailer.js";

// const URL = "https://threads-clone-9if3.onrender.com";
//
// const job = new cron.CronJob("*/14 * * * *", function () {
//     https
//         .get(URL, (res) => {
//             if (res.statusCode === 200) {
//                 console.log("GET request sent successfully");
//             } else {
//                 console.log("GET request failed", res.statusCode);
//             }
//         })
//         .on("error", (e) => {
//             console.error("Error while sending request", e);
//         });
// });

export const startCronJobs = () => {
    // Проверка каждые 10 минут
    cron.schedule('*/10 * * * *', () => {
        console.log('Проверка событий на отправку напоминаний...');
        sendEventReminderEmail();
    });
};

// CRON JOB EXPLANATION:
// Cron jobs are scheduled tasks that run periodically at fixed intervals or specific times
// send 1 GET request for every 14 minutes

// Schedule:
// You define a schedule using a cron expression, which consists of five fields representing:

//! MINUTE, HOUR, DAY OF THE MONTH, MONTH, DAY OF THE WEEK

//? EXAMPLES && EXPLANATION:
//* 14 * * * * - Every 14 minutes
//* 0 0 * * 0 - At midnight on every Sunday
//* 30 3 15 * * - At 3:30 AM, on the 15th of every month
//* 0 0 1 1 * - At midnight, on January 1st
//* 0 * * * * - Every hour
