import { processMessageWithOpenAiAssistant } from "../utils/ProcessMessageWithOpenAiAssistant.js";
import { processQuestionWithApi } from "../utils/processQuestionWithApi.js";


export const megaBotController = async (req, res) => {
	//Expected object from the user
	const newMessage = req.body.messages
	console.log("newmessages----->", newMessage)
	
	try {
		// If there is a predefined question answer directly
		if (newMessage.question){
			const response = (processQuestionWithApi(newMessage))
			console.log("response", response)
			res.status(200).send({ role: "assistant", content: response.answerQuestion, threadId: response?.threadId? response.threadId : "" });
		
		// Pass the question to the GPT
		} else {
			const response = await (processMessageWithOpenAiAssistant(newMessage))	       
			res.status(200).send({ role: "assistant", content: response.messageGpt, threadId: response.threadId });
		}
	} catch (error) {
		console.log("Error:", error.message)
		res.status(500).send({ error: error.message });
	}
};
