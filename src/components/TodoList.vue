<template>
  <div class="todo-page">
    <div class="welcome-header">
      <h1>你好，这是待办清单 <span class="current-time">{{ currentTime }}</span></h1>
    </div>
    <div class="todo-container">
      <!-- 待办事项清单卡片 -->
      <div v-for="list in todoLists" :key="list.id" class="todo-card">
        <div class="list-header">
          <div v-if="!list.isEditingTitle" @dblclick="startEditTitle(list)" class="list-title">
            {{ list.title }}
          </div>
          <input
            v-else
            v-model="list.editingTitle"
            @blur="saveTitle(list)"
            @keyup.enter="saveTitle(list)"
            ref="titleInput"
            class="title-input"
          >
          <button class="delete-btn" @click="confirmDeleteList(list.id)">×</button>
        </div>
        <div class="todo-items">
          <div class="items-container">
            <div v-for="item in list.items" :key="item.id" class="todo-item">
              <div v-if="!item.isEditing" @dblclick="startEditItem(item)" class="item-content">
                <input
                  type="checkbox"
                  v-model="item.completed"
                  class="item-checkbox"
                >
                <span
                  :class="{ completed: item.completed }"
                  class="item-text"
                  :title="item.text"
                >{{ truncateText(item.text) }}</span>
              </div>
              <input
                v-else
                v-model="item.editingText"
                @blur="saveItem(list.id, item)"
                @keyup.enter="saveItem(list.id, item)"
                class="edit-item-input"
              >
              <button class="delete-item-btn" @click="deleteItem(list.id, item.id)">×</button>
            </div>
          </div>
          <!-- 添加新待办事项的输入框 -->
          <form @submit.prevent="addItem(list.id)" class="add-item-form">
            <input
              v-model="list.newItem"
              placeholder="添加新的待办事项"
              class="item-input"
              @blur="handleBlur(list.id)"
            >
          </form>
        </div>
      </div>

      <!-- 添加新待办清单的卡片 -->
      <div class="todo-card add-card" @click="showAddListForm">
        <div class="plus-icon">+</div>
      </div>

      <!-- 添加新待办清单的弹窗 -->
      <div v-if="showForm" class="modal-overlay" @click="showForm = false">
        <div class="modal" @click.stop>
          <h3>创建新的待办清单</h3>
          <form @submit.prevent="addList">
            <input
              v-model="newListTitle"
              placeholder="输入清单标题"
              class="todo-input"
              ref="listInput"
            >
            <div class="modal-buttons">
              <button type="button" @click="showForm = false">取消</button>
              <button type="submit">创建</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue';

interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
  isEditing: boolean;
  editingText: string;
}

interface TodoList {
  id: number;
  title: string;
  items: TodoItem[];
  newItem: string;
  isEditingTitle: boolean;
  editingTitle: string;
}

const todoLists = ref<TodoList[]>([
  {
    id: 1,
    title: 'List 1',
    items: [
      { id: 1, text: '吃饭', completed: false, isEditing: false, editingText: '' },
      { id: 2, text: '睡觉', completed: false, isEditing: false, editingText: '' },
      { id: 3, text: '打豆豆', completed: false, isEditing: false, editingText: '' },
    ],
    newItem: '',
    isEditingTitle: false,
    editingTitle: ''
  },
  {
    id: 2,
    title: 'List 2',
    items: [],
    newItem: '',
    isEditingTitle: false,
    editingTitle: ''
  }
]);

const showForm = ref(false);
const newListTitle = ref('');
const listInput = ref<HTMLInputElement | null>(null);

const showAddListForm = () => {
  showForm.value = true;
  setTimeout(() => {
    listInput.value?.focus();
  }, 100);
};

const addList = () => {
  if (newListTitle.value.trim() === '') return;

  const newList: TodoList = {
    id: Date.now(),
    title: newListTitle.value,
    items: [],
    newItem: '',
    isEditingTitle: false,
    editingTitle: ''
  };

  todoLists.value.push(newList);
  newListTitle.value = '';
  showForm.value = false;
};

const confirmDeleteList = (listId: number) => {
  if (confirm('确定要删除这个待办清单吗？')) {
    deleteList(listId);
  }
};

const deleteList = (listId: number) => {
  todoLists.value = todoLists.value.filter(list => list.id !== listId);
};

const addItem = (listId: number) => {
  const list = todoLists.value.find(l => l.id === listId);
  if (!list || list.newItem.trim() === '') return;

  const newItem: TodoItem = {
    id: Date.now(),
    text: list.newItem,
    completed: false,
    isEditing: false,
    editingText: ''
  };

  list.items.push(newItem);
  list.newItem = '';
};

const deleteItem = (listId: number, itemId: number) => {
  const list = todoLists.value.find(l => l.id === listId);
  if (!list) return;

  list.items = list.items.filter(item => item.id !== itemId);
};

