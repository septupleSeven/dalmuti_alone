import React, { useEffect, useRef } from "react";
import Player from "./ui/Player";
import styles from "./styles/HomeStyles.module.scss";
import Container from "../../shared/Container";
import { useGameStore } from "../../store/store";
import Pile from "./ui/Pile";
import Hand from "./ui/Hand";

function App() {
  const {
    players,
    pile,
    settingStatus,
    view,
    setDealCard,
    setSortPlayer,
    initDeck,
    getHuman
  } = useGameStore();
  view();

  const { settingStep } = settingStatus;

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
      <div className={styles.gameTableContainer}>
        {settingStep !== "booting" &&
          players.map((player, idx) => {
            return (
              <Player
                key={player.id}
                playerInfo={player}
                componentIdx={idx + 1}
              />
            );
          })}
        {(settingStep === "ready" 
        || settingStep === "playing" )
        && (
          <>
            <div className={styles.gameTableCenterContents}>
              <Pile pile={pile}/>
            </div>
            <Hand human={getHuman()}/>
          </>
        )}
      </div>
    </Container>
  );
}

export default App;
