<template>
  <div class="todo-container">
    <div class="todo-header">
      <h2>{{ targetDate }} 待办事项</h2>
    </div>

    <div class="todo-add">
      <el-input
        v-model="newTodoTitle"
        placeholder="请输入待办事件"
        class="todo-input"
        @keyup.enter="addTodo"
      />
      <el-button type="primary" @click="addTodo">添加</el-button>
    </div>

    <div class="todo-debug">
      待办总数：{{ todoList.length }} | 当前日期：{{ targetDate }} | 完成率：{{ completedPercentage }}%
    </div>

    <div class="progress-container">
      <div class="main-progress">
        <span class="progress-label">今日完成率：</span>
        <el-progress 
          :percentage="completedPercentage" 
          :format="formatProgress"
          class="full-width-progress"
          :color="getDynamicColor(completedPercentage)"
        ></el-progress>
      </div>
      <div class="sample-progress-group">
        <div class="sample-progress-item">
          <el-progress :percentage="25" :format="formatProgress" :color="getDynamicColor(25)"></el-progress>
        </div>
        <div class="sample-progress-item">
          <el-progress :percentage="50" :format="formatProgress" :color="getDynamicColor(50)"></el-progress>
        </div>
        <div class="sample-progress-item">
          <el-progress :percentage="75" :format="formatProgress" :color="getDynamicColor(75)"></el-progress>
        </div>
        <div class="sample-progress-item">
          <el-progress :percentage="100" status="success" :format="formatProgress"></el-progress>
        </div>
      </div>
    </div>

    <div class="todo-list">
      <div v-if="todoList.length === 0" class="todo-empty">
        <el-empty description="暂无待办，添加一个吧～" />
      </div>

      <div 
        class="todo-item" 
        v-for="(todo, index) in todoList" 
        :key="todo.id"
      >
        <el-checkbox
          v-model="todo.completed"
          size="large"
          @change="handleComplete(todo.id)"
        />
        <span 
          class="todo-title"
          :style="{ textDecoration: todo.completed ? 'line-through' : 'none', color: todo.completed ? '#909399' : '#303133' }"
        >
          {{ todo.title }}
        </span>
        <el-button
          type="danger"
          size="small"
          icon="el-icon-delete"
          @click="deleteTodo(todo.id)"
        >
          删除
        </el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  date: string;
}

const getTodosFromStorage = (): TodoItem[] => {
  try {
    const raw = localStorage.getItem('todoList')
    if (!raw) return []
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data.map(item => ({
      id: item.id || Date.now().toString(), // 兼容无id的旧数据
      title: item.title || '',
      completed: !!item.completed,
      date: item.date || ''
    })) : []
  } catch (e) {
    console.error('读取待办数据失败', e)
    return []
  }
}

const saveTodosToStorage = (todos: TodoItem[]) => {
  try {
    localStorage.setItem('todoList', JSON.stringify(todos))
  } catch (e) {
    console.error('保存待办数据失败', e)
  }
}

const route = useRoute()
const targetDate = ref<string>(
  new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date()).replace(/\//g, '-')
)

const newTodoTitle = ref('')
const allTodos = ref<TodoItem[]>(getTodosFromStorage())


const todoList = computed(() => {
  return allTodos.value.filter(todo => todo.date === targetDate.value)
})

const completedPercentage = computed(() => {
  const list = todoList.value
  if (list.length === 0) return 0
  const completedCount = list.filter(todo => todo.completed).length
  return Math.round((completedCount / list.length) * 100)
})


const formatProgress = (percentage: number) => {
  return percentage === 100 ? '满' : `${percentage}%`
}

const getDynamicColor = (percentage: number) => {
  if (percentage === 25) return '#4fc3f7'
  if (percentage === 50) return '#2196f3' 
  if (percentage === 75) return '#1976d2'
  if (percentage === 100) return '#67c23a' 
  return '#646cff' 
}

onMounted(() => {
  if (route.query.date && typeof route.query.date === 'string') {
    targetDate.value = route.query.date.replace(/\//g, '-')
  }
  saveTodosToStorage(allTodos.value)
})

const addTodo = () => {
  const title = newTodoTitle.value.trim()
  if (!title) {
    ElMessage.warning('请输入有效的待办标题！')
    return
  }

  const newTodo: TodoItem = {
    id: Date.now().toString(),
    title,
    completed: false,
    date: targetDate.value
  }

  allTodos.value.unshift(newTodo)
  newTodoTitle.value = ''
  ElMessage.success('待办添加成功！')
}

const deleteTodo = (id: string) => {
  const index = allTodos.value.findIndex(item => item.id === id)
  if (index > -1) {
    allTodos.value.splice(index, 1)
    ElMessage.info('待办已删除！')
  }
}

watch(allTodos, (newVal) => {
  console.log('待办列表变化：', newVal)
  saveTodosToStorage(newVal)
}, { deep: true })
</script>

<style scoped>
.todo-container {
  max-width: 1400px;
  width: 100%;
  margin: 20px auto;
  padding: 30px;
  box-sizing: border-box;
  text-align: left;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: transparent !important;
}

.todo-header {
  margin-bottom: 24px;
}
.todo-header h2 {
  margin: 0;
  color: #303133;
  font-size: 20px;
  font-weight: 600;
}

.todo-add {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
}
.todo-input {
  flex: 1;
  min-width: 0;
}

.todo-debug {
  margin-bottom: 24px;
  color: #666;
  font-size: 13px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
}

.progress-container {
  margin-bottom: 30px;
  padding: 16px 0;
  border-top: 1px solid #f0f2f5;
  border-bottom: 1px solid #f0f2f5;
}

.main-progress {
  margin-bottom: 20px;
}
.progress-label {
  font-size: 14px;
  color: #303133;
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}
.full-width-progress {
  width: 100% !important;
}

.sample-progress-group {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  align-items: center;
}
.sample-progress-item {
  flex: 1;
  min-width: 180px;
}
.sample-progress-item .el-progress {
  width: 100%;
}

:deep(.el-progress-bar__inner--success) {
  background-color: #67c23a !important; /* success绿色 */
}
:deep(.el-progress-bar__inner) {
  height: 8px; 
}

.todo-empty {
  text-align: center;
  padding: 60px 0;
  color: #909399;
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid #f0f2f5;
  transition: background 0.2s;
}
.todo-item:hover {
  background-color: #f5f7fa;
  border-radius: 6px;
}
.todo-title {
  flex: 1;
  font-size: 15px;
  line-height: 1.5;
}

:deep(.el-checkbox) {
  margin: 0;
}

@media (min-width: 1200px) {
  .todo-container {
    padding: 40px;
  }
  .sample-progress-group {
    flex-wrap: nowrap; 
  }
}
@media (max-width: 768px) {
  .todo-container {
    margin: 10px;
    padding: 20px;
  }
  .sample-progress-item {
    min-width: 120px;
  }
}
</style>