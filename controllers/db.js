const controller = module.exports = require('express').Router()

controller.all('/', function(req, res, next) {
	// Get all blocks
	console.log(req.db.run('SELECT * FROM blocks'))
	res.send('our blocks')
})

controller.all('/create', function(req, res, next) {
/*

CTRL+S = save

~~ Versioning ~~

Always insert a new block.
Versioning is based on created date
Dropdown with every version shown, so you can select which version you are viewing.
We should test that new block.data is diffrent from last most recent block.data


~~ Pages ~~

pages table should map out a tree
parent is the parent page id, 0 is root
name is that page name, only 0-9a-z.
path is absolute path from / including page name

/budget.foobar/home

req.db.run('SELECT * FROM blocks WHERE pageId = ? ORDER BY created DESC LIMIT 1;', [id])


*/

	// Create pages table
	req.db.run('CREATE TABLE pages (id INTEGER PRIMARY KEY AUTOINCREMENT, parent INTEGER, created INTEGER, name TEXT, path TEXT);')

	// Create blocks table
	req.db.run('CREATE TABLE blocks (id INTEGER PRIMARY KEY AUTOINCREMENT, pageId INTEGER, created INTEGER, data TEXT)')

	let block = {
		pageId: 0,
		created: Math.round(Date.now() / 1000), // Unix Timestamp
		data: 'test',
	}

	req.db.insert('blocks', block, function(id) {
		res.send('Created tables pages and blocks, then inserted a new row with id: '+id)
	})
})
