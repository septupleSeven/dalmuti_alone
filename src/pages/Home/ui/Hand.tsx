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
  const [isOpen, toggleOpen] = useCycle(false, true);

  const { isDispenserOpen } = useHandDispenserStore(
    useShallow((state) => ({
      isDispenserOpen: state.isDispenserOpen,
    }))
  );

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
        </div>
        {isDispenserOpen && (
          <HandCardDispenser onSelect={(val: number) => setIsSelected(val)} />
        )}
      </motion.div>
    </div>
  );
};

export default Hand;
