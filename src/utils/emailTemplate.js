// Plantilla para enviar la url con el enlace de verificación
export const Url_Verification_Template = `
  <!DOCTYPE html>
  <html lang="es">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verificación de cuenta | CIELP</title>
      <style>
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
          
          body {
              font-family: 'Roboto', Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background-color: #f5f7f9;
              color: #333333;
              line-height: 1.6;
          }
          
          .email-wrapper {
              width: 100%;
              max-width: none;
              background-color: #f5f7f9;
          }
          
          .container {
              width: 100%;
              max-width: 800px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 12px;
              box-shadow: 0 5px 20px rgba(21, 46, 58, 0.12);
              overflow: hidden;
          }
          
          .header {
              background-color: #152E3A;
              color: white;
              padding: 40px 30px;
              text-align: center;
              font-size: 28px;
              font-weight: 600;
              border-bottom: 5px solid #2a5769;
          }
          
          .logo {
              margin-bottom: 15px;
              max-width: 200px;
          }
          
          .content {
              padding: 50px 40px;
              color: #444;
              line-height: 1.8;
              max-width: 100%;
          }
          
          .salutation {
              font-size: 20px;
              font-weight: 500;
              color: #152E3A;
              margin-bottom: 25px;
          }
          
          .message {
              font-size: 17px;
              margin-bottom: 30px;
              text-align: justify;
          }
          
          .button-container {
              margin: 35px auto;
              text-align: center;
          }

          .verification-button {
              display: inline-block;
              padding: 14px 30px;
              background-color: #152E3A;
              color: white !important;
              text-decoration: none;
              border-radius: 6px;
              font-size: 16px;
              font-weight: 500;
              box-shadow: 0 4px 6px rgba(21, 46, 58, 0.12);
          }

          .alternative-text {
              display: block;
              margin: 15px 0;
              font-size: 14px;
              color: #666;
              text-align: left;
          }

          .link-url {
              word-break: break-all;
              color: #152E3A;
              font-weight: 500;
          }
          
          .note {
              font-size: 15px;
              color: #666;
              margin-top: 30px;
              padding-top: 25px;
              border-top: 1px solid #eee;
              text-align: justify;
          }
          
          .footer {
              background-color: #f0f3f5;
              padding: 30px 40px;
              text-align: center;
              color: #555;
              font-size: 14px;
              border-top: 1px solid #e1e5e8;
          }
          
          .social-links {
              margin: 20px 0;
          }
          
          .social-icon {
              display: inline-block;
              margin: 0 10px;
              width: 35px;
              height: 35px;
              background-color: #152E3A;
              border-radius: 50%;
              text-align: center;
              line-height: 35px;
          }
          
          .social-icon img {
              vertical-align: middle;
              width: 18px;
              height: 18px;
          }
          
          .separator {
              height: 1px;
              background-color: #e1e5e8;
              margin: 20px 0;
          }
          
          .copyright {
              font-size: 13px;
              color: #777;
              line-height: 1.5;
          }
          
          /* Estilos para tablets */
          @media only screen and (max-width: 768px) {
              body {
                  padding: 15px;
              }
              
              .container {
                  max-width: 100%;
                  border-radius: 8px;
              }
              
              .header {
                  padding: 30px 25px;
                  font-size: 24px;
              }
              
              .content {
                  padding: 40px 30px;
              }
              
              .salutation {
                  font-size: 18px;
              }
              
              .message {
                  font-size: 16px;
              }
              
              .verification-button {
                  display: block;
                  text-align: center;
              }
              
              .footer {
                  padding: 25px 30px;
              }
          }
          
          /* Estilos para móviles */
          @media only screen and (max-width: 480px) {
              body {
                  padding: 10px;
              }
              
              .container {
                  border-radius: 0;
                  margin: 0;
              }
              
              .header {
                  padding: 25px 20px;
                  font-size: 22px;
              }
              
              .content {
                  padding: 30px 20px;
              }
              
              .salutation {
                  font-size: 17px;
                  margin-bottom: 20px;
              }
              
              .message {
                  font-size: 15px;
                  margin-bottom: 25px;
              }
              
              .note {
                  font-size: 14px;
                  margin-top: 25px;
                  padding-top: 20px;
              }
              
              .footer {
                  padding: 20px 15px;
                  font-size: 13px;
              }
              
              .social-icon {
                  width: 30px;
                  height: 30px;
                  line-height: 30px;
                  margin: 0 6px;
              }
              
              .social-icon img {
                  width: 16px;
                  height: 16px;
              }
              
              .copyright {
                  font-size: 12px;
              }
          }
          
          /* Estilos específicos para clientes de email */
          @media screen and (min-width: 600px) {
              .container {
                  width: 800px !important;
              }
          }
          
          /* Fix para Outlook */
          .outlook-fix {
              mso-table-lspace: 0pt;
              mso-table-rspace: 0pt;
              border-collapse: collapse;
              border-spacing: 0;
          }
      </style>
      <!--[if mso]>
      <style>
          .container {
              width: 800px !important;
          }
      </style>
      <![endif]-->
  </head>
  <body>
      <div class="email-wrapper">
          <div class="container outlook-fix">
              <div class="header">
                  <div>{cabecera}</div>
              </div>
              <div class="content">
                  <div class="salutation">Estimado/a profesional,</div>
                  <div class="message">
                      Gracias por unirte a CIELP, el ecosistema digital diseñado para el cuidado de tu salud mental y la prevención del burnout. Por favor verifique su cuenta abriendo el siguiente link de verificación en la plataforma:
                  </div>
                  <div class="button-container">
                      <a href="{verificationCode}" class="verification-button">Verificar mi cuenta</a>
                  </div>
                  <div class="alternative-text">
                      Si el botón no funciona, puede copiar y pegar el siguiente enlace en su navegador:
                      <a href="{verificationCode}" class="link-url">{verificationCode}</a>
                  </div>
                  <div class="message">
                      Este código es de un solo uso y expirará después de 25 minutos. Una vez verificada su cuenta, tendrá acceso completo a todas las herramientas y recursos diseñados específicamente para apoyar su tratamiento profesional.
                  </div>
                  <div class="note">
                      Si no ha solicitado esta verificación o necesita asistencia, por favor contáctenos inmediatamente a través de cielpcontacto+soporte@gmail.com.
                  </div>
              </div>
              <div class="footer">
                  <div>CIELP - Cuidando a quienes enseñan. Herramientas digitales basadas en el inventario de Maslach para prevenir el agotamiento profesional.</div>
                  <div class="separator"></div>
                  <div class="copyright">&copy; ${new Date().getFullYear()} CIELP | https://cielp.online/ | Desarrollado por ALBO DEV</div>
              </div>
          </div>
      </div>
  </body>
  </html>
`;

