/**
 * Bhaargavi Fresh Cuts — spreadsheet-side helpers.
 *
 * Adds a "Bhaargavi" menu to the spreadsheet with one action:
 *   "Publish catalog to website" → triggers the GitHub `publish.yml` workflow, which
 *   re-reads ProductCatalog, rebuilds, and deploys the site (live in ~2-3 min).
 *
 * SETUP (one time)
 *   Extensions → Apps Script → add this file (File → +, name it "Publish.gs"), Save.
 *   Then set a GitHub token so the Publish button can trigger a deploy:
 *     Apps Script → Project Settings (gear) → Script Properties → Add property
 *       Name:  PUSH_TO_GITHUB_TOKEN
 *       Value: <a GitHub token — see apps-script/README.md for how to create it>
 *   Reload the spreadsheet; the "Bhaargavi" menu appears.
 */

var GITHUB_OWNER = 'PalWorks';
var GITHUB_REPO = 'bhaargavi-vegetables-website';
var PUBLISH_WORKFLOW = 'publish.yml';
var CATALOG_SHEET = 'ProductCatalog';

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Bhaargavi')
    .addItem('Publish catalog to website', 'publishToWebsite')
    .addToUi();
}

/** Triggers the publish.yml workflow on GitHub (workflow_dispatch). */
function publishToWebsite() {
  var ui = SpreadsheetApp.getUi();
  var token = PropertiesService.getScriptProperties().getProperty('PUSH_TO_GITHUB_TOKEN');
  if (!token) {
    ui.alert('No PUSH_TO_GITHUB_TOKEN set.\n\nAdd it in Project Settings → Script Properties. See apps-script/README.md.');
    return;
  }
  var url = 'https://api.github.com/repos/' + GITHUB_OWNER + '/' + GITHUB_REPO +
    '/actions/workflows/' + PUBLISH_WORKFLOW + '/dispatches';
  var resp = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    payload: JSON.stringify({ ref: 'main' }),
    muteHttpExceptions: true,
  });
  var code = resp.getResponseCode();
  if (code === 204) {
    ui.alert('✅ Publish started.\n\nThe website will update in about 2-3 minutes.\nTrack it under the repo\'s Actions tab.');
  } else {
    ui.alert('Publish failed (HTTP ' + code + ').\n\n' + resp.getContentText());
  }
}

