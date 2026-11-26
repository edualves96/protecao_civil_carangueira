# Changelog

What each version of the app added. Residents see the same history, in Portuguese, under
**Sobre a app → Novidades** (from `app/js/versao.js`).

To release a version: bump `VERSAO` in `app/js/versao.js` and `app/sw.js`, and add an entry to
the top of `NOVIDADES` in `versao.js` and to this file.

## 0.11.1 (26 Nov 2026)
- The home top block takes much less room on phones when nothing needs action: about 200 px
  instead of 310 px when calm, and about 240 px instead of 370 px without recent data. Today's
  weather becomes the main element (big icon, maximum, weather in words, minimum and chance of
  rain, linking to the forecast), and the status becomes one smaller line: "✓ Sem avisos nem
  incêndios perto", or "ⓘ Sem dados recentes dos fogos" with a short reason and an inline link.
  The "Segundo o IPMA e o Fogos.pt…" sentence is gone.
- A fire nearby, an IPMA warning or a nearby fire in old data keep the big layout, with the small
  temperature in the corner.
- Text in the top block no longer fades (it was below the 4.5:1 contrast minimum on green).

## 0.11.0 (24 Nov 2026)
- Weather forecast from IPMA's open data (daily forecast for Leiria, `globalIdLocal` 1100900, the
  nearest IPMA location to Caranguejeira). No key, called from the browser like the warnings, and
  saved on the phone for offline use.
- Hour-by-hour forecast from the feed IPMA's own website uses
  (`api.ipma.pt/public-data/forecast/aggregate/1100900.json`: hourly for 3 days, then every 3 hours).
  It isn't part of the documented open data, so the app works without it: the day cards then
  appear without the hour slider.
- Home: today's maximum, minimum and chance of rain with a weather icon in the top corner of the
  status block. It links to the forecast on `#/avisos` (via `#/avisos/previsao`, which scrolls to it).
- `#/avisos`: "Previsão do tempo", one card for today and each of the next 3 days (two columns on
  wide screens) with the weather in words, maximum, minimum, chance of rain and wind.
- Each card has an hour slider: the thumb is a cloud, a bubble shows that hour's temperature,
  weather icon and chance of rain, and a line shows the temperature through the day. The card's
  background and drawing follow the chosen hour's weather (sun, clouds, rain, thunderstorm, fog,
  snow), and turn dark with a moon and stars between sunset and sunrise (worked out for Leiria).
  Rain, snow and fog move gently, except with reduced motion.
- New weather icons (sun, sun and cloud, cloud, rain, thunderstorm, fog, moon, moon and cloud) in
  the app's style.
- Links inside text (sources, 112) wrap at the end of a line again instead of jumping to a line of
  their own.

## 0.10.0 (17 Nov 2026)
- "Avisar a família" (`#/avisar`, in the menu, on the home screen and in the family plan): a text
  message saying "Estou bem" or "Preciso de ajuda" and where the person is, from GPS, home or one
  of the family's meeting points. It opens the phone's own messages app with the text ready, to the
  plan's out-of-area contact or anyone else; WhatsApp and copy are extra options.
- Works without internet: GPS needs no data and a text message only needs signal. The place is
  described offline from the reference places and meeting points ("Perto de: … (300 m a norte)").
- The message carries a link, `https://upcc.pt/#/aqui/LAT_LON_MARGIN_MINUTE_STATE`. Opening it
  shows "Localização recebida": the place in words, when it was sent, a map, the distance from
  the receiver ("Mostrar onde estou") and "Como chegar".
- No server or registration: the location only leaves the phone in the message the person sends,
  and it sits after the `#`, which browsers never send to the website.
- The menu height steps were adjusted for its 11 items.

## 0.9.0 (16 Nov 2026)
Safety fixes and a shorter menu, from the design review of 15 Nov.
- The top of the home screen shows the most serious local risk: red for an active fire within
  10 km (with data from the last hour), otherwise the IPMA warning, otherwise green. Fires
  elsewhere in the district no longer turn the top orange; they get a neutral line below, next to
  the IPMA line.
