import React, { useEffect, useState } from "react";
import styles from "./styles/GlobalStyles.module.scss";
import { motion, useAnimationControls } from "framer-motion";
import { useGameStore } from "../store/store";

const Nav = () => {
  const {
    settingStatus,
    setShuffleDeck,
    setTaxCollect,
    setSettingStep
  } = useGameStore();

  const { settingStep } = settingStatus;

  const [firstInitGame, setFirstInitGame] = useState(false);
  const headerMotionControls = useAnimationControls();

  const headerMotionVariants = {
    init: {
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    started: {
      height: 50,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
    },
  };

  useEffect(() => {
    if (settingStep === "playing") {
      setTaxCollect();
    }
  }, [settingStep, setTaxCollect])
  

  return (
    <motion.header
      variants={headerMotionVariants}
      initial="init"
      animate={headerMotionControls}
      className={styles.headerNode}
    >
      <button
        onClick={() => {
          if (!firstInitGame) {
            headerMotionControls.start("started");
            setShuffleDeck();
            setSettingStep("setting");
          }
          setFirstInitGame(true);
        }}
      >
        play
      </button>
      <button
        onClick={() => {
          if (settingStep === "ready") {
            setSettingStep("playing");
          }
        }}
      >
        realPlay
      </button>
    </motion.header>
  );
};

export default Nav;
