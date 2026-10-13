/**
 * Verify contribution-calendar integrity, exact public counts, and missing-data behavior.
 *
 * @author Lehman+AI
 * @site https://www.lehman.top
 * @since 2026/10/13 16:27
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { parseContributionsHtml, summarizeContributions } from './github-data.mjs';

const calendarHtml = `
<h2 id="js-contribution-activity-description">1,202 contributions in the last year</h2>
<table><tbody><tr>
  <td id="day-11" data-date="2026-10-11" data-level="1"></td>
  <td id="day-12" data-date="2026-10-12" data-level="4"></td>
  <td id="day-13" data-date="2026-10-13" data-level="0"></td>
</tr></tbody></table>
<tool-tip for="day-11">1,201 contributions on October 11.</tool-tip>
<tool-tip for="day-12"><span>1 contribution on October 12.</span></tool-tip>
<tool-tip for="day-13">No contributions on October 13.</tool-tip>`;

test('an observed zero today preserves the contribution streak through yesterday', () => {
  const input = [
    { date: '2026-10-13', count: 0 },
    { date: '2026-10-12', count: 2 },
    { date: '2026-10-11', count: 1 },
    { date: '2026-10-10', count: 0 },
  ];
  const summary = summarizeContributions(input, 3, '2026-10-13');
  assert.equal(summary.today, 0);
  assert.equal(summary.currentStreak, 2);
  assert.equal(summary.longestStreak, 2);
  assert.equal(summary.days[0].date, '2026-10-10');
  assert.equal(input[0].date, '2026-10-13');
});

test('contributing today extends the streak across a valid leap day', () => {
  const summary = summarizeContributions([
    { date: '2024-02-28', count: 1 },
    { date: '2024-02-29', count: 2 },
    { date: '2024-03-01', count: 3 },
  ], 6, '2024-03-01');
  assert.equal(summary.today, 3);
  assert.equal(summary.currentStreak, 3);
  assert.equal(summary.longestStreak, 3);
});

test('an absent today is unknown, while a known zero is zero', () => {
  const missing = summarizeContributions([{ date: '2026-10-12', count: 0 }], 0, '2026-10-13');
  const observed = summarizeContributions([{ date: '2026-10-13', count: 0 }], 0, '2026-10-13');
  assert.equal(missing.today, null);
  assert.equal(missing.currentStreak, null);
  assert.equal(observed.today, 0);
  assert.equal(observed.currentStreak, 0);
});

test('a missing interior date invalidates the calendar rather than shifting later cells', () => {
  assert.equal(summarizeContributions([
    { date: '2026-10-11', count: 2 },
    { date: '2026-10-13', count: 0 },
  ], 2, '2026-10-13'), null);
});

test('impossible and malformed calendar dates are rejected', () => {
  for (const date of ['2026-02-30', '2026-02-29', '2026-13-01', '2026-10-00', '2026-1-01', null]) {
    assert.equal(summarizeContributions([{ date, count: 1 }], 1, '2026-12-31'), null, String(date));
  }
  assert.equal(summarizeContributions([{ date: '2026-10-13', count: 1 }], 1, '2026-02-30'), null);
});

test('duplicate days, invalid counts, and empty data are rejected', () => {
  const day = { date: '2026-10-13', count: 1 };
  assert.equal(summarizeContributions([day, day], 2, '2026-10-13'), null);
  for (const count of [-1, 0.5, '1']) {
    assert.equal(summarizeContributions([{ ...day, count }], 1, '2026-10-13'), null);
  }
  assert.equal(summarizeContributions([], 0, '2026-10-13'), null);
  assert.equal(summarizeContributions([day], -1, '2026-10-13'), null);
});

test('public tooltip counts include thousands, singular contributions, and explicit zero', () => {
  const summary = parseContributionsHtml(calendarHtml, '2026-10-13');
  assert.equal(summary.total, 1202);
  assert.deepEqual(summary.days.map(day => day.count), [1201, 1, 0]);
  assert.equal(summary.currentStreak, 2);
  assert.equal(summary.longestStreak, 2);
});

test('a missing HTML calendar cell cannot silently become a zero day', () => {
  const incomplete = calendarHtml.replace(/<td id="day-12"[^>]*><\/td>/, '');
  assert.notEqual(incomplete, calendarHtml);
  assert.equal(parseContributionsHtml(incomplete, '2026-10-13'), null);
});

test('unverified tooltips do not fall back to contribution color levels', () => {
  const unverifiable = calendarHtml.replace('1 contribution on October 12.', 'Activity on October 12.');
  assert.equal(parseContributionsHtml(unverifiable, '2026-10-13'), null);
});

test('explicit data-count calendars work without tooltips or a total heading', () => {
  const summary = parseContributionsHtml(`
    <svg><rect data-date="2026-10-12" data-count="2"/>
    <rect data-date="2026-10-13" data-count="0"/></svg>`, '2026-10-13');
  assert.equal(summary.total, 2);
  assert.equal(summary.today, 0);
  assert.equal(summary.currentStreak, 1);
});
