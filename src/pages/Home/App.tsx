import React, { useEffect, useMemo } from "react";
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
import { useSettingStore, useSettingStoreAction } from "../../store/settingStore";

function App() {
  // const { players, pile, settingStep, gameStep } = useGameStore(
    // useShallow((state) => ({
      // players: state.players,
      // pile: state.pile,
      // settingStep: state.settingStatus.settingStep,
      // gameStep: state.gameStatus.gameStep,
    // }))
  // );
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

  const { settingStep } = useSettingStore(useShallow((state) => ({
    settingStep: state.settingStatus.settingStep,
    settingStepCondition: state.settingStatus.settingStepCondition
  })));

  const isBootingToReadyToSetting = useMemo(
    () => isStepCondition(settingStep, "bootingToReadyToSetting"),
    [settingStep]
  );
  
  const isReadyToPlaying = useMemo(
    () => isStepCondition(settingStep, "readyToPlaying"),
    [settingStep]
  );

  const humanPlayer = useMemo(() => findPlayerWithId(players, HUMAN_ID)!, [players]);

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
      <div className={styles.gameTableContainer} >
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
      {isReadyToPlaying && (
        <Hand human={humanPlayer} />
      )}
      {isBootingToReadyToSetting && <Log />}
      {gameStep === "GAMEOVER" && <Ending />}
    </Container>
  );
}

export default App;
