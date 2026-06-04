import { supabaseUrl, supabaseKey } from "../env.js";

const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

const form = document.querySelector("#booking_form");
const modal = document.querySelector("#kontakt_modal");

if (modal) {
    modal.style.display = "none";
}

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const fornavn = document.querySelector("#kunde-fornavn").value;
        const efternavn = document.querySelector("#kunde-efternavn").value;
        const email = document.querySelector("#kunde-email").value;
        const tlf = document.querySelector("#kunde-tlf").value;
        const besked = document.querySelector("#kunde-besked").value;
        
        const {data: kontaktFejl} = await _supabase
        .from("contact_message")
        .insert([
            {
                contact_firstname: fornavn,
                contact_lastname: efternavn,
                contact_email: email,
                contact_tlf: tlf,
                contact_description: besked
            }
        ]);

        if (kontaktFejl) {
            console.error("Kontakt fejl:", kontaktFejl.message);
            alert ("Der skete en fejl med din besked. Prøv igen eller kontakt mig direkte.");
            return;
        }

        const adminParametre = {
            admin_emne: `NY BESKED: Spørgsmål fra kontaktsiden - Iter`,
            admin_overskrift: `En kunde har sendt en besked via hjemmesiden`,
            admin_brodtekst: `Navn: ${fornavn} ${efternavn} \nEmail: ${email} \nTlf: ${tlf} \nBesked: ${besked} \n\nBeskeden er også gemt i Supabase under "contact_message".`
        };

        try {
            await emailjs.send("service_snedker", "template_w2ok64w", adminParametre);
            console.log("Besked sendt til admin.");

            modal.style.display = "flex";
            form.reset();
            
        } catch (error) {
            console.error("Kontakt fejl:", error.message);
            alert ("Der skete en fejl med din besked. Prøv igen eller kontakt mig direkte.");

            modal.style.display = "flex";
            form.reset();
        }
    });
        
}

const lukKnap = document.querySelector(".luk-knap");
if (lukKnap && modal) {
    lukKnap.addEventListener("click", () => (modal.style.display = "none"));
}