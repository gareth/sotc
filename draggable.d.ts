declare module "draggable" {
  type AxisLimit = number | [number, number] | null;
  interface AxisLimits {
    left: AxisLimit;
    top: AxisLimit;
  }

  type DragHandler = (element: Element, left: number, top: number, event: MouseEvent) => void;

  interface DraggableOptions {
    grid: number;
    handle: Element;
    filterTarget: (target: Element) => boolean;
    limit: Element | AxisLimits | ((left: number, top: number, x0: number, y0: number) => AxisLimits) | null;
    threshold: number;
    setCursor: boolean;
    setPosition: boolean;
    smoothDrag: boolean;
    useGPU: boolean;
    onDrag: DragHandler;
    onDragStart: DragHandler;
    onDragEnd: DragHandler;
  }

  export default class Draggable {
    constructor(element: Element, options?: Partial<DraggableOptions>);
    get(): { left: number; top: number };
    set(left: number, top: number): Draggable;
    setOption<K extends keyof DraggableOptions>(property: K, value: DraggableOptions[K]): Draggable;
    destroy(): void;
  }
}
