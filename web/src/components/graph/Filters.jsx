import React, { useEffect, useRef, useState } from 'react';
import {Add, Delete} from '@mui/icons-material'
import {Button, TextField, IconButton, Grid, Select, MenuItem} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker'


const Filters = () => {
    const [filters, setFilters] = useState({
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
    })

    const filterCategories = {
        Author: ["Author", "rgba(234, 47, 30, 0.6)"],
        Article: ["Article", "rgba(149, 178, 249, 0.6)"],
        Graph: ["Graph", "rgba(0, 0, 0, 0.4)"]
    }

    function makeFilterEntry(classifier, name, identifier, inputField) {
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

    function makeTextFieldEntry(classifier, name, identifier, label) {
        let textInput = <TextField
            label={label}
            value={filters[identifier]}
            onChange={updateStateCallbackGenerator(identifier)
            }
        />;

        return makeFilterEntry(classifier, name, identifier, textInput);
    }

    let filterComponents = {
        mesh_heading: makeTextFieldEntry(filterCategories.Article, "Mesh Heading", "mesh_heading", "MESH"),
        author: makeTextFieldEntry(filterCategories.Author, "Author name", "author", "Name"),
        first_author: makeTextFieldEntry(filterCategories.Author, "First author", "first_author", "First author"),
        last_author: makeTextFieldEntry(filterCategories.Author, "Last author", "last_author", "Last author"),
        published_after: makeFilterEntry(filterCategories.Article, "Published after", "published_after", <DatePicker
            label="After"
            value={filters.published_after}
            onChange={updateStateCallbackGenerator("published_after")}
            renderInput={(params) => <TextField {...params} />}
            inputFormat="DD/MM/YYYY"
        />),
        published_before: makeFilterEntry(filterCategories.Article, "Published before", "published_before", <DatePicker
            label="Before"
            value={filters.published_before}
            onChange={updateStateCallbackGenerator("published_before")}
            renderInput={(params) => <TextField {...params} />}
            inputFormat="DD/MM/YYYY"
        />),
        journal: makeTextFieldEntry(filterCategories.Article, "Journal name", "journal", "Journal"),
        article: makeTextFieldEntry(filterCategories.Article, "Article title", "article", "Title"),
        num_nodes: makeFilterEntry(filterCategories.Author, "Node limit", "num_nodes", <TextField
            type="numeric"
            value={filters.num_nodes}
            onChange={updateStateCallbackGenerator("num_nodes")}
            />
            ),
        graph_type: makeFilterEntry(filterCategories.Graph, "Graph type", "graph_type", <Select
            value={filters.graph_type}
            onChange={updateStateCallbackGenerator("graph_type")}
            >
                <MenuItem value={"author"}>Author</MenuItem>
                <MenuItem value={"journal"}>Journal</MenuItem>
        </Select>)

    }

    let selectedFilterComponents = Object.values(filterComponents)//TODO allow adding of filters[]

    function selectNewFilter() {
        // TODO
    }

    function deleteFilter(identifier) {
        // TODO
    }

    return <div id="filters">
        {/*<h4>Filters</h4>*/}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            {selectedFilterComponents}
        </LocalizationProvider>
        <div id="add-filter-button">
            <Button variant="contained" size="small" startIcon={<Add />} onClick={selectNewFilter}>
                Add new filter
            </Button>
            <p>{filters.author}</p>
        </div>
    </div>;
};

export default Filters;
