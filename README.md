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

<https://edualves96.github.io/protecao_civil_carangueira/>

## Release a new version

Bump `VERSAO` in `app/sw.js` and `app/js/screens.js`. This renews the offline copy on phones that
already have the app installed.

## Preview the warning states

Until real IPMA warnings are connected (step 5), the home screen shows "Em breve".
To preview the other states with sample data, add `?demo=` to the address:

- `?demo=verde`: no warnings
- `?demo=amarelo`: yellow warning
- `?demo=laranja`: orange warning
- `?demo=vermelho`: red warning

## Licences

Fonts: Barlow Semi Condensed and Atkinson Hyperlegible, SIL Open Font License (see `app/fonts/`).
