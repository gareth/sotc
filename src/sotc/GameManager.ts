import EventEmitter from "../util/EventEmitter";
import { TaggedLogger } from "../util/TaggedLogger";
import { NavigateEventDetail, Seat, isSOTCEventMessage } from "../types/event";
import { ExtensionState, Script } from "../types/sotc";

const logger = new TaggedLogger("GameManager");

type Port = chrome.runtime.Port;

type Connection =
  | { state: "connected"; port: Port }
  | { state: "waiting"; port: Port; timeout: NodeJS.Timeout }
  | { state: "disconnected" };

const DISCONNECTED: Connection = { state: "disconnected" };

const WAITING_TIMEOUT = 5000;

export class GameManager {
  static #instance: GameManager = new GameManager();

  static get instance() {
    return this.#instance;
  }

  #events: EventEmitter = new EventEmitter();
  #_connection: Connection = DISCONNECTED;

  state: Partial<ExtensionState> = {};

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

    port.onMessage.addListener((message: object) => {
      if (!isSOTCEventMessage(message)) {
        logger.warn("Received malformed port message", message);
        return;
      }

      logger.debug("Received port message", message);

      switch (message.type) {
        case "sotc-navigate":
          this.state.page = (message.payload as NavigateEventDetail).page;
          logger.debug("Page is now", this.state.page);
          break;
        case "sotc-scriptChanged":
          this.state.script = message.payload as Script;
          logger.debug("Script is now", this.state.script);
          break;
        case "sotc-playersChanged":
          this.state.seats = message.payload as Seat[];
          logger.debug("Script is now", this.state.script);
          break;
      }
      logger.info("State is now", this.state);
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
