<?php

declare(strict_types=1);

namespace App\Services\ApiDocsService;

class EndpointDTO
{
    public function __construct(
        public string $method,
        public string $path,
        public string $description,
        public array $roles = [],
        public array $requestBody = [],
        public array $queryParams = [],
        public int $responseCode = 200,
        public mixed $responseData = null,
        public bool $available = true,
    ) {}

    public function toArray(): array
    {
        return [
            "method" => $this->method,
            "path" => $this->path,
            "description" => $this->description,
            "roles" => $this->roles,
            "request_body" => $this->requestBody,
            "query_params" => $this->queryParams,
            "response_code" => $this->responseCode,
            "response_data" => $this->responseData,
            "available" => $this->available,
        ];
    }
}
