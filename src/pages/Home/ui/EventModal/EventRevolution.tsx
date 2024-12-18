import { AnimatePresence, motion } from "framer-motion";
import React, { useMemo } from "react";
import styles from "../../styles/ModalStyles.module.scss";
import {
  useHumanStore,
  useHumanStoreAction,
} from "../../../../store/humanStore";
import { useShallow } from "zustand/react/shallow";
import { runHumanActionTrigger } from "../../../../features/playing";

const EventRevolution = ({
  isGRevol
}: {
  isGRevol: boolean;
}) => {
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

  const { actionTrigger } = useHumanStore(
    useShallow((state) => ({
      actionTrigger: state.actionTrigger,
    }))
  );

  const { setHumanActionTrigger } = useHumanStoreAction();

  return (
    <AnimatePresence>
      <motion.div
        key={"eRevol"}
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
          <h1 className={styles.title}>
            {isGRevol ? "대혁명" : "혁명"}
          </h1>
          <p>
            {isGRevol 
            ? "대혁명! 달무티와 총리대신의 손에 농기구가 쥐어 집니다."
            : "혁명이 일어났습니다! 갈등 속에 세금은 징수되지 않았습니다."}
          </p>
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
    </AnimatePresence>
  );
};

export default EventRevolution;
