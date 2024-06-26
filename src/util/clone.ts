// "Deep clones" an object by stringifying and parsing it through JSON.
// Good for removing "proxy" references
export const clone: <T>(o: T) => T = (o) => JSON.parse(JSON.stringify(o));
