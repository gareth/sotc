/**
 * "Deep clones" an object by stringifying and parsing it through JSON.
 *
 * Good for removing "proxy" references.
 */
// Typescript can't infer that we're returning an object with the same structure
// as its input, so we tell it that it's safe to return this `any` type
export const clone: <T extends object>(o: T) => T = (o) =>
  JSON.parse(JSON.stringify(o)); // eslint-disable-line @typescript-eslint/no-unsafe-return
