"use strict"

module.exports = class {

	// Load row data and setup model
	constructor(data) {
		this.constructor.init()
		this.data(data)
	}

	// get or set row data
	data(data) {
		if (data !== undefined) {
			for(let key in data) {
				this[key] = data[key]
			}
		} else {
			let data = {}

			// Pull columns from model properties and load data into simple object
			for (let property in this) {

				// Ignore _special_ properties
				if (property.substring(0, 1) != '_') {
					data[property] = this[property]
				}
			}

			return data;
		}
	}

	// Fetch all rows
	static fetch() {
		let results = []

		for (let row of this.sql.fetch.all()) {
			results.push(new this(row))
		}

		return results;
	}

	// Find a specific row based on id
	static find(id) {
		let row = this.sql.find.get(id)

		if (row === 'undefined') {
			return []
		}

		return [new this(row)]
	}

	// Save function similar to ruby on rails active record
	save() {
		let data = this.data()
		let sql

		// Update if there is an id set
		if (Number.isInteger(data[this._primaryKey])) {
			let values = []

			// Build array of value bind pairs
			for (let property in data) {
				if (property != this._primaryKey) {
					values.push(property + ' = :' + property)
				}
			}

			// Turn array into a string
			values = values.join(', ')

			// Build sql query
			sql = this.db.prepare(`UPDATE ${this._table} SET ${values} WHERE ${this._primaryKey} = :${this._primaryKey}`)

		} else { // Insert when there is no id set
			let keys = []
			let markers = []

			// Build array of keys and array of markers
			for (let property in data) {
				keys.push(property)
				markers.push(':' + property)
			}

			// Turn array into a string
			keys = keys.join(', ')
			markers = markers.join(', ')

			// Build sql query
			sql = app.db.prepare(`INSERT INTO ${this._table} (${keys}) VALUES (${markers})`)
		}

		return sql.run(data)
	}

	get _table() {
		return this.constructor._table
	}

	get _primaryKey() {
		return this.constructor._primaryKey
	}

	static get _primaryKey() {
		return 'id'
	}

	get db() {
		return app.db
	}

	static get db() {
		return app.db
	}
/*
	get sql() {
		return this.constructor.sql
	}

	static get sql() {
		if (app.sql[this._table] === undefined) {
			app.sql[this._table] = {}

			app.sql[this._table].fetch = app.db.prepare(`SELECT * FROM ${this._table}`)
			app.sql[this._table].find = app.db.prepare(`SELECT * FROM ${this._table} WHERE ${this._primaryKey} = ?`)
		}

		return app.sql[this._table]
	}
*/
	static get enum() {
		if (app.enum[this._table] === undefined) {
			app.enum[this._table] = {}
		}

		return app.enum[this._table]
	}
}
