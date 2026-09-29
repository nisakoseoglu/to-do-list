const focusTask = document.getElementById("focusTask");
const favoriteTask = document.getElementById("favoriteTask");

const todayTask = document.getElementById("todayTask");

const overdueTask = document.getElementById("overdueTask");
const exportBtn = document.getElementById("exportBtn");

const importBtn = document.getElementById("importBtn");

const fileInput = document.getElementById("fileInput");
const taskInput = document.getElementById("taskInput");
const category = document.getElementById("category");
const priority = document.getElementById("priority");
const date = document.getElementById("date");
const addBtn = document.getElementById("addBtn");

const searchInput = document.getElementById("searchInput");

const taskList = document.getElementById("taskList");

const totalTask = document.getElementById("totalTask");
const completedTask = document.getElementById("completedTask");
const remainingTask = document.getElementById("remainingTask");

const progressBar = document.getElementById("progressBar");

const filters = document.querySelectorAll(".filter");

const themeBtn = document.getElementById("themeBtn");

const toast = document.getElementById("toast");
const clearBtn = document.getElementById("clearBtn");
const sortSelect = document.getElementById("sortSelect");
const notificationCount=document.getElementById("notificationCount");
const taskCounter = document.getElementById("taskCounter");
const emptyState = document.getElementById("emptyState");
const progressText = document.getElementById("progressText");
const schoolCount = document.getElementById("schoolCount");
const workCount = document.getElementById("workCount");
const personalCount = document.getElementById("personalCount");
const generalCount = document.getElementById("generalCount");



let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

let currentFilter = "all";
let editingTaskId = null;

const savedTheme = localStorage.getItem("theme");

if(savedTheme==="dark"){

    document.body.classList.add("dark");
    themeBtn.textContent="☀️";

}else{

    themeBtn.textContent="🌙";

}
renderTasks();

addBtn.addEventListener("click",addTask);

taskInput.addEventListener("keypress",(e)=>{

    if(e.key==="Enter"){

        addTask();

    }

});

searchInput.addEventListener("input",renderTasks);

filters.forEach(btn=>{

    btn.addEventListener("click",()=>{

        filters.forEach(item=>item.classList.remove("active"));

        btn.classList.add("active");

        currentFilter=btn.dataset.filter;

        renderTasks();

    });

});

themeBtn.addEventListener("click",toggleTheme);
exportBtn.addEventListener("click",exportTasks);

importBtn.addEventListener("click",()=>{

    fileInput.click();

});

fileInput.addEventListener("change",importTasks);
clearBtn.addEventListener("click",clearTasks);
sortSelect.addEventListener("change",renderTasks);

function addTask(){

    if(taskInput.value.trim()===""){

        showToast("Görev boş olamaz");

        return;

    }

const task={

        id:editingTaskId || Date.now(),

        text:taskInput.value,

        category:category.value,

        priority:priority.value,

        date:date.value,

        completed:false,

        favorite:false

    };

    if(editingTaskId){

    tasks = tasks.map(item=>{

        if(item.id===editingTaskId){

            return task;

        }

        return item;

    });

    editingTaskId = null;

    addBtn.textContent="➕ Görev Ekle";

    showToast("Görev güncellendi");

}else{

    tasks.push(task);

    showToast("Görev eklendi");

}

    saveTasks();

    clearInputs();

    renderTasks();


}

function clearInputs(){

    taskInput.value="";

    category.selectedIndex=0;

    priority.selectedIndex=0;

    date.value="";

}

