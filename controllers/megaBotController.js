import { processMessageWithOpenAiAssistant } from "../utils/processMessageWithOpenAiAssistant.js";
import { processQuestionWithApi } from "../utils/processQuestionWithApi.js";
import { saveQuestionInThread } from "../utils/saveQuestionInThread.js";
import { saveUserQuestionInDb } from "../utils/saveUserQuestionInDb.js";
import dotenv from "dotenv";

dotenv.config();

export const megaBotController = async (req, res) => {
	//Expected object from the user
	const newMessage =
		typeof req.body.messages === "string"
			? JSON.parse(req.body.messages)
			: req.body.messages;
	const files = req.files ? req.files : "";
	
	const port = process.env.PORT || 4000;
	console.log("port:", port);
	const baseUrl = `${req.protocol}://${req.get('host')}`;
	console.log("baseUrl", baseUrl)

	//console.log("newmessages en megabotcontroller---->", newMessage)

	try {
		// If user asks predefined question
		if (newMessage.question) {
			const id_user = newMessage.id_user;
			//Save user predefined Q&A in DB
			await saveUserQuestionInDb(id_user, newMessage);

			//Save user predefined Q&A in thread
			await saveQuestionInThread(id_user, newMessage)

			//Process the user question
			const response = processQuestionWithApi(newMessage);
			res
				.status(200)
				.send({ role: "assistant", content: response.answerQuestion });

			// Pass the user non predefinded question to the GPT
		} else {
			const response = await processMessageWithOpenAiAssistant(
				newMessage,
				files,
				baseUrl
			);
			//console.log("response GPT:", response)
			res.status(200).send({
				role: "assistant",
				content: response?.messageGpt
					? response.messageGpt
					: response.errorMessage,
				threadId: response.threadId,
			});
		}
	} catch (error) {
		console.log("Error en megaBotCotroller:", error.message);
		res.status(500).send({ error: error.message });
	}
};
