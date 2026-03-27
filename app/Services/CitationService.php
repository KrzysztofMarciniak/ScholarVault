<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Citation;

class CitationService
{
    /**
     * Get all citations with pagination.
     */
    public function listCitations(array $filters = []): array
    {
        $query = Citation::query();

        if (!empty($filters["article_id"])) {
            $query->where("article_id", $filters["article_id"]);
        }

        if (!empty($filters["search"])) {
            $query->where(function ($q) use ($filters): void {
                $q->where("title", "like", "%" . $filters["search"] . "%")
                    ->orWhere("authors", "like", "%" . $filters["search"] . "%");
            });
        }

        if (!empty($filters["availability_status"])) {
            $query->where("availability_status", $filters["availability_status"]);
        }
        $sortField = $filters["sort_by"] ?? "created_at";
        $sortDirection = $filters["sort_direction"] ?? "desc";
        $query->orderBy($sortField, $sortDirection);
        $perPage = (int)($filters["per_page"] ?? 15);
        $perPage = $perPage <= 0 ? 15 : min($perPage, 25);
        $page = (int)($filters["page"] ?? 1);
        $page = max($page, 1);
        $paginator = $query->paginate($perPage, ["*"], "page", $page);

        return [
            "current_page" => $paginator->currentPage(),
            "per_page" => $paginator->perPage(),
            "total" => $paginator->total(),
            "last_page" => $paginator->lastPage(),
            "data" => $paginator->getCollection()->all(),
        ];
    }

    /**
     * Get a single citation by ID.
     */
    public function getCitation(int $id): ?Citation
    {
        return Citation::find($id);
    }

    /**
     * Create a new citation.
     */
    public function createCitation(array $data): Citation
    {
        return Citation::create($data);
    }

    /**
     * Update a citation.
     */
    public function updateCitation(int $id, array $data): ?Citation
    {
        $citation = Citation::find($id);

        if (!$citation) {
            return null;
        }
        $citation->update($data);

        return $citation;
    }

    /**
     * Delete a citation.
     */
    public function deleteCitation(int $id): bool
    {
        $citation = Citation::find($id);

        if (!$citation) {
            return false;
        }

        return (bool)$citation->delete();
    }
}
