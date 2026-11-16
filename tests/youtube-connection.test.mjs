import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

// Compile the actual browser modules without requiring a DOM or a running YouTube server.
function compile(file, globals = {}) {
  const exports = {};
  const source = readFileSync(new URL(`../app/${file}.ts`, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  vm.runInNewContext(outputText, { exports, ...globals });
  return exports;
}

function setup() {
  const messages = new Set();
  const loads = new Set();
  const timers = new Map();
  const sent = [];
  let reloads = 0;
  let ready = 0;
  let failed = 0;
  let timerId = 0;
  const navigator = { onLine: true };
  const iframe = {
    contentWindow: { postMessage: (data) => sent.push(JSON.parse(data)) },
    get src() { return 'https://www.youtube.com/embed/test?enablejsapi=1'; },
    set src(value) { assert.equal(value, this.src); reloads++; },
    addEventListener: (_, fn) => loads.add(fn),
    removeEventListener: (_, fn) => loads.delete(fn),
  };
  const window = {
    setInterval: (fn) => { timers.set(++timerId, fn); return timerId; },
    clearInterval: (id) => timers.delete(id),
    addEventListener: (_, fn) => messages.add(fn),
    removeEventListener: (_, fn) => messages.delete(fn),
  };
  const media = compile('media');
  const { connectYouTubePlayer } = compile('youtube-connection', {
    window, navigator, require: () => media,
  });
  let sentAtReady = null;
  const onReady = () => { ready++; sentAtReady = sent.length; };
  const connect = () => connectYouTubePlayer(iframe, 'test-player', onReady, () => failed++);
  const stop = connect();
  return {
    sent, timers, messages, loads, navigator, connect, stop,
    get reloads() { return reloads; },
    get ready() { return ready; },
    get sentAtReady() { return sentAtReady; },
    get failed() { return failed; },
    tick(ms) { for (let t = 0; t < ms; t += 250) for (const fn of [...timers.values()]) fn(); },
    reply(event = 'onReady', info, overrides = {}) {
      for (const fn of [...messages]) fn({
        source: iframe.contentWindow, origin: 'https://www.youtube.com',
        data: JSON.stringify({ event, info }), ...overrides,
      });
    },
  };
}

const subscription = {
  event: 'command', func: 'addEventListener', args: ['onStateChange'],
  id: 'test-player', channel: 'widget',
};

test('retries a lost handshake, including when iframe load already happened', () => {
  const s = setup();
  assert.equal(s.sent.length, 1);
  s.tick(1000);
  assert.equal(s.sent.length, 5);
  s.reply();
  s.tick(60000);
  assert.equal(s.ready, 1);
  assert.equal(s.failed, 0);
  assert.equal(s.reloads, 0);
  assert.equal(s.sent.length, 6);
  assert.equal(s.messages.size + s.loads.size + s.timers.size, 0);
});

test('subscribes to state changes once the player answers, before reporting ready', () => {
  const s = setup();
  s.tick(500);
  assert.ok(s.sent.every((message) => message.event === 'listening'));
  s.reply('initialDelivery', { playerState: -1 });
  s.reply('onReady');
  s.tick(1000);
  assert.deepEqual(s.sent.at(-1), subscription);
  assert.equal(s.sent.filter((message) => message.func === 'addEventListener').length, 1);
  assert.equal(s.ready, 1);
  assert.equal(s.sentAtReady, s.sent.length);
});

test('subscribes again after a reloaded iframe answers', () => {
  const s = setup();
  s.tick(12000);
  assert.equal(s.reloads, 1);
  assert.ok(!s.sent.some((message) => message.func === 'addEventListener'));
  s.reply();
  assert.deepEqual(s.sent.at(-1), subscription);
});

test('reloads only twice, then fails and allows a fresh connection attempt', () => {
  const s = setup();
  s.tick(36000);
  assert.equal(s.reloads, 2);
  assert.equal(s.failed, 1);
  s.tick(120000);
  assert.equal(s.reloads, 2);
  assert.equal(s.timers.size, 0);
  s.connect();
  s.reply('initialDelivery', { playerState: -1 });
  assert.equal(s.ready, 1);
  assert.equal(s.timers.size, 0);
});

test('recovers after a failed first iframe navigation without using remaining reloads', () => {
  const s = setup();
  s.tick(12000);
  assert.equal(s.reloads, 1);
  for (const load of s.loads) load();
  s.reply('initialDelivery', { playerState: -1 });
  s.tick(60000);
  assert.equal(s.reloads, 1);
  assert.equal(s.ready, 1);
  assert.equal(s.failed, 0);
});

test('accepts state delivery if the one-time ready event was missed', () => {
  const s = setup();
  s.reply('infoDelivery', { currentTime: 0 });
  assert.equal(s.ready, 0);
  s.reply('infoDelivery', { playerState: 2 });
  assert.equal(s.ready, 1);
  assert.equal(s.timers.size, 0);
});

test('ignores unrelated frames, foreign origins and malformed messages', () => {
  const s = setup();
  s.reply('onReady', null, { source: {} });
  s.reply('onReady', null, { origin: 'https://example.com' });
  s.reply('onReady', null, { data: 'invalid JSON' });
  s.reply('onReady', null, { data: 'null' });
  assert.equal(s.ready, 0);
  s.reply();
  assert.equal(s.ready, 1);
});

test('does not exhaust retries offline and resumes when the network returns', () => {
  const s = setup();
  s.navigator.onLine = false;
  s.tick(120000);
  assert.equal(s.reloads, 0);
  assert.equal(s.failed, 0);
  s.navigator.onLine = true;
  s.tick(250);
  assert.equal(s.sent.length, 2);
  s.reply();
  assert.equal(s.ready, 1);
});

test('unmount cleanup stops all retries and ignores late readiness', () => {
  const s = setup();
  s.stop();
  s.tick(120000);
  s.reply();
  assert.equal(s.ready, 0);
  assert.equal(s.failed, 0);
  assert.equal(s.reloads, 0);
  assert.equal(s.messages.size + s.loads.size + s.timers.size, 0);
});

test('a native play after another source claimed is decided by its state change', () => {
  const { createPlaybackGate, claimPlayback, acknowledgePause, decidePlayback } = compile('media');
  const gate = createPlaybackGate();
  claimPlayback(gate, 'video');
  claimPlayback(gate, 'spotify');
  assert.equal(decidePlayback(gate, 'video', false, true), 'suppress');
  assert.equal(decidePlayback(gate, 'video', true, true), 'suppress');
  acknowledgePause(gate, 'video');
  assert.equal(decidePlayback(gate, 'video', false, true), 'wait');
  assert.equal(decidePlayback(gate, 'video', true, true), 'allow');
  assert.equal(decidePlayback(gate, 'video', true, false), 'suppress');
  claimPlayback(gate, 'video');
  assert.equal(decidePlayback(gate, 'video', false, true), 'allow');
});
