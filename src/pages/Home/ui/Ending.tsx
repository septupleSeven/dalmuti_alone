import React from "react";
import styles from "../styles/HomeStyles.module.scss";
import { useGameStore } from "../../../store/gameStore";
import { useShallow } from "zustand/react/shallow";
import { ENDING_TEXT } from "../../../config/contants";
import { motion } from "framer-motion";

const Ending = () => {
  const { resultRank } = useGameStore(
    useShallow((state) => ({
      resultRank: state.gameStatus.resultRank,
    }))
  );
  
  return (
    <motion.div 
    initial={{
      y: "100%",
    }}
    animate={{
      y: 0,
      transition: {
        duration: 2
      }
    }}
    className={styles.endingContainer}
    >
      <div className={styles.endingTitleWrap}>
        <h1>게임 종료</h1>
        <p>결과는 아래와 같습니다.</p>
      </div>
      <div className={styles.endingContents}>
        <ul>
          {resultRank.map((player, idx) => (
              <li key={`${player.id}-END`}>
                <figure>
                  <img
                    src={require(`../../../assets/img/players/order${player.order}.jpg`)}
                    alt=""
                  />
                </figure>
                <div className={styles.nameWrap}>
                  <p className={styles.order}>
                    {/* {idx + 1}. {player.name} */}
                    {player.name}
                  </p>
                  <p className={styles.name}>{ENDING_TEXT[`ORDER${idx}`]}</p>
                </div>
              </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

export default Ending;
