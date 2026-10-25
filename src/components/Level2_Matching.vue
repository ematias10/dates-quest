<template>
  <div 
    class="w-full max-w-2xl mx-auto flex flex-col items-center justify-between min-h-[90vh] py-4 px-3 sm:px-6 relative select-none"
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
        <span class="text-undertale-yellow">LV 2</span>
        <span class="ml-2 text-white">BOARD: {{ currentBoardIndex + 1 }}/{{ totalBoards }}</span>
      </div>

      <div class="text-xs sm:text-sm text-right flex items-center gap-2">
        <span class="text-gray-400">SCORE:</span>
        <span class="text-undertale-yellow font-bold">{{ score }}</span>
      </div>
    </header>

    <!-- Game Content: Active Matching Board -->
    <div v-if="!isVictory && !isGameOver" class="w-full flex-1 flex flex-col justify-between">
      
      <!-- Undertale Dialogue Box / Instruction Banner -->
      <section class="pixel-box p-3 sm:p-4 mb-4">
        <div class="flex items-start gap-2">
          <span class="text-undertale-yellow text-sm sm:text-base select-none">*</span>
          <p class="text-[11px] sm:text-xs leading-relaxed text-white min-h-[2.5rem] flex items-center">
            {{ dialogueMessage }}
          </p>
        </div>

        <!-- Board Indicator & Instructions -->
        <div class="mt-2 pt-2 border-t border-gray-800 flex justify-between items-center text-[10px] text-gray-400">
          <span class="uppercase tracking-wider text-undertale-yellow font-bold">
            {{ currentBoardTitle }}
          </span>
          <span class="text-gray-300">PAIRS: {{ matchedPairCount }}/4</span>
        </div>
      </section>

      <!-- Two-Column Matching Board (Grid 2 columns) -->
      <main class="w-full grid grid-cols-2 gap-2 sm:gap-4 my-auto">
        <!-- Column A: Left items -->
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

        <!-- Column B: Right items -->
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

      <!-- Bottom Status & HP Bar (Bound to useGameState currentHP) -->
      <footer class="w-full flex items-center justify-between text-xs py-3 border-t border-gray-800 mt-4">
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
          <span v-if="combo > 1" class="text-undertale-yellow font-bold mr-2">
            COMBO x{{ combo }}!
          </span>
          CLEARED: <span class="text-undertale-yellow font-bold">{{ currentBoardIndex }}/{{ totalBoards }}</span>
        </div>
      </footer>
    </div>

    <!-- Victory Screen (Triggered after Board 4 is cleared) -->
    <main v-else-if="isVictory" class="w-full flex-1 flex flex-col justify-center items-center text-center">
      <div class="pixel-box p-6 sm:p-8 w-full max-w-md">
        <div class="text-undertale-red text-4xl mb-3 soul-pulse select-none">❤</div>

        <h2 class="text-base sm:text-lg text-undertale-yellow mb-2 tracking-wider">
          LEVEL 2 COMPLETE!
        </h2>
        
        <p class="text-xs text-white mb-4 leading-relaxed">
          ALL 4 BOARDS CLEARED!
        </p>

        <div class="border-t border-b border-gray-700 py-3 mb-6 text-xs text-gray-300 space-y-1.5 text-left">
          <div class="flex justify-between">
            <span class="text-gray-400">Boards Completed:</span>
            <span class="text-undertale-yellow font-bold">4 / 4 Sequence</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Perfect Run:</span>
            <span :class="isLevelPerfect ? 'text-undertale-green font-bold' : 'text-gray-400'">
              {{ isLevelPerfect ? 'YES (+1000 BONUS)' : 'NO' }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Remaining HP:</span>
            <span class="text-undertale-yellow">{{ currentHP }} / 20</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Final Score:</span>
            <span class="text-undertale-yellow font-bold">{{ score }}</span>
          </div>
        </div>

        <p class="text-[11px] text-gray-300 italic mb-6">
          * Your connection to the calendar grows stronger. Stay DETERMINED!
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

    <!-- Game Over Screen (currentHP reached 0) -->
    <main v-else-if="isGameOver" class="w-full flex-1 flex flex-col justify-center items-center text-center">
      <div class="pixel-box p-6 sm:p-8 w-full max-w-md">
        <div class="flex justify-center items-center gap-2 mb-4">
          <span class="text-undertale-red text-3xl select-none inline-block transform -rotate-12">💔</span>
        </div>

        <h2 class="text-base sm:text-lg text-undertale-red mb-2 tracking-wider">
          GAME OVER
        </h2>

        <p class="text-xs text-gray-300 leading-relaxed mb-6">
          * You cannot give up just yet... Frisk! Stay determined!
        </p>

        <div class="border-t border-b border-gray-700 py-3 mb-6 text-xs text-left">
          <div class="flex justify-between">
            <span class="text-gray-400">Failed at:</span>
            <span class="text-undertale-yellow font-bold">Board {{ currentBoardIndex + 1 }} / 4</span>
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
import { ref, computed, onMounted } from 'vue'
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

// Level Configuration
const totalBoards = 4
const pairsPerBoard = 4
const damagePerFail = 3

// Board Sequence State: 0 (Days), 1 (Months), 2 (Holidays), 3 (Seasons)
const currentBoardIndex = ref(0)
const isEvaluating = ref(false)
const dialogueMessage = ref('Touch a concept from Column A, then its matching pair from Column B.')

// Visual animation states
const isShaking = ref(false)
const isRedFlash = ref(false)
const isVictory = ref(false)

// Selections
const selectedA = ref(null)
const selectedB = ref(null)
const evaluationResult = ref(null) // null | 'correct' | 'wrong'

// Items in current board
const columnAItems = ref([])
const columnBItems = ref([])

const isGameOver = computed(() => {
  return currentHP.value <= 0
})

const matchedPairCount = computed(() => {
  return columnAItems.value.filter(item => item.isMatched).length
})

// Current Board Information
const currentBoardTitle = computed(() => {
  switch (currentBoardIndex.value) {
    case 0: return 'BOARD 1: DAYS (EN ↔ ES)'
    case 1: return 'BOARD 2: MONTHS (EN ↔ ES)'
    case 2: return 'BOARD 3: HOLIDAYS & MONTHS'
    case 3: return 'BOARD 4: MONTHS & SEASONS'
    default: return ''
  }
})

const columnATitle = computed(() => {
  switch (currentBoardIndex.value) {
    case 0: return 'Days (EN)'
    case 1: return 'Months (EN)'
    case 2: return 'Holidays'
    case 3: return 'Months'
    default: return 'Concept A'
  }
})

const columnBTitle = computed(() => {
  switch (currentBoardIndex.value) {
    case 0: return 'Días (ES)'
    case 1: return 'Meses (ES)'
    case 2: return 'Months'
    case 3: return 'Seasons'
    default: return 'Concept B'
  }
})

// Helper: Shuffle array
const shuffle = (array) => {
  return [...array].sort(() => Math.random() - 0.5)
}

/**
 * Builds the board for the current index:
 * Board 0: Days EN vs Days ES
 * Board 1: Months EN vs Months ES
 * Board 2: Holidays vs Months
 * Board 3: Months vs Seasons
 */
const setupBoard = () => {
  selectedA.value = null
  selectedB.value = null
  evaluationResult.value = null
  isEvaluating.value = false

  if (currentBoardIndex.value === 0) {
    // Board 1: Days (English vs Spanish)
    const pool = shuffle(vocabularyData.days || [])
    const selected = pool.slice(0, pairsPerBoard)

    const listA = selected.map((d, idx) => ({
      id: `d_en_${idx}`,
      pairKey: `day_${typeof d === 'string' ? d : d.name}`,
      text: typeof d === 'string' ? d : d.name,
      isMatched: false
    }))

    const listB = selected.map((d, idx) => ({
      id: `d_es_${idx}`,
      pairKey: `day_${typeof d === 'string' ? d : d.name}`,
      text: typeof d === 'object' && d.translation ? d.translation : (typeof d === 'string' ? d : d.name),
      isMatched: false
    }))

    columnAItems.value = shuffle(listA)
    columnBItems.value = shuffle(listB)
    dialogueMessage.value = '* Match each English day of the week with its Spanish translation.'

  } else if (currentBoardIndex.value === 1) {
    // Board 2: Months (English vs Spanish)
    const pool = shuffle(vocabularyData.months || [])
    const selected = pool.slice(0, pairsPerBoard)

    const listA = selected.map((m, idx) => ({
      id: `m_en_${idx}`,
      pairKey: `month_${typeof m === 'string' ? m : m.name}`,
      text: typeof m === 'string' ? m : m.name,
      isMatched: false
    }))

    const listB = selected.map((m, idx) => ({
      id: `m_es_${idx}`,
      pairKey: `month_${typeof m === 'string' ? m : m.name}`,
      text: typeof m === 'object' && m.translation ? m.translation : (typeof m === 'string' ? m : m.name),
      isMatched: false
    }))

    columnAItems.value = shuffle(listA)
    columnBItems.value = shuffle(listB)
    dialogueMessage.value = '* Match each English month with its Spanish translation.'

  } else if (currentBoardIndex.value === 2) {
    // Board 3: Holidays vs Months
    const pool = shuffle(vocabularyData.holidays || [])
    const selected = pool.slice(0, pairsPerBoard)

    const listA = selected.map((h, idx) => ({
      id: `h_${idx}`,
      pairKey: `holiday_${idx}`,
      text: h.name,
      isMatched: false
    }))

    const listB = selected.map((h, idx) => ({
      id: `m_${idx}`,
      pairKey: `holiday_${idx}`,
      text: h.month,
      isMatched: false
    }))

    columnAItems.value = shuffle(listA)
    columnBItems.value = shuffle(listB)
    dialogueMessage.value = '* Match each sacred holiday with the month in which it is celebrated.'

  } else if (currentBoardIndex.value === 3) {
    // Board 4: Months vs Seasons (4 distinct seasons, 1 distinct month from each)
    const seasonsPool = vocabularyData.seasons || []
    
    // Pick 1 representative month from each of the 4 seasons
    const pairs = seasonsPool.slice(0, 4).map((season, idx) => {
      const monthPicked = season.months[Math.floor(Math.random() * season.months.length)]
      return {
        month: monthPicked,
        season: season.name,
        pairKey: `season_${season.name}`
      }
    })

    const listA = pairs.map((p, idx) => ({
      id: `sm_${idx}`,
      pairKey: p.pairKey,
      text: p.month,
      isMatched: false
    }))

    const listB = pairs.map((p, idx) => ({
      id: `ss_${idx}`,
      pairKey: p.pairKey,
      text: p.season,
      isMatched: false
    }))

    columnAItems.value = shuffle(listA)
    columnBItems.value = shuffle(listB)
    dialogueMessage.value = '* Match each month with its corresponding nature season.'
  }
}

// Select item in Column A
const handleSelectA = (item) => {
  if (isEvaluating.value || item.isMatched || isGameOver.value) return

  if (selectedA.value?.id === item.id) {
    selectedA.value = null // Deselect if tapped again
    return
  }

  selectedA.value = item

  // If both columns selected, evaluate!
  if (selectedB.value) {
    evaluatePair()
  }
}

// Select item in Column B
const handleSelectB = (item) => {
  if (isEvaluating.value || item.isMatched || isGameOver.value) return

  if (selectedB.value?.id === item.id) {
    selectedB.value = null // Deselect if tapped again
    return
  }

  selectedB.value = item

  // If both columns selected, evaluate!
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
    
    // Connect to global state: addScore(50)
    addScore(50)

    // Brief green flash then mark as matched
    setTimeout(() => {
      itemA.isMatched = true
      itemB.isMatched = true
      selectedA.value = null
      selectedB.value = null
      evaluationResult.value = null
      isEvaluating.value = false

      // Check if current board is cleared
      if (matchedPairCount.value >= pairsPerBoard) {
        handleBoardCleared()
      }
    }, 600)

  } else {
    // Incorrect match
    evaluationResult.value = 'wrong'
    dialogueMessage.value = `* Miss! "${itemA.text}" and "${itemB.text}" do not belong together.`

    // Connect to global state: takeDamage(3)
    takeDamage(damagePerFail)

    // Trigger screen shake & red flash
    isShaking.value = true
    isRedFlash.value = true

    setTimeout(() => {
      isRedFlash.value = false
    }, 250)

    setTimeout(() => {
      isShaking.value = false
      selectedA.value = null
      selectedB.value = null
      evaluationResult.value = null
      isEvaluating.value = false
    }, 500)
  }
}

// Handle clearing a board
const handleBoardCleared = () => {
  if (currentBoardIndex.value + 1 < totalBoards) {
    dialogueMessage.value = `* BOARD ${currentBoardIndex.value + 1} CLEARED! Preparing next board...`
    setTimeout(() => {
      currentBoardIndex.value++
      setupBoard()
    }, 800)
  } else {
    // Board 4 cleared! Level 2 Complete!
    completeLevel(2)
    setTimeout(() => {
      isVictory.value = true
    }, 600)
  }
}

// Button visual states
const getItemStateClass = (item, column) => {
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

// Start New Game (reset to board 0)
const startNewGame = () => {
  startLevel()
  currentBoardIndex.value = 0
  isVictory.value = false
  setupBoard()
}

onMounted(() => {
  startNewGame()
})
</script>
