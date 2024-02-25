<script setup lang="ts">
import { onMounted, ref, type DirectiveBinding, watch } from 'vue';
import type { ITask, TYPE_STATUS_TASK } from './interfaces/todo.interface';

const randomId = () => `${Math.floor(Math.random() * 1000)}`;
const tasks = ref < ITask[] > ([]);
const taskName = ref < string > ('');
const tabActive = ref < 'all' | 'pending' | 'completed' > ('all');
const taskEdit = ref < ITask | null> ();

const checkTypeTask = (): boolean => {
    if (tabActive.value === 'all') {
        return !tasks.value.length
    }
    const taskOtherStatus = tasks.value.filter(task => task.status === tabActive.value);
    return !taskOtherStatus.length;
}

onMounted(() => {
    const tasksStorage = localStorage.getItem('tasks');
    if (tasksStorage) {
        tasks.value = JSON.parse(tasksStorage);
    }
});

watch(tasks, newTab => {
    localStorage.setItem('tasks', JSON.stringify(newTab));
}, { deep: true })

const addTask = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
        const input = taskName.value;
        if (input === '') {
            return;
        }
        if (!taskEdit.value) {
            const task: ITask = {
                id: randomId(),
                name: input,
                status: 'pending',
            };
            tasks.value.push(task);
            taskName.value = '';
            return;
        }
        taskEdit.value.name = input;
        taskName.value = '';
        taskEdit.value = null;
    }
};

const editTask = (id: string) => {
    const taskEditCurrent = tasks.value.find(task => task.id === id);
    if (taskEditCurrent) {
        taskEdit.value = taskEditCurrent;
        taskName.value = taskEditCurrent.name;
    }
}

const checkTaskCompleted = (id: string) => {
    const taskCompleted = tasks.value.find(task => task.id === id);
    if (taskCompleted) {
        taskCompleted.status = taskCompleted.status === 'pending' ? 'completed' : 'pending';
    }
}

const deleteTask = (id: string) => {
    const index = tasks.value.findIndex(task => task.id === id);
    if (index === -1) {
        return;
    }
    taskEdit.value = null;
    taskName.value = '';
    tasks.value.splice(index, 1);
}

const getType = (type: 'all' | 'pending' | 'completed') => {
    tabActive.value = type;
};

const clearAllTask = () => {
    tasks.value = [];
    taskName.value = '';
    taskEdit.value = null;
}

const vCompleted = {
    mounted: (el: HTMLElement, { value }: DirectiveBinding) => {
        const status = value as TYPE_STATUS_TASK;
        if (status === 'completed') {
            el.classList.add('text-decoration-line-through', 'text-muted');
        }
    },
    updated: (el: HTMLElement, { value }: DirectiveBinding) => {
        const status = value as TYPE_STATUS_TASK;
        if (status === 'completed') {
            el.classList.add('text-decoration-line-through', 'text-muted');
            return;
        }
        el.classList.remove('text-decoration-line-through', 'text-muted');
    }
}

const vFocus = {
    updated: (el: HTMLElement) => {
        el.focus();
    }
}

const vEmptyTask = {
    updated: (el: HTMLElement) => {
        if (checkTypeTask()) {
            el.style.display = 'block';
            return;
        }
        el.style.display = 'none';
    }
}

const vActiveTab = {
  mounted: (el: HTMLElement, {value}: DirectiveBinding) => {
    if(tabActive.value === value) {
      el.classList.add('active');
    }
  },
  updated: (el: HTMLElement, {value}: DirectiveBinding) => {
    if(tabActive.value === value) {
      el.classList.add('active');
      return;
    }
    el.classList.remove('active');
  }
}
</script>

<template>
    <div class="d-flex flex-column align-items-center justify-content-center">
        <header>
            <h1>TODO VUE3</h1>
        </header>

        <main style="width: 500px; border: 1px solid black" class="p-3 rounded-1">
            <input v-focus type="text" placeholder="Press enter to add or edit task..." class="w-100" @keydown="addTask" v-model="taskName">
            <div class="d-flex justify-content-between pt-2">
                <div class="d-flex align-items-center gap-2">
                    <button v-active-tab="'all'" @click="getType('all')">All</button>
                    <button v-active-tab="'pending'" @click="getType('pending')">Pending</button>
                    <button v-active-tab="'completed'" @click="getType('completed')">Completed</button>
                </div>
                <button @click="clearAllTask">Clear All</button>
            </div>
            <div style="border-top: 1px solid black" class="my-2"> </div>
            <div v-for="task in tasks" :key="task.id">
                <div class="item-todo d-flex justify-content-between align-items-center py-1" v-if="tabActive === 'all' ? true : task.status === tabActive">
                    <div class="item-todo_label">
                        <input type="checkbox" :checked="task.status === 'completed'" @click="checkTaskCompleted(task.id)">
                        <label class="ps-2" v-completed="task.status">{{ task.name }}</label>
                    </div>
                    <div class="item-todo_action d-flex align-items-center gap-1">
                        <button @click="editTask(task.id)">Edit</button>
                        <button @click="deleteTask(task.id)">Delete</button>
                    </div>
                </div>
            </div>
            <div v-empty-task>
                No Task...
            </div>
        </main>
    </div>
</template>

<style>

.active {
  background-color: rgb(7, 172, 7);
  color: whitesmoke;
}
</style>