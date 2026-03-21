import { User } from "./types"

// In-memory storage for MVP
// In production, this would be a database (Supabase, Neon, etc.)
const users: User[] = []

export function addUser(user: Omit<User, "id" | "createdAt" | "status" | "trialEndsAt">): User {
  const now = new Date()
  const trialEnd = new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000) // 4 weeks

  const newUser: User = {
    ...user,
    id: crypto.randomUUID(),
    createdAt: now.toISOString(),
    status: "free_trial",
    trialEndsAt: trialEnd.toISOString()
  }
  users.push(newUser)
  return newUser
}

export function getAllUsers(): User[] {
  return users
}

export function getUserByEmail(email: string): User | undefined {
  return users.find(u => u.email === email)
}

export function getUserById(id: string): User | undefined {
  return users.find(u => u.id === id)
}

export function updateUser(id: string, updates: Partial<User>): User | undefined {
  const index = users.findIndex(u => u.id === id)
  if (index === -1) return undefined
  
  users[index] = { ...users[index], ...updates }
  return users[index]
}

export function getActiveUsers(): User[] {
  return users.filter(u => u.status === "active" || u.status === "free_trial")
}

export function getTrialExpiredUsers(): User[] {
  const now = new Date()
  return users.filter(u => 
    u.status === "free_trial" && 
    new Date(u.trialEndsAt) < now
  )
}
