import { QuestionCategory, type Question } from './types'

export const findTense: Question[] = [
  {
    question: 'Je suis allé au parc',
    answer: 'le passé composé',
  },
  {
    question: "J'avais un chat quand j'étais jeune",
    answer: "l'imparfait",
  },
  {
    question: 'Je ne serai pas là pour le rendez-vous',
    answer: 'le futur simple',
  },
  {
    question: "J'ai visité la Tour Eiffel hier",
    answer: 'le passé composé',
  },
  {
    question: 'Nous avons fini nos devoirs hier soir',
    answer: 'le passé composé',
  },
].map(question => ({
  ...question,
  category: QuestionCategory.FindTense,
}))

export const conjugate: Question[] = [
  {
    question: 'Je _____ (manger, passé composé) une pomme',
    answer: 'ai mangé',
  },
  {
    question: 'Tu _____ (perdre, passé composé) ton portefeuille hier matin',
    answer: 'as perdu',
  },
  {
    question: 'Il _____ (pleuvoir, passé composé) toute la journée hier',
    answer: 'a plu',
  },
  {
    question: 'Elle _____ (acheter, passé composé) des fleurs pour sa mère',
    answer: 'a acheté',
  },
].map(question => ({
  ...question,
  category: QuestionCategory.Conjugate,
}))

const cdOrCI: Question[] = [
  {
    question: "La pomme que j'ai mangée était délicieuse",
    answer: 'CD',
  },
  {
    question: "L'endroit où je suis allé était magnifique",
    answer: 'CI',
  },
].map(question => ({
  ...question,
  category: QuestionCategory.CDOrCI,
}))

const questions: Question[] = [...findTense, ...conjugate, ...cdOrCI]

export default questions
