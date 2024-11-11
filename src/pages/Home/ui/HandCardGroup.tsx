import React, { useRef } from "react";
import { HandGroupTypes } from "../types/HomeTypes";
import Card from "./Card";
import styles from "../styles/HomeStyles.module.scss";
import { useHumanStore, useHandDispenserStore, useGameStore } from "../../../store/store";

const HandCardGroup = ({
  group,
  selected,
  onSelect
}: {
  group: HandGroupTypes;
  selected: boolean;
  onSelect: (val:number) => void;
}) => {
  const { setDispenserOpen } = useHandDispenserStore();

  const { view, setCardStatus } = useHumanStore();
  const { gameStatus } = useGameStore();

  const { rank, cards } = group;
  // view();

  return (
    <div
      className={`${styles.cardContainer} ${selected ? styles.active : ""}`}
      onClick={() => {
        if(gameStatus.gameStep === "inPlaying"){
          onSelect(group.cards[0].value);
          setCardStatus(group);
          setDispenserOpen();
        }
        // view();
      }}
    >
      <p>{rank}</p>
      <Card cardVal={cards[0].value} />
      <p>{cards.length}</p>
    </div>
  );
};

export default HandCardGroup;