// Plantilla para enviar el correo de bienvenida
export const Welcome_Template = `
  <!DOCTYPE html>
  <html lang="es">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bienvenido a CIELP | Plataforma Digital para el Bienestar y la Prevención del Burnout</title>
      <style>
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
          
          body {
              font-family: 'Roboto', Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f5f7f9;
              color: #333333;
              line-height: 1.6;
          }
          
          .container {
              max-width: 600px;
              margin: 40px auto;
              background: #ffffff;
              border-radius: 12px;
              box-shadow: 0 5px 20px rgba(21, 46, 58, 0.12);
              overflow: hidden;
          }
          
          .header {
              background-color: #152E3A;
              color: white;
              padding: 30px 20px;
              text-align: center;
              font-size: 26px;
              font-weight: 600;
              border-bottom: 5px solid #2a5769;
          }
          
          .logo-container {
              margin-bottom: 15px;
          }
          
          .content {
              padding: 35px 30px;
              color: #444;
              line-height: 1.8;
          }
          
          .salutation {
              font-size: 20px;
              font-weight: 500;
              color: #152E3A;
              margin-bottom: 20px;
          }
          
          .welcome-message {
              font-size: 17px;
              margin-bottom: 25px;
          }
          
          .feature-list {
              background-color: rgba(21, 46, 58, 0.05);
              padding: 20px 25px;
              border-radius: 8px;
              margin: 25px 0;
          }
          
          .feature-list h3 {
              margin-top: 0;
              color: #152E3A;
              font-size: 18px;
              font-weight: 500;
          }
          
          .feature-list ul {
              padding-left: 20px;
              margin-bottom: 5px;
          }
          
          .feature-list li {
              margin-bottom: 12px;
              position: relative;
          }
          
          .button-container {
              text-align: center;
              margin: 30px 0;
          }
          
          .button {
              display: inline-block;
              padding: 14px 30px;
              background-color: #152E3A;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-size: 16px;
              font-weight: 500;
              transition: all 0.3s ease;
              box-shadow: 0 4px 6px rgba(21, 46, 58, 0.12);
          }
          
          .button:hover {
              background-color: #1e3f4e;
              transform: translateY(-2px);
              box-shadow: 0 6px 8px rgba(21, 46, 58, 0.15);
          }
          
          .support-section {
              border-top: 1px solid #eee;
              padding-top: 20px;
              margin-top: 25px;
              font-size: 15px;
          }
          
          .support-section p {
              margin-bottom: 10px;
          }
          
          .contact-email {
              color: #152E3A;
              font-weight: 500;
              text-decoration: none;
          }
          
          .footer {
              background-color: #f0f3f5;
              padding: 20px;
              text-align: center;
              color: #555;
              font-size: 13px;
              border-top: 1px solid #e1e5e8;
          }
          
          .social-links {
              margin: 15px 0;
          }
          
          .separator {
              height: 1px;
              background-color: #e1e5e8;
              margin: 15px 0;
          }
          
          .copyright {
              font-size: 12px;
              color: #777;
          }
          
          @media only screen and (max-width: 620px) {
              .container {
                  width: 100%;
                  margin: 20px auto;
                  border-radius: 0;
              }
              
              .content {
                  padding: 25px 20px;
              }
              
              .button {
                  display: block;
                  text-align: center;
              }
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <div class="logo-container">
                  <!-- Si dispones de un logo, aquí iría la imagen -->
              </div>
              <div>¡Bienvenido/a a CIELP! Comienza tu camino hacia el bienestar</div>
          </div>
          <div class="content">
              <div class="salutation">Estimado/a {name} {lastname},</div>
              
              <div class="welcome-message">
                 Gracias por unirte a CIELP, el ecosistema digital diseñado para el cuidado de tu salud mental y la prevención del burnout. En CIELP, entendemos los desafíos únicos que enfrentan los profesionales de la educación, y estamos comprometidos a brindarte las herramientas y recursos necesarios para apoyarte en tu desarrollo profesional y bienestar emocional.
              </div>
              
              <div class="feature-list">
                  <h3>Para comenzar a aprovechar todas las funcionalidades:</h3>
                  <ul>
                      <li><strong>Evaluación Psicométrica</strong> – (MBI - Maslach Burnout Inventory), Cálculo automático de las tres dimensiones del Burnout.</li>
                      <li><strong>Espacios Digitales de Relajación</strong> – Acceso a una biblioteca de sonidos ambientales (Bosque, Mar, Lluvia).</li>
                      <li><strong>Panel de Control</strong> – Visualización del Total de Minutos invertidos en su salud mental.</li>
                 </ul>
              </div>
              
              <div class="button-container">
                  <a href="https://cielp.online/login" class="button">Acceder a mi cuenta</a>
              </div>
              
              <div class="support-section">
                  <p>Su desarrollo profesional es nuestra prioridad. Si tiene alguna consulta o necesita asistencia, nuestro equipo especializado está disponible para ayudarle:</p>
                  <p>✉️ <a href="mailto:cielpcontacto+soporte@gmail.com" class="contact-email">cielpcontacto+soporte@gmail.com</a></p>
                  <p>📞 Línea de atención: +57 (XXX) XXX-XXXX</p>
              </div>
          </div>
          <div class="footer">
              <div>CIELP - Cuidando a quienes enseñan. Herramientas digitales basadas en el inventario de Maslach para prevenir el agotamiento profesional.</div>
              <div class="separator"></div>
              <div class="copyright">&copy; ${new Date().getFullYear()} CIELP | https://cielp.online | Desarrollado por ALBO DEV</div>
          </div>
      </div>
  </body>
  </html>
`;

