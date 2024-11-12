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
        x: calcCoordinate(xVal, PLAYER_NUM).x,
        y: calcCoordinate(yVal, PLAYER_NUM).y,
      },
      getCenter: {
        opacity: 1,
        x: 0,
        y: 0,
      },
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
      <p className={styles.pileCount}>{calcPileCount(pile)}</p>
      <AnimatePresence>
        {pile.length &&
          pile.map((cards) => {
            return (
              <motion.div
                key={cards[0].id}
                variants={pileCardMotionVariant}
                initial="init"
                animate="getCenter"
                className={styles.pileCard}
                transition={{
                  duration: 1.2,
                }}
              >
                <div>
                  <Card cardVal={cards[0].value} />
                  <p>{cards.length}</p>
                </div>
              </motion.div>
            );
          })}
      </AnimatePresence>
    </motion.div>
  );
};

export default Pile;
