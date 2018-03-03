const express = require('express')
const hbs = require('hbs')
const logger = require('morgan')
const bodyParser = require('body-parser')
const session = require('express-session')
const LevelStore = require('express-session-level')(session)
const level = require('level')
const compression = require('compression')
const multer = require('multer')
const csurf = require('csurf')
const debug = require('debug')('method:server')
const Sqlite = require('sqlite-cipher')

// Create main app
global.app = express()

// Extend the app
app.base = __dirname + '/'
app.csrf = csurf({ cookie: true })
app.multer = multer({ dest: app.base + 'store/uploads/' })

app.db = require('sqlite-cipher')
app.db.connect(app.base + 'store/database/sqlite.db', 'bd8Y4eGes4A63jka', 'aes-256-ctr')

// view engine setup
app.set('views', app.base + 'views')
app.set('view engine', 'hbs')
hbs.registerPartials(app.base + 'views/partials')
app.set('view options', {layout: app.base + 'layouts/main.hbs'})

hbs.registerHelper({
    eq: function (v1, v2) {
        return v1 === v2;
    },
    ne: function (v1, v2) {
        return v1 !== v2;
    },
    lt: function (v1, v2) {
        return v1 < v2;
    },
    gt: function (v1, v2) {
        return v1 > v2;
    },
    lte: function (v1, v2) {
        return v1 <= v2;
    },
    gte: function (v1, v2) {
        return v1 >= v2;
    },
    and: function (v1, v2) {
        return v1 && v2;
    },
    or: function (v1, v2) {
        return v1 || v2;
    }
});

// Logging, bodyparsing and static serving middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(app.base + 'public'));

// Session middleware
let sessionDatabase = level(app.base + 'store/database/session.db')
app.use(session({
	secret: 'NDUvuTXRJju8fJju8f8pA8pAqBTLgjFQ8dvfAHd4',
	store: new LevelStore(sessionDatabase),
	resave: false,
	saveUninitialized: false,
	cookie: {},
}))

// Compression middleware
app.use(compression({ filter: shouldCompress }))
function shouldCompress (req, res) {
	// don't compress responses with this request header
	if (req.headers['x-no-compression']) {
		return false
	}

	// fallback to standard filter function
	return compression.filter(req, res)
}

// Load in routes
app.use('/', require(app.base + 'routes'))

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

app.listen(43214);
