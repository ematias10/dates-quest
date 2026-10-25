<template>
  <div class="min-h-screen bg-black text-white font-pixel flex flex-col justify-between selection:bg-undertale-yellow selection:text-black">
    
    <!-- VIEW: Main Menu -->
    <div v-if="currentLevel === null" class="w-full max-w-2xl mx-auto flex-1 flex flex-col justify-between py-6 px-4 sm:px-8">
      
      <!-- Header / Title -->
      <header class="text-center my-4 sm:my-6">
        <div class="inline-block relative">
          <h1 class="text-2xl sm:text-4xl text-white tracking-widest uppercase drop-shadow-[0_4px_0_#333]">
            DATES QUEST
          </h1>
          <p class="text-[10px] sm:text-xs text-undertale-yellow mt-2 tracking-wider">
            -- UNDERTALE ENGLISH CHRONICLES --
          </p>
        </div>
      </header>

      <!-- Undertale Story Dialogue Box -->
      <section class="pixel-box p-4 sm:p-6 mb-6">
        <div class="flex items-start gap-3">
          <span class="text-undertale-red text-base sm:text-lg select-none soul-pulse">❤</span>
          <div class="text-xs sm:text-sm leading-relaxed text-gray-100 min-h-[4.5rem]">
            <span>{{ introDisplayedText }}</span>
            <span v-if="isTypingIntro" class="inline-block w-2 h-4 bg-white animate-pulse ml-1"></span>
          </div>
        </div>
        <div class="text-right mt-2">
          <button 
            v-if="isTypingIntro" 
            @click="skipIntroTypewriter" 
            class="text-[10px] text-gray-400 hover:text-white underline tracking-wider"
          >
            [SKIP]
          </button>
        </div>
      </section>

      <!-- Level Selection Menu (Undertale Battle Menu style) -->
      <main class="w-full flex-1 flex flex-col justify-center mb-6">
        <div class="text-xs sm:text-sm text-undertale-yellow mb-3 uppercase tracking-wider flex items-center justify-between">
          <span>* SELECT YOUR QUEST:</span>
          <span class="text-[10px] text-gray-400">UNLOCKED: {{ maxLevelUnlocked }}/5</span>
        </div>

        <nav class="space-y-3" aria-label="Level Selection">
          <button
            v-for="(lvl, index) in levelDefinitions"
            :key="lvl.id"
            @click="handleSelectLevel(lvl.id)"
            @mouseenter="selectedMenuIndex = index"
            @focus="selectedMenuIndex = index"
            :disabled="lvl.id > maxLevelUnlocked"
            :class="[
              'undertale-btn w-full p-4 text-xs sm:text-sm justify-between group min-h-[52px] transition-all',
              lvl.id > maxLevelUnlocked
                ? 'opacity-40 border-gray-800 text-gray-600 bg-black cursor-not-allowed'
                : selectedMenuIndex === index
                  ? 'text-undertale-yellow border-undertale-yellow bg-yellow-950/20'
                  : 'text-white border-white'
            ]"
          >
            <div class="flex items-center gap-3">
              <!-- Heart Soul Indicator -->
              <span 
                class="text-undertale-red text-base select-none transition-transform"
                :class="selectedMenuIndex === index && lvl.id <= maxLevelUnlocked ? 'opacity-100 scale-110 soul-pulse' : 'opacity-0'"
              >
                ❤
              </span>
              <span 
                class="tracking-wider" 
                :class="{ 'text-undertale-red': lvl.id === 5 && lvl.id <= maxLevelUnlocked }"
              >
                {{ lvl.title }}
              </span>
            </div>

            <!-- Status Badge -->
            <span 
              v-if="lvl.id > maxLevelUnlocked"
              class="text-[10px] text-gray-600 uppercase tracking-widest"
            >
              [LOCKED]
            </span>
            <span 
              v-else-if="lvl.id === 5"
              class="text-[10px] text-undertale-red uppercase tracking-widest hidden sm:inline-block font-bold"
            >
              [BOSS]
            </span>
            <span 
              v-else
              class="text-[10px] text-undertale-green uppercase tracking-widest hidden sm:inline-block"
            >
              [READY]
            </span>
          </button>
        </nav>

        <!-- Temporary notice when attempting locked level -->
        <div v-if="noticeMessage" class="mt-4 text-center text-xs text-undertale-yellow">
          * {{ noticeMessage }}
        </div>
      </main>

      <!-- Player HUD / Undertale Status Bar with Score, HighScore and 20 HP bar -->
      <footer class="w-full pixel-box-sm p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-300">
        <div class="flex items-center gap-4">
          <span class="text-white font-bold">FRISK</span>
          <span class="text-undertale-yellow">LV {{ maxLevelUnlocked }}</span>
        </div>

        <!-- HP Bar reflecting currentHP out of 20 -->
        <div class="flex items-center gap-2">
          <span class="text-undertale-red font-bold">HP</span>
          <div class="w-24 sm:w-28 h-3.5 bg-red-950 border border-white overflow-hidden relative">
            <div 
              class="h-full bg-undertale-yellow transition-all duration-300"
              :style="{ width: `${(currentHP / 20) * 100}%` }"
            ></div>
          </div>
          <span class="text-[10px] text-gray-300">{{ currentHP }}/20</span>
        </div>

        <!-- Score & High Score Display -->
        <div class="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs">
          <div>
            <span class="text-gray-400">SCORE:</span>
            <span class="text-undertale-yellow font-bold ml-1">{{ score }}</span>
          </div>
          <div>
            <span class="text-gray-400">HI:</span>
            <span class="text-undertale-green font-bold ml-1">{{ highScore }}</span>
          </div>
        </div>
      </footer>
    </div>

    <!-- VIEW: Active Game Level (Rendered dynamically) -->
    <div v-else class="w-full min-h-screen flex flex-col justify-between">
      
      <!-- Persistent BACK TO MENU abort bar visible ONLY during gameplay -->
      <header class="w-full border-b border-gray-800 bg-black/90 py-2 px-3 sm:px-6 sticky top-0 z-40">
        <div class="max-w-2xl mx-auto flex items-center justify-between">
          <button 
            @click="returnToMenu" 
            class="undertale-btn px-3 py-1 text-[11px] sm:text-xs text-gray-300 hover:text-undertale-yellow border-gray-700 hover:border-undertale-yellow min-h-[36px]"
          >
            &lt; BACK TO MENU
          </button>
          <span class="text-[10px] text-gray-500 uppercase tracking-widest hidden sm:inline-block">
            ABORT QUEST
          </span>
        </div>
      </header>

      <!-- Dynamic Level Component -->
      <div class="flex-1 flex flex-col justify-center">
        <component 
          :is="activeLevelComponent" 
          @back-to-menu="returnToMenu" 
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameState } from './composables/useGameState'

