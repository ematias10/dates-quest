<template>
  <div class="min-h-screen bg-black text-white font-pixel flex flex-col justify-between selection:bg-undertale-yellow selection:text-black">
    
    <!-- VIEW: Main Menu -->
    <div v-if="currentView === 'menu'" class="w-full max-w-2xl mx-auto flex-1 flex flex-col justify-between py-6 px-4 sm:px-8">
      
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
          <span class="text-[10px] text-gray-400">TOUCH OR CLICK</span>
        </div>

        <nav class="space-y-3" aria-label="Level Selection">
          <!-- Level 1 Button (Active) -->
          <button
            @click="startLevel1"
            @mouseenter="selectedMenuIndex = 0"
            @focus="selectedMenuIndex = 0"
            :class="[
              'undertale-btn w-full p-4 text-xs sm:text-sm justify-between group min-h-[52px]',
              selectedMenuIndex === 0 ? 'text-undertale-yellow border-undertale-yellow bg-yellow-950/20' : 'text-white border-white'
            ]"
          >
            <div class="flex items-center gap-3">
              <!-- Heart Soul Indicator -->
              <span 
                class="text-undertale-red text-base select-none transition-transform"
                :class="selectedMenuIndex === 0 ? 'opacity-100 scale-110 soul-pulse' : 'opacity-0'"
              >
                ❤
              </span>
              <span class="tracking-wider">LEVEL 1: MULTIPLE CHOICE</span>
            </div>
            <span class="text-[10px] text-undertale-green uppercase tracking-widest hidden sm:inline-block">
              [READY]
            </span>
          </button>

          <!-- Level 2 Button (Active) -->
          <button
            @click="startLevel2"
            @mouseenter="selectedMenuIndex = 1"
            @focus="selectedMenuIndex = 1"
            :class="[
              'undertale-btn w-full p-4 text-xs sm:text-sm justify-between group min-h-[52px]',
              selectedMenuIndex === 1 ? 'text-undertale-yellow border-undertale-yellow bg-yellow-950/20' : 'text-white border-white'
            ]"
          >
            <div class="flex items-center gap-3">
              <span 
                class="text-undertale-red text-base select-none transition-transform"
                :class="selectedMenuIndex === 1 ? 'opacity-100 scale-110 soul-pulse' : 'opacity-0'"
              >
                ❤
              </span>
              <span class="tracking-wider">LEVEL 2: PAIR MATCHING</span>
            </div>
            <span class="text-[10px] text-undertale-green uppercase tracking-widest hidden sm:inline-block">
              [READY]
            </span>
          </button>

          <!-- Level 3 Button (Active) -->
          <button
            @click="startLevel3"
            @mouseenter="selectedMenuIndex = 2"
            @focus="selectedMenuIndex = 2"
            :class="[
              'undertale-btn w-full p-4 text-xs sm:text-sm justify-between group min-h-[52px]',
              selectedMenuIndex === 2 ? 'text-undertale-yellow border-undertale-yellow bg-yellow-950/20' : 'text-white border-white'
            ]"
          >
            <div class="flex items-center gap-3">
              <span 
                class="text-undertale-red text-base select-none transition-transform"
                :class="selectedMenuIndex === 2 ? 'opacity-100 scale-110 soul-pulse' : 'opacity-0'"
              >
                ❤
              </span>
              <span class="tracking-wider">LEVEL 3: HANGMAN SOUL</span>
            </div>
            <span class="text-[10px] text-undertale-green uppercase tracking-widest hidden sm:inline-block">
              [READY]
            </span>
          </button>

          <!-- Level 4 Button (Active) -->
          <button
            @click="startLevel4"
            @mouseenter="selectedMenuIndex = 3"
            @focus="selectedMenuIndex = 3"
            :class="[
              'undertale-btn w-full p-4 text-xs sm:text-sm justify-between group min-h-[52px]',
              selectedMenuIndex === 3 ? 'text-undertale-yellow border-undertale-yellow bg-yellow-950/20' : 'text-white border-white'
            ]"
          >
            <div class="flex items-center gap-3">
              <span 
                class="text-undertale-red text-base select-none transition-transform"
                :class="selectedMenuIndex === 3 ? 'opacity-100 scale-110 soul-pulse' : 'opacity-0'"
              >
                ❤
              </span>
              <span class="tracking-wider">LEVEL 4: DATE BUILDER</span>
            </div>
            <span class="text-[10px] text-undertale-green uppercase tracking-widest hidden sm:inline-block">
              [READY]
            </span>
          </button>

          <!-- Level 5 Button (Active Boss Fight) -->
          <button
            @click="startLevel5"
            @mouseenter="selectedMenuIndex = 4"
            @focus="selectedMenuIndex = 4"
            :class="[
              'undertale-btn w-full p-4 text-xs sm:text-sm justify-between group min-h-[52px]',
              selectedMenuIndex === 4 ? 'text-undertale-yellow border-undertale-yellow bg-yellow-950/20' : 'text-white border-white'
            ]"
          >
            <div class="flex items-center gap-3">
              <span 
                class="text-undertale-red text-base select-none transition-transform"
                :class="selectedMenuIndex === 4 ? 'opacity-100 scale-110 soul-pulse' : 'opacity-0'"
              >
                ❤
              </span>
              <span class="tracking-wider text-undertale-red">LEVEL 5: BOSS FIGHT</span>
            </div>
            <span class="text-[10px] text-undertale-red uppercase tracking-widest hidden sm:inline-block font-bold">
              [BOSS]
            </span>
          </button>
        </nav>

        <!-- Temporary notice when clicking locked level -->
        <div v-if="noticeMessage" class="mt-4 text-center text-xs text-undertale-yellow">
          * {{ noticeMessage }}
        </div>
      </main>

      <!-- Player HUD / Undertale Status Bar -->
      <footer class="w-full pixel-box-sm p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-300">
        <div class="flex items-center gap-4">
          <span class="text-white font-bold">FRISK</span>
          <span class="text-undertale-yellow">LV 1</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-undertale-red font-bold">HP</span>
          <div class="w-20 h-3 bg-red-900 border border-white">
            <div class="h-full bg-undertale-yellow w-full"></div>
          </div>
          <span class="text-[10px]">20/20</span>
        </div>
        <div class="text-[10px] text-gray-400">
          STATIC SPA
        </div>
      </footer>
    </div>

    <!-- VIEW: Level 1 Game Component -->
    <Level1_MultipleChoice 
      v-else-if="currentView === 'level1'"
      @back-to-menu="currentView = 'menu'" 
    />

    <!-- VIEW: Level 2 Matching Game Component -->
    <Level2_Matching
      v-else-if="currentView === 'level2'"
      @back-to-menu="currentView = 'menu'"
    />

    <!-- VIEW: Level 3 Hangman Game Component -->
    <Level3_Hangman
      v-else-if="currentView === 'level3'"
      @back-to-menu="currentView = 'menu'"
    />

    <!-- VIEW: Level 4 Date Builder Game Component -->
    <Level4_DateBuilder
      v-else-if="currentView === 'level4'"
      @back-to-menu="currentView = 'menu'"
    />

    <!-- VIEW: Level 5 Boss Battle Game Component -->
    <Level5_BossBattle
      v-else-if="currentView === 'level5'"
      @back-to-menu="currentView = 'menu'"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Level1_MultipleChoice from './components/Level1_MultipleChoice.vue'
