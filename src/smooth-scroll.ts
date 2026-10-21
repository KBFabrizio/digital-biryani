// Eased wheel scrolling. The wheel handler moves a target scroll position, and each
// animation frame moves the real scroll position toward the target. Scrollbar drags,
// arrow keys and touch scrolling stay native, and a scroll that this module didn't
// cause cancels the glide. Viewers who've turned on reduced motion get standard scrolling.

/** Higher values stop sooner. The glide covers 1 - e^(-dt × SMOOTHING) of the remaining distance per frame. */
export const SMOOTHING = 6;

/** The glide snaps to the target once it's this close, in px. */
const SNAP_DISTANCE = 0.3;

/** A scroll position this far from the last one the glide set came from somewhere else, in px. */
const FOREIGN_SCROLL_DISTANCE = 2;

/** Longest frame the glide will step over, in seconds, so a stalled tab doesn't jump. */
const MAX_FRAME = 0.05;

/** Pixels per line for wheel events that report lines instead of pixels. */
const LINE_HEIGHT = 40;

// WheelEvent.DOM_DELTA_LINE and DOM_DELTA_PAGE, written out so the module also loads outside a browser.
const DELTA_LINE = 1;
const DELTA_PAGE = 2;

export function easeToward(current: number, target: number, dt: number, smoothing = SMOOTHING): number {
  const next = current + (target - current) * (1 - Math.exp(-dt * smoothing));
  return Math.abs(target - next) < SNAP_DISTANCE ? target : next;
}

export function wheelDeltaInPixels(event: Pick<WheelEvent, "deltaY" | "deltaMode">, pageHeight: number): number {
  if (event.deltaMode === DELTA_LINE) return event.deltaY * LINE_HEIGHT;
  if (event.deltaMode === DELTA_PAGE) return event.deltaY * pageHeight;
  return event.deltaY;
}

export interface SmoothScrollOptions {
  /** Element that receives wheel events. Defaults to the scroller. */
  wheelTarget?: HTMLElement;
  /** Runs after each frame of the glide sets the scroll position, before the browser paints. */
  onFrame?: () => void;
}

export function createSmoothScroll(scroller: HTMLElement, { wheelTarget = scroller, onFrame }: SmoothScrollOptions = {}) {
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let target = 0;
  let current = 0;
  let lastSet = -1;
  let lastTime = 0;
  let frame = 0;
  let running = false;

  const maxScroll = () => scroller.scrollHeight - scroller.clientHeight;
  const clamp = (value: number) => Math.max(0, Math.min(maxScroll(), value));

  function stop() {
    cancelAnimationFrame(frame);
    running = false;
    target = current = scroller.scrollTop;
  }

  function step(now: number) {
    const dt = lastTime ? Math.min(MAX_FRAME, (now - lastTime) / 1000) : 1 / 60;
    lastTime = now;
    current = easeToward(current, target, dt);
    scroller.scrollTop = current;
    lastSet = scroller.scrollTop;
    onFrame?.();
    if (current !== target) {
      frame = requestAnimationFrame(step);
    } else {
      running = false;
    }
  }

  function onWheel(event: WheelEvent) {
    // Pinch zoom, horizontal swipes and reduced motion keep the browser's own behavior.
    if (reducedMotion.matches || event.ctrlKey) return;
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    event.preventDefault();
    if (!running) target = current = scroller.scrollTop;
    target = clamp(target + wheelDeltaInPixels(event, scroller.clientHeight));
    if (running || target === current) return;
    running = true;
    lastTime = 0;
    frame = requestAnimationFrame(step);
  }

  function onScroll() {
    if (running && Math.abs(scroller.scrollTop - lastSet) > FOREIGN_SCROLL_DISTANCE) stop();
  }

  function onMotionPreferenceChange() {
    if (reducedMotion.matches && running) stop();
  }

  // The scroll height changes when the frame resizes, so the target has to stay in range.
  const resizeObserver = new ResizeObserver(() => {
    target = clamp(target);
  });

  wheelTarget.addEventListener("wheel", onWheel, { passive: false });
  scroller.addEventListener("scroll", onScroll, { passive: true });
  reducedMotion.addEventListener("change", onMotionPreferenceChange);
  resizeObserver.observe(scroller);

  return {
    destroy() {
      cancelAnimationFrame(frame);
      running = false;
      wheelTarget.removeEventListener("wheel", onWheel);
      scroller.removeEventListener("scroll", onScroll);
      reducedMotion.removeEventListener("change", onMotionPreferenceChange);
      resizeObserver.disconnect();
    },
  };
}
