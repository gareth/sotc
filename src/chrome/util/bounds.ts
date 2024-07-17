export interface Bounds {
  x: number;
  y: number;
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
    top: bounds.y / container.clientHeight,
    left: bounds.x / container.clientWidth,
    right: (container.clientWidth - bounds.x - bounds.width) / container.clientWidth,
    bottom: (container.clientHeight - bounds.y - bounds.height) / container.clientHeight,
  };
};

export const offsetsToBounds = (offsets: Offsets, bounds: Bounds): Bounds => {
  return {
    x: offsets.left * bounds.width,
    y: offsets.top * bounds.height,
    width: (1 - offsets.left - offsets.right) * bounds.width,
    height: (1 - offsets.top - offsets.bottom) * bounds.height,
  };
};

export const insetBoundsBy = (offsets: Bounds, inset: number): Bounds => {
  const ratio = 1 - inset * 2;
  return {
    x: offsets.x + offsets.width * inset,
    y: offsets.y + offsets.height * inset,
    width: offsets.width * ratio,
    height: offsets.height * ratio,
  };
};

export const invertInsetBoundsBy = (bounds: Bounds, inset: number): Bounds => {
  const inverseInset = 1 / (1 / inset - 2);
  const ratio = 1 - inset * 2;
  return {
    x: bounds.x - bounds.width * inverseInset,
    y: bounds.y - bounds.height * inverseInset,
    width: bounds.width / ratio,
    height: bounds.height / ratio,
  };
};
