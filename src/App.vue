<template>
  <div class="app-container">
    <ThemeToggle />
    <nav class="sidebar" :class="{ 'sidebar-collapsed': isCollapsed }">
      <div class="sidebar-toggle" @click="toggleSidebar">
        <span class="toggle-icon">{{ isCollapsed ? '→' : '←' }}</span>
      </div>
      <div class="nav-links" :class="{ 'links-collapsed': isCollapsed }">
        <router-link
          to="/todo"
          class="nav-button"
          :class="{ 'active': currentRoute === '/todo' }"
        >
          <span class="nav-icon">📝</span>
          <span class="nav-text" :class="{ 'hidden': isCollapsed }">待办清单</span>
        </router-link>

        <router-link
          to="/goals2025"
          class="nav-button"
          :class="{ 'active': currentRoute === '/goals2025' }"
        >
          <span class="nav-icon">🎯</span>
          <span class="nav-text" :class="{ 'hidden': isCollapsed }">DAG</span>
        </router-link>
      </div>
    </nav>
    <main class="main-content" :class="{ 'content-expanded': isCollapsed }">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import ThemeToggle from './components/ThemeToggle.vue';

const route = useRoute();
const isCollapsed = ref(false);
const currentRoute = computed(() => route.path);

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};
</script>

<style>
/* 添加全局样式 */
body {
  margin: 0;
  padding: 0;
  background-color: #f0f2f5;
  color: #2c3e50;
  transition: all 0.3s ease;
}

.app-container {
  display: flex;
  min-height: 100vh;
  margin: 0;
  position: relative;
  min-height: 100vh;
}

.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 240px;
  background-color: #1e88e5; /* 改为蓝色 */
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 1000;
  transition: all 0.3s ease-in-out;
}

.sidebar-collapsed {
  width: 60px;
}

.sidebar-toggle {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2) !important; /* 半透明白色 */
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff;
  transition: all 0.3s ease;
  font-size: 18px;
}

.sidebar-toggle:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  transform: scale(1.05);
}

.nav-links {
  padding: 60px 8px 20px 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: opacity 0.3s ease;
}

.nav-button {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: transparent;
  border-radius: 8px;
  color: #ffffff !important;
  text-decoration: none;
  font-size: 16px;
  transition: all 0.3s ease;
  white-space: nowrap;
  position: relative;
}

.nav-icon {
  font-size: 20px;
  width: 24px;
  text-align: center;
  position: relative;
  z-index: 2;
}

.nav-button:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.nav-button.active {
  background-color: rgba(255, 255, 255, 0.2) !important;
  color: #ffffff !important;
}

.main-content {
  margin-left: 240px;
  flex: 1;
  padding: 20px;
  transition: margin-left 0.3s ease;
  min-height: 100vh;
}

.content-expanded {
  margin-left: 60px;
}

.hidden {
  display: none;
}

.nav-text {
  position: absolute;
  left: 48px;
  opacity: 1;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.links-collapsed .nav-text {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.toggle-icon {
  transition: transform 0.3s ease;
}

/* 添加响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    height: 100vh;
    z-index: 1000;
  }

  .sidebar-collapsed {
    transform: translateX(-100%);
  }

  .content-expanded {
    margin-left: 0;
  }
}

.sidebar-collapsed .nav-button {
  padding: 12px;
}

.sidebar-collapsed .nav-text {
  opacity: 0;
}
</style>
