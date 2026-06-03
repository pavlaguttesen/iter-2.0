import { supabaseUrl, supabaseKey } from "../env.js";

const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

async function hentProdukter() {
  console.log("Henter data...");
  const { data: produkter, error } = await _supabase
    .from("products")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.log("Der skete en fejl:", error.message);
    return;
  }

  console.log("Hvad gemmer sig bag dette?:", produkter);

  const container = document.getElementById("produkt_container");

  container.innerHTML = "";

  produkter.forEach(produkt => {
    container.innerHTML += `
    <a href="./produkt_single.html?id=${produkt.id}" class="produkt_card">
    <div class="image_container"> 
    <img src="${produkt.image_url}" alt="${produkt.name}"></div>
    <div class="produkt_info">
    <span class="produkt_navn">${produkt.name}</span>
    <span class="produkt_pris">${produkt.price} kr.</span>
    </div>
    </a>
    `;
  });
}

document.addEventListener("DOMContentLoaded", hentProdukter);
