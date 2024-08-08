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

    let markers = null;

    async function fetchData(url) {
        return await fetch(url, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .catch(error => {
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
            restrictedLabels: getOptimizedLabels(meta.taxons_years.sort(), meta.first_taxon_year, meta.last_taxon_year),
            min: meta.first_taxon_year,
            max: meta.last_taxon_year,
            start: meta.year_min,
            end: meta.year_max,
            step: 1,
            autoAdjustLabels: true,
            onChange: (index, start_value, end_value) => {
                const url = new URL(location.href);
                const range = (start_value === end_value) ? start_value : `${start_value},${end_value}`;
                url.searchParams.set("year_range", range);
                pushUrl(url);
            },
            onMove: (index, start_value, end_value) => {
                yearTextElement.text((start_value === end_value) ? start_value : `${start_value} - ${end_value}`);
            },
        });

        function getOptimizedLabels(years, firstYear, lastYear) {
            const labelFrequency = Math.ceil(years.length / 5);
            let labels = years.filter((year, index) => index % labelFrequency === 0);

            // Ensure first and last years are always labeled
            if (!labels.includes(firstYear)) labels.unshift(firstYear); {
                labels.unshift(firstYear);
            }
            if (!labels.includes(lastYear)) {
                labels.push(lastYear);
            }
            return labels;
        }

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

        // If no query parameters are present, show the default map
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
        // Reorder the parameters to ensure 'q' comes before 'year_range'
        const q = url.searchParams.get('q');
        const yearRange = url.searchParams.get('year_range');
        const nullYears = $('#null-years').is(':checked');

        url.searchParams.delete('q');
        url.searchParams.delete('year_range');
        url.searchParams.delete('null_years');
        
        if (q && q.trim()) {
            url.searchParams.append('q', q);

            if (yearRange) {
                url.searchParams.append('year_range', yearRange);
            }

            if (nullYears) {
                    url.searchParams.append('null_years', 'true');
            }
        }


        history.pushState({}, '', url);
        response();
    }

    function init() {
        fetchResults();
        updateSelectedTaxons();
    }

    function updateSelectedTaxons() {
        const urlParams = new URLSearchParams(window.location.search);
        const selectedTaxons = urlParams.get('q')?.split(',') || [];

        const selectedTaxonsContainer = $('#selected-taxons').empty();

        selectedTaxons.forEach(taxon => moveTaxonToSelected(taxon, selectedTaxonsContainer));
    }

    function moveTaxonToSelected(taxon, container) {
        if (container.find(`.selected-taxon[data-taxon="${taxon}"]`).length > 0 || container.children().length >= selectLimit) {
            return;
        }

        const taxonElement = `<div class="selected-taxon" data-taxon="${taxon}">${taxon} <button class="remove-taxon">Remove</button></div>`;
        container.append(taxonElement);
        updateUrlParams('q', taxon, 'add');
    }

    function resetFilters() {
        $('#category-form input[type="checkbox"]').prop('checked', false);
        $('#taxon-search').val('');
        fetchResults();
    }

    function removeTaxonFromSelected(taxon) {
        $(`#selected-taxons .selected-taxon[data-taxon="${taxon}"]`).remove();
        updateUrlParams('q', taxon, 'remove');
    }

    function fetchResults() {
        const selectedCountries = $('#country-options input:checked').map((_, el) => $(el).val()).get();
        const selectedGenera = $('#genus-options input:checked').map((_, el) => $(el).val()).get();
        const selectedFamilies = $('#family-options input:checked').map((_, el) => $(el).val()).get();
        const selectedTribes = $('#tribe-options input:checked').map((_, el) => $(el).val()).get();
        const searchTerm = $('#taxon-search').val().trim();

        const query = {
            countries: selectedCountries,
            genera: selectedGenera,
            families: selectedFamilies,
            tribes: selectedTribes,
            search: searchTerm,
        };

        fetchData(`api/search?${$.param(query)}`).then(response => {
            const resultsContainer = $('#results').empty();

            if (response.taxons && response.taxons.length > 0) {
                const resultsList = $('<ul>').append(`<h3>Fetched ${response.results} taxons:</h3>`);
                $.each(response.taxons, (index, taxon) => {
                    const listItem = $('<li>').append(
                        $('<a href="#">').text(taxon).on('click', function (e) {
                            e.preventDefault();
                            moveTaxonToSelected(taxon, $('#selected-taxons'));
                        })
                    );
                    resultsList.append(listItem);
                });
                resultsContainer.append(resultsList);
            } else {
                resultsContainer.append('<p>No results found.</p>');
            }
        }).catch(error => {
            console.error('Error fetching results:', error);
            $('#results').html('<p>An error occurred while fetching results.</p>');
        });
    }

    // Event listeners
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

    $('.custom-multiselect-placeholder').on('click', function () {
        $(this).closest('.custom-multiselect').toggleClass('active');
    });

    $('.custom-multiselect-options input').on('change', function () {
        const parent = $(this).closest('.custom-multiselect');
        const selectedOptions = parent.find('input:checked').map((_, el) => $(el).val()).get();
        const placeholder = parent.find('.custom-multiselect-placeholder');

        placeholder.text(selectedOptions.length === 0 ? 'Select options' : `${selectedOptions.length} selected`);
        fetchResults();
    });

    $(document).on('click', function (e) {
        if (!$(e.target).closest('.custom-multiselect').length) {
            $('.custom-multiselect').removeClass('active');
        }
    });

    window.addEventListener('popstate', () => {
        updateSelectedTaxons();
    });

    init();
});