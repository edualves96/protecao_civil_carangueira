# Proteção Civil Caranguejeira — Plan

A free self-protection app for people in the parish of Caranguejeira (Leiria).
It works offline. It has the same kind of features as preparedness apps such as
K72 - Autoproteção, but everything else is our own: name, look, texts and a
local focus on Caranguejeira.

![Visual proposal](docs/proposta-visual.png)

## What makes it ours (not a copy)

- **Own identity:** colours taken from the Caranguejeira coat of arms, a side menu opened from the bottom bar, our own typography and our own name.
- **Own texts:** written from official guidance (ANEPC, IPMA, SNS 24), not copied from other apps.
- **Local first:** Caranguejeira meeting points, local contacts and warnings for the Leiria district.

## Platform

The app will be a **web app that can be installed on the phone (PWA)**:

- One app for both Android and iPhone. You install it from the browser ("Add to home screen").
- It works offline after the first visit.
- It's free to host on GitHub Pages, with no app store accounts or reviews.
- It's built with plain HTML, CSS and JavaScript, with no framework, so it stays simple to change.
- If it should be on Google Play later, it can be wrapped as a store app without rewriting it.

## Design principles

The app must not look like a generic template, with rounded cards, pastel icon
squares, gradients and a hamburger icon in the corner. Every design choice
comes from how the app is used: often by older people, sometimes under stress,
sometimes with one hand.

1. **Status first.** The top of the home screen answers "is there danger now?".
   It is green with "Sem avisos", or turns the colour of the IPMA warning
   (yellow, orange or red) and links straight to the right guide.
2. **Thumb reach.** The **Menu** and **Ligar 112** buttons sit in a fixed bar at
   the bottom of the screen, not in the top corner. The menu opens and closes
   from there too.
3. **Labelled buttons.** "Menu" is written next to its icon, because an icon on
   its own isn't clear to everyone.
4. **Readable for everyone.** The texts use Atkinson Hyperlegible, a font made
   for people with low vision. Text is large, contrast is strong, and every
   touch target is at least 44 px tall.
5. **Plain language.** Labels say what happens, for example "O que fazer se…",
   "Próximo passo: escolher ponto de encontro".
6. **Lists, not tiles.** Content is shown as full-width rows with dividers.
   They are faster to scan and bigger to tap than a grid of small cards.
7. **Proteção Civil colours, with a local touch.** The palette comes from the
   Proteção Civil logo. The wavy blue line under the status block and in the
   menu echoes the waves on the Caranguejeira coat of arms.

Visual proposal source: [`docs/mockup/index.html`](docs/mockup/index.html).

## Colours (from the Proteção Civil logo)

| Name | Hex | Source | Use |
|---|---|---|---|
| Azul | `#0B57A4` | logo ring and triangle | main brand colour: preparation progress, links, next step, Menu button, waves |
| Azul-noite | `#0A2F5C` | logo blue, dark | side menu background |
| Laranja | `#F7941D` | logo background | accent: active menu marker, menu highlights, orange warning |
| Verde | `#2E8540` | logo green, darkened for legibility | status block with no warnings |
| Cinza | `#5F6062` | logo outer ring | secondary text |
| Papel | `#F5F6F8` | — | app background |
| Tinta | `#0F1E33` | — | text (dark navy instead of black) |
| Fixed | `#F2C200` `#C62828` | — | IPMA yellow and red warnings, the 112 button |

The status block follows the IPMA warning scale: green, yellow, orange, red.
Two of those (green and orange) are also logo colours. Because the logo orange
is also the warning orange, orange elsewhere is kept to small accents. That way
a big orange area always means a warning.

White text on blue, navy and green meets the WCAG minimum contrast of 4.5:1.
Orange and yellow warnings use dark text.

The app uses the logo's colours but not the logo itself. The blue triangle on
orange is the international civil defence sign, and its use is restricted by
international law to official civil protection services.

**Fonts:** Barlow Semi Condensed for titles (inspired by road signage) and Atkinson
Hyperlegible for text. Both are free and will be bundled with the app so they work offline.

## Side menu

| Group | Item | What it does |
|---|---|---|
| — | **Início** | Current status, family preparation, "Se acontecer agora" |
| Agora | **Avisos do tempo** | Weather warnings for the Leiria district (live, saved for offline use) |
| Agora | **Sismos recentes** | Recent earthquakes on a map (IPMA data) |
| Preparar | **Kit de emergência** | 72-hour kit checklist, saved on the phone |
| Preparar | **Plano da família** | Family members, meeting points, important contacts, special needs |
| Preparar | **Pontos de encontro** | Map of Caranguejeira meeting points (OpenStreetMap) |
| Saber agir | **O que fazer se…** | What to do before, during and after each risk (list below) |
| Saber agir | **Simulacro** | Evacuation drill with a timer and steps |
| Saber agir | **Quiz** | Questions to test what you know |
| — | **Contactos úteis** | Tap to call: 112, SNS 24, Proteção Civil Municipal, Bombeiros, GNR, Junta |
| — | **Sobre a app** | Sources, privacy, credits, version |

The bottom bar always shows **Menu** and **Ligar 112**. When the menu is open, they become **Fechar** and **112**.

The menu, its labels and the content of each screen will be refined step by step.

**Risks covered in "O que fazer se…":** sismo, incêndio rural, incêndio em casa,
cheias e inundações, tempestade e vento forte, onda de calor, frio extremo,
acidente com matérias perigosas, falha prolongada de energia.

## Data and privacy

- No accounts, no ads, no tracking.
- The kit checklist, family plan and settings are stored only on the phone.
- The only network requests are for IPMA public data (warnings and earthquakes)
  and the map tiles. Everything else works offline.

## Build steps

Each step ends with something you can open and try on your phone.

1. **Foundation:** project structure, colours and fonts, bottom bar, side menu, home screen, empty screens, publish on GitHub Pages.
2. **Contactos úteis + O que fazer se…:** tap-to-call contacts and the guides for every risk (offline).
3. **Kit de emergência:** checklist by category with progress, saved on the phone.
4. **Plano da família + Pontos de encontro:** family plan form and map with Caranguejeira points.
5. **Avisos do tempo + Sismos recentes:** live data with an offline fallback, status block on the home screen.
6. **Simulacro + Quiz.**
7. **Installable and offline:** app icon, offline support, final tests on Android and iPhone.

## Needed from the owner

- **App name:** "Proteção Civil Caranguejeira" is a working title.
- **Meeting points:** places in the parish, with an address or a map pin.
- **Local phone numbers:** Junta de Freguesia, Bombeiros, GNR post, Proteção Civil Municipal de Leiria. I can draft these, but they must be checked.
- **Coat of arms and Proteção Civil logo:** permission from the Junta de Freguesia or the Proteção Civil service before using either in the app or its icon. Without it, the app uses only their colours and its own icon.
- **Review:** have the "O que fazer se…" texts reviewed by the municipal civil protection service before release.
