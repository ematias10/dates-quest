import { ref, watch } from 'vue'

const STORAGE_KEY = 'dates_quest_save'

const DEFAULT_STATE = {
  maxLevelUnlocked: 1,
  score: 0,
  highScore: 0,
  currentHP: 20
}

// Check if localStorage is available in current environment
const isStorageAvailable = () => {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

// Safely retrieve persisted state from localStorage
const loadStoredState = () => {
  if (isStorageAvailable()) {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        return {
          maxLevelUnlocked: typeof parsed.maxLevelUnlocked === 'number' ? parsed.maxLevelUnlocked : DEFAULT_STATE.maxLevelUnlocked,
          score: typeof parsed.score === 'number' ? parsed.score : DEFAULT_STATE.score,
          highScore: typeof parsed.highScore === 'number' ? parsed.highScore : DEFAULT_STATE.highScore,
          currentHP: typeof parsed.currentHP === 'number' ? parsed.currentHP : DEFAULT_STATE.currentHP
        }
      }
    } catch (error) {
      console.warn('Could not read saved game state from localStorage:', error)
    }
  }
  return { ...DEFAULT_STATE }
}

const initial = loadStoredState()

// Global persistent reactive state
const maxLevelUnlocked = ref(initial.maxLevelUnlocked)
const score = ref(initial.score)
const highScore = ref(initial.highScore)
const currentHP = ref(initial.currentHP)

// Global temporary reactive state (not stored in localStorage)
const combo = ref(0)
const isLevelPerfect = ref(true)

// Persist state changes automatically to localStorage
const persistState = () => {
  if (isStorageAvailable()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        maxLevelUnlocked: maxLevelUnlocked.value,
        score: score.value,
        highScore: highScore.value,
        currentHP: currentHP.value
      }))
    } catch (error) {
      console.warn('Could not write game state to localStorage:', error)
    }
  }
}

watch([maxLevelUnlocked, score, highScore, currentHP], persistState, { deep: true })

export function useGameState() {
  /**
   * Adds basePoints plus a streak bonus (combo * 10) to the score.
   * Increments the combo streak and updates the highScore if beaten.
   */
  const addScore = (basePoints) => {
    const bonus = combo.value * 10
    const pointsToAdd = basePoints + bonus
    score.value += pointsToAdd
    if (score.value > highScore.value) {
      highScore.value = score.value
    }
    combo.value++
    return pointsToAdd
  }

  /**
   * Deducts HP (minimum 0), resets combo to 0, and marks isLevelPerfect as false.
   */
  const takeDamage = (amount) => {
    currentHP.value = Math.max(0, currentHP.value - amount)
    combo.value = 0
    isLevelPerfect.value = false
    return currentHP.value
  }

  /**
   * Completes a level:
   * - Grants 1000 extra points if isLevelPerfect is true.
   * - Advances maxLevelUnlocked if the completed level is >= current max.
   * - Restores currentHP to 20.
   * - Resets temporary level flags (combo, isLevelPerfect).
   */
  const completeLevel = (levelNum) => {
    if (isLevelPerfect.value) {
      score.value += 1000
      if (score.value > highScore.value) {
        highScore.value = score.value
      }
    }

    if (levelNum >= maxLevelUnlocked.value) {
      maxLevelUnlocked.value = levelNum + 1
    }

    currentHP.value = 20
    combo.value = 0
    isLevelPerfect.value = true
  }

  /**
   * Resets temporary level variables before starting a run.
   */
  const startLevel = () => {
    combo.value = 0
    isLevelPerfect.value = true
  }

  /**
   * Resets all progress back to initial default state.
   */
  const resetGame = () => {
    maxLevelUnlocked.value = DEFAULT_STATE.maxLevelUnlocked
    score.value = DEFAULT_STATE.score
    highScore.value = DEFAULT_STATE.highScore
    currentHP.value = DEFAULT_STATE.currentHP
    combo.value = 0
    isLevelPerfect.value = true
    if (isStorageAvailable()) {
      try {
        window.localStorage.removeItem(STORAGE_KEY)
      } catch (e) {
        console.warn(e)
      }
    }
  }

  return {
    // Persisted reactive state
    maxLevelUnlocked,
    score,
    highScore,
    currentHP,

    // Temporary reactive state
    combo,
    isLevelPerfect,

    // Methods
    addScore,
    takeDamage,
    completeLevel,
    startLevel,
    resetGame
  }
}
