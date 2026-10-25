<template>
  <div class="w-full max-w-xl mx-auto flex flex-col items-center justify-between min-h-[90vh] py-4 px-3 sm:px-6">
    <!-- Top HUD: Undertale Style -->
    <header class="w-full flex items-center justify-between border-b-2 border-white pb-3 mb-4">
      <button 
        @click="$emit('back-to-menu')" 
        class="text-xs sm:text-sm tracking-wider uppercase text-gray-300 hover:text-undertale-yellow transition-colors flex items-center gap-1 py-1 px-2 border border-transparent hover:border-undertale-yellow"
      >
        <span>&lt;</span> MENU
      </button>

      <div class="text-xs sm:text-sm tracking-widest text-center">
        <span class="text-undertale-yellow">LV 1</span>
        <span class="ml-2 text-white">Q: {{ currentIndex + 1 }}/{{ totalQuestions }}</span>
      </div>

      <div class="text-xs sm:text-sm text-right flex items-center gap-2">
        <span class="text-gray-400">SCORE:</span>
        <span class="text-undertale-yellow font-bold">{{ score }}</span>
      </div>
    </header>

    <!-- Quiz In Progress -->
    <main v-if="!isGameOver" class="w-full flex-1 flex flex-col justify-between">
      <!-- Dialogue Box with 4px border & Typewriter effect -->
      <section class="pixel-box p-4 sm:p-6 mb-6 relative">
        <!-- Asterisk indicator like Undertale dialogs -->
        <div class="flex items-start gap-2">
          <span class="text-undertale-yellow text-base sm:text-lg select-none">*</span>
          <h2 class="text-sm sm:text-base leading-relaxed text-white min-h-[4rem]">
            {{ displayedQuestion }}
            <span v-if="isTyping" class="inline-block w-2 h-4 bg-white animate-pulse ml-1"></span>
          </h2>
        </div>

        <!-- Category tag -->
        <div class="mt-3 flex justify-between items-center text-[10px] sm:text-xs text-gray-400">
          <span class="uppercase tracking-widest">TOPIC: {{ currentQuestion?.category }}</span>
          <span v-if="isTyping" @click="skipTypewriter" class="text-gray-400 hover:text-white cursor-pointer underline">
            [TAP TO SKIP]
          </span>
        </div>
      </section>

      <!-- Feedback Banner (Temporary state display) -->
      <div class="h-8 mb-2 flex items-center justify-center text-center">
        <transition name="fade">
          <div 
            v-if="feedback" 
            :class="[
              'text-xs sm:text-sm font-bold tracking-wider px-3 py-1',
              feedback.isCorrect ? 'text-undertale-green' : 'text-undertale-red'
            ]"
          >
            * {{ feedback.message }}
          </div>
        </transition>
      </div>

      <!-- Multiple Choice Options (4 Big touch-friendly buttons) -->
      <section class="grid grid-cols-1 gap-3 sm:gap-4 w-full mb-6" role="group" aria-label="Question options">
        <button
          v-for="(option, index) in currentQuestion?.options"
          :key="index"
          @click="selectOption(option)"
          @mouseenter="hoveredOption = option"
          @mouseleave="hoveredOption = null"
          @focus="hoveredOption = option"
          @blur="hoveredOption = null"
          :disabled="selectedOption !== null"
          :class="[
            'undertale-btn w-full p-4 text-left sm:text-center text-xs sm:text-sm flex items-center justify-between sm:justify-center relative group min-h-[58px]',
            getButtonStateClass(option)
          ]"
        >
          <!-- Red Undertale Heart (appears when hovered or selected) -->
          <span 
            class="inline-flex items-center justify-center text-undertale-red text-base sm:text-lg mr-3 select-none"
            :class="{
              'opacity-100 scale-110 soul-pulse': hoveredOption === option || selectedOption === option,
              'opacity-0': hoveredOption !== option && selectedOption !== option
            }"
            aria-hidden="true"
          >
            ❤
          </span>

          <!-- Option Text -->
          <span class="flex-1 font-pixel text-left sm:text-center">
            {{ option }}
          </span>

          <!-- Right placeholder so text remains centered -->
          <span class="w-4 hidden sm:inline-block" aria-hidden="true"></span>
        </button>
      </section>

      <!-- Health & Determination Bar -->
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

    <!-- Game Over / Results Summary Screen -->
    <main v-else class="w-full flex-1 flex flex-col justify-center items-center text-center">
      <div class="pixel-box p-6 sm:p-8 w-full max-w-md">
        <!-- Red Soul -->
        <div class="text-undertale-red text-4xl mb-4 soul-pulse select-none">❤</div>

        <h2 class="text-base sm:text-xl text-undertale-yellow mb-4">
          {{ isVictorious ? 'VICTORY!' : 'DETERMINATION' }}
        </h2>

        <p class="text-xs sm:text-sm text-gray-200 leading-relaxed mb-6">
          {{ isVictorious 
            ? '* You conquered Level 1! Your English date knowledge shines bright.' 
            : '* Do not lose hope! You can always try again. Stay determined!' 
          }}
        </p>

        <!-- Stats breakdown -->
        <div class="border-t border-b border-gray-700 py-4 mb-6 text-xs space-y-2 text-left">
          <div class="flex justify-between">
            <span class="text-gray-400">Total Questions:</span>
            <span>{{ totalQuestions }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Correct Answers:</span>
            <span class="text-undertale-green">{{ correctCount }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Accuracy:</span>
            <span class="text-undertale-yellow">{{ accuracyPercentage }}%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Final Score:</span>
            <span class="text-undertale-yellow font-bold">{{ score }}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col gap-3">
          <button 
            @click="restartQuiz" 
            class="undertale-btn justify-center py-3 text-xs sm:text-sm text-undertale-yellow border-undertale-yellow hover:bg-yellow-950/30"
          >
            <span class="text-undertale-red mr-2">❤</span> PLAY AGAIN
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import vocabularyData from '../data.json'

const emit = defineEmits(['back-to-menu'])

// Total questions per run
const totalQuestions = 8
const maxHp = 20

// State
const questions = ref([])
const currentIndex = ref(0)
const selectedOption = ref(null)
const hoveredOption = ref(null)
const score = ref(0)
const hp = ref(maxHp)
const streak = ref(0)
const correctCount = ref(0)
const isGameOver = ref(false)
const feedback = ref(null)

// Typewriter state
const displayedQuestion = ref('')
const isTyping = ref(false)
let typeInterval = null

// Current question computed
const currentQuestion = computed(() => {
  return questions.value[currentIndex.value] || null
})

const isVictorious = computed(() => {
  return correctCount.value >= Math.ceil(totalQuestions * 0.6)
})

const accuracyPercentage = computed(() => {
  return totalQuestions > 0 ? Math.round((correctCount.value / totalQuestions) * 100) : 0
})

// --- Question Generator ---
const generateQuestions = () => {
  const generated = []
  const days = vocabularyData.days || [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ]
  const months = vocabularyData.months || [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const holidays = vocabularyData.holidays || []
  const seasons = vocabularyData.seasons || []

  // Helper: Shuffle array
  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)

  // Helper: Pick N random unique items from array excluding certain values
  const getDistractors = (pool, excludeVal, count = 3) => {
    const filtered = pool.filter(item => item !== excludeVal)
    return shuffle(filtered).slice(0, count)
  }

  // Type 1: Day after
  const createDayAfterQuestion = () => {
    const idx = Math.floor(Math.random() * days.length)
    const baseDay = days[idx]
    const nextDay = days[(idx + 1) % days.length]
    const distractors = getDistractors(days, nextDay, 3)
    return {
      category: 'Days of the Week',
      text: `What day comes after ${baseDay}?`,
      correct: nextDay,
      options: shuffle([nextDay, ...distractors])
    }
  }

  // Type 2: Day before
  const createDayBeforeQuestion = () => {
    const idx = Math.floor(Math.random() * days.length)
    const baseDay = days[idx]
    const prevDay = days[(idx - 1 + days.length) % days.length]
    const distractors = getDistractors(days, prevDay, 3)
    return {
      category: 'Days of the Week',
      text: `What day comes before ${baseDay}?`,
      correct: prevDay,
      options: shuffle([prevDay, ...distractors])
    }
  }

  // Type 3: Month after
  const createMonthAfterQuestion = () => {
    const idx = Math.floor(Math.random() * months.length)
    const baseMonth = months[idx]
    const nextMonth = months[(idx + 1) % months.length]
    const distractors = getDistractors(months, nextMonth, 3)
    return {
      category: 'Months of the Year',
      text: `What month comes after ${baseMonth}?`,
      correct: nextMonth,
      options: shuffle([nextMonth, ...distractors])
    }
  }

  // Type 4: Month before
  const createMonthBeforeQuestion = () => {
    const idx = Math.floor(Math.random() * months.length)
    const baseMonth = months[idx]
    const prevMonth = months[(idx - 1 + months.length) % months.length]
    const distractors = getDistractors(months, prevMonth, 3)
    return {
      category: 'Months of the Year',
      text: `What month comes before ${baseMonth}?`,
      correct: prevMonth,
      options: shuffle([prevMonth, ...distractors])
    }
  }

  // Type 5: Holiday month
  const createHolidayMonthQuestion = () => {
    if (!holidays.length) return createDayAfterQuestion()
    const holiday = holidays[Math.floor(Math.random() * holidays.length)]
    const distractors = getDistractors(months, holiday.month, 3)
    return {
      category: 'Holidays',
      text: `In which month is ${holiday.name} celebrated?`,
      correct: holiday.month,
      options: shuffle([holiday.month, ...distractors])
    }
  }

  // Type 6: Season month
  const createSeasonMonthQuestion = () => {
    if (!seasons.length) return createMonthAfterQuestion()
    const season = seasons[Math.floor(Math.random() * seasons.length)]
    const correctMonth = season.months[Math.floor(Math.random() * season.months.length)]
    const allSeasonMonths = seasons.flatMap(s => s.months)
    const distractors = getDistractors(allSeasonMonths, correctMonth, 3)
    return {
      category: 'Seasons',
      text: `Which month belongs to ${season.name}?`,
      correct: correctMonth,
      options: shuffle([correctMonth, ...distractors])
    }
  }

  const generators = [
    createDayAfterQuestion,
    createDayBeforeQuestion,
    createMonthAfterQuestion,
    createMonthBeforeQuestion,
    createHolidayMonthQuestion,
    createSeasonMonthQuestion
  ]

  for (let i = 0; i < totalQuestions; i++) {
    const generator = generators[i % generators.length]
    generated.push(generator())
  }

  return shuffle(generated)
}

// --- Typewriter Effect ---
const startTypewriter = (text) => {
  if (typeInterval) clearInterval(typeInterval)
  displayedQuestion.value = ''
  isTyping.value = true
  let charIndex = 0

  typeInterval = setInterval(() => {
    if (charIndex < text.length) {
      displayedQuestion.value += text[charIndex]
      charIndex++
    } else {
      clearInterval(typeInterval)
      isTyping.value = false
    }
  }, 24)
}

const skipTypewriter = () => {
  if (isTyping.value && currentQuestion.value) {
    if (typeInterval) clearInterval(typeInterval)
    displayedQuestion.value = currentQuestion.value.text
    isTyping.value = false
  }
}

// Watch question change to start typewriter
watch(currentQuestion, (newVal) => {
  if (newVal) {
    startTypewriter(newVal.text)
  }
})

// --- Option Selection and Feedback ---
const selectOption = (option) => {
  if (selectedOption.value !== null) return // Prevent multiple clicks
  selectedOption.value = option

  const isCorrect = option === currentQuestion.value.correct

  if (isCorrect) {
    correctCount.value++
    streak.value++
    score.value += 100 + (streak.value * 20)
    feedback.value = {
      isCorrect: true,
      message: 'CORRECT! DETERMINATION +'
    }
  } else {
    streak.value = 0
    hp.value = Math.max(0, hp.value - 5)
    feedback.value = {
      isCorrect: false,
      message: `WRONG! It was "${currentQuestion.value.correct}"`
    }
  }

  // Automatic advance after 1000ms (1 second) as required
  setTimeout(() => {
    feedback.value = null
    selectedOption.value = null
    hoveredOption.value = null

    if (currentIndex.value + 1 < totalQuestions && hp.value > 0) {
      currentIndex.value++
    } else {
      isGameOver.value = true
    }
  }, 1000)
}

// Dynamic styling for answer feedback
const getButtonStateClass = (option) => {
  if (selectedOption.value === null) {
    return ''
  }

  const isThisOptionSelected = selectedOption.value === option
  const isThisOptionCorrect = option === currentQuestion.value?.correct

  if (isThisOptionSelected) {
    if (isThisOptionCorrect) {
      return '!border-undertale-green !text-undertale-green bg-green-950/40 shadow-[0_0_15px_rgba(0,255,0,0.4)]'
    } else {
      return '!border-undertale-red !text-undertale-red bg-red-950/40 shadow-[0_0_15px_rgba(255,0,0,0.4)]'
    }
  }

  // Also reveal correct button if player failed
  if (!isThisOptionSelected && isThisOptionCorrect && selectedOption.value !== currentQuestion.value?.correct) {
    return '!border-undertale-green !text-undertale-green bg-green-950/20'
  }

  return 'opacity-40'
}

// Restart quiz
const restartQuiz = () => {
  questions.value = generateQuestions()
  currentIndex.value = 0
  selectedOption.value = null
  hoveredOption.value = null
  score.value = 0
  hp.value = maxHp
  streak.value = 0
  correctCount.value = 0
  isGameOver.value = false
  feedback.value = null
}

onMounted(() => {
  restartQuiz()
})

onUnmounted(() => {
  if (typeInterval) clearInterval(typeInterval)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
