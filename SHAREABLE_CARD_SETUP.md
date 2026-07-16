# Safe Premium Link Cards: Firebase setup

This version adds one protected free card per signed-in user each day, paid token balances, a daily service limit, social previews, and server-side click counts.

## Before publishing

The automatic Facebook and WhatsApp previews use Firebase Cloud Functions and Storage. Firebase requires the project to be on the Blaze plan with a payment method before these services can be deployed. The limits in the code are intentionally conservative:

- 1 free card per signed-in user per day
- 100 total new cards per day across the service
- Free cards active for 30 days; premium cards active for 90 days
- Premium cards require 1 token

## One-time Firebase Console setup

1. In **Authentication**, enable **Google** sign-in.
2. In **Authentication → Settings → Authorized domains**, add both `prboosting.github.io` and your Firebase Hosting domain after it is shown during deployment.
3. Upgrade the existing `smm-marketplace-3a2a8` project to the Blaze plan, then set a low billing budget alert.
4. In **Storage**, create the default Storage bucket if Firebase asks you to do so.

## Publish the protected service

From this project folder:

```powershell
npm install -g firebase-tools
firebase login
firebase use smm-marketplace-3a2a8
firebase deploy --only functions,hosting,firestore:rules,storage
```

The deployment publishes the static site, the card-preview pages, Firestore rules, Storage rules, and the protected card service together.

## Add premium tokens after payment

When a customer pays, ask for the Google email they used to sign in. In Firebase Console:

1. Open **Firestore Database**.
2. Open the `cardUsers` collection.
3. Open the customer's document by searching the `userEmail` field. A document is created automatically when they create their first free card.
4. Set the `tokenBalance` field to the number of tokens purchased.

The customer can see their balance but cannot edit it. Only Firebase Console administrators can add tokens.

## What a customer receives

- **Free daily card:** image and destination link, with a standard title and description.
- **Premium card:** custom image, title, description, Facebook/WhatsApp preview, click count, and a 90-day active period.

Do not publish the new Firestore rules until you are ready to deploy the Functions service at the same time. The rules intentionally block browser-only card creation so people cannot bypass the daily and token limits.
