import EventEmitter from "../util/EventEmitter";
import { TaggedLogger } from "../util/TaggedLogger";
import { SOTCEvent } from "../types/event";

const logger = new TaggedLogger("GameManager");

type Port = chrome.runtime.Port;

type Connection =
  | { state: "connected"; port: Port }
  | { state: "waiting"; port: Port; timeout: NodeJS.Timeout }
  | { state: "disconnected" };

const DISCONNECTED: Connection = { state: "disconnected" };

const WAITING_TIMEOUT = 5000;

interface GameMessage<T extends keyof SOTCEvent> {
  type: T;
  payload: SOTCEvent[T];
}

function isGameMessage<T extends keyof SOTCEvent>(message: object): message is GameMessage<T> {
  return "type" in message && typeof message.type == "string" && "payload" in message;
}

export class GameManager {
  static #instance: GameManager = new GameManager();

  static get instance() {
    return this.#instance;
  }

  #events: EventEmitter = new EventEmitter();
  #_connection: Connection = DISCONNECTED;

  page?: string;

  connect(port: chrome.runtime.Port) {
    logger.debug("Received connection from port", port);
    this.port?.disconnect();

    if (this.#connection.state == "waiting") {
      clearTimeout(this.#connection.timeout);
    }

    this.#connection = { state: "connected", port };

    port.onDisconnect.addListener((port) => {
      const timeout = setTimeout(() => {
        this.#connection = DISCONNECTED;
      }, WAITING_TIMEOUT);

      this.#connection = { state: "waiting", port, timeout };
    });

    port.onMessage.addListener(<T extends keyof SOTCEvent>(message: GameMessage<T>) => {
      if (!isGameMessage(message)) {
        logger.warn("Received malformed port message", message);
        return;
      }

      logger.debug("Received port message", message.type, message.payload);
      switch (message.type) {
        case "sotc-navigate":
          this.page = message.payload.page;
          logger.debug("Page is now", this.page);
          break;
      }
    });
  }

  get #connection() {
    return this.#_connection;
  }

  set #connection(connection: Connection) {
    logger.debug("Connection state change", connection);
    this.#_connection = connection;
    this.#emit(`port:${connection.state}`, connection);
  }

  get port() {
    switch (this.#connection.state) {
      case "connected":
      case "waiting":
        return this.#connection.port;
      default:
        return;
    }
  }

  on = (event: string, callback: (..._data: unknown[]) => void) => this.#events.on(event, callback);
  off = (event: string, callback: (..._data: unknown[]) => void) => this.#events.off(event, callback);
  #emit = (event: string, ...data: unknown[]) => this.#events.emit(event, ...data);
}
