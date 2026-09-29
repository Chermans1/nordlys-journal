import './style.css'
import heroImage from './assets/lofoten-hero.jpg'
import lofotenImage from './assets/lofoten.jpg'
import jotunheimenImage from './assets/jotunheimen.jpg'
import bergenImage from './assets/bergen.jpg'
import senjaImage from './assets/senja.jpg'
import rondaneImage from './assets/rondane.jpg'
import tromsoImage from './assets/tromso.jpg'
import journeyImage from './assets/journey.jpg'
import { addDays, compareAsc, differenceInCalendarDays, format, isValid, parseISO } from 'date-fns'
import { nb } from 'date-fns/locale'

const icons = {
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  arrowUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 5l14 14M19 5 5 19"/></svg>',
}

const destinationImages = {
  lofoten: lofotenImage,
  jotunheimen: jotunheimenImage,
  bergen: bergenImage,
  senja: senjaImage,
  rondane: rondaneImage,
  tromso: tromsoImage,
}

const destinations = [
  { id: 'lofoten', name: 'Lofoten', region: 'Nordland', type: 'Kyst', number: '01', color: 'sea', description: 'Skarpe tinder, små fiskevær og lys som aldri helt forsvinner.', tag: 'Midnattssol & hav' },
  { id: 'jotunheimen', name: 'Jotunheimen', region: 'Innlandet', type: 'Fjell', number: '02', color: 'mountain', description: 'Høye topper og stier som gir rom for å puste ut.', tag: 'Toppturer & ro' },
  { id: 'bergen', name: 'Bergen', region: 'Vestland', type: 'By', number: '03', color: 'city', description: 'Trange gater, kaffepauser og utsikt mellom syv fjell.', tag: 'Kultur & kaféer' },
  { id: 'senja', name: 'Senja', region: 'Troms', type: 'Kyst', number: '04', color: 'sunset', description: 'En øy hvor veien svinger mellom fjord og fjell.', tag: 'Veier & villmark' },
  { id: 'rondane', name: 'Rondane', region: 'Innlandet', type: 'Fjell', number: '05', color: 'forest', description: 'Åpne vidder og stille morgener i Norges eldste nasjonalpark.', tag: 'Vandring & stillhet' },
  { id: 'tromso', name: 'Tromsø', region: 'Troms', type: 'By', number: '06', color: 'night', description: 'Arktisk byliv under dansende vinterhimmel.', tag: 'Nordlys & byliv' },
]

const storageKey = 'nordlys-journal-v1'
const today = new Date()
const defaultTrips = [
  { id: 'sample-lofoten', destination: 'Lofoten', date: format(addDays(today, 24), 'yyyy-MM-dd'), type: 'Kyst' },
  { id: 'sample-jotunheimen', destination: 'Jotunheimen', date: format(addDays(today, 63), 'yyyy-MM-dd'), type: 'Fjell' },
]
let saved = { trips: defaultTrips, favorites: [] }
try {
  const stored = JSON.parse(localStorage.getItem(storageKey) || 'null')
  if (stored && Array.isArray(stored.trips) && Array.isArray(stored.favorites)) saved = stored
} catch { /* Use the starter trips when storage is unavailable. */ }
let activeFilter = 'Alle'
let toastTimer

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])
const persist = () => { try { localStorage.setItem(storageKey, JSON.stringify(saved)) } catch { /* The page still works without persistence. */ } }
const dateLabel = (date) => format(parseISO(date), 'd. MMMM yyyy', { locale: nb })
const countdown = (date) => {
  const days = differenceInCalendarDays(parseISO(date), new Date())
  return days === 0 ? 'I dag' : days === 1 ? 'I morgen' : days > 1 ? `Om ${days} dager` : 'Gjennomført'
}

function destinationCard(place) {
  const favorite = saved.favorites.includes(place.id)
  return `<article class="destination-card ${place.color}">
    <div class="card-art"><img src="${destinationImages[place.id]}" alt="" loading="lazy" decoding="async"></div>
    <div class="card-top"><span>${place.number} / 06</span><button class="favorite ${favorite ? 'is-favorite' : ''}" data-favorite="${place.id}" aria-label="${favorite ? 'Fjern' : 'Lagre'} ${place.name} som favoritt" aria-pressed="${favorite}">${icons.heart}</button></div>
    <div class="card-content"><span class="card-tag">${place.tag}</span><h3>${place.name}</h3><p>${place.description}</p><div class="card-bottom"><span>${icons.pin}${place.region}</span><button data-plan="${place.id}" aria-label="Planlegg tur til ${place.name}">${icons.arrowUp}</button></div></div>
  </article>`
}

