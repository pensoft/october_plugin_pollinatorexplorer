<?php namespace Pensoft\PollinatorExplorer\Updates;

use Schema;
use October\Rain\Database\Schema\Blueprint;
use October\Rain\Database\Updates\Migration;

/**
 * CreatePopulationsTable Migration
 */
class CreateClassificationsTable extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('pensoft_pollinatorexplorer_classifications')) 
        {
            Schema::create('pensoft_pollinatorexplorer_classifications', function (Blueprint $table) {
                $table->engine = 'InnoDB';
                $table->increments('id');
                $table->text('taxon')->nullable();
                $table->text('country')->nullable();
                $table->text('family')->nullable();
                $table->text('tribe')->nullable();
                $table->text('genus')->nullable();
                $table->integer('year_2')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down()
    {
        if (Schema::hasTable('pensoft_pollinatorexplorer_classifications')) 
        {
            Schema::dropIfExists('pensoft_pollinatorexplorer_classifications');
        }
    }
}
