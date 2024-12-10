const App = require('./app');
const config = require('./config');

const app = new App();
app.listen(config.server.port);
