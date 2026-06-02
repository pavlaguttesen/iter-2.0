import { supabaseUrl, supabaseKey } from "../env.js";

const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

let gemtDatoStreng = "";

document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");
  if (!calendarEl) return;

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "timeGridWeek",
    weekends: false,
    firstDay: 1,

    slotMinTime: "09:00:00",
    slotMaxTime: "16:00:00",
    slotDuration: "00:30:00",

    locale: "da",
    allDaySlot: false,
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "",
    },
    buttonText: {
      today: "idag",
      month: "Måned",
      week: "Uge",
      day: "Dag",
      prev: "Forrige",
      next: "Næste",
    },

    selectAllow: function (selectInfo) {
      const iDag = new Date();
      iDag.setDate(iDag.getDate() + 1);
      iDag.setHours(0, 0, 0, 0);

      return selectInfo.start >= iDag;
    },

    slotLabelFormat: {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    },
    eventTimeFormat: {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    },
    selectable: true,
    select: function (info) {
      gemValgtTid(info.startStr);
    },
    events: async function (fetchInfo, successCallback, failureCallback) {
      try {
        const booking = await hentBookingerFraSupabase();
        successCallback(booking);
      } catch (error) {
        failureCallback(error);
      }
    },
  });

  calendar.render();
  setupModalEvents(calendar);
});

// Modal

function gemValgtTid(datoStreng) {
  gemtDatoStreng = datoStreng;

  const dato = new Date(datoStreng);
  const pænDato = dato.toLocaleDateString("da-DK", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const pænTid = dato.toLocaleTimeString("da-DK", {
    hour: "2-digit",
    minute: "2-digit",
  });

  document.querySelector(
    "#modal-valgt-tid"
  ).innerText = `Valgt tid: ${pænDato} kl. ${pænTid}`;
  document.querySelector("#booking-modal").style.display = "flex";
}

function setupModalEvents(calendar) {
    const modal = document.querySelector("#booking-modal");
    const lukKnap = document.querySelector(".luk-knap");
    const form = document.querySelector("#booking-form");
  
    if (lukKnap) {
      lukKnap.addEventListener("click", () => (modal.style.display = "none"));
    }
  
    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });
  
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const navn = document.querySelector("#kunde-navn").value.trim();
        const email = document.querySelector("#kunde-email").value;
        const duration = parseInt(document.querySelector("#valgt-duration").value);
        const beskrivelse = document.querySelector("#kunde-beskrivelse").value;
  
        const navneDele = navn.split(" ");
        const fornavn = navneDele[0];
        const efternavn = navneDele.slice(1).join(" ") || "";
  
        
        const succes = await opretBookingSupabase(
          fornavn,
          efternavn,
          email,
          gemtDatoStreng,
          duration,
          beskrivelse
        );
  
        
        if (succes) {
          document.querySelector('#modal-form-indhold').style.display = 'none';
          
          document.querySelector('#succes-hilsen').innerText = `Tak ${fornavn}. Du modtager om et øjeblik en bekræftelsesmail.`;
          document.querySelector('#modal-succes-indhold').style.display = 'block';
          
          form.reset(); 
          calendar.refetchEvents(); 
  
          setTimeout(() => {
              modal.style.display = 'none';
              
              document.querySelector('#modal-form-indhold').style.display = 'block';
              document.querySelector('#modal-succes-indhold').style.display = 'none';
          }, 6000);
        }
      });
    }
  }
  
  async function hentBookingerFraSupabase() {
    const { data, error } = await _supabase
      .from("booking")
      .select("start_time, duration");
    if (error) {
      console.log("Der skete en fejl:", error.message);
      return [];
    }
    return data.map((booking) => {
      const startDato = new Date(booking.start_time);
      const slutDato = new Date(startDato.getTime() + booking.duration * 60000);
      return {
        title: "Optaget",
        start: booking.start_time,
        end: slutDato.toISOString(),
        display: "background",
      };
    });
  }
  
  async function opretBookingSupabase(
    fornavn,
    efternavn,
    email,
    startTid,
    valgtDuration,
    beskrivelse
  ) {
    
    const { data: eksisterendeMøder, error: tjekFejl } = await _supabase
      .from('booking')
      .select('start_time')
      .eq('start_time', startTid);
  
    if (eksisterendeMøder && eksisterendeMøder.length > 0) {
      alert('Beklager! Denne tid er lige blevet snuppet af en anden. Vælg venligst et andet tidspunkt i kalenderen.');
      return false;
    }
  
    const { data, error } = await _supabase.from("booking").insert([
      {
        book_firstname: fornavn,
        book_lastname: efternavn,
        book_email: email,
        start_time: startTid,
        duration: valgtDuration,
        description: beskrivelse,
      },
    ]);
  
    if (error) {
      console.log("Der skete en fejl:", error.message);
      alert("Der skete en fejl under bookingen - prøv venligst igen.");
      return false;
    }
  
    return true;}