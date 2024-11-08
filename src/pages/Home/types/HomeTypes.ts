import { CardTypes } from "../../../features/settingTypes"

export type HandGroupTypes = {
    rank: string,
    cards: Omit<CardTypes, "rank">[]
}