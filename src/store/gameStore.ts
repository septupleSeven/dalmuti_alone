import { create } from "zustand";
import { useGameStoreTypes } from "./types/storeTypes";
import {
  createDeck,
  dealDeck,
  setLogData,
  setOrder,
  setPlayer,
  shuffleDeck,
  sortPlayer,
} from "../features/setting";
import {
  HUMAN_ID,
  MAXIMUM_CARDRANK,
  PLAYER_NAME_TABLE,
  PLAYER_NUM,
} from "../config/contants";
import {
  isRevolution,
  layDownCard,
  performTaxCollect,
  playerLayDownCard,
  setWinner,
} from "../features/playing";
import { useShallow } from "zustand/react/shallow";
import { useHumanStore } from "./humanStore";
import { useLogStore } from "./logStore";
import { findPlayerWithId, setDelay } from "../features/utils";
import { immer } from "zustand/middleware/immer";

export const useGameStore = create<useGameStoreTypes>()(
  immer((set, get) => ({
    players: setPlayer(PLAYER_NUM),
    deck: createDeck(MAXIMUM_CARDRANK),
    pile: [],
    // settingStatus: {
    //   settingStep: "booting",
    //   settingStepCondition: "booting",
    // },
    gameStatus: {
      gameStep: "collectingTax",
      currentTurn: 0,
      latestPlayer: "",
      resultRank: [],
    },
    actions: {
      view: () => console.log(get()),
      // setSettingStep: (value, type = "step") =>
      //   set((state) => {
      //     const keyVal =
      //       type === "step" ? "settingStep" : "settingStepCondition";
      //     state.settingStatus[keyVal] = value;
      //   }),
      setGameStep: (value) =>
        set((state) => {
          state.gameStatus.gameStep = value;
        }),
      setShuffleDeck: () =>
        set((state) => {
          shuffleDeck(state.deck);
        }),
      setDealCard: (type) =>
        set((state) => {
          dealDeck(state.deck, state.players, type);

          if (type === "game") {
            state.players.forEach((player) => {
              player.hand.sort((a, b) => a.value - b.value);
              player.className = `${
                PLAYER_NAME_TABLE[`ORDER${player.order}`].name
              }`;
            });
          }
        }),
      setInitializeDeck: (action) =>
        set((state) => {
          state.players.forEach((player) => {
            player.hand = [];
          });
          state.deck = createDeck(MAXIMUM_CARDRANK);
          if (action === "shuffle") shuffleDeck(state.deck);
        }),
      setSortPlayer: (type) =>
        set((state) => {
          sortPlayer(state.deck, state.players, type);
        }),
      setDeck: (deck) =>
        set((state) => {
          state.deck = deck;
        }),
      setPile: (pile) =>
        set((state) => {
          state.pile = pile;
        }),
      setTurn: (value) =>
        set((state) => {
          state.gameStatus.currentTurn = value;
        }),
      setGameOrder: (type) =>
        set((state) => {
          state.players = setOrder(state.players, type);
        }),
      setFirstInAction: () =>
        set((state) => {
          const fitstPlayer = state.players.find(
            (player) => player.order === 0
          );
          if (fitstPlayer) fitstPlayer.status.gameState = "inAction";
        }),
      setPlayers: (players) =>
        set((state) => {
          state.players = players;
        }),
      setResultRank: (players) =>
        set((state) => {
          state.gameStatus.resultRank = players;
        }),
      setLatestPlayer: (value) =>
        set((state) => {
          state.gameStatus.latestPlayer = value;
        }),
      runTaxCollect: async () => {
        const { deck, players, gameStatus, actions } = get();
        const getLogStore = useLogStore.getState();
        const isRevolutionVal = isRevolution(players);

        await performTaxCollect(
          deck,
          players,
          gameStatus.gameStep,
          actions,
          get,
          getLogStore.actions.setLog,
          isRevolutionVal
        );
      },

      runGame: async () => {
        const { setGameStep, setPile } = get().actions;
        const { setLog } = useLogStore.getState().actions;

        while (true) {
          const { players } = get();

          const getCurrentPlayer = players.find(
            (player) => player.status.gameState === "inAction"
          );

          // console.log(
          //   "%cNow Turn is =>",
          //   "background: #a7a8d9; color: #111",
          //   getCurrentPlayer?.name
          // );
          setLog(
            setLogData(
              `${getCurrentPlayer?.className}(${getCurrentPlayer?.name})의 차례`
            )
          );

          await setDelay(1000);

          if (getCurrentPlayer!.status.isLeader) {
            // console.log(
            //   "%cRound Ended Winner is => ",
            //   "background: #bada55; color: #111",
            //   getCurrentPlayer
            // );
            setLog(
              setLogData(`라운드 종료. 이번 라운드 승자는 ${getCurrentPlayer?.className}(${getCurrentPlayer?.name})입니다. 
                다음 라운드는 이 플레이어 기준 시계방향으로 시작됩니다. 상단 '다음 라운드 시작' 버튼을 눌러서 계속 진행할 수 있습니다.`)
            );
            setGameStep("roundEnd");
            return;
          }

          if (getCurrentPlayer && getCurrentPlayer.id === HUMAN_ID) {
            await new Promise<void>((resolve) => {
              useHumanStore.getState().actions.setHumanActionTrigger(resolve);
            });
            const getHumanStore = useHumanStore.getState();
            playerLayDownCard(get(), getHumanStore, get, setLog);
          } else {
            layDownCard(get(), get, setLog);
          }

          await setDelay(2200);

          let isGameContinue:boolean = true;

          const currentState = get();
          const currentLatestPlayer = currentState.players.find(
            (player) => player.id === currentState.gameStatus.latestPlayer
          );

          if (
            // currentLatestPlayer &&
            // !currentLatestPlayer.hand.length
            currentLatestPlayer && currentLatestPlayer.hand.length < 6
          ) {
            // console.log(
            //   "%cGame Set winner is=> ",
            //   "background: #820e0e; color: #111",
            //   playerChk.name
            // );
            setLog(
              setLogData(`${currentLatestPlayer.className}(${currentLatestPlayer.name})은 더이상 수중에 패가 없습니다. 
                ${currentLatestPlayer.className}은 게임의 승리자 입니다! 이후 순번에서 제외됩니다. 진행을 위해 카드 더미가 초기화 됩니다.`)
            );

            setWinner(
              currentState.players,
              currentLatestPlayer,
              currentState.gameStatus,
              currentState.actions
            );

            setPile([]);

            isGameContinue = false;
          }

          if (!isGameContinue) {
            alert("게임 종료");
            const updatedState = get();

            // setWinner(
            //   updatedState.players,
            //   updatedState.players[0],
            //   updatedState.gameStatus,
            //   updatedState.actions
            // );

            setWinner(
              updatedState.players,
              updatedState.gameStatus.resultRank[0],
              updatedState.gameStatus,
              updatedState.actions
            );

            setGameStep("GAMEOVER");
            return;
          }

        }
      },

      settleRound: async () => {
        const { players, actions } = get();

        const { runGame, setGameStep, setGameOrder, setPile } = actions;

        const getLogStoreAction = useLogStore.getState().actions;
        const { setLog } = getLogStoreAction;

        if (players.length > 1) {
          setGameOrder("game");
          setPile([]);

          set((state) => {
            state.gameStatus.currentTurn = 0;
          });
        }

        setGameStep("inPlaying");

        setLog(setLogData(`다음 라운드가 시작됩니다.`));

        await setDelay(2000);

        runGame();
      },

      setLeader: (playerId, isNotFirstTurn = false) =>
        set((state) => {
          const currentPlayer = findPlayerWithId(state.players, playerId)!;

          if (isNotFirstTurn) {
            const currentLeaderPlayer = state.players.find(
              (player) => player.status.isLeader === true
            );

            if (currentLeaderPlayer) {
              currentLeaderPlayer.status.isLeader = false;
            }
          }

          currentPlayer.status.isLeader = true;
        }),
      setPushPile: (cards) =>
        set((state) => {
          state.pile.push(cards);
        }),
      setPlayerState: (playerId, gameState) =>
        set((state) => {
          const currentPlayer = findPlayerWithId(state.players, playerId)!;
          currentPlayer.status.gameState = gameState;
        }),
      setPlayerHand: (playerId, hand) =>
        set((state) => {
          const currentPlayer = findPlayerWithId(state.players, playerId)!;
          currentPlayer.hand = hand;
        }),
      setLayDownCard: (playerId, selectedCards, drawNum) =>
        set((state) => {
          const pile = state.pile;
          const currentPlayer = findPlayerWithId(state.players, playerId)!;
          const hand = currentPlayer.hand;
          const toSendCards = [];

          for (let i = 0; i < drawNum; i++) {
            toSendCards.push({ ...selectedCards[i] });
            const targetCardIdx = hand.findIndex(
              (card) => card.id === selectedCards[i].id
            );
            hand.splice(targetCardIdx, 1);
          }

          pile.push(toSendCards);
        }),
    },
  }))
);

export const useGameStoreAction = () =>
  useGameStore(useShallow((state) => state.actions));
