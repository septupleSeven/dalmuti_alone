import React from "react";
import { CardTypes } from "../../../features/settingTypes";
import { motion } from "framer-motion";
import styles from "../styles/HomeStyles.module.scss";

const Deck = ({ deck }: { deck: Array<CardTypes> }) => {
  return (
    <motion.div
      className={styles.deckNode}
      initial={{
        y: 20,
        opacity: 0,
      }}
      animate={{
        y: 0,
        opacity: 1,
      }}
    >
      <div className={styles.deckNode}>{deck.length}</div>
    </motion.div>
  );
};

export default Deck;
