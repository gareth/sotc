import { insetBoundsBy, Bounds, invertInsetBoundsBy, mapToPixels, mapToPercent } from "./bounds";

test("insets bounds the right amount", () => {
  const initial: Bounds = {
    top: 1000,
    left: 1000,
    width: 1000,
    height: 1000,
  };
  expect(insetBoundsBy(initial, 0.1)).toEqual({
    top: 1100,
    left: 1100,
    width: 800,
    height: 800,
  });
});

test("inverts inset bounds back to the original value", () => {
  const initial: Bounds = {
    top: 1000,
    left: 1000,
    width: 1000,
    height: 1000,
  };
  const inset = insetBoundsBy(initial, 0.1);
  expect(invertInsetBoundsBy(inset, 0.1)).toEqual(initial);
});

test("maps object properties to pixels", () => {
  const initial = {
    foo: 20,
    bar: 100,
    baz: -50,
  };
  expect(mapToPixels(initial)).toEqual({
    foo: "20px",
    bar: "100px",
    baz: "-50px",
  });
});

test("maps object properties to percentages", () => {
  const initial = {
    foo: 0.2,
    bar: 1,
    baz: -0.5,
    quux: 20,
  };
  expect(mapToPercent(initial)).toEqual({
    foo: "20%",
    bar: "100%",
    baz: "-50%",
    quux: "2000%",
  });
});
