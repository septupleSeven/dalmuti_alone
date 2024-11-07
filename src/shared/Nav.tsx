import React, { useState } from "react";
import styles from "./styles/GlobalStyles.module.scss";
import { motion, useAnimationControls } from "framer-motion";
import { useGameStore } from "../store/store";

const Nav = () => {
  const { setGameStep, setShuffleDeck } = useGameStore();

  const [firstInitGame, setFirstInitGame] = useState(false);
  const headerMotionControls = useAnimationControls();

  const headerMotionVariants = {
    init: {
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)"
    },
    started: {
      height: 50,
      backgroundColor: "rgba(0, 0, 0, 0.8)"
    },
  };

  return (
    <motion.header
      variants={headerMotionVariants}
      initial="init"
      animate={headerMotionControls}
      className={styles.headerNode}
    >
      <button onClick={() => {
        if(!firstInitGame) {
          headerMotionControls.start("started");
          setShuffleDeck();
          setGameStep("setting");
        };
        setFirstInitGame(true);
      }}>play</button>
    </motion.header>
  );
};

export default Nav;
