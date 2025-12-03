// simple wrapper to call your backend at http://localhost:3000
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export async function register(username, password, email) {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, email })
  })
  return res.json()
}

export async function login(username, password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
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

export async function getPenType(userId) {
  const res = await fetch(`${API_BASE}/pen-type/${userId}`)
  return res.json()
}

export async function getMatches(userId) {
  const res = await fetch(`${API_BASE}/match/${userId}`)
  return res.json()
}
import { API_BASE } from "./config"; // api.js 和 config.js 同级

