export const quiz = (prompt, options, answer, explanation) => ({ prompt, options, answer, explanation })

export function createLesson({
  id,
  title,
  kind = 'concept',
  summary,
  objectives,
  observation,
  macro,
  micro,
  boundary,
  keyPoints,
  mistakes,
  check,
  visualTitle,
  visual,
  takeaway
}) {
  return {
    id,
    title,
    kind,
    summary,
    objectives,
    phenomenon: observation,
    macroExplanation: macro,
    microExplanation: micro,
    conditions: boundary,
    keyPoints,
    commonMistakes: mistakes,
    checkQuestion: check,
    visual: {
      title: visualTitle,
      description: summary,
      items: visual.map(([label, detail, example]) => ({ label, detail, example })),
      takeaway
    }
  }
}

export function createChapter(id, title, shortTitle, lessons) {
  return { id, title, shortTitle, lessons }
}
