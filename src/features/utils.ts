import { HandGroupTypes } from "../pages/Home/types/HomeTypes";
import { SettingStepTypes } from "../store/types/storeTypes";
import { CardTypes, PileTypes, PlayerTypes } from "./types/featuresTypes";

export const randomNumBetween = (
  min: number,
  max: number,
  type: "decimal" | "integer" = "integer"
): number => {
  if (type === "decimal") {
    return Math.random() * (max - min) + min;
  }
  if (type === "integer") {
    return Math.floor(Math.random() * (max - min) + min);
  }
  return 1;
};

export const copyPlayer = (players: PlayerTypes[]) => {
  const copiedPlayers = players.map((player) => ({
    ...player,
    hand: [...player.hand],
    status: { ...player.status },
  }));
  return copiedPlayers;
};

export const copyDeck = <T extends "deck" | "pile">(
  cards: T extends "deck" ? CardTypes[] : PileTypes,
  type: "deck" | "pile" = "deck"
) => {
  let copiedDeck: any[] = [];

  if (type === "deck") {
    copiedDeck = cards.map((card) => ({ ...card }));
  }

  if (type === "pile") {
    copiedDeck = (cards as PileTypes).map((pile) => {
      const latestCards = pile.map((card) => ({
        ...card,
      }));
      return [...latestCards];
    });
  }

  return copiedDeck;
};

export const calcCoordinate = (value: number, length: number, radius: number = 300) => {
  const getRadians = (value / length) * (Math.PI * 2) - Math.PI;
  const x = -Math.sin(getRadians) * 320;
  const y = Math.cos(getRadians) * 320;

  return { x, y };
};

export const getRankGroup = (hand: CardTypes[]) => {
  return Object.values(
    hand.reduce((acc: Record<string, HandGroupTypes>, cur) => {
      if (!acc[cur.rank]) {
        acc[cur.rank] = {
          rank: cur.rank,
          cards: [],
        };
      }

      acc[cur.rank].cards.push({
        id: cur.id,
        rank: cur.rank,
        value: cur.value,
      });

      return acc;
    }, {})
  );
};

export const isStepCondition = (
  settingStep: SettingStepTypes,
  type: "bootingToSettingReady" | "playing" | "readyToPlaying"
) => {
  let condition: boolean = false;

  switch (type) {
    case "bootingToSettingReady": {
      condition = settingStep !== "booting" && settingStep !== "settingReady";
      break
    }
    case "readyToPlaying": {
      condition = settingStep === "ready" || settingStep === "playing";
      break
    }
    case "playing": {
      condition = settingStep === "playing";
      break
    }
  }

  return condition;
  
};
