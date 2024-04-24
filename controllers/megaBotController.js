import { processMessageWithOpenAiAssistant } from "../utils/ProcessMessageWithOpenAiAssistant.js";


export const megaBotController = async (req, res) => {
	//Expected object from the user
	const newMessage = req.body.messages
	//console.log("newmessages----->", newMessage)
	
	try {
		const response = await (processMessageWithOpenAiAssistant(newMessage))	       
        res.status(200).send({ role: "assistant", content: response.messageGpt, threadId: response.threadId });
	} catch (error) {
		console.log("Error:", error.message)
		res.status(500).send({ error: error.message });
	}
};
