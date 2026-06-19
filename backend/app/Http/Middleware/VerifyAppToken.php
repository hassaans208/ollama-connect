<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class VerifyAppToken
{
    public function handle(Request $request, Closure $next)
    {
        // Use your custom Authentication Logic
        // $token = $request->bearerToken() ?? null;
        // $response = Http::withToken($token)->post(config('app.connect.baseUrl') . '/user/verify', []);
   
        // if ($response->status() !== 200) {
        //     return response()->json([
        //         'success' => false,
        //         'message' => 'Unauthorized. Invalid or expired token.',
        //     ], 403);
        // }

        return $next($request);
    }
}