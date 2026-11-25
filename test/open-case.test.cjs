const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { test } = require('node:test');
const { runInNewContext } = require('node:vm');

const html = readFileSync(join(__dirname, '../index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

function element() {
  const classes = new Set();
  const listeners = new Map();
  return {
    textContent: '',
    dataset: {},
    style: {},
    children: [],
    set innerHTML(value) {
      this.children = [];
    },
    classList: {
      add: name => classes.add(name),
      remove: name => classes.delete(name),
      contains: name => classes.has(name),
      toggle: (name, enabled) => enabled ? classes.add(name) : classes.delete(name),
    },
    appendChild(child) {
      this.children.push(child);
    },
    addEventListener: (event, callback) => listeners.set(event, callback),
    click: () => listeners.get('click')(),
  };
}

function startGame() {
  const elements = new Map(Array.from(html.matchAll(/\bid="([^"]+)"/g),
    ([, id]) => [id, element()]));
  const get = id => elements.get(id);
  const text = id => String(get(id).textContent);
  const hidden = id => get(id).classList.contains('hidden');
  const timers = [];
  let ready;
  runInNewContext(script, {
    document: {
      getElementById: get,
      createElement: element,
      addEventListener(event, callback) {
        assert.equal(event, 'DOMContentLoaded');
        ready = callback;
      },
    },
    setTimeout: (callback, delay) => timers.push({ callback, delay }),
  });
  ready();
  const open = num => get('cases-container').children.find(box => box.dataset.num === num).click();
  const finishCall = () => {
    const { callback, delay } = timers.shift();
    assert.equal(delay, 1500);
    callback();
    assert.equal(timers.shift().delay, 300);
  };
  open(1);
  return { get, text, hidden, open, finishCall };
}

test('ordinary opening immediately updates remaining cases and round quota', () => {
  const { text, open } = startGame();
  assert.equal(text('s-toopen'), '6个');
  open(2);
  assert.equal(text('s-toopen'), '5个');
  assert.equal(text('s-remain'), '25');
  assert.equal(text('msg-row'), '还需要打开 5 个箱子');
  open(2);
  assert.equal(text('s-toopen'), '5个');
  assert.equal(text('s-remain'), '25');
});

test('every round clears the quota at the last opening and shows the correct offer and next round', () => {
  const { get, text, hidden, open, finishCall } = startGame();
  const schedule = [6, 5, 4, 3, 2, 1, 1, 1, 1];
  let nextBox = 2;
  for (const [index, quota] of schedule.entries()) {
    const round = `${index + 1}/9`;
    const final = index === schedule.length - 1;
    assert.equal(text('s-round'), round);
    assert.equal(text('s-toopen'), `${quota}个`);
    for (let opened = 0; opened < quota; opened++) {
      open(nextBox++);
    }
    assert.equal(text('s-toopen'), '—');
    assert.equal(text('s-remain'), String(28 - nextBox));
    assert.equal(hidden('banker-calling'), false);
    assert.equal(hidden('offer-display'), true);

    finishCall();
    assert.equal(hidden('banker-calling'), true);
    assert.equal(hidden('offer-display'), false);
    assert.equal(text('s-toopen'), '—');
    assert.equal(text('s-round'), round);
    assert.match(text('offer-amount'), /^\$[\d,]+$/);
    assert.equal(text('banker-msg'), final
      ? '这是最终报价！接受还是打开你的箱子？'
      : '银行家开出报价。接受还是继续？');

    get('btn-nodeal').click();
    assert.equal(hidden('offer-display'), true);
  }
  assert.equal(text('s-round'), '9/9');
  assert.equal(text('s-toopen'), '—');
  assert.equal(text('s-remain'), '2');
  assert.equal(hidden('result-modal'), false);
  assert.equal(text('result-title'), '📦 打开你的箱子！');
});
