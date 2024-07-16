declare module "draggable" {
  type AxisLimit = number | [number, number] | null;
  interface AxisLimits {
    x: AxisLimit;
    y: AxisLimit;
  }

  type DragHandler = (element: Element, x: number, y: number, event: MouseEvent) => void;

  interface DraggableOptions {
    grid: number;
    handle: Element;
    filterTarget: (target: Element) => boolean;
    limit: Element | AxisLimits | ((x: number, y: number, x0: number, y0: number) => AxisLimits) | null;
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
    get(): { x: number; y: number };
    set(x: number, y: number): Draggable;
    setOption<K extends keyof DraggableOptions>(property: K, value: DraggableOptions[K]): Draggable;
    destroy(): void;
  }
}
