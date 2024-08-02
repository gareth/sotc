import EventEmitter from "../../core/util/EventEmitter";
import { LogLevel, TaggedLogger } from "../../core/util/TaggedLogger";
import { NavigateEventDetail, Seat, isSOTCEventMessage } from "../types/event";
import { ExtensionState, Grimoire, Script } from "../types/sotc";

import { createPinia } from "pinia";
import useExtensionStore from "../stores/extension";
import { Offsets } from "../../core/util/bounds";

const pinia = createPinia();
const extensionStore = useExtensionStore(pinia);

const logger = new TaggedLogger("GameManager", LogLevel.DEBUG);

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

    port.onMessage.addListener((message: object | "ping") => {
      if (message == "ping") return;

      if (!isSOTCEventMessage(message)) {
        logger.warn("Received malformed port message", message);
        return;
      }

      logger.debug("Received port message", message);

      switch (message.type) {
        case "sotc-navigate":
          this.state.page = (message.payload as NavigateEventDetail).page;
          extensionStore.page = this.state.page;
          logger.debug("Page is now", this.state.page);
          break;
        case "sotc-scriptChanged":
          this.state.script = message.payload as Script;
          extensionStore.script = this.state.script;
          logger.debug("Script is now", this.state.script);
          break;
        case "sotc-playersChanged":
          this.state.seats = message.payload as Seat[];
          extensionStore.seats = this.state.seats;
          logger.debug("Seats are now", this.state.seats);
          break;
        case "sotc-size":
          this.state.grim = message.payload as Grimoire;
          extensionStore.grim = this.state.grim;
          logger.debug("Grim is now", this.state.grim);
          break;
      }
      // extensionStore.state = clone(this.state);
      logger.info("State is now", this.state);
    });
  }

  set overlay(value: { pos: Offsets }) {
    this.state.overlay = value;
    extensionStore.overlay = this.state.overlay;
    logger.debug("Overlay is now", this.state.overlay);
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

  startCalibration() {
    this.port?.postMessage({ type: "startCalibration" });
  }

  endCalibration() {
    this.port?.postMessage({ type: "endCalibration" });
  }
}
