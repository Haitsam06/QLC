<!DOCTYPE html>
<html>
<head>
    <title>Kode OTP Lupa Password</title>
</head>
<body style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
    <h2>Halo!</h2>
    <p>Kami menerima permintaan untuk mereset password akun Anda.</p>
    <p>Berikut adalah kode OTP Anda:</p>
    
    <h1 style="background: #f4f4f4; padding: 10px; letter-spacing: 5px; display: inline-block; border-radius: 5px; color: #333;">
        {{ $otp }}
    </h1>
    
    <p>Kode ini hanya berlaku selama 15 menit. Jangan berikan kode ini kepada siapa pun.</p>
    <p>Jika Anda tidak merasa meminta reset password, abaikan saja email ini.</p>
</body>
</html>