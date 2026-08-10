#!/usr/bin/env node
const https = require('https')
const fs = require('fs')
const path = require('path')

const url = 'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf'
const outDir = path.join(__dirname, '..', 'public', 'fonts')
const outPath = path.join(outDir, 'NotoSans-Regular.ttf')

fs.mkdirSync(outDir, { recursive: true })

console.log('Downloading', url)
const file = fs.createWriteStream(outPath)
https.get(url, res => {
  if (res.statusCode !== 200) {
    console.error('Failed to download font, status', res.statusCode)
    process.exit(1)
  }
  res.pipe(file)
  file.on('finish', () => {
    file.close()
    console.log('Saved', outPath)
  })
}).on('error', err => {
  try { fs.unlinkSync(outPath) } catch (_) {}
  console.error('Error:', err.message)
  process.exit(1)
})
