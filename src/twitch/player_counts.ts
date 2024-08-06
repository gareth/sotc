import type { CharacterType } from "../browser/types/sotc";

type Breakdown = Record<CharacterType[number], number>;

// Taken directly from the official app. Could do it with math but a lookup is
// just as good
const counts: Breakdown[] = [
  {
    townsfolk: 3,
    outsider: 0,
    minion: 1,
    demon: 1,
  },
  {
    townsfolk: 3,
    outsider: 1,
    minion: 1,
    demon: 1,
  },
  {
    townsfolk: 5,
    outsider: 0,
    minion: 1,
    demon: 1,
  },
  {
    townsfolk: 5,
    outsider: 1,
    minion: 1,
    demon: 1,
  },
  {
    townsfolk: 5,
    outsider: 2,
    minion: 1,
    demon: 1,
  },
  {
    townsfolk: 7,
    outsider: 0,
    minion: 2,
    demon: 1,
  },
  {
    townsfolk: 7,
    outsider: 1,
    minion: 2,
    demon: 1,
  },
  {
    townsfolk: 7,
    outsider: 2,
    minion: 2,
    demon: 1,
  },
  {
    townsfolk: 9,
    outsider: 0,
    minion: 3,
    demon: 1,
  },
  {
    townsfolk: 9,
    outsider: 1,
    minion: 3,
    demon: 1,
  },
  {
    townsfolk: 9,
    outsider: 2,
    minion: 3,
    demon: 1,
  },
];

const playerCountsByTotal = counts.map((breakdown): [number, Breakdown] => {
  const values = Object.values(breakdown);
  const sum = values.reduce((a, b) => a + b);
  return [sum, breakdown];
});

export default new Map(playerCountsByTotal);
