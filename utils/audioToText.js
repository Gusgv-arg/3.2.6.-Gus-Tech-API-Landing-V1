import fs from "fs";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.API_KEY_CHATGPT;

const openai = new OpenAI({
    apiKey: API_KEY,
	organization: "org-6qNfHtCMODNqGNtPAbbhLhfA",
	project: "proj_cLySVdd60XL8zbjd9zc8gGMH",
});

async function audioToText(file) {
	const transcription = await openai.audio.transcriptions.create({
		file: fs.createReadStream(file.path),
		model: "whisper-1",
	});
	return transcription.text;
}

export default audioToText;
