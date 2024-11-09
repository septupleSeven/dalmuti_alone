export type CardTypes = {
  id: string;
  rank: string;
  value: number;
};

export type PileTypes = Array<CardTypes>[];

export type PlayerTypes = {
  id: string;
  name: string;
  hand: CardTypes[];
  order: number;
  status: {
    gameState: "waiting" | "setting" | "inAction" | "turnEnd" | "win";
    isLeader: boolean;
    gameOrder: number;
  };
};

export type LayDownCardType = {
  nextTurn: number;
  nextPlayers: PlayerTypes[];
} & (
  | {
      result: "layDown";
      copiedPile: CardTypes[];
    }
  | {
      result: "pass";
    }
);