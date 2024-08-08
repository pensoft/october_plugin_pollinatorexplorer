<?php
Route::group(['prefix' => 'api'], function () {
    Route::get('explorer', 'Pensoft\PollinatorExplorer\Controllers\ApiController@explore');
    Route::options('explorer', 'Pensoft\PollinatorExplorer\Controllers\ApiController@options');

    Route::get('search', 'Pensoft\PollinatorExplorer\Controllers\ApiController@search');
    Route::options('search', 'Pensoft\PollinatorExplorer\Controllers\ApiController@options');
    
});
