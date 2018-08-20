const {sheets} = require('./google')
const freq = require('./data/words.json')

const params = {
  spreadsheetId: '1033yu1mQG-yShm7mYTSgiasagazBrjd-2N1FDIoMpJ0',
  range: `Topics!A1:H`,
  majorDimension: 'COLUMNS'
}
sheets.spreadsheets.values.get(params)
  .then(res => res.data.values)
  .then(topics => {
    const columns = ['year', 'topic', 'count']
    const rows = []

    Object.keys(freq).forEach(year => {
      topics.forEach(row => {
        let count = 0
        row.slice(1).forEach(word => {
          count += freq[year][word] || 0
        })
        rows.push([year, row[0], count])
      })
    })

    const values = [columns, ...rows]
    const params = {
      spreadsheetId: '1033yu1mQG-yShm7mYTSgiasagazBrjd-2N1FDIoMpJ0',
      range: "'By topics'!A1:C",
      valueInputOption: 'USER_ENTERED',
      resource: {values}
    }
    return sheets.spreadsheets.values.update(params)
  })
  .then(res => res.data)
  .then(console.log)
  .catch(console.error)
