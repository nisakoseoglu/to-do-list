
const taskInput = document.getElementById("taskInput");
const category = document.getElementById("category");
const priority = document.getElementById("priority");
const date = document.getElementById("date");
const addBtn = document.getElementById("addBtn");

const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const taskList = document.getElementById("taskList");

const totalTask = document.getElementById("totalTask");
const completedTask = document.getElementById("completedTask");
const remainingTask = document.getElementById("remainingTask");
const overdueTask = document.getElementById("overdueTask");

const favoriteTask = document.getElementById("favoriteTask");
const todayTask = document.getElementById("todayTask");

const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

const focusTask = document.getElementById("focusTask");

const notificationCount = document.getElementById("notificationCount");
const taskCounter = document.getElementById("taskCounter");
const emptyState = document.getElementById("emptyState");

const schoolCount = document.getElementById("schoolCount");
const workCount = document.getElementById("workCount");
const personalCount = document.getElementById("personalCount");
const generalCount = document.getElementById("generalCount");

const filters = document.querySelectorAll(".filter");

const themeBtn = document.getElementById("themeBtn");

const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const fileInput = document.getElementById("fileInput");
const clearBtn = document.getElementById("clearBtn");

const toast = document.getElementById("toast");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

let currentFilter = "all";

let editingTaskId = null;

let draggedId = null;

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {

    document.body.classList.add("dark");

    themeBtn.textContent = "☀️";

} else {

    themeBtn.textContent = "🌙";

}
renderTasks();

addBtn.addEventListener("click", addTask);

taskInput.addEventListener("keypress", function (e) {

    if (e.key === "Enter") {

        addTask();

    }

});

searchInput.addEventListener("input", renderTasks);

filters.forEach(function (button) {

    button.addEventListener("click", function () {

        filters.forEach(function (item) {

            item.classList.remove("active");

        });

        button.classList.add("active");

        currentFilter = button.dataset.filter;

        renderTasks();

    });

});

themeBtn.addEventListener("click", toggleTheme);

sortSelect.addEventListener("change", renderTasks);

exportBtn.addEventListener("click", exportTasks);

importBtn.addEventListener("click", function () {

    fileInput.click();

});

fileInput.addEventListener("change", importTasks);

clearBtn.addEventListener("click", clearTasks);

function addTask() {

    if (taskInput.value.trim() === "") {

        showToast("Görev boş olamaz");

        return;

    }

    const task = {

        id: editingTaskId || Date.now(),

        text: taskInput.value.trim(),

        category: category.value,

        priority: priority.value,

        date: date.value,

        completed: false,

        favorite: false

    };

    if (editingTaskId) {

        tasks = tasks.map(function (item) {

            if (item.id === editingTaskId) {

                task.completed = item.completed;
                task.favorite = item.favorite;

                return task;

            }

            return item;

        });

        editingTaskId = null;

        addBtn.textContent = "+ Görev Ekle";

        showToast("Görev güncellendi");

    }

    else {

        tasks.push(task);

        showToast("Görev eklendi");

    }

    saveTasks();

    clearInputs();

    renderTasks();

}

function clearInputs() {

    taskInput.value = "";

    category.selectedIndex = 0;

    priority.selectedIndex = 0;

    date.value = "";

}


function renderTasks() {

    taskList.innerHTML = "";

    if (tasks.length === 0) {

        emptyState.style.display = "block";

    } else {

        emptyState.style.display = "none";

    }


    let filteredTasks = [...tasks];


    if (currentFilter === "completed") {

        filteredTasks = filteredTasks.filter(function (task) {

            return task.completed;

        });

    }

    if (currentFilter === "active") {

        filteredTasks = filteredTasks.filter(function (task) {

            return !task.completed;

        });

    }


    filteredTasks = filteredTasks.filter(function (task) {

        return task.text
            .toLowerCase()
            .includes(searchInput.value.toLowerCase());

    });

    filteredTasks.sort(function (a, b) {

        return b.favorite - a.favorite;

    });


    if (sortSelect.value === "name") {

        filteredTasks.sort(function (a, b) {

            return a.text.localeCompare(b.text);

        });

    }

    if (sortSelect.value === "date") {

        filteredTasks.sort(function (a, b) {

            return (a.date || "9999")
                .localeCompare(b.date || "9999");

        });

    }


    if (sortSelect.value === "priority") {

        const priorityOrder = {

            "Yüksek": 3,
            "Orta": 2,
            "Düşük": 1

        };

        filteredTasks.sort(function (a, b) {

            return priorityOrder[b.priority] -
                priorityOrder[a.priority];

        });

    }

    if (tasks.length > 0 && filteredTasks.length === 0) {

        emptyState.style.display = "block";

        emptyState.querySelector("h2").textContent =
            "Görev bulunamadı";

        emptyState.querySelector("p").textContent =
            "Arama veya filtre seçimini değiştirebilirsin.";

    } else {

        emptyState.querySelector("h2").textContent =
            "Henüz görev yok";

        emptyState.querySelector("p").textContent =
            "İlk görevini ekleyerek planlamaya başlayabilirsin.";

    }


    filteredTasks.forEach(function (task) {

        createTask(task);

    });


    updateStats();

}

