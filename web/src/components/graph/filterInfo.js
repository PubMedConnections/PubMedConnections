
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

export {availableFilters, filterCategories};
