import { supabaseUrl, supabaseKey } from "../env.js";

const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

function produktIdUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("id");
}

async function singleProdukt() {
const produktId = produktIdUrl();

if (!produktId) {
    window.location.href = "produkter.html";
}

console.log("Henter data for produkt med ID:", produktId);

const { data: produkt, error } = await _supabase
    .from("products")
    .select("*")
    .eq("id", produktId)
    .single();

if (error) {
    console.log("Der skete en fejl:", error.message);
    return;
}

document.getElementById("produkt_navn").textContent = produkt.name;
document.getElementById("produkt_pris").textContent = produkt.price;
document.getElementById("produkt_materiale").textContent = produkt.material;
document.getElementById("produkt_dimensioner").textContent = produkt.dimensions;
document.getElementById("produkt_beskrivelse").textContent = produkt.description;
document.getElementById("main_billede").src = produkt.image_url;
document.getElementById("main_billede").alt = produkt.name;

const lagerStatus = document.getElementById("lager_status");
const kobKnap = document.getElementById("kob_knap");

if (produkt.stock > 0) {
    lagerStatus.textContent = "På lager";
    lagerStatus.style.color = "green";
    kobKnap.disabled = false;

    kobKnap.addEventListener("click", () => {
        window.location.href = `kasse.html?id=${produkt.id}`;
    });
} else {
    lagerStatus.textContent = "Udsolgt";
    lagerStatus.style.color = "red";
    kobKnap.disabled = true;
    kobKnap.style.backgroundColor = "gray";
}

const thumbnailContainer = document.getElementById("thumbnail_container");

thumbnailContainer.innerHTML = "";

const ekstraBilleder = [
    produkt.image_url, 
    produkt.image_url1, 
    produkt.image_url2, 
    produkt.image_url3
].filter(Boolean);

const venstrePil = document.querySelector(".pil.prev");
const hojrePil = document.querySelector(".pil.next");

const mainBillede = document.getElementById("main_billede");

let indexBillede = 0;

function opdaterMainBillede() {
    mainBillede.src = ekstraBilleder[indexBillede];
}

hojrePil.addEventListener("click", () => {
    indexBillede = indexBillede + 1;

    if (indexBillede >= ekstraBilleder.length) {
        indexBillede = 0;
    }

    opdaterMainBillede();
});

venstrePil.addEventListener("click", () => {
    indexBillede = indexBillede - 1;

    if (indexBillede < 0) {
        indexBillede = ekstraBilleder.length - 1;
    }

    opdaterMainBillede();
});

ekstraBilleder.forEach(ImageUrl => {
    if (ImageUrl) {
        thumbnailContainer.innerHTML += `
        <img src="${ImageUrl}" class="thumbnail_img" alt="Thumbnail">`
    }
});

const alleThumbnails = document.querySelectorAll(".thumbnail_img");

alleThumbnails.forEach(thumbnail => {
    thumbnail.addEventListener("click", () => {
        mainBillede.src = thumbnail.src;
    });
});
}

document.addEventListener("DOMContentLoaded", singleProdukt);