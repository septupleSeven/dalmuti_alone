import React from 'react';
import { motion } from "framer-motion";
import styles from "../styles/HomeStyles.module.scss";

const Pile = () => {
  return (
    <motion.div
      className={styles.pileNode}
      initial={{
        y: 20,
        opacity: 0,
      }}
      animate={{
        y: 0,
        opacity: 1,
      }}
    >
        Pile
    </motion.div>
  )
}

export default Pile