<template>
  <div class="w-full max-w-2xl mx-auto flex flex-col items-center justify-between min-h-[90vh] py-4 px-3 sm:px-6">
    <!-- Top HUD: Undertale Style -->
    <header class="w-full flex items-center justify-between border-b-2 border-white pb-3 mb-4">
      <button 
        @click="$emit('back-to-menu')" 
        class="text-xs sm:text-sm tracking-wider uppercase text-gray-300 hover:text-undertale-yellow transition-colors flex items-center gap-1 py-1 px-2 border border-transparent hover:border-undertale-yellow"
      >
        <span>&lt;</span> MENU
      </button>

      <div class="text-xs sm:text-sm tracking-widest text-center">
        <span class="text-undertale-yellow">LV 2</span>
        <span class="ml-2 text-white">PAIRS: {{ matchedPairCount }}/{{ totalPairs }}</span>
      </div>

      <div class="text-xs sm:text-sm text-right flex items-center gap-2">
        <span class="text-gray-400">EXP:</span>
        <span class="text-undertale-yellow font-bold">{{ expEarned }}</span>
      </div>
    </header>

    <!-- Game Content -->
    <div v-if="!isVictory && !isGameOver" class="w-full flex-1 flex flex-col justify-between">
      <!-- Undertale Dialogue Box / Instruction Banner -->
      <section class="pixel-box p-3 sm:p-4 mb-4">
        <div class="flex items-start gap-2">
          <span class="text-undertale-yellow text-sm sm:text-base select-none">*</span>
          <p class="text-[11px] sm:text-xs leading-relaxed text-white">
            {{ dialogueMessage }}
          </p>
        </div>

        <!-- Mode selector & Pair Counter -->
        <div class="mt-2 pt-2 border-t border-gray-800 flex justify-between items-center text-[10px] text-gray-400">
          <span class="uppercase tracking-wider">QUEST: {{ currentModeName }}</span>
          <span class="text-undertale-yellow">TAP ONE FROM EACH SIDE</span>
        </div>
      </section>

      <!-- Two-Column Matching Board (Grid 2 columns) -->
      <main class="w-full grid grid-cols-2 gap-2 sm:gap-4 my-auto">
        <!-- Column A: Concepts (Holidays / Seasons) -->
        <div class="flex flex-col gap-2 sm:gap-3" role="region" aria-label="Concept Column A">
          <div class="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest text-center pb-1 border-b border-gray-800">
            {{ columnATitle }}
          </div>

          <button
            v-for="item in columnAItems"
            :key="item.id"
            @click="handleSelectA(item)"
            :disabled="item.isMatched || isEvaluating"
            :class="[
              'undertale-btn w-full p-2 sm:p-3 text-left text-[11px] sm:text-xs flex items-center relative min-h-[52px] sm:min-h-[58px] transition-all duration-200',
              getItemStateClass(item, 'A')
            ]"
          >
            <!-- Red Soul Heart Indicator -->
            <span 
              class="text-undertale-red text-sm sm:text-base mr-1.5 sm:mr-2 select-none inline-flex items-center"
              :class="{
                'opacity-100 scale-110 soul-pulse': selectedA?.id === item.id,
                'opacity-0': selectedA?.id !== item.id
              }"
              aria-hidden="true"
            >
              ❤
            </span>

            <span class="break-words line-clamp-2 leading-tight">
              {{ item.text }}
            </span>
          </button>
        </div>

        <!-- Column B: Matches (Months / Weather) -->
        <div class="flex flex-col gap-2 sm:gap-3" role="region" aria-label="Concept Column B">
          <div class="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest text-center pb-1 border-b border-gray-800">
            {{ columnBTitle }}
          </div>

          <button
            v-for="item in columnBItems"
            :key="item.id"
            @click="handleSelectB(item)"
            :disabled="item.isMatched || isEvaluating"
            :class="[
              'undertale-btn w-full p-2 sm:p-3 text-left text-[11px] sm:text-xs flex items-center relative min-h-[52px] sm:min-h-[58px] transition-all duration-200',
              getItemStateClass(item, 'B')
            ]"
          >
            <!-- Red Soul Heart Indicator -->
            <span 
              class="text-undertale-red text-sm sm:text-base mr-1.5 sm:mr-2 select-none inline-flex items-center"
              :class="{
                'opacity-100 scale-110 soul-pulse': selectedB?.id === item.id,
                'opacity-0': selectedB?.id !== item.id
              }"
              aria-hidden="true"
            >
              ❤
            </span>

            <span class="break-words line-clamp-2 leading-tight">
              {{ item.text }}
            </span>
          </button>
        </div>
      </main>

      <!-- Bottom Status & HP Bar -->
      <footer class="w-full flex items-center justify-between text-xs py-3 border-t border-gray-800 mt-4">
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

        <!-- Action / Switch Mode helper -->
        <div class="flex items-center gap-2">
          <button 
            @click="switchMode" 
            class="text-[10px] text-undertale-yellow hover:underline tracking-wider"
          >
            [CHANGE TOPIC]
          </button>
        </div>
      </footer>
    </div>

    <!-- Victory Screen (Undertale dialogue box) -->
    <div v-else-if="isVictory" class="w-full flex-1 flex flex-col justify-center items-center text-center">
      <div class="pixel-box p-6 sm:p-8 w-full max-w-md">
        <div class="text-undertale-red text-4xl mb-3 soul-pulse select-none">❤</div>

        <h2 class="text-base sm:text-lg text-undertale-yellow mb-2 tracking-wider">
          YOU WON!
        </h2>
        
        <p class="text-xs text-white mb-4 leading-relaxed">
          YOU EARNED {{ expEarned }} EXP AND 30 GOLD.
        </p>

        <div class="border-t border-b border-gray-700 py-3 mb-6 text-xs text-gray-300 space-y-1.5 text-left">
          <div class="flex justify-between">
            <span class="text-gray-400">Total Pairs:</span>
            <span>{{ totalPairs }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Mistakes:</span>
            <span :class="mistakes === 0 ? 'text-undertale-green' : 'text-undertale-red'">{{ mistakes }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Remaining HP:</span>
            <span class="text-undertale-yellow">{{ hp }} / {{ maxHp }}</span>
          </div>
        </div>

        <p class="text-[11px] text-gray-300 italic mb-6">
          * Your soul vibrates with knowledge of the calendar.
        </p>

        <div class="flex flex-col gap-3">
          <button 
            @click="startNewGame" 
            class="undertale-btn justify-center py-3 text-xs sm:text-sm text-undertale-yellow border-undertale-yellow hover:bg-yellow-950/30"
          >
            <span class="text-undertale-red mr-2">❤</span> PLAY ANOTHER SET
          </button>
          
          <button 
            @click="$emit('back-to-menu')" 
            class="undertale-btn justify-center py-3 text-xs sm:text-sm text-white hover:border-white"
          >
            MAIN MENU
          </button>
        </div>
      </div>
    </div>

    <!-- Game Over Screen -->
    <div v-else-if="isGameOver" class="w-full flex-1 flex flex-col justify-center items-center text-center">
      <div class="pixel-box p-6 sm:p-8 w-full max-w-md">
        <div class="text-gray-600 text-4xl mb-3 select-none">💔</div>

        <h2 class="text-base sm:text-lg text-undertale-red mb-2 tracking-wider">
          GAME OVER
        </h2>

        <p class="text-xs text-gray-300 leading-relaxed mb-6">
          * You cannot give up just yet... Frisk! Stay determined!
        </p>

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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import vocabularyData from '../data.json'

const emit = defineEmits(['back-to-menu'])

// Configuration
const maxHp = 20
const pairsPerGame = 4

// State
const hp = ref(maxHp)
const expEarned = ref(0)
const mistakes = ref(0)
const isEvaluating = ref(false)
const dialogueMessage = ref('Touch a concept from Column A, then its matching pair from Column B.')

// Selection state
const selectedA = ref(null)
const selectedB = ref(null)
const evaluationResult = ref(null) // null | 'correct' | 'wrong'

// Items in current round
const columnAItems = ref([])
const columnBItems = ref([])

// Current mode: 'holidays' or 'seasons'
const currentMode = ref('holidays')

const currentModeName = computed(() => {
  return currentMode.value === 'holidays' ? 'Holidays & Months' : 'Seasons & Weather'
})

const columnATitle = computed(() => {
  return currentMode.value === 'holidays' ? 'Holidays' : 'Seasons'
})

const columnBTitle = computed(() => {
  return currentMode.value === 'holidays' ? 'Months' : 'Weather'
})

const totalPairs = computed(() => columnAItems.value.length)

const matchedPairCount = computed(() => {
  return columnAItems.value.filter(item => item.isMatched).length
})

const isVictory = computed(() => {
  return totalPairs.value > 0 && matchedPairCount.value === totalPairs.value
})

const isGameOver = computed(() => {
  return hp.value <= 0
})

// Helper: Shuffle array
const shuffle = (array) => {
  return [...array].sort(() => Math.random() - 0.5)
}

// Prepare Game Data
const setupGameData = () => {
  selectedA.value = null
  selectedB.value = null
  evaluationResult.value = null
  isEvaluating.value = false

  if (currentMode.value === 'holidays') {
    // Pick pairsPerGame random holidays from vocabularyData
    const pool = shuffle(vocabularyData.holidays || [])
    const selected = pool.slice(0, pairsPerGame)

    const listA = selected.map((h, idx) => ({
      id: `h_${idx}`,
      pairKey: `pair_${idx}`,
      text: h.name,
      isMatched: false
    }))

    const listB = selected.map((h, idx) => ({
      id: `m_${idx}`,
      pairKey: `pair_${idx}`,
      text: h.month,
      isMatched: false
    }))

    columnAItems.value = shuffle(listA)
    columnBItems.value = shuffle(listB)
    dialogueMessage.value = '* Match each sacred holiday with its celebrated month.'
  } else {
    // Seasons mode: Season -> Weather
    const pool = shuffle(vocabularyData.seasons || [])
    const selected = pool.slice(0, Math.min(pairsPerGame, pool.length))

    const listA = selected.map((s, idx) => ({
      id: `s_${idx}`,
      pairKey: `pair_s_${idx}`,
      text: s.name,
      isMatched: false
    }))

    const listB = selected.map((s, idx) => ({
      id: `w_${idx}`,
      pairKey: `pair_s_${idx}`,
      text: `Weather: ${s.weather}`,
      isMatched: false
    }))

    columnAItems.value = shuffle(listA)
    columnBItems.value = shuffle(listB)
    dialogueMessage.value = '* Pair the nature cycle with its typical weather.'
  }
}

// Select item in Column A
const handleSelectA = (item) => {
  if (isEvaluating.value || item.isMatched) return

  if (selectedA.value?.id === item.id) {
    selectedA.value = null // Deselect if tapped again
    return
  }

  selectedA.value = item

  // If both columns have a selection, evaluate pair!
  if (selectedB.value) {
    evaluatePair()
  }
}

// Select item in Column B
const handleSelectB = (item) => {
  if (isEvaluating.value || item.isMatched) return

  if (selectedB.value?.id === item.id) {
    selectedB.value = null // Deselect if tapped again
    return
  }

  selectedB.value = item

  // If both columns have a selection, evaluate pair!
  if (selectedA.value) {
    evaluatePair()
  }
}

// Pair Evaluation
const evaluatePair = () => {
  isEvaluating.value = true
  const itemA = selectedA.value
  const itemB = selectedB.value

  const isMatch = itemA.pairKey === itemB.pairKey

  if (isMatch) {
    evaluationResult.value = 'correct'
    dialogueMessage.value = `* Correct! "${itemA.text}" matches with "${itemB.text}".`
    expEarned.value += 50

    // After brief flash, mark both items as matched & invisible/inactive
    setTimeout(() => {
      itemA.isMatched = true
      itemB.isMatched = true
      selectedA.value = null
      selectedB.value = null
      evaluationResult.value = null
      isEvaluating.value = false

      if (matchedPairCount.value < totalPairs.value) {
        dialogueMessage.value = '* Great pairing! Keep going, human.'
      }
    }, 600)
  } else {
    evaluationResult.value = 'wrong'
    mistakes.value++
    hp.value = Math.max(0, hp.value - 4)
    dialogueMessage.value = `* Miss! "${itemA.text}" and "${itemB.text}" do not belong together.`

    // After brief red flash, unmark both items
    setTimeout(() => {
      selectedA.value = null
      selectedB.value = null
      evaluationResult.value = null
      isEvaluating.value = false
    }, 600)
  }
}

// Button visual states
const getItemStateClass = (item, column) => {
  // If matched, make inactive and invisible/faded
  if (item.isMatched) {
    return 'opacity-0 pointer-events-none'
  }

  const isSelected = (column === 'A' && selectedA.value?.id === item.id) ||
                     (column === 'B' && selectedB.value?.id === item.id)

  if (isSelected) {
    if (evaluationResult.value === 'correct') {
      return '!border-undertale-green !text-undertale-green bg-green-950/50 shadow-[0_0_12px_rgba(0,255,0,0.5)]'
    }
    if (evaluationResult.value === 'wrong') {
      return '!border-undertale-red !text-undertale-red bg-red-950/50 shadow-[0_0_12px_rgba(255,0,0,0.5)]'
    }
    return '!border-undertale-yellow !text-undertale-yellow bg-yellow-950/30'
  }

  return 'border-white text-white hover:border-undertale-yellow hover:text-undertale-yellow'
}

// Change mode between Holidays and Seasons
const switchMode = () => {
  currentMode.value = currentMode.value === 'holidays' ? 'seasons' : 'holidays'
  startNewGame()
}

// Reset Game
const startNewGame = () => {
  hp.value = maxHp
  expEarned.value = 0
  mistakes.value = 0
  setupGameData()
}

onMounted(() => {
  startNewGame()
})
</script>
