import { AnimatePresence, motion } from "framer-motion";
import React, { useMemo } from "react";
import styles from "../../styles/ModalStyles.module.scss";
import {
  useHumanStore,
  useHumanStoreAction,
} from "../../../../store/humanStore";
import { useShallow } from "zustand/react/shallow";
import { runHumanActionTrigger } from "../../../../features/playing";
import { useGameStore } from "../../../../store/gameStore";
import { getCurrentLeader } from "../../../../features/utils";
import { CARD_NAME_TABLE } from "../../../../config/contants";
const EventHumanTurn = () => {
  const motionVariant = useMemo(
    () => ({
      init: {
        clipPath: "polygon(0% 0, 0 0, 0 100%, 0% 100%)",
      },
      slide: {
        clipPath: "polygon(100% 0, 0 0, 0 100%, 100% 100%)",
      },
      exit: {
        clipPath: "polygon(0% 0, 0 0, 0 100%, 0% 100%)",
      },
    }),
    []
  );

    const { players, pile } = useGameStore(
      useShallow((state) => ({
        players: state.players,
        pile: state.pile,
      }))
    );

  const { actionTrigger } = useHumanStore(
    useShallow((state) => ({
      actionTrigger: state.actionTrigger,
    }))
  );

  const currentLeader = getCurrentLeader(players);

  const { setHumanActionTrigger } = useHumanStoreAction();

  return (
    <motion.div
      key={"eHumanTurn"}
      variants={motionVariant}
      initial="init"
      animate="slide"
      exit="exit"
      className={styles.eventModalContainer}
      transition={{
        duration: 1,
      }}
    >
      <div className={styles.titleWrap}>
        <h1 className={styles.title}>당신 차례</h1>
        {pile.length ? (
          <p>최근 카드를 제출한&nbsp;
            <span>{currentLeader?.className}
            &#40;{currentLeader?.id}&#41;</span>이&#40;가&#41; 카드&nbsp;
            <span>{CARD_NAME_TABLE[pile[pile.length - 1][0].rank] ? CARD_NAME_TABLE[pile[pile.length - 1][0].rank].name : "광대"}
            &#40;{pile[pile.length - 1][0].rank}&#41;</span>를&nbsp;
            <span>{pile[pile.length - 1].length}</span>장 제출했습니다.
          </p>
        ) : (
          <p>당신은 첫 순서입니다. 카드를 제출해주세요.</p>
        )}
      </div>

      <div className={styles.info}>
        <button
          onClick={() => {
            runHumanActionTrigger(actionTrigger, setHumanActionTrigger);
          }}
        >
          계속하기
        </button>
      </div>
    </motion.div>
  );
};

export default EventHumanTurn;
