#!/usr/bin/env node
/*
 * SYNTHETIC LOCAL TRANSPORT FIXTURE -- an Ollama-protocol `/api/chat` server used ONLY to drive
 * the REAL shipped `OllamaReasoningProvider` and the REAL frozen `runValidatedReasoning` through
 * every branch of the frozen transport taxonomy, so the `D-K` classification is verified against
 * genuine provider-boundary behaviour rather than against a hand-written mock of it.
 *
 * IT CONTACTS NOTHING. It binds 127.0.0.1, speaks only to this machine, holds no credential, and
 * has no outbound network primitive of any kind. It never sees a Run-2 observation: the
 * verification suite sends only observation text it authored itself.
 *
 * The scripted response sequence is supplied per-scenario over `/__script` and replayed in order;
 * the last entry repeats. Every response is a fixed literal -- there is no model here.
 */
'use strict';
const http = require('http');

const PORT = Number(process.env.FIXTURE_PORT || 11991);
let script = [];
let cursor = 0;
const issued = [];

/** A structurally valid, non-refusal-shaped proposal object. Authored here; no model produced it. */
const PLAIN_OBJECT = JSON.stringify({ hazardCandidates: [], unresolvedDecisions: [] });

function respond(res, entry) {
  if (entry.status && entry.status !== 200) {
    res.writeHead(entry.status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: { type: 'fixture', message: `HTTP ${entry.status}` } }));
    return;
  }
  if (entry.mode === 'NON_JSON_BODY') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end('this body is not json');
    return;
  }
  const envelope = {
    model: 'fixture',
    done: true,
    done_reason: entry.mode === 'TRUNCATED' ? 'length' : 'stop',
    prompt_eval_count: 100,
    eval_count: 10,
    message: { role: 'assistant', content: entry.content !== undefined ? entry.content : PLAIN_OBJECT },
  };
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(envelope));
}

const server = http.createServer((req, res) => {
  let body = '';
  req.on('data', (c) => { body += c; });
  req.on('end', () => {
    if (req.url === '/__script' && req.method === 'POST') {
      script = JSON.parse(body); cursor = 0; issued.length = 0;
      res.writeHead(200); res.end('{"ok":true}'); return;
    }
    if (req.url === '/__issued') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ issued: issued.length })); return;
    }
    if (req.url === '/api/chat' && req.method === 'POST') {
      issued.push(1);
      const entry = script[Math.min(cursor, script.length - 1)] || { mode: 'OK' };
      cursor += 1;
      if (entry.mode === 'HANG') return;              // never responds -> exercises TIMEOUT
      respond(res, entry);
      return;
    }
    res.writeHead(404); res.end('{}');
  });
});

server.listen(PORT, '127.0.0.1', () => {
  process.stdout.write(`fixture listening on 127.0.0.1:${PORT}\n`);
});
