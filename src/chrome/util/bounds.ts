export interface Bounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Offsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export const boundsToOffsets = (bounds: Bounds, container: HTMLElement): Offsets => {
  return {
    top: bounds.top / container.clientHeight,
    left: bounds.left / container.clientWidth,
    right: (container.clientWidth - bounds.left - bounds.width) / container.clientWidth,
    bottom: (container.clientHeight - bounds.top - bounds.height) / container.clientHeight,
  };
};

export const offsetsToBounds = (offsets: Offsets, bounds: Bounds): Bounds => {
  return {
    left: offsets.left * bounds.width,
    top: offsets.top * bounds.height,
    width: (1 - offsets.left - offsets.right) * bounds.width,
    height: (1 - offsets.top - offsets.bottom) * bounds.height,
  };
};

export const insetBoundsBy = (offsets: Bounds, inset: number): Bounds => {
  const ratio = 1 - inset * 2;
  return {
    left: offsets.left + offsets.width * inset,
    top: offsets.top + offsets.height * inset,
    width: offsets.width * ratio,
    height: offsets.height * ratio,
  };
};

export const invertInsetBoundsBy = (bounds: Bounds, inset: number): Bounds => {
  const inverseInset = 1 / (1 / inset - 2);
  const ratio = 1 - inset * 2;
  return {
    left: bounds.left - bounds.width * inverseInset,
    top: bounds.top - bounds.height * inverseInset,
    width: bounds.width / ratio,
    height: bounds.height / ratio,
  };
};

export const mapToPixels = (object: Record<string, number>) =>
  Object.fromEntries([...Object.entries(object)].map(([k, v]) => [k, `${v}px`]));
