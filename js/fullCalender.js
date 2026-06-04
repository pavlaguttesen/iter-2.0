import { supabaseUrl, supabaseKey } from "../env.js";

const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

let gemtDatoStreng = "";

document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");
  if (!calendarEl) return;

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    weekends: false,
    firstDay: 1,
    locale: "da",

    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "",
    },
    buttonText: {
      today: "Denne måned",
      month: "Måned",
      week: "Uge",
      day: "Dag",
      prev: "Forrige måned",
      next: "Næste måned",
    },

    selectAllow: function (selectInfo) {
      const iDag = new Date();
      iDag.setDate(iDag.getDate() + 1);
      iDag.setHours(0, 0, 0, 0);

      return selectInfo.start >= iDag;
    },

    selectable: true,

    selectLongPressDelay: 0,

    select: function (info) {
      valgForDato(info.startStr);
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

async function valgForDato(datoStreng) {
  gemtDatoStreng = datoStreng;

  const dato = new Date(datoStreng);
  const pænDato = dato.toLocaleDateString("da-DK", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  document.querySelector(
    "#modal-valgt-tid"
  ).innerText = `Valgt tid: ${pænDato}`;

  const { data: optagetMøder, error: tjekFejl } = await _supabase
    .from("booking")
    .select("start_time");

  const optagetKlokkeslaet = optagetMøder
    ? optagetMøder
        .filter(
          (møde) => møde.start_time && møde.start_time.startsWith(datoStreng)
        )
        .map((møde) => møde.start_time.split("T")[1].substring(0, 5))
    : [];

  const standardTid = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
  ];

  const selectElement = document.querySelector("#valgt-klokkeslaet");
  selectElement.innerHTML = "";

  standardTid.forEach((tid) => {
    if (optagetKlokkeslaet.includes(tid)) {
      return;
    }

    const option = document.createElement("option");
    option.value = tid;
    option.text = `Kl. ${tid}`;
    selectElement.appendChild(option);
  });

  if (selectElement.options.length === 0) {
    const option = document.createElement("option");
    option.value = "Optaget";
    option.text = "Ingen ledige tidspunkter";
    option.disabled = true;
    selectElement.appendChild(option);
  }

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
      const duration = 30;
      const beskrivelse = document.querySelector("#kunde-beskrivelse").value;

      const navneDele = navn.split(" ");
      const fornavn = navneDele[0];
      const efternavn = navneDele.slice(1).join(" ") || "";

      const valgtTidspunkt = document.querySelector("#valgt-klokkeslaet").value;

      if (valgtTidspunkt === "Optaget" || valgtTidspunkt === "Optaget") {
        alert("Vælg venligst et ledigt tidspunkt");
        return;
      }

      const fuldDatoTid = `${gemtDatoStreng}T${valgtTidspunkt}:00`;

      const succes = await opretBookingSupabase(
        fornavn,
        efternavn,
        email,
        fuldDatoTid,
        duration,
        beskrivelse
      );

      if (succes) {
        const mailDato = new Date(fuldDatoTid).toLocaleDateString("da-DK", {
          weekday: "long",
          day: "numeric",
          month: "long",
          hour: "2-digit",
          minute: "2-digit",
        });

        const kundeParametre = {
          kunde_navn: navn,
          kunde_email: email,
          mail_emne: `Mødebekræftelse - Iter`,
          mail_overskrift: `Dit uforpligtende møde er bekræftet`,
          mail_brodtekst: `Jeg glæder mig til at møde dig og have en snak om dit projekt. \n\nTidspunkt: ${mailDato}. \n\nMødet foregår fysisk på værkstedet. \n\nHvis du har spørgsmål, kan du kontakte mig på email eller telefon.`,
        };

        await emailjs.send("service_snedker", "template_gjotpg9", kundeParametre);

        const adminParametre = {
            admin_emne: `NY BOOKING: Møde aftalt - Iter`,
            admin_overskrift: `En kunde har booket en tid i din kalender.`,
            admin_brodtekst: `Kunde: ${fornavn} ${efternavn} \n\nE-mail: ${email} \n\nTidspunkt: ${mailDato} \n\nKundens beskrivelse: ${beskrivelse}`,
        };

        await emailjs.send("service_snedker", "template_w2ok64w", adminParametre);

        document.querySelector("#modal-form-indhold").style.display = "none";
        document.querySelector(
          "#succes-hilsen"
        ).innerText = `Tak ${fornavn}. Du modtager om et øjeblik en bekræftelsesmail`;
        document.querySelector("#modal-succes-indhold").style.display = "block";

        form.reset();
        calendar.refetchEvents();

        setTimeout(() => {
          modal.style.display = "none";
          document.querySelector("#modal-form-indhold").style.display = "block";
          document.querySelector("#modal-succes-indhold").style.display =
            "none";

          valgForDato(gemtDatoStreng);
        }, 4000);
      }
    });
  }
}

async function hentBookingerFraSupabase() {
  const { data, error } = await _supabase.from("booking").select("start_time");
  if (error) {
    console.log("Der skete en fejl:", error.message);
    return [];
  }
  return data.map((booking) => {
    const kunDato = booking.start_time.split("T")[0].trim(0);

    return {
      title: "Booket",
      start: kunDato,
      allDay: true,
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
    .from("booking")
    .select("start_time")
    .eq("start_time", startTid);

  if (eksisterendeMøder && eksisterendeMøder.length > 0) {
    alert(
      "Beklager! Denne tid er lige blevet snuppet af en anden. Vælg venligst et andet tidspunkt i kalenderen."
    );
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

  return true;
}
