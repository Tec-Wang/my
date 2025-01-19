<template>
  <div class="goals-page">
    <div class="welcome-header">
      <h1>2025年目标 <span class="current-time">{{ currentTime }}</span></h1>
      <button class="add-goal-btn" @click="showAddGoalModal = true">+</button>
    </div>

    <div class="goals-container">
      <!-- 目标图结构 -->
      <div class="goals-graph">
        <!-- 顶级目标 -->
        <div class="goals-row">
          <div v-for="goal in topLevelGoals"
               :key="goal.id"
               class="goal-node parent-node"
               :data-id="goal.id"
               @dblclick="openEditMenu(goal)">
            <div class="goal-content">
              <h3>{{ goal.name }}</h3>
              <div v-if="getChildGoals(goal.id).length" class="progress">
                {{ getCompletionRate(goal.id) }}%
              </div>
            </div>
          </div>
        </div>

        <!-- 子目标层 -->
        <div v-for="(level, levelIndex) in childLevels"
             :key="levelIndex"
             class="goals-row">
          <div v-for="goal in level"
               :key="goal.id"
               class="goal-node child-node"
               :data-id="goal.id"
               @dblclick.stop="openEditMenu(goal)">
            <div class="goal-content">
              <h4>{{ goal.name }}</h4>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建目标弹窗 -->
    <div v-if="showAddGoalModal" class="modal-overlay" @click="showAddGoalModal = false">
      <div class="modal" @click.stop>
        <h3>创建新目标</h3>
        <form @submit.prevent="addGoal">
          <div class="form-group">
            <label>目标名称</label>
            <input
              v-model="newGoal.name"
              placeholder="输入目标名称"
              class="goal-input"
            >
          </div>
          <div class="form-group">
            <label>选择父级目标</label>
            <select v-model="newGoal.parentId" class="goal-select">
              <option value="">顶级目标</option>
              <option v-for="goal in topLevelGoals"
                      :key="goal.id"
                      :value="goal.id">
                {{ goal.name }}
              </option>
            </select>
          </div>
          <div class="modal-buttons">
            <button type="button" @click="showAddGoalModal = false">取消</button>
            <button type="submit">创建</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 编辑菜单弹窗 -->
    <div v-if="showEditMenu" class="modal-overlay" @click="closeEditMenu">
      <div class="modal edit-menu" @click.stop>
        <h3>目标操作</h3>
        <div class="edit-options">
          <button class="edit-btn" @click="startEdit">
            <span class="icon">✏️</span> 编辑目标
          </button>
          <button class="delete-btn" @click="confirmDelete">
            <span class="icon">🗑️</span> 删除目标
          </button>
        </div>
      </div>
    </div>

    <!-- 编辑目标弹窗 -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal" @click.stop>
        <h3>编辑目标</h3>
        <form @submit.prevent="saveEdit">
          <div class="form-group">
            <label>目标名称</label>
            <input
              v-model="editingGoal.name"
              placeholder="输入目标名称"
              class="goal-input"
            >
          </div>
          <div class="modal-buttons">
            <button type="button" class="delete-btn" @click="confirmDelete">
              <span class="icon">🗑️</span> 删除目标
            </button>
            <div class="action-buttons">
              <button type="button" @click="closeEditModal">取消</button>
              <button type="submit">保存</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';

interface Goal {
  id: number;
  name: string;
  parentId: number | null;
  completed: boolean;
}

const currentTime = ref('');


const showAddGoalModal = ref(false);
const goals = ref<Goal[]>([
  { id: 1, name: '事业目标', parentId: null, completed: false },
  { id: 2, name: '子目标1', parentId: 1, completed: false },
  { id: 3, name: '子目标2', parentId: 1, completed: true },
]);

const newGoal = ref({
  name: '',
  parentId: ''
});

// 获取顶级目标
const topLevelGoals = computed(() => {
  return goals.value.filter(goal => !goal.parentId);
});

// 获取子目标
const getChildGoals = (parentId: number) => {
  return goals.value.filter(goal => goal.parentId === parentId);
};

// 计算完成率
const getCompletionRate = (parentId: number) => {
  const children = getChildGoals(parentId);
  if (!children.length) return 0;
  const completed = children.filter(goal => goal.completed).length;
  return Math.round((completed / children.length) * 100);
};

// 添加新目标
const addGoal = () => {
  if (!newGoal.value.name.trim()) return;

  const goal: Goal = {
    id: Date.now(),
    name: newGoal.value.name,
    parentId: newGoal.value.parentId ? Number(newGoal.value.parentId) : null,
    completed: false
  };

  goals.value.push(goal);

  // 重置表单
  newGoal.value = { name: '', parentId: '' };
  showAddGoalModal.value = false;
};

// 计算子目标层级
const childLevels = computed(() => {
  const levels: Goal[][] = [];

  const processLevel = (parentIds: number[]) => {
    if (parentIds.length === 0) return;

    const levelGoals = goals.value.filter(goal =>
      goal.parentId !== null && parentIds.includes(goal.parentId)
    );

    if (levelGoals.length > 0) {
      levels.push(levelGoals);
      processLevel(levelGoals.map(g => g.id));
    }
  };

  // 从顶级目标的ID开始处理
  processLevel(topLevelGoals.value.map(g => g.id));

  return levels;
});

// 编辑相关的状态
const showEditMenu = ref(false);
const showEditModal = ref(false);
const selectedGoal = ref<Goal | null>(null);
const editingGoal = ref({ name: '' });

// 打开编辑菜单
const openEditMenu = (goal: Goal) => {
  selectedGoal.value = goal;
  showEditMenu.value = true;
};

