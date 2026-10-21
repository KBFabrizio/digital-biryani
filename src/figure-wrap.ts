// Keeps the indent in the text column lined up with the fixed photo and caption.
// The column holds two floats: a zero-width spacer and a band as wide as the indent.
// The spacer's height moves the band down to wherever the figure sits on screen,
// and the browser wraps the text around the band natively.

/** Reference width of the layout, in px. One reference px is the frame width divided by this. */
export const REFERENCE_WIDTH = 2290;

/**
 * Clearance above the photo, in reference px. A line that comes within this distance
 * of the photo's top edge is indented. With line spacing included, a full-width line
 * always keeps at least 97.88 reference px of space above the photo.
 */
export const CLEAR_ABOVE = 89.08;

/** Clearance below the caption, in reference px. */
export const CLEAR_BELOW = 22;

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
  figure: HTMLElement;
  spacer: HTMLElement;
  band: HTMLElement;
}

export function createFigureWrap({ stage, article, figure, spacer, band }: FigureWrapElements) {
  let lastSpacer = -1;
  let lastBand = -1;

  function update() {
    const articleRect = article.getBoundingClientRect();
    const figureRect = figure.getBoundingClientRect();
    const heights = wrapHeights({
      figureTop: figureRect.top,
      figureHeight: figureRect.height,
      articleTop: articleRect.top,
      unit: stage.clientWidth / REFERENCE_WIDTH,
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
