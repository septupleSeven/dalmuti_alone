import React, { useEffect, useState } from "react";
import styles from "./styles/GlobalStyles.module.scss";
import { motion, useAnimationControls } from "framer-motion";
import { useGameStore } from "../store/store";

const Nav = () => {
  const {
    gameStep,
    setGameStep,
    setShuffleDeck,
    players,
    currentTurn,
    setTurn,
    playGame
  } = useGameStore();

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
    if (gameStep === "playing") {
        // runGame(
        //   players,
        //   currentTurn,
        //   setTurn,
        // );
        playGame();
    }
  }, [
    // currentTurn,
    gameStep,
    playGame
    // gameStep, players, currentTurn, setTurn
  ])
  

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
            setGameStep("setting");
          }
          setFirstInitGame(true);
        }}
      >
        play
      </button>
      <button
        onClick={() => {
          if (gameStep === "ready") {
            setGameStep("playing");
          }
        }}
      >
        realPlay
      </button>
    </motion.header>
  );
};

export default Nav;
