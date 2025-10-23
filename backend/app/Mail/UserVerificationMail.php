<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class UserVerificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $messageContent;

    /**
     * Create a new message instance.
     */
    public function __construct($messageContent)
    {
        $this->messageContent = $messageContent;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Code de Vérification MiamMiam')
                    ->view('emails.user_code_verification')
                    ->with(['messageContent' => $this->messageContent]);
    }
}