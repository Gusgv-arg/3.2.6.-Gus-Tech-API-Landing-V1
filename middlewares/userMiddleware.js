import Leads from "../models/Leads.js";

export const userMiddleware = async (req, res, next) => {
	const newMessage = req.body.messages;
	const id = newMessage[newMessage.length - 1]?.id_user
		? newMessage[newMessage.length - 1].id_user
		: newMessage.id_user;

	const name = newMessage[newMessage.length - 1]?.name
		? newMessage[newMessage.length - 1].name
		: newMessage.name;

	const channel = newMessage[newMessage.length - 1]?.channel
		? newMessage[newMessage.length - 1].channel
		: newMessage.channel;

	try {
		let lead = await Leads.findOne({ id_user: id });

		// Create lead if it doesnt exist with the initial greet and next()
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

			// Create the lead in database with the initial greet
			const greeting =
				"¡Hola!👋 Soy MegaBot, Asistente virtual impulsado por Inteligencia Artificial entrenado para explicarte como podes potenciar tu negocio implementando otro como yo. Para comenzar podes seleccionar una pregunta predefinida o directamente conversar. ¿Empezamos?";

			lead = await Leads.create({
				name: name,
				id_user: id,
				channel: channel,
				content: `${currentDateTime} - MegaBot: ${greeting}`,
				thread_id: "",
				botSwitch: "ON",
			});
			next();
		} else {
			next();
		}
	} catch (error) {
		console.log("Error en userMiddleware:", error.message);
		throw error;
	}
};
