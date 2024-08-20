$(document).ready(function () {
    if (typeof maptilersdk !== 'undefined') {
        maptilersdk.config.caching = false;
    } else {
        console.error('MapTiler SDK is not loaded.');
    }

    const map = L.map('map', { maxZoom: 13 });
    
    const colors = {
        "blue": { "color": "#2A81CB" },
        "gold": { "color": "#FFD326" },
        "red": { "color": "#CB2B3E" },
        "green": { "color": "#2AAD27" },
        "orange": { "color": "#CB8427" },
        "yellow": { "color": "#CAC428" },
        "violet": { "color": "#9C2BCB" },
        "grey": { "color": "#7B7B7B" }
    };

    const selectLimit = 4;
    const key = 'EKUb4Bm0PKKlbqC26vF8';
    const yearTextElement = $('#year_text');
    const yearControl = $('.year-control');
    const loader = $('#loader');
    
    $('#results').hide();
    $('.tooltip').hide();
    
    L.maptilerLayer({ apiKey: key, style: "landscape" }).addTo(map);
    map.setView([0, 0], 2);

    let markers = null;

    /* Logic for handling the dynamic color for the taxon legend */
    const selectedColors = [];

    function moveTaxonToSelected(taxon, container) {
        // If the container already has 4 taxons, alert the user and do not add more
        if (container.children().length >= selectLimit) {
            alert('You can select a maximum of 4 taxons.');
            return;
        }
    
        if (container.find(`.selected-taxon[data-taxon="${taxon}"]`).length > 0) {
            return;
        }
    
        const nextColor = getNextAvailableColor();
    
        selectedColors.push(nextColor);
    
        const taxonElement = `
            <div class="selected-taxon" data-taxon="${taxon}">
                <span class="color-dot" style="background-color: ${colors[nextColor].color};"></span>
                ${taxon} <a class="remove-taxon">×</a>
            </div>`;
        container.append(taxonElement);
        updateUrlParams('q', taxon, 'add');
    }
    
    function removeTaxonFromSelected(taxon) {
        const taxonElement = $(`#selected-taxons .selected-taxon[data-taxon="${taxon}"]`);
        if (taxonElement.length > 0) {
            const colorToRemove = getAssignedColor(taxonElement);
            taxonElement.remove();
    
            selectedColors.splice(selectedColors.indexOf(colorToRemove), 1);
    
            reassignTaxonColors();
            updateUrlParams('q', taxon, 'remove');
        }
    }
    
    function getAssignedColor(taxonElement) {
        return Object.keys(colors).find(color => colors[color].color === taxonElement.find('.color-dot').css('background-color'));
    }
    
    function getNextAvailableColor() {
        const availableColors = Object.keys(colors).filter(color => !selectedColors.includes(color));
        return availableColors[0];
    }
    
    function reassignTaxonColors() {
        const taxonElements = $('#selected-taxons .selected-taxon');
        selectedColors.length = 0;
    
        taxonElements.each((index, element) => {
            const taxonElement = $(element);
    
            const nextColor = getNextAvailableColor();
            selectedColors.push(nextColor);
    
            taxonElement.find('.color-dot').css('background-color', colors[nextColor].color);
        });
    }
    

    function showLoader() {
        loader.show();
    }

    function hideLoader() {
        loader.hide();
    }

    function fetchData(url) {
        if (url.includes('explorer')) {
            loader.show();
        }
    
        return fetch(url, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            if (url.includes('explorer')) {
                loader.hide();
            }
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .catch(error => {
            if (url.includes('explorer')) {
                loader.hide();
            }
            console.error('Fetch error:', error);
        });
    }
    

    function handleResponse(data) {
        if (markers) {
            map.removeLayer(markers);
        }

        const meta = data.meta;
        const records = data.records;

        yearTextElement.text(`${meta.year_min} - ${meta.year_max}`);

        $('.ui.range.slider').slider({
            restrictedLabels: [...meta.taxons_years.sort()].filter(value => value % 10 === 0) || [],
            min: meta.first_taxon_year,
            max: meta.last_taxon_year,
            start: meta.year_min,
            end: meta.year_max,
            step: 1,
            autoAdjustLabels: true,
            onChange: (index, start_value, end_value) => {
                const url = new URL(location.href);
                let range = (start_value === end_value) ? start_value : `${start_value},${end_value}`;
                url.searchParams.set("year_range", range);
                pushUrl(url);
            },
            onMove: (index, start_value, end_value) => {
                yearTextElement.text((start_value === end_value) ? start_value : `${start_value} - ${end_value}`);
            },
        });

        map.setView([meta.lat_average, meta.lng_average], 3);
        markers = createMapMarkers(records, meta.titles_aggregated || [], meta);
        map.addLayer(markers);

        L.maptilerLayer({ apiKey: key, style: "landscape" }).addTo(map);
    }

    function createMapMarkers(records, titles, meta) {
        const points = createMarkers(records, titles);
        const arcColorDict = createArcColorDict(titles, colors);

        const clusterMarkers = L.DonutCluster({ chunkedLoading: true }, {
            key: 'title',
            arcColorDict,
            style: {
                size: 40,
                fill: 'none',
                opacity: 1,
                weight: 7,
            },
            hideLegend: false,
            getLegend: (title, color, percentage, value) =>
                `<span style="border: 1px solid ${color}; background-color:rgba(255, 255, 255, 0.7); border-left-width:15px; padding:1px;">${title}:&nbsp;${value}</span>`
        });

        points.forEach(([lat, lng, title, year]) => {
            const marker = L.marker([lat, lng], {
                title: title,
                year: year,
                icon: makeIcon(titles, title),
            });
            marker.bindPopup(`${title}<br>Year: ${makeYear(year)}`);
            clusterMarkers.addLayer(marker);
        });

        return clusterMarkers;
    }

    function createMarkers(records) {
        return records.map(item => [item.lat, item.lng, item.title, item.year]);
    }

    function createArcColorDict(titles, colors) {
        let i = 0;
        return titles.reduce((acc, title) => {
            acc[title] = colors[Object.keys(colors)[i++]].color;
            return acc;
        }, {});
    }

    function makeIcon(titles, value) {
        const iconBaseUrl = '/plugins/pensoft/pollinatorexplorer/assets/images';
        const color = Object.keys(colors)[titles.indexOf(value)];
        return new L.Icon({
            iconUrl: `${iconBaseUrl}/marker-icon-2x-${color}.png`,
            shadowUrl: `${iconBaseUrl}/marker-shadow.png`,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
    }

    function makeYear(value) {
        return value ? value.toString() : "NA";
    }

    function response() {
        const urlParams = new URLSearchParams(window.location.search);

        if (!urlParams.has('q') || !urlParams.get('q').trim()) {
            if (markers) {
                map.removeLayer(markers);
                markers = null;
            }

            urlParams.delete('year_range');
            urlParams.delete('null_years');
            history.replaceState({}, '', `${location.pathname}?${urlParams.toString()}`);

            yearTextElement.text('');
            yearControl.hide();

            L.maptilerLayer({ apiKey: key, style: "landscape" }).addTo(map);
            map.setView([0, 0], 2);

            return;
        }

        yearControl.show();
        const url = `api/explorer?${urlParams.toString()}`;
        fetchData(url).then(data => {
            if (data) handleResponse(data);
        });
    }

    function updateUrlParams(param, value, action) {
        const url = new URL(window.location.href);
        let params = url.searchParams.get(param)?.split(',') || [];

        if (action === 'add' && !params.includes(value)) {
            if (params.length < selectLimit) {
                params.push(value);
            } else {
                alert('You can select a maximum of 4 taxons.');
                return;
            }
        } else if (action === 'remove') {
            params = params.filter(t => t !== value);
        }

        params.length > 0 ? url.searchParams.set(param, params.join(',')) : url.searchParams.delete(param);

        pushUrl(url);
    }

    function pushUrl(url) {
        history.pushState({}, '', url);
        response();
    }

    function updateSelectedTaxons() {
        const urlParams = new URLSearchParams(window.location.search);
        const selectedTaxons = urlParams.get('q')?.split(',') || [];

        const selectedTaxonsContainer = $('#selected-taxons').empty();

        selectedTaxons.forEach(taxon => moveTaxonToSelected(taxon, selectedTaxonsContainer));
    }

    // function moveTaxonToSelected(taxon, container) {
    //     if (container.find(`.selected-taxon[data-taxon="${taxon}"]`).length > 0 || container.children().length >= selectLimit) {
    //         return;
    //     }

    //     const taxonElement = `<div class="selected-taxon" data-taxon="${taxon}">${taxon} <a class="remove-taxon">×</a></div>`;
    //     container.append(taxonElement);
    //     updateUrlParams('q', taxon, 'add');
    // }

    function resetFilters() {
        $('#category-form select').each(function () {
            this.selectize.clear();
        });
        $('#taxon-search').val('');
        fetchResults();
    }

    // function removeTaxonFromSelected(taxon) {
    //     $(`#selected-taxons .selected-taxon[data-taxon="${taxon}"]`).remove();
    //     updateUrlParams('q', taxon, 'remove');
    // }

    function fetchResults() {
        const selectedCountries = $('#country-select').val() || [];
        const selectedFamilies = $('#family-select').val() || [];
        const selectedGenera = $('#genus-select').val() || [];
        const selectedTribes = $('#tribe-select').val() || [];
        const searchTerm = $('#taxon-search').val().trim();

        if (!searchTerm && selectedCountries.length === 0 && selectedFamilies.length === 0 && selectedGenera.length === 0 && selectedTribes.length === 0) {
            $('#results').hide();
            $('.tooltip').hide();
            return;
        }

        const query = {
            countries: selectedCountries,
            families: selectedFamilies,
            genera: selectedGenera,
            tribes: selectedTribes,
            search: searchTerm,
        };

        fetchData(`api/search?${$.param(query)}`).then(response => {
            const resultsContainer = $('#results').empty();
            if (response.taxons && response.taxons.length > 0) {
                const resultsList = $('<ul>');
                $.each(response.taxons, (index, taxon) => {
                    const listItem = $('<li>').text(taxon).on('click', function (e) {
                        e.preventDefault();
                        moveTaxonToSelected(taxon, $('#selected-taxons'));
                    });
                    resultsList.append(listItem);
                });
                resultsContainer.append(resultsList);
                $('#results').show();
                $('.tooltip').show();
            } else {
                resultsContainer.append('<p>No results found.</p>');
            }
        }).catch(error => {
            console.error('Error fetching results:', error);
            $('#results').html('<p>An error occurred while fetching results.</p>');
        });
        
    }

    function initSelectize() {
        $('#country-select, #family-select, #genus-select, #tribe-select').selectize({
            maxItems: selectLimit,
            plugins: ['remove_button'],
            onChange: fetchResults
        });
    }

    // $('#results li a').on('click', function (e) {
        
    // });
    $('#selected-taxons').on('click', '.remove-taxon', function () {
        const taxon = $(this).parent().data('taxon');
        removeTaxonFromSelected(taxon);
    });

    $('#null-years').prop('checked', true);
    $('#null-years').on('change', function() {
        const url = new URL(window.location.href);
        pushUrl(url);
    });

    $('#taxon-search').on('input', fetchResults);
    $('#reset-filters-button').on('click', resetFilters);

    $(document).on('click', function (e) {
        if (!$(e.target).closest('.custom-multiselect').length) {
            $('.custom-multiselect').removeClass('active');
        }
    });

    window.addEventListener('popstate', () => {
        updateSelectedTaxons();
    });

    initSelectize();
    updateSelectedTaxons();
});
