import "./styles.css";
import { createFigureWrap } from "./figure-wrap";
import { initShare } from "./share";
import { createSmoothScroll } from "./smooth-scroll";

function byId(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) throw new Error(`The page is missing the #${id} element.`);
  return element;
}

const stage = byId("stage");
const scroller = byId("scroller");

const wrap = createFigureWrap({
  stage,
  article: byId("article"),
  figure: byId("figure"),
  spacer: byId("wrap-spacer"),
  band: byId("wrap-band"),
});

// Native scrolls update the indent in the scroll event, which runs before the next paint.
scroller.addEventListener("scroll", wrap.update, { passive: true });
new ResizeObserver(wrap.update).observe(stage);
document.fonts?.ready.then(wrap.update);
wrap.update();

// The glide updates the indent in the same frame that it moves the text.
createSmoothScroll(scroller, { wheelTarget: stage, onFrame: wrap.update });

initShare(byId("meta"));
