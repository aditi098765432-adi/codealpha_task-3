const STORAGE_KEY = "fitflow-separated-v1";
const dateKey = new Date().toLocaleDateString("en-CA");
const freshData = () => ({date: dateKey, steps: 0, minutes: 0, water: 0, activities: [], habits: [false,false,false,false]});
let data;
try { data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || freshData(); } catch { data = freshData(); }
if (data.date !== dateKey) data = freshData();

const $ = id => document.getElementById(id);
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); render(); }
function toast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  setTimeout(() => $("toast").classList.remove("show"), 1400);
}
function addNumber(inputId, key, max, message) {
  const amount = Number($(inputId).value);
  if (!Number.isFinite(amount) || amount <= 0) return toast("Please enter a valid number");
  data[key] = Math.min(max, data[key] + amount);
  $(inputId).value = "";
  save(); toast(message);
}
$("stepsForm").addEventListener("submit", event => { event.preventDefault(); addNumber("stepsInput","steps",100000,"Steps added!"); });
$("minutesForm").addEventListener("submit", event => { event.preventDefault(); addNumber("minutesInput","minutes",600,"Minutes added!"); });
$("addWater").addEventListener("click", () => { data.water = Math.min(20,data.water+1); save(); toast("Water logged!"); });
$("undoWater").addEventListener("click", () => { data.water = Math.max(0,data.water-1); save(); });
$("activityForm").addEventListener("submit", event => {
  event.preventDefault();
  const minutes = Number($("activityDuration").value);
  if (!Number.isFinite(minutes) || minutes < 1) return toast("Enter valid activity minutes");
  data.activities.unshift({name:$("activityType").value, minutes});
  data.minutes = Math.min(600,data.minutes+minutes);
  $("activityDuration").value = "";
  save(); toast("Activity saved!");
});
document.querySelectorAll(".habit-check").forEach((checkbox,index) => checkbox.addEventListener("change", () => {
  data.habits[index] = checkbox.checked;
  localStorage.setItem(STORAGE_KEY,JSON.stringify(data));
}));
function deleteActivity(index) { data.activities.splice(index,1); save(); }
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
function render() {
  const percent = Math.min(100,Math.round(((data.steps/6000)+(data.minutes/30))/2*100));
  $("stepsValue").textContent = data.steps.toLocaleString();
  $("minutesValue").textContent = data.minutes;
  $("waterValue").textContent = `${data.water} / 8`;
  $("workoutValue").textContent = data.activities.length;
  $("stepsBar").style.width = `${Math.min(100,data.steps/6000*100)}%`;
  $("minutesBar").style.width = `${Math.min(100,data.minutes/30*100)}%`;
  $("waterBar").style.width = `${Math.min(100,data.water/8*100)}%`;
  $("workoutBar").style.width = `${Math.min(100,data.activities.length/3*100)}%`;
  $("ringText").textContent = `${percent}%`;
  $("goalRing").style.background = `conic-gradient(var(--mint) ${percent*3.6}deg,#26354c 0deg)`;
  $("waterCount").textContent = `${data.water}/8`;
  $("glasses").innerHTML = Array.from({length:8},(_,i)=>`<span class="glass ${i<data.water?"filled":""}"></span>`).join("");
  $("activityList").innerHTML = data.activities.length
    ? data.activities.map((activity,index)=>`<div class="activity"><span>🏃</span><div><strong>${escapeHTML(activity.name)}</strong><small>${activity.minutes} min</small></div><button type="button" data-delete="${index}" aria-label="Delete activity">×</button></div>`).join("")
    : '<p class="empty">No activities logged yet. Add your first one!</p>';
  document.querySelectorAll(".habit-check").forEach((checkbox,index)=>checkbox.checked=!!data.habits[index]);
  document.querySelectorAll("[data-delete]").forEach(button=>button.addEventListener("click",()=>deleteActivity(Number(button.dataset.delete))));
}
$("today").textContent = new Date().toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric",year:"numeric"});
render();
