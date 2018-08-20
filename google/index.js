const {google} = require('googleapis')
const {promisify} = require('util')
const authorize = promisify(require('./authorize'))

module.exports = {
  get sheets () {
    const _sheets = authorize()
      .then(auth => google.sheets({version: 'v4', auth}).spreadsheets.values)

    return {
      spreadsheets: {
        values: {
          get (params) {
            return _sheets.then(values => values.get(params))
          },
          update (params) {
            return _sheets.then(values => values.update(params))
          }
        }
      }
    }
  }
}
