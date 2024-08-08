<?php namespace Pensoft\PollinatorExplorer\Controllers;

use Backend\Classes\Controller;
use Pensoft\PollinatorExplorer\Models\Taxon;
use Pensoft\PollinatorExplorer\Models\Classification;
use Illuminate\Http\Request;

/**
 * Api Controller
 */
class ApiController extends Controller
{
    /**
     * Controller for { explorer } endpoint
     * @param \Illuminate\Http\Request
     * @return \Illuminate\Http\JsonResponse
     */
    public function explore(Request $request)
    {
        $taxonQuery = $request->input('q');
        $yearRange = $request->input('year_range');
        $nullYears = $request->input('null_years', false);

        if (!$taxonQuery) {
            return response()->json(['error' => 'Query parameter "q" is required'], 400)
                             ->header('Access-Control-Allow-Origin', '*')
                             ->header('Access-Control-Allow-Headers', '*')
                             ->header('Access-Control-Allow-Methods', 'GET, OPTIONS');
        }

        $taxonList = array_map('trim', explode(',', $taxonQuery));

        if (count($taxonList) > 4) {
            return response()->json(['error' => 'Maximum of 4 taxons are allowed'], 400)
                             ->header('Access-Control-Allow-Origin', '*')
                             ->header('Access-Control-Allow-Headers', '*')
                             ->header('Access-Control-Allow-Methods', 'GET, OPTIONS');
        }

        $query = Taxon::query()->whereIn('taxon', $taxonList);

        $taxonYearsQuery = $query->get(['year_2 as year']);

        // $taxonYearsQuery = Classification::query()->whereIn('taxon', $taxonList)->get(['year_2 as year']);

        if ($yearRange) {
            $years = explode(',', $yearRange);

            $query->where(function($q) use ($years, $nullYears) {
                if (count($years) == 2) {
                    $q->whereBetween('year_2', [$years[0], $years[1]]);
                } else {
                    $q->where('year_2', '>=', $years[0]);
                }

                if ($nullYears) {
                    $q->orWhereNull('year_2');
                }
            });
        }

        // Fetch results
        $locations = $query->get(['taxon as title', 'latitude as lat', 'longitude as lng', 'year_2 as year']);

        // Aggregate meta data
        $count = $locations->count();
        $titlesAggregated = $locations->pluck('title')->unique()->values()->toArray();
        $latAverage = $locations->avg('lat');
        $longAverage = $locations->avg('lng');
        $yearMin = $locations->whereNotNull('year')->min('year');
        $yearMax = $locations->whereNotNull('year')->max('year');

        $uniqueYears = $taxonYearsQuery->pluck('year')->unique()->filter()->values()->toArray();
        
        sort($uniqueYears);

        $yearMetaMin = count($uniqueYears) > 0 ? min($uniqueYears) : null;
        $yearMetaMax = count($uniqueYears) > 0 ? max($uniqueYears) : null;

        $meta = [
            'count' => $count,
            'titles_aggregated' => $titlesAggregated,
            'lat_average' => $latAverage,
            'lng_average' => $longAverage,
            'year_min' => $yearMin,
            'year_max' => $yearMax,
            'taxons_years' => $uniqueYears,
            'first_taxon_year' => $yearMetaMin,
            'last_taxon_year' => $yearMetaMax
        ];

        $response = [
            'meta' => $meta,
            'records' => $locations
        ];

        return response()->json($response)->header('Access-Control-Allow-Origin', '*')
                                          ->header('Access-Control-Allow-Headers', '*')
                                          ->header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    }

    /**
     * Controller for { search } endpoint
     * @param \Illuminate\Http\Request
     * @return \Illuminate\Http\JsonResponse
     */
    public function search(Request $request)
    {
        $countries = $request->input('countries', []);
        $families = $request->input('families', []);
        $tribes = $request->input('tribes', []);
        $genera = $request->input('genera', []);
        $searchTerm = $request->input('search', '');
    
        // Use the distinct classifications table to filter the search
        $query = Classification::query();
    
        if (!empty($countries)) {
            $query->whereIn('country', $countries);
        }
    
        if (!empty($families)) {
            $query->whereIn('family', $families);
        }
    
        if (!empty($tribes)) {
            $query->whereIn('tribe', $tribes);
        }
    
        if (!empty($genera)) {
            $query->whereIn('genus', $genera);
        }
    
        if (!empty($searchTerm)) {
            $query->where(function ($query) use ($searchTerm) {
                $query->where('taxon', 'like', "%{$searchTerm}%")
                      ->orWhere('country', 'like', "%{$searchTerm}%")
                      ->orWhere('family', 'like', "%{$searchTerm}%")
                      ->orWhere('tribe', 'like', "%{$searchTerm}%")
                      ->orWhere('genus', 'like', "%{$searchTerm}%");
            });
        }
    
        $taxons = $query->pluck('taxon')->toArray();
    
        return response()->json([
            'results' => count($taxons),
            'taxons' => $taxons
        ])->header('Access-Control-Allow-Origin', '*')
          ->header('Access-Control-Allow-Headers', '*')
          ->header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    }

    /**
     * Controller for OPTIONS
     * @param \Illuminate\Http\Request
     * @return \Illuminate\Http\JsonResponse
     */
    public function options(Request $request)
    {
        return response()->json(null, 200)
                         ->header('Access-Control-Allow-Origin', '*')
                         ->header('Access-Control-Allow-Headers', '*')
                         ->header('Access-Control-Allow-Methods', 'GET, OPTIONS');
                         
    }
}
