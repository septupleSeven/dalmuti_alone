import React, { useEffect, useMemo, useState } from "react";
import { PlayerTypes } from "../../../features/types/featuresTypes";
import { AnimatePresence, motion } from "framer-motion";
import {
  CARD_NAME_TABLE,
  HUMAN_ID,
  PLAYER_NUM,
} from "../../../config/contants";
import styles from "../styles/HomeStyles.module.scss";
import { calcCoordinate } from "../../../features/utils";
import { useGameStoreAction } from "../../../store/gameStore";
import { useShallow } from "zustand/react/shallow";
import { setLogData } from "../../../features/setting";
import { useLogStoreAction } from "../../../store/logStore";
import {
  useSettingStore,
  useSettingStoreAction,
} from "../../../store/settingStore";
import LazyImage from "../../../shared/ui/LazyImage";
import playerPlaceholder from "../../../assets/img/players/player_placeholder.jpg";

const Player = ({
  playerInfo,
  componentIdx,
}: {
  playerInfo: PlayerTypes;
  componentIdx: number;
}) => {
  const [radius, setRadius] = useState(320);
  const [isRes, setIsRes] = useState<boolean>(false);
  const [resVals, setResVals] = useState<{
    x?: number;
    y?: number;
  } | null>(null);
  const [resClassName, setResClassName] = useState("");

  const { settingStep, settingStepCondition } = useSettingStore(
    useShallow((state) => ({
      settingStep: state.settingStatus.settingStep,
      settingStepCondition: state.settingStatus.settingStepCondition,
    }))
  );
  const { setSettingStep } = useSettingStoreAction();

  const { setDealCard } = useGameStoreAction();

  const { setLog } = useLogStoreAction();

  const { order, className, hand, id, status } = playerInfo;
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
        x: calcCoordinate(
          order,
          PLAYER_NUM,
          radius,
          isRes,
          isRes ? resVals : null
        ).x,
        y: calcCoordinate(
          order,
          PLAYER_NUM,
          radius,
          isRes,
          isRes ? resVals : null
        ).y,
      },
      exit: {
        opacity: 0,
      },
    }),
    [order, radius, isRes, resVals]
  );

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > window.innerHeight) {
        if (window.innerHeight <= 768 && window.innerHeight > 540) {
          setRadius(window.innerHeight / 3);
          setIsRes(false);
        } else if (window.innerHeight <= 540) {
          const calcedHei =
            window.innerHeight <= 310 ? 310 : window.innerHeight;
          setRadius(calcedHei / 3.5);
          setIsRes(true);

          if (!order) {
            setResVals({
              x: 0,
              y: 0,
            });
            setResClassName("right");
          } else if (order && (order === 1 || order === 2)) {
            setResVals({
              x: 80,
              y: 0,
            });
            setResClassName("right");
          } else if (order && (order === 3 || order === 4)) {
            setResVals({
              x: -80,
              y: 0,
            });
            setResClassName("resHeiLeft");
            setResClassName("left");
          }
        } else {
          setRadius(320);
        }
      } else {
        if (window.innerWidth <= 768 && window.innerWidth > 540) {
          setRadius(window.innerWidth / 3);
        } else if (window.innerWidth <= 540) {
          setRadius(window.innerWidth / 2.5);
        } else {
          setRadius(320);
        }
      }
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [order]);

  return (
    <motion.div
      variants={pContainerMotionVariant}
      initial="init"
      animate="getPosition"
      exit="exit"
      className={`${styles.playerContainer} ${
        resClassName && resClassName === "right"
          ? styles.resHeiRight
          : styles.resHeiLeft
      }`}
      transition={{
        duration: 1.2,
        delay: order / 20,
        ease: "easeOut",
      }}
      onAnimationComplete={async () => {
        if (settingStep === "setting" && lastCompCondition) {
          setSettingStep("dealForOrder");
          setLog(setLogData("계급을 정하고 있습니다."));
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
      <motion.p
        layout
        className={styles.playerClassName}
        style={{
          color: status.gameState === "inAction" ? "#feda85" : "#fff",
        }}
      >
        {className}
        {id === HUMAN_ID ? "(당신)" : ""}
      </motion.p>
      <motion.div
        className={styles.playerNode}
        style={{
          border: `2px solid ${
            status.gameState === "inAction" ? "#feda85" : "#fff"
          }`,
          boxShadow:
            status.gameState === "inAction"
              ? "0px 0px 5px 5px rgba(254,218,133,0.45)"
              : "0px 0px 5px 5px rgba(254,218,133,0)",
        }}
      >
        <AnimatePresence>
          {settingStep === "playing" && (
            <motion.div
              initial={{
                clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
              }}
              animate={{
                clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
                transition: {
                  duration: 1.2,
                  ease: "easeInOut",
                },
              }}
            >
              {/* <img
                src={require(`../../../assets/img/players/order${playerInfo.order}.jpg`)}
                alt="Player"
              /> */}
              <LazyImage
                src={require(`../../../assets/img/players/order${playerInfo.order}.jpg`)}
                placeholder={playerPlaceholder}
                alt="Player"
              />
            </motion.div>
          )}
        </AnimatePresence>
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
                setLog(setLogData("계급대로 순서를 재배치 합니다."));
                setSettingStep("rearrange");
              }
            }}
            exit={{
              y: 20,
              opacity: 0,
            }}
          >
            {CARD_NAME_TABLE[hand[0].rank] &&
              CARD_NAME_TABLE[hand[0].rank].name}
            {`(${hand[0].rank})`}
          </motion.p>
        ) : null}
        {settingStep === "playing" && hand ? (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              duration: 0.4,
              delay: order / 8,
            }}
            className={styles.playerGameInfo}
          >
            <p
              className={styles.playerCardLength}
              key={`CARDLENGTH-${componentIdx}`}
            >
              남은 카드 : <span>{hand.length}</span>
            </p>
            <p
              className={styles.playerRoundOrder}
              key={`ROUNDORDER-${componentIdx}`}
            >
              현재 순서 : {playerInfo.status.roundOrder}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
};

export default Player;
