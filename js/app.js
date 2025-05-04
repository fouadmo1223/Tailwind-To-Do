// Enhanced ToDo App with modern features
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let taskIdCounter =
  tasks.length > 0 ? Math.max(...tasks.map((task) => task.id)) + 1 : 0;
let currentFilter = "all";

// DOM Elements
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const taskStats = document.getElementById("taskStats");
const totalCount = document.getElementById("totalCount");
const completedCount = document.getElementById("completedCount");

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  renderTaskList();
  updateStats();

  // Set up filter button active states
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      document
        .querySelectorAll(".filter-btn")
        .forEach((b) =>
          b.classList.remove("active", "bg-primary", "text-white")
        );
      this.classList.add("active", "bg-primary", "text-white");
    });
  });
});

// Add a new task
function addTask() {
  const taskName = taskInput.value.trim();

  if (taskName !== "") {
    const newTask = {
      id: taskIdCounter++,
      name: taskName,
      done: false,
      createdAt: new Date().toISOString(),
      priority: "medium",
    };

    tasks.unshift(newTask); 
    saveTasksToLocalStorage();
    renderTaskList();
    taskInput.value = "";
    taskInput.focus();

    showToast("Task added!", "success");
  }
}

// Toggle task completion with animation
function toggleTaskCompletion(taskId) {
  const task = tasks.find((t) => t.id === taskId);
  if (task) {
    task.done = !task.done;
    saveTasksToLocalStorage();

    // Find the task element
    const taskElement = document.querySelector(`li[data-id="${taskId}"]`);
    if (taskElement) {
      // Add animation class
      taskElement.classList.add("transition", "duration-300", "ease-in-out");

      // Toggle the line-through effect with delay for smooth animation
      const textElement = taskElement.querySelector(".task-text");
      if (task.done) {
        textElement.classList.add("line-through", "text-gray-400");
        textElement.classList.remove("text-gray-800");
      } else {
        textElement.classList.remove("line-through", "text-gray-400");
        textElement.classList.add("text-gray-800");
      }

      // Update the checkbox icon
      const checkbox = taskElement.querySelector(".checkbox");
      checkbox.className = `checkbox fas ${
        task.done ? "fa-check-circle text-green-500" : "fa-circle text-gray-300"
      }`;
    }

    updateStats();
  }
}

// Delete a task with confirmation
function deleteTask(taskId) {
  if (confirm("Are you sure you want to delete this task?")) {
    tasks = tasks.filter((task) => task.id !== taskId);
    saveTasksToLocalStorage();
    renderTaskList();
    showToast("Task deleted", "error");
  }
}

// Filter tasks
function filterTasks(filter) {
  currentFilter = filter;
  renderTaskList();
}

// Clear all completed tasks
function clearCompletedTasks() {
  if (tasks.some((task) => task.done)) {
    if (confirm("Are you sure you want to delete all completed tasks?")) {
      tasks = tasks.filter((task) => !task.done);
      saveTasksToLocalStorage();
      renderTaskList();
      showToast("Completed tasks cleared", "info");
    }
  } else {
    showToast("No completed tasks to clear", "info");
  }
}

// Clear all tasks
function clearAllTasks() {
  if (
    tasks.length > 0 &&
    confirm("Are you sure you want to delete ALL tasks?")
  ) {
    tasks = [];
    taskIdCounter = 0;
    saveTasksToLocalStorage();
    renderTaskList();
    showToast("All tasks cleared", "error");
  }
}

// Save tasks to localStorage
function saveTasksToLocalStorage() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  updateStats();
}

// Update task statistics
function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.done).length;

  if (total > 0) {
    taskStats.classList.remove("hidden");
    totalCount.textContent = total;
    completedCount.textContent = completed;
  } else {
    taskStats.classList.add("hidden");
  }
}

// Render the task list based on current filter
function renderTaskList() {
  taskList.innerHTML = "";

  // Filter tasks based on current selection
  let filteredTasks = [];
  switch (currentFilter) {
    case "active":
      filteredTasks = tasks.filter((task) => !task.done);
      break;
    case "completed":
      filteredTasks = tasks.filter((task) => task.done);
      break;
    default:
      filteredTasks = [...tasks];
  }

  if (filteredTasks.length === 0) {
    emptyState.style.display = "block";
    taskStats.classList.add("hidden");
  } else {
    emptyState.style.display = "none";

    filteredTasks.forEach((task, index) => {
      const taskElement = document.createElement("li");
      taskElement.className = `bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300`;
      taskElement.setAttribute("data-id", task.id);
      taskElement.setAttribute("data-aos", "fade-up");
      taskElement.setAttribute("data-aos-delay", `${index * 50}`);

      taskElement.innerHTML = `
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center flex-1 min-w-0">
            <button onclick="toggleTaskCompletion(${
              task.id
            })" class="mr-3 flex-shrink-0">
              <i class="checkbox fas ${
                task.done
                  ? "fa-check-circle text-green-500"
                  : "fa-circle text-gray-300"
              } text-xl"></i>
            </button>
            <span class="task-text truncate ${
              task.done ? "line-through text-gray-400" : "text-gray-800"
            }">${task.name}</span>
          </div>
          <button onclick="deleteTask(${task.id})" 
                  class="text-gray-400 hover:text-red-500 transition duration-200 flex-shrink-0 p-2 rounded-full hover:bg-red-50">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;

      taskList.appendChild(taskElement);
    });
  }

  updateStats();
}

// Show toast notification
function showToast(message, type) {
  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  const toast = document.createElement("div");
  toast.className = `fixed bottom-6 left-1/2 transform -translate-x-1/2 ${colors[type]} text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 z-50 animate-bounce`;
  toast.innerHTML = `
    <i class="fas ${
      type === "success"
        ? "fa-check-circle"
        : type === "error"
        ? "fa-exclamation-circle"
        : "fa-info-circle"
    }"></i>
    ${message}
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove("animate-bounce");
    toast.classList.add("opacity-0", "transition-opacity", "duration-300");
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// Keyboard support
taskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addTask();
  }
});
