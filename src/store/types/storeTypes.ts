import { CardTypes, PlayerTypes } from "../../features/types/featuresTypes";

export type settingStepTypes =
  | "booting"
  | "setting"
  | "dealForOrder"
  | "rearrange"
  | "ready"
  | "playing";

 export type gameStepTypes =
  | "collectingTax"
  | "inPlaying"
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
  pile: Array<CardTypes>[];
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
  setGameStep: (value: gameStepTypes) => void;
  setGameStepCondition: (value: gameStepTypes) => void;
  setShuffleDeck: () => void;
  setDealCard: (value: gameSettingTypes) => void;
  initDeck: (action?: gameActionTypes) => void;
  setSortPlayer: (type: sortPlayersTypes) => void;
  setPile: (pile: Array<CardTypes>) => void;
  getHuman: () => PlayerTypes;
  setTurn: (
    nextTurn: number,
    nextPlayers: PlayerTypes[],
  ) => void;
  setTaxCollect: () => Promise<void> | null;
  setGameOrder: (type: gameSettingTypes) => void;
  playGame: () => Promise<void>;
};
