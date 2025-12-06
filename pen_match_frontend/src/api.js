import { API_BASE } from "./config";

export async function sendCode(email) {
  const res = await fetch(`${API_BASE}/auth/send-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  })
  return res.json()
}

export async function verifyLogin(email, code) {
  const res = await fetch(`${API_BASE}/auth/verify-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code })
  })
  return res.json()
}

export async function getQuestions() {
  const res = await fetch(`${API_BASE}/questions`)
  return res.json()
}

export async function postAnswer(user_id, question_id, selected_option) {
  const res = await fetch(`${API_BASE}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, question_id, selected_option })
  })
  return res.json()
}

export async function submitBatchAnswers(user_id, answers) {
  const res = await fetch(`${API_BASE}/answer/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, answers })
  })
  return res.json()
}

export async function getPenType(userId) {
  const res = await fetch(`${API_BASE}/pen-type/${userId}`)
  return res.json()
}

export async function getMatches(userId) {
  const res = await fetch(`${API_BASE}/match/${userId}`)
  return res.json()
}

export async function getAIAnalysis(userId) {
  const res = await fetch(`${API_BASE}/ai-analysis/${userId}`)
  return res.json()
}

export async function generateAIAnalysis(userId, mockPayment = true) {
  const res = await fetch(`${API_BASE}/ai-analysis/${userId}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mockPayment })
  })
  return res.json()
}

// Payment APIs
export async function initiatePayment(userId, method) {
  // method: 'wechat' or 'alipay'
  const res = await fetch(`${API_BASE}/ai-analysis/${userId}/pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ method })
  })
  return res.json()
}

export async function verifyPayment(userId, orderId) {
  const res = await fetch(`${API_BASE}/ai-analysis/${userId}/verify-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId })
  })
  return res.json()
}
