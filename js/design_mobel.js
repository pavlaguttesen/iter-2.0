import { supabaseUrl, supabaseKey } from "../env.js";

const _supabase = supabase.createClient(supabaseUrl, supabaseKey);
const designMobel = document.querySelector("#custom_order_form");

if (designMobel) {
    designMobel.addEventListener("submit", async (e) => {
        e.preventDefault();

        const valgtMobel = designMobel.querySelector('input[name="furniture_type"]:checked')?.value;
        const valgtTrae = designMobel.querySelector('input[name="tree_type"]:checked')?.value;
        
        const andetFelt = designMobel.querySelector('input[name="mobel_andet"]')?.value.trim();
        const finalMobelType = andetFelt !== "" ? andetFelt : valgtMobel;

        const orderData = {
            furniture_type: finalMobelType,
            wood_type: valgtTrae,
            description: document.getElementById("onsker_tekst").value,
            custom_firstname: document.getElementById("custom_firstname").value,
            custom_lastname: document.getElementById("custom_lastname").value,
            custom_email: document.getElementById("custom_email").value,
            custom_tlf: document.getElementById("custom_tlf").value,
            custom_address: document.getElementById("custom_adresse").value,
            custom_postal: parseInt(document.getElementById("custom_postal").value) || null,
            custom_city: document.getElementById("custom_city").value,
            attachment_url: null
        };

        console.log("Sender følgende data til Supabase:", orderData);

        try {
            const { data, error } = await _supabase
            .from("custom_order")
            .insert([orderData])
            .select();

            if (error) {
                throw error;
            }

            console.log("Ordre oprettet i databasen:", data);
            const fuldtId = data [0].id;

            const kortOrdreNummer = fuldtId.substring(0, 5).toUpperCase();

            window.location.href = `bekraeftelse.html?ordre=${kortOrdreNummer}`;
        } catch (error) {
            console.error("Der skete en fejl:", error.message);
            alert("Kunne ikke sende din bestilling. Prøv igen eller kontakt mig direkte.");
        }

    });
}