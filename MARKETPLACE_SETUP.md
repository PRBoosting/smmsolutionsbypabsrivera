# Marketplace setup

Use `marketplace-automation.gs` in a Google Apps Script project owned by the marketplace administrator.

1. Open `script.google.com` and create a project.
2. Replace `Code.gs` with the content of `marketplace-automation.gs`.
3. Run `buildMarketplaceForm`, then run `connectMarketplaceSheet`; allow the requested permissions.
4. In Project Settings, enable **Show appsscript.json manifest file in editor**. Open the new `appsscript.json` file and replace it with the contents of `marketplace-appsscript.json`. Save, then run `connectMarketplaceSheet` again and approve the new permission request.
5. Open the logged review-sheet URL. New listings receive an ID, the status `Pending review`, and `Synced to Firebase` in the `Firebase Sync` column.
6. Run `syncExistingListingsToFirebase` once to send any older form submissions to Firebase. They remain pending.
7. Review submissions in Firebase Console → Firestore Database → `marketplaceListings`. Change `status` from `pending` to `approved` to show the listing on the website.
8. In Apps Script, choose **Deploy > New deployment > Web app**. Execute as yourself; set access to **Anyone**. Copy the `/exec` URL.
9. Paste that URL into `MARKETPLACE_ENDPOINT` in `marketplace.js` and the published form URL into `LISTING_FORM_URL` in the same file.

The public endpoint outputs only `Approved` rows. Do not put customer email addresses, private notes, or payment details in the published sheet fields.
