import React, { useEffect, useRef } from "react";
import Player from "./ui/Player";
import styles from "./styles/HomeStyles.module.scss";
import Container from "../../shared/Container";
import Pile from "./ui/Pile";
import Hand from "./ui/Hand";
import { findPlayerWithId, isStepCondition } from "../../features/utils";
import Log from "./ui/Log";
import { useGameStore, useGameStoreAction } from "../../store/gameStore";
import { useShallow } from "zustand/react/shallow";
import { HUMAN_ID } from "../../config/contants";
import Ending from "./ui/Ending";

function App() {
  
  const {
    players,
    pile,
    settingStep,
    gameStep,
  } = useGameStore(useShallow(state => ({
    players: state.players,
    pile: state.pile,
    settingStep: state.settingStatus.settingStep,
    gameStep: state.gameStatus.gameStep
  })));
  const { view, setDealCard, setSortPlayer, setInitializeDeck } = useGameStoreAction();

  view();

  const gameTableRef = useRef(null);
  const humanPlayer = findPlayerWithId(players, HUMAN_ID)!;

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
      <div className={styles.gameTableContainer} ref={gameTableRef}>
        {isStepCondition(settingStep, "bootingToReadyToSetting") &&
          players.map((player, idx) => {
            return (
              <Player
                key={player.id}
                playerInfo={player}
                componentIdx={idx + 1}
              />
            );
          })}
        {isStepCondition(settingStep, "readyToPlaying") && (
          <div className={styles.gameTableCenterContents}>
            <Pile pile={pile} />
          </div>
        )}
      </div>
      {isStepCondition(settingStep, "readyToPlaying") && (
        <Hand human={humanPlayer} />
      )}
      {isStepCondition(settingStep, "bootingToReadyToSetting") && (
        <Log />
      )}
      {gameStep === "GAMEOVER" && <Ending />}
    </Container>
  );
}

export default App;
