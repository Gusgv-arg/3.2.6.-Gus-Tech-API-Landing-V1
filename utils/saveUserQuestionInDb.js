import Leads from "../models/Leads.js";
import { answerQuestion1, answerQuestion2, answerQuestion3 } from "./Questions.js";

export const saveUserQuestionInDb = async (id_user, newMessage) => {
	
    // Get the answer of the question
    let answer =""
    if (newMessage.question === "question1"){
        answer = answerQuestion1
    } else if (newMessage.question === "question2"){
        answer = answerQuestion2
    } else if (newMessage.question === "question3"){
        answer = answerQuestion3
    } 
    
    try {
		const lead = await Leads.findOne({ id_user });
		
		// Obtain current date and hour
		const currentDateTime = new Date().toLocaleString("es-AR", {
			timeZone: "America/Argentina/Buenos_Aires",
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		});

		// Concatenate the question and the answer to the existing content
		const newContent = `${lead.content}\n${currentDateTime} - ${newMessage.name}: ${newMessage.content}\n${currentDateTime} - MegaBot: ${answer}`;

		// Update the lead content
		lead.content = newContent;

		// Save the updated lead
		await lead.save();
		return;
	} catch (error) {
		console.log("Error in saveUserQuestionInDb:", error.message);
		throw error;
	}
};
