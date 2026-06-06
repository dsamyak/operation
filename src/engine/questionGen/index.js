/**
 * Procedural Question Generator for MathQuest: Operation Infinity
 * Uses seedrandom.js for reproducible question sets.
 */
import Seedrandom from 'seedrandom'

let rng = null

export function initRNG(seed) {
  rng = new Seedrandom(seed)
}

function rand(min, max) {
  return Math.floor(rng() * (max - min + 1)) + min
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ─── Module A: Multiplication ────────────────────────────────────────────────
function generateMultiplicationQuestion(difficulty) {
  let a, b
  if (difficulty === 'novice') {
    a = rand(10, 99); b = rand(2, 9)
  } else if (difficulty === 'explorer') {
    a = rand(100, 999); b = rand(10, 99)
  } else {
    a = rand(1000, 9999); b = rand(10, 99)
  }
  const answer = a * b
  const wrong1 = answer + rand(10, 99) * (rng() > 0.5 ? 1 : -1)
  const wrong2 = a * (b + rand(1, 3))
  const wrong3 = (a + rand(1, 9)) * b
  const options = shuffle([answer, Math.abs(wrong1), Math.abs(wrong2), Math.abs(wrong3)])
  return {
    id: `A_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    module: 'A',
    type: 'mcq',
    difficulty,
    question: `What is ${a.toLocaleString()} × ${b.toLocaleString()}?`,
    operands: { a, b },
    answer,
    options,
    explanation: `${a.toLocaleString()} × ${b.toLocaleString()} = ${answer.toLocaleString()}`,
    hint: `Use the standard algorithm: multiply each digit of ${a} by ${b}, then add the partial products.`,
  }
}

// ─── Module B: Division ──────────────────────────────────────────────────────
function generateDivisionQuestion(difficulty) {
  let dividend, divisor
  if (difficulty === 'novice') {
    divisor = rand(2, 9); dividend = divisor * rand(10, 99)
  } else if (difficulty === 'explorer') {
    divisor = rand(10, 29); dividend = divisor * rand(10, 99) + rand(0, divisor - 1)
  } else {
    divisor = rand(10, 99); dividend = divisor * rand(100, 999) + rand(0, divisor - 1)
  }
  const quotient = Math.floor(dividend / divisor)
  const remainder = dividend % divisor
  const answerStr = remainder > 0 ? `${quotient} R${remainder}` : `${quotient}`
  const answer = quotient
  const wrong1 = quotient + rand(1, 5)
  const wrong2 = quotient - rand(1, 5) > 0 ? quotient - rand(1, 5) : quotient + rand(6, 10)
  const wrong3 = quotient + rand(10, 20)
  const options = shuffle([quotient, wrong1, wrong2, wrong3])
  return {
    id: `B_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    module: 'B',
    type: remainder > 0 ? 'fill' : 'mcq',
    difficulty,
    question: remainder > 0
      ? `What is ${dividend.toLocaleString()} ÷ ${divisor}? (Write quotient and remainder)`
      : `What is ${dividend.toLocaleString()} ÷ ${divisor}?`,
    operands: { dividend, divisor },
    answer: remainder > 0 ? answerStr : quotient,
    options: remainder > 0 ? null : options,
    remainder,
    explanation: remainder > 0
      ? `${dividend.toLocaleString()} ÷ ${divisor} = ${quotient} remainder ${remainder}`
      : `${dividend.toLocaleString()} ÷ ${divisor} = ${quotient}`,
    hint: `Use long division: how many times does ${divisor} go into ${dividend}?`,
  }
}

// ─── Module C: Order of Operations ──────────────────────────────────────────
function generateOrderOfOpsQuestion(difficulty) {
  let expr, answer
  const ops = ['+', '-', '×', '÷']

  if (difficulty === 'novice') {
    const a = rand(2, 20), b = rand(2, 10), c = rand(2, 10)
    expr = `(${a} + ${b}) × ${c}`
    answer = (a + b) * c
  } else if (difficulty === 'explorer') {
    const a = rand(2, 15), b = rand(2, 10), c = rand(2, 8), d = rand(2, 5)
    expr = `${a} + (${b} - ${c}) × ${d}`
    answer = a + (b - c) * d
  } else {
    const a = rand(2, 10), b = rand(2, 8), c = rand(2, 6), d = rand(2, 5), e = rand(2, 4)
    expr = `[${a} × (${b} + ${c})] - ${d} × ${e}`
    answer = [a * (b + c)] - d * e
  }

  const wrong1 = answer + rand(2, 10)
  const wrong2 = answer - rand(2, 10) < 0 ? answer + rand(11, 20) : answer - rand(2, 10)
  const wrong3 = answer * 2
  const options = shuffle([answer, wrong1, wrong2, wrong3])

  return {
    id: `C_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    module: 'C',
    type: 'mcq',
    difficulty,
    question: `Evaluate: ${expr}`,
    expression: expr,
    answer,
    options,
    explanation: `Following PEMDAS/BODMAS: brackets first, then multiplication/division, then addition/subtraction. ${expr} = ${answer}`,
    hint: `Remember BODMAS: Brackets → Division/Multiplication → Addition/Subtraction`,
  }
}

// ─── Module D: Expressions & Patterns ────────────────────────────────────────
function generateExpressionsQuestion(difficulty) {
  const names = ['John', 'Sarah', 'Mike', 'Emma', 'Liam']
  const name = names[Math.floor(rng() * names.length)]

  if (difficulty === 'novice') {
    const n = rand(2, 10), total = rand(20, 50)
    const answer = total - n
    const options = shuffle([answer, answer + rand(1, 5), answer - rand(1, 5), answer * 2])
    return {
      id: `D_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      module: 'D', type: 'mcq', difficulty,
      question: `${name} has ${total} stickers and gives away ${n}. Write the expression and find the result.`,
      expression: `${total} - ${n}`,
      answer, options,
      explanation: `${total} - ${n} = ${answer}`,
      hint: `"Gives away" means subtraction: ${total} - ${n}`,
    }
  } else if (difficulty === 'explorer') {
    const start = rand(3, 9), rule = rand(3, 7)
    const seq = [start, start + rule, start + 2 * rule, start + 3 * rule, start + 4 * rule]
    const answer = start + 5 * rule
    const options = shuffle([answer, answer + rule, answer - rule, answer + 2 * rule])
    return {
      id: `D_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      module: 'D', type: 'mcq', difficulty,
      question: `Find the next number in the pattern: ${seq.join(', ')}, ?`,
      sequence: seq, rule: `+${rule}`,
      answer, options,
      explanation: `The rule is +${rule}. ${seq[seq.length-1]} + ${rule} = ${answer}`,
      hint: `Find the difference between each pair of numbers.`,
    }
  } else {
    const x1 = rand(1, 5), y1 = rand(2, 4)
    const rule_x = rand(1, 3), rule_y = y1 * rand(2, 3)
    const pairs = Array.from({length: 4}, (_, i) => [x1 + i * rule_x, y1 + i * rule_y])
    const nextX = pairs[3][0] + rule_x
    const nextY = pairs[3][1] + rule_y
    const options = shuffle([nextY, nextY + rule_y, nextY - rule_y, nextY + 2 * rule_y])
    return {
      id: `D_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      module: 'D', type: 'mcq', difficulty,
      question: `The pattern table shows (x, y): ${pairs.map(p => `(${p[0]},${p[1]})`).join(', ')}. What is y when x = ${nextX}?`,
      pairs, nextX,
      answer: nextY, options,
      explanation: `x increases by ${rule_x}, y increases by ${rule_y}. When x = ${nextX}, y = ${nextY}`,
      hint: `Look at how y changes each time x increases.`,
    }
  }
}

