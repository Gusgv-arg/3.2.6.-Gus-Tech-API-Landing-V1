import Leads from "../models/Leads.js";

export const saveUserMessageInDb = async (newMessage, threadId) => {
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

	// Save the sent message to the database
	try {
		
		// Find the lead by Id
		let lead = await Leads.findOne({ id_user: idUser });
				
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

		// Concatenate the new message to the existing content
		const newContent = `${lead.content}\n${currentDateTime} - ${name}: ${content}`;

		// Update the lead content
		lead.content = newContent;

		// Save the updated lead
		await lead.save();
		
		return;
	} catch (error) {
		console.log("Error in saveUserMessageInDb.js:", error.message);
		throw error;
	}
};
