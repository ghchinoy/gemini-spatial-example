import express from "express";
import ViteExpress from "vite-express";
//import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  FunctionDeclarationSchemaType,
  HarmBlockThreshold,
  HarmCategory,
  VertexAI
} from '@google-cloud/vertexai';

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));

// eslint-disable-next-line no-undef
const project = process.env.GOOGLE_CLOUD_PROJECT;
const location = process.env.GOOGLE_CLOUD_LOCATION;
const vertexAI = new VertexAI({project: project, location: location});
console.log('project: ', project);
console.log('location: ', location);
//const geminiApiKey = process.env["GEMINI_API_KEY"];
//const genAI = new GoogleGenerativeAI(geminiApiKey);

app.get("/message", (_, res) => res.send("Hello from express!"));

app.post("/api/generateResponseToText", async (req, res) => {
  const { prompt } = req.body;

  try {
    const model = vertexAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    res.json({ text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/flashGenerateResponseToTextAndImage", async (req, res) => {
  const { prompt, imageData, mimeType } = req.body;

  try {
    const model = vertexAI.getGenerativeModel({
      model: "gemini-1.5-flash-001",
    });

    const textPart = {
      text: prompt,
    };
    const imagePart = {
      inlineData: { data: imageData, mimeType: mimeType },
    };
    const request = {
      contents: [{role: 'user', parts: [textPart, imagePart]}],
    };
    // Create the response stream
    const responseStream =
    await model.generateContentStream(request);

    // Wait for the response stream to complete
    const aggregatedResponse = await responseStream.response;

    // Select the text from the response
    const fullTextResponse =
      aggregatedResponse.candidates[0].content.parts[0].text;
    console.log('fullTextResponse: ', fullTextResponse);
    /*
    const result = await model.generateContent([
      prompt,
      { inlineData: { data: imageData, mimeType: mimeType } },
    ]);
    */

    //const response = result.response;
    //const text = response.text();
    //res.json({ text });
    res.json({ text: fullTextResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/proGenerateResponseToTextAndImage", async (req, res) => {
  const { prompt, imageData, mimeType } = req.body;

  try {
    const model = vertexAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: imageData, mimeType: mimeType } },
    ]);
    const response = result.response;
    const text = response.text();
    res.json({ text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// eslint-disable-next-line no-undef
const port = process.env.NODE_ENV === "production" ? 8080 : 3000;

ViteExpress.listen(app, port, () => console.log("Server is listening..."));
