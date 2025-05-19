// Polling-based Whiteboard client
const ROOM_ID = "room_9301"; // replace after gen_config
const API = "http://localhost:8000";

const FILTERS = ["blur", "invert"];   // приклад зі списком фільтрів
const select = document.getElementById("filter-select");
FILTERS.forEach(f => {
    const opt = document.createElement("option");
    opt.value = f;
    opt.textContent = f;
    select.appendChild(opt);
});

document.getElementById("apply-filter")
        .addEventListener("click", applyFilter);

async function applyFilter() {
  const { width, height } = canvas;
  // Отримуємо пікселі з Canvas
  const imgData = ctx.getImageData(0, 0, width, height);
  const dataArray = Array.from(imgData.data);  // Перетворюємо у звичайний масив

  const filterName = select.value;  // Обраний у селекті фільтр

  // Відправляємо POST-запит на бекенд з даними зображення
  const res = await fetch(`http://localhost:8000/filter/${ROOM_ID}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image_data: dataArray,
      filter_name: filterName,
      width,
      height
    })
  });
  const json = await res.json();  // Чекаємо відповідь

  // Отримуємо перетворені пікселі та малюємо назад на Canvas
  const newData = new Uint8ClampedArray(json.image_data);
  ctx.putImageData(new ImageData(newData, width, height), 0, 0);
}

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
let drawing = false;

canvas.addEventListener('mousedown', () => drawing = true);
canvas.addEventListener('mouseup', () => { drawing = false; ctx.beginPath(); });
canvas.addEventListener('mousemove', e => {
  if(!drawing) return;
  const rect = canvas.getBoundingClientRect();
  const cmd = { x: e.clientX - rect.left, y: e.clientY - rect.top, type: "line" };
  sendCommand(cmd);
  draw(cmd);
});

document.getElementById('refresh').onclick = poll;

function draw(cmd){
  ctx.lineTo(cmd.x, cmd.y);
  ctx.stroke();
}

async function sendCommand(cmd){
  await fetch(`${API}/draw/${ROOM_ID}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd)
  });
}

async function poll(){
  const res = await fetch(`${API}/draw/${ROOM_ID}`);
  const cmds = await res.json();
  ctx.clearRect(0,0,canvas.width,canvas.height);
  cmds.forEach(draw);
}

// initial data
poll();