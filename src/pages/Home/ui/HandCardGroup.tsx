import React from "react";
import { HandGroupTypes } from "../types/HomeTypes";
import Card from "./Card";
import styles from "../styles/HomeStyles.module.scss";
import { useGameStore } from "../../../store/gameStore";
import { useShallow } from "zustand/react/shallow";
import { useHandDispenserStoreAction } from "../../../store/handStore";
import { useHumanStoreAction } from "../../../store/humanStore";
import { motion } from "framer-motion";

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

  const { cards } = group;

  return (
    <motion.div
      layout
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
      <p className={styles.cardRank}>
        <span>등급 :</span> &nbsp; {cards[0].value}
      </p>
      <Card cardVal={cards[0].value} size={"hand"} />
      <p className={styles.cardAmount}>
        <span>보유 :</span> &nbsp; {cards.length}
      </p>
    </motion.div>
  );
};

export default HandCardGroup;
