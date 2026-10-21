import "./styles.css";
import { FRAME_HEIGHT, REFERENCE_WIDTH, createFigureWrap } from "./figure-wrap";
import { initShare } from "./share";
import { createSmoothScroll } from "./smooth-scroll";

function byId(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) throw new Error(`The page is missing the #${id} element.`);
  return element;
}

const stage = byId("stage");
const scroller = byId("scroller");
const article = byId("article");
const meta = byId("meta");

const lastParagraph = article.querySelector<HTMLElement>("p:last-of-type");
if (!lastParagraph) throw new Error("The article has no paragraphs.");

const wrap = createFigureWrap({
  stage,
  article,
  lastParagraph,
  figure: byId("figure"),
  meta,
  spacer: byId("wrap-spacer"),
  band: byId("wrap-band"),
});

// The page opens scrolled past the empty frame at the top, with the first paragraph in view.
let lastWidth = stage.clientWidth;
scroller.scrollTop = FRAME_HEIGHT * (lastWidth / REFERENCE_WIDTH);

// Every size scales with the frame width, so scaling the scroll position by the same
// ratio keeps the reader at the same spot in the text.
new ResizeObserver(() => {
  const width = stage.clientWidth;
  if (width !== lastWidth && lastWidth) scroller.scrollTop *= width / lastWidth;
  lastWidth = width;
  wrap.update();
}).observe(stage);

// Native scrolls update the layout in the scroll event, which runs before the next paint.
scroller.addEventListener("scroll", wrap.update, { passive: true });
document.fonts?.ready.then(wrap.update);
wrap.update();

// The spring updates the layout in the same frame that it moves the text.
createSmoothScroll(scroller, { wheelTarget: stage, onFrame: wrap.update });

initShare(meta);
