export type CardTypes = {
  id: string;
  rank: string;
  value: number;
};

export type PlayerTypes = {
  id: string;
  name: string;
  hand: CardTypes[];
  order: number;
  status: {
    gameState: "waiting" | "setting" | "inAction" | "win";
    isLeader: boolean,
    // nextOrder: number
  };
};
