import { supabaseUrl, supabaseKey } from "../env.js";

const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

async function hentPortfolio() {
    console.log("hentPortfolio startet")
  const container = document.getElementById("portfolio_projects_container");

  const { data: projekter, error } = await _supabase
    .from("projects")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.log("Der skete en fejl:", error.message);
    return;
  }

  console.log("Data er modtaget fra Supabase:", projekter);

  container.innerHTML = "";


  projekter.forEach((projekt) => {
    console.log("Ser igennem projekter:", projekt.title); 
    const alleBilleder = [
      projekt.image_main,
      projekt.image_1,
      projekt.image_2,
      projekt.image_3,
      projekt.image_4,
    ].filter(Boolean);

    let galleriHTML = "";
    alleBilleder.forEach((billedeUrl, indeks) => {
      const billedeNavn = indeks === 0 ? "bento_main" : `bento_sub_${indeks}`;
      galleriHTML += `<img src="${billedeUrl}" alt="${projekt.title}" class="${billedeNavn}">`;
    });

    const beskrivelseHTML = produktBeskrivelse(projekt.description);

    container.innerHTML += `
    <article class="projekt_artikel">
    <div class="bento_galleri billede_antal_${alleBilleder.length}">
    ${galleriHTML}
    </div>
    
    <div class="projekt_info">
    <h2>${projekt.title}</h2>
    ${beskrivelseHTML}
    </div>
    </article>
    `;
  });
}

function produktBeskrivelse(beskrivelse) {
  if (beskrivelse) {
    return `<p class="projekt_beskrivelse">${beskrivelse}</p>`;
  }
  return "";
}

document.addEventListener("DOMContentLoaded", hentPortfolio);
