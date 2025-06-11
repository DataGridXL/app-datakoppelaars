# app-datakoppelaars

Een eenvoudige React-applicatie voor het beheren en plaatsen van bestellingen in een Thais restaurant, gebouwd met Vite en Supabase voor authenticatie en dataopslag.

## Lokale ontwikkeling

Installeer de dependencies en start de Vite-ontwikkelserver:

```bash
npm install
npm run dev
```

Optioneel kun je de dev-server met lokaal SSL (HTTPS) starten zodra je certificaten hebt gegenereerd:
```bash
HTTPS=true SSL_CRT_FILE=./localhost.pem SSL_KEY_FILE=./localhost-key.pem npm run dev
```

## Supabase gegevens

Maak een `.env.local` bestand aan in de root-map, met de keys uit je Supabase account:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Docker

Build en run de applicatie in Docker:

```bash
docker build -t app-datakoppelaars .
docker run -it --rm -p 80:80 app-datakoppelaars
```

Open http://localhost in je browser om de applicatie te bekijken.

### HTTPS via Docker (certificaten mounten)
Om de container via HTTPS te laten draaien, mount je lokaal gekochte of gegenereerde certificaatbestanden en exposeer je poort 443:

```bash
docker build -t app-datakoppelaars .
docker run -it --rm \
  -p 127.0.0.1:80:80 -p 127.0.0.1:443:443 \
  -v $(pwd)/localhost.pem:/etc/nginx/ssl/localhost.pem \
  -v $(pwd)/localhost-key.pem:/etc/nginx/ssl/localhost-key.pem \
  app-datakoppelaars
```

Open daarna https://localhost in je browser en vertrouw het certificaat als dat nog niet gebeurd is.

## HTTPS (lokaal)

Voor lokale HTTPS-ontwikkeling kun je een self-signed (of lokaal vertrouwd) certificaat genereren:

### Optie A: mkcert (aanbevolen)
Installeer [mkcert](https://github.com/FiloSottile/mkcert) om automatisch een lokaal vertrouwd certificaat te genereren:
```bash
brew install mkcert
mkcert -install
mkcert localhost 127.0.0.1
```
Dit maakt twee bestanden aan (bijvoorbeeld `localhost+2.pem` en `localhost+2-key.pem`). Voeg deze toe aan `.gitignore`:
```gitignore
# Local SSL certs
*.pem
*-key.pem
```
Start de dev-server met HTTPS:
```bash
HTTPS=true SSL_CRT_FILE=./localhost+2.pem SSL_KEY_FILE=./localhost+2-key.pem npm run dev
```
Open vervolgens https://localhost:5173 en vertrouw het certificaat (op macOS via Keychain Access: stel in op "Always Trust").

### Optie B: handmatig met OpenSSL
Als je mkcert niet wilt gebruiken, genereer handmatig een self-signed cert met subjectAltName voor `localhost` en `127.0.0.1`:
```bash
openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout localhost-key.pem \
  -out localhost.pem \
  -days 365 \
  -subj "/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
```
Voeg de bestanden toe aan `.gitignore` (of zorg dat je `*.pem` en `*-key.pem` negeert).
Start de dev-server met HTTPS:
```bash
HTTPS=true SSL_CRT_FILE=./localhost.pem SSL_KEY_FILE=./localhost-key.pem npm run dev
```
Open daarna https://localhost:5173 en vertrouw het certificaat (de browser zal waarschuwen voor self-signed certificaten; importeer het in je systeemtruststore of kies in Chrome “Proceed to localhost (unsafe)”).

# Architectuur

+---------------------+ +------------------------------+ +---------------------------+
| n8n Workflow | | Supabase | | React App |
+---------------------+ +------------------------------+ +---------------------------+
| - Trigger | | - orders table | | /login → Auth via Supabase|
| - Auth: JWT via API | ----> | - FK: user_id → auth.users | <---- | /dashboard |
| - Download ZIP | | - RLS: user_id = auth.uid() | <---- | - Line chart: omzet/dag |
| - Unzip & Parse CSV | +------------------------------+ | - Pie chart: top producten |
| - POST naar Supabase| ---> | /new-order (formulier) |
+---------------------+ +---------------------------+