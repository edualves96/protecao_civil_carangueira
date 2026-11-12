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

## Release a new version

Bump `VERSAO` in `app/sw.js` and `app/js/screens.js`. This renews the offline copy on phones that
already have the app installed.

## IPMA data

The warnings (Leiria district, area `LRA`) and recent earthquakes come from the IPMA open data API
(<https://api.ipma.pt/>): no key, and the browser calls it directly. See `app/js/ipma.js`. The last
answer is kept on the phone, so the screens still work offline. IPMA asks to always name it as the
source, with a link.

## Preview the warning states

The home screen shows the real IPMA warnings. To preview a state with sample data, add `?demo=`
to the address:

- `?demo=verde`: no warnings
- `?demo=amarelo`: yellow warning
- `?demo=laranja`: orange warning
- `?demo=vermelho`: red warning

## Licences

Fonts: Barlow Semi Condensed and Atkinson Hyperlegible, SIL Open Font License (see `app/fonts/`).
