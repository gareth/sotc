# Contexts

## popup.js

The UI, initialised and made visible when the extension icon is clicked

## worker.js

The global main thread, for centralised processing/data storage

## content.js

The isolated per-page handling-script which doesn't have direct access to in-page variables/Vue DOM data

## inject.js

An injected script that has access to DOM/Vue data but can't communiate directly with the worker

# Communication

## inject -> content

DOM CustomEvent

```javascript
new CustomEvent("sotc-eventName", detail: {})
```

## content -> worker

```javascript
port.postMessage({
  type: "sotc-eventName",
  payload: detail
})
```

## worker -> Twitch

```javascript
{
  user: {
    role: "storyteller" | "player" | "spectator",
    name: string,
  },
  script: {
    name: string,
    author: string,
    characters: Character[],
  },
  game: {
    storytellers: Player[],
    players: Player[],
    phase: number | "start",
  },
  app: {
    town_square: [left: number, top: number, w: number, h: number, r: number] // good luck!
  }
}
```