// 关闭编辑菜单
const closeEditMenu = () => {
  showEditMenu.value = false;
  selectedGoal.value = null;
};

// 开始编辑
const startEdit = () => {
  if (selectedGoal.value) {
    editingGoal.value.name = selectedGoal.value.name;
    showEditMenu.value = false;
    showEditModal.value = true;
  }
};

// 关闭编辑弹窗
const closeEditModal = () => {
  showEditModal.value = false;
  editingGoal.value.name = '';
};

// 保存编辑
const saveEdit = () => {
  if (selectedGoal.value && editingGoal.value.name.trim()) {
    const index = goals.value.findIndex(g => g.id === selectedGoal.value?.id);
    if (index !== -1) {
      goals.value[index].name = editingGoal.value.name.trim();
    }
    closeEditModal();
  }
};

// 确认删除
const confirmDelete = () => {
  if (selectedGoal.value) {
    if (confirm('确定要删除这个目标吗？如果是父目标，其所有子目标也会被删除。')) {
      deleteGoal(selectedGoal.value.id);
      closeEditMenu();
    }
  }
};

// 删除目标及其子目标
const deleteGoal = (goalId: number) => {
  // 递归删除子目标
  const deleteChildren = (parentId: number) => {
    const children = goals.value.filter(g => g.parentId === parentId);
    children.forEach(child => deleteChildren(child.id));
    goals.value = goals.value.filter(g => g.parentId !== parentId);
  };

  deleteChildren(goalId);
  // 删除目标本身
  goals.value = goals.value.filter(g => g.id !== goalId);
};

// 添加组件名称声明
defineOptions({
  name: 'Goals2025View'
});
</script>

<style>
.goals-page {
  padding: 20px;
  position: relative;
}

.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.add-goal-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #1e88e5;
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.add-goal-btn:hover {
  transform: scale(1.1);
  background: #1976d2;
}

.goals-container {
  position: relative;
  padding: 40px;
}

.goals-graph {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 120px;
  align-items: center;
  padding: 60px;
}

.goals-row {
  display: flex;
  gap: 80px;
  justify-content: center;
  position: relative;
  width: 100%;
}

.goal-node {
  position: relative;
  min-width: 200px;
  padding: 20px;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 2;
}

.parent-node {
  margin-bottom: 40px;
}

.child-node {
  margin-top: 40px;
}

.goal-node:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.goal-content {
  position: relative;
  z-index: 2;
}

.goal-content h3,
.goal-content h4 {
  margin: 0 0 10px 0;
  color: #333;
}

.progress {
  font-size: 14px;
  color: #1e88e5;
}

/* 深色模式适配 */
body.dark-theme .goal-node {
  background: #2d2d2d;
  color: #ffffff;
}

body.dark-theme .parent-node {
  background: #1a237e;
  border-left-color: #3949ab;
}

body.dark-theme .child-node {
  background: #283593;
  border-left-color: #5c6bc0;
}

body.dark-theme .connector-container,
body.dark-theme .connector-line {
  background: #5c6bc0;
}

body.dark-theme .goal-content h3,
body.dark-theme .goal-content h4 {
  color: #ffffff;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #606266;
}

.goal-input, .goal-select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

/* 适配深色模式 */
body.dark-theme .parent-node {
  background: #1a237e;
  border-left-color: #3949ab;
}

body.dark-theme .child-node {
  background: #283593;
  border-left-color: #5c6bc0;
}

body.dark-theme .connector-container,
body.dark-theme .connector-line {
  background: #5c6bc0;
}

body.dark-theme .goal-content h3,
body.dark-theme .goal-content h4 {
  color: #ffffff;
}

.edit-menu {
  padding: 20px;
  min-width: 200px;
}

.edit-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.edit-btn, .delete-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  width: 100%;
}

.edit-btn {
  background: #e3f2fd;
  color: #1976d2;
}

.delete-btn {
  background: #ffebee;
  color: #d32f2f;
}

.edit-btn:hover {
  background: #bbdefb;
}

.delete-btn:hover {
  background: #ffcdd2;
}

.icon {
  font-size: 16px;
}

/* 深色模式适配 */
body.dark-theme .edit-btn {
  background: #1a237e;
  color: #fff;
}

body.dark-theme .delete-btn {
  background: #b71c1c;
  color: #fff;
}

body.dark-theme .edit-btn:hover {
  background: #283593;
}

body.dark-theme .delete-btn:hover {
  background: #c62828;
}

/* 修改弹窗相关样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* 增加层级确保在最上层 */
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  position: relative;
  z-index: 10000; /* 确保模态框在遮罩层之上 */
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
}

/* 深色模式下的弹窗样式 */
body.dark-theme .modal {
  background: #2d2d2d;
  color: #ffffff;
}

.modal-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 20px;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.delete-btn {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 4px;
  background: #ffebee;
  color: #d32f2f;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background: #ffcdd2;
}

/* 深色模式适配 */
body.dark-theme .delete-btn {
  background: #b71c1c;
  color: #fff;
}

body.dark-theme .delete-btn:hover {
  background: #c62828;
}

.child-node {
  pointer-events: auto;
}

/* 深色模式适配 */
body.dark-theme .connector-container {
  background: #5c6bc0;
}

body.dark-theme .connector-arrow {
  border-right-color: #5c6bc0;
  border-bottom-color: #5c6bc0;
}

/* 深色模式适配 */
body.dark-theme .connector-up {
  background: #5c6bc0;
}

body.dark-theme .connector-arrow {
  border-left-color: #5c6bc0;
  border-top-color: #5c6bc0;
}
</style>
