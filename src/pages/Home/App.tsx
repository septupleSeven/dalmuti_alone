import React, { useEffect, useRef } from "react";
import Player from "./ui/Player";
import styles from "./styles/HomeStyles.module.scss";
import Container from "../../shared/Container";
import Pile from "./ui/Pile";
import Hand from "./ui/Hand";
import { getTargetPlayer, isStepCondition } from "../../features/utils";
import Log from "./ui/Log";
import { useGameStore, useGameStoreAction } from "../../store/gameStore";
import { useShallow } from "zustand/react/shallow";

function App() {
  
  const {
    players,
    pile,
    settingStep,
  } = useGameStore(useShallow(state => ({
    players: state.players,
    pile: state.pile,
    settingStep: state.settingStatus.settingStep,
  })));
  const { view, setDealCard, setSortPlayer, setInitializeDeck } = useGameStoreAction();

  view();

  const gameTableRef = useRef(null);
  const humanPlayer = getTargetPlayer(players, "Human")!;

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
    </Container>
  );
}

export default App;
