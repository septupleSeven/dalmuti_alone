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

const EventRound = ({
  isGameEnd
}: {
   isGameEnd: boolean;
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

      const { players } = useGameStore(
        useShallow((state) => ({
            players: state.players,
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
    <AnimatePresence>
      <motion.div
        key={"eRound"}
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
            {isGameEnd ? "게임 종료" : "라운드 종료"}
          </h1>
          
            {isGameEnd 
            ? (<p>플레이어 중 카드패를 비운 플레이어가 등장했습니다.</p>)
            : (<p>아무도&nbsp;
                <span>{currentLeader?.className}&#40;{currentLeader?.id}&#41;</span>
                의 카드에 대응하지 못했습니다. 이번 라운드의 승자는&nbsp;
                <span>{currentLeader?.className}&#40;{currentLeader?.id}&#41;</span>입니다.<br />
                다음 라운드의 순서는 이 플레이어를 기준으로 시계 방향으로 진행됩니다.
                </p>)}
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

export default EventRound;
