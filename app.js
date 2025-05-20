// Task Manager JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const taskInput = document.getElementById('task-input');
    const taskPriority = document.getElementById('task-priority');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const tasksCount = document.getElementById('tasks-count');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const clearCompletedBtn = document.getElementById('clear-completed-btn');
    const themeBtn = document.getElementById('theme-btn');
    const taskTemplate = document.getElementById('task-template');

    // App State
    let tasks = [];
    let currentFilter = 'all';
    
    // Initialize app
    initApp();

    // Event Listeners
    addTaskBtn.addEventListener('click', addNewTask);
    taskInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') addNewTask();
    });
    
    taskList.addEventListener('click', handleTaskActions);
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setActiveFilter(btn.dataset.filter);
        });
    });
    
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    
    themeBtn.addEventListener('click', toggleTheme);

    // Functions
    function initApp() {
        // Load tasks from localStorage
        loadTasks();
        
        // Load user preferences
        loadUserPreferences();
        
        // Render initial task list
        renderTasks();
        
        // Update task count
        updateTasksCount();
    }

    function addNewTask() {
        const text = taskInput.value.trim();
        if (!text) return;

        const newTask = {
            id: Date.now(),
            text: text,
            completed: false,
            priority: taskPriority.value,
            createdAt: new Date()
        };

        tasks.push(newTask);
        saveTasks();
        
        // Clear input
        taskInput.value = '';
        
        // Add with animation
        renderTasks();
        animateLastTask();
        
        // Update task count
        updateTasksCount();
    }

    function animateLastTask() {
        if (taskList.lastElementChild) {
            taskList.lastElementChild.style.animation = 'none';
            // Force a reflow
            void taskList.lastElementChild.offsetWidth;
            taskList.lastElementChild.style.animation = 'slideIn 0.3s ease-out';
        }
    }

    function handleTaskActions(e) {
        const taskItem = e.target.closest('.task-item');
        if (!taskItem) return;
        
        const taskId = parseInt(taskItem.dataset.id);
        
        // Handle checkbox
        if (e.target.classList.contains('task-checkbox')) {
            toggleTaskStatus(taskId);
        }
        
        // Handle delete button
        if (e.target.classList.contains('delete-btn')) {
            removeTask(taskId, taskItem);
        }
        
        // Handle edit button
        if (e.target.classList.contains('edit-btn')) {
            editTask(taskId);
        }
    }

    function toggleTaskStatus(taskId) {
        const task = tasks.find(task => task.id === taskId);
        if (task) {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
            updateTasksCount();
        }
    }

    function removeTask(taskId, taskElement) {
        // Add animation class
        taskElement.classList.add('removing');
        
        // Wait for animation to finish
        setTimeout(() => {
            tasks = tasks.filter(task => task.id !== taskId);
            saveTasks();
            renderTasks();
            updateTasksCount();
        }, 300);
    }

    function editTask(taskId) {
        const task = tasks.find(task => task.id === taskId);
        if (!task) return;
        
        const newText = prompt('Edit task:', task.text);
        if (newText !== null && newText.trim() !== '') {
            task.text = newText.trim();
            saveTasks();
            renderTasks();
        }
    }

    function setActiveFilter(filter) {
        currentFilter = filter;
        
        // Update active filter button
        filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        // Save user preference
        saveUserPreference('currentFilter', filter);
        
        // Re-render tasks with the new filter
        renderTasks();
    }

    function clearCompletedTasks() {
        const completedTaskElements = document.querySelectorAll('.task-item.completed');
        
        // Add animation to each completed task
        completedTaskElements.forEach(el => {
            el.classList.add('removing');
        });
        
        // Wait for animation to finish
        setTimeout(() => {
            tasks = tasks.filter(task => !task.completed);
            saveTasks();
            renderTasks();
            updateTasksCount();
        }, 300);
    }

    function toggleTheme() {
        const body = document.body;
        const isDarkTheme = body.classList.toggle('dark-theme');
        
        // Add animation class temporarily
        body.classList.add('theme-transition');
        setTimeout(() => {
            body.classList.remove('theme-transition');
        }, 500);
        
        // Update button text
        themeBtn.textContent = isDarkTheme ? '☀️' : '🌙';
        
        // Save user preference
        saveUserPreference('darkTheme', isDarkTheme);
    }

    function renderTasks() {
        // Clear task list
        taskList.innerHTML = '';
        
        // Filter tasks
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'active') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true; // 'all' filter
        });
        
        // Sort tasks by priority and creation date
        const sortedTasks = filteredTasks.sort((a, b) => {
            const priorityOrder = { high: 1, medium: 2, low: 3 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return b.createdAt - a.createdAt;
        });
        
        // Render each task
        sortedTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            taskList.appendChild(taskElement);
        });
    }

    function createTaskElement(task) {
        // Clone template
        const taskElement = document.importNode(taskTemplate.content, true).querySelector('.task-item');
        
        // Set task data
        taskElement.dataset.id = task.id;
        if (task.completed) {
            taskElement.classList.add('completed');
        }
        
        // Set task content
        const checkbox = taskElement.querySelector('.task-checkbox');
        checkbox.checked = task.completed;
        
        const taskText = taskElement.querySelector('.task-text');
        taskText.textContent = task.text;
        
        const priorityEl = taskElement.querySelector('.task-priority');
        priorityEl.textContent = task.priority;
        priorityEl.dataset.priority = task.priority;
        
        return taskElement;
    }

    function updateTasksCount() {
        const activeCount = tasks.filter(task => !task.completed).length;
        tasksCount.textContent = `${activeCount} task${activeCount !== 1 ? 's' : ''} remaining`;
    }

    // Storage functions
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
            // Convert date strings back to Date objects
            tasks.forEach(task => {
                task.createdAt = new Date(task.createdAt);
            });
        }
    }

    function saveUserPreference(key, value) {
        const preferences = getUserPreferences();
        preferences[key] = value;
        localStorage.setItem('userPreferences', JSON.stringify(preferences));
    }

    function getUserPreferences() {
        const storedPreferences = localStorage.getItem('userPreferences');
        return storedPreferences ? JSON.parse(storedPreferences) : {};
    }

    function loadUserPreferences() {
        const preferences = getUserPreferences();
        
        // Apply dark theme preference
        if (preferences.darkTheme) {
            document.body.classList.add('dark-theme');
            themeBtn.textContent = '☀️';
        }
        
        // Apply filter preference
        if (preferences.currentFilter) {
            setActiveFilter(preferences.currentFilter);
        }
    }
});