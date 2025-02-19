const { express } = require('./common');
const app = express();
app.use(express.json());
const PORT = 3000;

app.use('/', require('./UsersMusic'));

app.listen(PORT, () => {
  console.log(`I am listening on PORT ${PORT}`);
});