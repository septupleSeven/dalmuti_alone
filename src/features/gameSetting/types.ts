export type Card = {
  rank: string;
  value: number;
};

export type Player = {
  playerId: string;
  hand: Card[];
  order: number;
};
