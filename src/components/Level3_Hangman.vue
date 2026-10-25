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

    <!-- Top HUD: Undertale Style -->
    <header class="w-full flex items-center justify-between border-b-2 border-white pb-3 mb-4">
      <button 
        @click="$emit('back-to-menu')" 
        class="text-xs sm:text-sm tracking-wider uppercase text-gray-300 hover:text-undertale-yellow transition-colors flex items-center gap-1 py-1 px-2 border border-transparent hover:border-undertale-yellow"
      >
        <span>&lt;</span> MENU
      </button>

      <div class="text-xs sm:text-sm tracking-widest text-center">
        <span class="text-undertale-yellow">LV 3</span>
        <span class="ml-2 text-white">SOUL HANGMAN</span>
      </div>

      <div class="text-xs sm:text-sm text-right flex items-center gap-2">
        <span class="text-gray-400">EXP:</span>
        <span class="text-undertale-yellow font-bold">{{ totalExp }}</span>
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
          <span class="uppercase tracking-wider">CATEGORY: <span class="text-undertale-yellow">{{ currentWordCategory }}</span></span>
          <span class="text-gray-400">WORD #{{ wordStreak + 1 }}</span>
        </div>
      </section>

      <!-- Center Stage: The Soul & Hidden Word Display -->
      <section class="my-auto flex flex-col items-center justify-center py-4">
        <!-- Undertale Soul Lifeline Representation -->
        <div class="mb-4 flex items-center gap-2">
          <span 
            class="text-undertale-red text-2xl sm:text-3xl select-none transition-transform"
            :class="{ 'soul-pulse': hp > 8, 'animate-bounce': hp <= 8 }"
          >
            ❤
          </span>
          <div class="flex gap-1">
            <span 
              v-for="i in maxStrikes" 
              :key="i"
              class="inline-block w-3 h-3 border border-white"
              :class="i <= remainingStrikes ? 'bg-undertale-red' : 'bg-transparent border-gray-700'"
            ></span>
          </div>
        </div>

        <!-- Hidden Word Slots -->
        <div class="flex flex-wrap justify-center gap-1.5 sm:gap-3 px-2 max-w-full" role="region" aria-label="Hidden word">
          <div
            v-for="(char, index) in targetLetters"
            :key="index"
            class="min-w-[28px] sm:min-w-[38px] h-11 sm:h-14 border-b-4 flex items-center justify-center text-sm sm:text-xl font-bold tracking-wider transition-colors duration-200"
            :class="[
              guessedLetters.has(char.toUpperCase())
                ? 'border-undertale-yellow text-undertale-yellow' 
                : 'border-white text-transparent'
            ]"
          >
            {{ guessedLetters.has(char.toUpperCase()) ? char.toUpperCase() : '_' }}
          </div>
        </div>
      </section>

      <!-- Virtual QWERTY Keyboard -->
      <section class="w-full flex flex-col items-center gap-1.5 sm:gap-2 mb-3" aria-label="Virtual keyboard">
        <!-- QWERTY Row 1 -->
        <div class="flex justify-center gap-1 sm:gap-1.5 w-full max-w-xl">
          <button
            v-for="key in row1"
            :key="key"
            @click="handleGuess(key)"
            :disabled="guessedLetters.has(key)"
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
            :disabled="guessedLetters.has(key)"
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
            :disabled="guessedLetters.has(key)"
            :class="[
              'min-h-[48px] sm:min-h-[50px] flex-1 max-w-[38px] sm:max-w-[48px] text-[11px] sm:text-xs font-bold border-2 flex items-center justify-center rounded-none transition-all active:scale-95',
              getKeyClass(key)
            ]"
          >
            {{ key }}
          </button>
        </div>
      </section>

      <!-- Bottom Status & HP Bar -->
      <footer class="w-full flex items-center justify-between text-xs py-2 border-t border-gray-800">
        <div class="flex items-center gap-2">
          <span class="text-xs text-undertale-red font-bold">HP</span>
          <div class="w-24 sm:w-32 h-4 bg-red-900 border border-white relative overflow-hidden">
            <div 
              class="h-full bg-undertale-yellow transition-all duration-300"
              :style="{ width: `${(hp / maxHp) * 100}%` }"
            ></div>
          </div>
          <span class="text-[10px] text-gray-300">{{ hp }} / {{ maxHp }}</span>
        </div>

        <div class="text-[10px] text-gray-400">
          WRONG: <span class="text-undertale-red">{{ wrongGuesses.length }}/{{ maxStrikes }}</span>
        </div>
      </footer>
    </main>

    <!-- VICTORY SCREEN -->
    <main v-else-if="isVictory" class="w-full flex-1 flex flex-col justify-center items-center text-center">
      <div class="pixel-box p-6 sm:p-8 w-full max-w-md">
        <div class="text-undertale-red text-4xl mb-3 soul-pulse select-none">❤</div>

        <h2 class="text-base sm:text-lg text-undertale-yellow mb-2 tracking-wider">
          YOU WON!
        </h2>
        
        <p class="text-xs text-white mb-4 leading-relaxed">
          YOU EARNED 150 EXP AND 40 GOLD.
        </p>

        <div class="border-t border-b border-gray-700 py-3 mb-6 text-xs text-gray-300 space-y-2 text-left">
          <div class="flex justify-between">
            <span class="text-gray-400">Word Solved:</span>
            <span class="text-undertale-yellow font-bold uppercase">{{ currentWord }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Category:</span>
            <span>{{ currentWordCategory }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Remaining HP:</span>
            <span class="text-undertale-green">{{ hp }} / {{ maxHp }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Total EXP:</span>
            <span class="text-undertale-yellow font-bold">{{ totalExp }}</span>
          </div>
        </div>

        <p class="text-[11px] text-gray-300 italic mb-6">
          * Knowing the calendar fills you with DETERMINATION.
        </p>

        <div class="flex flex-col gap-3">
          <button 
            @click="nextWord" 
            class="undertale-btn justify-center py-3 text-xs sm:text-sm text-undertale-yellow border-undertale-yellow hover:bg-yellow-950/30"
          >
            <span class="text-undertale-red mr-2">❤</span> NEXT WORD
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

    <!-- GAME OVER SCREEN (Undertale Soul Break) -->
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
            <span class="text-undertale-yellow font-bold uppercase">{{ currentWord }}</span>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <button 
            @click="restartHangman" 
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

const emit = defineEmits(['back-to-menu'])

// QWERTY keyboard rows
const row1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P']
const row2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L']
const row3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M']

// Game configuration
const maxHp = 20
const damagePerStrike = 4
const maxStrikes = 5

// State
const hp = ref(maxHp)
const totalExp = ref(0)
const wordStreak = ref(0)
const dialogueMessage = ref('Touch a letter to guess the secret calendar word.')
const isShaking = ref(false)
const isRedFlash = ref(false)

// Current Word data
const currentWord = ref('')
const currentWordCategory = ref('')
const guessedLetters = ref(new Set())
const wrongGuesses = ref([])

// Target word splitted into letters
const targetLetters = computed(() => {
  return currentWord.value.split('')
})

const uniqueWordLetters = computed(() => {
  return new Set(targetLetters.value.map(c => c.toUpperCase()))
})

const remainingStrikes = computed(() => {
  return Math.max(0, maxStrikes - wrongGuesses.value.length)
})

// Victory condition: every unique letter has been guessed
const isVictory = computed(() => {
  if (!currentWord.value) return false
  return [...uniqueWordLetters.value].every(char => guessedLetters.value.has(char))
})

// Game Over condition: HP reached 0 or strikes exhausted
const isGameOver = computed(() => {
  return hp.value <= 0 || wrongGuesses.value.length >= maxStrikes
})

// Build vocabulary dictionary
const wordPool = computed(() => {
  const pool = []

  // Days
  const days = vocabularyData.days || [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ]
  days.forEach(d => pool.push({ word: d, category: 'Day of the Week' }))

  // Months
  const months = vocabularyData.months || [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  months.forEach(m => pool.push({ word: m, category: 'Month of the Year' }))

  // Seasons
  const seasons = (vocabularyData.seasons || []).map(s => s.name)
  seasons.forEach(s => pool.push({ word: s, category: 'Season' }))

  return pool
})

// Select a random new word
const pickNewWord = () => {
  const pool = wordPool.value
  const item = pool[Math.floor(Math.random() * pool.length)]
  currentWord.value = item.word
  currentWordCategory.value = item.category
  guessedLetters.value = new Set()
  wrongGuesses.value = []
  dialogueMessage.value = `* A mysterious ${item.category.toLowerCase()} blocks your path. Guess its name!`
}

// Handle letter guess
const handleGuess = (letter) => {
  if (isVictory.value || isGameOver.value || guessedLetters.value.has(letter)) {
    return
  }

  // Register guess
  guessedLetters.value.add(letter)

  const isCorrect = uniqueWordLetters.value.has(letter)

  if (isCorrect) {
    dialogueMessage.value = `* Correct! The letter "${letter}" shines through the darkness.`
    // Check if won
    if (isVictory.value) {
      totalExp.value += 150
      wordStreak.value++
    }
  } else {
    wrongGuesses.value.push(letter)
    hp.value = Math.max(0, hp.value - damagePerStrike)
    dialogueMessage.value = `* Miss! "${letter}" is not in this word. Your soul takes damage!`

    // Trigger Screen Shake & Red Flash
    triggerDamageFeedback()
  }
}

// Shake screen and flash red
const triggerDamageFeedback = () => {
  isShaking.value = true
  isRedFlash.value = true

  setTimeout(() => {
    isRedFlash.value = false
  }, 250)

  setTimeout(() => {
    isShaking.value = false
  }, 400)
}

// Key style in virtual keyboard
const getKeyClass = (key) => {
  if (!guessedLetters.value.has(key)) {
    return 'bg-black border-white text-white hover:border-undertale-yellow hover:text-undertale-yellow'
  }

  const wasCorrect = uniqueWordLetters.value.has(key)
  if (wasCorrect) {
    return 'bg-green-950/60 border-undertale-green text-undertale-green opacity-80 cursor-not-allowed'
  } else {
    return 'bg-black border-gray-800 text-gray-600 opacity-40 cursor-not-allowed'
  }
}

// Next word upon victory
const nextWord = () => {
  hp.value = maxHp
  pickNewWord()
}

// Restart Hangman after Game Over
const restartHangman = () => {
  hp.value = maxHp
  totalExp.value = 0
  wordStreak.value = 0
  pickNewWord()
}

// Support physical keyboard typing
const handlePhysicalKey = (e) => {
  if (isVictory.value || isGameOver.value) return
  const char = e.key.toUpperCase()
  if (/^[A-Z]$/.test(char)) {
    handleGuess(char)
  }
}

onMounted(() => {
  pickNewWord()
  window.addEventListener('keydown', handlePhysicalKey)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handlePhysicalKey)
})
</script>