function renderDestinations() {
  const visible = activeFilter === 'Alle' ? destinations : destinations.filter((place) => place.type === activeFilter)
  document.querySelector('#destination-grid').innerHTML = visible.map(destinationCard).join('')
  document.querySelectorAll('[data-filter]').forEach((button) => {
    const active = button.dataset.filter === activeFilter
    button.classList.toggle('active', active)
    button.setAttribute('aria-pressed', String(active))
  })
}

function renderTrips() {
  const container = document.querySelector('#trip-list')
  const sorted = [...saved.trips].filter((trip) => isValid(parseISO(trip.date))).sort((a, b) => compareAsc(parseISO(a.date), parseISO(b.date)))
  if (!sorted.length) {
    container.innerHTML = `<div class="empty-state"><span class="empty-icon">${icons.calendar}</span><h3>Ingen turer planlagt ennå</h3><p>Legg til et sted du drømmer om å besøke.</p></div>`
    return
  }
  container.innerHTML = sorted.map((trip, index) => `<article class="trip-row">
    <div class="trip-number">${String(index + 1).padStart(2, '0')}</div>
    <div class="trip-main"><h3>${escapeHtml(trip.destination)}</h3><p>${icons.calendar}<time datetime="${trip.date}">${dateLabel(trip.date)}</time><span class="trip-dot">•</span>${escapeHtml(trip.type)}</p></div>
    <span class="countdown ${countdown(trip.date) === 'Gjennomført' ? 'past' : ''}">${countdown(trip.date)}</span>
    <button class="remove-trip" data-remove="${escapeHtml(trip.id)}" aria-label="Fjern tur til ${escapeHtml(trip.destination)}">${icons.close}</button>
  </article>`).join('')
}

function showToast(message) {
  const toast = document.querySelector('#toast')
  toast.textContent = message
  toast.classList.add('show')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200)
}

function openPlanner(destination = '') {
  const dialog = document.querySelector('#planner-dialog')
  const form = document.querySelector('#trip-form')
  form.reset()
  form.elements.date.min = format(new Date(), 'yyyy-MM-dd')
  if (destination) {
    const place = destinations.find((item) => item.id === destination)
    if (place) {
      form.elements.destination.value = place.name
      form.elements.type.value = place.type
    }
  }
  dialog.showModal()
  form.elements.destination.focus()
}

