import React, { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "../styles/HomeStyles.module.scss";
import { PileTypes, PlayerTypes } from "../../../features/types/featuresTypes";
import Card from "./Card";
import { useGameStore } from "../../../store/store";
import { calcCoordinate } from "../../../features/utils";
import { PLAYER_NUM } from "../../../config/contants";
import { GameStatusTypes } from "../../../store/types/storeTypes";

const Pile = ({ pile }: { pile: PileTypes }) => {
  const { players, gameStatus } = useGameStore();
  // const [currentPlayerOrder, setcurrentPlayerOrder] = useState(getCurrentLeaderOrder());

  const getCurrentLeaderOrder = (
    players:PlayerTypes[], 
    gameStatus:GameStatusTypes
  ) => {
    const currentLeader = players.find(player => player.status.isLeader);

    if(currentLeader?.id === gameStatus.latestPlayer) {
      return currentLeader.order
    }else{
      return 0
    }
  }

  const calcPileCount = (pile: PileTypes) => {
    const sumPileLength = pile.reduce((acc, cur) => (acc + cur.length), 0)
    return sumPileLength;
  };

  const pileCardMotionVariant = useMemo(
    () => {

      return {
        init: {
          opacity: 0,
          x: calcCoordinate(getCurrentLeaderOrder(players, gameStatus), PLAYER_NUM).x,
          y: calcCoordinate(getCurrentLeaderOrder(players, gameStatus), PLAYER_NUM).y,
        },
        getCenter: {
          opacity: 1,
          x: 0,
          y: 0,
        },
      }
    },
    [players, gameStatus]
  );

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
        {pile.length && pile.map((cards) => {
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
