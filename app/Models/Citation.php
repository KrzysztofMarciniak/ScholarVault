namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Citation extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'authors', 'doi', 'url', 'published_at'];

    /**
     * The articles that reference this citation.
     */
    public function articles(): BelongsToMany
    {
        return $this->belongsToMany(Article::class, 'article_citation_pivot')
                    ->withTimestamps();
    }
}
