import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // AI Command Proxy Handler with Lazy Initialization
  app.post("/api/command", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "Gemini API Key is missing. Please configure GEMINI_API_KEY in the Secrets panel."
        });
      }

      const { prompt, devices } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "No prompt supplied." });
      }

      // Initialize Google Gen AI lazily
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build-googlehome',
          }
        }
      });

      const systemInstruction = `You are Google Home AI, the brain of a highly sophisticated, human-centric smart home.
Your goal is to parse natural language commands or questions, understand the user's explicit intent, decide what device state modifications should occur, and return a helpful verbal reply along with the list of state updates.

You have access to the current device state:
${JSON.stringify(devices || [], null, 2)}

Instructions:
1. Parse the command: Look for references to rooms (Living Room, Kitchen, Bedroom, Hallway, etc.), devices (Lights, Thermostat, Lock, Speaker, Vacuum, Camera) and action cues ("going out", "movie night", "good night", "warmer", "cool down", "clean the house").
2. Update state intelligently:
   - "Good night" / "going to sleep": Turn off all indoor lights, lock the front door, turn off audio, set thermostat to an optional comfortable eco temperature (like 68).
   - "Leave home" / "going out": Turn off all appliances (lights, speakers), lock doors, resume vacuum docked or start vacuum cleaning.
   - "Movie mode": Dim living room lights, turn other surrounding room lights off, set speaker volume or state.
   - "Thermostat to 72" or "Make it warmer": Increase or set the thermostat targetTemp. Adjust mode to 'heat' or 'cool' accordingly.
   - "Clean up": Resume/spin-up robot vacuum into 'cleaning' status.
   - "Turn on all lights / Turn off kitchen": Perform exact matching of room and device.
3. Be friendly and assistant-like in your "speech" response. State what you are doing in a brief, delightful Google Nest style tone.
4. Provide structured logs for the event timeline. Each log should be a literal human-understandable change message.
5. Identify energy savings or safety tips if applicable, and return them as an 'insights' string (or empty if no insight).

Return standard JSON adhering strictly to the requested schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              speech: {
                type: Type.STRING,
                description: "The Google Assistant direct verbal reply stating exactly what actions were executed or answering a question about the general home state."
              },
              mutations: {
                type: Type.ARRAY,
                description: "Array of mutations mapped to explicit device IDs.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: {
                      type: Type.STRING,
                      description: "The targeted device's unique ID."
                    },
                    isOn: { type: Type.BOOLEAN },
                    brightness: { type: Type.INTEGER },
                    color: { type: Type.STRING },
                    targetTemp: { type: Type.INTEGER },
                    mode: { type: Type.STRING, description: "One of 'heat', 'cool', 'eco', 'off'" },
                    isLocked: { type: Type.BOOLEAN },
                    isPlaying: { type: Type.BOOLEAN },
                    volume: { type: Type.INTEGER },
                    status: { type: Type.STRING, description: "One of 'docked', 'cleaning', 'returning', 'charging', 'paused'" }
                  },
                  required: ["id"]
                }
              },
              logs: {
                type: Type.ARRAY,
                description: "Short history elements describing what changes were actioned.",
                items: {
                  type: Type.STRING
                }
              },
              insights: {
                type: Type.STRING,
                description: "Smart ambient recommendation, e.g. energy performance suggestions, or security reminders."
              }
            },
            required: ["speech", "mutations", "logs"]
          }
        }
      });

      const responseText = response.text || "{}";
      const result = JSON.parse(responseText.trim());
      return res.json(result);

    } catch (e: any) {
      console.error("Gemini route error: ", e);
      return res.status(500).json({ error: e.message || "Something went wrong." });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Google Home AI Server] Live on http://localhost:${PORT}`);
  });
}

startServer();
