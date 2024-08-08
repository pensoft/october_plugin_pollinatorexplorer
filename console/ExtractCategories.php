<?php namespace Pensoft\PollinatorExplorer\Console;

use Illuminate\Console\Command;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputArgument;
use DB;

/**
 * ExtractCategories Command
 */
class ExtractCategories extends Command
{
    /**
     * @var string name is the console command name
     */
    protected $name = 'pollinatorexplorer:extractcategories';
    
    /**
     * @var string description is the console command description
     */
    protected $description = 'No description provided yet...';

    /**
     * handle executes the console command
     */
    public function handle()

    {
        DB::table('pensoft_pollinatorexplorer_classifications')->truncate();

        $taxons = DB::table('pensoft_pollinatorexplorer_taxons')->select('taxon', 'country', 'family', 'tribe', 'genus', 'year_2')->distinct('taxon')->get();

        foreach ($taxons as $taxon) {
            DB::table('pensoft_pollinatorexplorer_classifications')->insert([
                'taxon' => $taxon->taxon,
                'country' => $taxon->country,
                'family' => $taxon->family,
                'tribe' => $taxon->tribe,
                'genus' => $taxon->genus,
                'year_2' => $taxon->year_2
            ]);
        }

        $this->info('Categories extracted successfully!');
    }

    /**
     * getArguments get the console command arguments
     */
    protected function getArguments()
    {
        return [];
    }

    /**
     * getOptions get the console command options
     */
    protected function getOptions()
    {
        return [];
    }
}
