/** A player's state in the game */
export enum PlayerState {
  /** Playing as usual */
  Playing,
  /** Showdown required to re-enter game */
  Limbo,
  /** No longer playing */
  Eliminated,
}

/** The current state of the game. Used to manage the game card */
export enum GameState {
  /** Before the game has started */
  Pregame,
  /** The beginning of a new round */
  NewRound,
  /** Before the question has been revealed */
  PreQuestion,
  /** Question onscreen, player must answer */
  QuestionDisplayed,
  /** Answer is onscreen */
  AnswerDisplayed,
  /** The beginning of an elimination round */
  NewEliminationRound,
  /** The elimination question's category is revealed */
  EliminationCategoryDisplayed,
  /** Before an elimination question is revealed */
  PreEliminationQuestion,
  /** Elimination question is displayed, players may buzz in */
  EliminationQuestionDisplayed,
  /** A player buzzed in with an answer */
  EliminationPlayerAnswered,
  /** Elimination answer is onscreen */
  EliminationAnswerDisplayed,
  /** Both players failed to answer in time */
  EliminationRoundFailed,
  /** Game is done */
  GameOver,
  /** User is prompted to play again */
  PlayAgainPrompt,
}

export enum QuestionCategory {
  FindTense,
  Conjugate,
  CDOrCI,
}

/** A player in the game */
export interface Player {
  /** An incremental ID for the player */
  uid: number
  /** The player's display name */
  name: string
  /** Whether the player is invalid. Used during game setup */
  invalid: boolean
  state: PlayerState
}

export interface GenericQuestion {
  category: QuestionCategory
  question: string
  answer: string
}

export interface FindTenseQuestion extends GenericQuestion {
  category: QuestionCategory.FindTense
  answer: 'le passé composé' | "l'imparfait" | 'le futur simple'
}

export interface ConjugateQuestion extends GenericQuestion {
  category: QuestionCategory.Conjugate
}

export interface CDOrCIQuestion extends GenericQuestion {
  category: QuestionCategory.CDOrCI
  answer: 'CD' | 'CI'
}

export type Question = FindTenseQuestion | ConjugateQuestion | CDOrCIQuestion
