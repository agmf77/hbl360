import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import apiRouter from './server/routes';
import { db } from './server/db';
import { RealTimeEventType } from './server/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Set up WebSocket server on /ws path
const wss = new WebSocketServer({ server, path: '/ws' });

let activeClients = 0;

function broadcastToClients(type: RealTimeEventType, payload: any, sourceUser?: string) {
  const message = JSON.stringify({
    type,
    payload,
    timestamp: new Date().toISOString(),
    sourceUser: sourceUser || 'System'
  });

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Connect Database Broadcaster to WebSocket
db.setBroadcaster((event, payload, sourceUser) => {
  broadcastToClients(event, payload, sourceUser);
});

wss.on('connection', (ws: WebSocket, req) => {
  activeClients++;
  const clientIp = req.socket.remoteAddress || 'unknown';

  // Broadcast presence update
  broadcastToClients('user:presence_updated', {
    activeUsers: activeClients,
    message: 'নতুন ব্যবহারকারী সিস্টেমে সংযুক্ত হয়েছেন।'
  });

  // Send initial welcome & stats payload
  try {
    const stats = db.getDashboardStats();
    ws.send(JSON.stringify({
      type: 'system:stats_updated',
      payload: { stats, activeUsers: activeClients, initialSync: true },
      timestamp: new Date().toISOString()
    }));
  } catch (err) {
    console.error('[WS] Initial payload error:', err);
  }

  ws.on('message', (data) => {
    try {
      const parsed = JSON.parse(data.toString());
      if (parsed.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
      }
    } catch {
      // Ignore non-json
    }
  });

  ws.on('close', () => {
    activeClients = Math.max(0, activeClients - 1);
    broadcastToClients('user:presence_updated', {
      activeUsers: activeClients,
      message: 'একজন ব্যবহারকারী সংযোগ বিচ্ছিন্ন হয়েছেন।'
    });
  });

  ws.on('error', (err) => {
    console.warn('[WS] Client connection warning:', err.message);
  });
});

// API Routes
app.use('/api', apiRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'PBS Employee House Loan Management System',
    wsPath: '/ws',
    activeClients,
    timestamp: new Date().toISOString()
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`================================================================`);
    console.log(`পবিস কর্মকর্তা-কর্মচারী গৃহ ঋণ ব্যবস্থাপনা সিস্টেম`);
    console.log(`PBS Employee House Loan Management System (Full-Stack & Realtime)`);
    console.log(`HTTP & WebSocket Server running at: http://localhost:${PORT}`);
    console.log(`WebSocket Endpoint: ws://localhost:${PORT}/ws`);
    console.log(`================================================================`);
  });
}

startServer().catch((err) => {
  console.error('[SERVER] Fatal startup error:', err);
  process.exit(1);
});