function createTask(task) {

    let priorityClass = "low";

    if (task.priority === "Yüksek") {

        priorityClass = "high";

    }

    else if (task.priority === "Orta") {

        priorityClass = "medium";

    }


    let categoryIcon = "📌";

    if (task.category === "Okul") {

        categoryIcon = "🎓";

    }

    else if (task.category === "İş") {

        categoryIcon = "💼";

    }

    else if (task.category === "Kişisel") {

        categoryIcon = "🏠";

    }


    const div = document.createElement("div");

    div.className = "task " + priorityClass;

    div.dataset.id = task.id;

    div.draggable = true;


    const today = new Date().toISOString().split("T")[0];

    if (
        task.date &&
        task.date < today &&
        !task.completed
    ) {

        div.classList.add("overdue");

    }

    if (task.completed) {

        div.classList.add("completed");

    }


    div.innerHTML = `
        <div class="left">

            <input
                type="checkbox"
                class="check"
                ${task.completed ? "checked" : ""}
            >

            <div>

                <h3>${task.text}</h3>

                <p>
                    ${categoryIcon} ${task.category}
                </p>

                <span class="badge ${priorityClass}">
                    ${task.priority}
                </span>

                <br>

                <small>
                    ${task.date ? "📅 " + task.date : ""}
                    <br>
                    ${getRemainingDays(task.date)}
                </small>

                ${
                    task.completed
                        ? '<span class="done-badge">✔ Tamamlandı</span>'
                        : ""
                }

            </div>

        </div>

        <div class="actions">

            <button
                class="favorite"
                title="Favori">
                ${task.favorite ? "⭐" : "☆"}
            </button>

            <button
                class="edit"
                title="Düzenle">
                ✏️
            </button>

            <button
                class="delete"
                title="Sil">
                🗑️
            </button>

        </div>
    `;


    const checkbox = div.querySelector(".check");

    checkbox.addEventListener("change", function () {

        toggleTask(task.id);

    });


    div.querySelector(".favorite")
        .addEventListener("click", function () {

            toggleFavorite(task.id);

        });

    div.querySelector(".edit")
        .addEventListener("click", function () {

            editTask(task.id);

        });

    div.querySelector(".delete")
        .addEventListener("click", function () {

            deleteTask(task.id);

        });

    div.addEventListener("dragstart", dragStart);

    div.addEventListener("dragover", dragOver);

    div.addEventListener("drop", dropTask);


    taskList.appendChild(div);

}

function toggleTask(id) {

    tasks = tasks.map(function (task) {

        if (task.id === id) {

            task.completed = !task.completed;

        }

        return task;

    });

    saveTasks();

    renderTasks();

    showToast("Görev güncellendi");

}


function deleteTask(id) {

    tasks = tasks.filter(function (task) {

        return task.id !== id;

    });

    saveTasks();

    renderTasks();

    showToast("Görev silindi");

}


function toggleFavorite(id) {

    tasks = tasks.map(function (task) {

        if (task.id === id) {

            task.favorite = !task.favorite;

        }

        return task;

    });

    saveTasks();

    renderTasks();

    showToast("Favori güncellendi");

}

function editTask(id) {

    const task = tasks.find(function (item) {

        return item.id === id;

    });

    if (!task) {

        return;

    }

    taskInput.value = task.text;

    category.value = task.category;

    priority.value = task.priority;

    date.value = task.date;

    editingTaskId = id;

    addBtn.textContent = "💾 Kaydet";

    taskInput.focus();

    window.scrollTo({
        top: taskInput.offsetTop - 100,
        behavior: "smooth"
    });

}

