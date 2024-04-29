import OpenAI from "openai";
import dotenv from "dotenv";
import Leads from "../models/Leads.js";
import axios from "axios";
import { saveUserMessageInDb } from "./saveUserMessageInDb.js";
import { saveGPTResponseInDb } from "./saveGPTResponseInDb.js";

dotenv.config();

const API_KEY = process.env.API_KEY_CHATGPT;

const openai = new OpenAI({
	apiKey: API_KEY,
	organization: "org-6qNfHtCMODNqGNtPAbbhLhfA",
	project: "proj_cLySVdd60XL8zbjd9zc8gGMH"
});

export const processMessageWithOpenAiAssistant = async (newMessage) => {
	const assistantId = process.env.OPENAI_ASSISTANT_ID;
	let threadId;

	//Variables depend on wether its a new customer (sends an array) or not (sends object)
	const name = newMessage[newMessage.length - 1]?.name
		? newMessage[newMessage.length - 1].name
		: newMessage.name;

	const idUser = newMessage[newMessage.length - 1]?.id_user
		? newMessage[newMessage.length - 1].id_user
		: newMessage.id_user;

	const content = newMessage[newMessage.length - 1]?.content
		? newMessage[newMessage.length - 1].content
		: newMessage.content;

	const channel = newMessage[newMessage.length - 1]?.channel
		? newMessage[newMessage.length - 1].channel
		: newMessage.channel;
	
	const role = newMessage[newMessage.length - 1]?.role
		? newMessage[newMessage.length - 1].role
		: newMessage.role;

	//console.log("newMessage en processMessage...:", newMessage);
	//console.log("name------>", name)

	// Check if there is an existing thread for the user
	let existingThread;

	try {
		existingThread = await Leads.findOne({
			id_user: idUser, //Last record of messages
			thread_id: { $exists: true, $ne: "" },
		});		
	} catch (error) {
		console.error("Error fetching thread from the database:", error.message);
		throw error;
	}

	if (existingThread) {
		threadId = existingThread.thread_id;
		//console.log("existringThread--->", existingThread)

		// Pass in the user question into the existing thread
		await openai.beta.threads.messages.create(threadId, {
			role: "user",
			content: content,
		});
	} else {
		// Create a new thread because its a new customer
		const thread = await openai.beta.threads.create();
		threadId = thread.id;
		//console.log("threadId:", threadId)

		// Attach all the messages to thread
		newMessage.forEach(async (message) => {
			await openai.beta.threads.messages.create(threadId, {
				role: message.role,
				content: message.content,
			});
		});
	}
	// Save the received message from USER to the database
	await saveUserMessageInDb(newMessage, threadId);

	// Run the assistant and wait for completion
	let maxAttempts = 5;
	let currentAttempt = 0;
	let runStatus;
	let run;
	let specialInstructions;

	do {
		try {
			// Check if there are key words and if so pass it to the run
			//const instructions = await matchkeyWords(newMessage);

			//Variable created to save in Messages DB
			//specialInstructions = instructions;

			let instructions = "";

			if (instructions === "") {
				// Run the assistant normally without streaming
				run = await openai.beta.threads.runs.create(threadId, {
					assistant_id: assistantId,
				});
				//console.log("run----->", run);
			} else {
				// run the assistant with special instructions
				console.log(
					"Running assistant with special instructions!!\n",
					instructions
				);
				run = await openai.beta.threads.runs.create(threadId, {
					assistant_id: assistantId,
					//instructions: instructions,
					//additional_instructions: instructions,
				});
			}

			runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);

			while (runStatus.status !== "completed") {
				await new Promise((resolve) => setTimeout(resolve, 3000));
				runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
			}

			//console.log(`7. Run completed for --> ${newMessage.name}: "${newMessage.receivedMessage}".`);

			break; // Exit the loop if the run is completed
		} catch (error) {
			console.error(
				`7. Error running the assistant for --> ${newMessage.name}: "${newMessage.receivedMessage}", ${error.message}`
			);
			currentAttempt++;
			if (currentAttempt >= maxAttempts || error) {
				console.error("7. Exceeded maximum attempts. Exiting the loop.");
				const errorMessage =
					"Te pido disculpas 🙏, en este momento no puedo procesar tu solicitud ☹️. Por favor intentá mas tarde. ¡Saludos de MegaBot! 🙂";

				// Exit the loop if maximum attempts are exceeded and send an error message to the user
				return { errorMessage, threadId };
			}
		}
	} while (currentAttempt < maxAttempts);

	// Get the last assistant message from the messages array
	const messages = await openai.beta.threads.messages.list(threadId);
	//console.log("message-------------->", messages)

	// Find the last message for the current run
	const lastMessageForRun = messages.data
		.filter(
			(message) => message.run_id === run.id && message.role === "assistant"
		)
		.pop();

	// Send the assistants response
	if (newMessage && lastMessageForRun) {
		let messageGpt = lastMessageForRun.content[0].text.value;

		//Save the received message from the ASSISTANT to the database
		await saveGPTResponseInDb(idUser, messageGpt, threadId);
		
		return { messageGpt, threadId };
	}
};
