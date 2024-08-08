<?php namespace Pensoft\PollinatorExplorer;

use Backend;
use System\Classes\PluginBase;

/**
 * PollinatorExplorer Plugin Information File
 */
class Plugin extends PluginBase
{
    /**
     * Returns information about this plugin.
     *
     * @return array
     */
    public function pluginDetails()
    {
        return [
            'name'        => 'PollinatorExplorer',
            'description' => 'No description provided yet...',
            'author'      => 'Pensoft',
            'icon'        => 'icon-map-pin'
        ];
    }

    /**
     * Register method, called when the plugin is first registered.
     *
     * @return void
     */
    public function register()
    {
        $this->registerConsoleCommand('pollinatorexplorer.extractcategories', 'Pensoft\PollinatorExplorer\Console\ExtractCategories');
    }

    /**
     * Boot method, called right before the request route.
     *
     * @return void
     */
    public function boot()
    {
        include __DIR__.'/routes.php';
    }

    /**
     * Registers any front-end components implemented in this plugin.
     *
     * @return array
     */
    public function registerComponents()
    {
        return [
            'Pensoft\PollinatorExplorer\Components\PollinatorMap' => 'pollinatorMap',
        ];
    }

    /**
     * Registers any back-end permissions used by this plugin.
     *
     * @return array
     */
    public function registerPermissions()
    {
        return []; // Remove this line to activate

        return [
            'pensoft.pollinatorexplorer.some_permission' => [
                'tab' => 'PollinatorExplorer',
                'label' => 'Some permission'
            ],
        ];
    }

    /**
     * Registers back-end navigation items for this plugin.
     *
     * @return array
     */
    public function registerNavigation()
    {
        return []; // Remove this line to activate

        return [
            'pollinatorexplorer' => [
                'label'       => 'PollinatorExplorer',
                'url'         => Backend::url('pensoft/pollinatorexplorer/mycontroller'),
                'icon'        => 'icon-map-pin',
                'permissions' => ['pensoft.pollinatorexplorer.*'],
                'order'       => 500,
            ],
        ];
    }
}
