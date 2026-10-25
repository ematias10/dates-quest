<template>
  <div 
    class="w-full max-w-2xl mx-auto flex flex-col items-center justify-between min-h-[90vh] py-4 px-2 sm:px-6 relative select-none"
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
        <span class="text-undertale-yellow">LV 4</span>
        <span class="ml-2 text-white">DATE: {{ solvedCount }}/{{ targetGoal }}</span>
      </div>

      <div class="text-xs sm:text-sm text-right flex items-center gap-2">
        <span class="text-gray-400">SCORE:</span>
        <span class="text-undertale-yellow font-bold">{{ score }}</span>
      </div>
    </header>

    <!-- ACTIVE GAME SCREEN -->
    <main v-if="!isVictory && !isGameOver" class="w-full flex-1 flex flex-col justify-between">
      
      <!-- Undertale Dialogue Box / Instruction Banner -->
      <section class="pixel-box p-3 sm:p-4 mb-4">
        <div class="flex items-start gap-2">
          <span class="text-undertale-yellow text-sm sm:text-base select-none">*</span>
          <p class="text-[11px] sm:text-xs leading-relaxed text-white min-h-[2.5rem] flex items-center">
            {{ dialogueMessage }}
          </p>
        </div>

        <div class="mt-2 pt-2 border-t border-gray-800 flex justify-between items-center text-[10px] text-gray-400">
          <span class="uppercase tracking-wider">RULE: <span class="text-undertale-yellow">[Day,] [Month] [Number] [Suffix]</span></span>
          <span v-if="combo > 1" class="text-undertale-yellow font-bold animate-pulse">
            COMBO x{{ combo }}!
          </span>
          <span v-else class="text-gray-400">
            PERFECT: {{ isLevelPerfect ? 'YES' : 'NO' }}
          </span>
        </div>
      </section>

      <!-- ZONA SUPERIOR: Sentence Frame (4 Cajas Contenedoras) -->
      <section class="w-full my-auto flex flex-col items-center gap-3">
        <div class="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <span class="text-undertale-red">❤</span>
          <span>SENTENCE FRAME (TAP TO RETURN):</span>
        </div>

        <!-- 4 Slots Container (Responsive: 2 cols on very small, 4 cols on sm+) -->
        <div 
          class="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-3 pixel-box transition-colors duration-200"
          :class="{
            '!border-undertale-green shadow-[0_0_15px_rgba(0,255,0,0.4)]': isCheckingSuccess,
            '!border-undertale-red shadow-[0_0_15px_rgba(255,0,0,0.4)]': isCheckingFail
          }"
          role="region"
          aria-label="Sentence Frame slots"
        >
          <!-- Slot 0: [Day,] -->
          <button
            @click="removeBlockFromFrame(0)"
            :disabled="!sentenceFrame[0]"
            :class="[
              'h-14 sm:h-16 border-2 flex items-center justify-center p-2 text-center text-xs sm:text-sm font-bold transition-all',
              sentenceFrame[0] 
                ? 'border-undertale-yellow bg-yellow-950/40 text-undertale-yellow hover:border-undertale-red hover:text-undertale-red active:scale-95 cursor-pointer' 
                : 'border-dashed border-gray-600 bg-black text-gray-600 cursor-default'
            ]"
          >
            {{ sentenceFrame[0] ? sentenceFrame[0].text : '[1. Day,]' }}
          </button>

          <!-- Slot 1: [Month] -->
          <button
            @click="removeBlockFromFrame(1)"
            :disabled="!sentenceFrame[1]"
            :class="[
              'h-14 sm:h-16 border-2 flex items-center justify-center p-2 text-center text-xs sm:text-sm font-bold transition-all',
              sentenceFrame[1] 
                ? 'border-undertale-yellow bg-yellow-950/40 text-undertale-yellow hover:border-undertale-red hover:text-undertale-red active:scale-95 cursor-pointer' 
                : 'border-dashed border-gray-600 bg-black text-gray-600 cursor-default'
            ]"
          >
            {{ sentenceFrame[1] ? sentenceFrame[1].text : '[2. Month]' }}
          </button>

          <!-- Slot 2: [Number] -->
          <button
            @click="removeBlockFromFrame(2)"
            :disabled="!sentenceFrame[2]"
            :class="[
              'h-14 sm:h-16 border-2 flex items-center justify-center p-2 text-center text-xs sm:text-sm font-bold transition-all',
              sentenceFrame[2] 
                ? 'border-undertale-yellow bg-yellow-950/40 text-undertale-yellow hover:border-undertale-red hover:text-undertale-red active:scale-95 cursor-pointer' 
                : 'border-dashed border-gray-600 bg-black text-gray-600 cursor-default'
            ]"
          >
            {{ sentenceFrame[2] ? sentenceFrame[2].text : '[3. Number]' }}
          </button>

          <!-- Slot 3: [Suffix] -->
          <button
            @click="removeBlockFromFrame(3)"
            :disabled="!sentenceFrame[3]"
            :class="[
              'h-14 sm:h-16 border-2 flex items-center justify-center p-2 text-center text-xs sm:text-sm font-bold transition-all',
              sentenceFrame[3] 
                ? 'border-undertale-yellow bg-yellow-950/40 text-undertale-yellow hover:border-undertale-red hover:text-undertale-red active:scale-95 cursor-pointer' 
                : 'border-dashed border-gray-600 bg-black text-gray-600 cursor-default'
            ]"
          >
            {{ sentenceFrame[3] ? sentenceFrame[3].text : '[4. Suffix]' }}
          </button>
        </div>

        <!-- Formatted Preview -->
        <div class="h-6 text-xs text-center text-gray-300">
          <span v-if="allSlotsFilled" class="text-undertale-yellow font-bold">
            * "{{ assembledDateText }}"
          </span>
          <span v-else class="text-gray-500 text-[10px]">
            Place all 4 blocks in order: Day, Month Number+Suffix.
          </span>
        </div>
      </section>

      <!-- ZONA INFERIOR: Word Bank (4 Botones Grandes Táctiles) -->
      <section class="w-full flex flex-col gap-3 my-auto">
        <div class="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest text-center">
          * WORD BANK (TAP TO PLACE):
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 w-full" role="group" aria-label="Word Bank">
          <button
            v-for="block in wordBank"
            :key="block.id"
            @click="placeBlockToFrame(block)"
            :disabled="isBlockPlaced(block.id)"
            :class="[
              'undertale-btn justify-center text-center p-3 text-xs sm:text-sm font-pixel min-h-[50px] sm:min-h-[56px] transition-all',
              isBlockPlaced(block.id)
                ? 'opacity-20 border-gray-800 text-gray-700 bg-black cursor-not-allowed'
                : 'border-white text-white hover:border-undertale-yellow hover:text-undertale-yellow active:scale-95'
            ]"
          >
            <span class="break-words line-clamp-1">
              {{ block.text }}
            </span>
          </button>
        </div>
      </section>

      <!-- Action Area: CHECK Button -->
      <section class="w-full flex justify-center mb-3">
        <button
          @click="checkAnswer"
          :disabled="!allSlotsFilled || isChecking"
          :class="[
            'undertale-btn justify-center w-full max-w-sm py-3 text-xs sm:text-sm font-bold uppercase tracking-wider',
            allSlotsFilled && !isChecking
              ? '!border-undertale-yellow !text-undertale-yellow bg-yellow-950/30 soul-pulse'
              : 'opacity-40 border-gray-700 text-gray-600 cursor-not-allowed'
          ]"
        >
          <span class="text-undertale-red mr-2">❤</span> [CHECK DATE]
        </button>
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
          GOAL: <span class="text-undertale-yellow font-bold">{{ solvedCount }} / {{ targetGoal }}</span>
        </div>
      </footer>
    </main>

    <!-- VICTORY SCREEN (Achieved after 10 solved dates) -->
    <main v-else-if="isVictory" class="w-full flex-1 flex flex-col justify-center items-center text-center">
      <div class="pixel-box p-6 sm:p-8 w-full max-w-md">
        <div class="text-undertale-red text-4xl mb-3 soul-pulse select-none">❤</div>

        <h2 class="text-base sm:text-lg text-undertale-yellow mb-2 tracking-wider">
          LEVEL 4 COMPLETE!
        </h2>
        
        <p class="text-xs text-white mb-4 leading-relaxed">
          YOU SOLVED 10 DATES AND EARNED EXP!
        </p>

        <div class="border-t border-b border-gray-700 py-3 mb-6 text-xs text-gray-300 space-y-2 text-left">
          <div class="flex justify-between">
            <span class="text-gray-400">Solved Target:</span>
            <span class="text-undertale-yellow font-bold">10 / 10 Dates</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Perfect Clear:</span>
            <span :class="isLevelPerfect ? 'text-undertale-green font-bold' : 'text-gray-400'">
              {{ isLevelPerfect ? 'YES (+1000 BONUS)' : 'NO' }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Remaining HP:</span>
            <span class="text-undertale-green">{{ currentHP }} / 20</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Total Score:</span>
            <span class="text-undertale-yellow font-bold">{{ score }}</span>
          </div>
        </div>

        <p class="text-[11px] text-gray-300 italic mb-6">
          * Your syntactic mastery of English dates is complete. Level 5 is now accessible!
        </p>

        <div class="flex flex-col gap-3">
          <button 
            @click="restartLevel" 
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
        <div class="flex justify-center items-center gap-2 mb-4">
          <span class="text-undertale-red text-3xl select-none inline-block transform -rotate-12">💔</span>
        </div>

        <h2 class="text-base sm:text-lg text-undertale-red mb-3 tracking-wider">
          GAME OVER
        </h2>

        <p class="text-xs text-gray-300 leading-relaxed mb-4">
          * The calendar order shattered...
        </p>
        <p class="text-xs text-undertale-yellow leading-relaxed mb-6 font-bold">
          * Frisk! Stay determined!
        </p>

        <div class="border-t border-b border-gray-700 py-3 mb-6 text-xs text-left">
          <div class="flex justify-between">
            <span class="text-gray-400">Progress:</span>
            <span class="text-undertale-yellow font-bold">{{ solvedCount }} / {{ targetGoal }} dates</span>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <button 
            @click="restartLevel" 
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
const targetGoal = 10
const damagePerFail = 4

// Local state for Level 4 progression
const solvedCount = ref(0)
const dialogueMessage = ref('Arrange the 4 blocks into proper English date order.')

// Visual animation states
const isShaking = ref(false)
const isRedFlash = ref(false)
const isChecking = ref(false)
const isCheckingSuccess = ref(false)
const isCheckingFail = ref(false)
const isVictory = ref(false)

// 4 Blocks Data: [Day,], [Month], [Number], [Suffix]
const correctSequence = ref([])
const wordBank = ref([])
// 4 Slots: [slot 0: day, slot 1: month, slot 2: number, slot 3: suffix]
const sentenceFrame = ref([null, null, null, null])

const allSlotsFilled = computed(() => {
  return sentenceFrame.value[0] !== null && 
         sentenceFrame.value[1] !== null && 
         sentenceFrame.value[2] !== null && 
         sentenceFrame.value[3] !== null
})

// Formatted assembled text preview (combines Number + Suffix seamlessly)
const assembledDateText = computed(() => {
  if (!allSlotsFilled.value) return ''
  const day = sentenceFrame.value[0]?.text || ''
  const month = sentenceFrame.value[1]?.text || ''
  const num = sentenceFrame.value[2]?.text || ''
  const suffix = sentenceFrame.value[3]?.text || ''
  return `${day} ${month} ${num}${suffix}`
})

// Game Over triggers when global currentHP drops to 0
const isGameOver = computed(() => {
  return currentHP.value <= 0
})

// Helper: Calculate ordinal suffix ('st', 'nd', 'rd', 'th') for a number
const getOrdinalSuffix = (num) => {
  const v = num % 100
  if (v >= 11 && v <= 13) return 'th'
  switch (num % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
  }
}

// Helper: Shuffle array
const shuffle = (array) => {
  return [...array].sort(() => Math.random() - 0.5)
}

// Generate a new 4-block date puzzle
const generateDatePuzzle = () => {
  const days = (vocabularyData.days || []).map(d => typeof d === 'string' ? d : d.name)
  const months = (vocabularyData.months || []).map(m => typeof m === 'string' ? m : m.name)

  // 1. Pick Random Day (with comma included)
  const randomDay = days[Math.floor(Math.random() * days.length)]
  const dayBlock = {
    id: 'block_day',
    type: 'day',
    text: `${randomDay},`
  }

  // 2. Pick Random Month
  const randomMonth = months[Math.floor(Math.random() * months.length)]
  const monthBlock = {
    id: 'block_month',
    type: 'month',
    text: randomMonth
  }

  // 3. Determine valid date number for that month
  let maxDays = 31
  if (randomMonth === 'February') maxDays = 28
  else if (['April', 'June', 'September', 'November'].includes(randomMonth)) maxDays = 30

  const randomNum = Math.floor(Math.random() * maxDays) + 1
  const numberBlock = {
    id: 'block_number',
    type: 'number',
    text: String(randomNum)
  }

  // 4. Determine matching ordinal suffix
  const suffixBlock = {
    id: 'block_suffix',
    type: 'suffix',
    text: getOrdinalSuffix(randomNum)
  }

  // Target standard 4-block order: [Day,] [Month] [Number] [Suffix]
  correctSequence.value = [dayBlock, monthBlock, numberBlock, suffixBlock]
  
  // Word Bank receives the 4 blocks scrambled
  wordBank.value = shuffle([dayBlock, monthBlock, numberBlock, suffixBlock])
  
  // Clear the 4 frame slots
  sentenceFrame.value = [null, null, null, null]
  isCheckingSuccess.value = false
  isCheckingFail.value = false
  dialogueMessage.value = `* Assemble Date #${solvedCount.value + 1}: [Day,] [Month] [Number] [Suffix].`
}

// Check if a block from Word Bank is currently placed in Sentence Frame
const isBlockPlaced = (blockId) => {
  return sentenceFrame.value.some(b => b?.id === blockId)
}

// Tap block in Word Bank -> Place into first empty slot in Sentence Frame
const placeBlockToFrame = (block) => {
  if (isChecking.value || isBlockPlaced(block.id)) return

  const emptyIndex = sentenceFrame.value.findIndex(slot => slot === null)
  if (emptyIndex !== -1) {
    sentenceFrame.value[emptyIndex] = block
    dialogueMessage.value = `* Placed "${block.text}" into slot ${emptyIndex + 1}.`
  }
}

// Tap placed block in Sentence Frame -> Return to Word Bank
const removeBlockFromFrame = (slotIndex) => {
  if (isChecking.value || !sentenceFrame.value[slotIndex]) return

  const removedBlock = sentenceFrame.value[slotIndex]
  sentenceFrame.value[slotIndex] = null
  dialogueMessage.value = `* Returned "${removedBlock.text}" back to the Word Bank.`
}

// Return all pieces to Word Bank on mistake
const returnAllToWordBank = () => {
  sentenceFrame.value = [null, null, null, null]
}

// Check Answer evaluation
const checkAnswer = () => {
  if (!allSlotsFilled.value || isChecking.value) return

  isChecking.value = true

  // Validation: Slot 0 = 'day', Slot 1 = 'month', Slot 2 = 'number', Slot 3 = 'suffix'
  const isCorrect = 
    sentenceFrame.value[0]?.type === 'day' &&
    sentenceFrame.value[1]?.type === 'month' &&
    sentenceFrame.value[2]?.type === 'number' &&
    sentenceFrame.value[3]?.type === 'suffix'

  if (isCorrect) {
    isCheckingSuccess.value = true
    
    // Connect to global state: addScore(150)
    addScore(150)
    solvedCount.value++

    dialogueMessage.value = `* PERFECT! "${assembledDateText.value}" is syntactically flawless!`

    // Check if level completed (10 solved dates required)
    if (solvedCount.value >= targetGoal) {
      setTimeout(() => {
        isChecking.value = false
        // Call global completeLevel(4)
        completeLevel(4)
        isVictory.value = true
      }, 700)
    } else {
      setTimeout(() => {
        isChecking.value = false
        generateDatePuzzle()
      }, 800)
    }

  } else {
    isCheckingFail.value = true

    // Connect to global state: takeDamage(4)
    takeDamage(damagePerFail)
    dialogueMessage.value = `* WRONG ORDER! English dates require: [Day,] [Month] [Number] [Suffix].`

    // Screen shake and red flash
    isShaking.value = true
    isRedFlash.value = true

    setTimeout(() => {
      isRedFlash.value = false
    }, 250)

    setTimeout(() => {
      isShaking.value = false
      isCheckingFail.value = false
      isChecking.value = false
      
      // Reiniciar las piezas devolviéndolas al Word Bank
      returnAllToWordBank()
    }, 600)
  }
}

// Restart Level
const restartLevel = () => {
  startLevel()
  solvedCount.value = 0
  isVictory.value = false
  generateDatePuzzle()
}

onMounted(() => {
  startLevel()
  solvedCount.value = 0
  isVictory.value = false
  generateDatePuzzle()
})
</script>
