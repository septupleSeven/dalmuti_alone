import React, { useMemo } from "react";
import styles from "../../styles/ModalStyles.module.scss";
import { motion } from "framer-motion";
import EventHumanTurn from "./EventHumanTurn";
import EventRevolution from "./EventRevolution";
import { EventModalTypes } from "../../../../store/types/storeTypes";
import EventRound from "./EventRound";

const EventModal = ({
  currentEvent,
}: {
  currentEvent: null | EventModalTypes;
}) => {
  const motionVariant = useMemo(
    () => ({
      init: {
        opacity: 0,
      },
      show: {
        opacity: 1,
      },
      exit: {
        opacity: 0,
      },
    }),
    []
  );

  const getEventModalContents = () => {
    switch (currentEvent) {
      case "humanTurn":
        return <EventHumanTurn />;
      case "gRevolution":
        return <EventRevolution isGRevol={true} />;
      case "revolution":
        return <EventRevolution isGRevol={false} />;
      case "roundEnd":
        return <EventRound isGameEnd={false} />;
      case "gameEnd":
        return <EventRound isGameEnd={true} />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      variants={motionVariant}
      initial="init"
      animate="show"
      exit="exit"
      className={styles.eventModal}
    >
      {getEventModalContents()}
    </motion.div>
  );
};

export default EventModal;
