import React, { useEffect, useMemo } from "react";
import Player from "./ui/Player";
import styles from "./styles/HomeStyles.module.scss";
import Container from "../../shared/Container";
import Pile from "./ui/Pile";
import { findPlayerWithId, isStepCondition } from "../../features/utils";
import Log from "./ui/Log";
import { useGameStore, useGameStoreAction } from "../../store/gameStore";
import { useShallow } from "zustand/react/shallow";
import { HUMAN_ID } from "../../config/contants";
import Ending from "./ui/Ending";
import { useSettingStore } from "../../store/settingStore";
import EventModal from "./ui/EventModal";
import Hand from "./ui/Hand";
import { AnimatePresence } from "framer-motion";
import { useModalStore } from "../../store/modalStore";
import TipModal from "./ui/tipModal";
import Loading from "../../shared/ui/Loading";

function App() {
  const { players, pile, gameStep } = useGameStore(
    useShallow((state) => ({
      players: state.players,
      pile: state.pile,
      gameStep: state.gameStatus.gameStep,
    }))
  );
  const { view, setDealCard, setSortPlayer, setInitializeDeck } =
    useGameStoreAction();

  // view();

  const { settingStep } = useSettingStore(
    useShallow((state) => ({
      settingStep: state.settingStatus.settingStep,
      settingStepCondition: state.settingStatus.settingStepCondition,
    }))
  );

  const { eventModal, tipModalActive } = useModalStore(
    useShallow((state) => ({
      eventModal: state.eventModal,
      tipModalActive: state.tipModal.isActive,
    }))
  );

  const isBootingToReadyToSetting = useMemo(
    () => isStepCondition(settingStep, "bootingToReadyToSetting"),
    [settingStep]
  );

  const isReadyToPlaying = useMemo(
    () => isStepCondition(settingStep, "readyToPlaying"),
    [settingStep]
  );

  const humanPlayer = useMemo(
    () => findPlayerWithId(players, HUMAN_ID)!,
    [players]
  );

  useEffect(() => {
    if (settingStep === "dealForOrder") {
      setDealCard("setting");
    }
    if (settingStep === "rearrange") {
      setSortPlayer("setting");
      setInitializeDeck("shuffle");
    }
  }, [settingStep, setDealCard, setSortPlayer, setInitializeDeck]);

  return (
    <Container>
      <div className={styles.gameTableContainer}>
        {isBootingToReadyToSetting &&
          players.map((player, idx) => {
            return (
              <Player
                key={player.id}
                playerInfo={player}
                componentIdx={idx + 1}
              />
            );
          })}
        {isReadyToPlaying && (
          <div className={styles.gameTableCenterContents}>
            <Pile pile={pile} />
          </div>
        )}
      </div>
      {isReadyToPlaying && <Hand human={humanPlayer} />}
      {isBootingToReadyToSetting && <Log />}
      {(gameStep === "GAMEOVER" || gameStep === "resetGame") && <Ending />}
      <AnimatePresence>
        {isReadyToPlaying && eventModal ? (
          <EventModal key={"EVENTMODAL"} currentEvent={eventModal} />
        ) : null}
      </AnimatePresence>
      <AnimatePresence>{tipModalActive && <TipModal />}</AnimatePresence>
      <AnimatePresence>
        {gameStep === "resetGame" && <Loading key={"loadingComp"} />}
      </AnimatePresence>
    </Container>
  );
}

export default App;
