import React from "react";
import { HandGroupTypes } from "../types/HomeTypes";
import Card from "./Card";
import styles from "../styles/HomeStyles.module.scss";
import { useGameStore } from "../../../store/gameStore";
import { useShallow } from "zustand/react/shallow";
import { useHandDispenserStoreAction } from "../../../store/handStore";
import { useHumanStoreAction } from "../../../store/humanStore";

const HandCardGroup = ({
  group,
  selected,
  onSelect,
}: {
  group: HandGroupTypes;
  selected: boolean;
  onSelect: (val: number) => void;
}) => {
  const { setDispenserOpen } = useHandDispenserStoreAction();

  const { view, setCardStatus } = useHumanStoreAction();

  const { gameStep } = useGameStore(
    useShallow((state) => ({
      gameStep: state.gameStatus.gameStep,
    }))
  );

  const { rank, cards } = group;

  // view();

  return (
    <div
      className={`${styles.cardContainer} ${selected ? styles.active : ""}`}
      onClick={() => {
        if (gameStep === "inPlaying") {
          onSelect(group.cards[0].value);
          setCardStatus(group);
          setDispenserOpen();
        }
        view();
      }}
    >
      <p>{rank}</p>
      <Card cardVal={cards[0].value} />
      <p>{cards.length}</p>
    </div>
  );
};

export default HandCardGroup;