function updateStats() {

    const completed = tasks.filter(function (task) {

        return task.completed;

    }).length;


    totalTask.textContent = tasks.length;

    completedTask.textContent = completed;

    remainingTask.textContent =
        tasks.length - completed;


    const today =
        new Date().toISOString().split("T")[0];


    const favorites = tasks.filter(function (task) {

        return task.favorite;

    }).length;


    const todayTasks = tasks.filter(function (task) {

        return task.date === today;

    }).length;


    const overdue = tasks.filter(function (task) {

        return (
            task.date &&
            task.date < today &&
            !task.completed
        );

    }).length;


    favoriteTask.textContent = favorites;

    todayTask.textContent = todayTasks;

    overdueTask.textContent = overdue;

    let percent = 0;

    if (tasks.length > 0) {

        percent =
            (completed / tasks.length) * 100;

    }

    progressBar.style.width = percent + "%";

    progressText.textContent =
        Math.round(percent) + "%";

    notificationCount.textContent =
        tasks.length - completed;


    taskCounter.textContent =
        "Toplam " + tasks.length + " görev";

    schoolCount.textContent =
        countCategory("Okul");

    workCount.textContent =
        countCategory("İş");

    personalCount.textContent =
        countCategory("Kişisel");

    generalCount.textContent =
        countCategory("Genel");


    updateFocusTask();

}


function countCategory(categoryName) {

    return tasks.filter(function (task) {

        return task.category === categoryName;

    }).length;

}


function updateFocusTask() {

    const activeTasks = tasks.filter(function (task) {

        return !task.completed;

    });


    if (activeTasks.length === 0) {

        focusTask.textContent =
            "Bugün için görev bulunmuyor.";

        return;

    }


    const priorityOrder = {

        "Yüksek": 3,
        "Orta": 2,
        "Düşük": 1

    };


    activeTasks.sort(function (a, b) {

        return priorityOrder[b.priority] -
            priorityOrder[a.priority];

    });


    focusTask.textContent =
        activeTasks[0].text;

}

function getRemainingDays(taskDate) {

    if (!taskDate) {

        return "";

    }


    const today = new Date();

    today.setHours(0, 0, 0, 0);


    const target = new Date(taskDate);

    target.setHours(0, 0, 0, 0);


    const difference =
        target - today;


    const days =
        Math.round(
            difference /
            (1000 * 60 * 60 * 24)
        );


    if (days > 0) {

        return "⏳ " + days + " gün kaldı";

    }


    if (days === 0) {

        return "🔥 Son gün";

    }


    return "⚠️ " +
        Math.abs(days) +
        " gün geçti";

}

function saveTasks() {

    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );

}


function toggleTheme() {

    document.body.classList.toggle("dark");


    if (
        document.body.classList.contains("dark")
    ) {

        localStorage.setItem(
            "theme",
            "dark"
        );

        themeBtn.textContent = "☀️";

    }

    else {

        localStorage.setItem(
            "theme",
            "light"
        );

        themeBtn.textContent = "🌙";

    }

}


function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");


    setTimeout(function () {

        toast.classList.remove("show");

    }, 2500);

}


function exportTasks() {

    const data =
        JSON.stringify(tasks, null, 2);


    const blob =
        new Blob(
            [data],
            {
                type: "application/json"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download = "Taskly.json";

    link.click();


    URL.revokeObjectURL(url);


    showToast("Görevler indirildi");

}

function importTasks(event) {

    const file =
        event.target.files[0];


    if (!file) {

        return;

    }


    const reader =
        new FileReader();


    reader.onload = function (e) {

        try {

            const importedTasks =
                JSON.parse(e.target.result);


            if (!Array.isArray(importedTasks)) {

                showToast("Geçersiz dosya");

                return;

            }


            tasks = importedTasks;

            saveTasks();

            renderTasks();

            showToast("Görevler yüklendi");

        }

        catch {

            showToast("Geçersiz dosya");

        }

    };


    reader.readAsText(file);

}

====================

function clearTasks() {

    const answer =
        confirm(
            "Bütün görevler silinsin mi?"
        );


    if (!answer) {

        return;

    }


    tasks = [];

    saveTasks();

    renderTasks();

    showToast("Bütün görevler silindi");

}

function dragStart() {

    draggedId =
        Number(this.dataset.id);

}


function dragOver(e) {

    e.preventDefault();

}


function dropTask() {

    const targetId =
        Number(this.dataset.id);


    if (draggedId === targetId) {

        return;

    }


    const draggedIndex =
        tasks.findIndex(function (task) {

            return task.id === draggedId;

        });


    const targetIndex =
        tasks.findIndex(function (task) {

            return task.id === targetId;

        });


    if (
        draggedIndex === -1 ||
        targetIndex === -1
    ) {

        return;

    }


    const item =
        tasks.splice(
            draggedIndex,
            1
        )[0];


    tasks.splice(
        targetIndex,
        0,
        item
    );


    saveTasks();

    renderTasks();

}
