import { describe, expect, it } from "vitest";
import { CLEAR_ABOVE, CLEAR_BELOW, wrapHeights } from "./figure-wrap";

describe("wrapHeights", () => {
  const unit = 0.5;

  it("starts the band CLEAR_ABOVE reference px above the figure", () => {
    const { spacer } = wrapHeights({ figureTop: 300, figureHeight: 400, articleTop: 20, unit });
    expect(spacer).toBeCloseTo(300 - 20 - CLEAR_ABOVE * unit, 10);
  });

  it("makes the band as tall as the figure plus both clearances", () => {
    const { band } = wrapHeights({ figureTop: 300, figureHeight: 400, articleTop: 20, unit });
    expect(band).toBeCloseTo(400 + (CLEAR_ABOVE + CLEAR_BELOW) * unit, 10);
  });

  it("follows the figure as the column scrolls up", () => {
    const before = wrapHeights({ figureTop: 300, figureHeight: 400, articleTop: 20, unit });
    const after = wrapHeights({ figureTop: 300, figureHeight: 400, articleTop: -480, unit });
    expect(after.spacer - before.spacer).toBeCloseTo(500, 10);
    expect(after.band).toBe(before.band);
  });

  it("cuts the band short when it would start above the column", () => {
    const { spacer, band } = wrapHeights({ figureTop: 100, figureHeight: 400, articleTop: 80, unit });
    const overhang = 100 - 80 - CLEAR_ABOVE * unit;
    expect(overhang).toBeLessThan(0);
    expect(spacer).toBe(0);
    expect(band).toBeCloseTo(400 + (CLEAR_ABOVE + CLEAR_BELOW) * unit + overhang, 10);
  });
});
