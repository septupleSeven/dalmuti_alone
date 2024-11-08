import React, { useEffect, useRef } from "react";
import Player from "./ui/Player";
import styles from "./styles/HomeStyles.module.scss";
import Container from "../../shared/Container";
import { useGameStore } from "../../store/store";
import Deck from "./ui/Deck";
import Pile from "./ui/Pile";
import Hand from "./ui/Hand";

function App() {
  const {
    players,
    deck,
    gameStep,
    view,
    setDealCard,
    setSortPlayer,
    initDeck,
    getHuman
  } = useGameStore();
  view();

  useEffect(() => {
    if (gameStep === "dealForOrder") {
      setDealCard("setting");
    }
    if (gameStep === "rearrange") {
      setSortPlayer("setting");
      initDeck("shuffle");
    }
  }, [gameStep, setDealCard, setSortPlayer, initDeck]);

  return (
    <Container>
      <div className={styles.gameTableContainer}>
        {gameStep !== "booting" &&
          players.map((player, idx) => {
            return (
              <Player
                key={player.id}
                playerInfo={player}
                componentIdx={idx + 1}
              />
            );
          })}
        {(gameStep === "ready" 
        || gameStep === "playing" )
        && (
          <>
            <div className={styles.gameTableCenterContents}>
              <Deck deck={deck} />
              <Pile />
            </div>
            <Hand human={getHuman()}/>
          </>
        )}
      </div>
    </Container>
  );
}

export default App;
