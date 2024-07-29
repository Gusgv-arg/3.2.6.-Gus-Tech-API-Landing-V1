import Leads from "../models/Leads.js";

export const cleanThreadController = async (req, res) => {
	const userId = req.body.idUser;
    console.log(userId)
	try {
		let lead = await Leads.findOne({ id_user: userId });
		if (lead) {
			lead.thread_id = "";
			await lead.save();
            res.status(200).send(`¡Thread del usuario con Id ${userId} fue reseteado con éxito!`)
		} else {
            res.status(200).send(`El Thread del usuario con ID ${userId} NO pudo ser reseteado`)
        }
	} catch (error) {
        console.log("Error in cleanThreadController.js:", error.message)
        res.status(500).send(`Error limpiando el Thread Id: ${error.message}`)
    }
};
