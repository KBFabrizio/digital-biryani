import { describe, expect, it } from "vitest";
import { SPRING_NOTCH, SPRING_STREAM, stepSpring, wheelDeltaInPixels, type SpringState } from "./smooth-scroll";

function run(omega: number, target: number, seconds: number, fps = 60) {
  let state: SpringState | null = { pos: 0, vel: 0 };
  const path: number[] = [];
  for (let t = 0; t < seconds && state; t += 1 / fps) {
    state = stepSpring(state, target, omega, 1 / fps);
    path.push(state ? state.pos : target);
  }
  return { settled: state === null, path };
}

describe("stepSpring", () => {
  it("starts slowly instead of jumping on the first frame", () => {
    const first = stepSpring({ pos: 0, vel: 0 }, 1000, SPRING_NOTCH, 1 / 60);
    expect(first?.pos).toBeGreaterThan(0);
    expect(first?.pos).toBeLessThan(15);
  });

  it("never overshoots the target, because the spring is critically damped", () => {
    for (const omega of [SPRING_NOTCH, SPRING_STREAM]) {
      const { path } = run(omega, 1000, 3);
      expect(Math.max(...path)).toBeLessThanOrEqual(1000);
    }
  });

  it("settles on the target within 1.5 seconds for separate wheel clicks", () => {
    const { settled, path } = run(SPRING_NOTCH, 1000, 1.5);
    expect(settled).toBe(true);
    expect(path.at(-1)).toBe(1000);
  });

  it("follows a stream more closely than separate clicks", () => {
    const notch = stepSpring({ pos: 0, vel: 0 }, 1000, SPRING_NOTCH, 0.1);
    const stream = stepSpring({ pos: 0, vel: 0 }, 1000, SPRING_STREAM, 0.1);
    expect(stream!.pos).toBeGreaterThan(notch!.pos);
  });

  it("moves about the same at 120 Hz as at 60 Hz", () => {
    const at60 = run(SPRING_NOTCH, 1000, 0.25, 60).path.at(-1)!;
    const at120 = run(SPRING_NOTCH, 1000, 0.25, 120).path.at(-1)!;
    expect(Math.abs(at60 - at120)).toBeLessThan(20);
  });

  it("scrolls up as well as down", () => {
    let state: SpringState | null = { pos: 1000, vel: 0 };
    for (let i = 0; i < 120 && state; i++) state = stepSpring(state, 0, SPRING_NOTCH, 1 / 60);
    expect(state).toBeNull();
  });
});

describe("wheelDeltaInPixels", () => {
  it("passes pixel deltas through", () => {
    expect(wheelDeltaInPixels({ deltaY: 120, deltaMode: 0 }, 800)).toBe(120);
  });

  it("converts line deltas at 40px per line", () => {
    expect(wheelDeltaInPixels({ deltaY: 3, deltaMode: 1 }, 800)).toBe(120);
  });

  it("converts page deltas to the scroller height", () => {
    expect(wheelDeltaInPixels({ deltaY: -1, deltaMode: 2 }, 800)).toBe(-800);
  });
});
