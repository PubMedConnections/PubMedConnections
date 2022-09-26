
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

const availableFilters = [
    {
        key: "mesh_heading",
        name: "MeSH Heading",
        form_name: "MeSH",
        category: filterCategories.Article
    },
    {
        key: "author",
        name: "Author Name",
        form_name: "Author Name",
        category: filterCategories.Author
    },
    {
        key: "affiliation",
        name: "Author Affiliation",
        form_name: "Affiliation",
        category: filterCategories.Author
    },
    {
        key: "first_author",
        name: "Is First Author",
        form_name: "Restrict to First Authors",
        category: filterCategories.Author
    },
    {
        key: "last_author",
        name: "Is Last Author",
        form_name: "Restrict to Last Authors",
        category: filterCategories.Author
    },
    {
        key: "published_before",
        name: "Published Before",
        form_name: "Before",
        category: filterCategories.Article
    },
    {
        key: "published_after",
        name: "Published After",
        form_name: "After",
        category: filterCategories.Article
    },
    {
        key: "journal",
        name: "Journal Name",
        form_name: "Journal",
        category: filterCategories.Journal
    },
    {
        key: "article",
        name: "Article Title",
        form_name: "Article",
        category: filterCategories.Article
    },
    {
        key: "graph_size",
        name: "Max Graph Size",
        form_name: "Max Graph Size",
        category: filterCategories.Graph
    },
    {
        key: "graph_type",
        name: "Graph Type",
        form_name: "Graph Type",
        category: filterCategories.Graph
    },
    {
        key: "graph_node_size",
        name: "Graph Node Size",
        form_name: "Node Size Source",
        category: filterCategories.Graph
    },
    {
        key: "graph_node_colour",
        name: "Graph Node Colour",
        form_name: "Node Colour Source",
        category: filterCategories.Graph
    },
    {
        key: "graph_edge_size",
        name: "Graph Edge Width",
        form_name: "Edge Width Source",
        category: filterCategories.Graph
    },
    {
        key: "graph_minimum_edges",
        name: "Graph Node Minimum Edges",
        form_name: "Minimum Edges",
        category: filterCategories.Graph
    },
];

const availableFiltersMap = {};
for (let index = 0; index < availableFilters.length; ++index) {
    const filterSpec = availableFilters[index];
    availableFiltersMap[filterSpec.key] = filterSpec;
}

export {availableFilters, availableFiltersMap, filterCategories};
