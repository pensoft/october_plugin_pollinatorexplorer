<?php namespace Pensoft\PollinatorExplorer\Models;

use Model;

/**
 * Classification Model
 */
class Classification extends Model
{
    use \October\Rain\Database\Traits\Validation;

    /**
     * @var string table associated with the model
     */
    public $table = 'pensoft_pollinatorexplorer_classifications';

    /**
     * @var array guarded attributes aren't mass assignable
     */
    protected $guarded = ['*'];

    /**
     * @var array fillable attributes are mass assignable
     */
    protected $fillable = [];

    /**
     * @var array rules for validation
     */
    public $rules = [];

    /**
     * @var array Attributes to be cast to native types
     */
    protected $casts = [];

    /**
     * @var array jsonable attribute names that are json encoded and decoded from the database
     */
    protected $jsonable = [];

    /**
     * @var array appends attributes to the API representation of the model (ex. toArray())
     */
    protected $appends = [];

    /**
     * @var array hidden attributes removed from the API representation of the model (ex. toArray())
     */
    protected $hidden = [];

    /**
     * @var array dates attributes that should be mutated to dates
     */
    protected $dates = [
        'created_at',
        'updated_at'
    ];

    /**
     * @var array hasOne and other relations
     */
    public $hasOne = [];
    public $hasMany = [];
    public $belongsTo = [];
    public $belongsToMany = [];
    public $morphTo = [];
    public $morphOne = [];
    public $morphMany = [];
    public $attachOne = [];
    public $attachMany = [];

    public function getTaxonOptions()
    {
        return Taxon::lists('taxon', 'id');
    }

    public static function getCountryOptions()
    {
        return self::query()
            ->select('country')
            ->distinct()
            ->orderBy('country')
            ->pluck('country')
            ->toArray();
    }

    public static function getGenusOptions()
    {
        return self::query()
            ->select('genus')
            ->distinct()
            ->orderBy('genus')
            ->pluck('genus')
            ->toArray();
    }

    public static function getFamilyOptions()
    {
        return self::query()
            ->select('family')
            ->distinct()
            ->orderBy('family')
            ->pluck('family')
            ->toArray();
    }

    public static function GetTribeOptions()
    {
        return self::query()
            ->select('tribe')
            ->distinct()
            ->orderBy('tribe')
            ->pluck('tribe')
            ->toArray();
    }
}
