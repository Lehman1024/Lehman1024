/**
 * Fetch public GitHub profile data and verified contribution counts for the cultivation profile.
 *
 * @author Lehman+AI
 * @site https://www.lehman.top
 * @since 2026/10/10 17:30
 */

const API_URL = 'https://api.github.com';
const DAY_MS = 86_400_000;

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(20_000),
    headers: {
      'User-Agent': 'GitHub-Cultivation-Profile',
      'Accept-Language': 'en-US',
      ...options.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`GitHub request failed: HTTP ${response.status} (${new URL(url).pathname})`);
  }
  return response;
}

function apiHeaders(token) {
  return {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function isCalendarDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value;
}

/** Summarize a verified continuous calendar; an unobserved day is never treated as zero. */
export function summarizeContributions(inputDays, total, today = new Date().toISOString().slice(0, 10)) {
  if (!Array.isArray(inputDays) || !isCalendarDate(today) || !Number.isInteger(total) || total < 0
    || inputDays.some(day => !isCalendarDate(day?.date) || !Number.isInteger(day.count) || day.count < 0)) {
    return null;
  }

  const days = [...inputDays].filter(day => day.date <= today).sort((a, b) => a.date.localeCompare(b.date));
  if (!days.length || days.some((day, i) => i > 0 && Date.parse(day.date) - Date.parse(days[i - 1].date) !== DAY_MS)) return null;

  const counts = new Map(days.map(day => [day.date, day.count]));
  let running = 0;
  let longestStreak = 0;
  let previousDate;
  for (const day of days) {
    const consecutive = previousDate && Date.parse(day.date) - Date.parse(previousDate) === DAY_MS;
    running = day.count > 0 ? (consecutive ? running + 1 : 1) : 0;
    longestStreak = Math.max(longestStreak, running);
    previousDate = day.date;
  }

  const todayCount = counts.get(today) ?? null;
  let currentStreak = todayCount === null ? null : 0;
  if (currentStreak !== null) {
    let cursor = Date.parse(today) - (todayCount > 0 ? 0 : DAY_MS);
    while ((counts.get(new Date(cursor).toISOString().slice(0, 10)) ?? 0) > 0) {
      currentStreak += 1;
      cursor -= DAY_MS;
    }
  }

  return { total, days, today: todayCount, currentStreak, longestStreak };
}

function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`))?.[1];
}

/** Parse exact counts from GitHub's public calendar, never from its color levels. */
export function parseContributionsHtml(html, today) {
  const tooltipCounts = new Map();
  for (const match of html.matchAll(/<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/gi)) {
    const id = attribute(match[1], 'for');
    const count = match[2].replace(/<[^>]+>/g, '').trim().match(/^(No|[\d,]+) contributions?\b/i);
    if (id && count) tooltipCounts.set(id, count[1].toLowerCase() === 'no' ? 0 : Number(count[1].replaceAll(',', '')));
  }

  const days = [];
  for (const match of html.matchAll(/<(?:td|rect)\b[^>]*\bdata-date=["'][^"']+["'][^>]*>/gi)) {
    const date = attribute(match[0], 'data-date');
    const rawCount = attribute(match[0], 'data-count');
    const count = rawCount !== undefined && /^\d+$/.test(rawCount)
      ? Number(rawCount)
      : tooltipCounts.get(attribute(match[0], 'id'));
    if (count === undefined) return null;
    days.push({ date, count });
  }
  if (!days.length) return null;

  const heading = html.match(/<h2\b[^>]*id=["']js-contribution-activity-description["'][^>]*>([\s\S]*?)<\/h2>/i)?.[1];
  const totalMatch = heading?.replace(/<[^>]+>/g, '').match(/([\d,]+)\s+contributions?\b/i);
  const total = totalMatch ? Number(totalMatch[1].replaceAll(',', '')) : days.reduce((sum, day) => sum + day.count, 0);
  return summarizeContributions(days, total, today);
}

async function fetchContributions(username, token) {
  if (token) {
    try {
      const response = await request(`${API_URL}/graphql`, {
        method: 'POST',
        headers: { ...apiHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query ProfileContributions($login: String!) {
            user(login: $login) {
              contributionsCollection {
                contributionCalendar {
                  totalContributions
                  weeks { contributionDays { date contributionCount } }
                }
              }
            }
          }`,
          variables: { login: username },
        }),
      });
      const result = await response.json();
      const calendar = result.data?.user?.contributionsCollection?.contributionCalendar;
      if (result.errors?.length || !calendar) throw new Error('Contribution calendar is unavailable');
      const summary = summarizeContributions(
        calendar.weeks.flatMap(week => week.contributionDays.map(day => ({ date: day.date, count: day.contributionCount }))),
        calendar.totalContributions,
      );
      if (summary) return summary;
    } catch (error) {
      console.warn(`GraphQL contributions unavailable; trying public calendar. ${error.message}`);
    }
  }

  try {
    const response = await request(`https://github.com/users/${encodeURIComponent(username)}/contributions`);
    const summary = parseContributionsHtml(await response.text());
    if (!summary) console.warn('Public contribution counts could not be verified; displaying unknown.');
    return summary;
  } catch (error) {
    console.warn(`Contributions unavailable; displaying unknown. ${error.message}`);
    return null;
  }
}

/** Fetch public account metadata, original repositories, and a verified contribution calendar. */
export async function fetchProfile(username) {
  if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username)) {
    throw new Error('PROFILE_USERNAME must be a valid GitHub username.');
  }
  const token = process.env.GITHUB_TOKEN?.trim();
  const headers = apiHeaders(token);
  const response = await request(`${API_URL}/users/${encodeURIComponent(username)}`, { headers });
  const user = await response.json();
  const repositories = [];
  for (let page = 1; ; page += 1) {
    const repoResponse = await request(`${API_URL}/users/${encodeURIComponent(username)}/repos?type=owner&per_page=100&page=${page}`, { headers });
    const batch = await repoResponse.json();
    repositories.push(...batch.filter(repo => !repo.private && !repo.fork));
    if (batch.length < 100) break;
  }

  const languageCounts = new Map();
  for (const repository of repositories) {
    if (repository.language) languageCounts.set(repository.language, (languageCounts.get(repository.language) ?? 0) + 1);
  }
  return {
    username: user.login,
    name: user.name || user.login,
    createdAt: user.created_at,
    publicRepos: user.public_repos,
    followers: user.followers,
    stars: repositories.reduce((sum, repository) => sum + repository.stargazers_count, 0),
    languages: [...languageCounts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    contributions: await fetchContributions(username, token),
    updatedAt: new Date().toISOString(),
  };
}
