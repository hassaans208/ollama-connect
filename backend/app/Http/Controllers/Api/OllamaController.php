<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class OllamaController extends Controller
{
    private function baseUrl(): string
    {
        return config('app.ollama.baseUrl');
    }

    public function models()
    {
        $response = Http::get($this->baseUrl() . '/api/tags');

        if (!$response->ok()) {
            return response()->json(['success' => false, 'message' => 'Failed to fetch models.'], 502);
        }

        $models = collect($response->json('models', []))->map(fn($m) => [
            'id'          => $m['name'],
            'name'        => $m['name'],
            'description' => 'Local Ollama model — ' . ($m['details']['parameter_size'] ?? 'unknown size'),
            'enabled'     => true,
        ])->values();

        return response()->json([
            'success' => true,
            'message' => 'Models fetched successfully.',
            'data'    => $models,
        ]);
    }

    public function chat(Request $request)
    {
        $request->validate([
            'model'     => 'required|string',
            'sessionId' => 'nullable|string',
            'message'   => 'required|string',
            'files'     => 'nullable|array',
        ]);

        $sessionId = $request->sessionId ?? (string) \Str::uuid();
        $message   = $request->message;

        // Append file context to message if files present
        if (!empty($request->files)) {
            $fileNames = collect($request->file('files', []))->map->getClientOriginalName()->implode(', ');
            $message  .= "\n\n[Attached files: {$fileNames}]";
        }

        $response = Http::timeout(120)->post($this->baseUrl() . '/api/generate', [
            'model'  => $request->model,
            'prompt' => $message,
            'stream' => false,
        ]);

        if (!$response->ok()) {
            return response()->json(['success' => false, 'message' => 'Ollama request failed.'], 502);
        }

        $reply       = $response->json('response', '');
        $tokensUsed  = $response->json('eval_count', 0) + $response->json('prompt_eval_count', 0);

        return response()->json([
            'success'     => true,
            'sessionId'   => $sessionId,
            'reply'       => $reply,
            'tokens_used' => $tokensUsed,
        ]);
    }

    public function sessions()
    {
        // Sessions are managed client-side via localStorage per the frontend spec
        // This endpoint is a stub for future DB-backed sessions
        return response()->json([
            'success' => true,
            'message' => 'Sessions fetched.',
            'data'    => [],
        ]);
    }

    public function sessionDetail($id)
    {
        return response()->json([
            'success' => true,
            'message' => 'Session fetched.',
            'data'    => ['id' => $id, 'messages' => []],
        ]);
    }

    public function deleteSession($id)
    {
        return response()->json([
            'success' => true,
            'message' => 'Session deleted.',
        ]);
    }
}