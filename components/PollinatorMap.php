<?php namespace Pensoft\PollinatorExplorer\Components;

use Cms\Classes\ComponentBase;
use Pensoft\PollinatorExplorer\Models\Classification;

class PollinatorMap extends ComponentBase
{
    protected $country_options;
    protected $genus_options;
    protected $family_options;
    protected $tribe_options;

    public function onRun()
    {
        $this->addJs('assets/js/map.js');

        $this->addJs('assets/js/leaflet.js');
        $this->addJs('assets/js/leaflet.markercluster.js');
        $this->addJs('assets/js/Leaflet.DonutCluster.js');
        $this->addJs('assets/js/maptiler-sdk.umd.js');        
        $this->addJs('assets/js/leaflet-maptilersdk.js');

        $this->addCss('assets/css/leaflet.css');
        $this->addCss('assets/css/MarkerCluster.css');
        $this->addCss('assets/css/Leaflet.DonutCluster.css');
        $this->addCss('assets/css/maptiler-sdk.css');
        $this->addCss('assets/css/forms.css');
        
        $this->country_options = Classification::getCountryOptions();
        $this->genus_options = Classification::getGenusOptions();
        $this->family_options = Classification::getFamilyOptions();
        $this->tribe_options = Classification::getTribeOptions();

        $this->page['country_options'] = $this->country_options;
        $this->page['genus_options'] = $this->genus_options;
        $this->page['family_options'] = $this->family_options;
        $this->page['tribe_options'] = $this->tribe_options;
    }

    public function componentDetails()
    {
        return [
            'name' => 'PollinatorMap Component',
            'description' => 'No description provided yet...'
        ];
    }

    public function defineProperties()
    {
        return [];
    }
}
