# 0xjgr.github.io

My website: [0xjgr.github.io](https://0xjgr.github.io).

HTML, CSS and JavaScript with no frameworks and no build step: GitHub Pages
serves the `main` branch as is.

- `index.html`, `css/`, `js/`: the page. Projects live in a single array at
  the top of `js/main.js`, which feeds both the index of smaller projects and the terminal.
- `img/proyectos/`: one 1280x640 image per project. The same image is the
  repo's social preview and the banner on my profile README.
- `tools/previews.py` generates those images (needs `rsvg-convert` and
  Pillow). `tools/cabecera.py` generates the animated profile header.
- `media/`: what the project cards and their detail windows show (videos,
  photos and thumbnails).

To run it locally: `python3 -m http.server` and open `localhost:8000`.
Press `` ` `` (or `º` on a Spanish keyboard) to open the terminal.
