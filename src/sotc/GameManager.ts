import EventEmitter from "../util/EventEmitter";
import { Game } from "./Game";
import { TaggedLogger } from "../util/TaggedLogger";

const logger = new TaggedLogger("GameManager");

type Port = chrome.runtime.Port;

type Connection =
  | { state: "connected"; port: Port }
  | { state: "waiting"; port: Port; timeout: NodeJS.Timeout }
  | { state: "disconnected" };

const DISCONNECTED: Connection = { state: "disconnected" };

const WAITING_TIMEOUT = 5000;

type GameMessage = { type: string; payload: any };
function isGameMessage(message: any): message is GameMessage {
  return (
    "type" in message && typeof message.type == "string" && "payload" in message
  );
}

export class GameManager {
  static #instance: GameManager = new GameManager();

  static get instance() {
    return this.#instance;
  }

  #events: EventEmitter = new EventEmitter();
  #_connection: Connection = DISCONNECTED;

  #_game?: Game;
  page?: string;

  connect(port: chrome.runtime.Port) {
    this.port?.disconnect();

    if (this.#connection.state == "waiting") {
      clearTimeout(this.#connection.timeout);
    }

    this.#connection = { state: "connected", port };

    port.onDisconnect.addListener((_port) => {
      const timeout = setTimeout(() => {
        this.#game = undefined;
        this.#connection = DISCONNECTED;
      }, WAITING_TIMEOUT);

      this.#connection = { state: "waiting", port, timeout };
    });

    port.onMessage.addListener((message: unknown) => {
      if (!isGameMessage(message)) return;

      logger.debug("Received port message", message.type, message.payload);
      switch (message.type) {
        case "gameState":
          this.#game = message.payload;
          break;
        case "sotc-navigate":
          this.page = message.payload.page;
          logger.debug("Page is now", this.page);
          break;
      }
      logger.debug("State is now", { ...this });
    });
  }

  set #connection(connection: Connection) {
    logger.debug("Connection state change", connection);
    this.#_connection = connection;
    this.#emit(`port:${connection.state}`, connection);
  }

  set #game(game: Game | undefined) {
    logger.debug("Game state change", game);
    this.#_game = game;
    this.#emit("game:updated", this.#_game);
  }

  get game() {
    return this.#_game;
  }

  get #connection() {
    return this.#_connection;
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

  on = (event: string, callback: (..._data: any[]) => void) =>
    this.#events.on(event, callback);
  off = (event: string, callback: (..._data: any[]) => void) =>
    this.#events.off(event, callback);
  #emit = (event: string, ...data: any[]) => this.#events.emit(event, ...data);
}
