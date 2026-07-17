<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Vite;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $isProduction = config('app.env') === 'production';

        if ($isProduction) {
            $nonce = base64_encode(random_bytes(16));
            view()->share('cspNonce', $nonce);
            Vite::useCspNonce($nonce);
        } else {
            view()->share('cspNonce', '');
        }

        $response = $next($request);

        // Header keamanan dasar — aktif di semua environment
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

        // CSP hanya di production — di development Vite HMR butuh akses bebas
        if ($isProduction) {
            $response->headers->set(
                'Content-Security-Policy',
                "default-src 'self' https:; " .
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; " .
                "style-src 'self' 'unsafe-inline' https:; " .
                "img-src 'self' data: blob: https:; " .
                "font-src 'self' data: https:; " .
                "connect-src 'self' https:; " .
                "object-src 'none'; " .
                "base-uri 'self';"
            );
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        return $response;
    }
}
