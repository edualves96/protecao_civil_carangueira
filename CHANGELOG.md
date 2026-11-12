# Changelog

What each version of the app added. Residents see the same history, in Portuguese, under
**Sobre a app → Novidades** (from `app/js/versao.js`).

To release a version: bump `VERSAO` in `app/js/versao.js` and `app/sw.js`, and add an entry to
the top of `NOVIDADES` in `versao.js` and to this file.

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
