import React, { useEffect, useState } from "react";
import styles from "./styles/GlobalStyles.module.scss";
import {
  AnimatePresence,
  motion,
  useAnimationControls,
} from "framer-motion";
import { isStepCondition } from "../features/utils";
import { useGameStore, useGameStoreAction } from "../store/gameStore";
import { useShallow } from 'zustand/react/shallow'

const Nav = () => {

  const {
    settingStep,
    gameStep,
    players,
    deck,
    actions
  } = useGameStore(useShallow(state => ({
    players: state.players,
    deck: state.deck,
    settingStep: state.settingStatus.settingStep,
    gameStep: state.gameStatus.gameStep,
    actions: state.actions
  })));

  const { 
    setShuffleDeck, 
    setSettingStep,
    setGameOrder,
    settleRound,
    runTaxCollect,
  } = useGameStoreAction();


  const [firstInitGame, setFirstInitGame] = useState(false);
  const headerMotionControls = useAnimationControls();

  const headerMotionVariants = {
    headerInit: {
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
    },
    headerAnimate: {
      height: 80,
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      transition: {
        delay: isStepCondition(settingStep, "bootingToReadyToSetting") ? 0 : 0.4,
        duration: isStepCondition(settingStep, "bootingToReadyToSetting")
          ? 0.4
          : 1.6,
        ease: "circOut",
      },
    },
    headerHover: {
      height: 120,
      transition: {
        delay: 0,
        duration: 0.4,
      },
    },
  };

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


  // 여기 고민중이였음 사유) players 변경 마다 useEffect 발생 우려
  useEffect(() => {
    if (settingStep === "playing") {
      runTaxCollect();
    }
  }, [ settingStep ]);

  return (
    <motion.header
      variants={headerMotionVariants}
      initial="headerInit"
      animate={headerMotionControls}
      className={styles.headerNode}
      whileHover={
        isStepCondition(settingStep, "bootingToReadyToSetting")
          ? "headerHover"
          : {}
      }
      onHoverEnd={() => {
        if (isStepCondition(settingStep, "bootingToReadyToSetting")) {
          headerMotionControls.start("headerAnimate");
        }
      }}
    >
      <AnimatePresence>
        {settingStep === "booting" && (
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
              <ul className={styles.headerMenuContainer}>
                <li>
                  <motion.button
                    variants={bootingScreenVariants}
                    initial="menuInit"
                    animate="menuAnimate"
                    exit="menuExit"
                    onClick={async () => {
                      if (!firstInitGame) {
                        headerMotionControls.start("headerAnimate");
                        setSettingStep("readyToSetting");

                        await new Promise((resolve) =>
                          setTimeout(() => {
                            setShuffleDeck();
                            setSettingStep("setting");
                            return resolve;
                          }, 2000)
                        );
                      }
                      setFirstInitGame(true);
                    }}
                  >
                    시작하기
                  </motion.button>
                </li>
              </ul>
            </div>
            <div className={styles.headerAnchorContainer}>
              <motion.a
                variants={bootingScreenVariants}
                initial="menuInit"
                animate="menuAnimate"
                exit="menuExit"
                className={styles.guideAnchor}
                href="https://youtu.be/sO-vxnoL31A?si=K1YYEMjvOBoduqmM"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="게임 설명 보기"
              >
                게임 설명 보기
              </motion.a>
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
                  setGameOrder("setting");
                  setSettingStep("playing");
                }
              }}
              disabled={isStepCondition(settingStep, "playing") ? true : false}
            >
              게임시작
            </motion.button>
            <motion.button
              className={styles.btn}
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
          </div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Nav;
