# Crown — vertical slice

Scan a watch, see what it is worth, track it. A vertical slice built against Chrono24 for the Vertical Slice Studio brief.

## Try it in a browser

https://batuoncel.github.io/crown-app/ — open on a phone and add it to the home screen. Haptics only work in the native app; the camera asks for browser permission.

## Run it on your phone

1. Install **Expo Go** from the App Store (iPhone) or Play Store.
2. On the computer, in this folder:

   ```
   npm install
   npx expo start
   ```

3. Scan the QR code with the iPhone camera (Android: from inside Expo Go). Phone and computer must be on the same Wi-Fi; if not, use `npx expo start --tunnel`.

## The slice

Promise → Goal → About you → Building your plan → Your plan → Camera priming → Scan → Analysing → Result (or "Is this your watch?") → Paywall → Home, plus Alerts, search by name, camera-denied and empty states.

- Every answer changes later screens: goal changes the plan and paywall headline; brands change the scan result; box and papers change the value.
- Answers and the collection persist with AsyncStorage (close and reopen the app to check).
- Every third scan returns a partial match to show the honest-confidence screen.
- **Demo reset:** long-press the Crown logo for about 1 second.
- **Themes:** the round half-circle button (first screen and Home) switches between Classic (paper, racing green, serif) and Navy (dark marketplace look, blue accent, sans-serif). The choice is saved.

## Note for this folder

The project lives in a OneDrive folder, where the dev server may not notice file edits. If a change does not show up, stop the server and run `npx expo start` again.

## Mock backend

`src/data.ts` holds 16 real watch references with 13 monthly median prices (demo values, not live data). `recognise()` picks a believable match from the brands the user named. The paywall takes no payment and leads to a "Welcome to Pro (demo)" screen.

## Structure

- `App.tsx` — fonts, safe area, router with screen transitions
- `src/store.tsx` — state + persistence
- `src/ui.tsx` — icons, buttons, watch illustration, chart, count-up
- `src/screens/` — Onboarding, Scan, Home (paywall, home, alerts)
