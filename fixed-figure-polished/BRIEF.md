# Fixed Figure Polished Scroll: build brief

`index.html` in this folder is the approved prototype. Open it in a browser to see the target behavior, and match it exactly. The photo is `clownfish.jpg`. This version replaces the earlier "Fixed Figure Smooth Scroll" build.

## What the reader sees

- A 16:9 frame that fits inside the browser window.
- The page opens with the first paragraph at the top of the frame. The posted date, the rule above it, the share icons, the photo and the photo's caption stay fixed in the frame while the reader scrolls.
- One long column of article text scrolls past the photo. Lines beside the photo and caption are indented, and lines above and below the photo run the full column width. Words reflow to the next line when the indent applies.
- When the last line of text rises level with the bottom of the caption, the photo, caption, date and share icons move up with the text and scroll out of the frame together. The scroll ends on an empty frame with the word "END" in it.
- When the reader scrolls up past the opening view, the text, photo, caption, date and share icons move down together and out of the frame. The very top of the scroll is an empty frame with the word "BEGIN" in it.
- Mouse-wheel and trackpad scrolling eases smoothly, and it's tuned so a mouse such as the Logitech MX Master feels as smooth as a trackpad.
- The text fades out softly at the top and bottom edges of the frame. The photo, caption, date and share icons don't fade.

## Measurements

All sizes are in reference pixels from a 2290px-wide layout, and they scale with the frame width (1 reference px = frame width ÷ 2290). The frame is 1288.125 reference px tall.

- Posted date block: left 101, top 34, width 322, with a 3px rule along its top edge. Text is 19px.
- Photo: left 638, top 300, 537 wide × 606 tall, cropped to fill with `object-fit: cover`.
- Caption: 24 below the photo. The number column is 57 wide and the text column is 330 wide. Text is 17.5px.
- Text column: left 1175, width 1025. Body text is 25.83px on a 43.5px line height, with a 43.5px gap between paragraphs. The first line sits 52 below the top of the frame in the opening view.
- Indent beside the photo: 93.
- Clearance above the photo: 89.08. Any line that comes within this distance of the photo's top edge is indented. Including the line spacing, a full-width line always keeps at least 97.88 of space above the photo.
- Clearance below the caption: 22.
- Body font: "Helvetica Neue", Helvetica, Arial, sans-serif, for every piece of text except BEGIN and END.
- Paragraph typography: `text-wrap: pretty`, `hanging-punctuation: first`, `font-kerning: normal`, `text-rendering: optimizeLegibility`, and antialiased font smoothing.
- Edge fade: the text fades from transparent to fully visible over the top 46 of the frame and from fully visible to transparent over the bottom 92.

## BEGIN and END

- Font: Arial, bold (700), 225px, line height 1, letter spacing -4.
- Both words line up with the photo's left edge (left 638).
- The empty space above the first line and below the last line is each one full frame tall (1288.125).
- The bottom edge of "BEGIN" sits 100 above the top of the opening view.
- The top edge of "END" sits 100 below the top of the final view at the end of the scroll.

## How the prototype does it

- **Wrap around the photo.** The text column holds two floats. The first float is invisible and 1px wide, and the script sets its height on every scroll frame so the second float lines up with the photo's position on screen. The second float is 93 wide and as tall as the photo and caption plus both clearances. The browser wraps the text around it natively. The text column uses `overflow: clip` so the floats can't extend the scroll height.
- **Release at the start and end.** On every scroll frame, the script moves the photo, caption, date and share icons with one shared `translateY`. It moves them up by however far the last line has risen above the caption's bottom edge plus 22, and down by however far the first line has dropped below its opening position. In the opening view, neither applies and the shift is zero.
- **Opening position.** On load, the script scrolls the frame down by one frame height (1288.125) so the page opens at the first paragraph. On resize, it scales the scroll position by the change in width so the reader stays at the same spot in the text.
- **Eased scrolling.** The wheel handler moves a target scroll position, and a critically damped spring moves the real scroll position toward it, which keeps the speed changing gradually at the start and end of each move. Wheel events less than 40ms apart count as a stream, which covers trackpads, free-spin mouse wheels and mice with their own smoothing, and they use a spring frequency of 26 for a close follow. Separate wheel clicks use a spring frequency of 9 for a soft settle. Scrollbar drags, arrow keys and touch scrolling stay native, and a scroll the script didn't cause cancels the spring.
- **Edge fade.** A CSS `mask-image` gradient on the scrolling text area.
- Viewers who've turned on reduced motion get standard scrolling.

## Open items

- The caption under the photo still describes a concert placeholder, and it needs real copy and a real credit.
- The article text is original placeholder copy, repeated three times to make the page long enough to scroll.
