# Fixed Figure Smooth Scroll: build brief

Please build a production version of the prototype in `index.html` (open it in a browser to see the target behavior). The photo is `clownfish.jpg`.

## What the reader sees

- A 16:9 frame that fits inside the browser window.
- The posted date, the rule above it, the share icons, the photo and the photo's caption stay fixed in the frame while the reader scrolls.
- One long column of article text scrolls past the photo. Lines beside the photo and caption are indented, and lines above and below the photo run the full column width. Words reflow to the next line as needed when the indent applies.
- Mouse-wheel and trackpad scrolling eases to a stop instead of stopping hard.

## Measurements

All sizes are in reference pixels from a 2290px-wide layout, and they scale with the frame width (1 reference px = frame width ÷ 2290).

- Posted date block: left 101, top 34, width 322, with a 3px rule along its top edge. Text is 19px.
- Photo: left 638, top 300, 537 wide × 606 tall, cropped to fill with `object-fit: cover`.
- Caption: 24 below the photo. The number column is 57 wide and the text column is 330 wide. Text is 17.5px.
- Text column: left 1175, width 1025. Body text is 25.83px on a 43.5px line height, with a 43.5px gap between paragraphs.
- Indent beside the photo: 93.
- Clearance above the photo: 89.08. Any line that comes within this distance of the photo's top edge is indented. Including the line spacing, a full-width line always keeps at least 97.88 of space above the photo.
- Clearance below the caption: 22.
- Font: "Helvetica Neue", Helvetica, Arial, sans-serif, used for every piece of text on the page.

## How the prototype does it

- The text column holds two floats. The first float is invisible and 1px wide, and the script sets its height on every scroll frame so the second float lines up with the photo's position on screen. The second float is 93 wide and as tall as the photo and caption plus both clearances. The browser wraps the text around it natively.
- The text column uses `overflow: clip` so the floats can't extend the scroll height.
- Eased scrolling: the wheel handler moves a target scroll position, and each animation frame moves the real scroll position toward the target by `1 - e^(-dt × 6)`. Scrollbar drags, arrow keys and touch scrolling stay native. A scroll that the script didn't cause cancels the glide.
- Viewers who've turned on reduced motion get standard scrolling.

## Open items

- The caption under the photo still describes a concert placeholder, and it needs real copy and a real credit.
- The article text is original placeholder copy, repeated three times to make the page long enough to scroll.
