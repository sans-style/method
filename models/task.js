"use strict"
// Load model class
const Model = require(app.base + 'libraries/model');

// export Task model
module.exports = class extends Model {

	// Set the table name we are working on
	static get _table() {
		return 'tasks'
	}

	// Setup model - called by Model
	static init() {

		// Create table if not exists
		this.db.exec(`CREATE TABLE IF NOT EXISTS ${this._table} (
			${this._primaryKey} INTEGER PRIMARY KEY AUTOINCREMENT,
			task TEXT,
			state INTEGER
		)`)

		// Prepare sql statements to be used by the model
		this.sql.insert = this.db.prepare(`INSERT INTO ${this._table} (task, state) VALUES (?, ?)`)

		// Prepare enums
		this.enum.state = {
			todo: 0,
			done: 1,
		}
	}

	// Insert a row
	static insert(task, state) {
		return this.sql.insert.run(task, state);
	}
}
