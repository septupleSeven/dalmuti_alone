import React, { useCallback, useRef, useState } from "react";
import {
  setPlayer,
  createDeck,
  shuffleDeck,
  dealDeck,
  sortPlayer,
  setDelay,
} from "../../features/gameSetting/setting";
import "./styles.scss";
import { Card, Player } from "../../features/gameSetting/types";
import { AnimatePresence, motion } from "framer-motion";

const playerNum = 5;
const maxRank = 11;

const Home = () => {
  // const players = setPlayer(playerNum);
  // const initialDeck = createDeck(maxRank);
  // const shuffledInitialDeck = shuffleDeck(initialDeck);
  // dealDeck(shuffledInitialDeck, players, "setting");
  // sortPlayer(shuffledInitialDeck, players, "setting");

  const [step, setStep] = useState<string>("SET GAME");
  const [deck, setDeck] = useState<Card[]>([...createDeck(maxRank)]);
  const [players, setPlayers] = useState<Player[]>([]);

  const btnRef = useRef<HTMLButtonElement>(null);

  const btnProc = useCallback(
    async (step: string) => {
      btnRef.current!.disabled = true;

      setStep("Setting Players");
      await setDelay(1000);
      setPlayers(() => [...setPlayer(playerNum)]);

      setStep("Shuffle Deck");
      await setDelay(1000);
      setDeck((prevState) => [...shuffleDeck(prevState)]);

      setStep("Deal Card");
      await setDelay(1000);
      setPlayers((prevState) => [...dealDeck(deck, prevState, "setting")]);
    },
    [deck]
  );

  return (
    <>
      <main>
        <button
          ref={btnRef}
          className="start_btn"
          // onClick={() => setPlayers([...setPlayer(playerNum)])}
          onClick={() => btnProc(step)}
        >
          {/* {step} */}
          SET GAME
        </button>

        <div
          // className={HomeStyles.container}
          className="container"
        >
          {step !== "SET GAME" && <div className="status">{step}...</div>}
          {players.map((player, idx) => (
            <div
              // className={HomeStyles.player}
              key={player.playerId}
            >
              <motion.div
                className="player"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {player.playerId}
              </motion.div>
              {player.hand && (
                  <ul>
                    <AnimatePresence>
                    {player.hand.map((hand: Card, listIdx) => (
                      <motion.li
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: (idx + 1) * 0.2 
                        }}
                        key={listIdx}
                        onAnimationComplete={async () => {
                          if(idx === (players.length - 1)){
                            setStep("Sort Player");
                            await setDelay(1000);
                            setPlayers(prevState => [...sortPlayer(deck, prevState, "setting")]);
                          }
                        }}
                      >
                        {hand.rank}
                      </motion.li>
                    ))}
                    </AnimatePresence>
                  </ul>
              )}
            </div>
          ))}
        </div>
      </main>
    </>
  );
};

export default Home;
