import { CardTypes, PlayerTypes } from "../../features/types/featuresTypes";
import { HandGroupTypes } from "../../pages/Home/types/HomeTypes";

export type SettingStepTypes =
  | "booting"
  | "setting"
  | "dealForOrder"
  | "rearrange"
  | "ready"
  | "playing";

export type GameStepTypes =
  | "collectingTax"
  | "inPlaying"
  | "roundEnd"
  | "rearrange"
  | "ready"
  | "playing";

export type GameSettingTypes = "game" | "setting";
export type GameActionTypes = "shuffle" | "deal";
export type SortPlayersTypes = "game" | "setting" | "gRevolution";

export type RoundStatusTypes = {
  log: Record<string, {
    roundResult: Array<PlayerTypes>;
    isFinal: boolean
  }>;
  resultRank: [];
}

export type GameStatusTypes = {
  gameStep: GameStepTypes;
  gameStepCondition: GameStepTypes;
  currentTurn: number;
  latestPlayer: string;
  // roundCount: number;
}

export type useGameStoreTypes = {
  players: Array<PlayerTypes>;
  deck: Array<CardTypes>;
  pile: Array<CardTypes>[];
  settingStatus: {
    settingStep: SettingStepTypes;
    settingStepCondition: SettingStepTypes;
  };
  gameStatus: GameStatusTypes;
  // roundStatus: RoundStatusTypes;
  view: () => void;
  setSettingStep: (value: SettingStepTypes) => void;
  setSettingStepCondition: (value: SettingStepTypes) => void;
  setGameStep: (value: GameStepTypes) => void;
  setGameStepCondition: (value: GameStepTypes) => void;
  setShuffleDeck: () => void;
  setDealCard: (value: GameSettingTypes) => void;
  initDeck: (action?: GameActionTypes) => void;
  setSortPlayer: (type: SortPlayersTypes) => void;
  setPile: (pile: Array<CardTypes>[]) => void;
  setDeck: (deck: Array<CardTypes>) => void;
  getHuman: () => PlayerTypes;
  getCurrentLeaderOrder: () => number;
  setTurn: (nextTurn: number, nextPlayers: PlayerTypes[]) => void;
  setTaxCollect: () => Promise<void> | null;
  setGameOrder: (type: GameSettingTypes) => void;
  setGameState: () => void;
  setLatestPlayer: (value:string) => void;




  playGame: () => Promise<void>;

  

  settleRound: () => Promise<void>;




  setRound: () => void;
  setRoundLog: () => void;

  // clearPile

};

export type HumanCardStatusTypes = {
  rank: string;
  value: number;
  cards: Omit<CardTypes, "rank">[];
  selected: 0;
};

export type HumanLatestActionTypes = "passed" | "layDown" | "waiting";

export type useHandDispenserStoreTypes = {
  isDispenserOpen: boolean;
  view: () => void;
  setDispenserOpen: () => void;
  setDispenserClose: () => void;
};

export type useHumanStoreTypes = {
  cardStatus: HumanCardStatusTypes;
  latestAction: HumanLatestActionTypes,
  view: () => void;
  setCardStatus: (
    cardGroup: HandGroupTypes,
    value?: string
  ) => void;
  setCardStatusSelected: (value:string) => void;
  setLatestAction: (value:HumanLatestActionTypes) => void;
  runHumanActionTrigger: () => void;
};