document.querySelector('#app').innerHTML = `
  <header class="site-header"><div class="container header-inner">
    <a class="brand" href="#top" aria-label="Nordlys, til toppen"><span class="brand-mark">✳</span> nordlys<span class="brand-dot">.</span></a>
    <nav aria-label="Hovedmeny"><a href="#opplev">Opplev</a><a href="#mine-turer">Mine turer</a><a href="#om">Om prosjektet</a></nav>
    <a class="header-action" href="#mine-turer">Min reisedagbok <span>${icons.arrowUp}</span></a>
  </div></header>
  <main id="top">
    <section class="hero" style="--hero-image:url('${heroImage}')">
      <div class="hero-shade"></div><div class="container hero-inner">
        <div class="hero-content"><div class="eyebrow light"><span class="eyebrow-line"></span>EN REISEDAGBOK FOR DEG SOM VIL UT</div>
          <h1>Samle steder.<br><em>Skap minner.</em></h1>
          <p>Finn ditt neste eventyr i Norge, planlegg turene dine og gled deg til alt som venter.</p>
          <div class="hero-actions"><a class="button button-primary" href="#opplev">Utforsk steder ${icons.arrow}</a><a class="text-link" href="#mine-turer">Se mine turer <span>↗</span></a></div>
        </div>
        <div class="hero-caption"><span>01 / 06</span><span>LOFOTEN, NORGE<br>68°12′N 13°36′Ø</span></div>
      </div>
      <div class="hero-side-label">NORDLYS — DIN NESTE REISE STARTER HER</div>
    </section>
    <section class="intro-strip"><div class="container strip-inner"><div><span class="strip-icon">✳</span><strong>Et lite sted for store opplevelser.</strong></div><p>Utforsk. Planlegg. Reis. Gjenta.</p><a href="#opplev" aria-label="Gå til steder">${icons.arrow}</a></div></section>
    <section class="destinations section-pad" id="opplev"><div class="container">
      <div class="section-heading"><div><div class="eyebrow"><span class="eyebrow-line"></span>FINN DIN NESTE DESTINASJON</div><h2>Steder å <em>drømme om</em><span class="heading-star">✳</span></h2></div><p>Fra rå kystlinjer til stille fjelltopper. Her er noen steder som fortjener en plass på listen din.</p></div>
      <div class="filter-bar" role="group" aria-label="Filtrer steder">${['Alle', 'Kyst', 'Fjell', 'By'].map((filter) => `<button type="button" data-filter="${filter}" aria-pressed="${filter === 'Alle'}">${filter}</button>`).join('')}<span class="filter-count">06 STEDER Å UTFORSKE</span></div>
      <div class="destination-grid" id="destination-grid"></div>
    </div></section>
    <section class="quote-section"><div class="container quote-inner"><span class="quote-spark">✳</span><div><span class="eyebrow light">LITT INSPIRASJON PÅ VEIEN</span><blockquote>«Det finnes alltid en ny vei å ta, et nytt sted å se og en historie å ta med hjem.»</blockquote></div><span class="quote-end">NORDLYS / 2026</span></div></section>
    <section class="planner section-pad" id="mine-turer"><div class="container"><div class="section-heading planner-heading"><div><div class="eyebrow"><span class="eyebrow-line"></span>DIN PERSONLIGE REISELISTE</div><h2>Det neste <em>eventyret</em><span class="heading-star">✳</span></h2></div><p>Alle gode historier starter med en plan. Legg til turene du gleder deg til, og se hvor lenge det er igjen.</p></div>
      <div class="planner-layout"><div class="planner-note" style="--journey-image:url('${journeyImage}')"><span class="note-kicker">THE PLACES WE GO</span><div class="note-bottom"><span>DIN REISE STARTER HER</span><span>↗</span></div></div><div class="planner-list"><div class="list-header"><span>PLANLAGTE TURER</span><button class="add-button" id="add-trip" type="button">${icons.plus} Legg til tur</button></div><div id="trip-list"></div><p class="list-footnote">Turene dine lagres lokalt i denne nettleseren.</p></div></div>
    </div></section>
    <section class="closing" id="om"><div class="container closing-inner"><div><span class="eyebrow light">TA MED DEG NYSGJERRIGHETEN</span><h2>Verden venter.<br><em>Begynn her.</em></h2></div><a href="#opplev" class="round-arrow" aria-label="Utforsk steder">${icons.arrowUp}</a></div></section>
  </main>
  <footer><div class="container footer-inner"><a class="brand" href="#top"><span class="brand-mark">✳</span> nordlys<span class="brand-dot">.</span></a><p>En liten reisedagbok, laget med Vite og date-fns.</p><span>© 2026 NORDLYS</span></div></footer>
  <dialog id="planner-dialog" aria-labelledby="dialog-title"><div class="dialog-header"><div><span class="eyebrow">NYTT EVENTYR</span><h2 id="dialog-title">Legg til en tur</h2></div><button class="dialog-close" type="button" aria-label="Lukk">${icons.close}</button></div><form id="trip-form"><label>Hvor vil du reise?<input name="destination" type="text" maxlength="60" placeholder="For eksempel Lofoten" required></label><div class="form-row"><label>Når reiser du?<input name="date" type="date" required></label><label>Type tur<select name="type"><option>Kyst</option><option>Fjell</option><option>By</option><option>Annet</option></select></label></div><button class="button button-primary form-submit" type="submit">Lagre tur ${icons.arrow}</button></form></dialog>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>
`

renderDestinations()
renderTrips()

document.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => { activeFilter = button.dataset.filter; renderDestinations() }))
document.querySelector('#destination-grid').addEventListener('click', (event) => {
  const favoriteButton = event.target.closest('[data-favorite]')
  if (favoriteButton) {
    const id = favoriteButton.dataset.favorite
    saved.favorites = saved.favorites.includes(id) ? saved.favorites.filter((item) => item !== id) : [...saved.favorites, id]
    persist(); renderDestinations(); showToast(saved.favorites.includes(id) ? 'Stedet er lagret som favoritt' : 'Stedet er fjernet fra favoritter')
  }
  const planButton = event.target.closest('[data-plan]')
  if (planButton) openPlanner(planButton.dataset.plan)
})
document.querySelector('#add-trip').addEventListener('click', () => openPlanner())
document.querySelector('#trip-list').addEventListener('click', (event) => {
  const button = event.target.closest('[data-remove]')
  if (!button) return
  saved.trips = saved.trips.filter((trip) => trip.id !== button.dataset.remove)
  persist(); renderTrips(); showToast('Turen er fjernet')
})
document.querySelector('.dialog-close').addEventListener('click', () => document.querySelector('#planner-dialog').close())
document.querySelector('#planner-dialog').addEventListener('click', (event) => { if (event.target.id === 'planner-dialog') event.target.close() })
document.querySelector('#trip-form').addEventListener('submit', (event) => {
  event.preventDefault()
  const form = event.currentTarget
  const destination = form.elements.destination.value.trim()
  const date = form.elements.date.value
  if (!destination || !isValid(parseISO(date)) || differenceInCalendarDays(parseISO(date), new Date()) < 0) { showToast('Velg et sted og en gyldig dato'); return }
  saved.trips.push({ id: crypto.randomUUID(), destination, date, type: form.elements.type.value })
  persist(); renderTrips(); document.querySelector('#planner-dialog').close(); showToast('Turen er lagt til i reisedagboken')
})
