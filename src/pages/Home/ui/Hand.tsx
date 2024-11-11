import React, { useState } from "react";
import styles from "../styles/HomeStyles.module.scss";
import { motion, useCycle } from "framer-motion";
import { CardTypes, PlayerTypes } from "../../../features/types/featuresTypes";
import { HandGroupTypes } from "../types/HomeTypes";
import HandCardGroup from "./HandCardGroup";
import HandCardDispenser from "./HandCardDispenser";
import { useHandDispenserStore } from "../../../store/store";

const Hand = ({ human }: { human: PlayerTypes }) => {
  const [isOpen, toggleOpen] = useCycle(false, true);
  const { hand } = human;

  const {
    isDispenserOpen
  } = useHandDispenserStore();

  const [isSelected, setIsSelected] = useState<number>(0);

  const getRankGroup = (hand: CardTypes[]) => {
    return Object.values(
      hand.reduce((acc: Record<string, HandGroupTypes>, cur) => {
        if (!acc[cur.rank]) {
          acc[cur.rank] = {
            rank: cur.rank,
            cards: [],
          };
        }

        acc[cur.rank].cards.push({
          id: cur.id,
          value: cur.value,
        });

        return acc;
      }, {})
    );
  };

  // const [cardGroup, setCardGroup] = useState<HandGroupTypes[]>(
  //   getRankGroup(hand)
  // );

  // console.log(human);

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
          {getRankGroup(hand).map((el) => (
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
