# Proteção Civil Caranguejeira

An installable web app (PWA) for self-protection in the parish of Caranguejeira.
It works on Android, iPhone and computers, with no app store needed. See [PLAN.md](PLAN.md) for the full plan.

## Folders

| Folder | What it holds |
|---|---|
| `app/` | The app itself. This folder is what gets published. |
| `docs/` | Design mockups and images. |
| `.github/workflows/pages.yml` | Publishes `app/` to GitHub Pages on every push. |

## Run it on your computer

Use any static web server inside `app/`, for example:

```bash
cd app
python -m http.server 8000
```

Then open <http://localhost:8000>. On Windows, use `py -m http.server 8000` if `python` isn't found.
VS Code's "Live Server" extension or `npx serve app` also work.

To install it on a phone, it has to be served over HTTPS. That's what GitHub Pages provides.

## Publish (GitHub Pages)

One-time setup: on GitHub, open **Settings → Pages** and set **Source** to **GitHub Actions**.
After that, every push that changes `app/` publishes the app at:

<https://upcc.pt/>

The domain is registered at dominios.pt, which also holds its DNS records (four `A` records
for GitHub Pages, `www` as a `CNAME` to `edualves96.github.io`, and GitHub's verification `TXT`).
The custom domain is set in the repository's **Settings → Pages**, with **Enforce HTTPS** on.

## Edit the content (Pages CMS)

The kit, the useful contacts, the "O que fazer se…" guides and the other texts are JSON files in
`app/conteudo/`. Editors change them with forms at <https://app.pagescms.org>, without touching the
code. The forms are defined in `.pages.yml`.

One-time setup, by the repository owner:

1. Open <https://app.pagescms.org> and sign in with GitHub.
2. Install the Pages CMS GitHub App on your account, with access to this repository only.
3. Open the repository on the `ccr-d836c5a6-1m8oud` branch.
4. Invite the editors by email (Collaborators). They don't need a GitHub account, and they can only
   edit the content, not the settings or the code.

How it works:

- Each save is a commit on the branch, with the editor's name. GitHub Actions publishes it on
  upcc.pt about a minute later, and phones get it the next time the app opens.
- Only contacts marked as confirmed show a number and can be called.
- Renaming a kit item unticks it on the phones that had ticked it. The other items stay as they are.
- The figures available for the guide steps are shown at <https://upcc.pt/#/figuras>.
- Editors' saves are commits on GitHub, so pull before pushing code changes.

## Fogos (Fogos.pt)

The "Fogos" screen shows active incidents in the Leiria district from the Fogos.pt API. The API key
must never be in the app: the app is public, and so is this repository. Instead, the publish
workflow runs `scripts/fogos.mjs` every 10 minutes with the key from a GitHub secret, and publishes
the result as `app/dados/fogos.json` (not stored in git).

One-time setup: on GitHub, open **Settings → Secrets and variables → Actions → New repository
secret**, name it `FOGOS_API_KEY` and paste the key. Without it, the screen says there's no data.
Keep the key file (`fogos.txt`) out of git; it is in `.gitignore`.

To test locally: `FOGOS_API_KEY=... node scripts/fogos.mjs`, then open the preview.

### Refreshing every 10 minutes (external timer)

GitHub runs scheduled workflows late or skips them (in practice a few times a day), so the
workflow's own `schedule` is only a backup. An external timer at cron-job.org asks GitHub to run
the workflow every 10 minutes, which GitHub does straight away.

1. **GitHub token** (<https://github.com/settings/personal-access-tokens/new>): a fine-grained
   token, resource owner `edualves96`, **Only select repositories** → `protecao_civil_carangueira`,
   permission **Actions: Read and write** and nothing else. It can only start or cancel workflow
   runs on this repository; it cannot read or change the code. Note its expiry date to renew it.
2. **cron-job.org job**: every 10 minutes, request method `POST` to
   `https://api.github.com/repos/edualves96/protecao_civil_carangueira/actions/workflows/pages.yml/dispatches`
   with these headers:
   - `Authorization: Bearer <token>`
   - `Accept: application/vnd.github+json`
   - `X-GitHub-Api-Version: 2022-11-28`
   - `Content-Type: application/json`

   and the body `{"ref":"ccr-d836c5a6-1m8oud"}`. A working call answers `204 No Content`.
3. In the repository's **Actions** tab, runs marked "workflow_dispatch" appear every 10 minutes.

Now and then GitHub is slow to list the files a run has just uploaded, and publishing fails with
"No artifacts named github-pages were found". The workflow then waits 30 seconds and tries once
more; the run only fails (and GitHub only emails you) if that second try fails too.

If the token expires, the timer's calls fail with `401` and the data goes back to updating a few
times a day; the app then shows "Sem dados recentes" rather than claiming there are no fires.

## Release a new version

Bump `VERSAO` in `app/sw.js` and `app/js/versao.js`, and add the changes to `NOVIDADES` in `versao.js` and to `CHANGELOG.md`. This renews the offline copy on phones that
already have the app installed.

## IPMA data

The warnings (Leiria district, area `LRA`), the daily forecast (Leiria, `globalIdLocal` 1100900) and
recent earthquakes come from the IPMA open data API (<https://api.ipma.pt/>): no key, and the
browser calls it directly. The hour-by-hour forecast behind the slider on each day comes from the
feed IPMA's own website uses (`api.ipma.pt/public-data/forecast/aggregate/1100900.json`). It isn't
documented open data and could change; if it stops working, the day cards still show, without the
slider. See `app/js/tempo.js`. See `app/js/ipma.js`. The last
answer is kept on the phone, so the screens still work offline. IPMA asks to always name it as the
source, with a link.

## Avisar a família (location by text message)

`#/avisar` writes a text message ("Estou bem" or "Preciso de ajuda", plus where the person is) and
opens the phone's own messages app with it ready to send. There is no server and no registration:
the location only leaves the phone in the message the person sends, so it also works without
internet, as long as there is mobile signal. The code is in `app/js/localizacao.js`.

The message links to `https://upcc.pt/#/aqui/LAT_LON_MARGIN_MINUTE_STATE`, which shows the place
in words, on a map and with directions. The location sits after the `#`, which browsers never send
to the server. The place names come from the reference places in `app/conteudo/pontos.json` (editable
in Pages CMS), so adding well-known local places there makes the messages more precise.

## Preview the warning states

The home screen shows the real IPMA warnings. To preview a state with sample data, add `?demo=`
to the address:

- `?demo=verde`: no warnings
- `?demo=amarelo`: yellow warning
- `?demo=laranja`: orange warning
- `?demo=vermelho`: red warning

## Licences

Fonts: Barlow Semi Condensed and Atkinson Hyperlegible, SIL Open Font License (see `app/fonts/`).
