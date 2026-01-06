// ===== Habitat dataset (based on your Swing HabitatData) =====
const habitats = [
  { name: "Nile River (Africa)", coords: [30.0444, 31.2357], desc: "The Nile River is the longest river in Africa." },
  { name: "Queensland (Australia)", coords: [-19.2576, 146.8179], desc: "Queensland habitats contain saltwater and freshwater crocodiles." },
  { name: "Florida Everglades (USA)", coords: [25.2866, -80.8987], desc: "A vast wetland in Florida home to the American crocodile." },
  { name: "Orinoco Basin (South America)", coords: [4.0, -67.0], desc: "Home to the Orinoco crocodile in freshwater rivers and wetlands." },
  { name: "Southeast Asia Mangroves", coords: [1.3521, 103.8198], desc: "Mangrove ecosystems provide shelter for saltwater crocodiles." },
  { name: "Okavango Delta (Botswana)", coords: [-19.1333, 23.5833], desc: "A unique inland delta with freshwater crocodiles." },
  { name: "Ganges River (India)", coords: [25.5941, 85.1376], desc: "Crocodiles inhabit the Ganges river system." },
  { name: "Mekong Delta (Vietnam)", coords: [10.0333, 105.7833], desc: "Rich wetland region supporting crocodile populations." },
  { name: "Cameroon Wetlands (Cameroon)", coords: [4.0, 12.0], desc: "Freshwater wetlands in Cameroon are habitats for crocodiles." },
  { name: "Lake Argyle (Australia)", coords: [-15.3833, 128.7333], desc: "Largest artificial lake in Australia with freshwater crocodiles." },
  { name: "Everglades National Park (USA)", coords: [25.2866, -80.8987], desc: "Protected wetland area for American crocodiles..." },
  { name: "Amazon Basin (South America)", coords: [-3.4653, -62.2159], desc: "Dense rainforest with rivers inhabited by spectacled caiman." },
  { name: "Indus River (Pakistan)", coords: [30.1575, 71.5249], desc: "Indus river system supports freshwater crocodiles." },
  { name: "Yangtze River (China)", coords: [31.2304, 121.4737], desc: "Rare Chinese alligator inhabits Yangtze wetlands." },
  { name: "Madagascar Wetlands (Madagascar)", coords: [-18.7669, 46.8691], desc: "Isolated wetlands home to Madagascar crocodiles." }
];

// ===== DOM (City) =====
const cityForm = document.getElementById("cityForm");
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const cityStatus = document.getElementById("cityStatus");

const cityResult = document.getElementById("cityResult");
const cityTitle = document.getElementById("cityTitle");
const cityTemp = document.getElementById("cityTemp");
const cityHumidity = document.getElementById("cityHumidity");
const cityWind = document.getElementById("cityWind");
const cityCoords = document.getElementById("cityCoords");

// ===== DOM (Habitat) =====
const habitatForm = document.getElementById("habitatForm");
const habitatSelect = document.getElementById("habitatSelect");
const habitatBtn = document.getElementById("habitatBtn");
const habitatStatus = document.getElementById("habitatStatus");

const habitatResult = document.getElementById("habitatResult");
const habitatTitle = document.getElementById("habitatTitle");
const habitatDesc = document.getElementById("habitatDesc");
const habTemp = document.getElementById("habTemp");
const habHumidity = document.getElementById("habHumidity");
const habWind = document.getElementById("habWind");
const habCoords = document.getElementById("habCoords");

// ===== UI Helpers =====
function setStatus(el, msg = "", type = "") {
  el.className = `status ${type}`.trim();
  el.textContent = msg;
}

function show(el, on) {
  el.hidden = !on;
}

function safeTrim(v) {
  return (v ?? "").toString().trim();
}

// ===== API: City -> coords =====
async function geocodeCity(city) {
  const url =
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}` +
    `&count=1&language=en&format=json`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Geocoding HTTP error");
  const data = await res.json();

  const results = data?.results;
  if (!results || results.length === 0) return null;
  return results[0];
}

// ===== API: coords -> current weather =====
async function fetchWeather(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}` +
    `&longitude=${encodeURIComponent(lon)}` +
    `&current=temperature_2m,relative_humidity_2m,wind_speed_10m`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather HTTP error");
  const data = await res.json();

  const current = data?.current;
  if (!current) throw new Error("Weather parse error");

  return {
    temperature: current.temperature_2m,
    humidity: current.relative_humidity_2m,
    wind: current.wind_speed_10m
  };
}

// ===== INIT: populate habitat dropdown =====
function initHabitats() {
  habitats.forEach((h) => {
    const opt = document.createElement("option");
    opt.value = h.name;
    opt.textContent = h.name;
    habitatSelect.appendChild(opt);
  });
}

// ===== City Weather handler =====
cityForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  show(cityResult, false);

  const city = safeTrim(cityInput.value);

  if (!city) {
    setStatus(cityStatus, "City name is required.", "warn");
    return;
  }

  setStatus(cityStatus, "Loading city weather…", "ok");
  searchBtn.disabled = true;

  try {
    const loc = await geocodeCity(city);

    if (!loc) {
      setStatus(cityStatus, "City not found. Please check spelling and try again.", "err");
      return;
    }

    const w = await fetchWeather(loc.latitude, loc.longitude);

    cityTitle.textContent = `${loc.name}${loc.country ? ", " + loc.country : ""}`;
    cityTemp.textContent = w.temperature;
    cityHumidity.textContent = w.humidity;
    cityWind.textContent = w.wind;
    cityCoords.textContent = `${loc.latitude}, ${loc.longitude}`;

    setStatus(cityStatus, "City weather loaded successfully.", "ok");
    show(cityResult, true);
  } catch (err) {
    console.error(err);
    setStatus(cityStatus, "Error fetching city weather.", "err");
  } finally {
    searchBtn.disabled = false;
  }
});

// ===== Habitat Weather handler =====
habitatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  show(habitatResult, false);

  const selected = habitatSelect.value;
  const habitat = habitats.find((h) => h.name === selected);

  if (!habitat) {
    setStatus(habitatStatus, "Please select a valid habitat.", "warn");
    return;
  }

  setStatus(habitatStatus, "Loading habitat weather…", "ok");
  habitatBtn.disabled = true;

  try {
    const [lat, lon] = habitat.coords;
    const w = await fetchWeather(lat, lon);

    habitatTitle.textContent = habitat.name;
    habitatDesc.innerHTML = `<strong>Description:</strong> ${habitat.desc}`;

    habTemp.textContent = w.temperature;
    habHumidity.textContent = w.humidity;
    habWind.textContent = w.wind;
    habCoords.textContent = `${lat}, ${lon}`;

    setStatus(habitatStatus, "Habitat weather loaded successfully.", "ok");
    show(habitatResult, true);
  } catch (err) {
    console.error(err);
    setStatus(habitatStatus, "Error fetching habitat weather.", "err");
  } finally {
    habitatBtn.disabled = false;
  }
});

initHabitats();
