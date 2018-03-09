const controller = module.exports = require('express').Router()
const validate = require('express-validation')

controller.all('/', function(req, res, next) {
	
	console.log(req.body);
	var journalText = req.body.inputField;
	var versionOption = req.body.versionSelection;
	var newPageName = req.body.newPageName;
	//*****var currentPageId = req.body.
	//need version number to be 0 by default, 0 = latest entry with next most recent = 1 and so on
	var versionNo = 0;
	var defaultDisplayedVersions = [];
	var selectedPage;
	var i = 0;
	var errorMessage = "";
	var errorState = false;
	
	var rows = req.db.run("SELECT * FROM blocks ORDER BY created DESC");
	
		//if the text area has been submitted then save a new block in the db
	if (journalText !== undefined){
		
		selectedPage = req.body.textAreaSelectedPageId;
		console.log("selected page: " + selectedPage);
		console.log(journalText);
		var re = /\\/g;
		journalText = journalText.replace(re, "\\\\");
		re = /(?:\r\n|\r|\n)/g;
		journalText = journalText.replace(re, "\\n");
		console.log("journalText = " + journalText);
		
		rows = req.db.run("SELECT * FROM blocks WHERE pageId = " + selectedPage + " ORDER BY created DESC LIMIT 1");
		
		if(rows[0].data === journalText) {
			errorState = true;
			errorMessage = "no changes detected from previous version";
			console.log("ERROR: journal entry identical to latest version");
		}
		
		if(!errorState) {
			let block = {
			pageId : selectedPage,
			created: Math.round(Date.now() / 1000),
			data: journalText,
			}
			
			req.db.insert("blocks", block);
			console.log("ADDING NEW MESSAGE TO DATABASE");
		}
	}
	//if the version option was submitted change versionNo so that the correct version will be rendered
	else if(versionOption !== undefined) {
		selectedPage = req.body.versionSelectionSelectedPageId;
		console.log("selected page: " + selectedPage);
		console.log("acquiring different version");
		versionNo = versionOption;
		journalText = req.db.run("SELECT * FROM blocks WHERE pageId = " + selectedPage + " ORDER BY created DESC")[versionOption].data;
	}
	//if newPageName was submitted create a new page
	else if(newPageName !== undefined) {
		console.log("creating new page");
		selectedPage = req.body.newPageSelectedPageId;
		console.log("selected page: " + selectedPage);
		let pathString = "";
		if(selectedPage == 0){
			pathString = "/" + newPageName;
		}
		else {
		pathString = req.db.run('SELECT * FROM pages WHERE id = ?', [selectedPage])[0].path + "/" + newPageName;
		console.log("pathstring = " + pathString);
		
		}
		
		let database = req.db.run("SELECT * FROM pages");
		
		for (i=0 ; i<database.length ; i++) {
			if(database[i].path === pathString)
			{
				errorState = true;
				errorMessage = "page already exists at given directory";
				console.log("ERROR: PAGE ALREADY EXISTS AT GIVEN DIRECTORY")
			}
		}
		
		if (!errorState) {
			let page = {
			parent : selectedPage,
			created: Math.round(Date.now() / 1000),
			name: newPageName,
			path: pathString
			}
			
			selectedPage = req.db.insert("pages", page);
			
			let block = {
			created: Math.round(Date.now() / 1000),
			//note: when pages.length is 0 or 1 there should be something to catch that if length = 1 then use query.id instead of query[0].id not sure this is true anymore...
			pageId : selectedPage,
			data: "New message!"
		}
		
		console.log("new page inserted: id: " + selectedPage + "\ncreated = " + block.created);
		
		req.db.insert("blocks", block);
		}
	}
	//If all are undefined then no special action is required
	else {
		console.log("no special action required");
		selectedPage = 0;
	}
	
	
	var pages = req.db.run("SELECT * FROM pages ORDER BY Id ASC");
	var dates = [];
	var versions = [];
	
	

	
	if(1===0){
		req.db.run("DELETE from pages");
		req.db.run("DELETE from blocks");
	}



	var orderedPages = [];
	
	var currentTreeRoute = [];
	//current page is the page that is currently looking for its children
	var currentPage = 0;
	//i represents the page from the table that is currently being checked to see if it is a child
	i=0;
	var currentChildCheckProgress = 0;
	var childCheckProgressArray = [];
	
	//This while loop is responsible for making up orderedPages Array, so that its order reflects the structure of the page tree
	while (orderedPages.length < pages.length) {
		//set endOfBranch equal to true by default
		var endOfBranch = true;
		
		//each page is checked to see if its parent is the currentPage
		for(i=currentChildCheckProgress; i<pages.length; i++) {
			
			//if the currently tested page does have the specific parent page...
			if(currentPage == pages[i].parent) {
				//...then it is added next in the orderedPages array...
				orderedPages.push(pages[i]);
				//...the current page and current i are remembered in the currentTreeRoute and currentChildCheckProgress array...
				currentTreeRoute.push(currentPage);
				childCheckProgressArray.push(i+1);
				//...the current page is then set to scan for its children
				currentPage = pages[i].id;
				//...and the endOfBranch Boolean is flagged
				endOfBranch = false;
				break;
			}
		}
		
		//If no children where found, then it is time to return looking for the rest of the current pages' brothers and sisters, starting at the appropriate I to avoid duplicates
		if(endOfBranch)
		{
			//the current page's parent is popped off the end of the currentTreeRouteArray and set as the page whose children we want to find
			currentPage = currentTreeRoute.pop();
			currentChildCheckProgress = childCheckProgressArray.pop();
		}
	}
	
	var pathComplete = false;
	currentTreeRoute = [];
	var pathString = "/";
	var defaultPath = "root";
	var selectedPageIndex = 0;
	var re;
	var indentNum;
	var selectedRows;
	var label;
	

	//This for loop is to add the pages.label property to orderedPages, the label property contains a string that is prefixed with tabs to indent the pages tree appropriately
	//It is also responsible for acquiring the most recent data entry and adding it to the orderedPage object
	//It also acquires the number and dates of the possible versions
	for(i = 0 ; i < orderedPages.length ; i++)
	{
		label = "";
		pathString = orderedPages[i].path;
		re = /\//g;
		indentNum = pathString.match(re);
		
		if(indentNum != null) {
			
			indentNum = indentNum.length
			
			for(var j = 0; j < indentNum;j++) {
				
				//label += "&nbsp;&nbsp;&nbsp;&nbsp;";
				
				if(j==indentNum-1) {
					label +="|---";
				}
				else {
					label += "|&nbsp;&nbsp;&nbsp;";
				}
				
			}
		
		}
		
		label += orderedPages[i].name;
		orderedPages[i]["label"] = label;
		
		currentPage = orderedPages[i].id;
		selectedRows = req.db.run('SELECT * FROM blocks WHERE pageId = ' + currentPage + ' ORDER BY created DESC');
		
		console.log("\nindex  = " +i+" pageId = "+currentPage+"no of versions = " +selectedRows.length+ "\n");
		console.log('SELECT * FROM blocks WHERE pageId = ? ORDER BY created DESC', [currentPage])
		orderedPages[i]["data"] = selectedRows[0].data;
		
		
		dates = [];
		versions = [];
		
		for (j = 0;j<selectedRows.length;j++) {
			console.log(j, selectedRows[j]);
			let date = new Date(selectedRows[j].created*1000);
			// let the date be in format: "(d)d/(m)m/yyyy || hh:mm:ss
			let dateString  = date.getDate() + "/" + (date.getMonth() + 1).toString() + "/" + date.getFullYear() + " || " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
			dates.push(dateString);
		}
		
		for(j = 0; j<dates.length; j++) {
			let version = {};
			version['number'] = j;
			version['date'] = dates[j];
			//console.log(dates[j]);
			versions.push(version);
		}
		
		//console.log(versions[0].date);
		
		orderedPages[i]["versions"] = versions;
		console.log("\n\n orderedpage[" + i +"] :");
		for(let k = 0; k<orderedPages[i].versions.length;k++) {
			console.log(orderedPages[i].versions[k].date);
		}

		if(currentPage==selectedPage){
			defaultPath = orderedPages[i].path
			selectedPageIndex = i;
			for(let k = 0 ; k<orderedPages[i].versions.length ; k++) {
				defaultDisplayedVersions.push(orderedPages[i].versions[k]);
			}
		}
	}

	
	console.log("orderedpageslength: " + orderedPages.length);
	//console.log(orderedPages[0]);
	
	res.render('index', {
		title: 'Sky Journal',
		placeHoldText: journalText,
		versionTimes: defaultDisplayedVersions,
		pages: orderedPages,
		selectedPage: selectedPage,
		selectedPagePath: defaultPath,
		selectedPageIndex: selectedPageIndex,
		error: errorMessage
	});
	

	
	/*$('select').change(function () {
		versionNo = this.value + 1;
	$("textarea").html(rows[versionNo].data);
	});*/
	
	
})

controller.post('/login/take', validate(require('../validators/login.js')), function(req, res, next) {
	res.render('index', {
		title: 'Express'
	});
})




/*

module.exports = controller = require('express').Router()

const validate = require('express-validation')
const is = require('joi')

const model = require('../model')

controller.get('/', function (req, res) {
	res.render('auth/login');
})

controller.post('/login/take', validate({
	body: {
		email: is.string().email().required(),
		password: is.string().regex(/[a-zA-Z0-9]{3,30}/).required()
	}
}), function (req, res) {
	console.log(req);

		res.json(req);
})
*/
