<template>
  <button class="theme-toggle" @click="toggleTheme">
    <span class="theme-icon">{{ isDark ? '🌞' : '🌙' }}</span>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const isDark = ref(false);

const toggleTheme = () => {
  isDark.value = !isDark.value;
  document.body.classList.toggle('dark-theme');
};
</script>

<style>
.theme-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #ffffff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 1000;
  transition: all 0.3s ease;
}

.theme-toggle:hover {
  transform: scale(1.1);
}

.theme-icon {
  font-size: 20px;
}

/* 深色主题样式 */
body.dark-theme {
  background-color: #1a1a1a !important;
  color: #ffffff !important;
}

body.dark-theme .todo-card {
  background: #2d2d2d !important;
  color: #ffffff !important;
}

body.dark-theme .todo-item {
  background: #3d3d3d !important;
  border-color: #4d4d4d !important;
}

body.dark-theme .nav-button {
  color: #ffffff !important;
}

body.dark-theme .sidebar {
  background-color: #2d2d2d !important;
}
</style>
