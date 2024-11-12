import React, { useMemo, useState } from "react";
import { PlayerTypes } from "../../../features/types/featuresTypes";
import { AnimatePresence, motion } from "framer-motion";
import { CARD_NAME_TABLE, HUMAN_ID, PLAYER_NUM } from "../../../config/contants";
import styles from "../styles/HomeStyles.module.scss";
import { calcCoordinate } from "../../../features/utils";
import { useGameStore, useGameStoreAction } from "../../../store/gameStore";
import { useShallow } from "zustand/react/shallow";
import { setLogData } from "../../../features/setting";
import { useLogStoreAction } from "../../../store/logStore";

const Player = ({
  playerInfo,
  componentIdx,
}: {
  playerInfo: PlayerTypes;
  componentIdx: number;
}) => {
  
  const { settingStep, settingStepCondition } = useGameStore(
    useShallow(
      (state) => ({
        settingStep: state.settingStatus.settingStep,
        settingStepCondition: state.settingStatus.settingStepCondition,
    }))
  );
  const { setSettingStep, setDealCard } = useGameStoreAction();

  const { setLog } = useLogStoreAction();

  const { order, name, className, hand, id } = playerInfo;
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
        ease: "easeOut",
      }}
      onAnimationComplete={async () => {
        if (settingStep === "setting" && lastCompCondition) {
          setSettingStep("dealForOrder");
          setLog(setLogData("계급을 정하고 있습니다."))
        }
        if (
          settingStep === "rearrange" &&
          settingStepCondition !== "rearrange"
        ) {
          setSettingStep("rearrange", "condition");
          setSettingStep("readyToPlay");
          setDealCard("game");
        }
      }}
    >
      <motion.p layout className={styles.playerClassName}>
        {className}
        {id === HUMAN_ID ? "(당신)" : ""}
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
              if (
                settingStep === "dealForOrder" &&
                lastCompCondition &&
                isOrderCard
              ) {
                setIsOrderCard(false);
                await new Promise((resolve) => setTimeout(resolve, 2000));
                setLog(setLogData("계급대로 순서를 재배치 합니다."))
                setSettingStep("rearrange");
              }
            }}
            exit={{
              y: 20,
              opacity: 0,
            }}
          >
            {CARD_NAME_TABLE[hand[0].rank].name}
            {`(${hand[0].rank})`}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
};

export default Player;