import Level2_Matching from './components/Level2_Matching.vue'
import Level3_Hangman from './components/Level3_Hangman.vue'
import Level4_DateBuilder from './components/Level4_DateBuilder.vue'
import Level5_BossBattle from './components/Level5_BossBattle.vue'

// Current active view: 'menu' or 'level1' or 'level2'
const currentView = ref('menu')

// Menu selection index
const selectedMenuIndex = ref(0)
const noticeMessage = ref('')
let noticeTimeout = null

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

const startLevel1 = () => {
  currentView.value = 'level1'
}

const startLevel2 = () => {
  currentView.value = 'level2'
}

const startLevel3 = () => {
  currentView.value = 'level3'
}

const startLevel4 = () => {
  currentView.value = 'level4'
}

const startLevel5 = () => {
  currentView.value = 'level5'
}

const showLockedNotice = (levelNum) => {
  if (noticeTimeout) clearTimeout(noticeTimeout)
  noticeMessage.value = `Level ${levelNum} is currently locked! Clear earlier levels first.`
  noticeTimeout = setTimeout(() => {
    noticeMessage.value = ''
  }, 2500)
}

// Keyboard navigation support for authentic Undertale feel
const handleKeydown = (e) => {
  if (currentView.value !== 'menu') return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    selectedMenuIndex.value = (selectedMenuIndex.value + 1) % 5
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    selectedMenuIndex.value = (selectedMenuIndex.value - 1 + 5) % 5
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (selectedMenuIndex.value === 0) {
      startLevel1()
    } else if (selectedMenuIndex.value === 1) {
      startLevel2()
    } else if (selectedMenuIndex.value === 2) {
      startLevel3()
    } else if (selectedMenuIndex.value === 3) {
      startLevel4()
    } else if (selectedMenuIndex.value === 4) {
      startLevel5()
    }
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
