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

    <!-- Top HUD: Undertale Style -->
    <header class="w-full flex items-center justify-between border-b-2 border-white pb-3 mb-4">
      <button 
        @click="$emit('back-to-menu')" 
        class="text-xs sm:text-sm tracking-wider uppercase text-gray-300 hover:text-undertale-yellow transition-colors flex items-center gap-1 py-1 px-2 border border-transparent hover:border-undertale-yellow"
      >
        <span>&lt;</span> MENU
      </button>

      <div class="text-xs sm:text-sm tracking-widest text-center">
        <span class="text-undertale-yellow">LV 4</span>
        <span class="ml-2 text-white">DATE BUILDER</span>
      </div>

      <div class="text-xs sm:text-sm text-right flex items-center gap-2">
        <span class="text-gray-400">EXP:</span>
        <span class="text-undertale-yellow font-bold">{{ totalExp }}</span>
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
          <span class="uppercase tracking-wider">RULE: <span class="text-undertale-yellow">[Day,] [Month] [Ordinal]</span></span>
          <span class="text-gray-400">DATE #{{ streak + 1 }}</span>
        </div>
      </section>

      <!-- ZONA SUPERIOR: Sentence Frame (Cajas contenedoras vacías / llenas) -->
      <section class="w-full my-auto flex flex-col items-center gap-3">
        <div class="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <span class="text-undertale-red">❤</span>
          <span>SENTENCE FRAME (TAP BLOCK TO REMOVE):</span>
        </div>

        <!-- 3 Slots Container -->
        <div 
          class="w-full grid grid-cols-3 gap-2 sm:gap-3 p-3 pixel-box transition-colors duration-200"
          :class="{
            '!border-undertale-green shadow-[0_0_15px_rgba(0,255,0,0.4)]': isCheckingSuccess,
            '!border-undertale-red shadow-[0_0_15px_rgba(255,0,0,0.4)]': isCheckingFail
          }"
          role="region"
          aria-label="Sentence Frame slots"
        >
          <!-- Slot 1 -->
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

          <!-- Slot 2 -->
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

          <!-- Slot 3 -->
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
            {{ sentenceFrame[2] ? sentenceFrame[2].text : '[3. Ordinal]' }}
          </button>
        </div>

        <!-- Formatted Preview -->
        <div class="h-6 text-xs text-center text-gray-300">
          <span v-if="allSlotsFilled" class="text-undertale-yellow">
            * "{{ assembledDateText }}"
          </span>
          <span v-else class="text-gray-500 text-[10px]">
            Place all 3 blocks to assemble the date.
          </span>
        </div>
      </section>

      <!-- ZONA INFERIOR: Word Bank (Botones grandes táctiles) -->
      <section class="w-full flex flex-col gap-3 my-auto">
        <div class="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest text-center">
          * WORD BANK (TAP TO PLACE):
        </div>

        <div class="grid grid-cols-3 gap-2 sm:gap-3 w-full" role="group" aria-label="Word Bank">
          <button
            v-for="block in wordBank"
            :key="block.id"
            @click="placeBlockToFrame(block)"
            :disabled="isBlockPlaced(block.id)"
            :class="[
              'undertale-btn justify-center text-center p-3 text-xs sm:text-sm font-pixel min-h-[52px] sm:min-h-[58px] transition-all',
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
          STREAK: <span class="text-undertale-yellow">{{ streak }}</span>
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
          YOU EARNED 150 EXP AND 35 GOLD.
        </p>

        <div class="border-t border-b border-gray-700 py-3 mb-6 text-xs text-gray-300 space-y-2 text-left">
          <div class="flex justify-between">
            <span class="text-gray-400">Correct Date:</span>
            <span class="text-undertale-yellow font-bold">{{ assembledDateText }}</span>
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
          * Your syntactic precision resonates through the Underground.
        </p>

        <div class="flex flex-col gap-3">
          <button 
            @click="nextDate" 
            class="undertale-btn justify-center py-3 text-xs sm:text-sm text-undertale-yellow border-undertale-yellow hover:bg-yellow-950/30"
          >
            <span class="text-undertale-red mr-2">❤</span> BUILD NEXT DATE
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
            <span class="text-gray-400">Target was:</span>
            <span class="text-undertale-yellow font-bold">{{ correctSequence.map(b => b.text).join(' ') }}</span>
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

const emit = defineEmits(['back-to-menu'])

// Configuration
const maxHp = 20
const damagePerWrong = 4

// State
const hp = ref(maxHp)
const totalExp = ref(0)
const streak = ref(0)
const dialogueMessage = ref('Tap blocks in the Word Bank to place them into the sentence frame.')

// Animation & Feedback states
const isShaking = ref(false)
const isRedFlash = ref(false)
const isChecking = ref(false)
const isCheckingSuccess = ref(false)
const isCheckingFail = ref(false)
const isVictory = ref(false)