//Plantilla para enviar la URL de restablecimiento de la contraseña
export const Url_Template = `
  <!DOCTYPE html>
  <html lang="es">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Restablecimiento de Contraseña | CIELP</title>
      <style>
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
          
          body {
              font-family: 'Roboto', Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f5f7f9;
              color: #333333;
              line-height: 1.6;
          }
          
          .container {
              max-width: 600px;
              margin: 40px auto;
              background: #ffffff;
              border-radius: 12px;
              box-shadow: 0 5px 20px rgba(21, 46, 58, 0.12);
              overflow: hidden;
          }
          
          .header {
              background-color: #152E3A;
              color: white;
              padding: 30px 20px;
              text-align: center;
              font-size: 24px;
              font-weight: 600;
              border-bottom: 5px solid #2a5769;
          }
          
          .content {
              padding: 35px 30px;
              color: #444;
              line-height: 1.8;
          }
          
          .salutation {
              font-size: 18px;
              font-weight: 500;
              color: #152E3A;
              margin-bottom: 20px;
          }
          
          .message {
              font-size: 16px;
              margin-bottom: 25px;
          }
          
          .button-container {
              margin: 35px auto;
              text-align: center;
          }
          
          .recovery-button {
              display: inline-block;
              padding: 14px 30px;
              background-color: #152E3A;
              color: white !important;
              text-decoration: none;
              border-radius: 6px;
              font-size: 16px;
              font-weight: 500;
              transition: all 0.3s ease;
              box-shadow: 0 4px 6px rgba(21, 46, 58, 0.12);
          }
          
          .recovery-button:hover {
              background-color: #1e3f4e;
              transform: translateY(-2px);
              box-shadow: 0 6px 8px rgba(21, 46, 58, 0.15);
          }
          
          .security-notice {
              margin-top: 30px;
              padding: 15px;
              background-color: rgba(21, 46, 58, 0.05);
              border-left: 4px solid #152E3A;
              border-radius: 4px;
              font-size: 14px;
          }
          
          .security-notice p {
              margin: 0 0 10px;
          }
          
          .security-notice p:last-child {
              margin-bottom: 0;
          }
          
          .support-section {
              margin-top: 30px;
              font-size: 15px;
              border-top: 1px solid #eee;
              padding-top: 20px;
          }
          
          .footer {
              background-color: #f0f3f5;
              padding: 20px;
              text-align: center;
              color: #555;
              font-size: 13px;
              border-top: 1px solid #e1e5e8;
          }
          
          .separator {
              height: 1px;
              background-color: #e1e5e8;
              margin: 15px 0;
          }
          
          .copyright {
              font-size: 12px;
              color: #777;
          }
          
          .alternative-text {
              display: block;
              margin: 15px 0;
              font-size: 14px;
              color: #666;
          }
          
          .link-url {
              word-break: break-all;
              color: #152E3A;
              font-weight: 500;
          }
          
          @media only screen and (max-width: 620px) {
              .container {
                  width: 100%;
                  margin: 20px auto;
                  border-radius: 0;
              }
              
              .content {
                  padding: 25px 20px;
              }
              
              .recovery-button {
                  display: block;
                  text-align: center;
              }
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">{cabecera}</div>
          <div class="content">
              <div class="salutation">Estimado/a profesional,</div>
              
              <div class="message">
                  Hemos recibido una solicitud para restablecer la contraseña de su cuenta en la plataforma CIELP. Para crear una nueva contraseña de forma segura, por favor haga clic en el siguiente botón:
              </div>
              
              <div class="button-container">
                  <a href="{urlCode}" class="recovery-button">Restablecer mi contraseña</a>
              </div>
              
              <div class="alternative-text">
                  Si el botón no funciona, puede copiar y pegar el siguiente enlace en su navegador:
                  <a href="{urlCode}" class="link-url">{urlCode}</a>
              </div>
              
              <div class="security-notice">
                  <p><strong>Aviso de seguridad:</strong></p>
                  <p>• Este enlace caducará en 25 minutos por motivos de seguridad.</p>
                  <p>• Si no ha solicitado restablecer su contraseña, le recomendamos contactar inmediatamente con nuestro equipo de soporte, ya que alguien podría estar intentando acceder a su cuenta.</p>
                  <p>• Por su seguridad, nunca compartimos sus credenciales por correo electrónico ni le solicitamos información personal adicional.</p>
              </div>
              
              <div class="support-section">
                  <p>Si necesita asistencia adicional, nuestro equipo de soporte está disponible en:</p>
                  <p>✉️ <a href="mailto:cielpcontacto+soporte@gmail.com" style="color: #152E3A; font-weight: 500; text-decoration: none;">cielpcontacto+soporte@gmail.com</a></p>
                  <p>📞 Línea de atención: +57 (300) 430-1256</p>
              </div>
          </div>
          <div class="footer">
              <div>CIELP - Plataforma para profesionales de la salud mental</div>
              <div class="separator"></div>
              <div class="copyright">&copy; ${new Date().getFullYear()} CIELP | https://cielp.online | Desarrollado por ALBO DEV</div>
          </div>
      </div>
  </body>
  </html>
`;

