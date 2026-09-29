# Nordlys

En responsiv reisedagbok for norske reisemål, bygget med Vite og vanlig JavaScript.

## Funksjoner

- Filtrer reisemål etter kyst, fjell og by.
- Lagre favoritter i nettleserens localStorage.
- Planlegg turer, se dato og nedtelling, og fjern turer igjen.
- `date-fns` brukes til norsk datoformat, sortering og nedtelling.

## Kom i gang

```bash
npm install
npm run dev
```

Kjør `npm run build` for å lage produksjonsversjonen i `dist/`. Prosjektet publiseres automatisk til GitHub Pages ved push til `main`.

## Teknologi og kilder

- [Vite](https://vite.dev/guide/)
- [date-fns](https://date-fns.org/)
- [Vites veiledning for GitHub Pages](https://vite.dev/guide/static-deploy)
- Alle landskapsbildene er generert spesielt for prosjektet med OpenAIs bildegenerator. De er illustrative og ikke dokumentarfotografier av stedene.
