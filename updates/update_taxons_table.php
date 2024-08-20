<?php namespace Pensoft\PollinatorExplorer\Updates;

use Schema;
use October\Rain\Database\Updates\Migration;

class UpdateTaxonsTable extends Migration
{
    public function up()
    {
        Schema::table('pensoft_pollinatorexplorer_taxons', function($table)
        {
            if (Schema::hasColumn('pensoft_pollinatorexplorer_taxons', 'taxon')) {
                $table->index('taxon');
            }

            if (Schema::hasColumn('pensoft_pollinatorexplorer_taxons', 'year_2')) {
                $table->index('year_2');
            }

            if (Schema::hasColumns('pensoft_pollinatorexplorer_taxons', ['taxon', 'year_2'])) {
                $table->index(['taxon', 'year_2']);
            }

            if (Schema::hasColumns('pensoft_pollinatorexplorer_taxons', ['latitude', 'longitude'])) {
                $table->index(['latitude', 'longitude']);
            }
        });
    }

    public function down()
    {
        Schema::table('pensoft_pollinatorexplorer_taxons', function($table)
        {
            if (Schema::hasColumn('pensoft_pollinatorexplorer_taxons', 'taxon')) {
                $table->dropIndex(['taxon']);
            }

            if (Schema::hasColumn('pensoft_pollinatorexplorer_taxons', 'year_2')) {
                $table->dropIndex(['year_2']);
            }

            if (Schema::hasColumns('pensoft_pollinatorexplorer_taxons', ['taxon', 'year_2'])) {
                $table->dropIndex(['taxon', 'year_2']);
            }

            if (Schema::hasColumns('pensoft_pollinatorexplorer_taxons', ['latitude', 'longitude'])) {
                $table->dropIndex(['latitude', 'longitude']);
            }
        });
    }
}
