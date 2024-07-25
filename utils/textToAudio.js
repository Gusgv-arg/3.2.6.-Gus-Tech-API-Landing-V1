import fs from "fs";
import path from "path";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.API_KEY_CHATGPT;

const openai = new OpenAI({
	apiKey: API_KEY,
	organization: "org-6qNfHtCMODNqGNtPAbbhLhfA",
	project: "proj_cLySVdd60XL8zbjd9zc8gGMH",
});

const speechFile = path.resolve("assets/speech.mp3");

async function textToAudio(content) {
	console.log("Comienzo a ejecutar textToAudio!!");
	const mp3 = await openai.audio.speech.create({
		model: "tts-1",
		voice: "onyx",
		input: content,
	});
	console.log(speechFile);
	const buffer = Buffer.from(await mp3.arrayBuffer());
	await fs.promises.writeFile(speechFile, buffer);

	return speechFile;
}

export default textToAudio;