// Plantilla para confirmar que la contraseña fue restablecida con exito
export const Password_Reset_Success_Template = `
  <!DOCTYPE html>
  <html lang="es">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Contrasena actualizada correctamente | CIELP</title>
      <style>
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');

          body {
              font-family: 'Roboto', Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f5f7f9;
              color: #333333;
              line-height: 1.6;
          }

          .container {
              max-width: 600px;
              margin: 40px auto;
              background: #ffffff;
              border-radius: 12px;
              box-shadow: 0 5px 20px rgba(21, 46, 58, 0.12);
              overflow: hidden;
          }

          .header {
              background-color: #152E3A;
              color: white;
              padding: 30px 20px;
              text-align: center;
              font-size: 24px;
              font-weight: 600;
              border-bottom: 5px solid #2a5769;
          }

          .content {
              padding: 35px 30px;
              color: #444;
              line-height: 1.8;
          }

          .salutation {
              font-size: 18px;
              font-weight: 500;
              color: #152E3A;
              margin-bottom: 20px;
          }

          .message {
              font-size: 16px;
              margin-bottom: 18px;
          }

          .security-box {
              margin-top: 22px;
              padding: 14px;
              background-color: rgba(21, 46, 58, 0.05);
              border-left: 4px solid #152E3A;
              border-radius: 4px;
              font-size: 14px;
          }

          .button-container {
              margin: 30px 0 15px;
              text-align: center;
          }

          .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #152E3A;
              color: white !important;
              text-decoration: none;
              border-radius: 6px;
              font-size: 15px;
              font-weight: 500;
          }

          .footer {
              background-color: #f0f3f5;
              padding: 20px;
              text-align: center;
              color: #555;
              font-size: 13px;
              border-top: 1px solid #e1e5e8;
          }

          .separator {
              height: 1px;
              background-color: #e1e5e8;
              margin: 15px 0;
          }

          .copyright {
              font-size: 12px;
              color: #777;
          }

          @media only screen and (max-width: 620px) {
              .container {
                  width: 100%;
                  margin: 20px auto;
                  border-radius: 0;
              }

              .content {
                  padding: 25px 20px;
              }

              .button {
                  display: block;
                  text-align: center;
              }
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">Contrasena actualizada con exito</div>
          <div class="content">
              <div class="salutation">Estimado/a {name} {lastname},</div>

              <div class="message">
                  Le confirmamos que su contrasena en CIELP fue restablecida correctamente.
              </div>

              <div class="message">
                  Si usted realizo este cambio, no necesita realizar ninguna otra accion.
              </div>

              <div class="security-box">
                  <strong>Aviso de seguridad:</strong>
                  Si no reconoce esta accion, por favor contacte de inmediato al equipo de soporte para proteger su cuenta.
              </div>

              <div class="button-container">
                  <a href="https://cielp.online/login" class="button">Ingresar a CIELP</a>
              </div>
          </div>
          <div class="footer">
              <div>CIELP - Cuidando a quienes ensenan. Herramientas digitales para prevenir el agotamiento profesional.</div>
              <div class="separator"></div>
              <div class="copyright">&copy; ${new Date().getFullYear()} CIELP | https://cielp.online | Desarrollado por ALBO DEV</div>
          </div>
      </div>
  </body>
  </html>
`;

