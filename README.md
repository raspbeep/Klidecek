# aio — exam prep framework

A study/exam prep app where the **content** is plain Markdown files and the
**interactive demos** are plain React components. Built with Vite, deployed to
GitHub Pages.

```
npm install
npm run dev      # dev server with hot reload
npm run build    # static bundle in dist/
npm run preview  # preview the built bundle
```

## What goes where

```
src/
  framework/        the engine — router, parser, loader, pages, blocks
  viz/              interactive visualisations (one file per viz)
public/content/     all study content
  manifest.json     declares every course, topic, subtopic, exam set
  courses/<id>/<topic>/<subtopic>.md
```

To add or edit content, see **[FRAMEWORK.md](./FRAMEWORK.md)**. You will not
normally touch `src/framework/` — that's the engine.

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds with
`VITE_BASE=/<repo>/` and publishes `dist/` to GitHub Pages.
