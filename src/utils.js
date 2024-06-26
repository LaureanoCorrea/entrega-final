import multer from "multer";
import { fileURLToPath } from "url";
import { dirname } from "path";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)

const storage = multer.diskStorage({
    destination: (request, file, callback) => {
        callback(null, `${__dirname}/public/image`)
    },
    filename: (request, file, callback ) => {
        callback(null, `${Date.now()}-${file.originalname}`)
    }
})

export const uploader = multer({
    storage
})

export default __dirname