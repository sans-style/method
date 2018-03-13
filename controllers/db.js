const controller = module.exports = require('express').Router()

controller.all('/', function(req, res, next) {
	// Get all blocks
	console.log(req.db.run('SELECT * FROM blocks'))
	res.send('our blocks')
})

//This controller is responsible for returning the appropriate version to the client when requested
controller.get('/retrieve', function(req, res, next) {
	let responseString = "Default Response String";
	let rows = req.db.run("SELECT * FROM blocks WHERE pageId = " + req.query.selectedPageId + " ORDER BY created DESC");
	responseString = rows[req.query.requestedVersion].data;
	console.log("version " + req.query.requestedVersion + " from PageId " + req.query.selectedPageId + " has been requested from server");
	res.json({journalText : responseString});
})

controller.all('/create', function(req, res, next) {
/*

CTRL+S = save

~~ Versioning ~~

Always insert a new block *COMPLETE*
Versioning is based on created date *COMPLETE*
Drop-down with every version shown, so you can select which version you are viewing. *COMPLETE*
We should test that new block.data is different from last most recent block.data *FUNCTIONAL, but could use client side implementation for improved experience*


~~ Pages ~~

pages table should map out a tree *Functional but could be improved via the implementation of showing and hiding of directories*
parent is the parent page id, 0 is root *COMPLETE*
name is that page name, only 0-9a-z. *COMPLETE*
path is absolute path from / including page name *COMPLETE*

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
