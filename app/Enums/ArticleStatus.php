<?php

declare(strict_types=1);

namespace App\Enums;

enum ArticleStatus: int
{
    case DRAFT = 0;               // Private draft, editable by authors
    case SUBMITTED = 1;           // Waiting for admin assignment
    case UNDER_REVIEW = 2;        // Reviewer in progress
    case REVISION_REQUIRED = 3;   // Reviewer requested revisions
    case ACCEPTED = 4;            // Accepted, waiting for author to publish
    case REJECTED = 5;            // Rejected, no further submission
    case PUBLISHED = 6;           // Published publicly
}
