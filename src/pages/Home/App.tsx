import React, { useEffect } from "react";
import Player from "./ui/Player";
import styles from "./styles/HomeStyles.module.scss";
import Container from "../../shared/Container";
import { useGameStore } from "../../store/store";
import { AnimatePresence } from "framer-motion";
import Deck from "./ui/Deck";
import Pile from "./ui/Pile";

function App() {
  const {
    players,
    deck,
    gameStep,
    view,
    setDealCard,
    setSortPlayer,
    initDeck,
  } = useGameStore();
  view();

  useEffect(() => {
    if (gameStep === "dealForOrder") {
      setDealCard("setting");
    }
    if (gameStep === "rearrange") {
      setSortPlayer("setting");
      initDeck(true);
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
        {gameStep === "ready" && 
          (<div className={styles.gameTableCenterContents}>
            <Deck deck={deck}/>
            <Pile />
          </div>)
        }
      </div>
    </Container>
  );
}

export default App;
