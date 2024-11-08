import { CardTypes, PlayerTypes } from "../features/settingTypes";

export type gameStepTypes =
  | "booting"
  | "setting"
  | "dealForOrder"
  | "rearrange"
  | "ready"
  | "playing";
export type gameSettingTypes = "game" | "setting";
export type gameActionTypes = "shuffle" | "deal";
export type sortPlayersTypes = "game" | "setting" | "gRevolution";

export type useGameStoreTypes = {
  players: Array<PlayerTypes>;
  deck: Array<CardTypes>;
  gameStep: gameStepTypes;
  gameStepCondition: gameStepTypes;
  currentTurn: number;
  view: () => void;
  setGameStep: (value: gameStepTypes) => void;
  setgameStepCondition: (value: gameStepTypes) => void;
  setShuffleDeck: () => void;
  setDealCard: (value: gameSettingTypes) => void;
  initDeck: (action?: gameActionTypes) => void;
  setSortPlayer: (type: sortPlayersTypes) => void;
  getHuman: () => PlayerTypes;
  setTurn: (
    nextTurn: number,
    nextPlayers: PlayerTypes[],
  ) => void;
  playGame: () => Promise<void>;
};
