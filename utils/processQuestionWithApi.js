import { answerQuestion1, answerQuestion2, answerQuestion3 } from "../utils/Questions.js";

export const processQuestionWithApi = (newMessage) => {
	let answerQuestion;
	
	if (newMessage.question === "question1") {
		answerQuestion = answerQuestion1;
		return { answerQuestion };
	} else if (newMessage.question === "question2") {
		answerQuestion = answerQuestion2;
		return { answerQuestion };
    } else if (newMessage.question === "question3") {
		answerQuestion = answerQuestion3;
		return { answerQuestion };
    }
};
