const MARKETPLACE = {
  formId: '1b9AaQUOesJ3PlX8w3FdKG8FdYUXa-Yac05PuAgQx4IE',
  spreadsheetId: '',
  sheetName: 'Form Responses 1',
  statusHeader: 'Listing Status',
  listingIdHeader: 'Listing ID',
  firebaseSyncHeader: 'Firebase Sync',
  firebaseProjectId: 'smm-marketplace-3a2a8',
  firebaseCollection: 'marketplaceListings',
  approvedStatus: 'Approved'
};

function buildMarketplaceForm() {
  const form = FormApp.openById(MARKETPLACE.formId);
  form.setTitle('SMM Solutions Buy & Sell — Post a Listing');
  form.setDescription('Submit your listing for review. Approved listings may appear on the SMM Solutions Buy & Sell page. Do not submit illegal, unsafe, counterfeit, or misleading items.');
  form.getItems().forEach(item => form.deleteItem(item));

  form.addTextItem().setTitle('Your name').setRequired(true);
  form.addTextItem().setTitle('Facebook or Messenger profile link').setHelpText('Buyers will use this link to contact you.').setRequired(true);
  form.addListItem().setTitle('Listing type').setChoiceValues(['Buy & Sell', 'For Hire', 'Looking For']).setRequired(true);
  form.addTextItem().setTitle('Item title').setRequired(true);
  form.addListItem().setTitle('Category').setChoiceValues(['Electronics', 'Fashion', 'Home & Living', 'Services', 'Collectibles', 'Other']).setRequired(true);
  form.addTextItem().setTitle('Price in PHP').setHelpText('Numbers only, for example: 1500').setRequired(true);
  form.addListItem().setTitle('Item condition').setChoiceValues(['Brand new', 'Like new', 'Used — good condition', 'Used — fair condition', 'Service / digital item']).setRequired(true);
  form.addParagraphTextItem().setTitle('Description').setHelpText('Describe the item honestly, including important details or defects.').setRequired(true);
  form.addTextItem().setTitle('Location or meet-up area').setRequired(true);
  form.addTextItem().setTitle('Public photo link (optional)').setHelpText('Use a publicly viewable image link. Do not upload private files.');
  form.addCheckboxItem().setTitle('Listing rules agreement').setChoiceValues(['I confirm that this listing is legal, accurate, and does not contain prohibited or misleading items.']).setRequired(true);
  form.setConfirmationMessage('Thank you. Your listing was received and is pending review. Only approved listings will appear publicly.');
}

function connectMarketplaceSheet() {
  const form = FormApp.openById(MARKETPLACE.formId);
  const savedId = PropertiesService.getScriptProperties().getProperty('marketplaceSpreadsheetId');
  let spreadsheet;
  if (MARKETPLACE.spreadsheetId || savedId) {
    spreadsheet = SpreadsheetApp.openById(MARKETPLACE.spreadsheetId || savedId);
  } else {
    spreadsheet = SpreadsheetApp.create('SMM Solutions Buy & Sell — Listings');
  }
  PropertiesService.getScriptProperties().setProperty('marketplaceSpreadsheetId', spreadsheet.getId());
  form.setDestination(FormApp.DestinationType.SPREADSHEET, spreadsheet.getId());
  Utilities.sleep(1000);
  const sheet = spreadsheet.getSheetByName(MARKETPLACE.sheetName) || spreadsheet.getSheets()[0];
  ensureMarketplaceColumns_(sheet);
  installMarketplaceTriggers_(spreadsheet);
  Logger.log('Review sheet: ' + spreadsheet.getUrl());
}

function ensureMarketplaceColumns_(sheet) {
  let lastColumn = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  [MARKETPLACE.listingIdHeader, MARKETPLACE.statusHeader, MARKETPLACE.firebaseSyncHeader].forEach(header => {
    if (!headers.includes(header)) {
      lastColumn += 1;
      sheet.getRange(1, lastColumn).setValue(header);
      headers.push(header);
    }
  });
  const statusColumn = headers.indexOf(MARKETPLACE.statusHeader) + 1;
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Pending review', 'Approved', 'Declined', 'Removed'], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, statusColumn, Math.max(sheet.getMaxRows() - 1, 1), 1).setDataValidation(rule);
}

function installMarketplaceTriggers_(spreadsheet) {
  const handlers = ScriptApp.getProjectTriggers().map(trigger => trigger.getHandlerFunction());
  if (!handlers.includes('onMarketplaceSubmit')) {
    ScriptApp.newTrigger('onMarketplaceSubmit').forSpreadsheet(spreadsheet).onFormSubmit().create();
  }
}

