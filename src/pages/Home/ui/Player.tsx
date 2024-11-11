import React, { useMemo, useState } from "react";
import { PlayerTypes } from "../../../features/types/featuresTypes";
import { AnimatePresence, motion } from "framer-motion";
import { PLAYER_NUM } from "../../../config/contants";
import { useGameStore } from "../../../store/store";
import styles from "../styles/HomeStyles.module.scss";
import { calcCoordinate } from "../../../features/utils";

const Player = ({
  playerInfo,
  componentIdx,
}: {
  playerInfo: PlayerTypes;
  componentIdx: number;
}) => {
  const { settingStatus, setSettingStep, setSettingStepCondition, setDealCard } = useGameStore();
  const { settingStep, settingStepCondition } = settingStatus;

  const { order, name, hand } = playerInfo;
  const [isOrderCard, setIsOrderCard] = useState(true);
  const lastCompCondition = componentIdx === PLAYER_NUM;

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
        delay: order / 20,
      }}
      onAnimationComplete={async () => {
        if (settingStep === "setting" && lastCompCondition) {
          setSettingStep("dealForOrder");
        }
        if (settingStep === "rearrange" && settingStepCondition !== "rearrange") {
          setSettingStepCondition("rearrange");
          setSettingStep("ready");
          setDealCard("game");
        }
      }}
    >
      <motion.div className={styles.playerNode}>{name}</motion.div>
      <AnimatePresence>
        {settingStep === "dealForOrder" && hand.length ? (
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
              if (settingStep === "dealForOrder" && lastCompCondition && isOrderCard) {
                setIsOrderCard(false);
                await new Promise((resolve) => setTimeout(resolve, 1000));
                setSettingStep("rearrange");
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
