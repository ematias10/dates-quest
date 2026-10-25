<template>
  <div 
    class="w-full max-w-2xl mx-auto flex flex-col items-center justify-between min-h-[90vh] py-4 px-2 sm:px-6 relative select-none transition-all duration-100"
    :class="{ 'animate-shake': isShaking }"
  >
    <!-- Red Damage Flash Overlay -->
    <div 
      v-if="isRedFlash" 
      class="fixed inset-0 bg-red-600/30 pointer-events-none z-50 transition-opacity duration-200"
      aria-hidden="true"
    ></div>

    <!-- Top HUD: Undertale Style connected to useGameState -->
    <header class="w-full flex items-center justify-between border-b-2 border-white pb-3 mb-4">
      <button 
        @click="$emit('back-to-menu')" 
        class="text-xs sm:text-sm tracking-wider uppercase text-gray-300 hover:text-undertale-yellow transition-colors flex items-center gap-1 py-1 px-2 border border-transparent hover:border-undertale-yellow"
      >
        <span>&lt;</span> MENU
      </button>

      <div class="text-xs sm:text-sm tracking-widest text-center">
        <span class="text-undertale-yellow">LV 3</span>
        <span class="ml-2 text-white">WORD: {{ solvedCount }}/{{ totalWords }}</span>
      </div>

      <div class="text-xs sm:text-sm text-right flex items-center gap-2">
        <span class="text-gray-400">SCORE:</span>
        <span class="text-undertale-yellow font-bold">{{ score }}</span>
      </div>
    </header>

    <!-- ACTIVE GAME SCREEN -->
    <main v-if="!isVictory && !isGameOver" class="w-full flex-1 flex flex-col justify-between">
      
      <!-- Undertale Dialogue Box / Instruction Banner -->
      <section class="pixel-box p-3 sm:p-4 mb-3 sm:mb-4">
        <div class="flex items-start gap-2">
          <span class="text-undertale-yellow text-sm sm:text-base select-none">*</span>
          <p class="text-[11px] sm:text-xs leading-relaxed text-white min-h-[2.5rem] flex items-center">
            {{ dialogueMessage }}
          </p>
        </div>

        <div class="mt-2 pt-2 border-t border-gray-800 flex justify-between items-center text-[10px] text-gray-400">
          <span class="uppercase tracking-wider">
            CATEGORY: <span class="text-undertale-yellow">{{ currentWordData?.category }}</span>
          </span>
          <span v-if="combo > 1" class="text-undertale-yellow font-bold animate-pulse">
            COMBO x{{ combo }}!
          </span>
          <span v-else class="text-gray-400">
            PERFECT: {{ isLevelPerfect ? 'YES' : 'NO' }}
          </span>
        </div>
      </section>

      <!-- Center Stage: Hint & Hidden Word Display -->
      <section class="my-auto flex flex-col items-center justify-center py-3">
        
        <!-- Interfaz de Pistas: sobre los guiones de la palabra oculta en texto gris con opacidad -->
        <div class="mb-4 text-center max-w-lg px-2">
          <p class="text-[10px] sm:text-xs text-gray-400 opacity-80 leading-relaxed italic">
            HINT: "{{ currentWordData?.hint }}"
          </p>
        </div>

        <!-- Hidden Word Slots / Characters -->
        <div class="flex flex-wrap justify-center items-center gap-1 sm:gap-2.5 px-2 max-w-full" role="region" aria-label="Hidden word">
          <template v-for="(char, index) in targetLetters" :key="index">
            <!-- Space separator -->
            <div v-if="char === ' '" class="w-3 sm:w-5"></div>

            <!-- Non-alphabetic character (e.g. apostrophe) -->
            <div 
              v-else-if="!isAlpha(char)" 
              class="w-6 sm:w-8 h-10 sm:h-12 flex items-center justify-center text-sm sm:text-lg font-bold text-white"
            >
              {{ char }}
            </div>

            <!-- Alphabetical Letter Slot -->
            <div
              v-else
              class="min-w-[26px] sm:min-w-[34px] h-10 sm:h-13 border-b-4 flex items-center justify-center text-xs sm:text-base font-bold tracking-wider transition-colors duration-200"
              :class="[
                isLetterRevealed(char)
                  ? 'border-undertale-yellow text-undertale-yellow' 
                  : 'border-white text-transparent'
              ]"
            >
              {{ isLetterRevealed(char) ? char.toUpperCase() : '_' }}
            </div>
          </template>
        </div>
      </section>

      <!-- Virtual QWERTY Keyboard (Touch-friendly, min-h 48px) -->
      <section class="w-full flex flex-col items-center gap-1.5 sm:gap-2 mb-3" aria-label="Virtual keyboard">
        <!-- QWERTY Row 1 -->
        <div class="flex justify-center gap-1 sm:gap-1.5 w-full max-w-xl">
          <button
            v-for="key in row1"
            :key="key"
            @click="handleGuess(key)"
            :disabled="guessedLetters.has(key) || isTransitioning"
            :class="[
              'min-h-[48px] sm:min-h-[50px] flex-1 max-w-[38px] sm:max-w-[48px] text-[11px] sm:text-xs font-bold border-2 flex items-center justify-center rounded-none transition-all active:scale-95',
              getKeyClass(key)
            ]"
          >
            {{ key }}
          </button>
        </div>

        <!-- QWERTY Row 2 -->
        <div class="flex justify-center gap-1 sm:gap-1.5 w-full max-w-lg">
          <button
            v-for="key in row2"
            :key="key"
            @click="handleGuess(key)"
            :disabled="guessedLetters.has(key) || isTransitioning"
            :class="[
              'min-h-[48px] sm:min-h-[50px] flex-1 max-w-[38px] sm:max-w-[48px] text-[11px] sm:text-xs font-bold border-2 flex items-center justify-center rounded-none transition-all active:scale-95',
              getKeyClass(key)
            ]"
          >
            {{ key }}
          </button>
        </div>

        <!-- QWERTY Row 3 -->
        <div class="flex justify-center gap-1 sm:gap-1.5 w-full max-w-md">
          <button
            v-for="key in row3"
            :key="key"
            @click="handleGuess(key)"
            :disabled="guessedLetters.has(key) || isTransitioning"
            :class="[
              'min-h-[48px] sm:min-h-[50px] flex-1 max-w-[38px] sm:max-w-[48px] text-[11px] sm:text-xs font-bold border-2 flex items-center justify-center rounded-none transition-all active:scale-95',
              getKeyClass(key)
            ]"
          >
            {{ key }}
          </button>
        </div>
      </section>

      <!-- Bottom Status & HP Bar (Bound to useGameState currentHP) -->
      <footer class="w-full flex items-center justify-between text-xs py-2 border-t border-gray-800">
        <div class="flex items-center gap-2">
          <span class="text-xs text-undertale-red font-bold">HP</span>
          <div class="w-24 sm:w-32 h-4 bg-red-900 border border-white relative overflow-hidden">
            <div 
              class="h-full bg-undertale-yellow transition-all duration-300"
              :style="{ width: `${(currentHP / 20) * 100}%` }"
            ></div>
          </div>
          <span class="text-[10px] text-gray-300">{{ currentHP }} / 20</span>
        </div>

        <div class="text-[10px] text-gray-400">
          SOLVED: <span class="text-undertale-yellow font-bold">{{ solvedCount }} / {{ totalWords }}</span>
        </div>
      </footer>
    </main>

    <!-- VICTORY SCREEN (Triggered after all 10 words completed) -->
    <main v-else-if="isVictory" class="w-full flex-1 flex flex-col justify-center items-center text-center">
      <div class="pixel-box p-6 sm:p-8 w-full max-w-md">
        <div class="text-undertale-red text-4xl mb-3 soul-pulse select-none">❤</div>

        <h2 class="text-base sm:text-lg text-undertale-yellow mb-2 tracking-wider">
          LEVEL 3 COMPLETE!
        </h2>
        
        <p class="text-xs text-white mb-4 leading-relaxed">
          ALL 10 CALENDAR WORDS SOLVED!
        </p>

        <div class="border-t border-b border-gray-700 py-3 mb-6 text-xs text-gray-300 space-y-2 text-left">
          <div class="flex justify-between">
            <span class="text-gray-400">Words Solved:</span>
            <span class="text-undertale-yellow font-bold">10 / 10</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Perfect Clear:</span>
            <span :class="isLevelPerfect ? 'text-undertale-green font-bold' : 'text-gray-400'">
              {{ isLevelPerfect ? 'YES (+1000 BONUS)' : 'NO' }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Remaining HP:</span>
            <span class="text-undertale-yellow">{{ currentHP }} / 20</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Total Score:</span>
            <span class="text-undertale-yellow font-bold">{{ score }}</span>
          </div>
        </div>

        <p class="text-[11px] text-gray-300 italic mb-6">
          * Your spelling precision resonates with the ancient underground calendar.
        </p>

        <div class="flex flex-col gap-3">
          <button 
            @click="startNewGame" 
            class="undertale-btn justify-center py-3 text-xs sm:text-sm text-undertale-yellow border-undertale-yellow hover:bg-yellow-950/30"
          >
            <span class="text-undertale-red mr-2">❤</span> PLAY LEVEL AGAIN
          </button>
          
          <button 
            @click="$emit('back-to-menu')" 
            class="undertale-btn justify-center py-3 text-xs sm:text-sm text-white hover:border-white"
          >
            MAIN MENU
          </button>
        </div>
      </div>
    </main>

    <!-- GAME OVER SCREEN (currentHP reaches 0) -->
    <main v-else-if="isGameOver" class="w-full flex-1 flex flex-col justify-center items-center text-center">
      <div class="pixel-box p-6 sm:p-8 w-full max-w-md">
        <!-- Shattered Soul Animation -->
        <div class="flex justify-center items-center gap-2 mb-4">
          <span class="text-undertale-red text-3xl select-none inline-block transform -rotate-12">💔</span>
        </div>

        <h2 class="text-base sm:text-lg text-undertale-red mb-3 tracking-wider">
          GAME OVER
        </h2>

        <p class="text-xs text-gray-300 leading-relaxed mb-4">
          * You cannot give up just yet...
        </p>
        <p class="text-xs text-undertale-yellow leading-relaxed mb-6 font-bold">
          * Frisk! Stay determined!
        </p>

        <div class="border-t border-b border-gray-700 py-3 mb-6 text-xs text-left">
          <div class="flex justify-between">
            <span class="text-gray-400">The word was:</span>
            <span class="text-undertale-yellow font-bold uppercase">{{ currentWordData?.word }}</span>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <button 
            @click="startNewGame" 
            class="undertale-btn justify-center py-3 text-xs sm:text-sm text-undertale-yellow border-undertale-yellow hover:bg-yellow-950/30"
          >
            <span class="text-undertale-red mr-2">❤</span> RETRY
          </button>
          
          <button 
            @click="$emit('back-to-menu')" 
            class="undertale-btn justify-center py-3 text-xs sm:text-sm text-white hover:border-white"
          >
            MAIN MENU
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import vocabularyData from '../data.json'
import { useGameState } from '../composables/useGameState'

const emit = defineEmits(['back-to-menu'])

// Connect Global Game State
const {
  score,
  currentHP,
  combo,
  isLevelPerfect,
  addScore,
  takeDamage,
  completeLevel,
  startLevel
} = useGameState()

// QWERTY keyboard rows
const row1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P']
const row2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L']
const row3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M']

// Level Configuration: Exact pool of 10 words (3 days, 3 months, 2 seasons, 2 holidays)
const totalWords = 10
const damagePerFail = 2

// State
const wordsList = ref([])
const currentWordIndex = ref(0)
const solvedCount = ref(0)
const guessedLetters = ref(new Set())
const isTransitioning = ref(false)

const dialogueMessage = ref('Touch a letter to guess the secret calendar word.')
const isShaking = ref(false)
const isRedFlash = ref(false)
const isVictory = ref(false)

// Current Word Data
const currentWordData = computed(() => {
  return wordsList.value[currentWordIndex.value] || null
})

const currentWord = computed(() => {
  return currentWordData.value?.word || ''
})

const targetLetters = computed(() => {
  return currentWord.value.split('')
})

// Unique alphabetic characters that must be guessed
const requiredLetters = computed(() => {
  const letters = targetLetters.value
    .filter(c => /^[A-Z]$/i.test(c))
    .map(c => c.toUpperCase())
  return new Set(letters)
})

const isGameOver = computed(() => {
  return currentHP.value <= 0
})

// Helper: Check if character is alphabetic
const isAlpha = (char) => {
  return /^[A-Z]$/i.test(char)
}

// Helper: Check if letter is revealed
const isLetterRevealed = (char) => {
  return guessedLetters.value.has(char.toUpperCase())
}

// Helper: Shuffle array
const shuffle = (array) => {
  return [...array].sort(() => Math.random() - 0.5)
}

/**
 * Filtro Estricto:
 * Selecciona aleatoriamente un pool exacto de 10 palabras de data.json:
 * - 3 días
 * - 3 meses
 * - 2 estaciones
 * - 2 festividades
 */
const buildWordsPool = () => {
  // 3 Days
  const daysPool = shuffle(vocabularyData.days || []).slice(0, 3).map(d => ({
    word: typeof d === 'string' ? d : d.name,
    category: 'Day of the Week',
    hint: typeof d === 'object' && d.hint ? d.hint : 'A day in the weekly cycle'
  }))

  // 3 Months
  const monthsPool = shuffle(vocabularyData.months || []).slice(0, 3).map(m => ({
    word: typeof m === 'string' ? m : m.name,
    category: 'Month of the Year',
    hint: typeof m === 'object' && m.hint ? m.hint : 'A month in the annual calendar'
  }))

  // 2 Seasons
  const seasonsPool = shuffle(vocabularyData.seasons || []).slice(0, 2).map(s => ({
    word: s.name,
    category: 'Season',
    hint: s.hint || 'A nature season cycle'
  }))

  // 2 Holidays
  const holidaysPool = shuffle(vocabularyData.holidays || []).slice(0, 2).map(h => ({
    word: h.name,
    category: 'Holiday',
    hint: h.hint || 'A festive cultural celebration'
  }))

  return shuffle([...daysPool, ...monthsPool, ...seasonsPool, ...holidaysPool])
}

// Load current word
const loadWord = () => {
  guessedLetters.value = new Set()
  isTransitioning.value = false
  if (currentWordData.value) {
    dialogueMessage.value = `* Word ${solvedCount.value + 1}/10: A mystery ${currentWordData.value.category.toLowerCase()} appears!`
  }
}

// Handle letter guess
const handleGuess = (letter) => {
  if (isVictory.value || isGameOver.value || isTransitioning.value || guessedLetters.value.has(letter)) {
    return
  }

  // Register guess
  guessedLetters.value.add(letter)

  const isCorrect = requiredLetters.value.has(letter)

  if (isCorrect) {
    dialogueMessage.value = `* Correct! The letter "${letter}" shines through the darkness.`

    // Check if the entire word has been solved
    const wordComplete = [...requiredLetters.value].every(c => guessedLetters.value.has(c))
    if (wordComplete) {
      handleWordSolved()
    }
  } else {
    // Letter wrong: execute takeDamage(2)
    takeDamage(damagePerFail)
    dialogueMessage.value = `* Miss! "${letter}" is not in this word. You took ${damagePerFail} damage!`

    // Screen shake & red damage flash
    isShaking.value = true
    isRedFlash.value = true

    setTimeout(() => {
      isRedFlash.value = false
    }, 250)

    setTimeout(() => {
      isShaking.value = false
    }, 400)
  }
}

// Handle Word Solved
const handleWordSolved = () => {
  isTransitioning.value = true
  
  // Requirement: execute addScore(150)
  addScore(150)
  solvedCount.value++

  dialogueMessage.value = `* SOLVED! "${currentWordData.value.word}" completed! (+150 pts)`

  // Check if all 10 words completed: execute completeLevel(3)
  if (solvedCount.value >= totalWords) {
    completeLevel(3)
    setTimeout(() => {
      isVictory.value = true
    }, 800)
  } else {
    // Advance to next word
    setTimeout(() => {
      currentWordIndex.value++
      loadWord()
    }, 900)
  }
}

// Virtual keyboard styling
const getKeyClass = (key) => {
  if (!guessedLetters.value.has(key)) {
    return 'bg-black border-white text-white hover:border-undertale-yellow hover:text-undertale-yellow'
  }

  const wasCorrect = requiredLetters.value.has(key)
  if (wasCorrect) {
    return 'bg-green-950/60 border-undertale-green text-undertale-green opacity-80 cursor-not-allowed'
  } else {
    return 'bg-black border-gray-800 text-gray-600 opacity-40 cursor-not-allowed'
  }
}

// Start New Game
const startNewGame = () => {
  startLevel()
  wordsList.value = buildWordsPool()
  currentWordIndex.value = 0
  solvedCount.value = 0
  isVictory.value = false
  loadWord()
}

// Physical keyboard typing support
const handlePhysicalKey = (e) => {
  if (isVictory.value || isGameOver.value || isTransitioning.value) return
  const char = e.key.toUpperCase()
  if (/^[A-Z]$/.test(char)) {
    handleGuess(char)
  }
}

onMounted(() => {
  startNewGame()
  window.addEventListener('keydown', handlePhysicalKey)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handlePhysicalKey)
})
</script>
