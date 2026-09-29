# O_Cubed — Atelier Vaux (React Native)

A React Native (Expo) implementation of the **O_Cubed / Atelier Vaux** couture
atelier app, built from the Claude Design handoff (`Atelier Vaux.dc.html`).

It reproduces all nine surfaces of the prototype: login, the app shell with a
left nav rail, the searchable client list, client detail (Measurements +
Designs tabs), the two-step garment picker, the freehand **sketch canvas**, the
export / spec-sheet screen, pricing, and settings — plus the new-client modal
and couture toasts.

Built on **Expo SDK 54** (React Native 0.81, React 19, Reanimated 4).

## Requirements

- Node 18+
- The Expo tooling (installed as a dependency; no global install required)
- iOS Simulator / Android emulator, or the **Expo Go** app (SDK 54) on a device

## Run it

```bash
npm install
npx expo start
```

Then press `i` for the iOS simulator, `a` for Android, or scan the QR code with
Expo Go. The app is oriented for tablets (the original is an iPad design) but is
responsive down to phone widths.

> **The sketch canvas uses `@shopify/react-native-skia`**, a native module that
> is not bundled in Expo Go. In Expo Go the rest of the app works, but the
> canvas screen shows a "needs a development build" notice. To use the canvas,
> run a development build:
>
> ```bash
> npx expo run:android      # or: npx expo run:ios   (needs Xcode/Android Studio)
> ```
>
> or create an EAS development build. Everything is SDK 54 either way.

## Project structure

```
src/
  theme.ts                 Colour, type and spacing tokens (couture palette)
  data.ts                  Clients, measurement fields, garment templates,
                           colours, fabrics — ported verbatim from the design
  state/AppContext.tsx     App-wide navigable state (a faithful port of the
                           prototype's screen state machine)
  components/
    Icon.tsx               Feather-style line icons (react-native-svg)
    ui.tsx                 Buttons, fields, headings, monogram
    Rail.tsx               Persistent left navigation rail
    Toast.tsx              Bottom couture toast
  canvas/
    croquis.ts             The cream fashion-figure background, drawn in Skia
                           (geometry ported from `drawCroquis`)
    fills.ts               Procedural fabric textures + flood fill
                           (ported from `fillFn` / `floodFill`)
    engine.ts              Offscreen Skia ink surfaces per view, strokes,
                           eraser, fills, undo/redo, and export compositing
  screens/                 One file per surface
App.tsx                    Font loading + screen router
```

## How the design maps to native

The prototype is a single HTML file using a small React-based template runtime
(`support.js`). None of that runtime is needed here — the app logic (the
`DCLogic` component in the `.dc.html`) was reimplemented as idiomatic React
Native:

- **Navigation** — the prototype is a screen state machine (`screen: 'login' |
  'clients' | …`). That model is preserved in `AppContext`, with the shell
  (rail + content) wrapping the client/plans/settings screens and login / canvas
  / export rendered full-screen, exactly as in the design.
- **The sketch canvas** — the original draws on two stacked 2D `<canvas>`
  elements (a background croquis and an ink layer) and flood-fills pixels. Here,
  the croquis is painted with Skia and the ink layer is an **offscreen Skia
  surface** per view; strokes, the eraser (Skia `Clear` blend), and the pixel
  flood-fill (via `readPixels` → fill → `MakeImage`) all mirror the prototype.
  Undo/redo keep image snapshots, matching the original's ImageData history.
- **Fabrics & colours** — the procedural fabric texture functions (silk, satin,
  lace, denim, velvet, tulle) are ported one-to-one. The small swatch previews
  in the side panel approximate the CSS gradients with `expo-linear-gradient`.
- **Export** — “Save image” and “Send to client” surface the same couture
  toasts as the prototype. The composited PNG (croquis + ink) is generated with
  Skia and shown on the shareable card and spec sheet. Wiring “Save image” to
  the device photo library (via `expo-media-library`) is a natural next step.

## Notes

- Type-checked with `npm run typecheck` (`tsc --noEmit`) and verified to bundle
  cleanly with `expo export`.
- The sample clientele, measurements and saved designs are the prototype's
  fixtures; there is no backend yet — state lives in memory for the session.
