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
