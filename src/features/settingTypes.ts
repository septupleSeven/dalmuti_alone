export type CardTypes = {
  id: string
  rank: string;
  value: number;
};

export type PlayerTypes = {
  id: string;
  name: string;
  hand: CardTypes[];
  order: number;
  state: "waiting" | "setting" | "inAction"
};
