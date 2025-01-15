import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "../styles/HomeStyles.module.scss";
import { PileTypes } from "../../../features/types/featuresTypes";
import Card from "./Card";
import {
  calcCoordinate,
  calcPileCount,
  getCurrentLeaderOrder,
} from "../../../features/utils";
import { PLAYER_NUM } from "../../../config/contants";
import { useGameStore } from "../../../store/gameStore";
import { useShallow } from "zustand/react/shallow";

const Pile = ({ pile }: { pile: PileTypes }) => {
  const [radius, setRadius] = useState(320);
  const [isRes, setIsRes] = useState<boolean>(false);
  const [resVals, setResVals] = useState<{
    x?: number;
    y?: number;
  } | null>(null);

  const { players, latestPlayer } = useGameStore(
    useShallow((state) => ({
      players: state.players,
      latestPlayer: state.gameStatus.latestPlayer,
    }))
  );

  const pileCardMotionVariant = useMemo(() => {
    const xVal = getCurrentLeaderOrder(players, latestPlayer);
    const yVal = getCurrentLeaderOrder(players, latestPlayer);

    return {
      init: {
        opacity: 0,
        rotate: 180,
        scale: 0.2,
        x: calcCoordinate(
          xVal,
          PLAYER_NUM,
          radius,
          isRes,
          isRes ? resVals : null
        ).x,
        y: calcCoordinate(
          yVal,
          PLAYER_NUM,
          radius,
          isRes,
          isRes ? resVals : null
        ).y,
      },
      getCenter: {
        opacity: 1,
        rotate: 0,
        scale: 1,
        x: 0,
        y: 0,
      },
      exit: {
        opacity: 0,
        y: 30,
      },
    };
  }, [players, latestPlayer, radius, isRes, resVals]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > window.innerHeight) {
        if (window.innerHeight <= 768 && window.innerHeight > 540) {
          setRadius(window.innerHeight / 3);
          setIsRes(false);
        } else if (window.innerHeight <= 540) {
          setRadius(window.innerHeight / 3.5);
          const order = getCurrentLeaderOrder(players, latestPlayer);
          setIsRes(true);

          if (!order) {
            setResVals({
              x: 0,
              y: 0,
            });
          } else if (order && (order === 1 || order === 2)) {
            setResVals({
              x: 80,
              y: 0,
            });
          } else if (order && (order === 3 || order === 4)) {
            setResVals({
              x: -80,
              y: 0,
            });
          } else {
            setRadius(320);
          }
        }
      } else {
        if (window.innerWidth <= 768 && window.innerWidth > 540) {
          setRadius(window.innerWidth / 3);
        } else if (window.innerWidth <= 540) {
          setRadius(window.innerWidth / 2.5);
        } else {
          setRadius(320);
        }
      }
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [players, latestPlayer]);

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
      <p className={styles.pileCount}>
        <span>요구 수</span>
        {pile.length ? pile[0].length : 0}
      </p>
      <AnimatePresence>
        {pile.length &&
          pile.map((cards) => {
            return (
              <motion.div
                key={cards[0].id}
                variants={pileCardMotionVariant}
                initial="init"
                animate="getCenter"
                exit="exit"
                className={styles.pileCard}
                transition={{
                  duration: 1.2,
                }}
              >
                <div>
                  <Card cardVal={cards[0].value} size="pile" />
                </div>
              </motion.div>
            );
          })}
      </AnimatePresence>
      <p className={styles.pileAmount}>
        제출한
        <br className={styles.resBr} /> 카드 수 :{" "}
        <span>{calcPileCount(pile)}</span>
      </p>
    </motion.div>
  );
};

export default Pile;