- Fire data older than one hour is never shown as current, on the home screen or on `#/fogos`.
  A nearby fire seen in old data says it may already be out. "Sem rede" (the phone is offline) is
  told apart from "O Fogos.pt não atualiza desde…" (late feed).
- Maps no longer trap scrolling: one finger scrolls the page, two fingers move and zoom the map,
  and the mouse wheel zooms only with Ctrl. A short hint explains this. The meeting points map
  is at most 45% of the screen height.
- Tapping the meeting points map asks "Usar este sítio como ponto 1?" before saving, and
  replacing a point offers "Desfazer".
- Menu down from 15 to 10 items: kit, backpack and car kit share one page with tabs; so do the
  family plan and meeting points, and the drill and quiz. "Contactos úteis" moves to the top.
  The unit footer scrolls with the list. The old addresses (`#/mochila`, `#/carro`, …) still work.

## 0.8.1 (14 Nov 2026)
- The top of the home screen now shows fires from Fogos.pt: red for an active fire within 10 km
  (with the rural fire guide first under "Se acontecer agora"), orange for fires elsewhere in the
  district, green with none, blue without recent data. Replaces the separate red fire block.
- IPMA weather warnings move to a short line just below.
- Fire types read naturally ("Incêndio em mato").
- The side menu fits on short desktop screens (down to about 700 px high) without a scrollbar,
  shrinking its rows in steps; below that it scrolls with the scrollbar hidden.

## 0.8.0 (12 Nov 2026)
- Car kit (`#/carro`): what to keep in the car to wait several hours on a closed road. Same list
  engine as the kit and backpack, editable in Pages CMS.
- The kit and car kit ask how many people live at home (starting from the family plan) and work out
  per-person quantities, such as water.
- Two new guides: "Ordem para sair de casa" (evacuation) and "Falta de água prolongada".
- Version history ("Novidades") in Sobre a app, and this file.

## 0.7.0 (12 Nov 2026)
- Fogos: active incidents in the Leiria district from the Fogos.pt API, on a map and in a list, and
  a home alert for an active fire within 10 km. The key stays in a GitHub secret; the publish
  workflow fetches the data every 10 minutes (`scripts/fogos.mjs`).
- Printing: one A4 sheet for the kit, backpack, contacts and family plan.
- Essential and optional items; progress counts essentials only.
- Backup: save phone data to a file and restore it on another phone.
- Simulacro (evacuation drill with a stopwatch) and a 13-question quiz.

## 0.6.0 (12 Nov 2026)
- Family plan (people and needs, out-of-area contact, meeting points, how to leave home), printable.
- Meeting points map on OpenStreetMap tiles, with reference places editable in Pages CMS.
- Expiry dates for perishable items, with home reminders.
- The home tracker counts kit, backpack, plan and meeting points.

## 0.5.0 (12 Nov 2026)
- Emergency backpack for 3 to 5 days away from home, with a scroll-driven packing guide.
- UX laws applied: larger tap areas for in-text links, "faltam N" on lists.

## 0.4.1 (11 Nov 2026)
- Kit groups that open and close, with icons and per-group progress.
- Sismos: diagram beside the list on large screens. Waves aligned on computers.
- Edit pencil on editable pages; official unit name in the menu.

## 0.4.0 (11 Nov 2026)
- Content editing with Pages CMS (kit, contacts, guides, other texts).
- 3-day warnings timeline and earthquake distance diagram. New address: upcc.pt.

## 0.3.0 (11 Nov 2026)
- Live IPMA warnings for the Leiria district and recent earthquakes, saved for offline use.

## 0.2.0 (11 Nov 2026)
- Visual "O que fazer se…" guides for 9 risks, useful contacts with tap-to-call, 72-hour kit.

## 0.1.0 (11 Nov 2026)
- First version: installable web app with home screen and side menu, working offline.
