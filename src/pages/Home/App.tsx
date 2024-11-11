import React, { useEffect, useRef } from "react";
import Player from "./ui/Player";
import styles from "./styles/HomeStyles.module.scss";
import Container from "../../shared/Container";
import { useGameStore } from "../../store/store";
import Pile from "./ui/Pile";
import Hand from "./ui/Hand";
import { isStepCondition } from "../../features/utils";
import Log from "./ui/Log";

function App() {
  const {
    players,
    pile,
    settingStatus,
    view,
    setDealCard,
    setSortPlayer,
    initDeck,
    getHuman,
  } = useGameStore();
  view();

  const { settingStep } = settingStatus;
  const gameTableRef = useRef(null)

  useEffect(() => {
    if (settingStep === "dealForOrder") {
      setDealCard("setting");
    }
    if (settingStep === "rearrange") {
      setSortPlayer("setting");
      initDeck("shuffle");
    }
  }, [settingStep, setDealCard, setSortPlayer, initDeck]);

  return (
    <Container>
      <div className={styles.gameTableContainer} ref={gameTableRef}>
        {isStepCondition(settingStep, "bootingToSettingReady") &&
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
        <Hand human={getHuman()} />
      )}
      {isStepCondition(settingStep, "bootingToSettingReady") && (
        <Log />
      )}
    </Container>
  );
}

export default App;
