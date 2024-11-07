import { CardTypes, PlayerTypes } from "../features/settingTypes";

export type gameStepTypes = "booting" | "setting" | "dealForOrder" | "rearrange" | "ready";
export type gameSettingTypes = "game" | "setting";

export type useGameStoreTypes = {
  players: Array<PlayerTypes>;
  deck: Array<CardTypes>;
  gameStep: gameStepTypes;
  view: () => void;
  setGameStep: (value: gameStepTypes) => void;
  setShuffleDeck: () => void;
  setDealCard: (value: gameSettingTypes) => void;
  initDeck: (shuffle?: boolean) => void
  setSortPlayer: (type: gameSettingTypes) => void;
};