<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    // return view('welcome');

    return response()->json(['success' => true, 'message' => 'up']);
});
