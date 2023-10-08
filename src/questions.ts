import {
  QuestionCategory,
  type Question,
  type CDOrCIQuestion,
  type FindTenseQuestion,
  type ConjugateQuestion,
} from './types'

export const findTense = (
  [
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
    {
      question: "Je visiterai la France l'été prochain",
      answer: 'le futur simple',
    },
    {
      question: 'Elle écrira une lettre à son ami',
      answer: 'le futur simple',
    },
    {
      question: "Je visitais souvent ma grand-mère quand j'étais tout petit",
      answer: "l'imparfait",
    },
    {
      question: 'Elle aimait beaucoup lire des romans',
      answer: "l'imparfait",
    },
    {
      question: 'Il a acheté un nouveau vélo il y a quelques semaines',
      answer: 'le passé composé',
    },
  ] satisfies Array<Omit<FindTenseQuestion, 'category'>>
).map(question => ({
  ...question,
  category: QuestionCategory.FindTense,
})) satisfies FindTenseQuestion[]

export const conjugate = [
  {
    question: 'Je _____ (manger, passé composé) une pomme',
    answer: 'ai mangé',
  },
  {
    question: 'Il _____ (perdre, passé composé) son portefeuille hier matin',
    answer: 'a perdu',
  },
  {
    question: 'Il _____ (pleuvoir, passé composé) toute la journée hier',
    answer: 'a plu',
  },
  {
    question: 'Elle _____ (acheter, passé composé) des fleurs pour sa mère',
    answer: 'a acheté',
  },
  {
    question:
      "J'ai beaucoup aimé les fleurs que tu me _____ (offrir, passé composé)",
    answer: 'as offertes',
  },
  {
    question: 'Nous _____ (se téléphoner, passé composé) pendant des heures',
    answer: 'nous sommes téléphoné',
  },
  {
    question: "Elle _____ (s'assoir, passé composé) derrière moi",
    answer: "s'est assise",
  },
  {
    question: 'Nous _____ (aller, futur simple) à la plage demain après-midi',
    answer: 'irons',
  },
  {
    question: 'Il _____ (faire, futur simple) beau cette fin de semaine',
    answer: 'fera',
  },
  {
    question:
      'Nous _____ (jouer, imparfait) au football dans le parc tous les soirs',
    answer: 'jouions',
  },
  {
    question: 'Il _____ (pleuvoir, imparfait) souvent en automne',
    answer: 'pleuvait',
  },
  {
    question:
      'Nous _____ (prendre, passé composé) le petit déjeuner ensemble ce matin',
    answer: 'avons pris',
  },
  {
    question: 'Il _____ (neiger, passé composé) toute la nuit hier',
    answer: 'a neigé',
  },
  {
    question: 'Nous _____ (aller, futur simple) à ce restaurant ce soir',
    answer: 'irons',
  },
  {
    question: 'Il _____ (être, futur simple) professeur dans deux ans',
    answer: 'sera',
  },
  {
    question: 'Il _____ (faire, imparfait) toujours chaud en été',
    answer: 'faisait',
  },
].map(question => ({
  ...question,
  category: QuestionCategory.Conjugate,
})) satisfies ConjugateQuestion[]

export const cdOrCI = (
  [
    {
      question: "La pomme que j'ai mangée était délicieuse",
      answer: 'CD',
    },
    {
      question: "L'endroit où je suis allé était magnifique",
      answer: 'CI',
    },
    {
      question: 'Je me suis lavée ce matin',
      answer: 'CD',
    },
    {
      question: 'Je lui ai parlé la semaine passée',
      answer: 'CI',
    },
    {
      question: "J'ai visité la Tour Eiffel hier",
      answer: 'CD',
    },
    {
      question: 'Je suis allé à Lyon pour visiter ma famille',
      answer: 'CI',
    },
  ] satisfies Array<Omit<CDOrCIQuestion, 'category'>>
).map(question => ({
  ...question,
  category: QuestionCategory.CDOrCI,
})) satisfies CDOrCIQuestion[]

const questions: Question[] = [...findTense, ...conjugate, ...cdOrCI]

export default questions
