<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/../assets/vendor/php-email-form/PHPMailer.php';
require __DIR__ . '/../assets/vendor/src/Exception.php';
require __DIR__ . '/../assets/vendor/src/SMTP.php';
;

if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $name = htmlspecialchars($_POST['name']);
  $email = htmlspecialchars($_POST['email']);
  $subject = htmlspecialchars($_POST['subject']);
  $message = htmlspecialchars($_POST['message']);

  $mail = new PHPMailer(true);

  try {
    // Configuração do servidor Gmail
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'contato.rodrigocosta.dev@gmail.com'; // seu Gmail
    $mail->Password   = 'SUA_SENHA_DE_APP_AQUI'; // senha de app do Gmail
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    // Remetente e destinatário
    $mail->setFrom('contato.rodrigocosta.dev@gmail.com', 'StoreConnect Site');
    $mail->addAddress('contato.rodrigocosta.dev@gmail.com', 'Rodrigo Costa');
    $mail->addReplyTo($email, $name); // permite responder direto ao remetente

    // Conteúdo do e-mail
    $mail->isHTML(true);
    $mail->Subject = "Nova mensagem de contato: $subject";
    $mail->Body    = "
      <h2>Nova mensagem do site Store&Connect</h2>
      <p><strong>Nome:</strong> $name</p>
      <p><strong>E-mail:</strong> $email</p>
      <p><strong>Assunto:</strong> $subject</p>
      <p><strong>Mensagem:</strong><br>$message</p>
      <hr>
      <p style='font-size:12px;color:#666;'>Enviado automaticamente via formulário do site Store&Connect.</p>
    ";

    $mail->AltBody = "Nova mensagem de $name <$email>\n\nAssunto: $subject\n\n$message";

    // Envia o e-mail
    $mail->send();
    echo 'OK';
  } catch (Exception $e) {
    echo "Erro ao enviar: {$mail->ErrorInfo}";
  }
} else {
  echo "Método inválido.";
}
