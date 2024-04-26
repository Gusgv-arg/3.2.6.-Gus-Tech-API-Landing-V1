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
		//IMPORTANTE!! ACA TENGO Q MODIFICAR PARA QUE BUSQUE X ID Y NO POR THREADID!!!!!!!!!!!
		// Find the lead by threadId
		let lead = await Leads.findOne({ thread_id: threadId });
		
		// If the lead does not exist for that thread, create it and return
		if (lead === null) {
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

			// Look initial conversations and concatenate them
			let allContent = "";
			if (newMessage.length > 1) {
				newMessage.forEach((message) => {
					if(message.role==="assistant"){
						allContent = `${allContent} ${currentDateTime} - MegaBot: ${message.content}\n`; 
					} else {
						allContent = `${allContent} ${currentDateTime} - Web User: ${message.content}`; 
					}					
				});
			}
			
			// Create the lead in database
			lead = await Leads.create({
				name: name,
				id_user: idUser,
				channel: channel,
				content: allContent,
				thread_id: threadId,
				botSwitch: "ON",
			});

			return;
		}
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
