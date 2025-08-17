# Tonik Coding Test

Live site available on: https://tonik.lmonk.net

Some lag is present due to the Cloudflare tunnel, but given the unsecure nature of this app I don't feel comfortable deploying it without Cloudflare.

## How to run

### Option 1: Docker

1. Clone the code

```bash
git clone https://github.com/varthe/tonik-coding-test.git
cd tonik-coding-test
```

2. Build the image

```bash
docker build -t tonik .
```

3. Create compose file `docker-compose.yml`:

```yaml
services:
  tonik:
    build:
      context: .
      # args:
      #   NEXT_PUBLIC_SOCKET_URL: # Socket URL if deploying in production
    container_name: tonik
    ports:
      - "3000:3000"
      - "3001:3001"
    restart: unless-stopped
```

4. Compose and run:

```bash
docker compose up -d
docker logs -f tonik # To show logs
```

5. Access app at `https://localhost:3000`

### Option 2: Local

1. Clone the code

```bash
git clone https://github.com/varthe/tonik-coding-test.git
cd tonik-coding-test
```

2. Run nextjs app:

```bash
npm install
npm run dev
```

3. Run backend

```
cd backend
npm install
npm run start
```

4. Access app at `http://localhost:3000`

## What I built

I created a simple Next.js app similar to Typeracer.

When at least one player is present, the round will begin. A random sentence is picked and sent to all players, after which the players are given 20 seconds to type it out. Once they are finished, or if the round ends, the number of correct keystrokes and the time taken are sent to the server, where their statistics are calculated and sent to the other players. Each player's statistics are displayed in a leaderboard.

## Assumptions

- One sentence per round.
- Rounds last 20 seconds
- Small number of players, allowing to store their state in memory.
- No user authentication required
- Players have a stable internet connection, so occasional packet loss or latency doesn't need to be handled

## Design choices

- **TypeScript**: TypeScript was used for both backend and frontend in order to reducer errors and make the codebase easier to extend.
- **Tailwind CSS**: Tailwind was used to keep styling consistent.
- **Game logic**: Rounds were kept simple. Once sentence per round, 20 seconds to complete the sentence and a 10 second break in between.
- **Scalability**: The code was written in a way to make extension easy, for example by adding more sentences to each round and implementing live updates.
- **Websockets**: Websockets were used for real-time communication because they are the most straightforward to implement.

## Production readiness

Currently the app is not suited for a production environment. Below is a list of issues and how I would mitigate them if I had more time:

- Basic username validation, which might allow malicious scripts or unexpected input. This can be fixed by adding more advanced validation in the backend.
- No auth/login system in place. Adding one would improve security and let us track player progress.
- Players are able to send fabricated data, allowing them to manipulate their statistics and other functions. This can be fixed by encoding the data, and validating it once it reaches the server. A lot of the computation can also be moved to the server.
- The overall design of the app was rushed - I didn't account for accessibility and only used basic styling. If I had more time, I would come up with a proper and modern design as well as test the accessbility using a screen reader.
- Live updates during a round are not working. I began to implement periodic updates to the server to track the players' progress in real time, but decided to focus on other things given my remaining time.
- Only one sentence per round. Right now, if a player is finished typing before the round ends they will need to wait for the others to finish. This can be easily fixed by allowing more than one sentence, or by using longer sentences.

I'm comfortable deploying the app on my server only because it's inside a Docker container, so even if the backend is compromised the impact is limited to the container. The app is also served through a Cloudflare tunnel, which hides the server’s IP address and provides protection against DDoS attacks, bots, and crawlers.

## Testing

I ran out of time before I could add tests. Given more time I would add:

- Unit tests for backend functions like WPM calcuations, timers etc.
- Integration tests for socket events
- Load tests to ensure the server can handle a high number of concurrent connections

## AI usage

AI was used for the following:

- Dockerfile generation
- `sentences.json` file containing 100 sentences to use in the app
- `USERNAME_REGEX` in `InputUsername.tsx`
- Starting point for socket code in `server.ts` and `socket.ts`
- General research regarding React, Next.js and sockets

## Demo

Demo available on https://tonik.lmonk.net