// Level Components
import Level1_MultipleChoice from './components/Level1_MultipleChoice.vue'
import Level2_Matching from './components/Level2_Matching.vue'
import Level3_Hangman from './components/Level3_Hangman.vue'
import Level4_DateBuilder from './components/Level4_DateBuilder.vue'
import Level5_BossBattle from './components/Level5_BossBattle.vue'

// Global Game State
const {
  maxLevelUnlocked,
  score,
  highScore,
  currentHP
} = useGameState()

// Component Mapping for Dynamic Routing
const levelsMap = {
  1: Level1_MultipleChoice,
  2: Level2_Matching,
  3: Level3_Hangman,
  4: Level4_DateBuilder,
  5: Level5_BossBattle
}

const levelDefinitions = [
  { id: 1, title: 'LEVEL 1: MULTIPLE CHOICE' },
  { id: 2, title: 'LEVEL 2: PAIR MATCHING' },
  { id: 3, title: 'LEVEL 3: HANGMAN SOUL' },
  { id: 4, title: 'LEVEL 4: DATE BUILDER' },
  { id: 5, title: 'LEVEL 5: BOSS FIGHT' }
]

// Current Level state: null for menu, 1 to 5 for active levels
const currentLevel = ref(null)

const activeLevelComponent = computed(() => {
  return currentLevel.value ? levelsMap[currentLevel.value] : null
})

// Navigation handlers
const selectedMenuIndex = ref(0)
const noticeMessage = ref('')
let noticeTimeout = null

const handleSelectLevel = (levelId) => {
  if (levelId <= maxLevelUnlocked.value) {
    currentLevel.value = levelId
  } else {
    showLockedNotice(levelId)
  }
}

const returnToMenu = () => {
  currentLevel.value = null
}

const showLockedNotice = (levelNum) => {
  if (noticeTimeout) clearTimeout(noticeTimeout)
  noticeMessage.value = `Level ${levelNum} is locked! Clear Level ${levelNum - 1} first.`
  noticeTimeout = setTimeout(() => {
    noticeMessage.value = ''
  }, 2500)
}

// Intro Typewriter
const introText = "* Long ago, monsters guarded the calendar gates. To escape the Underground, you must master the ancient dates, months, and days... Stay DETERMINED!"
const introDisplayedText = ref('')
const isTypingIntro = ref(false)
let introInterval = null

const startIntroTypewriter = () => {
  if (introInterval) clearInterval(introInterval)
  introDisplayedText.value = ''
  isTypingIntro.value = true
  let i = 0

  introInterval = setInterval(() => {
    if (i < introText.length) {
      introDisplayedText.value += introText[i]
      i++
    } else {
      clearInterval(introInterval)
      isTypingIntro.value = false
    }
  }, 20)
}

const skipIntroTypewriter = () => {
  if (isTypingIntro.value) {
    if (introInterval) clearInterval(introInterval)
    introDisplayedText.value = introText
    isTypingIntro.value = false
  }
}

// Keyboard navigation support for menu
const handleKeydown = (e) => {
  if (currentLevel.value !== null) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedMenuIndex.value = (selectedMenuIndex.value + 1) % levelDefinitions.length
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedMenuIndex.value = (selectedMenuIndex.value - 1 + levelDefinitions.length) % levelDefinitions.length
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const targetLevelId = levelDefinitions[selectedMenuIndex.value].id
    handleSelectLevel(targetLevelId)
  }
}

onMounted(() => {
  startIntroTypewriter()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  if (introInterval) clearInterval(introInterval)
  if (noticeTimeout) clearTimeout(noticeTimeout)
  window.removeEventListener('keydown', handleKeydown)
})
</script>
