const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");

const request = require("request");
const cheerio = require("cheerio");

const url =
  "https://yandex.ru/pogoda/shakhty?ysclid=lpcjdirb9z826130095&lat=47.709236&lon=40.21540"; // Замените на адрес нужной веб-страницы

// Отправляем GET-запрос для получения HTML-кода страницы

let maininfo = ""
request(url, (error, response, html) => {
  if (!error && response.statusCode === 200) {
    // Используем cheerio для загрузки HTML-кода страницы
    const $ = cheerio.load(html);

    // Пример: извлечение заголовков h2
    $(".fact__basic").each((index, element) => {
      maininfo = $(element).attr('aria-label')
      console.log($(element).attr('aria-label'));
    });

    // Другие манипуляции с DOM с использованием cheerio
    // ...
  } else {
    console.error("Ошибка при получении страницы:", error);
  }
});

const token = "6921320744:AAGhASPqrpgG-";

const bot = new TelegramBot(token, { polling: true });




const filePath = "data.json";
function addDataToFile(newData) {
  let existingData = { users: [] };
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    try {
      existingData = JSON.parse(fileContent);
    } catch (error) {
      console.error("Ошибка при разборе JSON:", error);
      return;
    }
  }
  const isDataExists = existingData.users.some(
    (item) => JSON.stringify(item) === JSON.stringify(newData)
  );

  if (!isDataExists) {
    existingData.users.push(newData);
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), "utf-8");
    console.log("Данные сохранены успешно.");
  } else {
    console.log("Такие данные уже существуют, не сохранено.");
  }
}
function getAllDataFromFile() {
  // Проверяем существование файла
  if (fs.existsSync(filePath)) {
      // Читаем содержимое файла
      const fileContent = fs.readFileSync(filePath, 'utf-8');

      // Пытаемся разобрать содержимое как JSON
      try {
          return JSON.parse(fileContent);
      } catch (error) {
          console.error('Ошибка при разборе JSON:', error);
          return null;
      }
  } else {
      console.log('Файл не существует.');
      return null;
  }
}
// Пример использования




const allData = getAllDataFromFile();
console.log(allData['users']);


bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  addDataToFile(msg.chat.id);
});



setInterval(() => {
  for(let user of allData['users']){
    try{
      bot.sendMessage(user, maininfo);
    }catch(e){
      console.log(e)
    }
  }
},100)