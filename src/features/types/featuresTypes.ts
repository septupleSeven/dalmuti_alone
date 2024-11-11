export type CardTypes = {
  id: string;
  rank: string;
  value: number;
};

export type PileTypes = Array<CardTypes>[];

export type PlayerTypes = {
  id: string;
  name: string;
  className: string;
  hand: CardTypes[];
  order: number;
  status: {
    gameState: "waiting" | "setting" | "inAction" | "turnEnd" | "win";
    isLeader: boolean;
    roundOrder: number;
  };
};

export type LayDownCardType =
  | {
      result: "layDown";
      copiedPile: CardTypes[][];
      nextTurn: number;
      nextPlayers: PlayerTypes[];
      latestPlayer: string;
    }
  | {
      result: "pass";
      nextTurn: number;
      nextPlayers: PlayerTypes[];
      latestPlayer: string;
    }
  | {
      result: "roundEnd";
      latestPlayer: string;
    };
