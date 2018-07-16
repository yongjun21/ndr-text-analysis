const fs = require('fs')
const rl = require('readline')
const path = require('path')

const DIR = 'data/raw'

const files = fs.readdirSync(DIR)

files.forEach(filename => {
  const reader = rl.createInterface({
    input: fs.createReadStream(path.join(DIR, filename))
  })

  const content = []

  reader.on('line', line => {
    content.push(line.trim())
  })
  reader.on('close', () => {
    const cleaned = content.filter((line, i) => {
      if (i === 0) return line.length > 0
      return line.length > 0 || content[i - 1].length > 0
    }).join('\n')
    fs.writeFileSync(path.join(DIR, filename), cleaned)
  })
})
