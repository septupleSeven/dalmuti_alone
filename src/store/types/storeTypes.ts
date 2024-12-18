import { CardTypes, PlayerGameStateTypes, PlayerTypes } from "../../features/types/featuresTypes";
import { HandGroupTypes } from "../../pages/Home/types/HomeTypes";

export type SettingStepTypes =
  | "booting"
  | "selectMode"
  | "readyToSetting"
  | "setting"
  | "dealForOrder"
  | "rearrange"
  | "readyToPlay"
  | "playing";

export type ModeTypes = "short" | "long" | "full";

export type GameStepTypes =
  | "collectingTax"
  | "inPlaying"
  | "roundEnd"
  | "GAMEOVER"

export type GameSettingTypes = "game" | "setting";
export type InitDeckTypes = "shuffle" | "deal";
export type SortPlayersTypes = "game" | "setting" | "gRevolution";

export type RoundStatusTypes = {
  log: Record<
    string,
    {
      roundResult: Array<PlayerTypes>;
      isFinal: boolean;
    }
  >;
  resultRank: [];
};

export type GameStatusTypes = {
  gameStep: GameStepTypes;
  currentTurn: number;
  latestPlayer: string;
  resultRank: Array<PlayerTypes>;
  // eventOccured: null | EventOccuredTypes
};

export type GameActionsTypes = {
  view: () => void;
  // setSettingStep: (
  //   value: SettingStepTypes,
  //   type?: "step" | "condition"
  // ) => void;
  setGameStep: (value: GameStepTypes) => void;
  setShuffleDeck: () => void;
  setDealCard: (value: GameSettingTypes) => void;
  setInitializeDeck: (action?: InitDeckTypes) => void;
  setSortPlayer: (type: SortPlayersTypes) => void;
  setPile: (pile: Array<CardTypes>[]) => void;
  setDeck: (deck: Array<CardTypes>) => void; // 현재 안쓰임
  setTurn: (value: number) => void;
  setGameOrder: (type: GameSettingTypes) => void;
  setFirstInAction: () => void;
  setLatestPlayer: (value: string) => void;
  setPlayers: (players: Array<PlayerTypes>) => void;
  setResultRank: (players: Array<PlayerTypes>) => void;
  runTaxCollect: () => Promise<void>;
  runGame: () => Promise<void>;
  settleRound: () => Promise<void>;
  setLeader: (
    playerId: string,
    isNotFirstTurn: boolean,
  ) => void;
  setPushPile: (card:CardTypes[]) => void;
  setPlayerState: (playerId:string, gameState:PlayerGameStateTypes) => void;
  setPlayerHand: (playerId:string, hand:CardTypes[]) => void;
  setLayDownCard: (playerId: string, selectedCards: CardTypes[], drawNum: number) => void;
  // setEventOccured: (currentEvent: null | EventOccuredTypes) => void;
  // handleEventChk: () => Promise<void>;
};

export type useGameStoreTypes = {
  players: Array<PlayerTypes>;
  deck: Array<CardTypes>;
  pile: Array<CardTypes>[];
  gameStatus: GameStatusTypes;
  actions: GameActionsTypes;
};

export type HumanCardStatusTypes = {
  rank: string;
  value: number;
  cards: CardTypes[];
  selected: number;
  jokerPicked: CardTypes[];
};

export type HumanLatestActionTypes = "passed" | "layDown" | "waiting";

export type HandDispenserActionsTypes = {
  view: () => void;
  setDispenserOpen: () => void;
  setDispenserClose: () => void;
};

export type useHandDispenserStoreTypes = {
  isDispenserOpen: boolean;
  actions: HandDispenserActionsTypes;
};

export type HumanActionsTypes = {
  view: () => void;
  setCardStatus: (cardGroup: HandGroupTypes, value?: string) => void;
  setCardStatusSelected: (value: string | number) => void;
  setCardStatusJokerPicked: (cardGroup: CardTypes[]) => void;
  setCardStatusJokerCombine: (value: number) => void;
  setLatestAction: (value: HumanLatestActionTypes) => void;
  setHumanActionTrigger: (value: (() => void) | null) => void;
};

export type useHumanStoreTypes = {
  cardStatus: HumanCardStatusTypes;
  latestAction: HumanLatestActionTypes;
  actions: HumanActionsTypes;
  actionTrigger: (() => void) | null;
};

export type LogTypes = {
  contents: string;
  time: string;
};

export type LogActionsTypes = {
  view: () => void;
  setLog: (logData:LogTypes) => void;
};

export type useLogStoreTypes = {
  log: LogTypes[];
  actions: LogActionsTypes;
};


export type SettingActionTypes = {
  view: () => void;
  setSettingStep: (
    value: SettingStepTypes,
    type?: "step" | "condition"
  ) => void;
  setMode: (value:ModeTypes) => void
}

export type useSettingStoreTypes = {
  settingStatus: {
    settingStep: SettingStepTypes;
    settingStepCondition: SettingStepTypes;
    mode: ModeTypes;
  };
  actions: SettingActionTypes;
}

export type EventModalTypes = "humanTurn" | "revolution" | "gRevolution" | "roundEnd" | "gameEnd";

export type ModalActionTypes = {
  setEventOccured: (currentEvent: null | EventModalTypes) => void;
  setModalShow: (isModalShow: boolean) => void;
  handleEventChk: () => Promise<void>;
}

export type useModalStoreTypes = {
  eventModal: null | EventModalTypes,
  tipModal: {
    isActive: boolean,
    page: number
  },
  actions: ModalActionTypes;
}