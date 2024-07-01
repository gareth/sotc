// Allow an item to be looked up in a union type based on its underlying element type.

// By design, Typescript treats `as const` arrays as a distinct type from its
// individual items. You can't use `element in array` or
// `array.includes(element)` for an array initialized with `as const`.

// It's possible to write a function that internally skips the type validation
// to perform the `includes` check, but externally uses generics to ensure that
// the arguments are of compatible types. These functions wrap up that type
// inconsistency in a way that will *generally* work in a typesafe way.

export function lookup<E, C extends E>(coll: readonly C[]) {
  return function (el: E): C | undefined {
    return includes(coll, el) ? el : undefined;
  };
}

// https://fettblog.eu/typescript-array-includes/
export function includes<E, C extends E>(coll: readonly C[], el: E): el is C {
  return coll.includes(el as C);
}
