import nodemailer from "nodemailer";
import { configObject } from "../config/connectDB.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const transport = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    auth: {
        user: configObject.gmail_user,
        pass: configObject.gmail_pass,
    },
    tls: {
      rejectUnauthorized: false 
  }
})

 const sendEmail = async ({service ="", to ="", subject = "", html = ""} ) => await transport.sendMail({
  from: `${service}-${configObject.gmail_user}`,
  to, 
  subject,
  html,
})

export default sendEmail