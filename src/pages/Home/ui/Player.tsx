import React, { useEffect, useMemo, useState } from "react";
import { PlayerTypes } from "../../../features/settingTypes";
import { AnimatePresence, motion } from "framer-motion";
import { PLAYER_NUM } from "../../../config/contants";
import { useGameStore } from "../../../store/store";
import styles from "../styles/HomeStyles.module.scss";

const Player = ({
  playerInfo,
  componentIdx,
}: {
  playerInfo: PlayerTypes;
  componentIdx: number;
}) => {
  const { gameStep, setGameStep } = useGameStore();
  const { order, name, hand } = playerInfo;
  const [isOrderCard, setIsOrderCard] = useState(true);
  const lastCompCondition = componentIdx === PLAYER_NUM;

  const calcCoordinate = (value: number, length: number) => {
    const getRadians = (value / length) * (Math.PI * 2) - Math.PI;
    const x = -Math.sin(getRadians) * 300;
    const y = Math.cos(getRadians) * 300;

    return { x, y };
  };

  const pContainerMotionVariant = useMemo(
    () => ({
      init: {
        x: 0,
        y: 0,
      },
      getPosition: {
        x: calcCoordinate(order, PLAYER_NUM).x,
        y: calcCoordinate(order, PLAYER_NUM).y,
      },
    }),
    [order]
  );

  return (
    <motion.div
      variants={pContainerMotionVariant}
      initial="init"
      animate="getPosition"
      className={styles.playerContainer}
      transition={{
        duration: 0.8,
      }}
      onAnimationComplete={() => {
        if (gameStep === "setting" && lastCompCondition) {
          setGameStep("dealForOrder");
        }
        if (gameStep === "rearrange") {
          setGameStep("ready");
        }
      }}
    >
      <motion.div className={styles.playerNode}>{name}</motion.div>
      <AnimatePresence>
        {gameStep === "dealForOrder" && hand.length ? (
          <motion.p
            key={`ORDERCARD-${componentIdx}`}
            initial={{
              y: 20,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            transition={{
              duration: 0.4,
              delay: order / 8,
            }}
            onAnimationComplete={async () => {
              if (gameStep === "dealForOrder" && lastCompCondition && isOrderCard) {
                setIsOrderCard(false);
                await new Promise((resolve) => setTimeout(resolve, 1000));
                setGameStep("rearrange");
              }
            }}
            exit={{
              y: 20,
              opacity: 0,
            }}
          >
            {hand[0].rank}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
};

export default Player;
