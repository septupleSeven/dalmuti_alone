import React, { useState } from "react";
import styles from "../styles/HomeStyles.module.scss";
import { motion, useCycle } from "framer-motion";
import { PlayerTypes } from "../../../features/types/featuresTypes";
import HandCardGroup from "./HandCardGroup";
import HandCardDispenser from "./HandCardDispenser";
import { getRankGroup } from "../../../features/utils";
import { useShallow } from "zustand/react/shallow";
import { useHandDispenserStore } from "../../../store/handStore";

const Hand = ({ human }: { human: PlayerTypes }) => {
  const [isOpen, toggleOpen] = useCycle(true, false);

  const { isDispenserOpen } = useHandDispenserStore(
    useShallow((state) => ({
      isDispenserOpen: state.isDispenserOpen,
    }))
  );

  const [isSelected, setIsSelected] = useState<number>(0);

  return (
    <motion.div
      className={styles.handNode}
      initial={{
        x: "100%",
      }}
      animate={{
        x: isOpen ? 0 : "100%",
      }}
    >
      <button className={styles.handBtn} onClick={() => toggleOpen()}>
        <motion.img
          src={require(`../../../assets/img/${
            isOpen ? "fists__icon" : "hands__icon"
          }.png`)}
          alt="Open Hand"
          initial={{
            filter: "brightness(0) invert(1)",
          }}
          whileHover={{
            filter: "brightness(1) invert(0)",
            rotate: isOpen ? 15 : -15,
            transition: {
              delay: 0,
              duration: 0.2,
            },
          }}
        />
      </button>
      <motion.div className={styles.handContainer}>
        <h1>당신의 패</h1>
        <motion.div className={styles.handWrapper}>
          {human &&
            human.hand &&
            getRankGroup(human.hand).map((el) => (
              <HandCardGroup
                key={`HANDCARDGROUP-${el.rank}`}
                group={el}
                selected={isSelected === el.cards[0].value ? true : false}
                onSelect={(val: number) => setIsSelected(val)}
              />
            ))}
        </motion.div>
        {isDispenserOpen && (
          <HandCardDispenser onSelect={(val: number) => setIsSelected(val)} />
        )}
      </motion.div>
    </motion.div>
  );
};

export default Hand;