// Blocks data
// correctSequence: [ { id: 'day', type: 'day', text: 'Monday,' }, { id: 'month', type: 'month', text: 'October' }, { id: 'ordinal', type: 'ordinal', text: '31st' } ]
const correctSequence = ref([])
const wordBank = ref([])
// sentenceFrame: Array of 3 elements [block or null, block or null, block or null]
const sentenceFrame = ref([null, null, null])

const allSlotsFilled = computed(() => {
  return sentenceFrame.value[0] !== null && 
         sentenceFrame.value[1] !== null && 
         sentenceFrame.value[2] !== null
})

const assembledDateText = computed(() => {
  return sentenceFrame.value
    .filter(b => b !== null)
    .map(b => b.text)
    .join(' ')
})

const isGameOver = computed(() => {
  return hp.value <= 0
})

// Helper: Ordinal conversion (1st, 2nd, 3rd, 4th, ..., 31st)
const getOrdinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

// Helper: Shuffle array
const shuffle = (array) => {
  return [...array].sort(() => Math.random() - 0.5)
}

// Generate new random date puzzle
const generateDatePuzzle = () => {
  const days = (vocabularyData.days || []).map(d => typeof d === 'string' ? d : d.name)
  const months = (vocabularyData.months || []).map(m => typeof m === 'string' ? m : m.name)

  // Pick random day
  const randomDay = days[Math.floor(Math.random() * days.length)]
  const dayBlock = {
    id: 'block_day',
    type: 'day',
    text: `${randomDay},`
  }

  // Pick random month & matching valid day number
  const randomMonth = months[Math.floor(Math.random() * months.length)]
  const monthBlock = {
    id: 'block_month',
    type: 'month',
    text: randomMonth
  }

  // Decide days in month (Feb = 28, Apr/Jun/Sep/Nov = 30, others = 31)
  let maxDays = 31
  if (randomMonth === 'February') maxDays = 28
  else if (['April', 'June', 'September', 'November'].includes(randomMonth)) maxDays = 30

  const randomNum = Math.floor(Math.random() * maxDays) + 1
  const ordinalBlock = {
    id: 'block_ordinal',
    type: 'ordinal',
    text: getOrdinal(randomNum)
  }

  // Target standard English format: [Day,] [Month] [Ordinal]
  correctSequence.value = [dayBlock, monthBlock, ordinalBlock]
  
  // Word Bank contains the 3 blocks scrambled
  wordBank.value = shuffle([dayBlock, monthBlock, ordinalBlock])
  
  // Empty sentence frame
  sentenceFrame.value = [null, null, null]
  isCheckingSuccess.value = false
  isCheckingFail.value = false
  isVictory.value = false
  dialogueMessage.value = '* Form the proper English date: [Day,] [Month] [Ordinal].'
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

// Tap placed block in Sentence Frame -> Return to Word Bank (clear that slot)
const removeBlockFromFrame = (slotIndex) => {
  if (isChecking.value || !sentenceFrame.value[slotIndex]) return

  const removedBlock = sentenceFrame.value[slotIndex]
  sentenceFrame.value[slotIndex] = null
  dialogueMessage.value = `* Returned "${removedBlock.text}" back to the Word Bank.`
}

// Return all pieces to Word Bank
const returnAllToWordBank = () => {
  sentenceFrame.value = [null, null, null]
}

// Check Answer logic
const checkAnswer = () => {
  if (!allSlotsFilled.value || isChecking.value) return

  isChecking.value = true

  // Evaluate order: slot 0 must be 'day', slot 1 must be 'month', slot 2 must be 'ordinal'
  const isCorrect = 
    sentenceFrame.value[0]?.type === 'day' &&
    sentenceFrame.value[1]?.type === 'month' &&
    sentenceFrame.value[2]?.type === 'ordinal'

  if (isCorrect) {
    isCheckingSuccess.value = true
    dialogueMessage.value = `* PERFECT! "${assembledDateText.value}" is syntactically flawless!`
    totalExp.value += 150
    streak.value++

    setTimeout(() => {
      isChecking.value = false
      isVictory.value = true
    }, 800)
  } else {
    isCheckingFail.value = true
    hp.value = Math.max(0, hp.value - damagePerWrong)
    streak.value = 0
    dialogueMessage.value = `* WRONG ORDER! English dates need: [Day,] [Month] [Ordinal].`

    // Screen shake & red flash
    isShaking.value = true
    isRedFlash.value = true

    setTimeout(() => {
      isRedFlash.value = false
    }, 250)

    setTimeout(() => {
      isShaking.value = false
      isCheckingFail.value = false
      isChecking.value = false
      
      // Requirement: "devuelve todas las piezas al Word Bank"
      returnAllToWordBank()
    }, 600)
  }
}

// Next Date
const nextDate = () => {
  hp.value = maxHp
  generateDatePuzzle()
}

// Restart
const restartLevel = () => {
  hp.value = maxHp
  totalExp.value = 0
  streak.value = 0
  generateDatePuzzle()
}

onMounted(() => {
  generateDatePuzzle()
})
</script>
