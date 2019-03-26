const restify = require('restify');
const dotenv = require('dotenv');
console.log('process.env.NODE_ENV: ', process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
	dotenv.config();
}

let app = restify.createServer({ name:'REST-api' });
const corsMiddleware = require('restify-cors-middleware')
const cors = corsMiddleware({})

app.pre(cors.preflight)
app.use(cors.actual)
app.use(restify.plugins.bodyParser());
app.use(restify.plugins.queryParser());

app.listen(process.env.PORT, () => {
	console.log('server listening on port number', process.env.PORT);
});
let routes = require('./routes')(app);

module.exports = app;
