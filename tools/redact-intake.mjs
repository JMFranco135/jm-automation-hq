#!/usr/bin/env node
// Local intake redactor - zero deps, no network, no logging of content
import { readdir, readFile, writeFile, rename, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, basename, extname } from 'node:path'

// SETTINGS - edit these
const KEEP_BUSINESS_NAME = true
const REDACT_BY_QUESTION_KEYWORDS = [
  'full name',
  'first name',
  'last name',
  'home address',
  'personal address',
  'ein',
  'tax id',
  'ssn',
  'business email',
  'business phone',
  'phone',
  'email',
  'logo',
  'branding',
]
const RAW_DIR = 'C:\\intake\\raw'
const PROCESSED_DIR = 'C:\\intake\\processed'
const QUARANTINE_DIR = 'C:\\intake\\quarantine'
const OUTPUT_DIR = 'C:\\Users\\John Michael\\OneDrive\\Desktop\\claude-website\\agents\\01-sales-scripts\\inputs'

// Ensure intake folders exist
for (const d of [RAW_DIR, PROCESSED_DIR, QUARANTINE_DIR]) {
  if (!existsSync(d)) await mkdir(d, { recursive: true })
}
if (!existsSync(OUTPUT_DIR)) await mkdir(OUTPUT_DIR, { recursive: true })

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'form'
}

function redactByQuestion(text) {
  let count = 0
  const lines = text.split(/\r?\n/)
  const out = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const m = line.match(/^(\d+[\.\s]+)(.*)$/)
    if (m) {
      const num = m[1]
      const content = m[2]
      const qLower = content.toLowerCase()
      const shouldRedact = REDACT_BY_QUESTION_KEYWORDS.some(k => {
        if (k === 'legal business name' && KEEP_BUSINESS_NAME) return false
        return qLower.includes(k)
      })
      if (shouldRedact) {
        out.push(`${num}${content.split(':')[0]}: [REMOVED]`)
        count++
        // skip next line if it's an answer
        if (i + 1 < lines.length && !/^\d+[\.\s]+/.test(lines[i+1])) {
          i++
        }
        continue
      }
    }
    out.push(line)
  }
  return { text: out.join('\n'), count }
}

function redactPatterns(text) {
  const counters = { email: 0, phone: 0, id: 0, address: 0, url: 0 }
  let out = text
  // emails
  out = out.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, () => { counters.email++; return '[EMAIL]' })
  // URLs
  out = out.replace(/https?:\/\/[^\s]+/gi, () => { counters.url++; return '[URL]' })
  // Addresses
  out = out.replace(/\b\d+\s+[A-Za-z0-9\s]+(?:st|street|ave|avenue|blvd|rd|road|dr|calle)\b/gi, () => { counters.address++; return '[ADDRESS]' })
  // Phone numbers
  out = out.replace(/(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{3}\)?[\s-]?)?\d{3}[\s-]?\d{4}/g, () => { counters.phone++; return '[PHONE]' })
  // 7+ digit runs
  out = out.replace(/\b[\d\s\-.]{7,}\b/g, (m) => {
    const digits = m.replace(/\D/g, '')
    if (digits.length >= 7) { counters.id++; return '[ID-NUMBER]' }
    return m
  })
  return { text: out, counters }
}

function safetyCheck(text) {
  const email = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(text)
  const phone = /(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{3}\)?[\s-]?)?\d{3}[\s-]?\d{4}/.test(text)
  const idnum = /\b\d{7,}\b/.test(text.replace(/[\s\-.]/g, ''))
  return !(email || phone || idnum)
}

async function processFile(filePath) {
  const fname = basename(filePath)
  const raw = await readFile(filePath, 'utf-8')
  // Extract business name for slug if present
  let businessName = ''
  const bm = raw.match(/(?:legal business name|business name)[:\s]*([^\r\n]+)/i)
  if (bm) businessName = bm[1].trim()
  const slug = businessName ? slugify(businessName) : `form-${Date.now()}`

  let { text: t1, count: qCount } = redactByQuestion(raw)
  const { text: t2, counters } = redactPatterns(t1)

  if (!safetyCheck(t2)) {
    await rename(filePath, join(QUARANTINE_DIR, fname))
    console.log(`${fname}: QUARANTINED - safety check failed`)
    return
  }

  const header = `REDACTED FORM. Sensitive fields removed automatically. Review before use.
Replacements: QUESTION=${qCount}, EMAIL=${counters.email}, PHONE=${counters.phone}, ID-NUMBER=${counters.id}, ADDRESS=${counters.address}, URL=${counters.url}
`
  const outPath = join(OUTPUT_DIR, `${slug}-redacted.md`)
  await writeFile(outPath, header + t2, 'utf-8')
  await rename(filePath, join(PROCESSED_DIR, fname))
  console.log(`${fname}: OK - ${Object.values(counters).reduce((a,b)=>a+b,0)+qCount} replacements`)
}

async function runOnce() {
  const files = await readdir(RAW_DIR)
  for (const f of files) {
    if (/\.(txt|md)$/i.test(f)) {
      await processFile(join(RAW_DIR, f))
    }
  }
}

async function watch() {
  const processed = new Set()
  while (true) {
    const files = await readdir(RAW_DIR)
    for (const f of files) {
      if (/\.(txt|md)$/i.test(f) && !processed.has(f)) {
        processed.add(f)
        await processFile(join(RAW_DIR, f))
      }
    }
    await new Promise(r => setTimeout(r, 2000))
  }
}

const args = process.argv.slice(2)
if (args.includes('--once') || args.includes('--test')) {
  await runOnce()
  if (args.includes('--test')) {
    // Run test
    const testForm = `1. What is your full name?
John Doe Fake
2. Legal business name:
Acme Widgets LLC
3. Business address:
123 Main Street
4. EIN:
12-3456 789
5. Business email:
john@acme.test
6. Business phone:
555 010 0199
7. Website:
https://acme.test`
    const tmpPath = join(RAW_DIR, 'test-fake-form.txt')
    await writeFile(tmpPath, testForm, 'utf-8')
    await processFile(tmpPath)
    // Verify
    const outFiles = await readdir(OUTPUT_DIR)
    const redacted = outFiles.find(f => f.includes('acme-widgets'))
    if (!redacted) {
      console.log('TEST FAILED: output not found')
      process.exit(1)
    }
    const content = await readFile(join(OUTPUT_DIR, redacted), 'utf-8')
    const hasSensitive = /john@acme|555 010|12-3456|123 Main|John Doe/i.test(content)
    if (hasSensitive) {
      console.log('TEST FAILED: sensitive data leaked')
      process.exit(1)
    }
    console.log('TEST PASSED')
  }
  process.exit(0)
} else {
  await watch()
}
