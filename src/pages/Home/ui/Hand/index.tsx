import React, { useEffect, useState } from "react";
import styles from "../../styles/HomeStyles.module.scss";
import { motion, useCycle } from "framer-motion";
import { PlayerTypes } from "../../../../features/types/featuresTypes";
import HandCardGroup from "./HandCardGroup";
import HandCardDispenser from "./HandCardDispenser";
import { getRankGroup, isHumanTurn } from "../../../../features/utils";
import { useShallow } from "zustand/react/shallow";
import {
  useHandDispenserStore,
  useHandDispenserStoreAction,
} from "../../../../store/handStore";
import {
  useHumanStore,
  useHumanStoreAction,
} from "../../../../store/humanStore";
import { runHumanActionTrigger } from "../../../../features/playing";
import { useGameStore } from "../../../../store/gameStore";
import HandsIcon from "../../../../assets/img/hands__icon.png";
import FistsIcon from "../../../../assets/img/fists__icon.png";

const Hand = ({ human }: { human: PlayerTypes }) => {
  const [isOpen, toggleOpen] = useCycle(true, false);

  const { isDispenserOpen } = useHandDispenserStore(
    useShallow((state) => ({
      isDispenserOpen: state.isDispenserOpen,
    }))
  );

  const { setHumanActionTrigger, setLatestAction } = useHumanStoreAction();

  const { setDispenserClose } = useHandDispenserStoreAction();

  const { players, pile } = useGameStore(
    useShallow((state) => ({
      players: state.players,
      pile: state.pile,
    }))
  );

  const [isSelected, setIsSelected] = useState<number>(0);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768 && isOpen) {
        toggleOpen();
      }
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [toggleOpen]);

  return (
    <motion.div
      className={styles.handNode}
      initial={{
        x: "100%",
      }}
      animate={{
        x: isOpen ? 0 : "100%",
      }}
    >
      <button className={styles.handBtn} onClick={() => toggleOpen()}>
        <motion.img
          src={isOpen ? HandsIcon : FistsIcon}
          alt="Open Hand"
          initial={{
            filter: "brightness(0) invert(1)",
          }}
          whileHover={{
            filter: "brightness(1) invert(0)",
            rotate: isOpen ? 15 : -15,
            transition: {
              delay: 0,
              duration: 0.2,
            },
          }}
        />
      </button>
      <motion.div className={styles.handContainer}>
        <div className={styles.handTitleWrap}>
          <h1>당신의 패</h1>
          <button
            onClick={() => {
              if (pile.length) {
                setLatestAction("passed");
                runHumanActionTrigger(
                  useHumanStore.getState().actionTrigger,
                  setHumanActionTrigger
                );
                setIsSelected(0);
                setDispenserClose();
              }
            }}
            disabled={isHumanTurn(players) && pile.length ? false : true}
          >
            <img
              src={require("../../../../assets/img/turn__up.png")}
              alt="패스하기"
            />
            패스하기
          </button>
        </div>
        <div className={styles.handContentsContainer}>
          <div className={styles.handContentsWrapper}>
            {human &&
              human.hand &&
              getRankGroup(human.hand).map((el) => (
                <HandCardGroup
                  key={`HANDCARDGROUP-${el.rank}`}
                  group={el}
                  selected={isSelected === el.cards[0].value ? true : false}
                  onSelect={(val: number) => setIsSelected(val)}
                />
              ))}
          </div>
        </div>

        {isDispenserOpen && (
          <HandCardDispenser onSelect={(val: number) => setIsSelected(val)} />
        )}
      </motion.div>
    </motion.div>
  );
};

export default Hand;
