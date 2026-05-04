<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VerifyRegistrationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $otp; // Deklarasikan variabel OTP

    /**
     * Create a new message instance.
     */
    public function __construct($otp)
    {
        $this->otp = $otp; // Masukkan nilai OTP
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Kode Verifikasi Pendaftaran Akun QLC',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.register_otp', // Kita buat file view-nya di langkah 2
        );
    }

    public function attachments(): array
    {
        return [];
    }
}