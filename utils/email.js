import nodemailer from "nodemailer";

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const transporter = createTransporter();

export async function sendPaymentSuccessEmail({
  to,
  name,
  bookingId,
  amount,
  details,
}) {
  const mailOptions = {
    from: `"Royal Palms Hotel" <${process.env.EMAIL_USER}>`,
    to,
    subject: "🎉 Payment Successful - Your Booking is Confirmed!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333;">
        <h2 style="color: #2c3e50;">Hello ${name},</h2>
        <p>We’re excited to let you know your payment was successful and your booking is confirmed!</p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #27ae60;">Booking Summary</h3>
          <p><strong>Booking ID:</strong> ${bookingId}</p>
          <p><strong>Amount Paid:</strong> Rs ${amount}</p>
          <ul style="list-style-type: none; padding: 0;">
            <li><strong>Room:</strong> ${details.room}</li>
            <li><strong>Check-in:</strong> ${details.checkInDate}</li>
            <li><strong>Check-out:</strong> ${details.checkOutDate}</li>
            <li><strong>Guests:</strong> ${details.guests}</li>
          </ul>
        </div>
        <p>If you have any questions, simply reply to this email or contact our support team.</p>
        <p>Thanks for choosing <strong>Your Hotel</strong>. We can’t wait to host you!</p>
        <br>
        <p>Warm regards,</p>
        <p><strong>Royal Palms Hotel Team</strong></p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}
