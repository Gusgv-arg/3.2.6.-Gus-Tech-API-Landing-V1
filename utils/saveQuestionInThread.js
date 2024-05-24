import OpenAI from "openai";
import dotenv from "dotenv";
import Leads from "../models/Leads.js";
import axios from "axios";
import {
	answerQuestion1,
	answerQuestion2,
	answerQuestion3,
} from "../utils/Questions.js";

dotenv.config();

const API_KEY = process.env.API_KEY_CHATGPT;

const openai = new OpenAI({
	apiKey: API_KEY,
	organization: "org-6qNfHtCMODNqGNtPAbbhLhfA",
	project: "proj_cLySVdd60XL8zbjd9zc8gGMH",
});

export const saveQuestionInThread = async (id_user, newMessage) => {
	// Check if there is an existing thread for the user
	let existingThread;
	let threadId;
	try {
		existingThread = await Leads.findOne({
			id_user: id_user, //Last record of messages
			thread_id: { $exists: true, $ne: "" },
		});
	} catch (error) {
		console.error("Error fetching thread from the database:", error.message);
		throw error;
	}

	// Get the answer of users question
	let answerQuestion;

	if (newMessage.question === "question1") {
		answerQuestion = answerQuestion1;
	} else if (newMessage.question === "question2") {
		answerQuestion = answerQuestion2;
	} else if (newMessage.question === "question3") {
		answerQuestion = answerQuestion3;
	}

	//Save Q&A in Thread
	if (existingThread) {
		threadId = existingThread.thread_id;
		//console.log("existringThread--->", existingThread)

		// Pass in the user question into the existing thread
		await openai.beta.threads.messages.create(
			threadId,
			{
				role: newMessage.role,
				content: newMessage.content,
			},
			{
				role: "assistant",
				content: answerQuestion,
			}
		);
	} else {
		// Create a new thread because its a new customer
		const thread = await openai.beta.threads.create();
		threadId = thread.id;
		//console.log("threadId:", threadId)

		// Pass in the user question into the new thread
		await openai.beta.threads.messages.create(
			threadId,
			{
				role: newMessage.role,
				content: newMessage.content,
			},
			{
				role: "assistant",
				content: answerQuestion,
			}
		);
		//Save threadId in Leads
		try {
			const lead = await Leads.findOne({
				id_user: id_user,
			});
			lead.thread_id = threadId;
			// Save the updated lead
			await lead.save();
			return;
		} catch (error) {
			console.error("Error fetching thread from the database:", error.message);
			throw error;
		}
	}
};
