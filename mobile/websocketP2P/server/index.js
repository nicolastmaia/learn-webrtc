//index.js
const app = require('./app');
const appWs = require('./app-ws');

const server = app.listen(3000, () => {
  console.log(`App Express is running!`);
});

const server2 = app.listen(3001, () => {
  console.log(`App Express is running!`);
});

appWs(server);
appWs(server2);
