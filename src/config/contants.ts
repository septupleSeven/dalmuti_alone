export const PLAYER_NUM = 5;
export const MAXIMUM_CARDRANK = 11;
export const PLAYER_NAME_TABLE:Record<string, string> = {
    "ORDER0": "달무티",
    "ORDER1": "총리대신",
    "ORDER2": "상인",
    "ORDER3": "소작농",
    "ORDER4": "농노",
}
export const CARD_NAME_TABLE:Record<string, {src: string; name: string}> = {
    "RANK1": {
        src: "",
        name: "달무티"
    },
    "RANK2": {
        src: "",
        name: "대주고"
    },
    "RANK3": {
        src: "",
        name: "시종장"
    },
    "RANK4": {
        src: "",
        name: "남작부인"
    },
    "RANK5": {
        src: "",
        name: "수녀원장"
    },
    "RANK6": {
        src: "",
        name: "기사"
    },
    "RANK7": {
        src: "",
        name: "재봉사"
    },
    "RANK8": {
        src: "",
        name: "석공"
    },
    "RANK9": {
        src: "",
        name: "요리사"
    },
    "RANK10": {
        src: "",
        name: "광부"
    },
    "RANK11": {
        src: "",
        name: "농노"
    },
    "JOKER": {
        src: "",
        name: "조커"
    },
}