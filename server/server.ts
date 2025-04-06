import { WebSocketServer } from 'ws';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { WebSocket } from 'ws';

// Type definitions
type ElementType = {
  id: string;
  title: string;
  type: 'item' | 'folder';
  parentId: string | null;
  icon?: string;
  isOpen?: boolean;
};

type WorkspaceData = {
  elements: ElementType[];
};

type WebSocketMessage = {
  type: 'initial' | 'update';
  data: WorkspaceData;
};

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

// Database setup
async function initializeDatabase() {
  const db = await open({
    filename: './workspace.db',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS elements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      parentId TEXT,
      icon TEXT,
      isOpen INTEGER,
      FOREIGN KEY(parentId) REFERENCES elements(id)
    );
  `);

  return db;
}

async function loadWorkspaceData(db: any): Promise<WorkspaceData> {
  const elements = await db.all('SELECT * FROM elements');
  return {
    elements: elements.map((el: any) => ({
      ...el,
      isOpen: Boolean(el.isOpen)
    }))
  };
}

// Save workspace data to the database
async function saveWorkspaceData(db: any, data: WorkspaceData) {
    try {
      await db.run('BEGIN TRANSACTION');
      
      // Clear existing data
      await db.run('DELETE FROM elements');
      
      // Insert new data
      for (const element of data.elements) {
        await db.run(
          `INSERT INTO elements 
          (id, title, type, parentId, icon, isOpen) 
          VALUES (?, ?, ?, ?, ?, ?)`,
          [
            element.id,
            element.title,
            element.type,
            element.parentId,
            element.icon || null,
            element.isOpen ? 1 : 0
          ]
        );
      }
      
      // Commit transaction
      await db.run('COMMIT');
    } catch (error) {
      // Rollback on error
      await db.run('ROLLBACK');
      throw error;
    }
  }

// Server startup
async function startServer() {
  const db = await initializeDatabase();
  let workspaceData: WorkspaceData = { elements: [] };

  try {
    workspaceData = await loadWorkspaceData(db);
    console.log(`Loaded ${workspaceData.elements.length} elements from database`);
  } catch (error) {
    console.error('Error loading workspace data:', error);
  }

  console.log(`WebSocket server running on ws://localhost:${PORT}`);

  wss.on('connection', (ws) => {
    console.log('New client connected');

    // Send current state to new client
    const initialMessage: WebSocketMessage = {
      type: 'initial',
      data: workspaceData
    };
    ws.send(JSON.stringify(initialMessage));

    ws.on('message', async (message) => {
      try {
        const parsedMessage: WebSocketMessage = JSON.parse(message.toString());
        
        if (parsedMessage.type === 'update') {
          // Validate the incoming data
          if (!Array.isArray(parsedMessage.data?.elements)) {
            throw new Error('Invalid data format');
          }

          // Update server state
          workspaceData = parsedMessage.data;
          
          // Persist to database
          await saveWorkspaceData(db, workspaceData);
          
          // Broadcast to all other clients
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(parsedMessage));
            }
          });
        }
      } catch (error) {
        console.error('Error processing message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid update format'
        }));
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  // Cleanup on server shutdown
  process.on('SIGINT', async () => {
    console.log('Shutting down server...');
    wss.close();
    await db.close();
    process.exit();
  });
}

startServer().catch(err => {
  console.error('Server startup error:', err);
  process.exit(1);
});
// import { v4 as uuidv4 } from 'uuid';

// type ElementType = {
//   id: string;
//   title: string;
//   type: 'item' | 'folder';
//   parentId: string | null;
//   icon?: string;
//   isOpen?: boolean;
// };

// type WorkspaceData = {
//   elements: ElementType[];
// };

// type WebSocketMessage = {
//   type: 'initial' | 'update';
//   data: WorkspaceData;
// };

// const PORT = 8080;
// const wss = new WebSocketServer({ port: PORT });

// console.log(`WebSocket server running on ws://localhost:${PORT}`);

// // In-memory database
// let workspaceData: WorkspaceData = {
//   elements: [
//     {
//       id: uuidv4(),
//       title: 'Example Folder',
//       type: 'folder',
//       isOpen: true,
//       parentId: null,
//     },
//     {
//       id: uuidv4(),
//       title: 'Example Item',
//       type: 'item',
//       icon: 'file',
//       parentId: null,
//     },
//   ],
// };

// wss.on('connection', (ws) => {
//   console.log('New client connected');

//   // Send initial data to the new client
//   const initialMessage: WebSocketMessage = {
//     type: 'initial',
//     data: workspaceData,
//   };
//   ws.send(JSON.stringify(initialMessage));

//   ws.on('message', (message) => {
//     try {
//       const parsedMessage: WebSocketMessage = JSON.parse(message.toString());
      
//       if (parsedMessage.type === 'update') {
//         // Update the server state
//         workspaceData = parsedMessage.data;
        
//         // Broadcast the update to all connected clients except the sender
//         wss.clients.forEach((client) => {
//           if (client !== ws && client.readyState === WebSocket.OPEN) {
//             client.send(JSON.stringify(parsedMessage));
//           }
//         });
//       }
//     } catch (error) {
//       console.error('Error processing message:', error);
//     }
//   });

//   ws.on('close', () => {
//     console.log('Client disconnected');
//   });
// });