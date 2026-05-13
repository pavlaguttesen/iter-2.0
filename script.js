import { supabaseUrl, supabaseKey } from "./env.js";

const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

async function hentProdukter() {

    console.log('Henter data...');
    const { data, error } = await _supabase.from('products').select('*');

    if (error) {
        console.log('Der skete en fejl:', error.message);
    } else {
        console.log("Woopwoop! Dine produkter:", data)
    }

}

hentProdukter();

async function designMobel() {
    console.log('Henter data til design møbel');

    const { data, error } = await _supabase.from('custom_order').select('*');
}