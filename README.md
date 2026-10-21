# Fixed Figure Smooth Scroll

A 16:9 article frame. The posted date, the share buttons, the photo and the photo's caption stay fixed while the article text scrolls past them. Lines beside the photo and caption are indented, and mouse-wheel and trackpad scrolling eases to a stop.

The page is built with Vite and TypeScript and has no UI framework. The original prototype and its brief are in `fixed-figure-prototype/`.

## Commands

- `npm install` installs the dependencies.
- `npm run dev` starts the development server.
- `npm run build` type-checks the code and writes a static build to `dist/`.
- `npm run preview` serves the build from `dist/`.
- `npm test` runs the unit tests.

## How the page works

- Every size is in reference pixels from a 2290px-wide layout. The `--u` custom property in `src/styles.css` is one reference pixel, which is the frame width divided by 2290.
- The text column holds two floats. `src/figure-wrap.ts` sets the spacer float's height on every scroll frame so the band float lines up with the photo, and the browser wraps the text around the band.
- `src/smooth-scroll.ts` handles eased scrolling. The wheel handler moves a target scroll position, and each animation frame moves the real scroll position toward it by `1 - e^(-dt × 6)`. Scrollbar drags, arrow keys and touch scrolling stay native, and viewers who've turned on reduced motion get standard scrolling.
- `src/share.ts` runs the share buttons. "Copy link" copies the page URL, "Share by email" opens an email draft, and "Save article" dispatches an `article:save` event that the host site needs to handle.

## Open items

- The caption under the photo still describes a concert placeholder, and it needs real copy and a real credit.
- The article text is original placeholder copy, repeated three times to make the page long enough to scroll.
- The "Save article" button only dispatches an `article:save` event, and the host site needs to store the saved state.