function renderTasks(){
    

    taskList.innerHTML="";
    if(tasks.length===0){

    emptyState.style.display="block";

}else{

    emptyState.style.display="none";

}
    if(tasks.length===0){

    emptyState.style.display="block";

}else{

    emptyState.style.display="none";

}

    let filtered=[...tasks];

    if(currentFilter==="completed"){

        filtered=filtered.filter(task=>task.completed);

    }

    if(currentFilter==="active"){

        filtered=filtered.filter(task=>!task.completed);

    }

    filtered=filtered.filter(task=>

        task.text.toLowerCase().includes(searchInput.value.toLowerCase())

    );

    filtered.sort((a,b)=>b.favorite-a.favorite);
    if(sortSelect.value==="name"){

    filtered.sort((a,b)=>

        a.text.localeCompare(b.text)

    );

}

if(sortSelect.value==="date"){

    filtered.sort((a,b)=>

        (a.date||"9999").localeCompare(b.date||"9999")

    );

}

if(sortSelect.value==="priority"){

    const order={

        "Yüksek":3,

        "Orta":2,

        "Düşük":1

    };

    filtered.sort((a,b)=>

        order[b.priority]-order[a.priority]

    );

}

    filtered.forEach(task=>{

        const priorityClass=

        task.priority==="Yüksek"

        ? "high"

        : task.priority==="Orta"

        ? "medium"

        : "low";

        const div=document.createElement("div");
        div.draggable = true;
div.dataset.id = task.id;

        div.className=`task ${priorityClass}`;
        const today = new Date().toISOString().split("T")[0];

if(task.date && task.date < today && !task.completed){

    div.classList.add("overdue");

}

        if(task.completed){

            div.classList.add("completed");

        }
let categoryIcon = "📌";

if(task.category==="Okul"){

    categoryIcon="🎓";

}

else if(task.category==="İş"){

    categoryIcon="💼";

}

else if(task.category==="Kişisel"){

    categoryIcon="🏠";

}
        div.innerHTML=`

<div class="left">

<input
type="checkbox"
${task.completed?"checked":""}
class="check">

<div>

<h3>${task.text}</h3>

<p>${categoryIcon} ${task.category}</p>

<span class="badge ${priorityClass}">
${task.priority}
</span>

<br>

<small>

📅 ${task.date || ""}

<br>

${getRemainingDays(task.date)}

</small>
${task.completed
? '<span class="done-badge">✔ Tamamlandı</span>'
: ''}

</div>

</div>

<div class="actions">

<button class="favorite">

${task.favorite?"⭐":"☆"}

</button>

<button class="edit">

✏️

</button>

<button class="delete">

🗑️

</button>

</div>

`;
div.addEventListener("dragstart", dragStart);

div.addEventListener("dragover", dragOver);

div.addEventListener("drop", dropTask);
        taskList.appendChild(div);
                const checkbox=div.querySelector(".check");

        checkbox.addEventListener("change",()=>{

            toggleTask(task.id);

        });

        div.querySelector(".favorite").addEventListener("click",()=>{

            toggleFavorite(task.id);

        });

        div.querySelector(".edit").addEventListener("click",()=>{

            editTask(task.id);

        });

        div.querySelector(".delete").addEventListener("click",()=>{

            deleteTask(task.id);

        });

    });

    updateStats();

}

function toggleTask(id){

    tasks = tasks.map(task=>{

        if(task.id===id){

            task.completed=!task.completed;

        }

        return task;

    });

    saveTasks();

    renderTasks();

    showToast("Görev güncellendi");

}

function deleteTask(id){

    tasks = tasks.filter(task=>task.id!==id);

    saveTasks();

    renderTasks();

    showToast("Görev silindi");

}

function toggleFavorite(id){

    tasks = tasks.map(task=>{

        if(task.id===id){

            task.favorite=!task.favorite;

        }

        return task;

    });

    saveTasks();

    renderTasks();

    showToast("Favori güncellendi");

}
function editTask(id){

    const task = tasks.find(item=>item.id===id);

    if(!task) return;

    taskInput.value = task.text;

    category.value = task.category;

    priority.value = task.priority;

    date.value = task.date;

    editingTaskId = id;

    addBtn.textContent="💾 Kaydet";

    taskInput.focus();

}

