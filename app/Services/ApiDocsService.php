<?php

declare(strict_types=1);

namespace App\Services;

use InvalidArgumentException;

class ApiDocsService
{
    protected array $endpoints = [];
    protected array $requiredFields = [
        "method",
        "path",
        "description",
        "roles",
        "request_body",
        "query_params",
        "response_code",
        "available",
        "response_data",
    ];

    /**
     * Add a single endpoint definition.
     */
    public function addEndpoint(array $definition): void
    {
        $missing = array_diff($this->requiredFields, array_keys($definition));

        if (!empty($missing)) {
            throw new InvalidArgumentException(
                "Endpoint definition missing required fields: " . implode(", ", $missing),
            );
        }

        $this->endpoints[] = $definition;
    }

    /**
     * Add multiple endpoints at once.
     */
    public function addEndpoints(array $definitions): void
    {
        foreach ($definitions as $def) {
            $this->addEndpoint($def);
        }
    }

    /**
     * Get all endpoints.
     */
    public function getEndpoints(): array
    {
        return $this->endpoints;
    }

    /**
     * Export endpoints as JSON response.
     */
    public function toJson(): string
    {
        return json_encode([
            "endpoints" => $this->endpoints,
        ], JSON_PRETTY_PRINT);
    }
}
