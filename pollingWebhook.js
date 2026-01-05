const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = '7890167601:AAGPYPWcUHsrRI0CE9GOj2HSGiGqM9I72j4';

// Создаем экземпляр бота
const bot = new TelegramBot(token, { polling: true });

let action = '';

// Слушаем конкретные команды
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  axios
    .post(`http://localhost:5678/webhook/22993d56-bced-46e3-bd1e-488ba5341516?user_id=${msg.from.id}&user_action=0`)
    .then((res) => {
      bot.sendMessage(chatId, `Добро пожаловать!`);
    })
    .catch((err) => {
      console.log(err);
      bot.sendMessage(chatId, `В работе бота произошла ошибка`);
    });
});

bot.onText(/\/create_list/, (msg) => {
  const chatId = msg.chat.id;

  axios
    .post(`http://localhost:5678/webhook/b31e8600-26a0-4b5d-9158-5b9fb9f7a440?user_id=${msg.from.id}&user_action=1`)
    .then((res) => {
      bot.sendMessage(chatId, `Введите название списка`);
    })
    .catch((err) => {
      console.log(err);
      bot.sendMessage(chatId, `В работе бота произошла ошибка`);
    });
  
});

bot.onText(/\/selecting_list/, (msg) => {
  const chatId = msg.chat.id;

  axios
    .post(`http://localhost:5678/webhook/b31e8600-26a0-4b5d-9158-5b9fb9f7a440?user_id=${msg.from.id}&user_action=2`)
    .then((res) => {

      let inlineKeyboard = {
        inline_keyboard: []
      }

      res.data.forEach((item) => {
        inlineKeyboard.inline_keyboard.push([{ text: item.name_list, callback_data: item.name_list}]);
      });

      bot.sendMessage(chatId, 'Выберите список:', {
        reply_markup: inlineKeyboard
      });
    })
    .catch((err) => {
      console.log(err);
      bot.sendMessage(chatId, `В работе бота произошла ошибка`);
    });
  
});
bot.onText(/\/viewing_list/, (msg) => {
  const chatId = msg.chat.id;

  axios
    .post(`http://localhost:5678/webhook/b31e8600-26a0-4b5d-9158-5b9fb9f7a440?user_id=${msg.from.id}&user_action=3`)
    .catch((err) => {
      console.log(err);
      bot.sendMessage(chatId, `В работе бота произошла ошибка`);
    });

  axios
    .get(`http://localhost:5678/webhook/64eda011-448d-4990-898c-6d8428a2457b?user_id=${msg.from.id}`)
    .then((res) => {
      let inlineKeyboard = {
        inline_keyboard: []
      }

      console.log(res.data);

      res.data.forEach((item) => {
        if (item.relevance) {
          inlineKeyboard.inline_keyboard.push([{ text: item.position_name + '    [v]', callback_data: item.position_name}]);
        } else {
          inlineKeyboard.inline_keyboard.push([{ text: item.position_name, callback_data: item.position_name}]);
        }
      });

      bot.sendMessage(chatId, 'Выберите список:', {
        reply_markup: inlineKeyboard
      });
    })
    .catch((err) => {
      console.log(err);
      bot.sendMessage(chatId, `В работе бота произошла ошибка`);
    });
  
});

// Слушаем текстовые сообщения
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text != '/start' && text != '/create_list' && text != '/adding_position' && text != '/selecting_list' && text != '/viewing_list') {

    axios
      .post(`http://localhost:5678/webhook/81d952d9-0df7-42d5-a8cc-e848078580f1?user_id=${msg.from.id}&message=${text}`)
      .then((res) => {
        console.log(res.data);
        bot.sendMessage(chatId, res.data);
      })
      .catch((err) => {
        console.log(err);
        console.log(2);
        bot.sendMessage(chatId, 'Произошла ошибка');
      });

  }
});

// Обработка callback-запросов от inline-кнопок
bot.on('callback_query', (callbackQuery) => {
  const msg = callbackQuery.message;

  bot.answerCallbackQuery(callbackQuery.id)
    .then(() => {

      axios
        .post(`http://localhost:5678/webhook/7d8b128d-8bb1-4f35-8cdf-11e4df6b6568?user_id=${callbackQuery.from.id}&name=${callbackQuery.data}`)
        .then((res) => {
          bot.sendMessage(callbackQuery.from.id, `Актуальный список изменён`);
        })
        .catch((err) => {
          console.log(err);
          bot.sendMessage(callbackQuery.from.id, `В работе бота произошла ошибка`);
        });

      // bot.sendMessage(msg.chat.id, `Вы нажали кнопку: ${callbackQuery.data}`);
    });
});