<?php namespace Pensoft\PollinatorExplorer\Updates;

use Schema;
use October\Rain\Database\Schema\Blueprint;
use October\Rain\Database\Updates\Migration;

/**
 * CreatePopulationsTable Migration
 */
class CreateTaxonsTable extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('pensoft_pollinatorexplorer_taxons')) 
        {
            Schema::create('pensoft_pollinatorexplorer_taxons', function (Blueprint $table) {
                $table->engine = 'InnoDB';
                $table->increments('id');
                $table->text('project')->nullable();
                $table->text('pollinator_taxa')->nullable();
                $table->text('uuid')->nullable();
                $table->text('uuid_original')->nullable();
                $table->text('validation_taxonomist')->nullable();
                $table->text('privacy')->nullable();
                $table->text('taxon_original')->nullable();
                $table->text('authority_original')->nullable();
                $table->text('genus_original')->nullable();
                $table->text('subgenus_original')->nullable();
                $table->text('species_original')->nullable();
                $table->text('subspecies_original')->nullable();
                $table->text('family')->nullable();
                $table->text('tribe')->nullable();
                $table->text('genus')->nullable();
                $table->text('subgenus')->nullable();
                $table->text('species')->nullable();
                $table->text('subspecies')->nullable();
                $table->text('taxon')->nullable();
                $table->text('number_of_specimens_2')->nullable();
                $table->text('number_of_specimens_1')->nullable();
                $table->text('sex')->nullable();
                $table->text('year_determination')->nullable();
                $table->text('data_provider')->nullable();
                $table->text('data_source')->nullable();
                $table->text('collection')->nullable();
                $table->text('database_reference_code')->nullable();
                $table->text('literature_reference')->nullable();
                $table->text('literature_doi')->nullable();
                $table->text('species_memo')->nullable();
                $table->text('date_original')->nullable();
                $table->integer('year_2')->nullable();
                $table->integer('month_2')->nullable();
                $table->integer('day_2')->nullable();
                $table->integer('year_1')->nullable();
                $table->integer('month_1')->nullable();
                $table->integer('day_1')->nullable();
                $table->text('plant_family')->nullable();
                $table->text('plant_genus')->nullable();
                $table->text('plant_species')->nullable();
                $table->text('plant_taxa')->nullable();
                $table->text('collecting_method')->nullable();
                $table->text('condition_memo')->nullable();
                $table->text('country')->nullable();
                $table->text('iso_2')->nullable();
                $table->text('iso_3')->nullable();
                $table->float('latitude')->nullable();
                $table->float('longitude')->nullable();
                $table->text('precision_2')->nullable();
                $table->text('precision_1')->nullable();
                $table->text('coordinates_original')->nullable();
                $table->text('coordinates_provided')->nullable();
                $table->text('coordinates_datum')->nullable();
                $table->text('coordinates_memo')->nullable();
                $table->text('locality')->nullable();
                $table->text('region')->nullable();
                $table->text('department')->nullable();
                $table->text('altitude')->nullable();
                $table->text('station_memo')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down()
    {
        if (Schema::hasTable('pensoft_pollinatorexplorer_taxons')) 
        {
            Schema::dropIfExists('pensoft_pollinatorexplorer_taxons');
        }
    }
}
