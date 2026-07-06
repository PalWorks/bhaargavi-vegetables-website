/**
 * Bhaargavi Fresh Cuts — Core Web Vitals logger.
 *
 * Calls the PageSpeed Insights API for a set of key pages and appends the results
 * to a "CoreWebVitals" tab in this spreadsheet. Run weekly via a time trigger so
 * we have a performance history to act on if bounce / drop-off appears.
 *
 * SETUP (one time)
 *   Extensions → Apps Script → add this file (File → +, name it "CoreWebVitals.gs"), Save.
 *   (Optional, higher quota) Project Settings → Script Properties → add:
 *       Name:  PSI_API_KEY   Value: <a Google PageSpeed Insights API key>
 *   Then from the "Bhaargavi" menu choose "Set up weekly Core Web Vitals log" once.
 *   You can also run "Log Core Web Vitals now" any time.
 */

var CWV_SHEET = 'CoreWebVitals';
var CWV_STRATEGY = 'mobile';

// Representative pages (one per template). Keep small to stay within PSI quota.
var CWV_URLS = [
  'https://bhaargavifreshcuts.com/',
  'https://bhaargavifreshcuts.com/category/cut-vegetables/',
  'https://bhaargavifreshcuts.com/products/sambar-onion-peeled/',
  'https://bhaargavifreshcuts.com/faq/',
];

var CWV_HEADER = [
  'Timestamp', 'URL', 'Strategy', 'Perf Score',
  'LCP lab (ms)', 'TBT lab (ms)', 'CLS lab',
  'LCP field (ms)', 'INP field (ms)', 'CLS field', 'Notes',
];

/** Menu action + trigger target: measure every page and append rows. */
function logCoreWebVitals() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CWV_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(CWV_SHEET);
    sheet.appendRow(CWV_HEADER);
    sheet.setFrozenRows(1);
  }

  var key = PropertiesService.getScriptProperties().getProperty('PSI_API_KEY');
  var now = new Date();

  // Apps Script kills a run at ~6 min. PSI's Lighthouse analysis is slow (20-60s/URL),
  // so guard the total: if we're close to the cap, log the rest as skipped rather than
  // letting the run die silently mid-URL (which drops the last row with no trace).
  var start = new Date().getTime();
  var BUDGET_MS = 5 * 60 * 1000;

  for (var i = 0; i < CWV_URLS.length; i++) {
    if (new Date().getTime() - start > BUDGET_MS) {
      sheet.appendRow([now, CWV_URLS[i], CWV_STRATEGY, '', '', '', '', '', '', '', 'skipped: 5-min time budget reached']);
      continue;
    }
    var row = measureUrl_(CWV_URLS[i], key, now);
    sheet.appendRow(row);
  }
}

function measureUrl_(url, key, ts) {
  var api = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'
    + '?url=' + encodeURIComponent(url)
    + '&strategy=' + CWV_STRATEGY
    + '&category=performance';
  if (key) api += '&key=' + key;

  try {
    // Retry once on 429 (quota/rate) or 5xx (transient). Kept to a single short retry
    // so a bad URL can't blow the run's time budget (see BUDGET_MS above).
    var resp, code, attempt = 0, maxAttempts = 2;
    while (true) {
      resp = UrlFetchApp.fetch(api, { muteHttpExceptions: true });
      code = resp.getResponseCode();
      var retryable = code === 429 || code >= 500;
      if (!retryable || attempt >= maxAttempts - 1) break;
      Utilities.sleep(4000);
      attempt++;
    }
    if (code !== 200) {
      var suffix = attempt > 0 ? ' after ' + (attempt + 1) + ' tries' : '';
      return [ts, url, CWV_STRATEGY, '', '', '', '', '', '', '', 'HTTP ' + code + suffix];
    }
    var data = JSON.parse(resp.getContentText());
    var lh = data.lighthouseResult || {};
    var audits = lh.audits || {};
    var perf = (lh.categories && lh.categories.performance && lh.categories.performance.score != null)
      ? Math.round(lh.categories.performance.score * 100) : '';
    var lcpLab = numAudit_(audits['largest-contentful-paint']);
    var tbtLab = numAudit_(audits['total-blocking-time']);
    var clsLab = numAudit_(audits['cumulative-layout-shift']);

    // CrUX field data (only present once the URL has enough real traffic).
    var field = data.loadingExperience && data.loadingExperience.metrics ? data.loadingExperience.metrics : {};
    var lcpField = fieldP75_(field.LARGEST_CONTENTFUL_PAINT_MS);
    var inpField = fieldP75_(field.INTERACTION_TO_NEXT_PAINT);
    var clsFieldRaw = fieldP75_(field.CUMULATIVE_LAYOUT_SHIFT_SCORE);
    var clsField = clsFieldRaw === '' ? '' : clsFieldRaw / 100; // CrUX reports CLS ×100

    var notes = lcpField === '' ? 'lab only (no field data yet)' : 'lab + field';
    return [ts, url, CWV_STRATEGY, perf, lcpLab, tbtLab, clsLab, lcpField, inpField, clsField, notes];
  } catch (e) {
    return [ts, url, CWV_STRATEGY, '', '', '', '', '', '', '', 'error: ' + e];
  }
}

function numAudit_(a) {
  return a && a.numericValue != null ? Math.round(a.numericValue * 1000) / 1000 : '';
}

function fieldP75_(m) {
  return m && m.percentile != null ? m.percentile : '';
}

/** Creates a weekly time-driven trigger for logCoreWebVitals (idempotent). */
function createCwvTrigger() {
  var existing = ScriptApp.getProjectTriggers();
  for (var i = 0; i < existing.length; i++) {
    if (existing[i].getHandlerFunction() === 'logCoreWebVitals') {
      ScriptApp.deleteTrigger(existing[i]);
    }
  }
  ScriptApp.newTrigger('logCoreWebVitals')
    .timeBased()
    .everyWeeks(1)
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(6)
    .create();
  SpreadsheetApp.getUi().alert('✅ Weekly Core Web Vitals logging is set up (Mondays ~6 AM).');
}
