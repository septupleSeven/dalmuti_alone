import { motion } from "framer-motion";
import styles from "../styles/GlobalStyles.module.scss";
import React from "react";

const Loading = () => {
  return (
    <motion.div
      initial={{
        y: "100%",
      }}
      animate={{
        y: 0,
        transition: {
          duration: 1.2,
          ease: "easeOut"
        },
      }}
      exit={{
        y: "100%",
        transition: {
          duration: 2,
          ease: "easeOut"
        },
      }}
      className={styles.loadingContainer}
    >
      <div className={styles.loadingWrap}>
        <div className={styles.loadingContents}></div>
        <p>Loading...</p>
      </div>
    </motion.div>
  );
};

export default Loading;
