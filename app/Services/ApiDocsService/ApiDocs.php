<?php

declare(strict_types=1);

namespace App\Services\ApiDocsService;

class ApiDocs
{
    /** @var array<EndpointDTO> */
    private array $endpoints = [];

    public function addEndpoint(EndpointDTO $endpoint): void
    {
        $this->endpoints[] = $endpoint;
    }

    public function getEndpoints(): array
    {
        return array_map(fn(EndpointDTO $e) => $e->toArray(), $this->endpoints);
    }
}
