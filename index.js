const fs = require('fs')
const rl = require('readline')
const path = require('path')
const natural = require('natural')

const DIR = 'data/raw'

const files = fs.readdirSync(DIR)

const readers = files.map(filename => {
  return rl.createInterface({
    input: fs.createReadStream(path.join(DIR, filename))
  })
})

charFrequency(readers)
wordNsentenceCount(readers)
wordFrequency(readers)

function charFrequency (readers) {
  const freq = {}

  const threads = readers.map(reader => {
    reader.on('line', line => {
      line.split('').forEach(c => {
        freq[c] = freq[c] || 0
        freq[c]++
      })
    })

    return new Promise((resolve, reject) => {
      reader.on('close', resolve)
    })
  })

  return Promise.all(threads).then(() => {
    const sorted = {}
    Object.keys(freq).sort().forEach(c => {
      sorted[c] = freq[c]
    })
    fs.writeFileSync('data/characters.json', JSON.stringify(sorted, null, 2))
    return sorted
  })
}

function wordNsentenceCount (readers) {
  const wordTokenizer = new natural.WordTokenizer()
  const sentenceTokenizer = new natural.SentenceTokenizer()
  const threads = readers.map(reader => {
    let wordCount = 0
    let sentenceCount = 0

    reader.on('line', filterRelevant(line => {
      const words = wordTokenizer.tokenize(line)
      const sentences = sentenceTokenizer.tokenize(line)
      wordCount += words.length
      sentenceCount += sentences.length
    }))

    return new Promise((resolve, reject) => {
      reader.on('close', () => {
        resolve({words: wordCount, sentences: sentenceCount})
      })
    })
  })

  Promise.all(threads).then(results => {
    const counts = results.map((count, i) => Object.assign({year: files[i].slice(0, 4)}, count))
    fs.writeFileSync('data/stat.json', JSON.stringify(counts, null, 2))
    return counts
  })
}

function wordFrequency (readers) {
  const wordTokenizer = new natural.TreebankWordTokenizer()
  const freq = {}

  const threads = readers.map(reader => {
    reader.on('line', filterRelevant(line => {
      const words = wordTokenizer.tokenize(line)
      words.forEach(w => {
        w = basicFilter(w)
        freq[w] = freq[w] || 0
        freq[w]++
      })
    }))

    return new Promise((resolve, reject) => {
      reader.on('close', resolve)
    })
  })

  return Promise.all(threads).then(() => {
    const sorted = {}
    Object.keys(freq).sort((a, b) => freq[b] - freq[a]).forEach(c => {
      sorted[c] = freq[c]
    })
    fs.writeFileSync('data/words.json', JSON.stringify(sorted, null, 2))
    return sorted
  })
}

function filterRelevant (cb) {
  let skip = false
  return function (line) {
    if (skip) {
      if (line === '**[Interview ends]**' || line === '**[Video ends]**') {
        skip = false
      }
      return
    }

    if (line === '**[Interview starts]**' || line === '**[Video starts]**') {
      skip = true
      return
    }

    if (line.length <= 0) return
    if (line[0] === '*') return
    if (line[0] === '>') return

    line = line.replace(/\[.*?\]/g, '').replace(/\s+/g, ' ')

    cb(line)
  }
}

function basicFilter (token) {
  return token.toLowerCase().replace(/(\.|\?|!|')$/g, '')
}