// ─── Module E: Patterns ───────────────────────────────────────────────────────
function generatePatternsQuestion(difficulty) {
  const ruleN = rand(2, 12)
  const isMultiply = rng() > 0.5
  const start = rand(1, 10)

  let seq, rule, answer
  if (isMultiply && difficulty !== 'novice') {
    seq = [start, start * ruleN, start * ruleN * ruleN, start * ruleN * ruleN * ruleN]
    rule = `×${ruleN}`
    answer = seq[3] * ruleN
  } else {
    seq = [start, start + ruleN, start + 2 * ruleN, start + 3 * ruleN, start + 4 * ruleN]
    rule = `+${ruleN}`
    answer = seq[4] + ruleN
  }
  const options = shuffle([answer, answer + ruleN, answer - ruleN, answer + 2 * ruleN])
  return {
    id: `E_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    module: 'E', type: 'mcq', difficulty,
    question: `Continue the pattern: ${seq.join(', ')}, ?`,
    sequence: seq, rule,
    answer, options,
    explanation: `The rule is ${rule}. The next term is ${answer}.`,
    hint: `What operation connects each term to the next?`,
  }
}

// ─── Module F: Coordinate Plane ───────────────────────────────────────────────
function generateCoordinateQuestion(difficulty) {
  const numPoints = difficulty === 'novice' ? 4 : difficulty === 'explorer' ? 6 : 8
  const points = Array.from({ length: numPoints }, () => [rand(0, 20), rand(0, 20)])
  const targetIdx = rand(0, numPoints - 1)
  const target = points[targetIdx]
  const wrongX = rand(0, 20), wrongY = rand(0, 20)
  const options = shuffle([
    `(${target[0]}, ${target[1]})`,
    `(${wrongX}, ${target[1]})`,
    `(${target[0]}, ${wrongY})`,
    `(${wrongX}, ${wrongY})`,
  ])
  return {
    id: `F_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    module: 'F', type: 'coordinate',
    difficulty,
    question: `What are the coordinates of the highlighted point?`,
    points, targetIdx,
    answer: `(${target[0]}, ${target[1]})`,
    options,
    explanation: `The point is at x = ${target[0]} (horizontal) and y = ${target[1]} (vertical), written as (${target[0]}, ${target[1]}).`,
    hint: `Read the x-axis (horizontal) first, then the y-axis (vertical).`,
  }
}

// ─── Main Generator ───────────────────────────────────────────────────────────
const GENERATORS = {
  A: generateMultiplicationQuestion,
  B: generateDivisionQuestion,
  C: generateOrderOfOpsQuestion,
  D: generateExpressionsQuestion,
  E: generatePatternsQuestion,
  F: generateCoordinateQuestion,
}

export function generateQuestions(moduleId, count = 10, seed = Date.now()) {
  initRNG(seed)
  const generator = GENERATORS[moduleId]
  if (!generator) throw new Error(`Unknown module: ${moduleId}`)

  const difficulties = ['novice', 'explorer', 'champion']
  const questions = []
  const seen = new Set()

  for (let i = 0; i < count; i++) {
    const difficulty = difficulties[Math.floor(i / (count / 3))] || 'champion'
    let q, attempts = 0
    do {
      q = generator(difficulty)
      attempts++
    } while (seen.has(q.answer) && attempts < 20)
    seen.add(q.answer)
    questions.push(q)
  }
  return questions
}

export default generateQuestions
