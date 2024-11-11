import { CardTypes, PileTypes, PlayerTypes } from "./types/featuresTypes";

export const randomNumBetween = (
  min: number,
  max: number,
  type: "decimal" | "integer" = "integer",
):number => {
  if (type === "decimal") {
    return Math.random() * (max - min) + min;
  }
  if (type === "integer") {
    return Math.floor(Math.random() * (max - min) + min);
  }
  return 1;
};

export const copyPlayer = (players: PlayerTypes[]) => {
    const copiedPlayers = players.map((player) => ({
      ...player,
      hand: [...player.hand],
      status: {...player.status}
    }));
    return copiedPlayers;
};

export const copyDeck = <T extends "deck" | "pile">(
    cards: T extends "deck" ? CardTypes[] : PileTypes, 
    type: "deck" | "pile" = "deck"
) => {
    let copiedDeck:any[] = [];

    if(type === "deck"){
        copiedDeck = cards.map((card) => ({...card}));
    }

    if(type === "pile"){
        copiedDeck = (cards as PileTypes).map((pile) => {
            const latestCards = pile.map((card) => ({
                ...card
            }));
            return [...latestCards];
        });
    }

    return copiedDeck;
};

export const calcCoordinate = (
  value: number, 
  length: number
) => {
  const getRadians = (value / length) * (Math.PI * 2) - Math.PI;
  const x = -Math.sin(getRadians) * 300;
  const y = Math.cos(getRadians) * 300;

  return { x, y };
};