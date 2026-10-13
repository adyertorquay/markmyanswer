import type { QuestionType } from "./spec";

// Original practice questions written for MarkMyAnswer in the style of
// Edexcel GCSE Business (1BS0). Businesses in the case studies are fictional.

export interface PracticeQuestion {
  id: string;
  theme: 1 | 2;
  topic: string;
  type: QuestionType;
  marks: number;
  question: string;
  context?: string;
}

const BREW_BIKE = `Brew Bike Ltd is a small business set up in 2022 by Priya Shah. It sells coffee and pastries from three converted cargo bikes that park at train stations and outdoor events in Bristol. Priya used £18,000 of her own savings and a £10,000 bank loan to start the business.

Brew Bike charges £3.20 for a coffee, which is about 40p cheaper than nearby cafés. In 2024 the business sold 62,000 drinks. Each drink has variable costs of £1.10 and the business has fixed costs of £96,000 a year. Customer reviews often praise the friendly staff and the quality of the coffee, but some customers complain about long queues at busy times.

Priya is considering two options to grow the business: buying two more cargo bikes, or opening a small permanent kiosk in Bristol Temple Meads station, which would cost £45,000 to fit out.`;

const NORTHSTAR = `Northstar Outdoor plc manufactures waterproof jackets and walking boots in a factory in Leeds. It sells to large retailers and through its own website. The business employs 340 people.

Northstar uses batch production. Over the last two years the cost of raw materials has risen by 18%, and the business has had problems with late deliveries from one of its main fabric suppliers. In a recent staff survey, 41% of factory workers said they felt their ideas were ignored by managers, and labour turnover has risen to 16% a year.

Northstar's directors are deciding whether to introduce lean production methods, such as just-in-time stock control, across the factory.`;

export const PRACTICE_QUESTIONS: PracticeQuestion[] = [
  {
    id: "t1-define-usp",
    theme: 1,
    topic: "Spotting a business opportunity",
    type: "define",
    marks: 1,
    question: "Define the term 'unique selling point' (USP).",
  },
  {
    id: "t1-state-stakeholder",
    theme: 1,
    topic: "Putting a business idea into practice",
    type: "state",
    marks: 1,
    question: "State one stakeholder of a business, other than its owners.",
  },
  {
    id: "t1-outline-limited-liability",
    theme: 1,
    topic: "Making the business effective",
    type: "outline",
    marks: 2,
    question: "Outline one benefit to an entrepreneur of having limited liability.",
  },
  {
    id: "t1-explain-interest-rates",
    theme: 1,
    topic: "Understanding external influences",
    type: "explain",
    marks: 3,
    question: "Explain one impact on a small business of an increase in interest rates.",
  },
  {
    id: "t1-discuss-market-research",
    theme: 1,
    topic: "Spotting a business opportunity",
    type: "discuss",
    marks: 6,
    question: "Discuss the benefits to a new business of carrying out primary market research.",
  },
  {
    id: "t1-calc-breakeven",
    theme: 1,
    topic: "Putting a business idea into practice",
    type: "calculate",
    marks: 2,
    question: "Using the information provided, calculate the number of drinks Brew Bike needs to sell each year to break even. You are advised to show your workings.",
    context: BREW_BIKE,
  },
  {
    id: "t1-analyse-pricing",
    theme: 1,
    topic: "Spotting a business opportunity",
    type: "analyse",
    marks: 6,
    question: "Analyse the impact on Brew Bike of charging a lower price than its competitors.",
    context: BREW_BIKE,
  },
  {
    id: "t1-justify-growth",
    theme: 1,
    topic: "Making the business effective",
    type: "justify",
    marks: 9,
    question: "Priya is considering two options to grow Brew Bike:\nOption 1: buy two more cargo bikes\nOption 2: open a permanent kiosk at Bristol Temple Meads station\nJustify which one of these two options Priya should choose.",
    context: BREW_BIKE,
  },
  {
    id: "t1-evaluate-customer-service",
    theme: 1,
    topic: "Making the business effective",
    type: "evaluate",
    marks: 12,
    question: "Evaluate whether good customer service is the most important factor in Brew Bike's success. You should use the information provided as well as your knowledge of business.",
    context: BREW_BIKE,
  },
  {
    id: "t2-define-jit",
    theme: 2,
    topic: "Making operational decisions",
    type: "define",
    marks: 1,
    question: "What is meant by the term 'just-in-time' stock control?",
  },
  {
    id: "t2-outline-batch",
    theme: 2,
    topic: "Making operational decisions",
    type: "outline",
    marks: 2,
    question: "Outline one disadvantage to a business of using batch production.",
  },
  {
    id: "t2-explain-motivation",
    theme: 2,
    topic: "Making human resource decisions",
    type: "explain",
    marks: 3,
    question: "Explain one way a business could reduce its labour turnover.",
  },
  {
    id: "t2-analyse-suppliers",
    theme: 2,
    topic: "Making operational decisions",
    type: "analyse",
    marks: 6,
    question: "Analyse the impact on Northstar of late deliveries from its suppliers.",
    context: NORTHSTAR,
  },
  {
    id: "t2-evaluate-lean",
    theme: 2,
    topic: "Making operational decisions",
    type: "evaluate",
    marks: 12,
    question: "Evaluate whether Northstar should introduce lean production methods across its factory. You should use the information provided as well as your knowledge of business.",
    context: NORTHSTAR,
  },
];

export function getPracticeQuestion(id: string): PracticeQuestion | undefined {
  return PRACTICE_QUESTIONS.find((q) => q.id === id);
}