function updateStats(){

    totalTask.textContent=tasks.length;

    const completed=tasks.filter(task=>task.completed).length;

    completedTask.textContent=completed;

    remainingTask.textContent=tasks.length-completed;
    const today = new Date().toISOString().split("T")[0];

favoriteTask.textContent = tasks.filter(task=>task.favorite).length;

todayTask.textContent = tasks.filter(task=>task.date===today).length;

overdueTask.textContent = tasks.filter(task=>

    task.date &&
    task.date<today &&
    !task.completed

).length;

    const percent=

    tasks.length===0

    ?0

    :(completed/tasks.length)*100;

    progressBar.style.width=percent+"%";
    progressText.textContent=Math.round(percent)+"%";
    updateFocusTask();
    notificationCount.textContent = tasks.filter(

    task=>!task.completed

).length;
taskCounter.textContent=`Toplam ${tasks.length} görev`;
schoolCount.textContent =
tasks.filter(task=>task.category==="Okul").length;

workCount.textContent =
tasks.filter(task=>task.category==="İş").length;

personalCount.textContent =
tasks.filter(task=>task.category==="Kişisel").length;

generalCount.textContent =
tasks.filter(task=>task.category==="Genel").length;
}

function saveTasks(){

    localStorage.setItem(

        "tasks",

        JSON.stringify(tasks)

    );

}
function toggleTheme(){

    document.body.classList.toggle("dark");

    if(document.body.classList.contains("dark")){

        localStorage.setItem("theme","dark");
        themeBtn.textContent="☀️";

    }else{

        localStorage.setItem("theme","light");
        themeBtn.textContent="🌙";

    }

}


function showToast(message){

    toast.textContent=message;

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove("show");

    },2500);

}
function exportTasks(){

    const data = JSON.stringify(tasks,null,2);

    const blob = new Blob(

        [data],

        {

            type:"application/json"

        }

    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "TaskFlow.json";

    a.click();

    URL.revokeObjectURL(url);

    showToast("Görevler indirildi");

}
function importTasks(event){

    const file = event.target.files[0];

    if(!file) return;

    const reader = new FileReader();

    reader.onload = function(e){

        try{

            tasks = JSON.parse(e.target.result);

            saveTasks();

            renderTasks();

            showToast("Görevler yüklendi");

        }

        catch{

            showToast("Geçersiz dosya");

        }

    }

    reader.readAsText(file);

}
function clearTasks(){

    const answer = confirm("Bütün görevler silinsin mi?");

    if(!answer){

        return;

    }

    tasks=[];

    saveTasks();

    renderTasks();

    showToast("Bütün görevler silindi");

}
function updateFocusTask(){

    const activeTasks = tasks.filter(task=>!task.completed);

    if(activeTasks.length===0){

        focusTask.textContent="Bugün için görev bulunmuyor.";

        return;

    }

    activeTasks.sort((a,b)=>{

        const order={

            "Yüksek":3,

            "Orta":2,

            "Düşük":1

        };

        return order[b.priority]-order[a.priority];

    });

    focusTask.textContent=

    activeTasks[0].text;

}
function getRemainingDays(date){

    if(!date){

        return "";

    }

    const today=new Date();

    const target=new Date(date);

    const diff=Math.ceil(

        (target-today)/(1000*60*60*24)

    );

    if(diff>0){

        return `⏳ ${diff} gün kaldı`;

    }

    if(diff===0){

        return "🔥 Son gün";

    }

    return `⚠️ ${Math.abs(diff)} gün geçti`;

}
let draggedId = null;

function dragStart(){

    draggedId = Number(this.dataset.id);

}
function dragOver(e){

    e.preventDefault();

}
function dropTask(){

    const targetId = Number(this.dataset.id);

    if(draggedId===targetId){

        return;

    }

    const draggedIndex = tasks.findIndex(

        task=>task.id===draggedId

    );

    const targetIndex = tasks.findIndex(

        task=>task.id===targetId

    );

    const item = tasks.splice(

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