// Plantilla para alertas criticas de burnout hacia psicologia
export const Burnout_Critical_Alert_Template = `
  <!DOCTYPE html>
  <html lang="es">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Alerta clinica prioritaria | CIELP</title>
      <style>
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');

          body {
              font-family: 'Roboto', Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f5f7f9;
              color: #333333;
              line-height: 1.6;
          }

          .container {
              max-width: 640px;
              margin: 40px auto;
              background: #ffffff;
              border-radius: 12px;
              box-shadow: 0 5px 20px rgba(21, 46, 58, 0.12);
              overflow: hidden;
          }

          .header {
              background-color: #152E3A;
              color: white;
              padding: 30px 20px;
              text-align: center;
              font-size: 24px;
              font-weight: 600;
              border-bottom: 5px solid #2a5769;
          }

          .content {
              padding: 35px 30px;
              color: #444;
              line-height: 1.8;
          }

          .salutation {
              font-size: 18px;
              font-weight: 500;
              color: #152E3A;
              margin-bottom: 18px;
          }

          .message {
              font-size: 16px;
              margin-bottom: 18px;
          }

          .clinical-box {
              margin: 20px 0;
              padding: 16px;
              background-color: rgba(21, 46, 58, 0.05);
              border-left: 4px solid #152E3A;
              border-radius: 4px;
          }

          .clinical-row {
              margin: 8px 0;
              font-size: 15px;
          }

          .clinical-label {
              font-weight: 600;
              color: #152E3A;
          }

          .cta {
              margin-top: 24px;
              font-size: 15px;
          }

          .footer {
              background-color: #f0f3f5;
              padding: 20px;
              text-align: center;
              color: #555;
              font-size: 13px;
              border-top: 1px solid #e1e5e8;
          }

          .separator {
              height: 1px;
              background-color: #e1e5e8;
              margin: 15px 0;
          }

          .copyright {
              font-size: 12px;
              color: #777;
          }

          @media only screen and (max-width: 620px) {
              .container {
                  width: 100%;
                  margin: 20px auto;
                  border-radius: 0;
              }

              .content {
                  padding: 25px 20px;
              }
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">Alerta clinica prioritaria</div>
          <div class="content">
              <div class="salutation">Hola {psychologistName},</div>

              <div class="message">
                  Se detecto un resultado con riesgo alto/critico de burnout y se recomienda intervencion temprana.
              </div>

              <div class="clinical-box">
                  <div class="clinical-row"><span class="clinical-label">Docente:</span> {teacherName}</div>
                  <div class="clinical-row"><span class="clinical-label">Diagnostico:</span> {diagnosis}</div>
                  <div class="clinical-row"><span class="clinical-label">Espacio sugerido:</span> {recommendedSpace}</div>
              </div>

              <div class="cta">
                  Ingrese a CIELP para revisar la alerta en plataforma, priorizar contacto y definir plan de acompanamiento.
              </div>
          </div>
          <div class="footer">
              <div>CIELP - Cuidando a quienes ensenan. Herramientas digitales para prevenir el agotamiento profesional.</div>
              <div class="separator"></div>
              <div class="copyright">&copy; ${new Date().getFullYear()} CIELP | https://cielp.online | Desarrollado por ALBO DEV</div>
          </div>
      </div>
  </body>
  </html>
`;
