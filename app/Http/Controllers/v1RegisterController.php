<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\ApiDocsService;
use App\Services\RegistrationService;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class v1RegisterController extends Controller
{
    public function help(ApiDocsService $docsService): JsonResponse
{
    $docsService->addEndpoint([
        'method' => 'POST',
        'path' => '/api/v1/register',
        'description' => 'Create a new user. Registration can only assign the AUTHOR role. Email is sanitized to lowercase; password is trimmed.',
        'required_fields' => [
            'name' => 'string, required',
            'email' => 'string, valid email',
            'password' => 'string, required',
            'affiliation' => 'string, optional',
            'orcid' => '16-digit number, optional',
            'bio' => 'string, optional',
        ],
        'example_request' => [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'secret',
            'affiliation' => 'University X',
            'orcid' => '0000123412341234',
            'bio' => 'Short bio here',
        ],
    ]);

    return response()->json($docsService->toJson());
}


public function register(Request $request, RegistrationService $registration): JsonResponse
{
    $data = $request->validate([
        "name" => ["required", "string", "max:255"],
        "email" => ["required", "email", "unique:users,email"],
        "password" => ["required", "string", "min:8"],
        "affiliation" => ["sometimes", "string", "max:255"],
        "orcid" => ["sometimes", "string", "max:32"],
        "bio" => ["sometimes", "string"],
    ]);

    $result = $registration->register($data);

    return response()->json($result, 201);
}

}