const startEditTitle = (list: TodoList) => {
  list.isEditingTitle = true;
  list.editingTitle = list.title;
  nextTick(() => {
    const input = document.querySelector('.title-input') as HTMLInputElement;
    input?.focus();
  });
};

const saveTitle = (list: TodoList) => {
  if (list.editingTitle.trim()) {
    list.title = list.editingTitle.trim();
  }
  list.isEditingTitle = false;
};

const startEditItem = (item: TodoItem) => {
  item.isEditing = true;
  item.editingText = item.text;
  nextTick(() => {
    const input = document.querySelector('.edit-item-input') as HTMLInputElement;
    input?.focus();
  });
};

const saveItem = (listId: number, item: TodoItem) => {
  if (item.editingText.trim()) {
    item.text = item.editingText.trim();
  }
  item.isEditing = false;
};

const handleBlur = (listId: number) => {
  const list = todoLists.value.find(l => l.id === listId);
  if (list && list.newItem.trim() !== '') {
    addItem(listId);
  }
};

// 添加时间相关的代码
const currentTime = ref('');
let timer: number;

const updateTime = () => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  currentTime.value = `${hours}:${minutes}:${seconds}`;
};

onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 1000);
});

onUnmounted(() => {
  clearInterval(timer);
});

// 添加文本截断函数
const truncateText = (text: string) => {
  return text.length > 20 ? text.slice(0, 20) + '...' : text;
};
</script>

<style>
.todo-page {
  padding: 20px;
}

.welcome-header {
  margin-bottom: 30px;
}

.welcome-header h1 {
  color: #606266;
  font-size: 24px;
  font-weight: 500;
}

.current-time {
  color: #909399;
  font-size: 20px;
  margin-left: 10px;
}

.todo-container {
  background-color: transparent;
}

.todo-card {
  background: #ffffff;
  border: none;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

.add-card {
  background: #fafafa;
  border: 2px dashed #e4e7ed;
}

.todo-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  padding: 20px;
  max-width: 1600px;
  margin: 0 auto;
}

.todo-card {
  position: relative;
  min-height: 200px;
  padding: 20px;
  background: #fff9dc;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  min-width: 250px;
}

.list-title {
  margin: 0 0 15px 0;
  padding-right: 30px;
}

.todo-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
}

.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: #f8fafc;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  min-height: 40px; /* 确保每个项目高度一致 */
}

.delete-item-btn {
  border: none;
  background: none;
  color: #666;
  cursor: pointer;
  opacity: 0.5;
}

.delete-item-btn:hover {
  opacity: 1;
  color: #ff4444;
}

.add-item-form {
  margin-top: 10px;
}

.item-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: rgba(255,255,255,0.8);
}

.todo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.delete-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  font-size: 20px;
  color: #666;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.delete-btn:hover {
  opacity: 1;
  color: #ff4444;
}

.add-card {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f0f0f0;
  cursor: pointer;
}

.plus-icon {
  font-size: 40px;
  color: #909399;
}

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
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
}

.todo-input {
  width: 100%;
  padding: 8px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.modal-buttons button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal-buttons button[type="submit"] {
  background: #4CAF50;
  color: white;
}

.modal-buttons button[type="button"] {
  background: #f5f5f5;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.title-input {
  width: calc(100% - 30px);
  padding: 8px;
  font-size: 1.17em;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin: 0;
}

.item-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.item-checkbox {
  margin: 0;
}

.completed {
  text-decoration: line-through;
  color: #888;
}

.edit-item-input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 8px;
}

.todo-item {
  background: #f8fafc;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 640px) {
  .todo-container {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 1400px) {
  .todo-container {
    grid-template-columns: repeat(4, 1fr);
  }
}

.items-container {
  max-height: 210px; /* 调整高度，让5条记录后就出现滚动条 */
  overflow-y: auto;
  overflow-x: hidden;
  margin-bottom: 10px;
  scrollbar-width: thin;
  scrollbar-color: #888 #f1f1f1;
}

/* 自定义 Webkit 浏览器的滚动条样式 */
.items-container::-webkit-scrollbar {
  width: 6px;
}

.items-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.items-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.items-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.todo-item {
  min-height: 42px; /* 稍微调整每个项目的高度 */
  width: 100%;
  box-sizing: border-box;
}

.item-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0; /* 允许子元素缩小 */
  overflow: hidden; /* 防止内容溢出 */
}

.item-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1; /* 让文本占据剩余空间 */
  min-width: 0; /* 允许文本缩小 */
  position: relative;
}

.item-text:hover::after {
  content: attr(title);
  position: absolute;
  left: 0;
  top: 100%;
  background: #333;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
  white-space: normal;
  max-width: 300px;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
</style>
