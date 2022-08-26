import React, { useEffect, useRef, useState } from 'react';
import {Add, Delete} from '@mui/icons-material'
import {Button, TextField, IconButton, Checkbox, Select, MenuItem, ListItemText} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

const default_filters = {
    mesh_heading: "",
    author: "",
    first_author: "",
    last_author: "",
    published_before: null,
    published_after: null,
    journal: "",
    article: "",
    num_nodes: 100,
    graph_type: "author",
};

const Filters = () => {
    const [filters, setFilters] = useState(default_filters)

    const [activeFilters, setActiveFilters] = useState([])

    const filterCategories = {
        Author: ["Author", "rgba(234, 47, 30, 0.6)"],
        Article: ["Article", "rgba(149, 178, 249, 0.6)"],
        Graph: ["Graph", "rgba(0, 0, 0, 0.4)"]
    }

    function makeFilterEntry(classifier, identifier, inputField) {
        let name = filterNames[identifier];

        return <div className="filter-row" key={identifier}>
            <div className="filter-class">
                <p style={{background: classifier[1]}}>
                    {classifier[0]}
                </p>
            </div>
            <div className="filter-name"><p>{name}</p></div>
            <div className="filter-entry">
                {inputField}
            </div>
            <div className="filter-delete">
                <IconButton aria-label="delete" onClick={() => deleteFilter(identifier)}>
                    <Delete />
                </IconButton>
            </div>
        </div>
    }

    function updateStateCallbackGenerator(identifier) {
        return (newValue) => {
            setFilters({...filters, [identifier]: newValue.target.value});
        }
    }

    function makeTextFieldEntry(classifier, identifier, label) {
        let textInput = <TextField
            label={label}
            value={filters[identifier]}
            onChange={updateStateCallbackGenerator(identifier)
            }
        />;

        return makeFilterEntry(classifier, identifier, textInput);
    }

    let filterNames = {
        mesh_heading: "MESH Heading",
        author: "Author name",
        first_author: "First author",
        last_author: "Last author",
        published_before: "Published before",
        published_after: "Published after",
        journal: "Journal name",
        article: "Article name",
        num_nodes: "Node limit",
        graph_type: "Graph type",
    }

    let filterComponents = {
        mesh_heading: makeTextFieldEntry(filterCategories.Article,"mesh_heading", "MESH"),
        author: makeTextFieldEntry(filterCategories.Author,"author", "Name"),
        first_author: makeTextFieldEntry(filterCategories.Author,"first_author", "First author"),
        last_author: makeTextFieldEntry(filterCategories.Author,"last_author", "Last author"),
        published_after: makeFilterEntry(filterCategories.Article,"published_after", <DatePicker
            label="After"
            value={filters.published_after}
            onChange={updateStateCallbackGenerator("published_after")}
            renderInput={(params) => <TextField {...params} />}
            inputFormat="DD/MM/YYYY"
        />),
        published_before: makeFilterEntry(filterCategories.Article,"published_before", <DatePicker
            label="Before"
            value={filters.published_before}
            onChange={updateStateCallbackGenerator("published_before")}
            renderInput={(params) => <TextField {...params} />}
            inputFormat="DD/MM/YYYY"
        />),
        journal: makeTextFieldEntry(filterCategories.Article,"journal", "Journal"),
        article: makeTextFieldEntry(filterCategories.Article,"article", "Title"),
        num_nodes: makeFilterEntry(filterCategories.Author,"num_nodes", <TextField
            type="numeric"
            value={filters.num_nodes}
            onChange={updateStateCallbackGenerator("num_nodes")}
            />
            ),
        graph_type: makeFilterEntry(filterCategories.Graph,"graph_type", <Select
            value={filters.graph_type}
            onChange={updateStateCallbackGenerator("graph_type")}
            >
                <MenuItem value={"author"}>Author</MenuItem>
                <MenuItem value={"journal"}>Journal</MenuItem>
        </Select>)

    }

    let selectedFilterComponents = activeFilters.map(f => filterComponents[f]);

    function deleteFilter(identifier) {
        setActiveFilters(activeFilters.filter(f => f !== identifier));
        setFilters({...filters, [identifier]: default_filters[identifier]}); // Reset to the default value
    }

    const handleFilterSelectionChange = (event) => {
        const {
            target: { value },
        } = event;
        setActiveFilters(
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    return <div id="filters">
        <div id="add-filters">
            <Select multiple
                    value={activeFilters}
                    onChange={handleFilterSelectionChange}
                    displayEmpty={true}
                    renderValue={(selected) => {
                        if (selected.length === 0) {
                            return <Button variant="text" startIcon={<Add />} style={{padding: 0}}>
                                Add new filter
                            </Button>
                        } else {
                            return selected.length + " filter" + (selected.length !== 1 ? "s" : "");
                        }
                    }}
                    sx={{border: "white"}}
            >
                {Object.keys(filterNames).map(f =>
                    <MenuItem key={f} value={f}>
                        <Checkbox checked={activeFilters.indexOf(f) > -1} />
                        <ListItemText primary={filterNames[f]} />
                    </MenuItem>)}
            </Select>
        </div>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            {selectedFilterComponents}
        </LocalizationProvider>
    </div>;
};

export default Filters;
