import {Add, Delete} from '@mui/icons-material'
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
import { setFilter, setActiveFilters, removeActiveFilter } from '../../store/slices/filterSlice'



const filterCategories = {
    Journal: {
        name: "Journal",
        colour: "rgba(169, 103, 224, 0.6)"
    },
    Author: {
        name: "Author",
        colour: "rgba(234, 47, 30, 0.6)"
    },
    Article: {
        name: "Article",
        colour: "rgba(149, 178, 249, 0.6)"
    },
    Graph: {
        name: "Graph",
        colour: "rgba(0, 0, 0, 0.4)"
    }
}

const availableFilters = {
    mesh_heading: {
        key: "mesh_heading",
        name: "MeSH Heading",
        form_name: "MeSH",
        category: filterCategories.Article
    },
    author: {
        key: "author",
        name: "Author Name",
        form_name: "Author Name",
        category: filterCategories.Author
    },
    affiliation: {
        key: "affiliation",
        name: "Author Affiliation",
        form_name: "Affiliation",
        category: filterCategories.Author
    },
    first_author: {
        key: "first_author",
        name: "Is First Author",
        form_name: "Restrict to First Authors",
        category: filterCategories.Author
    },
    last_author: {
        key: "last_author",
        name: "Is Last Author",
        form_name: "Restrict to Last Authors",
        category: filterCategories.Author
    },
    published_before: {
        key: "published_before",
        name: "Published Before",
        form_name: "Before",
        category: filterCategories.Article
    },
    published_after: {
        key: "published_after",
        name: "Published After",
        form_name: "After",
        category: filterCategories.Article
    },
    journal: {
        key: "journal",
        name: "Journal Name",
        form_name: "Journal",
        category: filterCategories.Journal
    },
    article: {
        key: "article",
        name: "Article Title",
        form_name: "Article",
        category: filterCategories.Article
    },
    graph_size: {
        key: "graph_size",
        name: "Max Graph Size",
        form_name: "Max Graph Size",
        category: filterCategories.Graph
    },
    graph_type: {
        key: "graph_type",
        name: "Graph Node Type",
        form_name: "Graph Node Type",
        category: filterCategories.Graph
    },
    graph_node_size: {
        key: "graph_node_size",
        name: "Graph Node Size",
        form_name: "Node Size Source",
        category: filterCategories.Graph
    },
    graph_node_colour: {
        key: "graph_node_colour",
        name: "Graph Node Colour",
        form_name: "Node Colour Source",
        category: filterCategories.Graph
    },
    graph_edge_size: {
        key: "graph_edge_size",
        name: "Graph Edge Width",
        form_name: "Edge Width Source",
        category: filterCategories.Graph
    },
};

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
                    <MenuItem value={"author"}>Author</MenuItem>
                    {/*<MenuItem value={"mesh"}>Journal</MenuItem>*/}
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
        mesh_heading: makeTextFieldEntry(availableFilters.mesh_heading),
        author: makeTextFieldEntry(availableFilters.author),
        affiliation: makeTextFieldEntry(availableFilters.affiliation),
        first_author: makeCheckboxFieldEntry(availableFilters.first_author),
        last_author: makeCheckboxFieldEntry(availableFilters.last_author),
        published_after: makeDateFieldEntry(availableFilters.published_after),
        published_before: makeDateFieldEntry(availableFilters.published_before),
        journal: makeTextFieldEntry(availableFilters.journal),
        article: makeTextFieldEntry(availableFilters.article),
        graph_size: makeNodeCountSliderEntry(availableFilters.graph_size),
        graph_type: makeGraphNodeTypeEntry(availableFilters.graph_type),
        graph_node_size: makeGraphNodeValueEntry(availableFilters.graph_node_size),
        graph_node_colour:  makeGraphNodeValueEntry(availableFilters.graph_node_colour),
        graph_edge_size: makeGraphEdgeValueEntry(availableFilters.graph_edge_size),
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
                    let filterCount = selected.filter(f => f in availableFilters).length;
                    if (filterCount === 0) {
                        return <Button variant="text" startIcon={<Add />} style={{padding: 0}}>
                            Click to Add Filters
                        </Button>
                    } else {
                        return filterCount + " Selected Filter" + (filterCount > 1 ? "s" : "");
                    }
                }}>

            {Object.keys(availableFilters).map(f => {
                return <MenuItem key={f} value={f}>
                    <Checkbox checked={activeFilters.indexOf(f) > -1} />
                    <ListItemText primary={availableFilters[f].name} />
                </MenuItem>;
            })}
        </Select>
    </FormControl>;

    return <div id="filters">
        <div id="add-filters">{activeFiltersSelector}</div>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            {selectedFilterComponents}
        </LocalizationProvider>
    </div>;
};

export default Filters;
