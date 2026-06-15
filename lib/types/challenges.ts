export type AcademyView = 'dashboard' | 'leaderboard'

export interface CockpitMetrics {
  confidence: number
  negotiation: number
  professionalism: number
  communication: number
  decision_making: number
  problem_solving: number
  dispatcher_accuracy: number
}

export interface ChallengeSession {
  sessionId: string | null
  challengeId: string | null
  studentName: string
  studentEmail: string
  turnNumber: number
  history: Array<{ q: string; a: string }>
  currentMetrics: CockpitMetrics
}

export interface StudentProfile {
  name: string
  email: string
  xp: number
  rank: string
  streak: number
  badges: string[]
  completed_challenges: Record<string, boolean>
}

export interface ChallengeCharacter {
  name: string
  role: string
  personality: string
}

export interface Challenge {
  challenge_id: string
  title: string
  description: string
  scenario_brief: string
  difficulty: string
  category: string
  company_type: string
  skill_tags: string[]
  duration: string
  xp_reward: number
  locked: boolean
  completed: boolean
  best_score: number
  attempts_count: number
  character: ChallengeCharacter
}

export interface DailyChallenge {
  challenge_id: string
  title: string
  description: string
}

export interface LeaderboardUser {
  name: string
  email: string
  xp: number
  rank: string
}

export interface RecentAttempt {
  score: number
  created_at_str: string
  challenge_title: string
}

export interface DebriefData {
  overall_score: number
  overall_summary: string
  mistakes_made: string[]
  better_responses: string[]
  dispatcher_best_practices: string[]
  negotiation_improvements: string[]
}

export interface BadgeReward {
  id: string
  name: string
  desc: string
  icon: string
}

export interface DebriefRewards {
  xp_added: number
  streak: number
  new_badges: BadgeReward[]
}

export interface CockpitState {
  isOpen: boolean
  callerName: string
  roleLabel: string
  emotionState: string
  personality: string
  scenario: string
  transcript: string
  turnNumber: number
  metrics: CockpitMetrics
  suggestions: string[]
  isRecording: boolean
  isTtsMuted: boolean
  isProcessing: boolean
}

export interface DebriefState {
  isOpen: boolean
  debrief: DebriefData | null
  rewards: DebriefRewards | null
}

export interface PracticeCallMessage {
  id: number
  type: 'system' | 'me' | 'bot'
  text: string
  isHtml?: boolean
}

export interface BatchSession {
  batch_id: string
  name: string
  mode: string
  college_name?: string
}
