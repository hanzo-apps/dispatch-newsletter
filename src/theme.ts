/**
 * Dispatch's newsprint palette, in ONE place. Passed as explicit color values to
 * @hanzo/gui primitives (Tamagui accepts raw strings) so the whole surface reads
 * as one quiet, typographic system: warm off-white paper, near-black ink, a
 * single hairline rule, and a solid black subscribe button.
 */
export const paper = '#FBFAF6' // warm off-white page
export const ink = '#141312' // near-black text + button fill
export const rule = '#E3DFD5' // hairline rules + field borders
export const muted = '#6C6A63' // secondary text (bylines, meta)
export const faint = '#9C988D' // faintest meta / eyebrows
export const onInk = '#FBFAF6' // text on the black button

/** The measure — a single narrow reading column. */
export const measure = 640
