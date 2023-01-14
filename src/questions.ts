import { QuestionCategory, type Question } from './types'

const findTense: Question[] = [
  { question: 'Je suis allé au parc', answer: 'le passé composé' },
  { question: "J'avais un chat quand j'étais jeune", answer: "l'imparfait" },
].map(question => ({
  ...question,
  category: QuestionCategory.FindTense,
}))

const questions: Question[] = [...findTense]

export default questions
