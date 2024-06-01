import { createHash, isValidPassword } from "../utils/hashBcrypt.js";
import { generateToken } from "../utils/jsonwebtoken.js";
import { cartService, userService } from "../repositories/index.js";
import { logger } from "../utils/logger.js";
import { configObject } from "../config/connectDB.js";
import sendEmail from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";

class SessionsController {
  constructor() {
    this.userService = userService;
    this.cartService = cartService;
  }

  async register(req, res, next) {
    try {
      const { first_name, last_name, email, password } = req.body;

      if (!first_name || !last_name || !email || !password)
        return res
          .status(400)
          .send({ status: "error", error: "Values incomplete" });

      // Verificar si el usuario ya existe
      const existingUser = await this.userService.getUser({ email });
      if (existingUser) {
        return res
          .status(401)
          .send({ status: "error", message: "El usuario ya existe" });
      }

      // Crear el nuevo usuario
      const newUser = {
        first_name,
        last_name,
        email,
        password: createHash(password),
      };

      let result = await this.userService.createUser(newUser);

      res.status(201).render("exito", { name: newUser.first_name });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return res.status(400).send({ status: "error", error: "Faltan Datos" });

      const user = await this.userService.getUser({ email });
      logger.info("user", user);

      if (!user)
        return res
          .status(401)
          .send({ status: "error", error: "No se encuentra el usuario" });

      // Verificar si el usuario ya tiene un carrito asociado
      if (!user.cart) {
        // Si no tiene un carrito, crea uno nuevo asociado al correo electrónico del usuario
        const newCart = await this.cartService.create({
          userEmail: email, // Usar el correo electrónico del usuario para crear el carrito
        });

        // Asocia el _id del carrito al usuario
        user.cart = newCart._id;

        // Actualizar el usuario en la base de datos con el _id del carrito
        await this.userService.updateUser(user._id, { cart: newCart._id });
      }

      const isValidPass = isValidPassword(user, password);

      if (!isValidPass)
        return res
          .status(401)
          .send({ status: "error", error: "Usuario o contraseña incorrectos" });

      // generar un token para el usuario
      const { first_name, last_name, role } = user;
      const token = generateToken({
        first_name: user.first_name,
        id: user._id,
        role: user.role,
        cart: user.cart,

        expiresIn: "24h",
      });

      res.cookie("cookieToken", token, {
        maxAge: 60 * 60 * 1000 * 24,
        httpOnly: true,
      });
      res.redirect("/products");
    } catch (error) {
      logger.error("Error al iniciar sesión:", error);
      res.status(500).send("Error (products) interno del servidor");
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const user = await this.userService.getUser({ email });

      if (!user) {
        return res
          .status(400)
          .send({ status: "error", message: "El usuario no existe" });
      }

      const token = generateToken({ email: user.email, expiresIn: "1h" });
      const configEmail = {
        service: "Restore",
        to: email,
        subject: "Restablecer contraseña",
        html: `
          <p> Hola ${user.first_name}, </p>
          <p> Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
          <a href="http://localhost:8080/api/sessions/resetPassword/${token}">Restablecer contraseña</a>
          <p>Este enlace expirará en 1 hora.</p>
        `,
      };
      await sendEmail(configEmail);

      res.status(200).render("mailsended");
    } catch (error) {
      logger.error(error);
      res.status(500).send("Error interno del servidor");
    }
  }

  async resetPasswordForm(req, res) {
    const { token } = req.params;
    try {
      // Verificar si el token ha expirado
      const decoded = jwt.verify(token, configObject.jwt_private_key);
      // Si el token no ha expirado, renderizar la vista de restablecimiento de contraseña
      res.render("resetPassword", { token });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        // Si el token ha expirado, redirigir a una vista donde el usuario pueda generar un nuevo correo de restablecimiento
        res.render("expiredResetLink");
      } else {
        logger.error(error);
        res.status(500).send("Error interno del servidor");
      }
    }
  }

  async resetPassword(req, res) {
    try {
      const { newPass, confirmNewPass, token } = req.body;
      if (newPass !== confirmNewPass) {
        return res
          .status(400)
          .send({ status: "error", message: "Las contraseñas no coinciden" });
      }

      if (!newPass || !confirmNewPass) {
        return res
          .status(400)
          .send({ status: "error", message: "Faltan datos de Password" });
      }
      // Decodificar el token para obtener el email
      const decoded = jwt.verify(token, configObject.jwt_private_key);
      const { email } = decoded;

      const user = await this.userService.getUser(email);

      if (!user) {
        return res
          .status(400)
          .send({ status: "error", message: "El usuario no existe" });
      }

      const validPass = isValidPassword(user, newPass);
      if (validPass) {
        return res.status(400).send({
          status: "error",
          message: "No puedes usar la misma contraseña",
        });
      }

      const newHashPass = createHash(newPass);
      await this.userService.updateUser(user._id, { password: newHashPass });

      res
        .status(200)
        .send({ status: "success", message: "Contraseña cambiada" });
    } catch (error) {
      logger.error(error);
      res.status(500).send("Error interno del servidor");
    }
  }

  failLogin(req, res) {
    res.send({ status: "error", message: "Login fallido" });
  }

  // async githubAuthCallback(req, res) {
  //   try {
  //     if (!req.user) {
  //       return res.status(401).send("No autorizado");
  //     }

  //     res.redirect("/products");
  //   } catch (error) {
  //     logger.error("Error en la autenticación de GitHub:", error);
  //     res.status(500).send("Error interno del servidor");
  //   }
  // }

  logout(req, res) {
    res.clearCookie("cookieToken");
    res.redirect("/login");
  }
}

export default SessionsController;
