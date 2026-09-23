# p5 vanilla starter

> Feel free to delete all of this README's text and replace it with your
> own.

A minimal starting point for a [p5.js](https://p5js.org/) sketch, meant to
be used the same way you'd use the online editor at editor.p5js.org — just
locally, in your own editor and browser.

It contains exactly three files: `index.html`, `sketch.js`, and
`style.css`. No `npm install`, no build step, no framework — open the
folder and start editing `sketch.js`.

## Getting started

1. Click **Use this template** on GitHub (or `git clone` this repo) to get
   your own copy.
2. Open the folder in VS Code.
3. VS Code will prompt you to install the recommended **Live Server**
   extension — install it (only needed once).
4. Right-click `index.html` and choose **Open with Live Server**, or click
   **Go Live** in the bottom-right corner of the VS Code window.
5. Your sketch opens in a browser tab and reloads automatically every time
   you save `sketch.js`.

You can also just double-click `index.html` to open it directly in a
browser without Live Server — that works fine for a simple sketch, but
Live Server is worth using once your sketch loads other files (images,
fonts, JSON, etc.), since browsers block those requests from a page opened
directly off disk.

## Debugging with DevTools

This is the main advantage over the online editor: you get real browser
developer tools.

1. Open your sketch in Chrome.
2. Open DevTools (`Cmd+Option+I` on Mac, `Ctrl+Shift+I` on Windows/Linux).
3. Go to the **Sources** tab, find `sketch.js` in the file tree on the
   left, and click a line number to set a breakpoint.
4. Reload the page. Execution will pause at your breakpoint, and you can
   inspect variables, step through code line by line, and use the
   Console to poke at live values — all standard browser debugging, now
   available on your own code.

## Previewing inside VS Code (optional)

VS Code has a built-in browser you can use instead of switching to a
separate window. This only works in VS Code (not other editors, and not
in forks like VSCodium or Cursor that strip it out):

1. Open the Command Palette (`Cmd+Shift+P`).
2. Run **Browser: Open Integrated Browser**.
3. Enter the Live Server URL (e.g. `http://localhost:5500/`).

It even has full DevTools, including breakpoints — but Chrome or Edge is
still the more reliable choice for debugging, since that's what you'll be
using for every other web project in the course.

## About the p5 version

`index.html` loads p5.js and p5.sound.js from a CDN
([jsdelivr](https://www.jsdelivr.com/)), pinned to specific versions
(p5.js `2.3.2`, p5.sound `0.4.1`) so your sketch behaves the same locally
as it does anywhere else in the course. As of p5.js v2, sound is a
separate package with its own version number, rather than bundled
alongside the main library — the two `<script src="...">` URLs at the top
of `index.html` are versioned independently, so update whichever one
you need if a later assignment requires a newer release.
