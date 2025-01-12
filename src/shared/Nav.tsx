import React, { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./styles/GlobalStyles.module.scss";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { findPlayerWithId, isStepCondition } from "../features/utils";
import { useGameStore, useGameStoreAction } from "../store/gameStore";
import { useShallow } from "zustand/react/shallow";
import { useLogStoreAction } from "../store/logStore";
import { setLogData } from "../features/setting";
import { HUMAN_ID } from "../config/contants";
import { useSettingStore, useSettingStoreAction } from "../store/settingStore";
import ModeSelector from "./ui/ModeSelector";
import { useModalStoreAction } from "../store/modalStore";

const Nav = () => {
  const { gameStep, players } = useGameStore(
    useShallow((state) => ({
      players: state.players,
      deck: state.deck,
      gameStep: state.gameStatus.gameStep,
      actions: state.actions,
    }))
  );
  const { setShuffleDeck, setGameOrder, settleRound, runTaxCollect } =
    useGameStoreAction();

  const { settingStep } = useSettingStore(
    useShallow((state) => ({
      settingStep: state.settingStatus.settingStep,
      settingStepCondition: state.settingStatus.settingStepCondition,
    }))
  );
  const { setSettingStep } = useSettingStoreAction();

  const { setLog } = useLogStoreAction();

  const { setModalShow } = useModalStoreAction();

  const [startBtnCliked, setStartBtnCliked] = useState(true);
  const [firstInitGame, setFirstInitGame] = useState(false);
  const headerMotionControls = useAnimationControls();
  const [headerHeight, setHeaderHeight] = useState(80);
  const [isHeiRes, setIsHeiRes] = useState(false);

  const isBootingToReadyToSetting = useMemo(
    () => isStepCondition(settingStep, "bootingToReadyToSetting"),
    [settingStep]
  );

  const modeChk = useCallback(async () => {
    if (!firstInitGame) {
      headerMotionControls.start("headerAnimate");
      setSettingStep("readyToSetting");

      await new Promise((resolve) =>
        setTimeout(() => {
          setShuffleDeck();
          setSettingStep("setting");
          setLog(setLogData("플레이어와 덱을 구성합니다."));
          return resolve;
        }, 2000)
      );
    }
    setFirstInitGame(true);
  }, [
    firstInitGame,
    headerMotionControls,
    setShuffleDeck,
    setSettingStep,
    setLog,
  ]);

  const headerMotionVariants = useMemo(
    () => ({
      headerInit: {
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
      },
      headerAnimate: {
        height: headerHeight,
        backgroundColor: isHeiRes ? "rgba(0, 0, 0, 0)" : "rgba(0, 0, 0, 0.4)",
        transition: {
          delay: isBootingToReadyToSetting ? 0 : 0.4,
          duration: isBootingToReadyToSetting ? 0.4 : 1.6,
          ease: "circOut",
        },
      },
    }),
    [headerHeight, isBootingToReadyToSetting, isHeiRes]
  );

  const bootingScreenVariants = {
    titleInit: {
      opacity: 0,
      y: -40,
    },
    titleAnimate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "circOut",
      },
    },
    titleExit: {
      opacity: 0,
      y: -40,
    },
    menuInit: {
      opacity: 0,
    },
    menuAnimate: {
      opacity: 1,
      transition: {
        delay: 0.4,
        duration: 1,
      },
    },
    menuExit: {
      opacity: 0,
    },
  };

  const navBtnVariants = {
    navBtnInit: {
      opacity: 0,
    },
    navBtnAnimate: {
      opacity: 1,
    },
    navBtnExit: {
      opacity: 0,
    },
  };

  useEffect(() => {
    if (
      settingStep === "playing" &&
      gameStep !== "GAMEOVER" &&
      gameStep !== "roundEnd" &&
      gameStep !== "resetGame"
    ) {
      runTaxCollect();
    }

    if (gameStep === "resetGame") {
      headerMotionControls.start("headerInit");
    }

    const handleResize = () => {
      if (window.innerWidth <= 540) {
        setHeaderHeight(65);
      }

      if (window.innerHeight <= 540) {
        setHeaderHeight(65);
        setIsHeiRes(true);
      } else {
        setIsHeiRes(false);
      }
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [settingStep, gameStep, headerMotionControls, runTaxCollect]);

  return (
    <motion.header
      variants={headerMotionVariants}
      initial="headerInit"
      animate={headerMotionControls}
      className={styles.headerNode}
    >
      <AnimatePresence>
        {(settingStep === "booting" || settingStep === "selectMode") && (
          <>
            <div className={styles.headerTitleContainer}>
              <motion.h1
                variants={bootingScreenVariants}
                className={styles.title}
                initial="titleInit"
                animate="titleAnimate"
                exit="titleExit"
              >
                나홀로 달무티
              </motion.h1>
              {startBtnCliked && (
                <ul className={styles.headerMenuContainer}>
                  <li>
                    <motion.button
                      variants={bootingScreenVariants}
                      initial="menuInit"
                      animate="menuAnimate"
                      exit="menuExit"
                      onClick={() => {
                        setSettingStep("selectMode");
                        setStartBtnCliked(false);
                      }}
                      tabIndex={1}
                    >
                      시작하기
                    </motion.button>
                  </li>
                </ul>
              )}
              {!startBtnCliked && <ModeSelector modeChk={modeChk} />}
            </div>
            <div className={styles.headerAnchorContainer}>
              <motion.button
                variants={bootingScreenVariants}
                initial="menuInit"
                animate="menuAnimate"
                exit="menuExit"
                className={styles.guideAnchor}
                onClick={() => {
                  setModalShow(true);
                }}
                tabIndex={0}
              >
                게임 설명 보기
              </motion.button>
            </div>
          </>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isStepCondition(settingStep, "bootingToReadyToSetting") && (
          <div className={styles.headerNavBtnWrap}>
            <motion.button
              className={styles.btn}
              variants={navBtnVariants}
              initial="navBtnInit"
              animate="navBtnAnimate"
              exit="navBtnExit"
              onClick={() => {
                if (settingStep === "readyToPlay") {
                  const human = findPlayerWithId(players, HUMAN_ID);
                  setLog(setLogData("게임 시작!"));
                  setLog(setLogData(`당신은 ${human?.className} 입니다.`));
                  setGameOrder("setting");
                  setSettingStep("playing");
                }
              }}
              disabled={isStepCondition(settingStep, "playing") ? true : false}
            >
              게임시작
            </motion.button>
            <motion.button
              className={
                gameStep === "roundEnd"
                  ? `${styles.btn} ${styles.active}`
                  : styles.btn
              }
              variants={navBtnVariants}
              initial="navBtnInit"
              animate="navBtnAnimate"
              exit="navBtnExit"
              disabled={gameStep === "roundEnd" ? false : true}
              onClick={() => {
                if (gameStep === "roundEnd") {
                  setGameOrder("setting");
                  settleRound();
                }
              }}
            >
              다음 라운드 시작
            </motion.button>
            <motion.button
              className={styles.tipBtn}
              variants={navBtnVariants}
              initial="navBtnInit"
              animate="navBtnAnimate"
              exit="navBtnExit"
              onClick={() => {
                setModalShow(true);
              }}
            >
              ?
            </motion.button>
          </div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Nav;
