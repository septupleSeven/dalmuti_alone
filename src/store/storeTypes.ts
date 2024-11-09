import { CardTypes, PlayerTypes } from "../features/settingTypes";

export type settingStepTypes =
  | "booting"
  | "setting"
  | "dealForOrder"
  | "rearrange"
  | "ready"
  | "playing";

 export type gameStepTypes =
  | "collectingTax"
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
  settingStatus: {
    settingStep: settingStepTypes;
    settingStepCondition: settingStepTypes;
  };
  gameStatus: {
    gameStep: gameStepTypes;
    gameStepCondition: gameStepTypes;
    currentTurn: number;
  };
  view: () => void;
  setSettingStep: (value: settingStepTypes) => void;
  setSettingStepCondition: (value: settingStepTypes) => void;
  setShuffleDeck: () => void;
  setDealCard: (value: gameSettingTypes) => void;
  initDeck: (action?: gameActionTypes) => void;
  setSortPlayer: (type: sortPlayersTypes) => void;
  getHuman: () => PlayerTypes;
  setTurn: (
    nextTurn: number,
    nextPlayers: PlayerTypes[],
  ) => void;
  setTaxCollect: () => Promise<void>;
  playGame: () => Promise<void>;
};
