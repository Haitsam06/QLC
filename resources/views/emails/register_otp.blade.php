<!DOCTYPE html>
<html>
<head>
    <title>Kode OTP Pendaftaran</title>
</head>
<body style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
    <h2>Selamat Datang di Portal QLC!</h2>
    <p>Terima kasih telah mendaftar. Untuk menyelesaikan proses pembuatan akun Wali Murid Anda, silakan masukkan kode OTP berikut:</p>
    
    <h1 style="background: #f4f4f4; padding: 10px; letter-spacing: 5px; display: inline-block; border-radius: 5px; color: #2E8B57;">
        {{ $otp }}
    </h1>
    
    <p>Kode ini hanya berlaku selama 15 menit. Jika Anda tidak merasa mendaftar di sistem kami, silakan abaikan email ini.</p>
</body>
</html>