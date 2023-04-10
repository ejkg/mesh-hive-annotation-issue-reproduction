const server = require("server");
const reminders = require("./data.json");

const { get, post } = server.router;
const { json } = server.reply;

// db init
const db = [...reminders];

// middlewares
const setRemindersMiddleware = context => { context.reminders = db };
const logRequest = context => { console.info(context) }

// routes
/**
 * 
 * @param {import("typescript").server} context 
 */
function addReminder(context) {
    const newReminder = {
        id: context.reminders.length + 1,
        ...context.data,
    };
    context.reminders = [...context.reminders, newReminder];
    return newReminder;
}

server({ port: 3000 }, [
    setRemindersMiddleware,
    logRequest,
    get("/reminders", context => json(context.reminders)),
    post("/reminders", addReminder),
])