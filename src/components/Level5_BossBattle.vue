<template>
  <div 
    class="w-full max-w-2xl mx-auto flex flex-col items-center justify-between min-h-[92vh] py-3 px-2 sm:px-6 relative select-none"
    :class="{ 'animate-shake': isShaking }"
  >
    <!-- Red Damage Flash Overlay -->
    <div 
      v-if="isRedFlash" 
      class="fixed inset-0 bg-red-600/35 pointer-events-none z-50 transition-opacity duration-200"
      aria-hidden="true"
    ></div>

    <!-- Top HUD: Undertale Style -->
    <header class="w-full flex items-center justify-between border-b-2 border-white pb-2 mb-2">
      <button 
        @click="$emit('back-to-menu')" 
        class="text-xs sm:text-sm tracking-wider uppercase text-gray-300 hover:text-undertale-yellow transition-colors flex items-center gap-1 py-1 px-2 border border-transparent hover:border-undertale-yellow"
      >
        <span>&lt;</span> FLEE
      </button>

      <div class="text-xs sm:text-sm tracking-widest text-center text-undertale-red">
        FINAL BOSS: LV 5
      </div>

      <div class="text-xs sm:text-sm text-right flex items-center gap-2">
        <span class="text-gray-400">EXP:</span>
        <span class="text-undertale-yellow font-bold">{{ totalExp }}</span>
      </div>
    </header>

    <!-- ACTIVE COMBAT VIEW -->
    <main v-if="!isVictory && !isGameOver" class="w-full flex-1 flex flex-col justify-between">
      
      <!-- TOP HALF: Boss Arena (Sprite & Boss HP) -->
      <section class="w-full flex flex-col items-center justify-center my-auto py-2">
        <!-- Boss HP Bar -->
        <div class="w-full max-w-md pixel-box-sm p-2 mb-3 bg-black flex flex-col gap-1">
          <div class="flex justify-between items-center text-[10px] sm:text-xs">
            <span class="text-white font-bold tracking-wider">CALENDAR AMALGAMATE</span>
            <span :class="bossHp <= 25 ? 'text-undertale-red font-bold animate-pulse' : 'text-undertale-yellow'">
              HP {{ bossHp }}/100
            </span>
          </div>
          <!-- Gauge -->
          <div class="w-full h-3 bg-red-950 border border-white overflow-hidden relative">
            <div 
              class="h-full bg-undertale-green transition-all duration-500 ease-out"
              :style="{ width: `${bossHp}%` }"
              :class="{ '!bg-undertale-yellow': bossHp <= 50 && bossHp > 25, '!bg-undertale-red': bossHp <= 25 }"
            ></div>
          </div>
        </div>

        <!-- Boss Sprite Container with Float and Slash effects -->
        <div class="relative flex items-center justify-center my-2 sm:my-4">
          <!-- Slash Attack Animation on Boss -->
          <div 
            v-if="isBossHit" 
            class="absolute z-20 w-48 h-1 bg-white shadow-[0_0_15px_#ffffff] slash-animation pointer-events-none"
            aria-hidden="true"
          ></div>

          <!-- Boss Pixel/ASCII Art -->
          <div 
            class="transition-all duration-300 transform"
            :class="[
              isBossHit ? 'boss-damaged' : 'boss-float'
            ]"
          >
            <div class="pixel-box p-3 sm:p-4 bg-black border-4 border-white flex flex-col items-center text-center">
              <!-- Eldritch Calendar Crown -->
              <div class="text-[10px] sm:text-xs text-undertale-yellow tracking-widest mb-1">
                ▲ [OCT 31] ▼ [DEC 25] ▲
              </div>
              
              <!-- ASCII Monster Face -->
              <pre class="font-pixel text-[11px] sm:text-xs leading-none text-white select-none whitespace-pre my-1">
   /◣___◢\   
  ( ⊙ . ⊙ )  
  /  ▼▼▼▼  \ 
 ( [WINTER] )
  \  ▲▲▲▲  / 
   \______/  
              </pre>

              <!-- Dynamic Subtext -->
              <div class="text-[9px] text-gray-400 uppercase tracking-widest mt-1">
                * KEEPER OF THE UNDERGROUND SEASONS *
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- BOTTOM HALF: Undertale Battle Box & Controls -->
      <section class="w-full flex flex-col gap-3">
        
        <!-- Classic Dialogue Box -->
        <div class="pixel-box p-3 sm:p-4 min-h-[5.5rem] relative">
          <div class="flex items-start gap-2">
            <span class="text-undertale-yellow text-sm sm:text-base select-none">*</span>
            <div class="text-xs sm:text-sm leading-relaxed text-white">
              <span>{{ displayedQuestion }}</span>
              <span v-if="isTyping" class="inline-block w-2 h-4 bg-white animate-pulse ml-1"></span>
            </div>
          </div>

          <!-- Floating Combat Feedback Message -->
          <div v-if="combatFeedback" class="mt-2 text-[11px] sm:text-xs font-bold" :class="combatFeedback.isSuccess ? 'text-undertale-green' : 'text-undertale-red'">
            * {{ combatFeedback.text }}
          </div>
        </div>

        <!-- Input & Fight Button Controls -->
        <form @submit.prevent="fight" class="flex flex-col sm:flex-row gap-2 w-full">
          <div class="flex-1 relative">
            <input
              ref="inputRef"
              v-model="userAnswer"
              type="text"
              autocomplete="off"
              spellcheck="false"
              :disabled="isProcessingTurn"
              placeholder="TYPE ANSWER IN ENGLISH..."
              class="w-full h-12 sm:h-14 px-3 bg-black border-3 border-white text-white font-pixel text-xs sm:text-sm uppercase placeholder-gray-600 focus:border-undertale-yellow focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            :disabled="!userAnswer.trim() || isProcessingTurn"
            class="undertale-btn justify-center h-12 sm:h-14 px-6 text-xs sm:text-sm font-pixel font-bold uppercase tracking-wider transition-all"
            :class="[
              userAnswer.trim() && !isProcessingTurn
                ? '!border-undertale-yellow !text-undertale-yellow bg-yellow-950/30'
                : 'opacity-40 border-gray-700 text-gray-600 cursor-not-allowed'
            ]"
          >
            <span 
              class="text-undertale-red text-base mr-2 select-none"
              :class="{ 'opacity-100 scale-110 soul-pulse': userAnswer.trim() }"
            >
              ❤
            </span>
            [ FIGHT ]
          </button>
        </form>

        <!-- Player HP HUD -->
        <footer class="w-full flex items-center justify-between text-xs py-2 border-t border-gray-800">
          <div class="flex items-center gap-2">
            <span class="text-xs text-white font-bold">FRISK</span>
            <span class="text-xs text-undertale-red font-bold ml-2">HP</span>
            <div class="w-24 sm:w-32 h-4 bg-red-900 border border-white relative overflow-hidden">
              <div 
                class="h-full bg-undertale-yellow transition-all duration-300"
                :style="{ width: `${(hp / maxHp) * 100}%` }"
              ></div>
            </div>
            <span class="text-[10px] text-gray-300">{{ hp }} / {{ maxHp }}</span>
          </div>

          <div class="text-[10px] text-gray-400">
            TURN: <span class="text-undertale-yellow">{{ turnNumber }}</span>
          </div>
        </footer>
      </section>
    </main>

    <!-- VICTORY SCREEN: Defeated Boss -->
    <main v-else-if="isVictory" class="w-full flex-1 flex flex-col justify-center items-center text-center">
      <div class="pixel-box p-6 sm:p-8 w-full max-w-md">
        <div class="text-undertale-yellow text-4xl mb-3 soul-pulse select-none">★</div>

        <h2 class="text-base sm:text-lg text-undertale-yellow mb-2 tracking-wider">
          YOU SAVED THE TIMELINE!
        </h2>
        
        <p class="text-xs text-white mb-4 leading-relaxed">
          YOU EARNED 500 EXP AND 100 GOLD.
        </p>

        <div class="border-t border-b border-gray-700 py-3 mb-6 text-xs text-gray-300 space-y-2 text-left">
          <div class="flex justify-between">
            <span class="text-gray-400">Final Outcome:</span>
            <span class="text-undertale-green font-bold">Surface Unlocked</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Remaining HP:</span>
            <span class="text-undertale-yellow">{{ hp }} / {{ maxHp }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Total EXP:</span>
            <span class="text-undertale-yellow font-bold">{{ totalExp }}</span>
          </div>
        </div>

        <p class="text-[11px] text-gray-300 italic mb-6">
          * The ancient calendar has been restored. You and your friends may finally return to the surface. Stay DETERMINED!
        </p>

        <div class="flex flex-col gap-3">
          <button 
            @click="restartBattle" 
            class="undertale-btn justify-center py-3 text-xs sm:text-sm text-undertale-yellow border-undertale-yellow hover:bg-yellow-950/30"
          >
            <span class="text-undertale-red mr-2">❤</span> FIGHT AGAIN
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

    <!-- GAME OVER SCREEN: Frisk Shattered -->
    <main v-else-if="isGameOver" class="w-full flex-1 flex flex-col justify-center items-center text-center">
      <div class="pixel-box p-6 sm:p-8 w-full max-w-md">
        <div class="flex justify-center items-center gap-2 mb-4">
          <span class="text-undertale-red text-3xl select-none inline-block transform -rotate-12">💔</span>
        </div>

        <h2 class="text-base sm:text-lg text-undertale-red mb-3 tracking-wider">
          GAME OVER
        </h2>

        <p class="text-xs text-gray-300 leading-relaxed mb-4">
          * The Calendar Amalgamate proved too formidable...
        </p>
        <p class="text-xs text-undertale-yellow leading-relaxed mb-6 font-bold">
          * Frisk! Don't let time stop now! Stay determined!
        </p>

        <div class="flex flex-col gap-3">
          <button 
            @click="restartBattle" 
            class="undertale-btn justify-center py-3 text-xs sm:text-sm text-undertale-yellow border-undertale-yellow hover:bg-yellow-950/30"
          >
            <span class="text-undertale-red mr-2">❤</span> RETRY (DETERMINATION)
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
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import vocabularyData from '../data.json'

const emit = defineEmits(['back-to-menu'])

// Stats Configuration
const maxHp = 20
const damageToPlayer = 5
const damageToBoss = 25

// State
const hp = ref(maxHp)
const bossHp = ref(100)
const totalExp = ref(0)
const turnNumber = ref(1)

// Battle feedback & animations
const isShaking = ref(false)
const isRedFlash = ref(false)
const isBossHit = ref(false)
const isProcessingTurn = ref(false)
const combatFeedback = ref(null)

// Input & Typewriter
const userAnswer = ref('')
const inputRef = ref(null)
const displayedQuestion = ref('')
const isTyping = ref(false)
let typeInterval = null

// Question database built from data.json
const questionsPool = [
  {
    prompt: 'Translate to English: "Navidad es en Diciembre"',
    accepted: [
      'christmas is in december',
      'christmas is on december',
      'christmas in december'
    ],
    displayCorrect: 'Christmas is in December'
  },
  {
    prompt: 'Translate to English: "Halloween es en Octubre"',
    accepted: [
      'halloween is in october',
      'halloween is on october',
      'halloween in october'
    ],
    displayCorrect: 'Halloween is in October'
  },
  {
    prompt: 'Translate to English: "Año Nuevo es en Enero"',
    accepted: [
      "new year's day is in january",
      "new year is in january",
      "new years day is in january",
      "new year is on january"
    ],
    displayCorrect: "New Year's Day is in January"
  },
  {
    prompt: 'Translate to English: "San Valentín es en Febrero"',
    accepted: [
      "valentine's day is in february",
      "valentines day is in february",
      "valentine is in february"
    ],
    displayCorrect: "Valentine's Day is in February"
  },
  {
    prompt: 'Write the date of Halloween (e.g. October 31st):',
    accepted: [
      'october 31st',
      'october 31',
      '31st of october',
      '31 october'
    ],
    displayCorrect: 'October 31st'
  },
  {
    prompt: 'Write the date of Christmas (e.g. December 25th):',
    accepted: [
      'december 25th',
      'december 25',
      '25th of december',
      '25 december'
    ],
    displayCorrect: 'December 25th'
  },
  {
    prompt: 'Translate to English: "El invierno es frío"',
    accepted: [
      'winter is cold',
      'winter is colder',
      'the winter is cold'
    ],
    displayCorrect: 'Winter is cold'
  },
  {
    prompt: 'Translate to English: "El verano es caluroso"',
    accepted: [
      'summer is warmest',
      'summer is warm',
      'summer is hot',
      'the summer is hot',
      'the summer is warm'
    ],
    displayCorrect: 'Summer is warm / warmest'
  },
  {
    prompt: 'Translate to English: "Pascua es en Abril"',
    accepted: [
      'easter is in april',
      'easter is on april',
      'easter in april'
    ],
    displayCorrect: 'Easter is in April'
  },
  {
    prompt: 'Translate to English: "El Día del Niño es en Agosto"',
    accepted: [
      "children's day is in august",
      "childrens day is in august",
      "children day is in august"
    ],
    displayCorrect: "Children's Day is in August"
  }
]

const currentQuestion = ref(null)

const isVictory = computed(() => bossHp.value <= 0)
const isGameOver = computed(() => hp.value <= 0)

// Helper: normalize text
const normalizeText = (text) => {
  return text
    .trim()
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ')
}

// Select random question ensuring no direct repetition
const pickQuestion = () => {
  const filtered = questionsPool.filter(q => q !== currentQuestion.value)
  const chosen = filtered[Math.floor(Math.random() * filtered.length)]
  currentQuestion.value = chosen
  startTypewriter(chosen.prompt)
}

// Typewriter
const startTypewriter = (text) => {
  if (typeInterval) clearInterval(typeInterval)
  displayedQuestion.value = ''
  isTyping.value = true
  let i = 0

  typeInterval = setInterval(() => {
    if (i < text.length) {
      displayedQuestion.value += text[i]
      i++
    } else {
      clearInterval(typeInterval)
      isTyping.value = false
    }
  }, 18)
}

// Fight Action
const fight = () => {
  if (!userAnswer.value.trim() || isProcessingTurn.value || isVictory.value || isGameOver.value) return

  isProcessingTurn.value = true
  const inputNormalized = normalizeText(userAnswer.value)
  const isMatch = currentQuestion.value.accepted.some(acc => normalizeText(acc) === inputNormalized)

  if (isMatch) {
    // PLAYER ATTACKS BOSS
    isBossHit.value = true
    bossHp.value = Math.max(0, bossHp.value - damageToBoss)
    totalExp.value += 125
    combatFeedback.value = {
      isSuccess: true,
      text: `25 DAMAGE! You strike the Amalgamate with temporal truth!`
    }

    setTimeout(() => {
      isBossHit.value = false
    }, 500)

    setTimeout(() => {
      isProcessingTurn.value = false
      userAnswer.value = ''
      combatFeedback.value = null

      if (bossHp.value > 0) {
        turnNumber.value++
        pickQuestion()
        nextTick(() => inputRef.value?.focus())
      }
    }, 1200)

  } else {
    // BOSS ATTACKS PLAYER
    isShaking.value = true
    isRedFlash.value = true
    hp.value = Math.max(0, hp.value - damageToPlayer)
    combatFeedback.value = {
      isSuccess: false,
      text: `MISSED! Answer: "${currentQuestion.value.displayCorrect}". You took ${damageToPlayer} damage!`
    }

    setTimeout(() => {
      isRedFlash.value = false
    }, 250)

    setTimeout(() => {
      isShaking.value = false
    }, 400)

    setTimeout(() => {
      isProcessingTurn.value = false
      userAnswer.value = ''
      combatFeedback.value = null

      if (hp.value > 0) {
        turnNumber.value++
        pickQuestion()
        nextTick(() => inputRef.value?.focus())
      }
    }, 1600)
  }
}

// Restart Battle
const restartBattle = () => {
  hp.value = maxHp
  bossHp.value = 100
  totalExp.value = 0
  turnNumber.value = 1
  userAnswer.value = ''
  combatFeedback.value = null
  isProcessingTurn.value = false
  pickQuestion()
  nextTick(() => inputRef.value?.focus())
}

onMounted(() => {
  restartBattle()
})

onUnmounted(() => {
  if (typeInterval) clearInterval(typeInterval)
})
</script>
