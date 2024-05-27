type CallbackFn = (...args: any[]) => any;

type Callback = {
  name: string;
  callback: CallbackFn;
};

export default class EventEmitter {
  listeners: Callback[] = [];

  emit(eventName: string, ...data: any[]) {
    this.listeners
      .filter(({ name }: { name: string }) => name === eventName)
      .forEach(({ callback }: { callback: CallbackFn }) => {
        callback.apply(this, data);
      });
  }

  on(name: string, callback: CallbackFn) {
    this.listeners.push({ name, callback });
  }

  off(eventName: string, callback: CallbackFn) {
    this.listeners = this.listeners.filter((listener: Callback) => {
      !(listener.name === eventName && listener.callback === callback);
    });
  }

  destroy() {
    this.listeners.length = 0;
  }
}
