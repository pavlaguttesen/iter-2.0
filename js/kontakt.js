import { supabaseUrl, supabaseKey } from "../env.js";

const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", () => {
    const kontaktForm = document.querySelector("#kontakt-form");

    if (kontaktForm) {
        kontaktForm.addEventListener("submit", (e) => {
            e.preventDefault();

            // 1. Hent værdierne fra din HTML
            const navn = document.getElementById("kontakt-navn").value.trim();
            const email = document.getElementById("kontakt-email").value.trim();
            const tlf = document.getElementById("kontakt-tlf").value.trim() || "Ikke angivet";
            const besked = document.getElementById("kontakt-besked").value.trim();

            // 2. Lav den dynamiske mail til KUNDEN (Autoreply)
            const kundeParametre = {
                kunde_navn: navn,
                kunde_email: email, // Senderen af formularen modtager denne
                mail_emne: "Tak for din besked - Iter Snedkeri",
                mail_overskrift: "Vi har modtaget din henvendelse!",
                mail_brødtekst: `Hej ${navn}.\n\nTusind tak fordi du skrev til os. Snedkeren kigger på din besked hurtigst muligt og vender tilbage til dig på denne mailadresse.\n\nKOPI AF DIN BESKED:\n"${besked}"`
            };

            // Send bekræftelse til kunden
            emailjs.send("service_snedker", "universel_kunde_template", kundeParametre)
                .then(() => console.log("Autoreply sendt til kunden"))
                .catch((fejl) => console.error("Fejl i kundemail:", fejl));


            // 3. Lav den dynamiske mail til SNEDKEREN (Admin-notifikation)
            const adminParametre = {
                admin_emne: "✉️ NY BESKED: Kontaktformular - Iter Snedkeri",
                admin_overskrift: "En besøgende har sendt en besked via kontaktsiden",
                admin_brødtekst: `Afsender: ${navn}\nE-mail: ${email}\nTelefon: ${tlf}\n\nBESKED:\n"${besked}"`
            };

            // Send besked til snedkeren
            emailjs.send("service_snedker", "universel_admin_template", adminParametre)
                .then(() => {
                    console.log("Besked sendt til snedkeren");
                    
                    // Vis en succesbesked på skærmen og nulstil formularen
                    alert(`Tak for din besked, ${navn}! Vi vender tilbage hurtigst muligt.`);
                    kontaktForm.reset();
                })
                .catch((fejl) => {
                    console.error("Fejl i adminmail:", fejl);
                    alert("Der skete en fejl. Prøv venligst igen eller send en direkte mail.");
                });
        });
    }
});