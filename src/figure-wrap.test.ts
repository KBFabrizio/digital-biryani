import { describe, expect, it } from "vitest";
import { CLEAR_ABOVE, CLEAR_BELOW, TEXT_TOP, releaseShift, wrapHeights } from "./figure-wrap";

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

describe("releaseShift", () => {
  const unit = 0.5;
  const figureEnd = 600;
  const opening = { textStart: TEXT_TOP * unit, textEnd: 5000, figureEnd, unit };

  it("leaves everything in place in the opening view", () => {
    expect(releaseShift(opening)).toBe(0);
  });

  it("leaves everything in place while the text scrolls past the photo", () => {
    expect(releaseShift({ ...opening, textStart: -2000, textEnd: figureEnd + CLEAR_BELOW * unit })).toBe(0);
  });

  it("lifts everything once the last line rises above the caption plus the clearance", () => {
    const shift = releaseShift({ ...opening, textStart: -4000, textEnd: figureEnd + CLEAR_BELOW * unit - 150 });
    expect(shift).toBeCloseTo(-150, 10);
  });

  it("drops everything once the first line moves below its opening position", () => {
    expect(releaseShift({ ...opening, textStart: TEXT_TOP * unit + 300 })).toBeCloseTo(300, 10);
  });
});
