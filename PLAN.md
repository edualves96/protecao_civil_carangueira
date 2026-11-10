# Proteção Civil Caranguejeira — Plan

A free self-protection app for people in the parish of Caranguejeira (Leiria).
It works offline. It has the same kind of features as preparedness apps such as
K72 - Autoproteção, but everything else is our own: name, look, texts and a
local focus on Caranguejeira.

![Visual proposal](docs/proposta-visual.png)

## What makes it ours (not a copy)

- **Own identity:** colours taken from the Caranguejeira coat of arms, a side menu, our own icons and our own name.
- **Own texts:** written from official guidance (ANEPC, IPMA, SNS 24), not copied from other apps.
- **Local first:** Caranguejeira meeting points, local contacts and warnings for the Leiria district.

## Platform

The app will be a **web app that can be installed on the phone (PWA)**:

- One app for both Android and iPhone. You install it from the browser ("Add to home screen").
- It works offline after the first visit.
- It's free to host on GitHub Pages, with no app store accounts or reviews.
- It's built with plain HTML, CSS and JavaScript, with no framework, so it stays simple to change.
- If it should be on Google Play later, it can be wrapped as a store app without rewriting it.

## Colours (from the coat of arms)

| Name | Hex | Source | Use |
|---|---|---|---|
| Verde | `#2F7D3A` | trees | top bar, menu header, active item |
| Verde-escuro | `#1F5A28` | trees (shadow) | text on light green |
| Uva | `#8A4F9E` | grapes, lightened | highlights, progress, menu group titles |
| Lilás | `#F1E8F4` | grapes, tint | highlight backgrounds |
| Água | `#1F6FB2` | waves | information, links, maps, the wave in the menu |
| Prata | `#F2F4F5` / `#D5DADE` | shield | app background, lines |
| Tronco | `#7A4B2A` | trunks | small details |
| Fixed | `#F2C200` `#F28C00` `#C62828` | — | IPMA yellow/orange/red warnings and the 112 button |

The fixed emergency colours never change with the theme. White text on green,
grape and water meets the WCAG minimum contrast of 4.5:1.

## Side menu

| Group | Item | What it does |
|---|---|---|
| — | **Início** | Current IPMA warning for Leiria, emergency kit progress, shortcuts, call 112 |
| Informar | **Avisos IPMA** | Weather warnings for the Leiria district (live, saved for offline use) |
| Informar | **Sismos Recentes** | Recent earthquakes on a map (IPMA data) |
| Informar | **Como Agir** | What to do before, during and after each risk (list below) |
| Preparar | **Kit de Emergência** | 72-hour kit checklist, saved on the phone |
| Preparar | **Plano Familiar** | Family members, meeting points, important contacts, special needs |
| Preparar | **Pontos de Encontro** | Map of Caranguejeira meeting points (OpenStreetMap) |
| Praticar | **Simulacro** | Evacuation drill with a timer and steps |
| Praticar | **Quiz** | Questions to test what you know |
| — | **Contactos Úteis** | Tap to call: 112, SNS 24, Proteção Civil Municipal, Bombeiros, GNR, Junta |
| — | **Sobre** | Sources, privacy, credits, version |

A red **Ligar 112** button is always visible at the bottom of the menu and on the home screen.

**Risks covered in "Como Agir":** sismo, incêndio rural, incêndio em casa,
cheias e inundações, tempestade e vento forte, onda de calor, frio extremo,
acidente com matérias perigosas, falha prolongada de energia.

## Data and privacy

- No accounts, no ads, no tracking.
- The kit checklist, family plan and settings are stored only on the phone.
- The only network requests are for IPMA public data (warnings and earthquakes)
  and the map tiles. Everything else works offline.

## Build steps

Each step ends with something you can open and try on your phone.

1. **Foundation:** project structure, colour theme, side menu, empty screens, home screen, publish on GitHub Pages.
2. **Contactos Úteis + Como Agir:** tap-to-call contacts and the guides for every risk (offline).
3. **Kit de Emergência:** checklist by category with progress, saved on the phone.
4. **Plano Familiar + Pontos de Encontro:** family plan form and map with Caranguejeira points.
5. **Avisos IPMA + Sismos Recentes:** live data with an offline fallback, warning card on the home screen.
6. **Simulacro + Quiz.**
7. **Installable and offline:** app icon, offline support, final tests on Android and iPhone.

## Needed from the owner

- **App name:** "Proteção Civil Caranguejeira" is a working title.
- **Meeting points:** places in the parish, with an address or a map pin.
- **Local phone numbers:** Junta de Freguesia, Bombeiros, GNR post, Proteção Civil Municipal de Leiria. I can draft these, but they must be checked.
- **Coat of arms:** permission from the Junta de Freguesia before using it as the app icon or in public. Without it, the app keeps the colours and uses its own icon.
- **Review:** have the "Como Agir" texts reviewed by the municipal civil protection service before release.
