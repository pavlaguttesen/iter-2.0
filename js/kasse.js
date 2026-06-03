import { supabaseUrl, supabaseKey } from "../env.js";

const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

const urlParams = new URLSearchParams(window.location.search);
const produktId = urlParams.get("id");

let produktPris = 0;
let produktNavn = "";

if (produktId) {
  visProdukt(produktId);
} else {
  console.log("Intet produkt valgt. gå venligst tilbage og vælg et produkt.");
}

async function visProdukt(produktId) {
  const { data: product, error } = await _supabase
    .from("products")
    .select("*")
    .eq("id", produktId)
    .single();

  if (error) {
    console.log("Fejl ved hentning af produkt:", error.message);
    return;
  }

  produktPris = product.price;
  produktNavn = product.name;

  document.querySelector("#product_title").innerText = product.name;
  document.querySelector("#product_img").src = product.image_url;
  document.querySelector("#subtotal").innerText =
    product.price.toLocaleString("da-DK");
  document.querySelector("#total_pris").innerText =
    product.price.toLocaleString("da-DK");
}

const form = document.querySelector("#kasse_form");
if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const fornavn = document.querySelector("#customer-firstname").value;
        const efternavn = document.querySelector("#customer-lastname").value;
        const email = document.querySelector("#customer-email").value;
        const tlf = document.querySelector("#customer-tlf").value;
        const adresse = document.querySelector("#customer-address").value;
        const postnr = document.querySelector("#customer-postal").value;
        const by = document.querySelector("#customer-city").value;

        const {data: nyOrdre, error} = await _supabase
        .from("orders")
        .insert ([
            {
            productId: parseInt(produktId),
            customer_firstname: fornavn,
            customer_lastname: efternavn,
            customer_email: email,
            customer_tlf: tlf,
            customer_address: adresse,
            customer_postal: parseInt(postnr),
            customer_city: by,
            total_price: produktPris
            
        }])
        .select()
        .single();

        if (ordreFejl) {
            console.error("Kunne ikke oprette ordre:", ordreFejl.message);
            alert("Der skete en fejl under behandlingen af dit køb.")
            return;
        }

        if (nyOrdre) {
            const ordrenummer = nyOrdre.id.substring(0, 5).toUpperCase();

            const kundeParametre = {
                kunde_navn: `${fornavn} ${efternavn}`,
                kunde_email: email,
                mail_emne: `Ordrebekræftelse #${ordrenummer} - Iter`,
                mail_overskrift: `Mange tak for din ordre #${ordrenummer}`,
                mail_brødtekst: `Vi har registreret dit af ${produktNavn}. \nTotal pris: ${produktPris} kr. \n\nEstimeret leveringstid er 2-4 dage. \n\nHvis du har spørgsmål, kan du kontakte mig på E-mail: iter.snedker@gmail.com. \n\nTak for din besøg og velkommen igen. \n\nHilsen \nIter`
            };

            emailjs.send("service_snedker", "template_gjotpg9", kundeParametre);

            const adminParametre = {
                admin_emne: `NY ORDRE MODTAGER - Iter`,
                admin_overskrift: `Ny ordre modtaget.`,
                admin_brødtekst: `Ordrenummer: #${ordrenummer} \nKunde: ${fornavn} ${efternavn} \nE-mail: ${email} \nTlf: ${tlf} \nAdresse: ${adresse} \nPostnr: ${postnr} \nBy: ${by}`
            };

            emailjs.send("service_snedker", "template_w2ok64w", adminParametre);

            window.location.href = `bekraeftelse.html?ordre=${ordenummer}`;
        }
    })
}