import { MessageQueue } from "../utils/landingMessageQueue.js";
import { processMessageWithOpenAiAssistant } from "../utils/processMessageWithOpenAiAssistant.js";
import { processQuestionWithApi } from "../utils/processQuestionWithApi.js";
import { saveGPTResponseInDb } from "../utils/saveGPTResponseInDb.js";
import { saveQuestionInThread } from "../utils/saveQuestionInThread.js";
import { saveUserQuestionInDb } from "../utils/saveUserQuestionInDb.js";
import dotenv from "dotenv";
import textToAudio from "../utils/textToAudio.js";
import { newErrorWhatsAppNotification } from "../utils/newErrorWhatsAppNotification.js";

dotenv.config();

// Define a new instance of MessageQueue
const messageQueue = new MessageQueue();

export const megaBotController = async (req, res) => {
	//Expected object from the user
	const newMessage =
		typeof req.body.messages === "string"
			? JSON.parse(req.body.messages)
			: req.body.messages;

	const files = req.files ? req.files : "";

	const port = process.env.PORT || 4000;
	//console.log("port:", port);

	const baseUrl = `${req.protocol}://${req.get("host")}`;
	//console.log("baseUrl", baseUrl);

	//console.log("newmessages en megabotcontroller---->", newMessage)

	// Get the message, files and the url origin sent by the user && add them to the queue
	messageQueue.enqueueMessage(
		newMessage,
		files,
		baseUrl,
		async (error, response) => {
			if (error) {
				console.log("An error occurred:", error.message);
				
				// Notify error to Admin by WhatsApp
				newErrorWhatsAppNotification("www.gus-tech.com", error.message)
				
				return res.status(500).send({
					role: "assistant",
					content:
						"¡Disculpas! Nuestro asistente virtual MegaBot no pudo procesar tu mensaje. ¡Podés intentar más tarde o por Facebook / Instagram!",
				});
			}

			console.log("GPT response:", response);

			if (newMessage.type === "audio") {
				// For answering audio with audio
				//const audioFilePath = await textToAudio(response.content);

				res
					.status(200)
					.send(response.content);
			} else {
				res.status(200).send({
					role: "assistant",
					content: response?.content
						? response.content
						: response.answerQuestion
						? response.answerQuestion
						: "No GPT response",
				});
			}
		}
	);
};
