import React, { useMemo, useState } from "react";
import { PlayerTypes } from "../../../features/types/featuresTypes";
import { AnimatePresence, motion } from "framer-motion";
import { CARD_NAME_TABLE, PLAYER_NUM } from "../../../config/contants";
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
  const { settingStatus, setSettingStep, setDealCard } = useGameStore();
  const { settingStep, settingStepCondition } = settingStatus;

  const { order, name, className, hand } = playerInfo;
  const [isOrderCard, setIsOrderCard] = useState(true);
  const lastCompCondition = componentIdx === PLAYER_NUM;

  const pContainerMotionVariant = useMemo(
    () => ({
      init: {
        opacity: 0,
        x: 0,
        y: 0,
      },
      getPosition: {
        opacity: 1,
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
        duration: 1.2,
        delay: order / 20,
        ease: "easeOut"
      }}
      onAnimationComplete={async () => {
        if (settingStep === "setting" && lastCompCondition) {
          setSettingStep("dealForOrder");
        }
        if (settingStep === "rearrange" && settingStepCondition !== "rearrange") {
          setSettingStep("rearrange", "condition");
          setSettingStep("ready");
          setDealCard("game");
        }
      }}
    >
      <motion.p layout className={styles.playerClassName}>
        {className}
        {name === "YOU" ? "(당신)" : ""}
      </motion.p>
      <motion.div className={styles.playerNode}>
        {/* {CARD_NAME_TABLE[hand[0].rank] && 
        <figure>
          <img src="" alt="" />
        </figure>
        } */}
      </motion.div>
      <AnimatePresence>
        {settingStep === "dealForOrder" && hand.length ? (
          <motion.p
            className={styles.playerOrderCard}
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
                await new Promise((resolve) => setTimeout(resolve, 2000));
                setSettingStep("rearrange");
              }
            }}
            exit={{
              y: 20,
              opacity: 0,
            }}
          >
           {CARD_NAME_TABLE[hand[0].rank].name}{`(${hand[0].rank})`}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
};

export default Player;
