import EventEmitter from "../../core/util/EventEmitter";
import { LogLevel, TaggedLogger } from "../../core/util/TaggedLogger";
import { GamePhase, GameState, NavigateEventDetail, Seat, isSOTCEventMessage } from "../types/event";
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

  state: Pick<ExtensionState, "game"> & Partial<ExtensionState> = {
    game: { phase: "inactive" },
  };

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
        case "navigate":
          this.state.page = (message.payload as NavigateEventDetail).page;
          extensionStore.page = this.state.page;
          logger.debug("Page is now", this.state.page);
          break;
        case "scriptChanged":
          this.state.script = message.payload as Script;
          extensionStore.script = this.state.script;
          this.step({ phase: "inactive" });
          logger.debug("Script is now", this.state.script);
          break;
        case "playersChanged":
          this.state.seats = message.payload as Seat[];
          extensionStore.knownSeats = this.state.seats;
          logger.debug("Seats are now", this.state.seats);
          break;
        case "size":
          this.state.grim = message.payload as Grimoire;
          extensionStore.grim = this.state.grim;
          if (this.state.grim.mode == "reveal") {
            this.step({ phase: "reveal" });
          } else if (this.state.game.phase == "reveal" && this.state.grim.mode == "grimoire") {
            this.step({ phase: "inactive" });
          }
          logger.debug("Grim is now", this.state.grim);
          break;
        case "gameState":
          {
            const gameState = message.payload as GameState;
            if (gameState.isRunning) {
              this.step({ phase: "running", count: gameState.phase });
            }
            logger.debug("Game is now", this.state.game);
          }
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

  step(phase: GamePhase) {
    const newPhase = GamePhaseState.step(this.state.game, phase);
    this.state.game = newPhase;
    extensionStore.game = newPhase;
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

class GamePhaseState {
  static step(phase: GamePhase, newPhase: GamePhase): GamePhase {
    if (newPhase.phase == "running" || newPhase.phase == "reveal") {
      return newPhase;
    } else if (phase.phase == "reveal") {
      return newPhase;
    }
    return phase;
  }
}

/*
isRunning: false -> true === Running
mode: grimoire -> reveal === Reveal
mode: reveal -> grimoire === Inactive
*/
