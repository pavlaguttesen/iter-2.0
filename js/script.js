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

async function specialBestilling(event) {
  event.preventDefault();

  const nyBestilling = {
    furniture_type: document.getElementById("furniture_type").value,
    wood_type: document.getElementById("wood_type").value,
    description: document.getElementById("description").value,
    attachment_url: document.getElementById("attachment_url").value,
    custom_firstname: document.getElementById("custom_firstname").value,
    custom_lastname: document.getElementById("custom_lastname").value,
    custom_email: document.getElementById("custom_email").value,
    custom_tlf: document.getElementById("custom_tlf").value,
    custom_address: document.getElementById("custom_address").value,
    custom_postal: document.getElementById("custom_postal").value,
    custom_city: document.getElementById("custom_city").value,
  };

  const { data, error } = await _supabase
    .from("custom_order")
    .insert([nyBestilling]);

    if (error) {
      console.log("Der skete en fejl:", error.message);
    } else{
      alert("Tak for din bestilling. Dit ønske er sendt til snedkeren.");
    }
  
}
