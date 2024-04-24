import Leads from "../models/Leads.js";

export const saveGPTResponseInDb = async (messageGpt, threadId) => {
	
	// Save the sent message to the database
	try {
		// Find the lead by threadId
		let lead = await Leads.findOne({ thread_id: threadId });

		// If the lead does not exist for that thread, there is an error and return
		// ACA VER QUE HACER XQ TENDRIA QUE MANEJAR ESTE ERROR
		if (lead === null) {
			console.log(
				`An error has ocurred finding thread_id ${threadId} in Leads DB!!`
			);
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
		const newContent = `${lead.content}\n${currentDateTime} - MegaBot: ${messageGpt}`;

		// Update the lead content
		lead.content = newContent;

		// Save the updated lead
		await lead.save();

		//console.log(`Updated Leads DB with GPT Message: "${messageGpt}..."`);

		return;
	} catch (error) {
		console.log(`Error in saveGPTResponse.js while saving message: ${error.message}`
		);
		throw new Error(error.message);
	}
};
