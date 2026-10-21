import { describe, expect, it } from "vitest";
import { SMOOTHING, easeToward, wheelDeltaInPixels } from "./smooth-scroll";

describe("easeToward", () => {
  it("covers 1 - e^(-dt × smoothing) of the remaining distance", () => {
    const dt = 1 / 60;
    expect(easeToward(0, 1000, dt)).toBeCloseTo(1000 * (1 - Math.exp(-dt * SMOOTHING)), 10);
  });

  it("covers the same distance at 120 Hz in two frames as at 60 Hz in one", () => {
    const once = easeToward(0, 1000, 1 / 60);
    const twice = easeToward(easeToward(0, 1000, 1 / 120), 1000, 1 / 120);
    expect(twice).toBeCloseTo(once, 10);
  });

  it("snaps to the target once it's within 0.3px", () => {
    expect(easeToward(999.8, 1000, 1 / 60)).toBe(1000);
  });

  it("reaches the target in both directions", () => {
    let up = 1000;
    let down = 0;
    for (let frame = 0; frame < 600 && (up !== 0 || down !== 1000); frame++) {
      up = easeToward(up, 0, 1 / 60);
      down = easeToward(down, 1000, 1 / 60);
    }
    expect(up).toBe(0);
    expect(down).toBe(1000);
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
