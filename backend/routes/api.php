<?php

use App\Http\Controllers\Api\OllamaController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('verify.app.token')->group(function () {
    Route::get('models',              [OllamaController::class, 'models']);
    Route::post('chat',               [OllamaController::class, 'chat']);
    Route::get('sessions',            [OllamaController::class, 'sessions']);
    Route::get('sessions/{id}',       [OllamaController::class, 'sessionDetail']);
    Route::delete('sessions/{id}',    [OllamaController::class, 'deleteSession']);
});
