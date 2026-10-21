# Fixed Figure Polished Scroll

A 16:9 article frame. The posted date, the share buttons, the photo and the photo's caption stay fixed while the article text scrolls past them, and lines beside the photo and caption are indented. When the text reaches its start or end, the photo, caption, date and share buttons scroll out of the frame with it, onto an empty frame that reads "BEGIN" or "END." Mouse-wheel and trackpad scrolling eases smoothly, and the text fades at the top and bottom edges of the frame.

The page is built with Vite and TypeScript and has no UI framework. The approved prototype and its brief are in `fixed-figure-polished/`.

## Commands

- `npm install` installs the dependencies.
- `npm run dev` starts the development server.
- `npm run build` type-checks the code and writes a static build to `dist/`.
- `npm run preview` serves the build from `dist/`.
- `npm test` runs the unit tests.

## How the page works

- Every size is in reference pixels from a 2290px-wide layout. The `--u` custom property in `src/styles.css` is one reference pixel, which is the frame width divided by 2290.
- The text column holds two floats. `src/figure-wrap.ts` sets the spacer float's height on every scroll frame so the band float lines up with the photo, and the browser wraps the text around the band.
- `src/figure-wrap.ts` also moves the photo, caption, date and share buttons with one shared `translateY` once the last line rises above the caption or the first line drops below its opening position.
- One empty frame of room sits above the first line and one below the last line. `src/main.ts` opens the page scrolled past the top room, and on resize it scales the scroll position with the frame width so the reader stays at the same spot in the text.
- `src/smooth-scroll.ts` handles eased scrolling. The wheel handler moves a target scroll position, and a critically damped spring moves the real scroll position toward it. Wheel events less than 40ms apart use a spring frequency of 26, and separate wheel clicks use 9. Scrollbar drags, arrow keys and touch scrolling stay native, and viewers who've turned on reduced motion get standard scrolling.
- `src/share.ts` runs the share buttons. "Copy link" copies the page URL, "Share by email" opens an email draft, and "Save article" dispatches an `article:save` event that the host site needs to handle.

## Open items

- The caption under the photo still describes a concert placeholder, and it needs real copy and a real credit.
- The article text is original placeholder copy, repeated three times to make the page long enough to scroll.
- The "Save article" button only dispatches an `article:save` event, and the host site needs to store the saved state.
