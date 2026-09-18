#!/usr/bin/env node
/**
 * §315 — a local capture endpoint standing in for the MO-1 alert channel.
 *
 * The production webhook URL is NOT used: §315 forbids configuration change, and pointing a test at
 * the real channel would page whoever is on it. This captures exactly what the dispatcher would have
 * sent, so the payload can be inspected for both content and redaction.
 */
'use strict';
const http = require('node:http');
const fs = require('node:fs');

const OUT = process.argv[2] || '/tmp/s315-alerts.jsonl';
fs.writeFileSync(OUT, '');

const server = http.createServer((req, res) => {
  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => {
    fs.appendFileSync(OUT, `${Buffer.concat(chunks).toString('utf8')}\n`);
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end('{"received":true}');
  });
});
server.listen(19041, '127.0.0.1', () => process.stdout.write('alert capture listening on 127.0.0.1:19041\n'));
