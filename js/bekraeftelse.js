import { supabaseUrl, supabaseKey } from "../env.js";

const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

const urlParams = new URLSearchParams(window.location.search);
const ordreType = urlParams.get("ordre");

const overskrift = document.getElementById("bekraeftelse-overskrift");
const tekst = document.getElementById("bekraeftelse-tekst");

if (ordreType === "DESIGN") {
    overskrift.textContent = `Tak for din forspørgsel`;
    tekst.textContent = `Din forespørgsel er modtaget og jeg vil se på dine designønsker og specifikationer, og vil vende tilbage til dig på email med et uforpligtende tilbud og tidsestimat hurtigst muligt. \n\nHvis du har spørgsmål, kan du kontakte mig på email: iter.snedker@gmail.com. \n\nTak for din besøg og velkommen igen. \n\nHilsen \nIter.`;
} else if (ordreType) {
    overskrift.textContent = `Tak for din ordre`;
    tekst.textContent = `Dit køb er registreret med ordrenummer: #${ordreType}. En bekræftelse er sendt til din email, og vi begynder at pakke din ordre med det samme dag. \n\nHvis du har spørgsmål, kan du kontakte mig på email: iter.snedker@gmail.com. \n\nTak for din besøg og velkommen igen. \n\nHilsen \nIter.`;
} else {
    overskrift.innerText = `Velkommen til Iter`;
    tekst.innerText = `Gå venligst til forsiden for at se vores smukke møbler og produkter. \n\nHvis du har spørgsmål, kan du kontakte mig på email: iter.snedker@gmail.com. \n\nTak for din besøg og velkommen igen. \n\nHilsen \nIter.`;
}