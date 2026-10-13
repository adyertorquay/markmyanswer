// Edexcel GCSE Business (1BS0) marking conventions, written in our own words.
// These drive both the UI (question types) and the marking prompt.

export type QuestionType =
  | "state"
  | "define"
  | "calculate"
  | "outline"
  | "explain"
  | "discuss"
  | "analyse"
  | "justify"
  | "evaluate";

export interface QuestionTypeInfo {
  type: QuestionType;
  label: string;
  marks: number[];
  usesContext: boolean;
  levels: { level: number; range: [number, number]; descriptor: string }[] | null;
  guidance: string;
}

export const QUESTION_TYPES: QuestionTypeInfo[] = [
  {
    type: "state",
    label: "State / Identify / Give",
    marks: [1],
    usesContext: false,
    levels: null,
    guidance:
      "Point-marked. 1 mark for one correct, relevant point. No development needed. Only the first answer given is credited if a student lists several.",
  },
  {
    type: "define",
    label: "Define / What is meant by",
    marks: [1],
    usesContext: false,
    levels: null,
    guidance:
      "Point-marked. 1 mark for an accurate definition that shows the meaning of the term. Using the term itself to define it (e.g. 'cash flow is the flow of cash') earns 0.",
  },
  {
    type: "calculate",
    label: "Calculate",
    marks: [1, 2, 3],
    usesContext: true,
    levels: null,
    guidance:
      "Point-marked. Full marks for the correct answer with correct units (£, %, number of units) even with no working. If the final answer is wrong, award marks for correct working/formula steps. Penalise missing or wrong units only where the mark scheme would (e.g. % required).",
  },
  {
    type: "outline",
    label: "Outline",
    marks: [2],
    usesContext: false,
    levels: null,
    guidance:
      "Point-marked. 1 mark for identifying a relevant point (AO1). 1 mark for developing that point with a linked strand of reasoning that shows why/how (e.g. a consequence). Two separate undeveloped points still only earn 1 mark.",
  },
  {
    type: "explain",
    label: "Explain",
    marks: [3],
    usesContext: false,
    levels: null,
    guidance:
      "Point-marked. 1 mark for a relevant point (AO1) and up to 2 further marks for linked development, i.e. a connected chain of reasoning ('this means that... which leads to...'). Developments must link to the same point. Several separate unlinked points cap at 1-2 marks.",
  },
  {
    type: "discuss",
    label: "Discuss",
    marks: [6],
    usesContext: false,
    levels: [
      { level: 1, range: [1, 2], descriptor: "Elementary knowledge and understanding of business concepts and issues. Attempts at analysis are limited to isolated assertions with little or no reasoning." },
      { level: 2, range: [3, 4], descriptor: "Sound knowledge and understanding of business concepts and issues. Analysis is presented with some chains of reasoning, though these may be incomplete." },
      { level: 3, range: [5, 6], descriptor: "Accurate, thorough knowledge and understanding. Detailed analysis with logical, developed chains of reasoning that are connected and show interdependence." },
    ],
    guidance:
      "Levels-marked, no case study. Assesses AO1 (knowledge) and AO3a (analysis). The student should develop a small number of points in depth rather than list many. No conclusion or judgement is required. Use the level descriptor first, then decide top or bottom of the band.",
  },
  {
    type: "analyse",
    label: "Analyse",
    marks: [6],
    usesContext: true,
    levels: [
      { level: 1, range: [1, 2], descriptor: "Elementary knowledge and understanding, with limited or generic application to the business. Analysis is isolated assertions with little reasoning." },
      { level: 2, range: [3, 4], descriptor: "Sound knowledge, applied to the business context in places. Analysis includes chains of reasoning, though some may be incomplete or only partly linked to the context." },
      { level: 3, range: [5, 6], descriptor: "Accurate knowledge, well applied to the business context throughout. Detailed analysis with logical, developed chains of reasoning tied to the case study evidence." },
    ],
    guidance:
      "Levels-marked, based on a case study. Assesses AO2 (application to context) and AO3a (analysis). An answer with no reference to the business/case study cannot go above Level 1 for application, and rarely above 2 marks overall. No judgement is required.",
  },
  {
    type: "justify",
    label: "Justify which option",
    marks: [9],
    usesContext: true,
    levels: [
      { level: 1, range: [1, 3], descriptor: "Elementary knowledge, applied to the context in a limited way. Isolated points of analysis. A judgement may be asserted but is not supported." },
      { level: 2, range: [4, 6], descriptor: "Sound knowledge, applied to the context in places. Chains of reasoning are present but may be incomplete. A judgement is made with some supporting evidence, but may be one-sided or not fully justified." },
      { level: 3, range: [7, 9], descriptor: "Accurate knowledge, applied well to the context throughout. Developed, logical chains of reasoning for the option(s). A balanced, supported judgement is reached that clearly justifies the choice, recognising the weakness of the chosen option or the strength of the rejected one." },
    ],
    guidance:
      "Levels-marked, case study with two options. Assesses AO2, AO3a (analysis) and AO3b (evaluation/judgement). The student must choose one option and justify it. Strong answers analyse the chosen option, consider the alternative or a drawback, and conclude with a justified decision using case study evidence. Without any judgement, cap at Level 2.",
  },
  {
    type: "evaluate",
    label: "Evaluate",
    marks: [12],
    usesContext: true,
    levels: [
      { level: 1, range: [1, 3], descriptor: "Elementary knowledge with limited application. Isolated assertions. A simple judgement may be made but is unsupported." },
      { level: 2, range: [4, 6], descriptor: "Sound knowledge with some application to context. Some chains of reasoning, possibly one-sided. A judgement is attempted with limited support." },
      { level: 3, range: [7, 9], descriptor: "Accurate knowledge applied to context. Developed chains of reasoning on both sides of the argument. A judgement is reached that is supported, but may not weigh up the key factors fully." },
      { level: 4, range: [10, 12], descriptor: "Accurate, thorough knowledge applied effectively throughout. Detailed, logical, balanced analysis. A well-supported judgement that weighs up the evidence and identifies what it depends on." },
    ],
    guidance:
      "Levels-marked, case study. Assesses AO2, AO3a and AO3b. Requires a balanced argument (for and against), applied to the business using case study evidence, and a reasoned conclusion that answers the question and ideally says what the decision depends on. A one-sided answer is capped at Level 2; no use of context caps at Level 1-2.",
  },
];

export function getQuestionType(type: string): QuestionTypeInfo | undefined {
  return QUESTION_TYPES.find((q) => q.type === type);
}

export const ASSESSMENT_OBJECTIVES = {
  AO1: "Demonstrate knowledge and understanding of business concepts and issues (AO1a terms, AO1b concepts/issues).",
  AO2: "Apply knowledge and understanding to various business contexts, using evidence from the case study.",
  AO3a: "Analyse business information and issues: developed, linked chains of reasoning showing causes and consequences.",
  AO3b: "Evaluate business information and issues to make reasoned judgements and draw conclusions.",
} as const;

export const LIMITS = {
  question: 1500,
  context: 6000,
  answer: 6000,
} as const;
