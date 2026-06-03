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
            custom_postal: parseInt(document.getElementById("custom_postal").value) || 0,
            custom_city: document.getElementById("custom_city").value,
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

            if (data && data.length > 0) {
            const fuldtId = data [0].id;
            const kortOrdreNummer = fuldtId.substring(0, 5).toUpperCase();

            const kundeParametre = {
                kunde_navn: `${fornavn} ${efternavn}`,
                kunde_email: orderData.custom_email,
                mail_emne: `Forespørgsel modtaget #${kortOrdreNummer} - Iter`,
                mail_overskrift: `Tak for din forespørgsel på et specialmøbel #${kortOrdreNummer}`,
                mail_brødtekst: `Hej ${orderData.custom_firstname}.\n\nJeg har modtaget dit ønske om et speciallavet møbel, og vil kigge på dine specifikationer hurtigst muligt.\n\nDINE VALG:\n- Møbeltype: ${orderData.furniture_type}\n- Træsort: ${orderData.wood_type}\n- Beskrivelse: ${orderData.description}\n\nJeg vender tilbage til dig på denne mailadresse med et uforpligtende prisoverslag.`
            };

            emailjs.send("service_snedker", "template_gjotpg9", kundeParametre)
            .then(() =>console.log("Email sendt til kunde"))
            .catch((error) => console.error("Der skete en fejl ved sending af email til kunde:", error));

            const adminParametre = {
                admin_emne: `NY FORSPØRGSEL: Specialmøbel #${kortOrdreNummer}`,
                admin_overskrift: `Du har fået en ny forespørgsel på et speciallavet møbel`,
                admin_brødtekst: `ReferenceID: ${kortOrdreNummer}\n` +
                `Kunde: ${orderData.custom_firstname} ${orderData.custom_lastname}\n` +
                `E-mail: ${orderData.custom_email}\n` +
                `Tlf: ${orderData.custom_tlf}\n` +
                `Adresse: ${orderData.custom_address}\n` +
                `Postnr: ${orderData.custom_postal}\n` +
                `By: ${orderData.custom_city}` +
                `Specifikationer:\n` +
                `- Møbeltype: ${orderData.furniture_type}\n` +
                `- Træsort: ${orderData.wood_type}\n` +
                `- Beskrivelse: ${orderData.description}`
            };

            emailjs.send("service_snedker", "template_w2ok64w", adminParametre)
            .then(() => console.log("Email sendt til admin"))
            .catch((error) => console.error("Der skete en fejl ved sending af email til admin:", error));

            window.location.href = `bekraeftelse.html?ordre=${kortOrdreNummer}`;
            }

            
        } catch (error) {
            console.error("Der skete en fejl:", error.message);
            alert("Kunne ikke sende din bestilling. Prøv igen eller kontakt mig direkte.");
        }

    });
}