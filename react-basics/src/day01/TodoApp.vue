<script setup lang="ts">
import { ref, computed } from 'vue'

type Filter = 'all' | 'active' | 'done'

interface Todo {
  id: number
  text: string
  done: boolean
}

const todos = ref<Todo[]>([])
const input = ref('')
const filter = ref<Filter>('all')

const filteredTodos = computed(() => {
  if (filter.value === 'active') return todos.value.filter((t) => !t.done)
  if (filter.value === 'done') return todos.value.filter((t) => t.done)
  return todos.value
})

const remainingCount = computed(() => todos.value.filter((t) => !t.done).length)

function addTodo() {
  const text = input.value.trim()
  if (!text) return
  todos.value.push({ id: Date.now(), text, done: false })
  input.value = ''
}

function removeTodo(id: number) {
  const index = todos.value.findIndex((t) => t.id === id)
  todos.value.splice(index, 1)
}

function toggleTodo(todo: Todo) {
  todo.done = !todo.done
}
</script>

<template>
  <div>
    <h1>Todo</h1>

    <form @submit.prevent="addTodo">
      <input v-model="input" placeholder="할 일을 입력하세요" />
      <button type="submit">추가</button>
    </form>

    <div>
      <button
        v-for="f in (['all', 'active', 'done'] as Filter[])"
        :key="f"
        :class="{ active: filter === f }"
        @click="filter = f"
      >
        {{ f }}
      </button>
    </div>

    <p>남은 할 일 {{ remainingCount }}개</p>

    <p v-if="filteredTodos.length === 0">할 일이 없습니다</p>
    <ul v-else>
      <li v-for="todo in filteredTodos" :key="todo.id">
        <input type="checkbox" :checked="todo.done" @change="toggleTodo(todo)" />
        <span :class="{ done: todo.done }">{{ todo.text }}</span>
        <button @click="removeTodo(todo.id)">삭제</button>
      </li>
    </ul>
  </div>
</template>
