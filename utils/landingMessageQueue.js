import { processMessageWithOpenAiAssistant } from "./processMessageWithOpenAiAssistant.js";
import { processQuestionWithApi } from "./processQuestionWithApi.js";
import { saveQuestionInThread } from "./saveQuestionInThread.js";
import { saveUserQuestionInDb } from "./saveUserQuestionInDb.js";

// Class definition for the Queue
export class MessageQueue {
	constructor() {
		this.queues = new Map();
	}

	// Function to process the Queue
	async processQueue(senderId) {
		const queue = this.queues.get(senderId);
		//console.log("Queue:", queue);

		//If there is no queue or there is no processing return
		if (!queue || queue.processing) return;

		// Turn processing to true
		queue.processing = true;

		while (queue.messages.length || queue.files.length > 0) {
			// Take the first record and delete it from the queue
			const newMessage = queue.messages.shift();
			const newFile = queue.files.shift();
			console.log("newfile--->", newFile)

			try {
				if (newMessage.question) {
					const id_user = newMessage.id_user;
					//Save user predefined Q&A in DB
					await saveUserQuestionInDb(id_user, newMessage);

					//Save user predefined Q&A in thread
					await saveQuestionInThread(id_user, newMessage);

					//Process the user question
					const response = processQuestionWithApi(newMessage);

					// Excecute callback for be able to respond the user (res object).
					queue.responseCallback(null, response);
										
					// Pass the user non predefinded question to the GPT
				} else {
					const response = await processMessageWithOpenAiAssistant(
						newMessage,
						newFile.files,
						newFile.baseUrl
					);
					//console.log("response GPT:", response)
					
					// Excecute callback for be able to respond the user (res object)
					queue.responseCallback(null, {
							content: response?.messageGpt
								? response.messageGpt
								: response.errorMessage,
							threadId: response.threadId,
						});					
				}
			} catch (error) {
				console.error(`14. Error processing message: ${error.message}`);
				// Send error message to the user
				//const errorMessage = await sendErrorMessage(newMessage);

				// Change flag to allow next message processing
				queue.processing = false;

				// If there is an error for a web message, I use callback function to send the error to the user
				if (newMessage.channel === "web" && queue.responseCallback) {
					queue.responseCallback(error, null);
				}
			}
		}
		// Change flag to allow next message processing
		queue.processing = false;
	}

	// Function to add messages to the Queue
	enqueueMessage(newMessage, files, baseUrl, responseCallback = null) {
		// If the queue has no ID it saves it && creates messages, processing and resposeCallbach properties
		if (!this.queues.has(newMessage.id_user)) {
			this.queues.set(newMessage.id_user, {
				messages: [],
				files: [],
				processing: false,
				responseCallback: null,				 
			});
		}

		// Look for the queue with the sender ID
		const queue = this.queues.get(newMessage.id_user);
		//console.log("Queue:", queue);

		// If web message, I save the callback
		if (newMessage.channel === "web") {
			queue.responseCallback = responseCallback;
		}

		// Add the message && file to the Queue
		queue.messages.push(newMessage);
		queue.files.push({ files: files, baseUrl: baseUrl });

		// Process the queue
		this.processQueue(newMessage.id_user);
	}
}
