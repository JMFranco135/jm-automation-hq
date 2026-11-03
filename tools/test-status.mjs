#!/usr/bin/env node
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const ACTIVE_WINDOW_MIN = 5
const INACTIVE_AFTER_MIN = 30

function agentFolderName(folder) {
  return folder.replace(/[^A-Za-z0-9]/g, '-')
}

function parseRecords(lines) {
  const records = []
  for (const line of lines) {
    try {
      const obj = JSON.parse(line)
      if (obj.timestamp) records.push(obj)
    } catch {}
  }
  return records
}

function lastActivity(records) {
  if (!records.length) return null
  const last = records[records.length - 1]
  if (last.timestamp) return new Date(last.timestamp)
  return null
}

function hasTask(records) {
  return records.some(r => r.type === 'user' && r.message && r.message.role === 'user')
}

function simulate({name, records, fileMtime, processRunning}) {
  const now = new Date()
  const activity = lastActivity(records)
  const ageMin = activity ? (now - activity) / 60000 : Infinity
  let status = 'INACTIVE'
  if (!processRunning) status = 'INACTIVE'
  else if (!activity) status = 'INACTIVE'
  else if (!hasTask(records)) status = 'INACTIVE'
  else if (ageMin <= ACTIVE_WINDOW_MIN) status = 'ACTIVE'
  else if (ageMin <= INACTIVE_AFTER_MIN) status = 'IDLE'
  else status = 'INACTIVE'
  return {name, status, ageMin}
}

function test() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'status-test-'))
  const cases = [
    {name:'no session', records:[], fileMtime:null, processRunning:true, expect:'INACTIVE'},
    {name:'terminal opened but no prompt', records:[{type:'mode',timestamp:new Date().toISOString()}], fileMtime:null, processRunning:true, expect:'INACTIVE'},
    {name:'prompt just given', records:[{type:'user',message:{role:'user'},timestamp:new Date(Date.now()-60*1000).toISOString()}], processRunning:true, expect:'ACTIVE'},
    {name:'4 minutes silence', records:[{type:'user',message:{role:'user'},timestamp:new Date(Date.now()-4*60*1000).toISOString()}], processRunning:true, expect:'ACTIVE'},
    {name:'6 minutes silence', records:[{type:'user',message:{role:'user'},timestamp:new Date(Date.now()-6*60*1000).toISOString()}], processRunning:true, expect:'IDLE'},
    {name:'31 minutes silence', records:[{type:'user',message:{role:'user'},timestamp:new Date(Date.now()-31*60*1000).toISOString()}], processRunning:true, expect:'INACTIVE'},
    {name:'sub-agent work only', records:[{type:'assistant',isSidechain:true,timestamp:new Date(Date.now()-60*1000).toISOString()}], processRunning:true, expect:'INACTIVE'},
    {name:'no claude.exe', records:[{type:'user',message:{role:'user'},timestamp:new Date(Date.now()-60*1000).toISOString()}], processRunning:false, expect:'INACTIVE'},
  ]
  let pass = 0
  for (const c of cases) {
    const res = simulate(c)
    const ok = res.status === c.expect
    console.log(`${ok?'PASS':'FAIL'} ${c.name}: got ${res.status}, expected ${c.expect}`)
    if (ok) pass++
  }
  console.log(`${pass}/${cases.length} passed`)
  fs.rmSync(tmp, {recursive:true, force:true})
}

test()
