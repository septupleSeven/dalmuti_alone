import React, { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "../styles/HomeStyles.module.scss";
import { PileTypes } from "../../../features/types/featuresTypes";
import Card from "./Card";
import {
  calcCoordinate,
  calcPileCount,
  getCurrentLeaderOrder,
} from "../../../features/utils";
import { PLAYER_NUM } from "../../../config/contants";
import { useGameStore } from "../../../store/gameStore";
import { useShallow } from "zustand/react/shallow";

const Pile = ({ pile }: { pile: PileTypes }) => {
  const { players, latestPlayer } = useGameStore(
    useShallow((state) => ({
      players: state.players,
      latestPlayer: state.gameStatus.latestPlayer,
    }))
  );

  const pileCardMotionVariant = useMemo(() => {
    const xVal = getCurrentLeaderOrder(players, latestPlayer);
    const yVal = getCurrentLeaderOrder(players, latestPlayer);

    return {
      init: {
        opacity: 0,
        rotate: 180,
        scale: 0.2,
        x: calcCoordinate(xVal, PLAYER_NUM).x,
        y: calcCoordinate(yVal, PLAYER_NUM).y,
      },
      getCenter: {
        opacity: 1,
        rotate: 0,
        scale: 1,
        x: 0,
        y: 0,
      },
      exit: {
        opacity: 0,
        y: 30
      }
    };
  }, [players, latestPlayer]);

  return (
    <motion.div
      className={styles.pileNode}
      initial={{
        y: 20,
        opacity: 0,
      }}
      animate={{
        y: 0,
        opacity: 1,
      }}
    >
      <p className={styles.pileCount}>
        <span>요구 수</span>
        {pile.length ? pile[0].length : 0}
      </p>
      <AnimatePresence>
        {pile.length &&
          pile.map((cards) => {
            return (
              <motion.div
                key={cards[0].id}
                variants={pileCardMotionVariant}
                initial="init"
                animate="getCenter"
                exit="exit"
                className={styles.pileCard}
                transition={{
                  duration: 1.2,
                }}
              >
                <div>
                  <Card cardVal={cards[0].value} size="pile"/>
                </div>
              </motion.div>
            );
          })}
      </AnimatePresence>
      <p className={styles.pileAmount}>제출한 카드 수 : <span>{calcPileCount(pile)}</span></p>
    </motion.div>
  );
};

export default Pile;