function onMarketplaceSubmit(event) {
  const sheet = event.range.getSheet();
  ensureMarketplaceColumns_(sheet);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = event.range.getRow();
  const idColumn = headers.indexOf(MARKETPLACE.listingIdHeader) + 1;
  const statusColumn = headers.indexOf(MARKETPLACE.statusHeader) + 1;
  const listingId = 'MKT-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd') + '-' + String(row - 1).padStart(4, '0');
  sheet.getRange(row, idColumn).setValue(listingId);
  sheet.getRange(row, statusColumn).setValue('Pending review');
  try {
    syncListingToFirebase_(sheet, row, headers);
  } catch (error) {
    const syncColumn = headers.indexOf(MARKETPLACE.firebaseSyncHeader) + 1;
    sheet.getRange(row, syncColumn).setValue('Sync failed: ' + error.message);
  }
}

// Sends Google Form submissions to the same Firebase review queue used by the
// website. The listing stays pending until you manually change status in the
// Firebase Console.
function syncListingToFirebase_(sheet, row, headers) {
  const values = sheet.getRange(row, 1, 1, headers.length).getDisplayValues()[0];
  const value = title => values[headers.indexOf(title)] || '';
  const listingId = value(MARKETPLACE.listingIdHeader);
  if (!listingId) throw new Error('No listing ID was generated.');

  const price = Number(String(value('Price in PHP')).replace(/[^0-9.]/g, '')) || 0;
  const firebaseStatus = value(MARKETPLACE.statusHeader) === MARKETPLACE.approvedStatus ? 'approved' : 'pending';
  const fields = {
    ownerUid: { stringValue: 'form-' + listingId },
    ownerName: { stringValue: value('Your name') },
    ownerEmail: { stringValue: '' },
    contact: { stringValue: value('Facebook or Messenger profile link') },
    type: { stringValue: value('Listing type') },
    title: { stringValue: value('Item title') },
    category: { stringValue: value('Category') },
    price: { doubleValue: price },
    condition: { stringValue: value('Item condition') },
    description: { stringValue: value('Description') },
    location: { stringValue: value('Location or meet-up area') },
    image: { stringValue: value('Public photo link (optional)') },
    status: { stringValue: firebaseStatus },
    createdAt: { timestampValue: new Date().toISOString() },
    source: { stringValue: 'google-form' }
  };

  const url = 'https://firestore.googleapis.com/v1/projects/' + MARKETPLACE.firebaseProjectId + '/databases/(default)/documents/' + MARKETPLACE.firebaseCollection + '/' + encodeURIComponent(listingId);
  const response = UrlFetchApp.fetch(url, {
    method: 'patch',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    payload: JSON.stringify({ fields: fields }),
    muteHttpExceptions: true
  });
  if (response.getResponseCode() >= 300) throw new Error(response.getContentText());
  const syncColumn = headers.indexOf(MARKETPLACE.firebaseSyncHeader) + 1;
  sheet.getRange(row, syncColumn).setValue('Synced to Firebase');
}

// Run this once after adding the integration to send older form responses into
// Firebase. It does not publish them; each remains pending for review.
function syncExistingListingsToFirebase() {
  const savedId = PropertiesService.getScriptProperties().getProperty('marketplaceSpreadsheetId');
  const spreadsheet = SpreadsheetApp.openById(MARKETPLACE.spreadsheetId || savedId);
  const sheet = spreadsheet.getSheetByName(MARKETPLACE.sheetName) || spreadsheet.getSheets()[0];
  ensureMarketplaceColumns_(sheet);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  for (let row = 2; row <= sheet.getLastRow(); row++) {
    if (sheet.getRange(row, headers.indexOf(MARKETPLACE.listingIdHeader) + 1).getValue()) syncListingToFirebase_(sheet, row, headers);
  }
}

function doGet(event) {
  const callback = String(event.parameter.callback || '').replace(/[^a-zA-Z0-9_]/g, '');
  const savedId = PropertiesService.getScriptProperties().getProperty('marketplaceSpreadsheetId');
  const spreadsheet = SpreadsheetApp.openById(MARKETPLACE.spreadsheetId || savedId);
  const sheet = spreadsheet.getSheetByName(MARKETPLACE.sheetName) || spreadsheet.getSheets()[0];
  const values = sheet.getDataRange().getDisplayValues();
  const headers = values.shift();
  const index = title => headers.indexOf(title);
  const status = index(MARKETPLACE.statusHeader);
  const data = values.filter(row => row[status] === MARKETPLACE.approvedStatus).map(row => ({
    id: row[index(MARKETPLACE.listingIdHeader)],
    type: row[index('Listing type')],
    title: row[index('Item title')],
    category: row[index('Category')],
    price: row[index('Price in PHP')],
    description: row[index('Description')],
    location: row[index('Location or meet-up area')],
    image: row[index('Public photo link (optional)')],
    contact: row[index('Facebook or Messenger profile link')]
  }));
  const json = JSON.stringify(data);
  return ContentService.createTextOutput(callback ? callback + '(' + json + ');' : json)
    .setMimeType(callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}
