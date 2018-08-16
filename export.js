const {google} = require('googleapis')
const authorize = require('./google/authorize')

const wordFreq = require('./data/words.json')
const {STOP_WORDS} = require('./constants')

authorize(writeWordFreqToSheet)

function writeWordFreqToSheet (err, auth) {
  if (err) console.error(err)

  const sheets = google.sheets({version: 'v4', auth})

  Object.keys(wordFreq).forEach(year => {
    const freq = wordFreq[year]
    const columns = ['word', 'frequency', 'stop_word']
    let rows = []
    Object.keys(freq).forEach(w => {
      const row = [w, freq[w]]
      if (STOP_WORDS.indexOf(w) > -1) row.push(1)
      rows.push(row)
    })
    rows = rows.filter(r => r[0].match(/[a-z]/))
    rows.sort((a, b) => b[1] - a[1])
    const values = [columns, ...rows]

    const params = {
      spreadsheetId: '1033yu1mQG-yShm7mYTSgiasagazBrjd-2N1FDIoMpJ0',
      range: `${year}!A1:C`,
      valueInputOption: 'USER_ENTERED',
      resource: {values}
    }
    sheets.spreadsheets.values.update(params, (err, res) => {
      if (err) return console.error(err)
      console.log(res.data)
    })
  })
}
