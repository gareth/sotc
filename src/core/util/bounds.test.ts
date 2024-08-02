import { insetBoundsBy, Bounds, invertInsetBoundsBy } from "./bounds";

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

test("inverts insetting bounds the right amount", () => {
  const initial: Bounds = {
    top: 1100,
    left: 1100,
    width: 800,
    height: 800,
  };
  expect(invertInsetBoundsBy(initial, 0.1)).toEqual({
    top: 1000,
    left: 1000,
    width: 1000,
    height: 1000,
  });
});
