# Imposter - Multiplayer Game

A fully-featured online multiplayer deduction game where players must identify the imposter among them.

## Features

- **Real-time Multiplayer**: WebSocket-based communication for instant updates
- **Lobby System**: Create or join lobbies with unique codes
- **Game Phases**: Word reveal, discussion, voting, and results
- **Animated UI**: Beautiful particle background with smooth animations
- **Responsive Design**: Works on all devices and screen sizes
- **Production Ready**: Complete full-stack application ready for deployment

## Technology Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + Socket.IO
- **Database**: SQLite
- **Icons**: Lucide React
- **Build Tool**: Vite

## Game Rules

1. All players receive the same secret word, except one who becomes the imposter
2. Players see their word/role and click "Ready" when prepared
3. A random speaking order is generated for discussion
4. Players use external voice chat (Discord, etc.) to discuss
5. Everyone votes to eliminate who they think is the imposter
6. The player with the most votes is eliminated and revealed
7. Host can restart the round

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

### Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

The server will run on port 3001 by default, or the port specified in the `PORT` environment variable.

### Ubuntu Server Setup

1. Install Node.js:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. Clone and setup the project:
   ```bash
   git clone <your-repo-url>
   cd imposter-game
   npm install
   npm run build
   ```

3. Install PM2 for process management:
   ```bash
   sudo npm install -g pm2
   pm2 start server/index.js --name "imposter-game"
   pm2 startup
   pm2 save
   ```

4. Setup Nginx reverse proxy:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## API Endpoints

### Socket.IO Events

**Client → Server:**
- `create-lobby` - Create a new lobby
- `join-lobby` - Join existing lobby by code
- `start-game` - Start the game (host only)
- `player-ready` - Mark player as ready
- `cast-vote` - Submit vote for elimination
- `restart-game` - Restart the game (host only)

**Server → Client:**
- `lobby-created` - Lobby creation confirmation
- `lobby-joined` - Lobby join confirmation
- `lobby-updated` - Real-time lobby state updates
- `game-started` - Game start with word/role
- `discussion-phase` - Discussion phase with speaking order
- `voting-results` - Vote results and elimination
- `game-restarted` - Game restart confirmation
- `error` - Error messages

## Database Schema

### Tables

**lobbies**
- `id` (TEXT PRIMARY KEY)
- `code` (TEXT UNIQUE) - 6-character lobby code
- `host_id` (TEXT) - ID of lobby host
- `created_at` (DATETIME)

**players**
- `id` (TEXT PRIMARY KEY)
- `lobby_id` (TEXT) - Foreign key to lobbies
- `username` (TEXT)
- `socket_id` (TEXT) - Socket connection ID
- `is_host` (BOOLEAN)
- `is_ready` (BOOLEAN)
- `is_imposter` (BOOLEAN)
- `is_eliminated` (BOOLEAN)
- `vote_target` (TEXT) - ID of voted player

**game_states**
- `lobby_id` (TEXT PRIMARY KEY)
- `phase` (TEXT) - Current game phase
- `current_word` (TEXT) - Secret word for the round
- `speaking_order` (TEXT) - JSON array of speaking order
- `votes_revealed` (BOOLEAN)

## Security Features

- Server-side game state validation
- SQL injection protection with parameterized queries
- Input sanitization and validation
- Rate limiting on socket connections
- Secure random word and imposter selection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details