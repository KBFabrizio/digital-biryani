// Eased wheel scrolling. The wheel handler moves a target scroll position, and a
// critically damped spring moves the real scroll position toward it, so the speed
// changes gradually at the start and end of each move. Scrollbar drags, arrow keys
// and touch scrolling stay native, and a scroll that this module didn't cause stops
// the spring. Viewers who've turned on reduced motion get standard scrolling.

/** Spring frequency for separate wheel clicks, which settle softly. */
export const SPRING_NOTCH = 9;

/** Spring frequency for streams of wheel events from trackpads, free-spin wheels and mice with their own smoothing, which follow closely. */
export const SPRING_STREAM = 26;

/** Wheel events closer together than this count as a stream, in ms. */
export const STREAM_GAP = 40;

/** The spring integrates in steps no longer than this, in seconds. */
const SUBSTEP = 1 / 240;

/** The spring settles once it's this close to the target, in px, */
const SETTLE_DISTANCE = 0.25;

/** and moving slower than this, in px per second. */
const SETTLE_SPEED = 4;

/** A scroll position this far from the last one the spring set came from somewhere else, in px. */
const FOREIGN_SCROLL_DISTANCE = 2;

/** Longest frame the spring will step over, in seconds, so a stalled tab doesn't jump. */
const MAX_FRAME = 0.05;

/** Pixels per line for wheel events that report lines instead of pixels. */
const LINE_HEIGHT = 40;

// WheelEvent.DOM_DELTA_LINE and DOM_DELTA_PAGE, written out so the module also loads outside a browser.
const DELTA_LINE = 1;
const DELTA_PAGE = 2;

export interface SpringState {
  pos: number;
  vel: number;
}

/** Advances a critically damped spring toward the target. Returns null once it has settled on the target. */
export function stepSpring({ pos, vel }: SpringState, target: number, omega: number, dt: number): SpringState | null {
  const steps = Math.max(1, Math.ceil(dt / SUBSTEP));
  const h = dt / steps;
  for (let i = 0; i < steps; i++) {
    vel += (omega * omega * (target - pos) - 2 * omega * vel) * h;
    pos += vel * h;
  }
  if (Math.abs(target - pos) < SETTLE_DISTANCE && Math.abs(vel) < SETTLE_SPEED) return null;
  return { pos, vel };
}

export function wheelDeltaInPixels(event: Pick<WheelEvent, "deltaY" | "deltaMode">, pageHeight: number): number {
  if (event.deltaMode === DELTA_LINE) return event.deltaY * LINE_HEIGHT;
  if (event.deltaMode === DELTA_PAGE) return event.deltaY * pageHeight;
  return event.deltaY;
}

export interface SmoothScrollOptions {
  /** Element that receives wheel events. Defaults to the scroller. */
  wheelTarget?: HTMLElement;
  /** Runs after each frame of the spring sets the scroll position, before the browser paints. */
  onFrame?: () => void;
}

export function createSmoothScroll(scroller: HTMLElement, { wheelTarget = scroller, onFrame }: SmoothScrollOptions = {}) {
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let spring: SpringState | null = null;
  let target = 0;
  let omega = SPRING_NOTCH;
  let lastWheel = -Infinity;
  let lastSet = -1;
  let lastTime = 0;
  let frame = 0;

  const maxScroll = () => scroller.scrollHeight - scroller.clientHeight;
  const clamp = (value: number) => Math.max(0, Math.min(maxScroll(), value));

  function stop() {
    cancelAnimationFrame(frame);
    spring = null;
  }

  function step(now: number) {
    if (!spring) return;
    const dt = lastTime ? Math.min(MAX_FRAME, (now - lastTime) / 1000) : 1 / 60;
    lastTime = now;
    spring = stepSpring(spring, target, omega, dt);
    scroller.scrollTop = spring ? spring.pos : target;
    lastSet = scroller.scrollTop;
    onFrame?.();
    if (spring) frame = requestAnimationFrame(step);
  }

  function onWheel(event: WheelEvent) {
    // Pinch zoom, horizontal swipes and reduced motion keep the browser's own behavior.
    if (reducedMotion.matches || event.ctrlKey) return;
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    event.preventDefault();
    const now = performance.now();
    omega = now - lastWheel < STREAM_GAP ? SPRING_STREAM : SPRING_NOTCH;
    lastWheel = now;
    if (!spring) {
      target = scroller.scrollTop;
      spring = { pos: target, vel: 0 };
      lastTime = 0;
      frame = requestAnimationFrame(step);
    }
    target = clamp(target + wheelDeltaInPixels(event, scroller.clientHeight));
  }

  function onScroll() {
    if (spring && Math.abs(scroller.scrollTop - lastSet) > FOREIGN_SCROLL_DISTANCE) stop();
  }

  function onMotionPreferenceChange() {
    if (reducedMotion.matches) stop();
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
      stop();
      wheelTarget.removeEventListener("wheel", onWheel);
      scroller.removeEventListener("scroll", onScroll);
      reducedMotion.removeEventListener("change", onMotionPreferenceChange);
      resizeObserver.disconnect();
    },
  };
}
