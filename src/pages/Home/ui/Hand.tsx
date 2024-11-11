import React, { useState } from "react";
import styles from "../styles/HomeStyles.module.scss";
import { motion, useCycle } from "framer-motion";
import { CardTypes, PlayerTypes } from "../../../features/types/featuresTypes";
import { HandGroupTypes } from "../types/HomeTypes";
import HandCardGroup from "./HandCardGroup";
import HandCardDispenser from "./HandCardDispenser";
import { useHandDispenserStore } from "../../../store/store";
import { getRankGroup } from "../../../features/utils";

const Hand = ({ human }: { human: PlayerTypes }) => {
  const [isOpen, toggleOpen] = useCycle(false, true);

  const {
    isDispenserOpen
  } = useHandDispenserStore();

  const [isSelected, setIsSelected] = useState<number>(0);

  return (
    <div className={styles.handNode}>
      <button className={styles.handBtn} onClick={() => toggleOpen()}>
        HandBtn
      </button>
      <motion.div
        className={styles.handContainer}
        initial={{
          width: 0,
        }}
        animate={{
          width: 300,
        }}
      >
        <div className={styles.handWrapper}>
          {human && human.hand && getRankGroup(human.hand).map((el) => (
            <HandCardGroup 
            key={`HANDCARDGROUP-${el.rank}`} 
            group={el} 
            selected={isSelected === el.cards[0].value ? true : false}
            onSelect={(val:number) => setIsSelected(val)}
            />
          ))}
        </div>
        {isDispenserOpen && <HandCardDispenser onSelect={(val:number) => setIsSelected(val)} />}
      </motion.div>
    </div>
  );
};

export default Hand;
