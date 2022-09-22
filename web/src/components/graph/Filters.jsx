import {Add, Delete, Refresh} from '@mui/icons-material'
import {
    Button,
    TextField,
    IconButton,
    Checkbox,
    Select,
    MenuItem,
    ListItemText,
    Slider,
    FormControl,
    InputLabel,
    FormControlLabel
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import {useSelector, useDispatch} from 'react-redux'
import {
    setFilter,
    setActiveFilters,
    removeActiveFilter,
    setLoadResults,
    setResultsLoaded
} from '../../store/slices/filterSlice'
import {availableFilters, availableFiltersMap, filterCategories} from './filterInfo';
import {useEffect} from "react";

const Filters = () => {
    const filters = useSelector((state) => state.filters.filters);
    const dispatch = useDispatch();

    const activeFilters = useSelector((state) => state.filters.activeFilters)

    function makeFilterEntry(filterDesc, element) {
        return <div className="filter-row" key={filterDesc.key}>
            <div className="filter-class">
                <p style={{background: filterDesc.category.colour}}>
                    {filterDesc.category.name}
                </p>
            </div>
            <div className="filter-name"><p>{filterDesc.name}</p></div>
            <div className="filter-entry">{element}</div>
            <div className="filter-delete">
                <IconButton aria-label="delete" onClick={() => deleteFilter(filterDesc.key)}>
                    <Delete />
                </IconButton>
            </div>
        </div>;
    }

    function updateStateCallbackGenerator(filterKey, valueFromEventFn) {
        return (event) => {
            dispatch(setFilter({[filterKey]: valueFromEventFn(event)}));
        };
    }

    function updateStateDateCallbackGenerator(filterKey) {
        return updateStateCallbackGenerator(filterKey, (newValue) => newValue.format("YYYY-MM-DD"));
    }

    function updateStateFromEventValueCallbackGenerator(filterKey) {
        return updateStateCallbackGenerator(filterKey, (event) => event.target.value);
    }

    function updateStateFromEventCheckedCallbackGenerator(filterKey) {
        return updateStateCallbackGenerator(filterKey, (event) => event.target.checked);
    }

    function makeTextFieldEntry(filterDesc) {
        const currentFilterValue = filters[filterDesc.key];
        if (currentFilterValue === undefined)
            return <></>;

        const textInput = <TextField
            label={filterDesc.form_name}
            value={currentFilterValue}
            onChange={updateStateFromEventValueCallbackGenerator(filterDesc.key)}
        />;

        return makeFilterEntry(filterDesc, textInput);
    }

    function makeDateFieldEntry(filterDesc) {
        const currentFilterValue = filters[filterDesc.key];
        if (currentFilterValue === undefined)
            return <></>;

        const picker = <DatePicker
            label={filterDesc.form_name}
            value={currentFilterValue}
            onChange={updateStateDateCallbackGenerator(filterDesc.key)}
            renderInput={(params) => <TextField {...params} />}
            inputFormat="DD/MM/YYYY"
        />;

        return makeFilterEntry(filterDesc, picker);
    }

    function makeCheckboxFieldEntry(filterDesc) {
        const currentFilterValue = filters[filterDesc.key];
        if (currentFilterValue === undefined)
            return <></>;

        const textAndCheckbox = <FormControlLabel
            label={filterDesc.form_name}
            control={
                <Checkbox
                    label={filterDesc.form_name}
                    checked={currentFilterValue}
                    onChange={updateStateFromEventCheckedCallbackGenerator(filterDesc.key)}
                />
            }
        />;

        return makeFilterEntry(filterDesc, textAndCheckbox);
    }

    function makeNodeCountSliderEntry(filterDesc) {
        const currentFilterValue = filters[filterDesc.key];
        if (currentFilterValue === undefined)
            return <></>;

        const scale = [200, 400, 600, 800, 1000, 1250, 1500, 1750, 2000, 2500, 3000, 4000, 5000, 10000];

        function calculateValue(value) {
            return scale[value];
        }

        function reverseValue(value) {
            for (let index = 0; index < scale.length; ++index) {
                if (value <= scale[index])
                    return index;
            }
            return scale.length - 1;
        }

        function valueLabelFormat(value) {
            return value.toLocaleString() + " nodes";
        }

        const slider = <div className={"filter-entry-slider"}>
            <span>{valueLabelFormat(filters.graph_size)}</span>
            <Slider
                aria-label={filterDesc.form_name}
                value={reverseValue(currentFilterValue)}
                onChange={updateStateCallbackGenerator(filterDesc.key, (event) => calculateValue(event.target.value))}
                marks
                min={0}
                max={scale.length - 1}
                step={1}
                scale={calculateValue}
                getAriaValueText={valueLabelFormat}
                valueLabelFormat={valueLabelFormat}
                valueLabelDisplay="auto"
                aria-labelledby="non-linear-slider"
            />
        </div>;

        return makeFilterEntry(filterDesc, slider);
    }

    function makeGraphNodeTypeEntry(filterDesc) {
        const currentFilterValue = filters[filterDesc.key];
        if (currentFilterValue === undefined)
            return <></>;

        const selector = <FormControl>
            <InputLabel>{filterDesc.form_name}</InputLabel>
            <Select
                label={filterDesc.form_name}
                value={currentFilterValue}
                onChange={updateStateFromEventValueCallbackGenerator(filterDesc.key)}>
                    <MenuItem value={"author_coauthors_open"}>
                        Authors and their Co-Authors on Matched Articles
                    </MenuItem>
                    <MenuItem value={"author_coauthors_closed"}>
                        Authors and their Matched Co-Authors on Matched Articles
                    </MenuItem>
            </Select>
        </FormControl>;

        return makeFilterEntry(filterDesc, selector);
    }

    function makeGraphNodeValueEntry(filterDesc) {
        const currentFilterValue = filters[filterDesc.key];
        if (currentFilterValue === undefined)
            return <></>;

        const selector = <FormControl>
            <InputLabel>{filterDesc.form_name}</InputLabel>
            <Select
                label={filterDesc.form_name}
                value={currentFilterValue}
                onChange={updateStateFromEventValueCallbackGenerator(filterDesc.key)}>
                    <MenuItem value={"constant"}>Constant</MenuItem>
                    <MenuItem value={"matched_nodes"}>Increase for Matched Nodes</MenuItem>
                    <MenuItem value={"edge_count"}>Increase with Number of Edges</MenuItem>
                    <MenuItem value={"citations"}>Increase with Citations</MenuItem>
            </Select>
        </FormControl>;

        return makeFilterEntry(filterDesc, selector);
    }

    function makeGraphEdgeValueEntry(filterDesc) {
        const currentFilterValue = filters[filterDesc.key];
        if (currentFilterValue === undefined)
            return <></>;

        const selector = <FormControl>
            <InputLabel>{filterDesc.form_name}</InputLabel>
            <Select
                label={filterDesc.form_name}
                value={currentFilterValue}
                onChange={updateStateFromEventValueCallbackGenerator(filterDesc.key)}>
                    <MenuItem value={"constant"}>Constant</MenuItem>
                    <MenuItem value={"coauthored_articles"}>Increase with Co-Authored Articles</MenuItem>
                    <MenuItem value={"citations"}>Increase with Shared Citations</MenuItem>
            </Select>
        </FormControl>;

        return makeFilterEntry(filterDesc, selector);
    }

    let filterComponents = {
        mesh_heading: makeTextFieldEntry(availableFiltersMap.mesh_heading),
        author: makeTextFieldEntry(availableFiltersMap.author),
        affiliation: makeTextFieldEntry(availableFiltersMap.affiliation),
        first_author: makeCheckboxFieldEntry(availableFiltersMap.first_author),
        last_author: makeCheckboxFieldEntry(availableFiltersMap.last_author),
        published_after: makeDateFieldEntry(availableFiltersMap.published_after),
        published_before: makeDateFieldEntry(availableFiltersMap.published_before),
        journal: makeTextFieldEntry(availableFiltersMap.journal),
        article: makeTextFieldEntry(availableFiltersMap.article),
        graph_size: makeNodeCountSliderEntry(availableFiltersMap.graph_size),
        graph_type: makeGraphNodeTypeEntry(availableFiltersMap.graph_type),
        graph_node_size: makeGraphNodeValueEntry(availableFiltersMap.graph_node_size),
        graph_node_colour:  makeGraphNodeValueEntry(availableFiltersMap.graph_node_colour),
        graph_edge_size: makeGraphEdgeValueEntry(availableFiltersMap.graph_edge_size),
        graph_minimum_edges: makeTextFieldEntry(availableFiltersMap.graph_minimum_edges),
    }
    let selectedFilterComponents = activeFilters.map(f => filterComponents[f]);

    function deleteFilter(filterKey) {
        dispatch(removeActiveFilter({filter: filterKey}));
    }

    const handleFilterSelectionChange = (event) => {
        const {
            target: { value },
        } = event;
        let oldFilters = [...activeFilters];

        dispatch(setActiveFilters({filters: value}));
    };

    const activeFiltersSelector = <FormControl size="small">
        <InputLabel>Active Filters</InputLabel>
        <Select multiple
                label="Active Filters"
                value={activeFilters}
                onChange={handleFilterSelectionChange}
                displayEmpty={true}
                renderValue={(selected) => {
                    let filterCount = selected.filter(f => f in availableFiltersMap).length;
                    if (filterCount === 0) {
                        return <Button variant="text" startIcon={<Add />} style={{padding: 0}}>
                            Click to Add Filters
                        </Button>
                    } else {
                        return filterCount + " Selected Filter" + (filterCount > 1 ? "s" : "");
                    }
                }}>

            {availableFilters.map(filterSpec => {
                return <MenuItem key={filterSpec.key} value={filterSpec.key}>
                    <Checkbox checked={activeFilters.indexOf(filterSpec.key) > -1} />
                    <ListItemText primary={filterSpec.name} />
                </MenuItem>;
            })}
        </Select>
    </FormControl>;

    function loadResults() {
        dispatch(setLoadResults(true));
    }

    useEffect(() => dispatch(setResultsLoaded(false)), [filters])

    return <div id="filters">
        <div id="filters-header">
            <div id="add-filters">
                    {activeFiltersSelector}
            </div>
            <div id="filters-load-button">
                <Button
                    onClick={loadResults}
                    endIcon={<Refresh />}
                    variant="contained"
                    color="success"
                >
                    Load graph
                </Button>
            </div>
        </div>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            {selectedFilterComponents}
        </LocalizationProvider>

    </div>;
};

export default Filters;
