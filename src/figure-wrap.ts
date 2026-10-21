// Keeps the indent in the text column lined up with the fixed photo and caption.
// The column holds two floats: a zero-width spacer and a band as wide as the indent.
// The spacer's height moves the band down to wherever the figure sits on screen,
// and the browser wraps the text around the band natively.
//
// The photo, caption, date and share icons stay fixed until the text reaches its start
// or end. Past either point, they move with the text and scroll out of the frame together.

/** Reference width of the layout, in px. One reference px is the frame width divided by this. */
export const REFERENCE_WIDTH = 2290;

/** Frame height in reference px. The empty room above the first line and below the last line is each this tall. */
export const FRAME_HEIGHT = 1288.125;

/** Distance from the frame's top to the first line in the opening view, in reference px. */
export const TEXT_TOP = 52;

/**
 * Clearance above the photo, in reference px. A line that comes within this distance
 * of the photo's top edge is indented. With line spacing included, a full-width line
 * always keeps at least 97.88 reference px of space above the photo.
 */
export const CLEAR_ABOVE = 89.08;

/** Clearance below the caption, in reference px. */
export const CLEAR_BELOW = 22;

export interface ReleaseMeasurements {
  /** Top of the text column, in px from the frame's top. */
  textStart: number;
  /** Bottom of the last paragraph, in px from the frame's top. */
  textEnd: number;
  /** Bottom of the caption without any shift, in px from the frame's top. */
  figureEnd: number;
  /** Size of one reference px, in px. */
  unit: number;
}

/**
 * Returns how far the photo, caption, date and share icons move, in px. The shift is
 * negative once the last line rises above the caption's bottom edge plus the clearance,
 * positive once the first line drops below its opening position, and zero in between.
 */
export function releaseShift({ textStart, textEnd, figureEnd, unit }: ReleaseMeasurements): number {
  const lift = Math.max(0, figureEnd + CLEAR_BELOW * unit - textEnd);
  const drop = Math.max(0, textStart - TEXT_TOP * unit);
  return drop - lift;
}

export interface WrapMeasurements {
  /** Top of the figure, in viewport px. */
  figureTop: number;
  /** Height of the photo and caption together, in px. */
  figureHeight: number;
  /** Top of the text column, in viewport px. */
  articleTop: number;
  /** Size of one reference px, in px. */
  unit: number;
}

export interface WrapHeights {
  spacer: number;
  band: number;
}

export function wrapHeights({ figureTop, figureHeight, articleTop, unit }: WrapMeasurements): WrapHeights {
  const bandTop = figureTop - articleTop - CLEAR_ABOVE * unit;
  const bandHeight = figureHeight + (CLEAR_ABOVE + CLEAR_BELOW) * unit;
  // When the band would start above the column, the column's top edge cuts it short.
  return {
    spacer: Math.max(0, bandTop),
    band: Math.max(0, bandHeight + Math.min(0, bandTop)),
  };
}

export interface FigureWrapElements {
  stage: HTMLElement;
  article: HTMLElement;
  lastParagraph: HTMLElement;
  figure: HTMLElement;
  meta: HTMLElement;
  spacer: HTMLElement;
  band: HTMLElement;
}

export function createFigureWrap({ stage, article, lastParagraph, figure, meta, spacer, band }: FigureWrapElements) {
  let lastShift = 0;
  let lastSpacer = -1;
  let lastBand = -1;

  function update() {
    const unit = stage.clientWidth / REFERENCE_WIDTH;
    const stageTop = stage.getBoundingClientRect().top;

    // offsetTop ignores the transform, so the caption's resting position stays the reference.
    const shift = releaseShift({
      textStart: article.getBoundingClientRect().top - stageTop,
      textEnd: lastParagraph.getBoundingClientRect().bottom - stageTop,
      figureEnd: figure.offsetTop + figure.offsetHeight,
      unit,
    });
    if (shift !== lastShift) {
      const transform = shift ? `translateY(${shift.toFixed(2)}px)` : "";
      figure.style.transform = transform;
      meta.style.transform = transform;
      lastShift = shift;
    }

    // The band follows the figure's shifted position, so the indent travels with it.
    const articleRect = article.getBoundingClientRect();
    const figureRect = figure.getBoundingClientRect();
    const heights = wrapHeights({
      figureTop: figureRect.top,
      figureHeight: figureRect.height,
      articleTop: articleRect.top,
      unit,
    });
    // Skipping unchanged values saves the browser a text reflow.
    if (heights.spacer !== lastSpacer) {
      spacer.style.height = `${heights.spacer}px`;
      lastSpacer = heights.spacer;
    }
    if (heights.band !== lastBand) {
      band.style.height = `${heights.band}px`;
      lastBand = heights.band;
    }
  }

  return { update };
}
