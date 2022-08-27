/**
 * Code Inspired from:
 		* https://stackoverflow.com/questions/40792649/rendering-vis-js-network-into-container-via-react-js

 * Data from:
 		* https://visjs.github.io/vis-network/examples/
		* https://visjs.github.io/vis-network/examples/static/codepen.03abfb6443c182fdd9fdb252aa1d7baab3900da615e980199e21189c8f7a41e4.html
 */

import React, { useEffect, useRef, useState } from 'react';
import LinearProgress from '@mui/material/LinearProgress'
import { Network } from 'vis-network/standalone';

const Graph = () => {

  let dict_data = {
    nodes: [
      {
        id: 1,
        value: 13,
        label: 'Edwidge Danticat',
        title: 'Edwidge Danticat',
      },
      {
        id: 2,
        value: 12,
        label: 'Ernest Hemingway',
      },
      {
        id: 3,
        value: 10,
        label: 'J.R.R. Tolkien',
      },
      {
        id: 4,
        value: 11,
        label: 'Sidney Sheldon',
      },
      {
        id: 5,
        value: 1,
        label: 'Barbara Kingsolver',
      },
      {
        id: 6,
        value: 3,
        label: 'Djuna Barnes',
      },
      {
        id: 7,
        value: 3,
        label: 'Francine Prose',
      },
      {
        id: 8,
        value: 1,
        label: 'Milan Kundera',
      },
      {
        id: 9,
        value: 1,
        label: 'Ursula K. LeGuin',
      },
      {
        id: 10,
        value: 1,
        label: 'Edgar Allan Poe',
      },
      {
        id: 11,
        value: 2,
        label: 'Miranda July',
      },
      { id: 12, value: 2, label: 'Ayn Rand' },
      {
        id: 13,
        value: 2,
        label: 'Dashiell Hammett',
      },
      {
        id: 14,
        value: 1,
        label: 'Anais Nin',
      },
      {
        id: 15,
        value: 2,
        label: 'Ambrose Bierce',
      },
      {
        id: 16,
        value: 2,
        label: 'Oscar Wilde',
      },
      {
        id: 17,
        value: 3,
        label: 'Sylvia Plath',
      },
      {
        id: 18,
        value: 3,
        label: 'Harriet Beecher',
      },
      {
        id: 19,
        value: 1,
        label: 'Pablo Neruda',
      },
      {
        id: 20,
        value: 3,
        label: 'Camille Paglia',
      },
      {
        id: 21,
        value: 2,
        label: 'Tim Adams',
      },
      {
        id: 22,
        value: 1,
        label: 'Dianne Ross',
      },
      {
        id: 23,
        value: 3,
        label: 'Padddy Lamont',
      },
      {
        id: 24,
        value: 2,
        label: 'Patrick Roe',
      },
      {
        id: 25,
        value: 3,
        label: 'Jai Castle',
      },
      {
        id: 26,
        value: 1,
        label: 'Hadi Navabi',
      },
      {
        id: 27,
        value: 1,
        label: 'Wenxiao Zhang',
      },
      {
        id: 28,
        value: 3,
        label: 'Aaron Norrish',
      },
    ],
    edges: [
      {
        from: 1,
        to: 6,
        value: 2,
        // label: 'THIS IS A LABEL',
        title: 'THIS IS A \nTITLE'
      },
      {
        from: 1,
        to: 7,
        value: 1,
        label: ''
      },
      {
        from: 1,
        to: 8,
        value: 3,
        label: ''
      },
      {
        from: 1,
        to: 9,
        value: 3,
        label: ''
      },
      {
        from: 1,
        to: 10,
        value: 2,
        label: '',
      },
      {
        from: 1,
        to: 11,
        value: 1,
        label: '',
      },
      {
        from: 1,
        to: 12,
        value: 2,
        label: '',
      },
      { from: 1,
        to: 3,
        value: 4,
        label: ''
      },
      {
        from: 1,
        to: 13,
        value: 4,
        label: '',
      },
      {
        from: 1,
        to: 14,
        value: 2,
        label: '',
      },
      {
        from: 2,
        to: 5,
        value: 2,
        label: ''
      },
      {
        from: 2,
        to: 15,
        value: 5,
        label: '',
      },
      {
        from: 2,
        to: 16,
        value: 2,
        label: '',
      },
      {
        from: 2,
        to: 17,
        value: 5,
        label: '',
      },
      {
        from: 2,
        to: 18,
        value: 5,
        label: '',
      },
      {
        from: 2,
        to: 3,
        value: 4,
        label: ''
      },
      {
        from: 2,
        to: 12,
        value: 2,
        label: '',
      },
      {
        from: 2,
        to: 11,
        value: 3,
        label: '',
      },
      {
        from: 2,
        to: 19,
        value: 1,
        label: '',
      },
      {
        from: 3,
        to: 20,
        value: 2,
        label: '',
      },
      {
        from: 3,
        to: 16,
        value: 3,
        label: '',
      },
      {
        from: 3,
        to: 5,
        value: 3,
        label: '',
      },
      {
        from: 3,
        to: 21,
        value: 3,
        label: '',
      },
      {
        from: 3,
        to: 22,
        value: 3,
        label: '',
      },
      {
        from: 3,
        to: 23,
        value: 4,
        label: '',
      },
      {
        from: 3,
        to: 24,
        value: 2,
        label: '',
      },
      {
        from: 3,
        to: 25,
        value: 1,
        label: '',
      },
      {
        from: 4,
        to: 26,
        value: 3,
        label: '',
      },
      {
        from: 4,
        to: 27,
        value: 2,
        label: '',
      },
      {
        from: 4,
        to: 17,
        value: 4,
        label: '',
      },
      {
        from: 4,
        to: 28,
        value: 2,
        label: '',
      },
      {
        from: 4,
        to: 20,
        value: 1,
        label: '',
      },
      {
        from: 2,
        to: 27,
        value: 2,
        label: '',
      },
      {
        from: 3,
        to: 17,
        value: 4,
        label: '',
      },
      {
        from: 1,
        to: 28,
        value: 2,
        label: '',
      },
      {
        from: 3,
        to: 20,
        value: 1,
        label: '',
      },
    ],
  };

  let json_data = {
    "counts": {
      "edges num": 4,
      "nodes num": 5,
      "records num": 1  },
    "edges": [
      {
        "from": 89696,
        "label": {
          "article": "Sézary Syndrome: a clinico-pathological study of 9 cases.",
          "mesh_heading": [
            "Skin Neoplasms"        ],
          "position": {
            "Stefania Barruscotti": 2,
            "Vittorio Bolcato": 1        }
        },
        "to": 89697    },
      {
        "from": 89696,
        "label": {
          "article": "Sézary Syndrome: a clinico-pathological study of 9 cases.",
          "mesh_heading": [
            "Skin Neoplasms"        ],
          "position": {
            "Carlo F Tomasini": 4,
            "Vittorio Bolcato": 1        }
        },
        "to": 89699    },
      {
        "from": 89696,
        "label": {
          "article": "Sézary Syndrome: a clinico-pathological study of 9 cases.",
          "mesh_heading": [
            "Skin Neoplasms"        ],
          "position": {
            "Annalisa DE Silvestri": 3,
            "Vittorio Bolcato": 1        }
        },
        "to": 89698    },
      {
        "from": 89696,
        "label": {
          "article": "Sézary Syndrome: a clinico-pathological study of 9 cases.",
          "mesh_heading": [
            "Skin Neoplasms"        ],
          "position": {
            "Valeria Brazzelli": 5,
            "Vittorio Bolcato": 1        }
        },
        "to": 118621    }
    ],
    "nodes": [
      {
        "id": 89697,
        "is_collective": false,
        "label": "Stefania Barruscotti",
        "value": 1    },
      {
        "id": 89699,
        "is_collective": false,
        "label": "Carlo F Tomasini",
        "value": 1    },
      {
        "id": 89698,
        "is_collective": false,
        "label": "Annalisa DE Silvestri",
        "value": 1    },
      {
        "id": 118621,
        "is_collective": false,
        "label": "Valeria Brazzelli",
        "value": 1    },
      {
        "id": 89696,
        "is_collective": false,
        "label": "Vittorio Bolcato",
        "value": 4    }
    ]
  };

  let json_data2 = {
    "counts": {
      "edges num": 256,
      "nodes num": 241,
      "records num": 15
    },
    "edges": [
      {
        "from": 219684,
        "title":  "Mesh Heading: Body Composition \n" +
                  "Article Name: The prognostic impact of BIA-derived fat-free mass index in patients with cancer. \n" +
                  "Positions: \n" +
                  "#7 Annalisa Turri\n" +
                  "#10 Kristina Franz",
        "to": 219687
      },
      {
        "from": 219684,
        "label": {
          "article": "The prognostic impact of BIA-derived fat-free mass index in patients with cancer.",
          "mesh_heading": [
            "Body Composition"
          ],
          "position": {
            "Annalisa Turri": 7,
            "Ester Giaquinto": 12
          }
        },
        "to": 219689
      },
      {
        "from": 219684,
        "label": {
          "article": "The prognostic impact of BIA-derived fat-free mass index in patients with cancer.",
          "mesh_heading": [
            "Body Composition"
          ],
          "position": {
            "Annalisa Turri": 7,
            "Sara Cutti": 11
          }
        },
        "to": 219688
      },
      {
        "from": 219684,
        "label": {
          "article": "The prognostic impact of BIA-derived fat-free mass index in patients with cancer.",
          "mesh_heading": [
            "Body Composition"
          ],
          "position": {
            "Annalisa Turri": 7,
            "Sara Masi": 4
          }
        },
        "to": 219681
      },
      {
        "from": 219684,
        "label": {
          "article": "The prognostic impact of BIA-derived fat-free mass index in patients with cancer.",
          "mesh_heading": [
            "Body Composition"
          ],
          "position": {
            "Andrea Riccardo Filippi": 13,
            "Annalisa Turri": 7
          }
        },
        "to": 219690
      },
      {
        "from": 219684,
        "label": {
          "article": "The prognostic impact of BIA-derived fat-free mass index in patients with cancer.",
          "mesh_heading": [
            "Body Composition"
          ],
          "position": {
            "Annalisa Turri": 7,
            "Kristina Norman": 14
          }
        },
        "to": 219691
      },
      {
        "from": 219684,
        "label": {
          "article": "The prognostic impact of BIA-derived fat-free mass index in patients with cancer.",
          "mesh_heading": [
            "Body Composition"
          ],
          "position": {
            "Annalisa Turri": 7,
            "Maja Tank": 9
          }
        },
        "to": 219686
      },
      {
        "from": 219684,
        "label": {
          "article": "The prognostic impact of BIA-derived fat-free mass index in patients with cancer.",
          "mesh_heading": [
            "Body Composition"
          ],
          "position": {
            "Annalisa Turri": 7,
            "Federica Lobascio": 3
          }
        },
        "to": 219680
      },
      {
        "from": 219684,
        "label": {
          "article": "The prognostic impact of BIA-derived fat-free mass index in patients with cancer.",
          "mesh_heading": [
            "Body Composition"
          ],
          "position": {
            "Annalisa Turri": 7,
            "Silvia Crotti": 5
          }
        },
        "to": 219682
      },
      {
        "from": 219684,
        "label": {
          "article": "The prognostic impact of BIA-derived fat-free mass index in patients with cancer.",
          "mesh_heading": [
            "Body Composition"
          ],
          "position": {
            "Annalisa Turri": 7,
            "Paolo Pedrazzoli": 2
          }
        },
        "to": 219679
      },
      {
        "from": 219684,
        "label": {
          "article": "The prognostic impact of BIA-derived fat-free mass index in patients with cancer.",
          "mesh_heading": [
            "Body Composition"
          ],
          "position": {
            "Annalisa Turri": 7,
            "Emanuele Cereda": 1
          }
        },
        "to": 219678
      },
      {
        "from": 219684,
        "label": {
          "article": "The prognostic impact of BIA-derived fat-free mass index in patients with cancer.",
          "mesh_heading": [
            "Body Composition"
          ],
          "position": {
            "Annalisa Turri": 7,
            "Catherine Klersy": 6
          }
        },
        "to": 219683
      },
      {
        "from": 219684,
        "label": {
          "article": "The prognostic impact of BIA-derived fat-free mass index in patients with cancer.",
          "mesh_heading": [
            "Body Composition"
          ],
          "position": {
            "Annalisa Turri": 7,
            "Riccardo Caccialanza": 15
          }
        },
        "to": 219692
      },
      {
        "from": 219684,
        "label": {
          "article": "The prognostic impact of BIA-derived fat-free mass index in patients with cancer.",
          "mesh_heading": [
            "Body Composition"
          ],
          "position": {
            "Annalisa Turri": 7,
            "Nicole Stobäus": 8
          }
        },
        "to": 219685
      },
      {
        "from": 159637,
        "label": {
          "article": "Pharmacokinetic parameters and weight change in HIV patients newly switched to dolutegravir-based regimens in SIMPL'HIV clinical trial.",
          "mesh_heading": [
            "HIV Infections",
            "Anti-HIV Agents",
            "HIV Integrase Inhibitors"
          ],
          "position": {
            "Annalisa Marinosci": 10,
            "Monia Guidi": 15
          }
        },
        "to": 159642
      },
      {
        "from": 159637,
        "label": {
          "article": "Pharmacokinetic parameters and weight change in HIV patients newly switched to dolutegravir-based regimens in SIMPL'HIV clinical trial.",
          "mesh_heading": [
            "HIV Infections",
            "Anti-HIV Agents",
            "HIV Integrase Inhibitors"
          ],
          "position": {
            "Andreas Limacher": 14,
            "Annalisa Marinosci": 10
          }
        },
        "to": 159641
      },
      {
        "from": 159637,
        "label": {
          "article": "Pharmacokinetic parameters and weight change in HIV patients newly switched to dolutegravir-based regimens in SIMPL'HIV clinical trial.",
          "mesh_heading": [
            "HIV Infections",
            "Anti-HIV Agents",
            "HIV Integrase Inhibitors"
          ],
          "position": {
            "Annalisa Marinosci": 10,
            "Matthias Cavassini": 9
          }
        },
        "to": 159636
      },
      {
        "from": 159637,
        "label": {
          "article": "Pharmacokinetic parameters and weight change in HIV patients newly switched to dolutegravir-based regimens in SIMPL'HIV clinical trial.",
          "mesh_heading": [
            "HIV Infections",
            "Anti-HIV Agents",
            "HIV Integrase Inhibitors"
          ],
          "position": {
            "Annalisa Marinosci": 10,
            "Mikaela Smit": 11
          }
        },
        "to": 159638
      },
      {
        "from": 159637,
        "label": {
          "article": "Pharmacokinetic parameters and weight change in HIV patients newly switched to dolutegravir-based regimens in SIMPL'HIV clinical trial.",
          "mesh_heading": [
            "HIV Infections",
            "Anti-HIV Agents",
            "HIV Integrase Inhibitors"
          ],
          "position": {
            "Annalisa Marinosci": 10,
            "Patrick Schmid": 13
          }
        },
        "to": 159640
      },
      {
        "from": 159637,
        "label": {
          "article": "Pharmacokinetic parameters and weight change in HIV patients newly switched to dolutegravir-based regimens in SIMPL'HIV clinical trial.",
          "mesh_heading": [
            "HIV Infections",
            "Anti-HIV Agents",
            "HIV Integrase Inhibitors"
          ],
          "position": {
            "Alexandra Calmy": 18,
            "Annalisa Marinosci": 10
          }
        },
        "to": 159645
      },
      {
        "from": 159637,
        "label": {
          "article": "Pharmacokinetic parameters and weight change in HIV patients newly switched to dolutegravir-based regimens in SIMPL'HIV clinical trial.",
          "mesh_heading": [
            "HIV Infections",
            "Anti-HIV Agents",
            "HIV Integrase Inhibitors"
          ],
          "position": {
            "Annalisa Marinosci": 10,
            "Perrine Courlet": 1
          }
        },
        "to": 159628
      },
      {
        "from": 159637,
        "label": {
          "article": "Pharmacokinetic parameters and weight change in HIV patients newly switched to dolutegravir-based regimens in SIMPL'HIV clinical trial.",
          "mesh_heading": [
            "HIV Infections",
            "Anti-HIV Agents",
            "HIV Integrase Inhibitors"
          ],
          "position": {
            "Annalisa Marinosci": 10,
            "Charlotte Barbieux": 2
          }
        },
        "to": 159629
      },
      {
        "from": 159637,
        "label": {
          "article": "Pharmacokinetic parameters and weight change in HIV patients newly switched to dolutegravir-based regimens in SIMPL'HIV clinical trial.",
          "mesh_heading": [
            "HIV Infections",
            "Anti-HIV Agents",
            "HIV Integrase Inhibitors"
          ],
          "position": {
            "Annalisa Marinosci": 10,
            "Enos Bernasconi": 6
          }
        },
        "to": 159633
      },
      {
        "from": 159637,
        "label": {
          "article": "Pharmacokinetic parameters and weight change in HIV patients newly switched to dolutegravir-based regimens in SIMPL'HIV clinical trial.",
          "mesh_heading": [
            "HIV Infections",
            "Anti-HIV Agents",
            "HIV Integrase Inhibitors"
          ],
          "position": {
            "Annalisa Marinosci": 10,
            "Laurent Arthur Decosterd": 17
          }
        },
        "to": 159644
      },
      {
        "from": 159637,
        "label": {
          "article": "Pharmacokinetic parameters and weight change in HIV patients newly switched to dolutegravir-based regimens in SIMPL'HIV clinical trial.",
          "mesh_heading": [
            "HIV Infections",
            "Anti-HIV Agents",
            "HIV Integrase Inhibitors"
          ],
          "position": {
            "Annalisa Marinosci": 10,
            "Dominique Braun": 7
          }
        },
        "to": 159634
      },
      {
        "from": 159637,
        "label": {
          "article": "Pharmacokinetic parameters and weight change in HIV patients newly switched to dolutegravir-based regimens in SIMPL'HIV clinical trial.",
          "mesh_heading": [
            "HIV Infections",
            "Anti-HIV Agents",
            "HIV Integrase Inhibitors"
          ],
          "position": {
            "Annalisa Marinosci": 10,
            "Pietro Vernazza": 8
          }
        },
        "to": 159635
      },
      {
        "from": 159637,
        "label": {
          "article": "Pharmacokinetic parameters and weight change in HIV patients newly switched to dolutegravir-based regimens in SIMPL'HIV clinical trial.",
          "mesh_heading": [
            "HIV Infections",
            "Anti-HIV Agents",
            "HIV Integrase Inhibitors"
          ],
          "position": {
            "Annalisa Marinosci": 10,
            "Huldrych F Günthard": 12
          }
        },
        "to": 159639
      },
      {
        "from": 159637,
        "label": {
          "article": "Pharmacokinetic parameters and weight change in HIV patients newly switched to dolutegravir-based regimens in SIMPL'HIV clinical trial.",
          "mesh_heading": [
            "HIV Infections",
            "Anti-HIV Agents",
            "HIV Integrase Inhibitors"
          ],
          "position": {
            "Annalisa Marinosci": 10,
            "Marcel Stoeckle": 5
          }
        },
        "to": 159632
      },
      {
        "from": 159637,
        "label": {
          "article": "Pharmacokinetic parameters and weight change in HIV patients newly switched to dolutegravir-based regimens in SIMPL'HIV clinical trial.",
          "mesh_heading": [
            "HIV Infections",
            "Anti-HIV Agents",
            "HIV Integrase Inhibitors"
          ],
          "position": {
            "Annalisa Marinosci": 10,
            "Gilles Wandeler": 4
          }
        },
        "to": 159631
      },
      {
        "from": 159637,
        "label": {
          "article": "Pharmacokinetic parameters and weight change in HIV patients newly switched to dolutegravir-based regimens in SIMPL'HIV clinical trial.",
          "mesh_heading": [
            "HIV Infections",
            "Anti-HIV Agents",
            "HIV Integrase Inhibitors"
          ],
          "position": {
            "Annalisa Marinosci": 10,
            "Susana Alves Saldanha": 16
          }
        },
        "to": 159643
      },
      {
        "from": 159637,
        "label": {
          "article": "Pharmacokinetic parameters and weight change in HIV patients newly switched to dolutegravir-based regimens in SIMPL'HIV clinical trial.",
          "mesh_heading": [
            "HIV Infections",
            "Anti-HIV Agents",
            "HIV Integrase Inhibitors"
          ],
          "position": {
            "Annalisa Marinosci": 10,
            "Delphine Sculier": 3
          }
        },
        "to": 159630
      },
      {
        "from": 241754,
        "label": {
          "article": "Multimodal real-time frequency tracking of cantilever arrays in liquid environment for biodetection: Comprehensive setup and performance analysis.",
          "mesh_heading": [
            "Escherichia coli"
          ],
          "position": {
            "Annalisa De Pastina": 1,
            "Fabio Niosi": 5
          }
        },
        "to": 241758
      },
      {
        "from": 241754,
        "label": {
          "article": "Multimodal real-time frequency tracking of cantilever arrays in liquid environment for biodetection: Comprehensive setup and performance analysis.",
          "mesh_heading": [
            "Escherichia coli"
          ],
          "position": {
            "Annalisa De Pastina": 1,
            "Francesco Padovani": 2
          }
        },
        "to": 241755
      },
      {
        "from": 241754,
        "label": {
          "article": "Multimodal real-time frequency tracking of cantilever arrays in liquid environment for biodetection: Comprehensive setup and performance analysis.",
          "mesh_heading": [
            "Escherichia coli"
          ],
          "position": {
            "Annalisa De Pastina": 1,
            "Chiara Rotella": 4
          }
        },
        "to": 241757
      },
      {
        "from": 241754,
        "label": {
          "article": "Multimodal real-time frequency tracking of cantilever arrays in liquid environment for biodetection: Comprehensive setup and performance analysis.",
          "mesh_heading": [
            "Escherichia coli"
          ],
          "position": {
            "Annalisa De Pastina": 1,
            "Martin Hegner": 7
          }
        },
        "to": 241760
      },
      {
        "from": 241754,
        "label": {
          "article": "Multimodal real-time frequency tracking of cantilever arrays in liquid environment for biodetection: Comprehensive setup and performance analysis.",
          "mesh_heading": [
            "Escherichia coli"
          ],
          "position": {
            "Annalisa De Pastina": 1,
            "Giulio Brunetti": 3
          }
        },
        "to": 241756
      },
      {
        "from": 241754,
        "label": {
          "article": "Multimodal real-time frequency tracking of cantilever arrays in liquid environment for biodetection: Comprehensive setup and performance analysis.",
          "mesh_heading": [
            "Escherichia coli"
          ],
          "position": {
            "Annalisa De Pastina": 1,
            "Victor Usov": 6
          }
        },
        "to": 241759
      },
      {
        "from": 156088,
        "label": {
          "article": "Dose/schedule-adjusted Rd-R vs continuous Rd for elderly, intermediate-fit patients with newly diagnosed multiple myeloma.",
          "mesh_heading": [
            "Multiple Myeloma"
          ],
          "position": {
            "Annalisa Bernardini": 13,
            "Paola Tacchetti": 22
          }
        },
        "to": 211582
      },
      {
        "from": 156088,
        "label": {
          "article": "Dose/schedule-adjusted Rd-R vs continuous Rd for elderly, intermediate-fit patients with newly diagnosed multiple myeloma.",
          "mesh_heading": [
            "Multiple Myeloma"
          ],
          "position": {
            "Annalisa Bernardini": 13,
            "Roberto Marasca": 11
          }
        },
        "to": 156086
      },
      {
        "from": 156088,
        "label": {
          "article": "Dose/schedule-adjusted Rd-R vs continuous Rd for elderly, intermediate-fit patients with newly diagnosed multiple myeloma.",
          "mesh_heading": [
            "Multiple Myeloma"
          ],
          "position": {
            "Annalisa Bernardini": 13,
            "Claudia Cellini": 16
          }
        },
        "to": 156091
      },
      {
        "from": 156088,
        "label": {
          "article": "Dose/schedule-adjusted Rd-R vs continuous Rd for elderly, intermediate-fit patients with newly diagnosed multiple myeloma.",
          "mesh_heading": [
            "Multiple Myeloma"
          ],
          "position": {
            "Annalisa Bernardini": 13,
            "Monica Galli": 10
          }
        },
        "to": 156085
      },
      {
        "from": 156088,
        "label": {
          "article": "Dose/schedule-adjusted Rd-R vs continuous Rd for elderly, intermediate-fit patients with newly diagnosed multiple myeloma.",
          "mesh_heading": [
            "Multiple Myeloma"
          ],
          "position": {
            "Annalisa Bernardini": 13,
            "Francesca Patriarca": 19
          }
        },
        "to": 156094
      },
      {
        "from": 156088,
        "label": {
          "article": "Dose/schedule-adjusted Rd-R vs continuous Rd for elderly, intermediate-fit patients with newly diagnosed multiple myeloma.",
          "mesh_heading": [
            "Multiple Myeloma"
          ],
          "position": {
            "Annalisa Bernardini": 13,
            "Patrizia Tosi": 9
          }
        },
        "to": 156084
      },
      {
        "from": 156088,
        "label": {
          "article": "Dose/schedule-adjusted Rd-R vs continuous Rd for elderly, intermediate-fit patients with newly diagnosed multiple myeloma.",
          "mesh_heading": [
            "Multiple Myeloma"
          ],
          "position": {
            "Annalisa Bernardini": 13,
            "Francesca Bonello": 2
          }
        },
        "to": 156077
      },
      {
        "from": 156088,
        "label": {
          "article": "Dose/schedule-adjusted Rd-R vs continuous Rd for elderly, intermediate-fit patients with newly diagnosed multiple myeloma.",
          "mesh_heading": [
            "Multiple Myeloma"
          ],
          "position": {
            "Annalisa Bernardini": 13,
            "Federico Monaco": 18
          }
        },
        "to": 156093
      },
      {
        "from": 156088,
        "label": {
          "article": "Dose/schedule-adjusted Rd-R vs continuous Rd for elderly, intermediate-fit patients with newly diagnosed multiple myeloma.",
          "mesh_heading": [
            "Multiple Myeloma"
          ],
          "position": {
            "Annalisa Bernardini": 13,
            "Mattia D'Agostino": 4
          }
        },
        "to": 156079
      },
      {
        "from": 156088,
        "label": {
          "article": "Dose/schedule-adjusted Rd-R vs continuous Rd for elderly, intermediate-fit patients with newly diagnosed multiple myeloma.",
          "mesh_heading": [
            "Multiple Myeloma"
          ],
          "position": {
            "Alessandra Larocca": 1,
            "Annalisa Bernardini": 13
          }
        },
        "to": 156076
      },
      {
        "from": 156088,
        "label": {
          "article": "Dose/schedule-adjusted Rd-R vs continuous Rd for elderly, intermediate-fit patients with newly diagnosed multiple myeloma.",
          "mesh_heading": [
            "Multiple Myeloma"
          ],
          "position": {
            "Annalisa Bernardini": 13,
            "Tommaso Caravita di Toritto": 20
          }
        },
        "to": 156095
      },
      {
        "from": 156088,
        "label": {
          "article": "Dose/schedule-adjusted Rd-R vs continuous Rd for elderly, intermediate-fit patients with newly diagnosed multiple myeloma.",
          "mesh_heading": [
            "Multiple Myeloma"
          ],
          "position": {
            "Annalisa Bernardini": 13,
            "Sara Bringhen": 24
          }
        },
        "to": 156099
      },
      {
        "from": 156088,
        "label": {
          "article": "Dose/schedule-adjusted Rd-R vs continuous Rd for elderly, intermediate-fit patients with newly diagnosed multiple myeloma.",
          "mesh_heading": [
            "Multiple Myeloma"
          ],
          "position": {
            "Annalisa Bernardini": 13,
            "Giulia Benevolo": 8
          }
        },
        "to": 195660
      },
      {
        "from": 156088,
        "label": {
          "article": "Dose/schedule-adjusted Rd-R vs continuous Rd for elderly, intermediate-fit patients with newly diagnosed multiple myeloma.",
          "mesh_heading": [
            "Multiple Myeloma"
          ],
          "position": {
            "Annalisa Bernardini": 13,
            "Massimo Offidani": 5
          }
        },
        "to": 156080
      },
      {
        "from": 156088,
        "label": {
          "article": "Dose/schedule-adjusted Rd-R vs continuous Rd for elderly, intermediate-fit patients with newly diagnosed multiple myeloma.",
          "mesh_heading": [
            "Multiple Myeloma"
          ],
          "position": {
            "Annalisa Bernardini": 13,
            "Mario Boccadoro": 23
          }
        },
        "to": 160277
      },
      {
        "from": 156088,
        "label": {
          "article": "Dose/schedule-adjusted Rd-R vs continuous Rd for elderly, intermediate-fit patients with newly diagnosed multiple myeloma.",
          "mesh_heading": [
            "Multiple Myeloma"
          ],
          "position": {
            "Alessandra Pompa": 17,
            "Annalisa Bernardini": 13
          }
        },
        "to": 156092
      },
      {
        "from": 156088,
        "label": {
          "article": "Dose/schedule-adjusted Rd-R vs continuous Rd for elderly, intermediate-fit patients with newly diagnosed multiple myeloma.",
          "mesh_heading": [
            "Multiple Myeloma"
          ],
          "position": {
            "Annalisa Bernardini": 13,
            "Nicola Giuliani": 12
          }
        },
        "to": 156087
      },
      {
        "from": 156088,
        "label": {
          "article": "Dose/schedule-adjusted Rd-R vs continuous Rd for elderly, intermediate-fit patients with newly diagnosed multiple myeloma.",
          "mesh_heading": [
            "Multiple Myeloma"
          ],
          "position": {
            "Annalisa Bernardini": 13,
            "Paolo Corradini": 21
          }
        },
        "to": 156096
      },
      {
        "from": 156088,
        "label": {
          "article": "Dose/schedule-adjusted Rd-R vs continuous Rd for elderly, intermediate-fit patients with newly diagnosed multiple myeloma.",
          "mesh_heading": [
            "Multiple Myeloma"
          ],
          "position": {
            "Andrea Capra": 7,
            "Annalisa Bernardini": 13
          }
        },
        "to": 156082
      },
      {
        "from": 156088,
        "label": {
          "article": "Dose/schedule-adjusted Rd-R vs continuous Rd for elderly, intermediate-fit patients with newly diagnosed multiple myeloma.",
          "mesh_heading": [
            "Multiple Myeloma"
          ],
          "position": {
            "Annalisa Bernardini": 13,
            "Gianluca Gaidano": 3
          }
        },
        "to": 203411
      },
      {
        "from": 156088,
        "label": {
          "article": "Dose/schedule-adjusted Rd-R vs continuous Rd for elderly, intermediate-fit patients with newly diagnosed multiple myeloma.",
          "mesh_heading": [
            "Multiple Myeloma"
          ],
          "position": {
            "Annalisa Bernardini": 13,
            "Elisabetta Antonioli": 14
          }
        },
        "to": 156089
      },
      {
        "from": 156088,
        "label": {
          "article": "Dose/schedule-adjusted Rd-R vs continuous Rd for elderly, intermediate-fit patients with newly diagnosed multiple myeloma.",
          "mesh_heading": [
            "Multiple Myeloma"
          ],
          "position": {
            "Annalisa Bernardini": 13,
            "Nicola Cascavilla": 6
          }
        },
        "to": 156081
      },
      {
        "from": 156088,
        "label": {
          "article": "Dose/schedule-adjusted Rd-R vs continuous Rd for elderly, intermediate-fit patients with newly diagnosed multiple myeloma.",
          "mesh_heading": [
            "Multiple Myeloma"
          ],
          "position": {
            "Annalisa Bernardini": 13,
            "Delia Rota-Scalabrini": 15
          }
        },
        "to": 156090
      },
      {
        "from": 162566,
        "label": {
          "article": "KDM5 inhibition offers a novel therapeutic strategy for the treatment of KMT2D mutant lymphomas.",
          "mesh_heading": [
            "Loss of Function Mutation"
          ],
          "position": {
            "Annalisa D'Avola": 3,
            "Emil Kumar": 15
          }
        },
        "to": 162578
      },
      {
        "from": 162566,
        "label": {
          "article": "KDM5 inhibition offers a novel therapeutic strategy for the treatment of KMT2D mutant lymphomas.",
          "mesh_heading": [
            "Loss of Function Mutation"
          ],
          "position": {
            "Alison Yeomans": 5,
            "Annalisa D'Avola": 3
          }
        },
        "to": 162568
      },
      {
        "from": 162566,
        "label": {
          "article": "KDM5 inhibition offers a novel therapeutic strategy for the treatment of KMT2D mutant lymphomas.",
          "mesh_heading": [
            "Loss of Function Mutation"
          ],
          "position": {
            "Annalisa D'Avola": 3,
            "Ari Melnick": 25
          }
        },
        "to": 188497
      },
      {
        "from": 162566,
        "label": {
          "article": "KDM5 inhibition offers a novel therapeutic strategy for the treatment of KMT2D mutant lymphomas.",
          "mesh_heading": [
            "Loss of Function Mutation"
          ],
          "position": {
            "Annalisa D'Avola": 3,
            "Peter Johnson": 20
          }
        },
        "to": 162583
      },
      {
        "from": 162566,
        "label": {
          "article": "KDM5 inhibition offers a novel therapeutic strategy for the treatment of KMT2D mutant lymphomas.",
          "mesh_heading": [
            "Loss of Function Mutation"
          ],
          "position": {
            "Andrew Clear": 18,
            "Annalisa D'Avola": 3
          }
        },
        "to": 162581
      },
      {
        "from": 162566,
        "label": {
          "article": "KDM5 inhibition offers a novel therapeutic strategy for the treatment of KMT2D mutant lymphomas.",
          "mesh_heading": [
            "Loss of Function Mutation"
          ],
          "position": {
            "Annalisa D'Avola": 3,
            "Pedro Cutillas": 22
          }
        },
        "to": 162585
      },
      {
        "from": 162566,
        "label": {
          "article": "KDM5 inhibition offers a novel therapeutic strategy for the treatment of KMT2D mutant lymphomas.",
          "mesh_heading": [
            "Loss of Function Mutation"
          ],
          "position": {
            "Annalisa D'Avola": 3,
            "Graham Packham": 26
          }
        },
        "to": 162589
      },
      {
        "from": 162566,
        "label": {
          "article": "KDM5 inhibition offers a novel therapeutic strategy for the treatment of KMT2D mutant lymphomas.",
          "mesh_heading": [
            "Loss of Function Mutation"
          ],
          "position": {
            "Annalisa D'Avola": 3,
            "Sameena Iqbal": 13
          }
        },
        "to": 162576
      },
      {
        "from": 162566,
        "label": {
          "article": "KDM5 inhibition offers a novel therapeutic strategy for the treatment of KMT2D mutant lymphomas.",
          "mesh_heading": [
            "Loss of Function Mutation"
          ],
          "position": {
            "Annalisa D'Avola": 3,
            "John Gribben": 19
          }
        },
        "to": 162582
      },
      {
        "from": 162566,
        "label": {
          "article": "KDM5 inhibition offers a novel therapeutic strategy for the treatment of KMT2D mutant lymphomas.",
          "mesh_heading": [
            "Loss of Function Mutation"
          ],
          "position": {
            "Annalisa D'Avola": 3,
            "Martin Philpott": 6
          }
        },
        "to": 162569
      },
      {
        "from": 162566,
        "label": {
          "article": "KDM5 inhibition offers a novel therapeutic strategy for the treatment of KMT2D mutant lymphomas.",
          "mesh_heading": [
            "Loss of Function Mutation"
          ],
          "position": {
            "Annalisa D'Avola": 3,
            "Lola Konali": 2
          }
        },
        "to": 162565
      },
      {
        "from": 162566,
        "label": {
          "article": "KDM5 inhibition offers a novel therapeutic strategy for the treatment of KMT2D mutant lymphomas.",
          "mesh_heading": [
            "Loss of Function Mutation"
          ],
          "position": {
            "Annalisa D'Avola": 3,
            "Karina Close": 4
          }
        },
        "to": 162567
      },
      {
        "from": 162566,
        "label": {
          "article": "KDM5 inhibition offers a novel therapeutic strategy for the treatment of KMT2D mutant lymphomas.",
          "mesh_heading": [
            "Loss of Function Mutation"
          ],
          "position": {
            "Annalisa D'Avola": 3,
            "Udo Oppermann": 24
          }
        },
        "to": 162587
      },
      {
        "from": 162566,
        "label": {
          "article": "KDM5 inhibition offers a novel therapeutic strategy for the treatment of KMT2D mutant lymphomas.",
          "mesh_heading": [
            "Loss of Function Mutation"
          ],
          "position": {
            "Annalisa D'Avola": 3,
            "Jessica Okosun": 23
          }
        },
        "to": 162586
      },
      {
        "from": 162566,
        "label": {
          "article": "KDM5 inhibition offers a novel therapeutic strategy for the treatment of KMT2D mutant lymphomas.",
          "mesh_heading": [
            "Loss of Function Mutation"
          ],
          "position": {
            "Annalisa D'Avola": 3,
            "Koorosh Korfi": 11
          }
        },
        "to": 162574
      },
      {
        "from": 162566,
        "label": {
          "article": "KDM5 inhibition offers a novel therapeutic strategy for the treatment of KMT2D mutant lymphomas.",
          "mesh_heading": [
            "Loss of Function Mutation"
          ],
          "position": {
            "Annalisa D'Avola": 3,
            "Findlay Bewicke-Copley": 14
          }
        },
        "to": 162577
      },
      {
        "from": 162566,
        "label": {
          "article": "KDM5 inhibition offers a novel therapeutic strategy for the treatment of KMT2D mutant lymphomas.",
          "mesh_heading": [
            "Loss of Function Mutation"
          ],
          "position": {
            "Ahad F Al Seraihi": 9,
            "Annalisa D'Avola": 3
          }
        },
        "to": 162572
      },
      {
        "from": 162566,
        "label": {
          "article": "KDM5 inhibition offers a novel therapeutic strategy for the treatment of KMT2D mutant lymphomas.",
          "mesh_heading": [
            "Loss of Function Mutation"
          ],
          "position": {
            "Annalisa D'Avola": 3,
            "Shamzah Araf": 12
          }
        },
        "to": 162575
      },
      {
        "from": 162566,
        "label": {
          "article": "KDM5 inhibition offers a novel therapeutic strategy for the treatment of KMT2D mutant lymphomas.",
          "mesh_heading": [
            "Loss of Function Mutation"
          ],
          "position": {
            "Annalisa D'Avola": 3,
            "Darko Barisic": 16
          }
        },
        "to": 162579
      },
      {
        "from": 162566,
        "label": {
          "article": "KDM5 inhibition offers a novel therapeutic strategy for the treatment of KMT2D mutant lymphomas.",
          "mesh_heading": [
            "Loss of Function Mutation"
          ],
          "position": {
            "Annalisa D'Avola": 3,
            "James Dunford": 7
          }
        },
        "to": 162570
      },
      {
        "from": 162566,
        "label": {
          "article": "KDM5 inhibition offers a novel therapeutic strategy for the treatment of KMT2D mutant lymphomas.",
          "mesh_heading": [
            "Loss of Function Mutation"
          ],
          "position": {
            "Annalisa D'Avola": 3,
            "Jun Wang": 10
          }
        },
        "to": 239778
      },
      {
        "from": 162566,
        "label": {
          "article": "KDM5 inhibition offers a novel therapeutic strategy for the treatment of KMT2D mutant lymphomas.",
          "mesh_heading": [
            "Loss of Function Mutation"
          ],
          "position": {
            "Annalisa D'Avola": 3,
            "Tahrima Rahim": 8
          }
        },
        "to": 162571
      },
      {
        "from": 162566,
        "label": {
          "article": "KDM5 inhibition offers a novel therapeutic strategy for the treatment of KMT2D mutant lymphomas.",
          "mesh_heading": [
            "Loss of Function Mutation"
          ],
          "position": {
            "Annalisa D'Avola": 3,
            "Maria Calaminici": 17
          }
        },
        "to": 162580
      },
      {
        "from": 162566,
        "label": {
          "article": "KDM5 inhibition offers a novel therapeutic strategy for the treatment of KMT2D mutant lymphomas.",
          "mesh_heading": [
            "Loss of Function Mutation"
          ],
          "position": {
            "Annalisa D'Avola": 3,
            "James Heward": 1
          }
        },
        "to": 162564
      },
      {
        "from": 162566,
        "label": {
          "article": "KDM5 inhibition offers a novel therapeutic strategy for the treatment of KMT2D mutant lymphomas.",
          "mesh_heading": [
            "Loss of Function Mutation"
          ],
          "position": {
            "Annalisa D'Avola": 3,
            "Jude Fitzgibbon": 27
          }
        },
        "to": 162590
      },
      {
        "from": 162566,
        "label": {
          "article": "KDM5 inhibition offers a novel therapeutic strategy for the treatment of KMT2D mutant lymphomas.",
          "mesh_heading": [
            "Loss of Function Mutation"
          ],
          "position": {
            "Annalisa D'Avola": 3,
            "Richard Neve": 21
          }
        },
        "to": 162584
      },
      {
        "from": 89698,
        "label": {
          "article": "Sézary Syndrome: a clinico-pathological study of 9 cases.",
          "mesh_heading": [
            "Sezary Syndrome",
            "Skin Neoplasms",
            "Lymphoma, T-Cell, Cutaneous",
            "Photopheresis"
          ],
          "position": {
            "Annalisa DE Silvestri": 3,
            "Stefania Barruscotti": 2
          }
        },
        "to": 89697
      },
      {
        "from": 89698,
        "label": {
          "article": "Sézary Syndrome: a clinico-pathological study of 9 cases.",
          "mesh_heading": [
            "Sezary Syndrome",
            "Skin Neoplasms",
            "Lymphoma, T-Cell, Cutaneous",
            "Photopheresis"
          ],
          "position": {
            "Annalisa DE Silvestri": 3,
            "Vittorio Bolcato": 1
          }
        },
        "to": 89696
      },
      {
        "from": 89698,
        "label": {
          "article": "Sézary Syndrome: a clinico-pathological study of 9 cases.",
          "mesh_heading": [
            "Sezary Syndrome",
            "Skin Neoplasms",
            "Lymphoma, T-Cell, Cutaneous",
            "Photopheresis"
          ],
          "position": {
            "Annalisa DE Silvestri": 3,
            "Carlo F Tomasini": 4
          }
        },
        "to": 89699
      },
      {
        "from": 89698,
        "label": {
          "article": "Sézary Syndrome: a clinico-pathological study of 9 cases.",
          "mesh_heading": [
            "Sezary Syndrome",
            "Skin Neoplasms",
            "Lymphoma, T-Cell, Cutaneous",
            "Photopheresis"
          ],
          "position": {
            "Annalisa DE Silvestri": 3,
            "Valeria Brazzelli": 5
          }
        },
        "to": 118621
      },
      {
        "from": 146917,
        "label": {
          "article": "Lipedematous alopecia of the scalp in a Caucasian man: an atypical presentation.",
          "mesh_heading": [
            "Scalp Dermatoses",
            "Lipedema"
          ],
          "position": {
            "Alessia Barisani": 2,
            "Annalisa Patrizi": 5
          }
        },
        "to": 146915
      },
      {
        "from": 146917,
        "label": {
          "article": "Lipedematous alopecia of the scalp in a Caucasian man: an atypical presentation.",
          "mesh_heading": [
            "Scalp Dermatoses",
            "Lipedema"
          ],
          "position": {
            "Annalisa Patrizi": 5,
            "Iria Neri": 1
          }
        },
        "to": 52368
      },
      {
        "from": 146917,
        "label": {
          "article": "Lipedematous alopecia of the scalp in a Caucasian man: an atypical presentation.",
          "mesh_heading": [
            "Scalp Dermatoses",
            "Lipedema"
          ],
          "position": {
            "Annalisa Patrizi": 5,
            "Carlotta Baraldi": 3
          }
        },
        "to": 146914
      },
      {
        "from": 146917,
        "label": {
          "article": "Lipedematous alopecia of the scalp in a Caucasian man: an atypical presentation.",
          "mesh_heading": [
            "Scalp Dermatoses",
            "Lipedema"
          ],
          "position": {
            "Annalisa Patrizi": 5,
            "Pier A Fanti": 4
          }
        },
        "to": 52371
      },
      {
        "from": 146917,
        "label": {
          "article": "Iatrogenic Kaposi sarcoma during tumor necrosis factor alpha inhibitors.",
          "mesh_heading": [
            "Sarcoma, Kaposi",
            "Skin Neoplasms",
            "Herpesvirus 8, Human"
          ],
          "position": {
            "Andrea Belluzzi": 4,
            "Annalisa Patrizi": 6
          }
        },
        "to": 68002
      },
      {
        "from": 146917,
        "label": {
          "article": "Iatrogenic Kaposi sarcoma during tumor necrosis factor alpha inhibitors.",
          "mesh_heading": [
            "Sarcoma, Kaposi",
            "Skin Neoplasms",
            "Herpesvirus 8, Human"
          ],
          "position": {
            "Annalisa Patrizi": 6,
            "Clara Bertuzzi": 2
          }
        },
        "to": 68000
      },
      {
        "from": 146917,
        "label": {
          "article": "Iatrogenic Kaposi sarcoma during tumor necrosis factor alpha inhibitors.",
          "mesh_heading": [
            "Sarcoma, Kaposi",
            "Skin Neoplasms",
            "Herpesvirus 8, Human"
          ],
          "position": {
            "Alba Guglielmo": 1,
            "Annalisa Patrizi": 6
          }
        },
        "to": 67999
      },
      {
        "from": 146917,
        "label": {
          "article": "Iatrogenic Kaposi sarcoma during tumor necrosis factor alpha inhibitors.",
          "mesh_heading": [
            "Sarcoma, Kaposi",
            "Skin Neoplasms",
            "Herpesvirus 8, Human"
          ],
          "position": {
            "Annalisa Patrizi": 6,
            "Eleonora Scaioli": 3
          }
        },
        "to": 68001
      },
      {
        "from": 146917,
        "label": {
          "article": "Iatrogenic Kaposi sarcoma during tumor necrosis factor alpha inhibitors.",
          "mesh_heading": [
            "Sarcoma, Kaposi",
            "Skin Neoplasms",
            "Herpesvirus 8, Human"
          ],
          "position": {
            "Annalisa Patrizi": 6,
            "Elena Sabattini": 5
          }
        },
        "to": 68003
      },
      {
        "from": 146917,
        "label": {
          "article": "Iatrogenic Kaposi sarcoma during tumor necrosis factor alpha inhibitors.",
          "mesh_heading": [
            "Sarcoma, Kaposi",
            "Skin Neoplasms",
            "Herpesvirus 8, Human"
          ],
          "position": {
            "Alessandro Pileri": 7,
            "Annalisa Patrizi": 6
          }
        },
        "to": 118637
      },
      {
        "from": 146917,
        "label": {
          "article": "Second neoplasm in cutaneous T-cell lymphoma patients: a marker of worse prognosis?",
          "mesh_heading": [
            "Mycosis Fungoides",
            "Skin Neoplasms",
            "Lymphoma, T-Cell, Cutaneous",
            "Neoplasms, Second Primary"
          ],
          "position": {
            "Annalisa Patrizi": 5,
            "Fabio Fuligni": 3
          }
        },
        "to": 1668
      },
      {
        "from": 146917,
        "label": {
          "article": "Second neoplasm in cutaneous T-cell lymphoma patients: a marker of worse prognosis?",
          "mesh_heading": [
            "Mycosis Fungoides",
            "Skin Neoplasms",
            "Lymphoma, T-Cell, Cutaneous",
            "Neoplasms, Second Primary"
          ],
          "position": {
            "Annalisa Patrizi": 5,
            "Italian Lymphoma Foundation (FIL) - Cutaneous Lymphoma Task Force": 7
          }
        },
        "to": 1672
      },
      {
        "from": 146917,
        "label": {
          "article": "Second neoplasm in cutaneous T-cell lymphoma patients: a marker of worse prognosis?",
          "mesh_heading": [
            "Mycosis Fungoides",
            "Skin Neoplasms",
            "Lymphoma, T-Cell, Cutaneous",
            "Neoplasms, Second Primary"
          ],
          "position": {
            "Annalisa Patrizi": 5,
            "Nicola Pimpinelli": 6
          }
        },
        "to": 118647
      },
      {
        "from": 146917,
        "label": {
          "article": "Second neoplasm in cutaneous T-cell lymphoma patients: a marker of worse prognosis?",
          "mesh_heading": [
            "Mycosis Fungoides",
            "Skin Neoplasms",
            "Lymphoma, T-Cell, Cutaneous",
            "Neoplasms, Second Primary"
          ],
          "position": {
            "Alba Guglielmo": 2,
            "Annalisa Patrizi": 5
          }
        },
        "to": 67999
      },
      {
        "from": 146917,
        "label": {
          "article": "Second neoplasm in cutaneous T-cell lymphoma patients: a marker of worse prognosis?",
          "mesh_heading": [
            "Mycosis Fungoides",
            "Skin Neoplasms",
            "Lymphoma, T-Cell, Cutaneous",
            "Neoplasms, Second Primary"
          ],
          "position": {
            "Alessandro Pileri": 1,
            "Annalisa Patrizi": 5
          }
        },
        "to": 118637
      },
      {
        "from": 146917,
        "label": {
          "article": "Second neoplasm in cutaneous T-cell lymphoma patients: a marker of worse prognosis?",
          "mesh_heading": [
            "Mycosis Fungoides",
            "Skin Neoplasms",
            "Lymphoma, T-Cell, Cutaneous",
            "Neoplasms, Second Primary"
          ],
          "position": {
            "Annalisa Patrizi": 5,
            "Irene Lastrucci": 4
          }
        },
        "to": 3847
      },
      {
        "from": 146917,
        "label": {
          "article": "Atopic dermatitis and mycosis fungoides in a child: an overlooked association.",
          "mesh_heading": [
            "Dermatitis, Atopic",
            "Eczema",
            "Mycosis Fungoides",
            "Skin Neoplasms"
          ],
          "position": {
            "Andrea Sechi": 1,
            "Annalisa Patrizi": 3
          }
        },
        "to": 6390
      },
      {
        "from": 146917,
        "label": {
          "article": "Atopic dermatitis and mycosis fungoides in a child: an overlooked association.",
          "mesh_heading": [
            "Dermatitis, Atopic",
            "Eczema",
            "Mycosis Fungoides",
            "Skin Neoplasms"
          ],
          "position": {
            "Annalisa Patrizi": 3,
            "Clara Bertuzzi": 4
          }
        },
        "to": 68000
      },
      {
        "from": 146917,
        "label": {
          "article": "Atopic dermatitis and mycosis fungoides in a child: an overlooked association.",
          "mesh_heading": [
            "Dermatitis, Atopic",
            "Eczema",
            "Mycosis Fungoides",
            "Skin Neoplasms"
          ],
          "position": {
            "Annalisa Patrizi": 3,
            "Iria Neri": 5
          }
        },
        "to": 52368
      },
      {
        "from": 146917,
        "label": {
          "article": "Atopic dermatitis and mycosis fungoides in a child: an overlooked association.",
          "mesh_heading": [
            "Dermatitis, Atopic",
            "Eczema",
            "Mycosis Fungoides",
            "Skin Neoplasms"
          ],
          "position": {
            "Alba Guglielmo": 2,
            "Annalisa Patrizi": 3
          }
        },
        "to": 67999
      },
      {
        "from": 146917,
        "label": {
          "article": "Atopic dermatitis and mycosis fungoides in a child: an overlooked association.",
          "mesh_heading": [
            "Dermatitis, Atopic",
            "Eczema",
            "Mycosis Fungoides",
            "Skin Neoplasms"
          ],
          "position": {
            "Alessandro Pileri": 6,
            "Annalisa Patrizi": 3
          }
        },
        "to": 118637
      },
      {
        "from": 146917,
        "label": {
          "article": "A retrospective study on clinical subtypes and management of morphea in 10 Italian Dermatological Units.",
          "mesh_heading": [
            "Facial Hemiatrophy",
            "Scleroderma, Localized"
          ],
          "position": {
            "Andrea Diociaiuti": 4,
            "Annalisa Patrizi": 2
          }
        },
        "to": 4199
      },
      {
        "from": 146917,
        "label": {
          "article": "A retrospective study on clinical subtypes and management of morphea in 10 Italian Dermatological Units.",
          "mesh_heading": [
            "Facial Hemiatrophy",
            "Scleroderma, Localized"
          ],
          "position": {
            "Annalisa Patrizi": 2,
            "Donatella Schena": 6
          }
        },
        "to": 4201
      },
      {
        "from": 146917,
        "label": {
          "article": "A retrospective study on clinical subtypes and management of morphea in 10 Italian Dermatological Units.",
          "mesh_heading": [
            "Facial Hemiatrophy",
            "Scleroderma, Localized"
          ],
          "position": {
            "Annalisa Patrizi": 2,
            "Valeria Brazzelli": 9
          }
        },
        "to": 118621
      },
      {
        "from": 146917,
        "label": {
          "article": "A retrospective study on clinical subtypes and management of morphea in 10 Italian Dermatological Units.",
          "mesh_heading": [
            "Facial Hemiatrophy",
            "Scleroderma, Localized"
          ],
          "position": {
            "Anna Belloni Fortina": 10,
            "Annalisa Patrizi": 2
          }
        },
        "to": 4205
      },
      {
        "from": 146917,
        "label": {
          "article": "A retrospective study on clinical subtypes and management of morphea in 10 Italian Dermatological Units.",
          "mesh_heading": [
            "Facial Hemiatrophy",
            "Scleroderma, Localized"
          ],
          "position": {
            "Annalisa Patrizi": 2,
            "Patrizia Pepe": 11
          }
        },
        "to": 4206
      },
      {
        "from": 146917,
        "label": {
          "article": "A retrospective study on clinical subtypes and management of morphea in 10 Italian Dermatological Units.",
          "mesh_heading": [
            "Facial Hemiatrophy",
            "Scleroderma, Localized"
          ],
          "position": {
            "Annalisa Patrizi": 2,
            "May El Hachem": 5
          }
        },
        "to": 4200
      },
      {
        "from": 146917,
        "label": {
          "article": "A retrospective study on clinical subtypes and management of morphea in 10 Italian Dermatological Units.",
          "mesh_heading": [
            "Facial Hemiatrophy",
            "Scleroderma, Localized"
          ],
          "position": {
            "Andrea Bassi": 7,
            "Annalisa Patrizi": 2
          }
        },
        "to": 117181
      },
      {
        "from": 146917,
        "label": {
          "article": "A retrospective study on clinical subtypes and management of morphea in 10 Italian Dermatological Units.",
          "mesh_heading": [
            "Facial Hemiatrophy",
            "Scleroderma, Localized"
          ],
          "position": {
            "Annalisa Patrizi": 2,
            "Annalucia Virdi": 1
          }
        },
        "to": 6393
      },
      {
        "from": 146917,
        "label": {
          "article": "A retrospective study on clinical subtypes and management of morphea in 10 Italian Dermatological Units.",
          "mesh_heading": [
            "Facial Hemiatrophy",
            "Scleroderma, Localized"
          ],
          "position": {
            "Annalisa Patrizi": 2,
            "Stefano Cambiaghi": 3
          }
        },
        "to": 4198
      },
      {
        "from": 146917,
        "label": {
          "article": "A retrospective study on clinical subtypes and management of morphea in 10 Italian Dermatological Units.",
          "mesh_heading": [
            "Facial Hemiatrophy",
            "Scleroderma, Localized"
          ],
          "position": {
            "Annalisa Patrizi": 2,
            "Domenico Bonamonte": 8
          }
        },
        "to": 4203
      },
      {
        "from": 146917,
        "label": {
          "article": "A retrospective study on clinical subtypes and management of morphea in 10 Italian Dermatological Units.",
          "mesh_heading": [
            "Facial Hemiatrophy",
            "Scleroderma, Localized"
          ],
          "position": {
            "Annalisa Patrizi": 2,
            "Iria Neri": 13
          }
        },
        "to": 52368
      },
      {
        "from": 146917,
        "label": {
          "article": "A retrospective study on clinical subtypes and management of morphea in 10 Italian Dermatological Units.",
          "mesh_heading": [
            "Facial Hemiatrophy",
            "Scleroderma, Localized"
          ],
          "position": {
            "Annalisa Patrizi": 2,
            "Vito DI Lernia": 12
          }
        },
        "to": 4207
      },
      {
        "from": 146917,
        "label": {
          "article": "Does ethnic psoriasis exist?",
          "mesh_heading": [
            "Psoriasis"
          ],
          "position": {
            "Annalisa Patrizi": 4,
            "Federico Bardazzi": 5
          }
        },
        "to": 5599
      },
      {
        "from": 146917,
        "label": {
          "article": "Does ethnic psoriasis exist?",
          "mesh_heading": [
            "Psoriasis"
          ],
          "position": {
            "Annalisa Patrizi": 4,
            "Miriam Leuzzi": 2
          }
        },
        "to": 6394
      },
      {
        "from": 146917,
        "label": {
          "article": "Does ethnic psoriasis exist?",
          "mesh_heading": [
            "Psoriasis"
          ],
          "position": {
            "Ambra DI Altobrando": 1,
            "Annalisa Patrizi": 4
          }
        },
        "to": 5595
      },
      {
        "from": 146917,
        "label": {
          "article": "Does ethnic psoriasis exist?",
          "mesh_heading": [
            "Psoriasis"
          ],
          "position": {
            "Annalisa Patrizi": 4,
            "Diego Abbenante": 3
          }
        },
        "to": 5597
      },
      {
        "from": 146917,
        "label": {
          "article": "Trauma-induced bullous pemphigoid mimicking fracture blisters.",
          "mesh_heading": [
            "Pemphigoid, Bullous",
            "Skin Diseases"
          ],
          "position": {
            "Annalisa Patrizi": 5,
            "Federico Bardazzi": 6
          }
        },
        "to": 5599
      },
      {
        "from": 146917,
        "label": {
          "article": "Trauma-induced bullous pemphigoid mimicking fracture blisters.",
          "mesh_heading": [
            "Pemphigoid, Bullous",
            "Skin Diseases"
          ],
          "position": {
            "Annalisa Patrizi": 5,
            "Diego Abbenante": 1
          }
        },
        "to": 5597
      },
      {
        "from": 146917,
        "label": {
          "article": "Trauma-induced bullous pemphigoid mimicking fracture blisters.",
          "mesh_heading": [
            "Pemphigoid, Bullous",
            "Skin Diseases"
          ],
          "position": {
            "Annalisa Patrizi": 5,
            "Camilla Loi": 4
          }
        },
        "to": 4703
      },
      {
        "from": 146917,
        "label": {
          "article": "Trauma-induced bullous pemphigoid mimicking fracture blisters.",
          "mesh_heading": [
            "Pemphigoid, Bullous",
            "Skin Diseases"
          ],
          "position": {
            "Annalisa Patrizi": 5,
            "Beatrice Raone": 2
          }
        },
        "to": 4701
      },
      {
        "from": 146917,
        "label": {
          "article": "Trauma-induced bullous pemphigoid mimicking fracture blisters.",
          "mesh_heading": [
            "Pemphigoid, Bullous",
            "Skin Diseases"
          ],
          "position": {
            "Annalisa Patrizi": 5,
            "Carlotta Baraldi": 3
          }
        },
        "to": 146914
      },
      {
        "from": 146917,
        "label": {
          "article": "Pigmented purpuric dermatoses: analysis of epidemiological, clinical and histopathological aspects in relation to the prognosis of 70 patients, including infants and adults.",
          "mesh_heading": [
            "Keratosis",
            "Pigmentation Disorders",
            "Purpura"
          ],
          "position": {
            "Annalisa Patrizi": 10,
            "Carlotta Baraldi": 4
          }
        },
        "to": 146914
      },
      {
        "from": 146917,
        "label": {
          "article": "Pigmented purpuric dermatoses: analysis of epidemiological, clinical and histopathological aspects in relation to the prognosis of 70 patients, including infants and adults.",
          "mesh_heading": [
            "Keratosis",
            "Pigmentation Disorders",
            "Purpura"
          ],
          "position": {
            "Annalisa Patrizi": 10,
            "Fabio Guaraldi": 6
          }
        },
        "to": 1650
      },
      {
        "from": 146917,
        "label": {
          "article": "Pigmented purpuric dermatoses: analysis of epidemiological, clinical and histopathological aspects in relation to the prognosis of 70 patients, including infants and adults.",
          "mesh_heading": [
            "Keratosis",
            "Pigmentation Disorders",
            "Purpura"
          ],
          "position": {
            "Annalisa Patrizi": 10,
            "Elisa Varotti": 7
          }
        },
        "to": 1651
      },
      {
        "from": 146917,
        "label": {
          "article": "Pigmented purpuric dermatoses: analysis of epidemiological, clinical and histopathological aspects in relation to the prognosis of 70 patients, including infants and adults.",
          "mesh_heading": [
            "Keratosis",
            "Pigmentation Disorders",
            "Purpura"
          ],
          "position": {
            "Ada Dormi": 8,
            "Annalisa Patrizi": 10
          }
        },
        "to": 21686
      },
      {
        "from": 146917,
        "label": {
          "article": "Pigmented purpuric dermatoses: analysis of epidemiological, clinical and histopathological aspects in relation to the prognosis of 70 patients, including infants and adults.",
          "mesh_heading": [
            "Keratosis",
            "Pigmentation Disorders",
            "Purpura"
          ],
          "position": {
            "Annalisa Patrizi": 10,
            "Cosimo Misciali": 3
          }
        },
        "to": 56831
      },
      {
        "from": 146917,
        "label": {
          "article": "Pigmented purpuric dermatoses: analysis of epidemiological, clinical and histopathological aspects in relation to the prognosis of 70 patients, including infants and adults.",
          "mesh_heading": [
            "Keratosis",
            "Pigmentation Disorders",
            "Purpura"
          ],
          "position": {
            "Annalisa Patrizi": 10,
            "Lidia Sacchelli": 1
          }
        },
        "to": 4223
      },
      {
        "from": 146917,
        "label": {
          "article": "Pigmented purpuric dermatoses: analysis of epidemiological, clinical and histopathological aspects in relation to the prognosis of 70 patients, including infants and adults.",
          "mesh_heading": [
            "Keratosis",
            "Pigmentation Disorders",
            "Purpura"
          ],
          "position": {
            "Ambra DI Altobrando": 2,
            "Annalisa Patrizi": 10
          }
        },
        "to": 5595
      },
      {
        "from": 146917,
        "label": {
          "article": "Pigmented purpuric dermatoses: analysis of epidemiological, clinical and histopathological aspects in relation to the prognosis of 70 patients, including infants and adults.",
          "mesh_heading": [
            "Keratosis",
            "Pigmentation Disorders",
            "Purpura"
          ],
          "position": {
            "Andrea Sechi": 5,
            "Annalisa Patrizi": 10
          }
        },
        "to": 6390
      },
      {
        "from": 146917,
        "label": {
          "article": "Pigmented purpuric dermatoses: analysis of epidemiological, clinical and histopathological aspects in relation to the prognosis of 70 patients, including infants and adults.",
          "mesh_heading": [
            "Keratosis",
            "Pigmentation Disorders",
            "Purpura"
          ],
          "position": {
            "Annalisa Patrizi": 10,
            "Elena Nardi": 9
          }
        },
        "to": 1653
      },
      {
        "from": 146917,
        "label": {
          "article": "Bartholin's gland cysts: dermoscopic clues and differential diagnosis.",
          "mesh_heading": [
            "Bartholin's Glands",
            "Cysts",
            "Vulvar Diseases"
          ],
          "position": {
            "Annalisa Patrizi": 5,
            "Giulio Tosti": 3
          }
        },
        "to": 4840
      },
      {
        "from": 146917,
        "label": {
          "article": "Bartholin's gland cysts: dermoscopic clues and differential diagnosis.",
          "mesh_heading": [
            "Bartholin's Glands",
            "Cysts",
            "Vulvar Diseases"
          ],
          "position": {
            "Annalisa Patrizi": 5,
            "Sabina Vaccari": 6
          }
        },
        "to": 4843
      },
      {
        "from": 146917,
        "label": {
          "article": "Bartholin's gland cysts: dermoscopic clues and differential diagnosis.",
          "mesh_heading": [
            "Bartholin's Glands",
            "Cysts",
            "Vulvar Diseases"
          ],
          "position": {
            "Annalisa Patrizi": 5,
            "Valeria Evangelista": 1
          }
        },
        "to": 4838
      },
      {
        "from": 146917,
        "label": {
          "article": "Bartholin's gland cysts: dermoscopic clues and differential diagnosis.",
          "mesh_heading": [
            "Bartholin's Glands",
            "Cysts",
            "Vulvar Diseases"
          ],
          "position": {
            "Alessia Barisani": 2,
            "Annalisa Patrizi": 5
          }
        },
        "to": 146915
      },
      {
        "from": 146917,
        "label": {
          "article": "Bartholin's gland cysts: dermoscopic clues and differential diagnosis.",
          "mesh_heading": [
            "Bartholin's Glands",
            "Cysts",
            "Vulvar Diseases"
          ],
          "position": {
            "Annalisa Patrizi": 5,
            "Carlotta Baraldi": 4
          }
        },
        "to": 146914
      },
      {
        "from": 146917,
        "label": {
          "article": "Recalcitrant oral involvement in pemphigus vulgaris successfully treated with platelet-rich plasma.",
          "mesh_heading": [
            "Pemphigus",
            "Platelet-Rich Plasma"
          ],
          "position": {
            "Annalisa Patrizi": 5,
            "Federica Filippi": 4
          }
        },
        "to": 5606
      },
      {
        "from": 146917,
        "label": {
          "article": "Recalcitrant oral involvement in pemphigus vulgaris successfully treated with platelet-rich plasma.",
          "mesh_heading": [
            "Pemphigus",
            "Platelet-Rich Plasma"
          ],
          "position": {
            "Annalisa Patrizi": 5,
            "Ivano Iozzo": 6
          }
        },
        "to": 4227
      },
      {
        "from": 146917,
        "label": {
          "article": "Recalcitrant oral involvement in pemphigus vulgaris successfully treated with platelet-rich plasma.",
          "mesh_heading": [
            "Pemphigus",
            "Platelet-Rich Plasma"
          ],
          "position": {
            "Annalisa Patrizi": 5,
            "Riccardo Balestri": 3
          }
        },
        "to": 4224
      },
      {
        "from": 146917,
        "label": {
          "article": "Recalcitrant oral involvement in pemphigus vulgaris successfully treated with platelet-rich plasma.",
          "mesh_heading": [
            "Pemphigus",
            "Platelet-Rich Plasma"
          ],
          "position": {
            "Annalisa Patrizi": 5,
            "Federico Bardazzi": 1
          }
        },
        "to": 5599
      },
      {
        "from": 146917,
        "label": {
          "article": "Recalcitrant oral involvement in pemphigus vulgaris successfully treated with platelet-rich plasma.",
          "mesh_heading": [
            "Pemphigus",
            "Platelet-Rich Plasma"
          ],
          "position": {
            "Annalisa Patrizi": 5,
            "Lidia Sacchelli": 2
          }
        },
        "to": 4223
      },
      {
        "from": 146917,
        "label": {
          "article": "Recalcitrant oral involvement in pemphigus vulgaris successfully treated with platelet-rich plasma.",
          "mesh_heading": [
            "Pemphigus",
            "Platelet-Rich Plasma"
          ],
          "position": {
            "Annalisa Patrizi": 5,
            "Camilla Loi": 7
          }
        },
        "to": 4703
      },
      {
        "from": 146917,
        "label": {
          "article": "Helicobacter pylori infection in psoriatic patients during biological therapy.",
          "mesh_heading": [
            "Helicobacter pylori",
            "Helicobacter Infections"
          ],
          "position": {
            "Annalisa Patrizi": 7,
            "Michela Magnano": 2
          }
        },
        "to": 2054
      },
      {
        "from": 146917,
        "label": {
          "article": "Helicobacter pylori infection in psoriatic patients during biological therapy.",
          "mesh_heading": [
            "Helicobacter pylori",
            "Helicobacter Infections"
          ],
          "position": {
            "Annalisa Patrizi": 7,
            "Gabriele Bertusi": 6
          }
        },
        "to": 2058
      },
      {
        "from": 146917,
        "label": {
          "article": "Helicobacter pylori infection in psoriatic patients during biological therapy.",
          "mesh_heading": [
            "Helicobacter pylori",
            "Helicobacter Infections"
          ],
          "position": {
            "Annalisa Patrizi": 7,
            "Giulia Odorici": 5
          }
        },
        "to": 2057
      },
      {
        "from": 146917,
        "label": {
          "article": "Helicobacter pylori infection in psoriatic patients during biological therapy.",
          "mesh_heading": [
            "Helicobacter pylori",
            "Helicobacter Infections"
          ],
          "position": {
            "Annalisa Patrizi": 7,
            "Giulia Fiorini": 3
          }
        },
        "to": 2055
      },
      {
        "from": 146917,
        "label": {
          "article": "Helicobacter pylori infection in psoriatic patients during biological therapy.",
          "mesh_heading": [
            "Helicobacter pylori",
            "Helicobacter Infections"
          ],
          "position": {
            "Annalisa Patrizi": 7,
            "Federico Bardazzi": 1
          }
        },
        "to": 5599
      },
      {
        "from": 146917,
        "label": {
          "article": "Helicobacter pylori infection in psoriatic patients during biological therapy.",
          "mesh_heading": [
            "Helicobacter pylori",
            "Helicobacter Infections"
          ],
          "position": {
            "Annalisa Patrizi": 7,
            "Dino Vaira": 4
          }
        },
        "to": 2056
      },
      {
        "from": 146917,
        "label": {
          "article": "Severe hidradenitis suppurativa in a patient affected by Hermansky-Pudlak Syndrome type 9: possible shared pathogenetic aspects.",
          "mesh_heading": [
            "Hidradenitis Suppurativa",
            "Hermanski-Pudlak Syndrome"
          ],
          "position": {
            "Annalisa Patrizi": 3,
            "Iria Neri": 6
          }
        },
        "to": 52368
      },
      {
        "from": 146917,
        "label": {
          "article": "Severe hidradenitis suppurativa in a patient affected by Hermansky-Pudlak Syndrome type 9: possible shared pathogenetic aspects.",
          "mesh_heading": [
            "Hidradenitis Suppurativa",
            "Hermanski-Pudlak Syndrome"
          ],
          "position": {
            "Annalisa Patrizi": 3,
            "Miriam Leuzzi": 5
          }
        },
        "to": 6394
      },
      {
        "from": 146917,
        "label": {
          "article": "Severe hidradenitis suppurativa in a patient affected by Hermansky-Pudlak Syndrome type 9: possible shared pathogenetic aspects.",
          "mesh_heading": [
            "Hidradenitis Suppurativa",
            "Hermanski-Pudlak Syndrome"
          ],
          "position": {
            "Andrea Sechi": 1,
            "Annalisa Patrizi": 3
          }
        },
        "to": 6390
      },
      {
        "from": 146917,
        "label": {
          "article": "Severe hidradenitis suppurativa in a patient affected by Hermansky-Pudlak Syndrome type 9: possible shared pathogenetic aspects.",
          "mesh_heading": [
            "Hidradenitis Suppurativa",
            "Hermanski-Pudlak Syndrome"
          ],
          "position": {
            "Annalisa Patrizi": 3,
            "Annalucia Virdi": 4
          }
        },
        "to": 6393
      },
      {
        "from": 146917,
        "label": {
          "article": "Severe hidradenitis suppurativa in a patient affected by Hermansky-Pudlak Syndrome type 9: possible shared pathogenetic aspects.",
          "mesh_heading": [
            "Hidradenitis Suppurativa",
            "Hermanski-Pudlak Syndrome"
          ],
          "position": {
            "Annalisa Patrizi": 3,
            "Federico Tartari": 2
          }
        },
        "to": 6391
      },
      {
        "from": 146917,
        "label": {
          "article": "Clinical histopathological features and CDKN2A/CDK4/MITF mutational status of patients with multiple primary melanomas from Bologna: Italy is a fascinating but complex mosaic.",
          "mesh_heading": [
            "Melanoma",
            "Neoplasms, Multiple Primary",
            "Skin Neoplasms",
            "Cyclin-Dependent Kinase Inhibitor p16",
            "Microphthalmia-Associated Transcription Factor"
          ],
          "position": {
            "Annalisa Patrizi": 2,
            "Cesare Rossi": 3
          }
        },
        "to": 2324
      },
      {
        "from": 146917,
        "label": {
          "article": "Clinical histopathological features and CDKN2A/CDK4/MITF mutational status of patients with multiple primary melanomas from Bologna: Italy is a fascinating but complex mosaic.",
          "mesh_heading": [
            "Melanoma",
            "Neoplasms, Multiple Primary",
            "Skin Neoplasms",
            "Cyclin-Dependent Kinase Inhibitor p16",
            "Microphthalmia-Associated Transcription Factor"
          ],
          "position": {
            "Annalisa Patrizi": 2,
            "Giulia Veronesi": 7
          }
        },
        "to": 2328
      },
      {
        "from": 146917,
        "label": {
          "article": "Clinical histopathological features and CDKN2A/CDK4/MITF mutational status of patients with multiple primary melanomas from Bologna: Italy is a fascinating but complex mosaic.",
          "mesh_heading": [
            "Melanoma",
            "Neoplasms, Multiple Primary",
            "Skin Neoplasms",
            "Cyclin-Dependent Kinase Inhibitor p16",
            "Microphthalmia-Associated Transcription Factor"
          ],
          "position": {
            "Annalisa Patrizi": 2,
            "Manuela Ferracin": 6
          }
        },
        "to": 2327
      },
      {
        "from": 146917,
        "label": {
          "article": "Clinical histopathological features and CDKN2A/CDK4/MITF mutational status of patients with multiple primary melanomas from Bologna: Italy is a fascinating but complex mosaic.",
          "mesh_heading": [
            "Melanoma",
            "Neoplasms, Multiple Primary",
            "Skin Neoplasms",
            "Cyclin-Dependent Kinase Inhibitor p16",
            "Microphthalmia-Associated Transcription Factor"
          ],
          "position": {
            "Annalisa Patrizi": 2,
            "Sara Miccoli": 5
          }
        },
        "to": 2326
      },
      {
        "from": 146917,
        "label": {
          "article": "Clinical histopathological features and CDKN2A/CDK4/MITF mutational status of patients with multiple primary melanomas from Bologna: Italy is a fascinating but complex mosaic.",
          "mesh_heading": [
            "Melanoma",
            "Neoplasms, Multiple Primary",
            "Skin Neoplasms",
            "Cyclin-Dependent Kinase Inhibitor p16",
            "Microphthalmia-Associated Transcription Factor"
          ],
          "position": {
            "Annalisa Patrizi": 2,
            "Daniela Turchetti": 4
          }
        },
        "to": 2325
      },
      {
        "from": 146917,
        "label": {
          "article": "Clinical histopathological features and CDKN2A/CDK4/MITF mutational status of patients with multiple primary melanomas from Bologna: Italy is a fascinating but complex mosaic.",
          "mesh_heading": [
            "Melanoma",
            "Neoplasms, Multiple Primary",
            "Skin Neoplasms",
            "Cyclin-Dependent Kinase Inhibitor p16",
            "Microphthalmia-Associated Transcription Factor"
          ],
          "position": {
            "Annalisa Patrizi": 2,
            "Federica Scarfì": 8
          }
        },
        "to": 203035
      },
      {
        "from": 146917,
        "label": {
          "article": "Clinical histopathological features and CDKN2A/CDK4/MITF mutational status of patients with multiple primary melanomas from Bologna: Italy is a fascinating but complex mosaic.",
          "mesh_heading": [
            "Melanoma",
            "Neoplasms, Multiple Primary",
            "Skin Neoplasms",
            "Cyclin-Dependent Kinase Inhibitor p16",
            "Microphthalmia-Associated Transcription Factor"
          ],
          "position": {
            "Annalisa Patrizi": 2,
            "Emi Dika": 1
          }
        },
        "to": 15129
      },
      {
        "from": 146917,
        "label": {
          "article": "Clinical histopathological features and CDKN2A/CDK4/MITF mutational status of patients with multiple primary melanomas from Bologna: Italy is a fascinating but complex mosaic.",
          "mesh_heading": [
            "Melanoma",
            "Neoplasms, Multiple Primary",
            "Skin Neoplasms",
            "Cyclin-Dependent Kinase Inhibitor p16",
            "Microphthalmia-Associated Transcription Factor"
          ],
          "position": {
            "Annalisa Patrizi": 2,
            "Martina Lambertini": 9
          }
        },
        "to": 2330
      },
      {
        "from": 4505,
        "label": {
          "article": "Relationship between cervical excisional treatment for cervical intraepithelial neoplasia and obstetrical outcome.",
          "mesh_heading": [
            "Uterine Cervical Neoplasms",
            "Cervical Intraepithelial Neoplasia"
          ],
          "position": {
            "Annalisa Scopelliti": 3,
            "Debora D'Aniello": 2
          }
        },
        "to": 4504
      },
      {
        "from": 4505,
        "label": {
          "article": "Relationship between cervical excisional treatment for cervical intraepithelial neoplasia and obstetrical outcome.",
          "mesh_heading": [
            "Uterine Cervical Neoplasms",
            "Cervical Intraepithelial Neoplasia"
          ],
          "position": {
            "Annalisa Scopelliti": 3,
            "Ludovico Muzii": 12
          }
        },
        "to": 108274
      },
      {
        "from": 4505,
        "label": {
          "article": "Relationship between cervical excisional treatment for cervical intraepithelial neoplasia and obstetrical outcome.",
          "mesh_heading": [
            "Uterine Cervical Neoplasms",
            "Cervical Intraepithelial Neoplasia"
          ],
          "position": {
            "Annalisa Scopelliti": 3,
            "Violante DI Donato": 8
          }
        },
        "to": 5277
      },
      {
        "from": 4505,
        "label": {
          "article": "Relationship between cervical excisional treatment for cervical intraepithelial neoplasia and obstetrical outcome.",
          "mesh_heading": [
            "Uterine Cervical Neoplasms",
            "Cervical Intraepithelial Neoplasia"
          ],
          "position": {
            "Annalisa Scopelliti": 3,
            "Giusi Santangelo": 5
          }
        },
        "to": 4507
      },
      {
        "from": 4505,
        "label": {
          "article": "Relationship between cervical excisional treatment for cervical intraepithelial neoplasia and obstetrical outcome.",
          "mesh_heading": [
            "Uterine Cervical Neoplasms",
            "Cervical Intraepithelial Neoplasia"
          ],
          "position": {
            "Annalisa Scopelliti": 3,
            "Pierluigi Benedetti Panici": 13
          }
        },
        "to": 108275
      },
      {
        "from": 4505,
        "label": {
          "article": "Relationship between cervical excisional treatment for cervical intraepithelial neoplasia and obstetrical outcome.",
          "mesh_heading": [
            "Uterine Cervical Neoplasms",
            "Cervical Intraepithelial Neoplasia"
          ],
          "position": {
            "Andrea Giannini": 7,
            "Annalisa Scopelliti": 3
          }
        },
        "to": 5279
      },
      {
        "from": 4505,
        "label": {
          "article": "Relationship between cervical excisional treatment for cervical intraepithelial neoplasia and obstetrical outcome.",
          "mesh_heading": [
            "Uterine Cervical Neoplasms",
            "Cervical Intraepithelial Neoplasia"
          ],
          "position": {
            "Annalisa Scopelliti": 3,
            "Antonella Giancotti": 11
          }
        },
        "to": 28710
      },
      {
        "from": 4505,
        "label": {
          "article": "Relationship between cervical excisional treatment for cervical intraepithelial neoplasia and obstetrical outcome.",
          "mesh_heading": [
            "Uterine Cervical Neoplasms",
            "Cervical Intraepithelial Neoplasia"
          ],
          "position": {
            "Annalisa Scopelliti": 3,
            "Vanessa Colagiovanni": 6
          }
        },
        "to": 4508
      },
      {
        "from": 4505,
        "label": {
          "article": "Relationship between cervical excisional treatment for cervical intraepithelial neoplasia and obstetrical outcome.",
          "mesh_heading": [
            "Uterine Cervical Neoplasms",
            "Cervical Intraepithelial Neoplasia"
          ],
          "position": {
            "Annalisa Scopelliti": 3,
            "Valentina Tibaldi": 4
          }
        },
        "to": 4506
      },
      {
        "from": 4505,
        "label": {
          "article": "Relationship between cervical excisional treatment for cervical intraepithelial neoplasia and obstetrical outcome.",
          "mesh_heading": [
            "Uterine Cervical Neoplasms",
            "Cervical Intraepithelial Neoplasia"
          ],
          "position": {
            "Annalisa Scopelliti": 3,
            "Marco Monti": 1
          }
        },
        "to": 5248
      },
      {
        "from": 4505,
        "label": {
          "article": "Relationship between cervical excisional treatment for cervical intraepithelial neoplasia and obstetrical outcome.",
          "mesh_heading": [
            "Uterine Cervical Neoplasms",
            "Cervical Intraepithelial Neoplasia"
          ],
          "position": {
            "Annalisa Scopelliti": 3,
            "Innocenza Palaia": 9
          }
        },
        "to": 6543
      },
      {
        "from": 4505,
        "label": {
          "article": "Relationship between cervical excisional treatment for cervical intraepithelial neoplasia and obstetrical outcome.",
          "mesh_heading": [
            "Uterine Cervical Neoplasms",
            "Cervical Intraepithelial Neoplasia"
          ],
          "position": {
            "Annalisa Scopelliti": 3,
            "Giorgia Perniola": 10
          }
        },
        "to": 4512
      },
      {
        "from": 90794,
        "label": {
          "article": "QTc Interval Prolongation and Life-Threatening Arrhythmias During Hospitalization in Patients With Coronavirus Disease 2019 : Results From a Multicenter Prospective Registry.",
          "mesh_heading": [
            "COVID-19",
            "Long QT Syndrome"
          ],
          "position": {
            "Annalisa Saracino": 19,
            "Natale Daniele Brunetti": 24
          }
        },
        "to": 90799
      },
      {
        "from": 90794,
        "label": {
          "article": "QTc Interval Prolongation and Life-Threatening Arrhythmias During Hospitalization in Patients With Coronavirus Disease 2019 : Results From a Multicenter Prospective Registry.",
          "mesh_heading": [
            "COVID-19",
            "Long QT Syndrome"
          ],
          "position": {
            "Annalisa Saracino": 19,
            "Salvatore Angarano": 20
          }
        },
        "to": 90795
      },
      {
        "from": 90794,
        "label": {
          "article": "QTc Interval Prolongation and Life-Threatening Arrhythmias During Hospitalization in Patients With Coronavirus Disease 2019 : Results From a Multicenter Prospective Registry.",
          "mesh_heading": [
            "COVID-19",
            "Long QT Syndrome"
          ],
          "position": {
            "Annalisa Saracino": 19,
            "Ibrahim Akin": 15
          }
        },
        "to": 92905
      },
      {
        "from": 90794,
        "label": {
          "article": "QTc Interval Prolongation and Life-Threatening Arrhythmias During Hospitalization in Patients With Coronavirus Disease 2019 : Results From a Multicenter Prospective Registry.",
          "mesh_heading": [
            "COVID-19",
            "Long QT Syndrome"
          ],
          "position": {
            "Annalisa Saracino": 19,
            "Francesco Musaico": 7
          }
        },
        "to": 90782
      },
      {
        "from": 90794,
        "label": {
          "article": "QTc Interval Prolongation and Life-Threatening Arrhythmias During Hospitalization in Patients With Coronavirus Disease 2019 : Results From a Multicenter Prospective Registry.",
          "mesh_heading": [
            "COVID-19",
            "Long QT Syndrome"
          ],
          "position": {
            "Annalisa Saracino": 19,
            "Domenico Vestito": 9
          }
        },
        "to": 90784
      },
      {
        "from": 90794,
        "label": {
          "article": "QTc Interval Prolongation and Life-Threatening Arrhythmias During Hospitalization in Patients With Coronavirus Disease 2019 : Results From a Multicenter Prospective Registry.",
          "mesh_heading": [
            "COVID-19",
            "Long QT Syndrome"
          ],
          "position": {
            "Annalisa Saracino": 19,
            "Michele Cannone": 18
          }
        },
        "to": 90793
      },
      {
        "from": 90794,
        "label": {
          "article": "QTc Interval Prolongation and Life-Threatening Arrhythmias During Hospitalization in Patients With Coronavirus Disease 2019 : Results From a Multicenter Prospective Registry.",
          "mesh_heading": [
            "COVID-19",
            "Long QT Syndrome"
          ],
          "position": {
            "Annalisa Saracino": 19,
            "Luigi Di Biase": 23
          }
        },
        "to": 90798
      },
      {
        "from": 90794,
        "label": {
          "article": "QTc Interval Prolongation and Life-Threatening Arrhythmias During Hospitalization in Patients With Coronavirus Disease 2019 : Results From a Multicenter Prospective Registry.",
          "mesh_heading": [
            "COVID-19",
            "Long QT Syndrome"
          ],
          "position": {
            "Annalisa Saracino": 19,
            "Giulio De Stefano": 16
          }
        },
        "to": 90791
      },
      {
        "from": 90794,
        "label": {
          "article": "QTc Interval Prolongation and Life-Threatening Arrhythmias During Hospitalization in Patients With Coronavirus Disease 2019 : Results From a Multicenter Prospective Registry.",
          "mesh_heading": [
            "COVID-19",
            "Long QT Syndrome"
          ],
          "position": {
            "Annalisa Saracino": 19,
            "Rossella Di Benedetto": 10
          }
        },
        "to": 90785
      },
      {
        "from": 90794,
        "label": {
          "article": "QTc Interval Prolongation and Life-Threatening Arrhythmias During Hospitalization in Patients With Coronavirus Disease 2019 : Results From a Multicenter Prospective Registry.",
          "mesh_heading": [
            "COVID-19",
            "Long QT Syndrome"
          ],
          "position": {
            "Annalisa Saracino": 19,
            "Michele Gilio": 6
          }
        },
        "to": 90781
      },
      {
        "from": 90794,
        "label": {
          "article": "QTc Interval Prolongation and Life-Threatening Arrhythmias During Hospitalization in Patients With Coronavirus Disease 2019 : Results From a Multicenter Prospective Registry.",
          "mesh_heading": [
            "COVID-19",
            "Long QT Syndrome"
          ],
          "position": {
            "Annalisa Saracino": 19,
            "Luigi Flavio Massimiliano Di Martino": 14
          }
        },
        "to": 90789
      },
      {
        "from": 90794,
        "label": {
          "article": "QTc Interval Prolongation and Life-Threatening Arrhythmias During Hospitalization in Patients With Coronavirus Disease 2019 : Results From a Multicenter Prospective Registry.",
          "mesh_heading": [
            "COVID-19",
            "Long QT Syndrome"
          ],
          "position": {
            "Annalisa Saracino": 19,
            "Pasquale Raimondo": 3
          }
        },
        "to": 90778
      },
      {
        "from": 90794,
        "label": {
          "article": "QTc Interval Prolongation and Life-Threatening Arrhythmias During Hospitalization in Patients With Coronavirus Disease 2019 : Results From a Multicenter Prospective Registry.",
          "mesh_heading": [
            "COVID-19",
            "Long QT Syndrome"
          ],
          "position": {
            "Annalisa Saracino": 19,
            "Francesco Santoro": 1
          }
        },
        "to": 90776
      },
      {
        "from": 90794,
        "label": {
          "article": "QTc Interval Prolongation and Life-Threatening Arrhythmias During Hospitalization in Patients With Coronavirus Disease 2019 : Results From a Multicenter Prospective Registry.",
          "mesh_heading": [
            "COVID-19",
            "Long QT Syndrome"
          ],
          "position": {
            "Annalisa Saracino": 19,
            "Gaetano Brindicci": 5
          }
        },
        "to": 90780
      },
      {
        "from": 90794,
        "label": {
          "article": "QTc Interval Prolongation and Life-Threatening Arrhythmias During Hospitalization in Patients With Coronavirus Disease 2019 : Results From a Multicenter Prospective Registry.",
          "mesh_heading": [
            "COVID-19",
            "Long QT Syndrome"
          ],
          "position": {
            "Agostino Lopizzo": 4,
            "Annalisa Saracino": 19
          }
        },
        "to": 90779
      },
      {
        "from": 90794,
        "label": {
          "article": "QTc Interval Prolongation and Life-Threatening Arrhythmias During Hospitalization in Patients With Coronavirus Disease 2019 : Results From a Multicenter Prospective Registry.",
          "mesh_heading": [
            "COVID-19",
            "Long QT Syndrome"
          ],
          "position": {
            "Annalisa Saracino": 19,
            "Michele Mazzola": 8
          }
        },
        "to": 90783
      },
      {
        "from": 90794,
        "label": {
          "article": "QTc Interval Prolongation and Life-Threatening Arrhythmias During Hospitalization in Patients With Coronavirus Disease 2019 : Results From a Multicenter Prospective Registry.",
          "mesh_heading": [
            "COVID-19",
            "Long QT Syndrome"
          ],
          "position": {
            "Annalisa Saracino": 19,
            "Mohammad Abumayyaleh": 11
          }
        },
        "to": 90786
      },
      {
        "from": 90794,
        "label": {
          "article": "QTc Interval Prolongation and Life-Threatening Arrhythmias During Hospitalization in Patients With Coronavirus Disease 2019 : Results From a Multicenter Prospective Registry.",
          "mesh_heading": [
            "COVID-19",
            "Long QT Syndrome"
          ],
          "position": {
            "Annalisa Saracino": 19,
            "Francesco Monitillo": 2
          }
        },
        "to": 90777
      },
      {
        "from": 90794,
        "label": {
          "article": "QTc Interval Prolongation and Life-Threatening Arrhythmias During Hospitalization in Patients With Coronavirus Disease 2019 : Results From a Multicenter Prospective Registry.",
          "mesh_heading": [
            "COVID-19",
            "Long QT Syndrome"
          ],
          "position": {
            "Annalisa Saracino": 19,
            "Sergio Carbonara": 21
          }
        },
        "to": 90796
      },
      {
        "from": 90794,
        "label": {
          "article": "QTc Interval Prolongation and Life-Threatening Arrhythmias During Hospitalization in Patients With Coronavirus Disease 2019 : Results From a Multicenter Prospective Registry.",
          "mesh_heading": [
            "COVID-19",
            "Long QT Syndrome"
          ],
          "position": {
            "Annalisa Saracino": 19,
            "Ibrahim El-Battrawy": 12
          }
        },
        "to": 90787
      },
      {
        "from": 90794,
        "label": {
          "article": "QTc Interval Prolongation and Life-Threatening Arrhythmias During Hospitalization in Patients With Coronavirus Disease 2019 : Results From a Multicenter Prospective Registry.",
          "mesh_heading": [
            "COVID-19",
            "Long QT Syndrome"
          ],
          "position": {
            "Annalisa Saracino": 19,
            "Carmen Rita Santoro": 13
          }
        },
        "to": 90788
      },
      {
        "from": 90794,
        "label": {
          "article": "QTc Interval Prolongation and Life-Threatening Arrhythmias During Hospitalization in Patients With Coronavirus Disease 2019 : Results From a Multicenter Prospective Registry.",
          "mesh_heading": [
            "COVID-19",
            "Long QT Syndrome"
          ],
          "position": {
            "Annalisa Saracino": 19,
            "Rosario Fiorilli": 17
          }
        },
        "to": 90792
      },
      {
        "from": 90794,
        "label": {
          "article": "QTc Interval Prolongation and Life-Threatening Arrhythmias During Hospitalization in Patients With Coronavirus Disease 2019 : Results From a Multicenter Prospective Registry.",
          "mesh_heading": [
            "COVID-19",
            "Long QT Syndrome"
          ],
          "position": {
            "Annalisa Saracino": 19,
            "Salvatore Grasso": 22
          }
        },
        "to": 90797
      },
      {
        "from": 67795,
        "label": {
          "article": "New acetylenic metabolites from the toxic mushroom ",
          "mesh_heading": [
            "Agaricales",
            "Tricholoma"
          ],
          "position": {
            "Annalisa Salis": 4,
            "Roman Pavela": 6
          }
        },
        "to": 67797
      },
      {
        "from": 67795,
        "label": {
          "article": "New acetylenic metabolites from the toxic mushroom ",
          "mesh_heading": [
            "Agaricales",
            "Tricholoma"
          ],
          "position": {
            "Annalisa Salis": 4,
            "Hawraz Ibrahim M Amin": 3
          }
        },
        "to": 67794
      },
      {
        "from": 67795,
        "label": {
          "article": "New acetylenic metabolites from the toxic mushroom ",
          "mesh_heading": [
            "Agaricales",
            "Tricholoma"
          ],
          "position": {
            "Annalisa Salis": 4,
            "Marco Clericuzio": 1
          }
        },
        "to": 67792
      },
      {
        "from": 67795,
        "label": {
          "article": "New acetylenic metabolites from the toxic mushroom ",
          "mesh_heading": [
            "Agaricales",
            "Tricholoma"
          ],
          "position": {
            "Annalisa Salis": 4,
            "Gianluca Damonte": 5
          }
        },
        "to": 67796
      },
      {
        "from": 67795,
        "label": {
          "article": "New acetylenic metabolites from the toxic mushroom ",
          "mesh_heading": [
            "Agaricales",
            "Tricholoma"
          ],
          "position": {
            "Annalisa Salis": 4,
            "Giovanni Vidari": 7
          }
        },
        "to": 67798
      },
      {
        "from": 67795,
        "label": {
          "article": "New acetylenic metabolites from the toxic mushroom ",
          "mesh_heading": [
            "Agaricales",
            "Tricholoma"
          ],
          "position": {
            "Annalisa Salis": 4,
            "Faiq H S Hussain": 2
          }
        },
        "to": 67793
      },
      {
        "from": 78274,
        "label": {
          "article": "<Unknown Title>",
          "mesh_heading": [
            "Cannabis",
            "Oils, Volatile"
          ],
          "position": {
            "Annalisa Serio": 4,
            "Claudio Lo Sterzo": 6
          }
        },
        "to": 78276
      },
      {
        "from": 78274,
        "label": {
          "article": "<Unknown Title>",
          "mesh_heading": [
            "Cannabis",
            "Oils, Volatile"
          ],
          "position": {
            "Annalisa Serio": 4,
            "Marika Pellegrini": 1
          }
        },
        "to": 78271
      },
      {
        "from": 78274,
        "label": {
          "article": "<Unknown Title>",
          "mesh_heading": [
            "Cannabis",
            "Oils, Volatile"
          ],
          "position": {
            "Annalisa Serio": 4,
            "Antonello Paparella": 5
          }
        },
        "to": 78275
      },
      {
        "from": 78274,
        "label": {
          "article": "<Unknown Title>",
          "mesh_heading": [
            "Cannabis",
            "Oils, Volatile"
          ],
          "position": {
            "Annalisa Serio": 4,
            "Antonella Ricci": 3
          }
        },
        "to": 78273
      },
      {
        "from": 78274,
        "label": {
          "article": "<Unknown Title>",
          "mesh_heading": [
            "Cannabis",
            "Oils, Volatile"
          ],
          "position": {
            "Annalisa Serio": 4,
            "Sara Palmieri": 2
          }
        },
        "to": 78272
      },
      {
        "from": 155955,
        "label": {
          "article": "Nanocomposite systems for precise oral delivery of drugs and biologics.",
          "mesh_heading": [
            "Biological Products",
            "Nanoparticles",
            "Nanocomposites"
          ],
          "position": {
            "Annalisa Rosso": 2,
            "Stéphanie Briançon": 3
          }
        },
        "to": 126541
      },
      {
        "from": 155955,
        "label": {
          "article": "Nanocomposite systems for precise oral delivery of drugs and biologics.",
          "mesh_heading": [
            "Biological Products",
            "Nanoparticles",
            "Nanocomposites"
          ],
          "position": {
            "Annalisa Rosso": 2,
            "Giovanna Lollo": 4
          }
        },
        "to": 155967
      },
      {
        "from": 155955,
        "label": {
          "article": "Nanocomposite systems for precise oral delivery of drugs and biologics.",
          "mesh_heading": [
            "Biological Products",
            "Nanoparticles",
            "Nanocomposites"
          ],
          "position": {
            "Annalisa Rosso": 2,
            "Valentina Andretto": 1
          }
        },
        "to": 155958
      },
      {
        "from": 155955,
        "label": {
          "article": "Supersaturable self-microemulsifying delivery systems: an approach to enhance oral bioavailability of benzimidazole anticancer drugs.",
          "mesh_heading": [
            "Antineoplastic Agents",
            "Drug Delivery Systems"
          ],
          "position": {
            "Annalisa Rosso": 1,
            "Valentina Andretto": 4
          }
        },
        "to": 155958
      },
      {
        "from": 155955,
        "label": {
          "article": "Supersaturable self-microemulsifying delivery systems: an approach to enhance oral bioavailability of benzimidazole anticancer drugs.",
          "mesh_heading": [
            "Antineoplastic Agents",
            "Drug Delivery Systems"
          ],
          "position": {
            "Annalisa Rosso": 1,
            "Isabelle Coste": 9
          }
        },
        "to": 155963
      },
      {
        "from": 155955,
        "label": {
          "article": "Supersaturable self-microemulsifying delivery systems: an approach to enhance oral bioavailability of benzimidazole anticancer drugs.",
          "mesh_heading": [
            "Antineoplastic Agents",
            "Drug Delivery Systems"
          ],
          "position": {
            "Annalisa Rosso": 1,
            "Touffic Renno": 10
          }
        },
        "to": 155964
      },
      {
        "from": 155955,
        "label": {
          "article": "Supersaturable self-microemulsifying delivery systems: an approach to enhance oral bioavailability of benzimidazole anticancer drugs.",
          "mesh_heading": [
            "Antineoplastic Agents",
            "Drug Delivery Systems"
          ],
          "position": {
            "Annalisa Rosso": 1,
            "Claire Bordes": 8
          }
        },
        "to": 155962
      },
      {
        "from": 155955,
        "label": {
          "article": "Supersaturable self-microemulsifying delivery systems: an approach to enhance oral bioavailability of benzimidazole anticancer drugs.",
          "mesh_heading": [
            "Antineoplastic Agents",
            "Drug Delivery Systems"
          ],
          "position": {
            "Annalisa Rosso": 1,
            "Stéphanie Briancon": 12
          }
        },
        "to": 155966
      },
      {
        "from": 155955,
        "label": {
          "article": "Supersaturable self-microemulsifying delivery systems: an approach to enhance oral bioavailability of benzimidazole anticancer drugs.",
          "mesh_heading": [
            "Antineoplastic Agents",
            "Drug Delivery Systems"
          ],
          "position": {
            "Annalisa Rosso": 1,
            "Marine Leroux": 5
          }
        },
        "to": 155959
      },
      {
        "from": 155955,
        "label": {
          "article": "Supersaturable self-microemulsifying delivery systems: an approach to enhance oral bioavailability of benzimidazole anticancer drugs.",
          "mesh_heading": [
            "Antineoplastic Agents",
            "Drug Delivery Systems"
          ],
          "position": {
            "Annalisa Rosso": 1,
            "Giovanna Lollo": 13
          }
        },
        "to": 155967
      },
      {
        "from": 155955,
        "label": {
          "article": "Supersaturable self-microemulsifying delivery systems: an approach to enhance oral bioavailability of benzimidazole anticancer drugs.",
          "mesh_heading": [
            "Antineoplastic Agents",
            "Drug Delivery Systems"
          ],
          "position": {
            "Annalisa Rosso": 1,
            "Samira Azzouz-Maache": 7
          }
        },
        "to": 155961
      },
      {
        "from": 155955,
        "label": {
          "article": "Supersaturable self-microemulsifying delivery systems: an approach to enhance oral bioavailability of benzimidazole anticancer drugs.",
          "mesh_heading": [
            "Antineoplastic Agents",
            "Drug Delivery Systems"
          ],
          "position": {
            "Annalisa Rosso": 1,
            "Stephane Giraud": 11
          }
        },
        "to": 155965
      },
      {
        "from": 155955,
        "label": {
          "article": "Supersaturable self-microemulsifying delivery systems: an approach to enhance oral bioavailability of benzimidazole anticancer drugs.",
          "mesh_heading": [
            "Antineoplastic Agents",
            "Drug Delivery Systems"
          ],
          "position": {
            "Annalisa Rosso": 1,
            "Eyad Almouazen": 2
          }
        },
        "to": 155956
      },
      {
        "from": 155955,
        "label": {
          "article": "Supersaturable self-microemulsifying delivery systems: an approach to enhance oral bioavailability of benzimidazole anticancer drugs.",
          "mesh_heading": [
            "Antineoplastic Agents",
            "Drug Delivery Systems"
          ],
          "position": {
            "Annalisa Rosso": 1,
            "Jorge Pontes": 3
          }
        },
        "to": 155957
      },
      {
        "from": 155955,
        "label": {
          "article": "Supersaturable self-microemulsifying delivery systems: an approach to enhance oral bioavailability of benzimidazole anticancer drugs.",
          "mesh_heading": [
            "Antineoplastic Agents",
            "Drug Delivery Systems"
          ],
          "position": {
            "Annalisa Rosso": 1,
            "Etienne Romasko": 6
          }
        },
        "to": 155960
      },
      {
        "from": 107315,
        "label": {
          "article": "Trial sequential analysis: plain and simple.",
          "mesh_heading": [
            "Analgesia"
          ],
          "position": {
            "Annalisa Boscolo": 3,
            "Laura Pasin": 2
          }
        },
        "to": 107314
      },
      {
        "from": 107315,
        "label": {
          "article": "Trial sequential analysis: plain and simple.",
          "mesh_heading": [
            "Analgesia"
          ],
          "position": {
            "Alessandro De Cassai": 1,
            "Annalisa Boscolo": 3
          }
        },
        "to": 107313
      },
      {
        "from": 107315,
        "label": {
          "article": "Trial sequential analysis: plain and simple.",
          "mesh_heading": [
            "Analgesia"
          ],
          "position": {
            "Annalisa Boscolo": 3,
            "Michele Salvagno": 4
          }
        },
        "to": 107316
      },
      {
        "from": 107315,
        "label": {
          "article": "Trial sequential analysis: plain and simple.",
          "mesh_heading": [
            "Analgesia"
          ],
          "position": {
            "Annalisa Boscolo": 3,
            "Paolo Navalesi": 5
          }
        },
        "to": 115824
      },
      {
        "from": 226602,
        "label": {
          "article": "Prescribing Tamoxifen in Patients With Mood Disorders: A Systematic Review of Potential Antimanic Versus Depressive Effects.",
          "mesh_heading": [
            "Bipolar Disorder",
            "Depression"
          ],
          "position": {
            "Annalisa Cordone": 2,
            "Claudia Carmassi": 1
          }
        },
        "to": 226601
      },
      {
        "from": 226602,
        "label": {
          "article": "Prescribing Tamoxifen in Patients With Mood Disorders: A Systematic Review of Potential Antimanic Versus Depressive Effects.",
          "mesh_heading": [
            "Bipolar Disorder",
            "Depression"
          ],
          "position": {
            "Annalisa Cordone": 2,
            "Virginia Pedrinelli": 4
          }
        },
        "to": 226604
      },
      {
        "from": 226602,
        "label": {
          "article": "Prescribing Tamoxifen in Patients With Mood Disorders: A Systematic Review of Potential Antimanic Versus Depressive Effects.",
          "mesh_heading": [
            "Bipolar Disorder",
            "Depression"
          ],
          "position": {
            "Annalisa Cordone": 2,
            "Liliana Dell'Osso": 7
          }
        },
        "to": 226607
      },
      {
        "from": 226602,
        "label": {
          "article": "Prescribing Tamoxifen in Patients With Mood Disorders: A Systematic Review of Potential Antimanic Versus Depressive Effects.",
          "mesh_heading": [
            "Bipolar Disorder",
            "Depression"
          ],
          "position": {
            "Annalisa Cordone": 2,
            "Francesco Pardini": 5
          }
        },
        "to": 226605
      },
      {
        "from": 226602,
        "label": {
          "article": "Prescribing Tamoxifen in Patients With Mood Disorders: A Systematic Review of Potential Antimanic Versus Depressive Effects.",
          "mesh_heading": [
            "Bipolar Disorder",
            "Depression"
          ],
          "position": {
            "Annalisa Cordone": 2,
            "Valerio Dell'Oste": 3
          }
        },
        "to": 226603
      },
      {
        "from": 226602,
        "label": {
          "article": "Prescribing Tamoxifen in Patients With Mood Disorders: A Systematic Review of Potential Antimanic Versus Depressive Effects.",
          "mesh_heading": [
            "Bipolar Disorder",
            "Depression"
          ],
          "position": {
            "Annalisa Cordone": 2,
            "Marly Simoncini": 6
          }
        },
        "to": 226606
      },
      {
        "from": 162296,
        "label": {
          "article": "Air Trapping Is Associated with Heterozygosity for Alpha-1 Antitrypsin Mutations in Patients with Asthma.",
          "mesh_heading": [
            "Asthma"
          ],
          "position": {
            "Annalisa Frizzelli": 4,
            "Giuseppina Bertorelli": 7
          }
        },
        "to": 162298
      },
      {
        "from": 162296,
        "label": {
          "article": "Air Trapping Is Associated with Heterozygosity for Alpha-1 Antitrypsin Mutations in Patients with Asthma.",
          "mesh_heading": [
            "Asthma"
          ],
          "position": {
            "Annalisa Frizzelli": 4,
            "Marina Aiello": 1
          }
        },
        "to": 162294
      },
      {
        "from": 162296,
        "label": {
          "article": "Air Trapping Is Associated with Heterozygosity for Alpha-1 Antitrypsin Mutations in Patients with Asthma.",
          "mesh_heading": [
            "Asthma"
          ],
          "position": {
            "Alfredo Chetta": 8,
            "Annalisa Frizzelli": 4
          }
        },
        "to": 162300
      },
      {
        "from": 162296,
        "label": {
          "article": "Air Trapping Is Associated with Heterozygosity for Alpha-1 Antitrypsin Mutations in Patients with Asthma.",
          "mesh_heading": [
            "Asthma"
          ],
          "position": {
            "Annalisa Frizzelli": 4,
            "Ilaria Ferrarotti": 6
          }
        },
        "to": 128475
      },
      {
        "from": 162296,
        "label": {
          "article": "Air Trapping Is Associated with Heterozygosity for Alpha-1 Antitrypsin Mutations in Patients with Asthma.",
          "mesh_heading": [
            "Asthma"
          ],
          "position": {
            "Annalisa Frizzelli": 4,
            "Roberta Pisi": 5
          }
        },
        "to": 162293
      },
      {
        "from": 162296,
        "label": {
          "article": "Air Trapping Is Associated with Heterozygosity for Alpha-1 Antitrypsin Mutations in Patients with Asthma.",
          "mesh_heading": [
            "Asthma"
          ],
          "position": {
            "Annalisa Frizzelli": 4,
            "Marianna Ghirardini": 2
          }
        },
        "to": 128471
      },
      {
        "from": 162296,
        "label": {
          "article": "Air Trapping Is Associated with Heterozygosity for Alpha-1 Antitrypsin Mutations in Patients with Asthma.",
          "mesh_heading": [
            "Asthma"
          ],
          "position": {
            "Annalisa Frizzelli": 4,
            "Laura Marchi": 3
          }
        },
        "to": 128472
      },
      {
        "from": 162296,
        "label": {
          "article": "Ventilation Heterogeneity in Asthma and COPD: The Value of the Poorly Communicating Fraction as the Ratio of Total Lung Capacity to Alveolar Volume.",
          "mesh_heading": [
            "Pulmonary Ventilation",
            "Total Lung Capacity"
          ],
          "position": {
            "Annalisa Frizzelli": 4,
            "Marina Aiello": 2
          }
        },
        "to": 162294
      },
      {
        "from": 162296,
        "label": {
          "article": "Ventilation Heterogeneity in Asthma and COPD: The Value of the Poorly Communicating Fraction as the Ratio of Total Lung Capacity to Alveolar Volume.",
          "mesh_heading": [
            "Pulmonary Ventilation",
            "Total Lung Capacity"
          ],
          "position": {
            "Alfredo Chetta": 8,
            "Annalisa Frizzelli": 4
          }
        },
        "to": 162300
      },
      {
        "from": 162296,
        "label": {
          "article": "Ventilation Heterogeneity in Asthma and COPD: The Value of the Poorly Communicating Fraction as the Ratio of Total Lung Capacity to Alveolar Volume.",
          "mesh_heading": [
            "Pulmonary Ventilation",
            "Total Lung Capacity"
          ],
          "position": {
            "Annalisa Frizzelli": 4,
            "Roberta Pisi": 1
          }
        },
        "to": 162293
      },
      {
        "from": 162296,
        "label": {
          "article": "Ventilation Heterogeneity in Asthma and COPD: The Value of the Poorly Communicating Fraction as the Ratio of Total Lung Capacity to Alveolar Volume.",
          "mesh_heading": [
            "Pulmonary Ventilation",
            "Total Lung Capacity"
          ],
          "position": {
            "Annalisa Frizzelli": 4,
            "Veronica Alfieri": 5
          }
        },
        "to": 162297
      },
      {
        "from": 162296,
        "label": {
          "article": "Ventilation Heterogeneity in Asthma and COPD: The Value of the Poorly Communicating Fraction as the Ratio of Total Lung Capacity to Alveolar Volume.",
          "mesh_heading": [
            "Pulmonary Ventilation",
            "Total Lung Capacity"
          ],
          "position": {
            "Annalisa Frizzelli": 4,
            "Giuseppina Bertorelli": 6
          }
        },
        "to": 162298
      },
      {
        "from": 162296,
        "label": {
          "article": "Ventilation Heterogeneity in Asthma and COPD: The Value of the Poorly Communicating Fraction as the Ratio of Total Lung Capacity to Alveolar Volume.",
          "mesh_heading": [
            "Pulmonary Ventilation",
            "Total Lung Capacity"
          ],
          "position": {
            "Annalisa Frizzelli": 4,
            "Giovanna Pisi": 7
          }
        },
        "to": 162299
      },
      {
        "from": 162296,
        "label": {
          "article": "Ventilation Heterogeneity in Asthma and COPD: The Value of the Poorly Communicating Fraction as the Ratio of Total Lung Capacity to Alveolar Volume.",
          "mesh_heading": [
            "Pulmonary Ventilation",
            "Total Lung Capacity"
          ],
          "position": {
            "Annalisa Frizzelli": 4,
            "Luigino Calzetta": 3
          }
        },
        "to": 236766
      }
    ],
    "nodes": [
      {
        "id": 219687,
        "label": "Kristina Franz",
        "value": 1
      },
      {
        "id": 219689,
        "label": "Ester Giaquinto",
        "value": 1
      },
      {
        "id": 219688,
        "label": "Sara Cutti",
        "value": 1
      },
      {
        "id": 219681,
        "label": "Sara Masi",
        "value": 1
      },
      {
        "id": 219690,
        "label": "Andrea Riccardo Filippi",
        "value": 1
      },
      {
        "id": 219691,
        "label": "Kristina Norman",
        "value": 1
      },
      {
        "id": 219686,
        "label": "Maja Tank",
        "value": 1
      },
      {
        "id": 219680,
        "label": "Federica Lobascio",
        "value": 1
      },
      {
        "id": 219682,
        "label": "Silvia Crotti",
        "value": 1
      },
      {
        "id": 219679,
        "label": "Paolo Pedrazzoli",
        "value": 1
      },
      {
        "id": 219678,
        "label": "Emanuele Cereda",
        "value": 1
      },
      {
        "id": 219683,
        "label": "Catherine Klersy",
        "value": 1
      },
      {
        "id": 219692,
        "label": "Riccardo Caccialanza",
        "value": 1
      },
      {
        "id": 219685,
        "label": "Nicole Stobäus",
        "value": 1
      },
      {
        "id": 219684,
        "label": "Annalisa Turri",
        "value": 14
      },
      {
        "id": 159642,
        "label": "Monia Guidi",
        "value": 1
      },
      {
        "id": 159641,
        "label": "Andreas Limacher",
        "value": 1
      },
      {
        "id": 159636,
        "label": "Matthias Cavassini",
        "value": 1
      },
      {
        "id": 159638,
        "label": "Mikaela Smit",
        "value": 1
      },
      {
        "id": 159640,
        "label": "Patrick Schmid",
        "value": 1
      },
      {
        "id": 159645,
        "label": "Alexandra Calmy",
        "value": 1
      },
      {
        "id": 159628,
        "label": "Perrine Courlet",
        "value": 1
      },
      {
        "id": 159629,
        "label": "Charlotte Barbieux",
        "value": 1
      },
      {
        "id": 159633,
        "label": "Enos Bernasconi",
        "value": 1
      },
      {
        "id": 159644,
        "label": "Laurent Arthur Decosterd",
        "value": 1
      },
      {
        "id": 159634,
        "label": "Dominique Braun",
        "value": 1
      },
      {
        "id": 159635,
        "label": "Pietro Vernazza",
        "value": 1
      },
      {
        "id": 159639,
        "label": "Huldrych F Günthard",
        "value": 1
      },
      {
        "id": 159632,
        "label": "Marcel Stoeckle",
        "value": 1
      },
      {
        "id": 159631,
        "label": "Gilles Wandeler",
        "value": 1
      },
      {
        "id": 159643,
        "label": "Susana Alves Saldanha",
        "value": 1
      },
      {
        "id": 159630,
        "label": "Delphine Sculier",
        "value": 1
      },
      {
        "id": 159637,
        "label": "Annalisa Marinosci",
        "value": 17
      },
      {
        "id": 241758,
        "label": "Fabio Niosi",
        "value": 1
      },
      {
        "id": 241755,
        "label": "Francesco Padovani",
        "value": 1
      },
      {
        "id": 241757,
        "label": "Chiara Rotella",
        "value": 1
      },
      {
        "id": 241760,
        "label": "Martin Hegner",
        "value": 1
      },
      {
        "id": 241756,
        "label": "Giulio Brunetti",
        "value": 1
      },
      {
        "id": 241759,
        "label": "Victor Usov",
        "value": 1
      },
      {
        "id": 241754,
        "label": "Annalisa De Pastina",
        "value": 6
      },
      {
        "id": 211582,
        "label": "Paola Tacchetti",
        "value": 1
      },
      {
        "id": 156086,
        "label": "Roberto Marasca",
        "value": 1
      },
      {
        "id": 156091,
        "label": "Claudia Cellini",
        "value": 1
      },
      {
        "id": 156085,
        "label": "Monica Galli",
        "value": 1
      },
      {
        "id": 156094,
        "label": "Francesca Patriarca",
        "value": 1
      },
      {
        "id": 156084,
        "label": "Patrizia Tosi",
        "value": 1
      },
      {
        "id": 156077,
        "label": "Francesca Bonello",
        "value": 1
      },
      {
        "id": 156093,
        "label": "Federico Monaco",
        "value": 1
      },
      {
        "id": 156079,
        "label": "Mattia D'Agostino",
        "value": 1
      },
      {
        "id": 156076,
        "label": "Alessandra Larocca",
        "value": 1
      },
      {
        "id": 156095,
        "label": "Tommaso Caravita di Toritto",
        "value": 1
      },
      {
        "id": 156099,
        "label": "Sara Bringhen",
        "value": 1
      },
      {
        "id": 195660,
        "label": "Giulia Benevolo",
        "value": 1
      },
      {
        "id": 156080,
        "label": "Massimo Offidani",
        "value": 1
      },
      {
        "id": 160277,
        "label": "Mario Boccadoro",
        "value": 1
      },
      {
        "id": 156092,
        "label": "Alessandra Pompa",
        "value": 1
      },
      {
        "id": 156087,
        "label": "Nicola Giuliani",
        "value": 1
      },
      {
        "id": 156096,
        "label": "Paolo Corradini",
        "value": 1
      },
      {
        "id": 156082,
        "label": "Andrea Capra",
        "value": 1
      },
      {
        "id": 203411,
        "label": "Gianluca Gaidano",
        "value": 1
      },
      {
        "id": 156089,
        "label": "Elisabetta Antonioli",
        "value": 1
      },
      {
        "id": 156081,
        "label": "Nicola Cascavilla",
        "value": 1
      },
      {
        "id": 156090,
        "label": "Delia Rota-Scalabrini",
        "value": 1
      },
      {
        "id": 156088,
        "label": "Annalisa Bernardini",
        "value": 23
      },
      {
        "id": 162578,
        "label": "Emil Kumar",
        "value": 1
      },
      {
        "id": 162568,
        "label": "Alison Yeomans",
        "value": 1
      },
      {
        "id": 188497,
        "label": "Ari Melnick",
        "value": 1
      },
      {
        "id": 162583,
        "label": "Peter Johnson",
        "value": 1
      },
      {
        "id": 162581,
        "label": "Andrew Clear",
        "value": 1
      },
      {
        "id": 162585,
        "label": "Pedro Cutillas",
        "value": 1
      },
      {
        "id": 162589,
        "label": "Graham Packham",
        "value": 1
      },
      {
        "id": 162576,
        "label": "Sameena Iqbal",
        "value": 1
      },
      {
        "id": 162582,
        "label": "John Gribben",
        "value": 1
      },
      {
        "id": 162569,
        "label": "Martin Philpott",
        "value": 1
      },
      {
        "id": 162565,
        "label": "Lola Konali",
        "value": 1
      },
      {
        "id": 162567,
        "label": "Karina Close",
        "value": 1
      },
      {
        "id": 162587,
        "label": "Udo Oppermann",
        "value": 1
      },
      {
        "id": 162586,
        "label": "Jessica Okosun",
        "value": 1
      },
      {
        "id": 162574,
        "label": "Koorosh Korfi",
        "value": 1
      },
      {
        "id": 162577,
        "label": "Findlay Bewicke-Copley",
        "value": 1
      },
      {
        "id": 162572,
        "label": "Ahad F Al Seraihi",
        "value": 1
      },
      {
        "id": 162575,
        "label": "Shamzah Araf",
        "value": 1
      },
      {
        "id": 162579,
        "label": "Darko Barisic",
        "value": 1
      },
      {
        "id": 162570,
        "label": "James Dunford",
        "value": 1
      },
      {
        "id": 239778,
        "label": "Jun Wang",
        "value": 1
      },
      {
        "id": 162571,
        "label": "Tahrima Rahim",
        "value": 1
      },
      {
        "id": 162580,
        "label": "Maria Calaminici",
        "value": 1
      },
      {
        "id": 162564,
        "label": "James Heward",
        "value": 1
      },
      {
        "id": 162590,
        "label": "Jude Fitzgibbon",
        "value": 1
      },
      {
        "id": 162584,
        "label": "Richard Neve",
        "value": 1
      },
      {
        "id": 162566,
        "label": "Annalisa D'Avola",
        "value": 26
      },
      {
        "id": 89697,
        "label": "Stefania Barruscotti",
        "value": 1
      },
      {
        "id": 89696,
        "label": "Vittorio Bolcato",
        "value": 1
      },
      {
        "id": 89699,
        "label": "Carlo F Tomasini",
        "value": 1
      },
      {
        "id": 118621,
        "label": "Valeria Brazzelli",
        "value": 2
      },
      {
        "id": 89698,
        "label": "Annalisa DE Silvestri",
        "value": 4
      },
      {
        "id": 146915,
        "label": "Alessia Barisani",
        "value": 2
      },
      {
        "id": 52368,
        "label": "Iria Neri",
        "value": 4
      },
      {
        "id": 146914,
        "label": "Carlotta Baraldi",
        "value": 4
      },
      {
        "id": 52371,
        "label": "Pier A Fanti",
        "value": 1
      },
      {
        "id": 68002,
        "label": "Andrea Belluzzi",
        "value": 1
      },
      {
        "id": 68000,
        "label": "Clara Bertuzzi",
        "value": 2
      },
      {
        "id": 67999,
        "label": "Alba Guglielmo",
        "value": 3
      },
      {
        "id": 68001,
        "label": "Eleonora Scaioli",
        "value": 1
      },
      {
        "id": 68003,
        "label": "Elena Sabattini",
        "value": 1
      },
      {
        "id": 118637,
        "label": "Alessandro Pileri",
        "value": 3
      },
      {
        "id": 1668,
        "label": "Fabio Fuligni",
        "value": 1
      },
      {
        "id": 1672,
        "label": "Italian Lymphoma Foundation (FIL) - Cutaneous Lymphoma Task Force",
        "value": 1
      },
      {
        "id": 118647,
        "label": "Nicola Pimpinelli",
        "value": 1
      },
      {
        "id": 3847,
        "label": "Irene Lastrucci",
        "value": 1
      },
      {
        "id": 6390,
        "label": "Andrea Sechi",
        "value": 3
      },
      {
        "id": 4199,
        "label": "Andrea Diociaiuti",
        "value": 1
      },
      {
        "id": 4201,
        "label": "Donatella Schena",
        "value": 1
      },
      {
        "id": 4205,
        "label": "Anna Belloni Fortina",
        "value": 1
      },
      {
        "id": 4206,
        "label": "Patrizia Pepe",
        "value": 1
      },
      {
        "id": 4200,
        "label": "May El Hachem",
        "value": 1
      },
      {
        "id": 117181,
        "label": "Andrea Bassi",
        "value": 1
      },
      {
        "id": 6393,
        "label": "Annalucia Virdi",
        "value": 2
      },
      {
        "id": 4198,
        "label": "Stefano Cambiaghi",
        "value": 1
      },
      {
        "id": 4203,
        "label": "Domenico Bonamonte",
        "value": 1
      },
      {
        "id": 4207,
        "label": "Vito DI Lernia",
        "value": 1
      },
      {
        "id": 5599,
        "label": "Federico Bardazzi",
        "value": 4
      },
      {
        "id": 6394,
        "label": "Miriam Leuzzi",
        "value": 2
      },
      {
        "id": 5595,
        "label": "Ambra DI Altobrando",
        "value": 2
      },
      {
        "id": 5597,
        "label": "Diego Abbenante",
        "value": 2
      },
      {
        "id": 4703,
        "label": "Camilla Loi",
        "value": 2
      },
      {
        "id": 4701,
        "label": "Beatrice Raone",
        "value": 1
      },
      {
        "id": 1650,
        "label": "Fabio Guaraldi",
        "value": 1
      },
      {
        "id": 1651,
        "label": "Elisa Varotti",
        "value": 1
      },
      {
        "id": 21686,
        "label": "Ada Dormi",
        "value": 1
      },
      {
        "id": 56831,
        "label": "Cosimo Misciali",
        "value": 1
      },
      {
        "id": 4223,
        "label": "Lidia Sacchelli",
        "value": 2
      },
      {
        "id": 1653,
        "label": "Elena Nardi",
        "value": 1
      },
      {
        "id": 4840,
        "label": "Giulio Tosti",
        "value": 1
      },
      {
        "id": 4843,
        "label": "Sabina Vaccari",
        "value": 1
      },
      {
        "id": 4838,
        "label": "Valeria Evangelista",
        "value": 1
      },
      {
        "id": 5606,
        "label": "Federica Filippi",
        "value": 1
      },
      {
        "id": 4227,
        "label": "Ivano Iozzo",
        "value": 1
      },
      {
        "id": 4224,
        "label": "Riccardo Balestri",
        "value": 1
      },
      {
        "id": 2054,
        "label": "Michela Magnano",
        "value": 1
      },
      {
        "id": 2058,
        "label": "Gabriele Bertusi",
        "value": 1
      },
      {
        "id": 2057,
        "label": "Giulia Odorici",
        "value": 1
      },
      {
        "id": 2055,
        "label": "Giulia Fiorini",
        "value": 1
      },
      {
        "id": 2056,
        "label": "Dino Vaira",
        "value": 1
      },
      {
        "id": 6391,
        "label": "Federico Tartari",
        "value": 1
      },
      {
        "id": 2324,
        "label": "Cesare Rossi",
        "value": 1
      },
      {
        "id": 2328,
        "label": "Giulia Veronesi",
        "value": 1
      },
      {
        "id": 2327,
        "label": "Manuela Ferracin",
        "value": 1
      },
      {
        "id": 2326,
        "label": "Sara Miccoli",
        "value": 1
      },
      {
        "id": 2325,
        "label": "Daniela Turchetti",
        "value": 1
      },
      {
        "id": 203035,
        "label": "Federica Scarfì",
        "value": 1
      },
      {
        "id": 15129,
        "label": "Emi Dika",
        "value": 1
      },
      {
        "id": 2330,
        "label": "Martina Lambertini",
        "value": 1
      },
      {
        "id": 146917,
        "label": "Annalisa Patrizi",
        "value": 81
      },
      {
        "id": 4504,
        "label": "Debora D'Aniello",
        "value": 1
      },
      {
        "id": 108274,
        "label": "Ludovico Muzii",
        "value": 1
      },
      {
        "id": 5277,
        "label": "Violante DI Donato",
        "value": 1
      },
      {
        "id": 4507,
        "label": "Giusi Santangelo",
        "value": 1
      },
      {
        "id": 108275,
        "label": "Pierluigi Benedetti Panici",
        "value": 1
      },
      {
        "id": 5279,
        "label": "Andrea Giannini",
        "value": 1
      },
      {
        "id": 28710,
        "label": "Antonella Giancotti",
        "value": 1
      },
      {
        "id": 4508,
        "label": "Vanessa Colagiovanni",
        "value": 1
      },
      {
        "id": 4506,
        "label": "Valentina Tibaldi",
        "value": 1
      },
      {
        "id": 5248,
        "label": "Marco Monti",
        "value": 1
      },
      {
        "id": 6543,
        "label": "Innocenza Palaia",
        "value": 1
      },
      {
        "id": 4512,
        "label": "Giorgia Perniola",
        "value": 1
      },
      {
        "id": 4505,
        "label": "Annalisa Scopelliti",
        "value": 12
      },
      {
        "id": 90799,
        "label": "Natale Daniele Brunetti",
        "value": 1
      },
      {
        "id": 90795,
        "label": "Salvatore Angarano",
        "value": 1
      },
      {
        "id": 92905,
        "label": "Ibrahim Akin",
        "value": 1
      },
      {
        "id": 90782,
        "label": "Francesco Musaico",
        "value": 1
      },
      {
        "id": 90784,
        "label": "Domenico Vestito",
        "value": 1
      },
      {
        "id": 90793,
        "label": "Michele Cannone",
        "value": 1
      },
      {
        "id": 90798,
        "label": "Luigi Di Biase",
        "value": 1
      },
      {
        "id": 90791,
        "label": "Giulio De Stefano",
        "value": 1
      },
      {
        "id": 90785,
        "label": "Rossella Di Benedetto",
        "value": 1
      },
      {
        "id": 90781,
        "label": "Michele Gilio",
        "value": 1
      },
      {
        "id": 90789,
        "label": "Luigi Flavio Massimiliano Di Martino",
        "value": 1
      },
      {
        "id": 90778,
        "label": "Pasquale Raimondo",
        "value": 1
      },
      {
        "id": 90776,
        "label": "Francesco Santoro",
        "value": 1
      },
      {
        "id": 90780,
        "label": "Gaetano Brindicci",
        "value": 1
      },
      {
        "id": 90779,
        "label": "Agostino Lopizzo",
        "value": 1
      },
      {
        "id": 90783,
        "label": "Michele Mazzola",
        "value": 1
      },
      {
        "id": 90786,
        "label": "Mohammad Abumayyaleh",
        "value": 1
      },
      {
        "id": 90777,
        "label": "Francesco Monitillo",
        "value": 1
      },
      {
        "id": 90796,
        "label": "Sergio Carbonara",
        "value": 1
      },
      {
        "id": 90787,
        "label": "Ibrahim El-Battrawy",
        "value": 1
      },
      {
        "id": 90788,
        "label": "Carmen Rita Santoro",
        "value": 1
      },
      {
        "id": 90792,
        "label": "Rosario Fiorilli",
        "value": 1
      },
      {
        "id": 90797,
        "label": "Salvatore Grasso",
        "value": 1
      },
      {
        "id": 90794,
        "label": "Annalisa Saracino",
        "value": 23
      },
      {
        "id": 67797,
        "label": "Roman Pavela",
        "value": 1
      },
      {
        "id": 67794,
        "label": "Hawraz Ibrahim M Amin",
        "value": 1
      },
      {
        "id": 67792,
        "label": "Marco Clericuzio",
        "value": 1
      },
      {
        "id": 67796,
        "label": "Gianluca Damonte",
        "value": 1
      },
      {
        "id": 67798,
        "label": "Giovanni Vidari",
        "value": 1
      },
      {
        "id": 67793,
        "label": "Faiq H S Hussain",
        "value": 1
      },
      {
        "id": 67795,
        "label": "Annalisa Salis",
        "value": 6
      },
      {
        "id": 78276,
        "label": "Claudio Lo Sterzo",
        "value": 1
      },
      {
        "id": 78271,
        "label": "Marika Pellegrini",
        "value": 1
      },
      {
        "id": 78275,
        "label": "Antonello Paparella",
        "value": 1
      },
      {
        "id": 78273,
        "label": "Antonella Ricci",
        "value": 1
      },
      {
        "id": 78272,
        "label": "Sara Palmieri",
        "value": 1
      },
      {
        "id": 78274,
        "label": "Annalisa Serio",
        "value": 5
      },
      {
        "id": 126541,
        "label": "Stéphanie Briançon",
        "value": 1
      },
      {
        "id": 155967,
        "label": "Giovanna Lollo",
        "value": 2
      },
      {
        "id": 155958,
        "label": "Valentina Andretto",
        "value": 2
      },
      {
        "id": 155963,
        "label": "Isabelle Coste",
        "value": 1
      },
      {
        "id": 155964,
        "label": "Touffic Renno",
        "value": 1
      },
      {
        "id": 155962,
        "label": "Claire Bordes",
        "value": 1
      },
      {
        "id": 155966,
        "label": "Stéphanie Briancon",
        "value": 1
      },
      {
        "id": 155959,
        "label": "Marine Leroux",
        "value": 1
      },
      {
        "id": 155961,
        "label": "Samira Azzouz-Maache",
        "value": 1
      },
      {
        "id": 155965,
        "label": "Stephane Giraud",
        "value": 1
      },
      {
        "id": 155956,
        "label": "Eyad Almouazen",
        "value": 1
      },
      {
        "id": 155957,
        "label": "Jorge Pontes",
        "value": 1
      },
      {
        "id": 155960,
        "label": "Etienne Romasko",
        "value": 1
      },
      {
        "id": 155955,
        "label": "Annalisa Rosso",
        "value": 15
      },
      {
        "id": 107314,
        "label": "Laura Pasin",
        "value": 1
      },
      {
        "id": 107313,
        "label": "Alessandro De Cassai",
        "value": 1
      },
      {
        "id": 107316,
        "label": "Michele Salvagno",
        "value": 1
      },
      {
        "id": 115824,
        "label": "Paolo Navalesi",
        "value": 1
      },
      {
        "id": 107315,
        "label": "Annalisa Boscolo",
        "value": 4
      },
      {
        "id": 226601,
        "label": "Claudia Carmassi",
        "value": 1
      },
      {
        "id": 226604,
        "label": "Virginia Pedrinelli",
        "value": 1
      },
      {
        "id": 226607,
        "label": "Liliana Dell'Osso",
        "value": 1
      },
      {
        "id": 226605,
        "label": "Francesco Pardini",
        "value": 1
      },
      {
        "id": 226603,
        "label": "Valerio Dell'Oste",
        "value": 1
      },
      {
        "id": 226606,
        "label": "Marly Simoncini",
        "value": 1
      },
      {
        "id": 226602,
        "label": "Annalisa Cordone",
        "value": 6
      },
      {
        "id": 162298,
        "label": "Giuseppina Bertorelli",
        "value": 2
      },
      {
        "id": 162294,
        "label": "Marina Aiello",
        "value": 2
      },
      {
        "id": 162300,
        "label": "Alfredo Chetta",
        "value": 2
      },
      {
        "id": 128475,
        "label": "Ilaria Ferrarotti",
        "value": 1
      },
      {
        "id": 162293,
        "label": "Roberta Pisi",
        "value": 2
      },
      {
        "id": 128471,
        "label": "Marianna Ghirardini",
        "value": 1
      },
      {
        "id": 128472,
        "label": "Laura Marchi",
        "value": 1
      },
      {
        "id": 162297,
        "label": "Veronica Alfieri",
        "value": 1
      },
      {
        "id": 162299,
        "label": "Giovanna Pisi",
        "value": 1
      },
      {
        "id": 236766,
        "label": "Luigino Calzetta",
        "value": 1
      },
      {
        "id": 162296,
        "label": "Annalisa Frizzelli",
        "value": 14
      }
    ]
  };

  let json_data3 = {
    "counts": {
      "edges num": 429,
      "nodes num": 434,
      "records num": 64
    },
    "edges": [
      {
        "from": 155118,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Biophysical characterization of melanoma cell phenotype markers during metastatic progression.\nPositions: \n#1 Anna Sobiepanek\n#2 Alessio Paone",
        "to": 155119
      },
      {
        "from": 155118,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Biophysical characterization of melanoma cell phenotype markers during metastatic progression.\nPositions: \n#1 Anna Sobiepanek\n#3 Francesca Cutruzzolà",
        "to": 155120
      },
      {
        "from": 155118,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Biophysical characterization of melanoma cell phenotype markers during metastatic progression.\nPositions: \n#1 Anna Sobiepanek\n#4 Tomasz Kobiela",
        "to": 155121
      },
      {
        "from": 119054,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Squamous cell carcinoma arising from an ischial pressure ulcer initially suspected to be necrotizing soft tissue infection: A case report.\nPositions: \n#1 Takehiro Kasai\n#2 Tetsuya Isayama",
        "to": 119055
      },
      {
        "from": 119054,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Squamous cell carcinoma arising from an ischial pressure ulcer initially suspected to be necrotizing soft tissue infection: A case report.\nPositions: \n#1 Takehiro Kasai\n#3 Mitsuru Sekido",
        "to": 119056
      },
      {
        "from": 205440,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Imaging findings of cutaneous angiosarcoma of the scalp: Comparison with cutaneous squamous cell carcinoma.\nPositions: \n#1 Masaya Kawaguchi\n#3 Natsuko Suzui",
        "to": 205442
      },
      {
        "from": 205440,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Imaging findings of cutaneous angiosarcoma of the scalp: Comparison with cutaneous squamous cell carcinoma.\nPositions: \n#1 Masaya Kawaguchi\n#8 Mariko Seishima",
        "to": 205447
      },
      {
        "from": 205440,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Imaging findings of cutaneous angiosarcoma of the scalp: Comparison with cutaneous squamous cell carcinoma.\nPositions: \n#1 Masaya Kawaguchi\n#5 Hiroyuki Tomita",
        "to": 205444
      },
      {
        "from": 205440,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Imaging findings of cutaneous angiosarcoma of the scalp: Comparison with cutaneous squamous cell carcinoma.\nPositions: \n#1 Masaya Kawaguchi\n#9 Masayuki Matsuo",
        "to": 219112
      },
      {
        "from": 205440,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Imaging findings of cutaneous angiosarcoma of the scalp: Comparison with cutaneous squamous cell carcinoma.\nPositions: \n#1 Masaya Kawaguchi\n#2 Hiroki Kato",
        "to": 219110
      },
      {
        "from": 205440,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Imaging findings of cutaneous angiosarcoma of the scalp: Comparison with cutaneous squamous cell carcinoma.\nPositions: \n#1 Masaya Kawaguchi\n#4 Tatsuhiko Miyazaki",
        "to": 205443
      },
      {
        "from": 205440,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Imaging findings of cutaneous angiosarcoma of the scalp: Comparison with cutaneous squamous cell carcinoma.\nPositions: \n#1 Masaya Kawaguchi\n#6 Akira Hara",
        "to": 205445
      },
      {
        "from": 205440,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Imaging findings of cutaneous angiosarcoma of the scalp: Comparison with cutaneous squamous cell carcinoma.\nPositions: \n#1 Masaya Kawaguchi\n#7 Kanako Matsuyama",
        "to": 205446
      },
      {
        "from": 205440,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Imaging findings of trichilemmal cyst and proliferating trichilemmal tumour.\nPositions: \n#1 Masaya Kawaguchi\n#2 Hiroki Kato",
        "to": 219110
      },
      {
        "from": 205440,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Imaging findings of trichilemmal cyst and proliferating trichilemmal tumour.\nPositions: \n#1 Masaya Kawaguchi\n#3 Natsuko Suzui",
        "to": 205442
      },
      {
        "from": 205440,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Imaging findings of trichilemmal cyst and proliferating trichilemmal tumour.\nPositions: \n#1 Masaya Kawaguchi\n#8 Mariko Seishima",
        "to": 205447
      },
      {
        "from": 205440,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Imaging findings of trichilemmal cyst and proliferating trichilemmal tumour.\nPositions: \n#1 Masaya Kawaguchi\n#5 Hiroyuki Tomita",
        "to": 205444
      },
      {
        "from": 205440,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Imaging findings of trichilemmal cyst and proliferating trichilemmal tumour.\nPositions: \n#1 Masaya Kawaguchi\n#7 Kanako Matsuyama",
        "to": 205446
      },
      {
        "from": 205440,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Imaging findings of trichilemmal cyst and proliferating trichilemmal tumour.\nPositions: \n#1 Masaya Kawaguchi\n#9 Masayuki Matsuo",
        "to": 219112
      },
      {
        "from": 205440,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Imaging findings of trichilemmal cyst and proliferating trichilemmal tumour.\nPositions: \n#1 Masaya Kawaguchi\n#6 Akira Hara",
        "to": 205445
      },
      {
        "from": 205440,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Imaging findings of trichilemmal cyst and proliferating trichilemmal tumour.\nPositions: \n#1 Masaya Kawaguchi\n#4 Tatsuhiko Miyazaki",
        "to": 205443
      },
      {
        "from": 196275,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Use of hydrochlorothiazide and risk of skin cancer in a large nested case-control study in Spain.\nPositions: \n#1 Luz M León-Muñoz\n#2 Talita Duarte-Salles",
        "to": 196276
      },
      {
        "from": 196275,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Use of hydrochlorothiazide and risk of skin cancer in a large nested case-control study in Spain.\nPositions: \n#1 Luz M León-Muñoz\n#6 Anton Pottegård",
        "to": 196280
      },
      {
        "from": 196275,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Use of hydrochlorothiazide and risk of skin cancer in a large nested case-control study in Spain.\nPositions: \n#1 Luz M León-Muñoz\n#8 Consuelo Huerta",
        "to": 196282
      },
      {
        "from": 196275,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Use of hydrochlorothiazide and risk of skin cancer in a large nested case-control study in Spain.\nPositions: \n#1 Luz M León-Muñoz\n#3 Ana Llorente",
        "to": 196277
      },
      {
        "from": 196275,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Use of hydrochlorothiazide and risk of skin cancer in a large nested case-control study in Spain.\nPositions: \n#1 Luz M León-Muñoz\n#7 Dolores Montero-Corominas",
        "to": 196281
      },
      {
        "from": 196275,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Use of hydrochlorothiazide and risk of skin cancer in a large nested case-control study in Spain.\nPositions: \n#1 Luz M León-Muñoz\n#5 Diana Puente",
        "to": 196279
      },
      {
        "from": 196275,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Use of hydrochlorothiazide and risk of skin cancer in a large nested case-control study in Spain.\nPositions: \n#1 Luz M León-Muñoz\n#4 Yesika Díaz",
        "to": 196278
      },
      {
        "from": 156718,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Malignant transformation of calcifying epithelial odontogenic tumour with solitary pulmonary metastasis.\nPositions: \n#1 A S Tabaksert\n#2 G Jenkins",
        "to": 156719
      },
      {
        "from": 156718,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Malignant transformation of calcifying epithelial odontogenic tumour with solitary pulmonary metastasis.\nPositions: \n#1 A S Tabaksert\n#4 J Adams",
        "to": 156721
      },
      {
        "from": 156718,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Malignant transformation of calcifying epithelial odontogenic tumour with solitary pulmonary metastasis.\nPositions: \n#1 A S Tabaksert\n#3 P Sloan",
        "to": 156720
      },
      {
        "from": 218172,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Lymph node and visceral progression without erythroderma or blood worsening in erythrodermic cutaneous T-cell lymphoma: nine cases.\nPositions: \n#1 C Skayem\n#5 C Ram-Wolff",
        "to": 218176
      },
      {
        "from": 218172,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Lymph node and visceral progression without erythroderma or blood worsening in erythrodermic cutaneous T-cell lymphoma: nine cases.\nPositions: \n#1 C Skayem\n#8 M Battistella",
        "to": 218179
      },
      {
        "from": 218172,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Lymph node and visceral progression without erythroderma or blood worsening in erythrodermic cutaneous T-cell lymphoma: nine cases.\nPositions: \n#1 C Skayem\n#3 A de Masson",
        "to": 218174
      },
      {
        "from": 218172,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Lymph node and visceral progression without erythroderma or blood worsening in erythrodermic cutaneous T-cell lymphoma: nine cases.\nPositions: \n#1 C Skayem\n#9 N Ortonne",
        "to": 218180
      },
      {
        "from": 218172,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Lymph node and visceral progression without erythroderma or blood worsening in erythrodermic cutaneous T-cell lymphoma: nine cases.\nPositions: \n#1 C Skayem\n#10 S Ingen-Housz-Oro",
        "to": 218181
      },
      {
        "from": 218172,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Lymph node and visceral progression without erythroderma or blood worsening in erythrodermic cutaneous T-cell lymphoma: nine cases.\nPositions: \n#1 C Skayem\n#4 O Dereure",
        "to": 218175
      },
      {
        "from": 218172,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Lymph node and visceral progression without erythroderma or blood worsening in erythrodermic cutaneous T-cell lymphoma: nine cases.\nPositions: \n#1 C Skayem\n#6 M Bagot",
        "to": 220195
      },
      {
        "from": 218172,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Lymph node and visceral progression without erythroderma or blood worsening in erythrodermic cutaneous T-cell lymphoma: nine cases.\nPositions: \n#1 C Skayem\n#7 B Vergier",
        "to": 218178
      },
      {
        "from": 218172,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Lymph node and visceral progression without erythroderma or blood worsening in erythrodermic cutaneous T-cell lymphoma: nine cases.\nPositions: \n#1 C Skayem\n#2 M Beylot-Barry",
        "to": 218187
      },
      {
        "from": 204171,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Mycosis fungoides-derived exosomes promote cell motility and are enriched with microRNA-155 and microRNA-1246, and their plasma-cell-free expression may serve as a potential biomarker for disease burden.\nPositions: \n#1 L Moyal\n#5 S Rosen",
        "to": 204175
      },
      {
        "from": 204171,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Mycosis fungoides-derived exosomes promote cell motility and are enriched with microRNA-155 and microRNA-1246, and their plasma-cell-free expression may serve as a potential biomarker for disease burden.\nPositions: \n#1 L Moyal\n#3 B Gorovitz-Haris",
        "to": 204173
      },
      {
        "from": 204171,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Mycosis fungoides-derived exosomes promote cell motility and are enriched with microRNA-155 and microRNA-1246, and their plasma-cell-free expression may serve as a potential biomarker for disease burden.\nPositions: \n#1 L Moyal\n#8 H Prag-Naveh",
        "to": 204178
      },
      {
        "from": 204171,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Mycosis fungoides-derived exosomes promote cell motility and are enriched with microRNA-155 and microRNA-1246, and their plasma-cell-free expression may serve as a potential biomarker for disease burden.\nPositions: \n#1 L Moyal\n#10 E Hodak",
        "to": 220194
      },
      {
        "from": 204171,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Mycosis fungoides-derived exosomes promote cell motility and are enriched with microRNA-155 and microRNA-1246, and their plasma-cell-free expression may serve as a potential biomarker for disease burden.\nPositions: \n#1 L Moyal\n#9 J Jacob-Hirsch",
        "to": 204179
      },
      {
        "from": 204171,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Mycosis fungoides-derived exosomes promote cell motility and are enriched with microRNA-155 and microRNA-1246, and their plasma-cell-free expression may serve as a potential biomarker for disease burden.\nPositions: \n#1 L Moyal\n#7 I Amitay-Laish",
        "to": 204177
      },
      {
        "from": 204171,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Mycosis fungoides-derived exosomes promote cell motility and are enriched with microRNA-155 and microRNA-1246, and their plasma-cell-free expression may serve as a potential biomarker for disease burden.\nPositions: \n#1 L Moyal\n#2 C Arkin",
        "to": 204172
      },
      {
        "from": 204171,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Mycosis fungoides-derived exosomes promote cell motility and are enriched with microRNA-155 and microRNA-1246, and their plasma-cell-free expression may serve as a potential biomarker for disease burden.\nPositions: \n#1 L Moyal\n#4 C Querfeld",
        "to": 204174
      },
      {
        "from": 204171,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Mycosis fungoides-derived exosomes promote cell motility and are enriched with microRNA-155 and microRNA-1246, and their plasma-cell-free expression may serve as a potential biomarker for disease burden.\nPositions: \n#1 L Moyal\n#6 J Knaneh",
        "to": 204176
      },
      {
        "from": 218030,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:The additional diagnostic value of optical coherence tomography in clinically diagnosed basal cell carcinomas undergoing direct surgical excision.\nPositions: \n#1 F Adan\n#6 K Mosterd",
        "to": 218035
      },
      {
        "from": 218030,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:The additional diagnostic value of optical coherence tomography in clinically diagnosed basal cell carcinomas undergoing direct surgical excision.\nPositions: \n#1 F Adan\n#2 P J Nelemans",
        "to": 218031
      },
      {
        "from": 218030,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:The additional diagnostic value of optical coherence tomography in clinically diagnosed basal cell carcinomas undergoing direct surgical excision.\nPositions: \n#1 F Adan\n#3 N W J Kelleners-Smeets",
        "to": 218032
      },
      {
        "from": 218030,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:The additional diagnostic value of optical coherence tomography in clinically diagnosed basal cell carcinomas undergoing direct surgical excision.\nPositions: \n#1 F Adan\n#5 T Brinkhuizen",
        "to": 218034
      },
      {
        "from": 218030,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:The additional diagnostic value of optical coherence tomography in clinically diagnosed basal cell carcinomas undergoing direct surgical excision.\nPositions: \n#1 F Adan\n#4 J P H M Kessels",
        "to": 218033
      },
      {
        "from": 220178,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Multicentric EORTC retrospective study shows efficacy of brentuximab vedotin in patients who have mycosis fungoides and Sézary syndrome with variable CD30 positivity.\nPositions: \n#1 E Papadavid\n#12 C Vico",
        "to": 220189
      },
      {
        "from": 220178,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Multicentric EORTC retrospective study shows efficacy of brentuximab vedotin in patients who have mycosis fungoides and Sézary syndrome with variable CD30 positivity.\nPositions: \n#1 E Papadavid\n#5 T Iliakis",
        "to": 220182
      },
      {
        "from": 220178,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Multicentric EORTC retrospective study shows efficacy of brentuximab vedotin in patients who have mycosis fungoides and Sézary syndrome with variable CD30 positivity.\nPositions: \n#1 E Papadavid\n#15 R Guiron",
        "to": 220192
      },
      {
        "from": 220178,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Multicentric EORTC retrospective study shows efficacy of brentuximab vedotin in patients who have mycosis fungoides and Sézary syndrome with variable CD30 positivity.\nPositions: \n#1 E Papadavid\n#18 M Bagot",
        "to": 220195
      },
      {
        "from": 220178,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Multicentric EORTC retrospective study shows efficacy of brentuximab vedotin in patients who have mycosis fungoides and Sézary syndrome with variable CD30 positivity.\nPositions: \n#1 E Papadavid\n#4 V Nikolaou",
        "to": 220181
      },
      {
        "from": 220178,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Multicentric EORTC retrospective study shows efficacy of brentuximab vedotin in patients who have mycosis fungoides and Sézary syndrome with variable CD30 positivity.\nPositions: \n#1 E Papadavid\n#19 J Scarisbrick",
        "to": 220196
      },
      {
        "from": 220178,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Multicentric EORTC retrospective study shows efficacy of brentuximab vedotin in patients who have mycosis fungoides and Sézary syndrome with variable CD30 positivity.\nPositions: \n#1 E Papadavid\n#8 S Porkert",
        "to": 220185
      },
      {
        "from": 220178,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Multicentric EORTC retrospective study shows efficacy of brentuximab vedotin in patients who have mycosis fungoides and Sézary syndrome with variable CD30 positivity.\nPositions: \n#1 E Papadavid\n#10 P Quaglino",
        "to": 220187
      },
      {
        "from": 220178,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Multicentric EORTC retrospective study shows efficacy of brentuximab vedotin in patients who have mycosis fungoides and Sézary syndrome with variable CD30 positivity.\nPositions: \n#1 E Papadavid\n#13 A Cozzio",
        "to": 220190
      },
      {
        "from": 220178,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Multicentric EORTC retrospective study shows efficacy of brentuximab vedotin in patients who have mycosis fungoides and Sézary syndrome with variable CD30 positivity.\nPositions: \n#1 E Papadavid\n#3 V Pappa",
        "to": 220180
      },
      {
        "from": 220178,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Multicentric EORTC retrospective study shows efficacy of brentuximab vedotin in patients who have mycosis fungoides and Sézary syndrome with variable CD30 positivity.\nPositions: \n#1 E Papadavid\n#6 M Dalamaga",
        "to": 220183
      },
      {
        "from": 220178,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Multicentric EORTC retrospective study shows efficacy of brentuximab vedotin in patients who have mycosis fungoides and Sézary syndrome with variable CD30 positivity.\nPositions: \n#1 E Papadavid\n#11 P L Ortiz-Romero",
        "to": 220188
      },
      {
        "from": 220178,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Multicentric EORTC retrospective study shows efficacy of brentuximab vedotin in patients who have mycosis fungoides and Sézary syndrome with variable CD30 positivity.\nPositions: \n#1 E Papadavid\n#17 E Hodak",
        "to": 220194
      },
      {
        "from": 220178,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Multicentric EORTC retrospective study shows efficacy of brentuximab vedotin in patients who have mycosis fungoides and Sézary syndrome with variable CD30 positivity.\nPositions: \n#1 E Papadavid\n#2 E Kapniari",
        "to": 220179
      },
      {
        "from": 220178,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Multicentric EORTC retrospective study shows efficacy of brentuximab vedotin in patients who have mycosis fungoides and Sézary syndrome with variable CD30 positivity.\nPositions: \n#1 E Papadavid\n#7 C Jonak",
        "to": 220184
      },
      {
        "from": 220178,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Multicentric EORTC retrospective study shows efficacy of brentuximab vedotin in patients who have mycosis fungoides and Sézary syndrome with variable CD30 positivity.\nPositions: \n#1 E Papadavid\n#9 S Engelina",
        "to": 220186
      },
      {
        "from": 220178,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Multicentric EORTC retrospective study shows efficacy of brentuximab vedotin in patients who have mycosis fungoides and Sézary syndrome with variable CD30 positivity.\nPositions: \n#1 E Papadavid\n#16 E Guenova",
        "to": 220193
      },
      {
        "from": 220178,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Multicentric EORTC retrospective study shows efficacy of brentuximab vedotin in patients who have mycosis fungoides and Sézary syndrome with variable CD30 positivity.\nPositions: \n#1 E Papadavid\n#14 F Dimitriou",
        "to": 220191
      },
      {
        "from": 203655,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:British Association of Dermatologists guidelines for the management of adults with basal cell carcinoma 2021.\nPositions: \n#1 I Nasr\n#11 S Hoey",
        "to": 203665
      },
      {
        "from": 203655,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:British Association of Dermatologists guidelines for the management of adults with basal cell carcinoma 2021.\nPositions: \n#1 I Nasr\n#7 P Fairbrother",
        "to": 203661
      },
      {
        "from": 203655,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:British Association of Dermatologists guidelines for the management of adults with basal cell carcinoma 2021.\nPositions: \n#1 I Nasr\n#9 G Gupta",
        "to": 203663
      },
      {
        "from": 203655,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:British Association of Dermatologists guidelines for the management of adults with basal cell carcinoma 2021.\nPositions: \n#1 I Nasr\n#14 E Mallon",
        "to": 203668
      },
      {
        "from": 203655,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:British Association of Dermatologists guidelines for the management of adults with basal cell carcinoma 2021.\nPositions: \n#1 I Nasr\n#8 K Fife",
        "to": 203662
      },
      {
        "from": 203655,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:British Association of Dermatologists guidelines for the management of adults with basal cell carcinoma 2021.\nPositions: \n#1 I Nasr\n#17 J Newman",
        "to": 203671
      },
      {
        "from": 203655,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:British Association of Dermatologists guidelines for the management of adults with basal cell carcinoma 2021.\nPositions: \n#1 I Nasr\n#18 E V Pynn",
        "to": 203672
      },
      {
        "from": 203655,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:British Association of Dermatologists guidelines for the management of adults with basal cell carcinoma 2021.\nPositions: \n#1 I Nasr\n#19 N Shroff",
        "to": 203673
      },
      {
        "from": 203655,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:British Association of Dermatologists guidelines for the management of adults with basal cell carcinoma 2021.\nPositions: \n#1 I Nasr\n#15 R J Motley",
        "to": 203669
      },
      {
        "from": 203655,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:British Association of Dermatologists guidelines for the management of adults with basal cell carcinoma 2021.\nPositions: \n#1 I Nasr\n#6 P G Budny",
        "to": 203660
      },
      {
        "from": 203655,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:British Association of Dermatologists guidelines for the management of adults with basal cell carcinoma 2021.\nPositions: \n#1 I Nasr\n#22 M F Mohd Mustapa",
        "to": 203676
      },
      {
        "from": 203655,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:British Association of Dermatologists guidelines for the management of adults with basal cell carcinoma 2021.\nPositions: \n#1 I Nasr\n#3 C A Harwood",
        "to": 203657
      },
      {
        "from": 203655,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:British Association of Dermatologists guidelines for the management of adults with basal cell carcinoma 2021.\nPositions: \n#1 I Nasr\n#4 J Botting",
        "to": 203658
      },
      {
        "from": 203655,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:British Association of Dermatologists guidelines for the management of adults with basal cell carcinoma 2021.\nPositions: \n#1 I Nasr\n#23 M C Ezejimofor",
        "to": 203677
      },
      {
        "from": 203655,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:British Association of Dermatologists guidelines for the management of adults with basal cell carcinoma 2021.\nPositions: \n#1 I Nasr\n#20 D N Slater",
        "to": 203674
      },
      {
        "from": 203655,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:British Association of Dermatologists guidelines for the management of adults with basal cell carcinoma 2021.\nPositions: \n#1 I Nasr\n#5 P Buckley",
        "to": 203659
      },
      {
        "from": 203655,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:British Association of Dermatologists guidelines for the management of adults with basal cell carcinoma 2021.\nPositions: \n#1 I Nasr\n#24 British Association of Dermatologists’ Clinical Standards Unit",
        "to": 203678
      },
      {
        "from": 203655,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:British Association of Dermatologists guidelines for the management of adults with basal cell carcinoma 2021.\nPositions: \n#1 I Nasr\n#10 M Hashme",
        "to": 203664
      },
      {
        "from": 203655,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:British Association of Dermatologists guidelines for the management of adults with basal cell carcinoma 2021.\nPositions: \n#1 I Nasr\n#2 E J McGrath",
        "to": 203656
      },
      {
        "from": 203655,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:British Association of Dermatologists guidelines for the management of adults with basal cell carcinoma 2021.\nPositions: \n#1 I Nasr\n#16 C Newlands",
        "to": 203670
      },
      {
        "from": 203655,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:British Association of Dermatologists guidelines for the management of adults with basal cell carcinoma 2021.\nPositions: \n#1 I Nasr\n#21 L S Exton",
        "to": 203675
      },
      {
        "from": 203655,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:British Association of Dermatologists guidelines for the management of adults with basal cell carcinoma 2021.\nPositions: \n#1 I Nasr\n#12 J T Lear",
        "to": 203666
      },
      {
        "from": 203655,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:British Association of Dermatologists guidelines for the management of adults with basal cell carcinoma 2021.\nPositions: \n#1 I Nasr\n#13 R Mallipeddi",
        "to": 203667
      },
      {
        "from": 186249,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Views on mobile health apps for skin cancer screening in the general population: an in-depth qualitative exploration of perceived barriers and facilitators.\nPositions: \n#1 T E Sangers\n#2 M Wakkee",
        "to": 186250
      },
      {
        "from": 186249,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Views on mobile health apps for skin cancer screening in the general population: an in-depth qualitative exploration of perceived barriers and facilitators.\nPositions: \n#1 T E Sangers\n#4 T Nijsten",
        "to": 186252
      },
      {
        "from": 186249,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Views on mobile health apps for skin cancer screening in the general population: an in-depth qualitative exploration of perceived barriers and facilitators.\nPositions: \n#1 T E Sangers\n#3 E C Kramer-Noels",
        "to": 186251
      },
      {
        "from": 186249,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Views on mobile health apps for skin cancer screening in the general population: an in-depth qualitative exploration of perceived barriers and facilitators.\nPositions: \n#1 T E Sangers\n#5 M Lugtenberg",
        "to": 186253
      },
      {
        "from": 213507,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Cemiplimab-rwlc in advanced cutaneous squamous cell carcinoma: real-world experience in a French dermatology department.\nPositions: \n#1 T Guillaume\n#5 C Nardin",
        "to": 213511
      },
      {
        "from": 213507,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Cemiplimab-rwlc in advanced cutaneous squamous cell carcinoma: real-world experience in a French dermatology department.\nPositions: \n#1 T Guillaume\n#3 D Popescu",
        "to": 213509
      },
      {
        "from": 213507,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Cemiplimab-rwlc in advanced cutaneous squamous cell carcinoma: real-world experience in a French dermatology department.\nPositions: \n#1 T Guillaume\n#2 E Puzenat",
        "to": 213508
      },
      {
        "from": 213507,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Cemiplimab-rwlc in advanced cutaneous squamous cell carcinoma: real-world experience in a French dermatology department.\nPositions: \n#1 T Guillaume\n#4 F Aubin",
        "to": 213510
      },
      {
        "from": 186241,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Domains and outcomes of the core outcome set of congenital melanocytic naevi for clinical practice and research : part 2.\nPositions: \n#1 A C Fledderus\n#5 H C Etchevers",
        "to": 186245
      },
      {
        "from": 186241,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Domains and outcomes of the core outcome set of congenital melanocytic naevi for clinical practice and research : part 2.\nPositions: \n#1 A C Fledderus\n#6 M S van Kessel",
        "to": 186246
      },
      {
        "from": 186241,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Domains and outcomes of the core outcome set of congenital melanocytic naevi for clinical practice and research : part 2.\nPositions: \n#1 A C Fledderus\n#4 W Oei",
        "to": 186244
      },
      {
        "from": 186241,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Domains and outcomes of the core outcome set of congenital melanocytic naevi for clinical practice and research : part 2.\nPositions: \n#1 A C Fledderus\n#2 S G M A Pasmans",
        "to": 186242
      },
      {
        "from": 186241,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Domains and outcomes of the core outcome set of congenital melanocytic naevi for clinical practice and research : part 2.\nPositions: \n#1 A C Fledderus\n#7 C M A M van der Horst",
        "to": 186247
      },
      {
        "from": 186241,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Domains and outcomes of the core outcome set of congenital melanocytic naevi for clinical practice and research : part 2.\nPositions: \n#1 A C Fledderus\n#8 P I Spuls",
        "to": 220164
      },
      {
        "from": 186241,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Domains and outcomes of the core outcome set of congenital melanocytic naevi for clinical practice and research : part 2.\nPositions: \n#1 A C Fledderus\n#3 A Wolkerstorfer",
        "to": 186243
      },
      {
        "from": 220184,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Single-cell RNA sequencing profiling in a patient with discordant primary cutaneous B-cell and T-cell lymphoma reveals micromilieu-driven immune skewing.\nPositions: \n#1 C Jonak\n#8 F Trautinger",
        "to": 196897
      },
      {
        "from": 220184,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Single-cell RNA sequencing profiling in a patient with discordant primary cutaneous B-cell and T-cell lymphoma reveals micromilieu-driven immune skewing.\nPositions: \n#1 C Jonak\n#13 P M Brunner",
        "to": 196902
      },
      {
        "from": 220184,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Single-cell RNA sequencing profiling in a patient with discordant primary cutaneous B-cell and T-cell lymphoma reveals micromilieu-driven immune skewing.\nPositions: \n#1 C Jonak\n#12 M Farlik",
        "to": 196901
      },
      {
        "from": 220184,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Single-cell RNA sequencing profiling in a patient with discordant primary cutaneous B-cell and T-cell lymphoma reveals micromilieu-driven immune skewing.\nPositions: \n#1 C Jonak\n#9 G Stingl",
        "to": 196898
      },
      {
        "from": 220184,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Single-cell RNA sequencing profiling in a patient with discordant primary cutaneous B-cell and T-cell lymphoma reveals micromilieu-driven immune skewing.\nPositions: \n#1 C Jonak\n#4 T B Rojahn",
        "to": 196893
      },
      {
        "from": 220184,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Single-cell RNA sequencing profiling in a patient with discordant primary cutaneous B-cell and T-cell lymphoma reveals micromilieu-driven immune skewing.\nPositions: \n#1 C Jonak\n#3 K Rindler",
        "to": 196892
      },
      {
        "from": 220184,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Single-cell RNA sequencing profiling in a patient with discordant primary cutaneous B-cell and T-cell lymphoma reveals micromilieu-driven immune skewing.\nPositions: \n#1 C Jonak\n#5 L E Shaw",
        "to": 196894
      },
      {
        "from": 220184,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Single-cell RNA sequencing profiling in a patient with discordant primary cutaneous B-cell and T-cell lymphoma reveals micromilieu-driven immune skewing.\nPositions: \n#1 C Jonak\n#6 S Porkert",
        "to": 220185
      },
      {
        "from": 220184,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Single-cell RNA sequencing profiling in a patient with discordant primary cutaneous B-cell and T-cell lymphoma reveals micromilieu-driven immune skewing.\nPositions: \n#1 C Jonak\n#11 L Cerroni",
        "to": 196900
      },
      {
        "from": 220184,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Single-cell RNA sequencing profiling in a patient with discordant primary cutaneous B-cell and T-cell lymphoma reveals micromilieu-driven immune skewing.\nPositions: \n#1 C Jonak\n#10 P Tschandl",
        "to": 196899
      },
      {
        "from": 220184,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Single-cell RNA sequencing profiling in a patient with discordant primary cutaneous B-cell and T-cell lymphoma reveals micromilieu-driven immune skewing.\nPositions: \n#1 C Jonak\n#7 W Weninger",
        "to": 196896
      },
      {
        "from": 220184,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Single-cell RNA sequencing profiling in a patient with discordant primary cutaneous B-cell and T-cell lymphoma reveals micromilieu-driven immune skewing.\nPositions: \n#1 C Jonak\n#2 N Alkon",
        "to": 196891
      },
      {
        "from": 188067,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Plastic-surgical coverage of an extended defect on the scalp using a bipedicled vascularised flap after removal of two cutaneous squamous epithelial carcinomas.\nPositions: \n#1 Nils Heim\n#2 Christian Tim Wilms",
        "to": 188068
      },
      {
        "from": 193076,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Visceral Kaposi's sarcoma.\nPositions: \n#1 I Solares\n#2 J Salas Jarque",
        "to": 192890
      },
      {
        "from": 193076,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Visceral Kaposi's sarcoma.\nPositions: \n#1 I Solares\n#3 M A Pérez-Jacoiste Asín",
        "to": 192891
      },
      {
        "from": 204063,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Reply to: Metformin use and keratinocyte carcinoma risk.\nPositions: \n#1 Jonas A Adalsteinsson\n#5 Laufey Tryggvadottir",
        "to": 204067
      },
      {
        "from": 204063,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Reply to: Metformin use and keratinocyte carcinoma risk.\nPositions: \n#1 Jonas A Adalsteinsson\n#2 Reid Waldman",
        "to": 204064
      },
      {
        "from": 204063,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Reply to: Metformin use and keratinocyte carcinoma risk.\nPositions: \n#1 Jonas A Adalsteinsson\n#3 Désirée Ratner",
        "to": 204065
      },
      {
        "from": 204063,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Reply to: Metformin use and keratinocyte carcinoma risk.\nPositions: \n#1 Jonas A Adalsteinsson\n#4 Hao Feng",
        "to": 212768
      },
      {
        "from": 204063,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Reply to: Metformin use and keratinocyte carcinoma risk.\nPositions: \n#1 Jonas A Adalsteinsson\n#6 Jon Gunnlaugur Jonasson",
        "to": 204068
      },
      {
        "from": 74271,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Median raphe cysts in children: an image diagnosis but a therapeutic challenge.\nPositions: \n#1 Anca Chiriac\n#5 Simona Stolnicu",
        "to": 74273
      },
      {
        "from": 74271,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Median raphe cysts in children: an image diagnosis but a therapeutic challenge.\nPositions: \n#1 Anca Chiriac\n#4 Adrian Naznean",
        "to": 56732
      },
      {
        "from": 74271,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Median raphe cysts in children: an image diagnosis but a therapeutic challenge.\nPositions: \n#1 Anca Chiriac\n#3 Bogdan Dobrovat",
        "to": 56731
      },
      {
        "from": 74271,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Median raphe cysts in children: an image diagnosis but a therapeutic challenge.\nPositions: \n#1 Anca Chiriac\n#2 Cristian Podoleanu",
        "to": 74272
      },
      {
        "from": 99523,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Nevus depigmentosus: the analysis of 37 cases.\nPositions: \n#1 Khalifa E Sharquie\n#2 Fatema A Al-Jaralla",
        "to": 99524
      },
      {
        "from": 99523,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Nevus depigmentosus: the analysis of 37 cases.\nPositions: \n#1 Khalifa E Sharquie\n#4 Reem M Alhyali",
        "to": 99526
      },
      {
        "from": 99523,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Nevus depigmentosus: the analysis of 37 cases.\nPositions: \n#1 Khalifa E Sharquie\n#3 Robert A Schwartz",
        "to": 99525
      },
      {
        "from": 57053,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Onset of breast basal cell carcinomas during pregnancy: state of the art.\nPositions: \n#1 Giovanni Paolino\n#2 Pietro Bearzi",
        "to": 52196
      },
      {
        "from": 57053,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Onset of breast basal cell carcinomas during pregnancy: state of the art.\nPositions: \n#1 Giovanni Paolino\n#5 Pietro Donati",
        "to": 52199
      },
      {
        "from": 57053,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Onset of breast basal cell carcinomas during pregnancy: state of the art.\nPositions: \n#1 Giovanni Paolino\n#3 Rowit Q Kumar",
        "to": 52197
      },
      {
        "from": 57053,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Onset of breast basal cell carcinomas during pregnancy: state of the art.\nPositions: \n#1 Giovanni Paolino\n#7 Santo R Mercuri",
        "to": 52201
      },
      {
        "from": 57053,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Onset of breast basal cell carcinomas during pregnancy: state of the art.\nPositions: \n#1 Giovanni Paolino\n#6 Chiara Panetta",
        "to": 52200
      },
      {
        "from": 57053,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Onset of breast basal cell carcinomas during pregnancy: state of the art.\nPositions: \n#1 Giovanni Paolino\n#4 Luigi Losco",
        "to": 52198
      },
      {
        "from": 81133,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Unexpected intranasal basal cell carcinoma.\nPositions: \n#1 Monia DI Prete\n#6 Caterina Lanna",
        "to": 81138
      },
      {
        "from": 81133,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Unexpected intranasal basal cell carcinoma.\nPositions: \n#1 Monia DI Prete\n#7 Augusto Orlandi",
        "to": 81139
      },
      {
        "from": 81133,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Unexpected intranasal basal cell carcinoma.\nPositions: \n#1 Monia DI Prete\n#9 Elena Campione",
        "to": 100837
      },
      {
        "from": 81133,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Unexpected intranasal basal cell carcinoma.\nPositions: \n#1 Monia DI Prete\n#4 Alessia Lanzillotta",
        "to": 81136
      },
      {
        "from": 81133,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Unexpected intranasal basal cell carcinoma.\nPositions: \n#1 Monia DI Prete\n#8 Luca Bianchi",
        "to": 100838
      },
      {
        "from": 81133,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Unexpected intranasal basal cell carcinoma.\nPositions: \n#1 Monia DI Prete\n#10 Stefano DI Girolamo",
        "to": 81142
      },
      {
        "from": 81133,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Unexpected intranasal basal cell carcinoma.\nPositions: \n#1 Monia DI Prete\n#3 Rita DE Berardinis",
        "to": 81135
      },
      {
        "from": 81133,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Unexpected intranasal basal cell carcinoma.\nPositions: \n#1 Monia DI Prete\n#5 Flavia Lozzi",
        "to": 81137
      },
      {
        "from": 81133,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Unexpected intranasal basal cell carcinoma.\nPositions: \n#1 Monia DI Prete\n#2 Terenzio Cosio",
        "to": 81134
      },
      {
        "from": 81143,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Bilateral ovarian involvement as the first site of melanoma metastasis.\nPositions: \n#1 Claudio Conforti\n#9 Nicola DI Meo",
        "to": 81151
      },
      {
        "from": 81143,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Bilateral ovarian involvement as the first site of melanoma metastasis.\nPositions: \n#1 Claudio Conforti\n#4 Giovanni Magaton-Rizzi",
        "to": 81146
      },
      {
        "from": 81143,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Bilateral ovarian involvement as the first site of melanoma metastasis.\nPositions: \n#1 Claudio Conforti\n#8 Iris Zalaudek",
        "to": 81150
      },
      {
        "from": 81143,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Bilateral ovarian involvement as the first site of melanoma metastasis.\nPositions: \n#1 Claudio Conforti\n#3 Roberta Vezzoni",
        "to": 81145
      },
      {
        "from": 81143,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Bilateral ovarian involvement as the first site of melanoma metastasis.\nPositions: \n#1 Claudio Conforti\n#7 Maria A Cova",
        "to": 81149
      },
      {
        "from": 81143,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Bilateral ovarian involvement as the first site of melanoma metastasis.\nPositions: \n#1 Claudio Conforti\n#5 Roberta Giuffrida",
        "to": 81147
      },
      {
        "from": 81143,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Bilateral ovarian involvement as the first site of melanoma metastasis.\nPositions: \n#1 Claudio Conforti\n#2 Chiara Retrosi",
        "to": 81144
      },
      {
        "from": 81143,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Bilateral ovarian involvement as the first site of melanoma metastasis.\nPositions: \n#1 Claudio Conforti\n#6 Ferruccio Degrassi",
        "to": 81148
      },
      {
        "from": 89696,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Sézary Syndrome: a clinico-pathological study of 9 cases.\nPositions: \n#1 Vittorio Bolcato\n#2 Stefania Barruscotti",
        "to": 89697
      },
      {
        "from": 89696,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Sézary Syndrome: a clinico-pathological study of 9 cases.\nPositions: \n#1 Vittorio Bolcato\n#4 Carlo F Tomasini",
        "to": 89699
      },
      {
        "from": 89696,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Sézary Syndrome: a clinico-pathological study of 9 cases.\nPositions: \n#1 Vittorio Bolcato\n#3 Annalisa DE Silvestri",
        "to": 89698
      },
      {
        "from": 89696,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Sézary Syndrome: a clinico-pathological study of 9 cases.\nPositions: \n#1 Vittorio Bolcato\n#5 Valeria Brazzelli",
        "to": 118621
      },
      {
        "from": 81152,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Superhigh magnification dermoscopy and management of a pediatric Spitz nevus mimicking melanoma.\nPositions: \n#1 Luca Provvidenziale\n#3 Marco Campoli",
        "to": 81154
      },
      {
        "from": 81152,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Superhigh magnification dermoscopy and management of a pediatric Spitz nevus mimicking melanoma.\nPositions: \n#1 Luca Provvidenziale\n#2 Elisa Cinotti",
        "to": 86264
      },
      {
        "from": 81152,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Superhigh magnification dermoscopy and management of a pediatric Spitz nevus mimicking melanoma.\nPositions: \n#1 Luca Provvidenziale\n#4 Pietro Rubegni",
        "to": 86263
      },
      {
        "from": 52202,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Immunohistochemical expression and prognostic role of CD10, CD271 and Nestin in primary and recurrent cutaneous melanoma.\nPositions: \n#1 Elena Guanziroli\n#8 Emilio Berti",
        "to": 118615
      },
      {
        "from": 52202,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Immunohistochemical expression and prognostic role of CD10, CD271 and Nestin in primary and recurrent cutaneous melanoma.\nPositions: \n#1 Elena Guanziroli\n#6 Stefano Ferrero",
        "to": 52207
      },
      {
        "from": 52202,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Immunohistochemical expression and prognostic role of CD10, CD271 and Nestin in primary and recurrent cutaneous melanoma.\nPositions: \n#1 Elena Guanziroli\n#9 Alessandro Del Gobbo",
        "to": 52210
      },
      {
        "from": 52202,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Immunohistochemical expression and prognostic role of CD10, CD271 and Nestin in primary and recurrent cutaneous melanoma.\nPositions: \n#1 Elena Guanziroli\n#2 Luigia Venegoni",
        "to": 52203
      },
      {
        "from": 52202,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Immunohistochemical expression and prognostic role of CD10, CD271 and Nestin in primary and recurrent cutaneous melanoma.\nPositions: \n#1 Elena Guanziroli\n#7 Raffaele Gianotti",
        "to": 52208
      },
      {
        "from": 52202,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Immunohistochemical expression and prognostic role of CD10, CD271 and Nestin in primary and recurrent cutaneous melanoma.\nPositions: \n#1 Elena Guanziroli\n#4 Stefano Cavicchini",
        "to": 52205
      },
      {
        "from": 52202,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Immunohistochemical expression and prognostic role of CD10, CD271 and Nestin in primary and recurrent cutaneous melanoma.\nPositions: \n#1 Elena Guanziroli\n#5 Antonella Coggi",
        "to": 52206
      },
      {
        "from": 52202,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Immunohistochemical expression and prognostic role of CD10, CD271 and Nestin in primary and recurrent cutaneous melanoma.\nPositions: \n#1 Elena Guanziroli\n#3 Daniele Fanoni",
        "to": 52204
      },
      {
        "from": 67999,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Iatrogenic Kaposi sarcoma during tumor necrosis factor alpha inhibitors.\nPositions: \n#1 Alba Guglielmo\n#4 Andrea Belluzzi",
        "to": 68002
      },
      {
        "from": 67999,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Iatrogenic Kaposi sarcoma during tumor necrosis factor alpha inhibitors.\nPositions: \n#1 Alba Guglielmo\n#2 Clara Bertuzzi",
        "to": 68000
      },
      {
        "from": 67999,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Iatrogenic Kaposi sarcoma during tumor necrosis factor alpha inhibitors.\nPositions: \n#1 Alba Guglielmo\n#6 Annalisa Patrizi",
        "to": 146917
      },
      {
        "from": 67999,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Iatrogenic Kaposi sarcoma during tumor necrosis factor alpha inhibitors.\nPositions: \n#1 Alba Guglielmo\n#3 Eleonora Scaioli",
        "to": 68001
      },
      {
        "from": 67999,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Iatrogenic Kaposi sarcoma during tumor necrosis factor alpha inhibitors.\nPositions: \n#1 Alba Guglielmo\n#5 Elena Sabattini",
        "to": 68003
      },
      {
        "from": 67999,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Iatrogenic Kaposi sarcoma during tumor necrosis factor alpha inhibitors.\nPositions: \n#1 Alba Guglielmo\n#7 Alessandro Pileri",
        "to": 118637
      },
      {
        "from": 89711,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Cancer duplicity: a case of chronic lymphocytic leukemia and metastatic melanoma treated with Ipilimumab.\nPositions: \n#1 Giulia Spallone\n#3 Mauro Mazzeo",
        "to": 89713
      },
      {
        "from": 89711,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Cancer duplicity: a case of chronic lymphocytic leukemia and metastatic melanoma treated with Ipilimumab.\nPositions: \n#1 Giulia Spallone\n#2 Alessandra Ventura",
        "to": 89712
      },
      {
        "from": 89711,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Cancer duplicity: a case of chronic lymphocytic leukemia and metastatic melanoma treated with Ipilimumab.\nPositions: \n#1 Giulia Spallone\n#4 Cosimo DI Raimondo",
        "to": 89714
      },
      {
        "from": 89711,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Cancer duplicity: a case of chronic lymphocytic leukemia and metastatic melanoma treated with Ipilimumab.\nPositions: \n#1 Giulia Spallone\n#6 Dionisio Silvaggio",
        "to": 100834
      },
      {
        "from": 89711,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Cancer duplicity: a case of chronic lymphocytic leukemia and metastatic melanoma treated with Ipilimumab.\nPositions: \n#1 Giulia Spallone\n#7 Luca Bianchi",
        "to": 100838
      },
      {
        "from": 89711,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Cancer duplicity: a case of chronic lymphocytic leukemia and metastatic melanoma treated with Ipilimumab.\nPositions: \n#1 Giulia Spallone\n#5 Paolo Lombardo",
        "to": 89715
      },
      {
        "from": 2167,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Measuring the horizontal and vertical growth rates of superficial spreading melanoma: a pilot study with sequential digital dermoscopy.\nPositions: \n#1 Vito Ingordo\n#2 Luca Feci",
        "to": 2168
      },
      {
        "from": 2167,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Measuring the horizontal and vertical growth rates of superficial spreading melanoma: a pilot study with sequential digital dermoscopy.\nPositions: \n#1 Vito Ingordo\n#5 Irene Ingordo",
        "to": 2171
      },
      {
        "from": 2167,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Measuring the horizontal and vertical growth rates of superficial spreading melanoma: a pilot study with sequential digital dermoscopy.\nPositions: \n#1 Vito Ingordo\n#4 Luigi Naldi",
        "to": 172767
      },
      {
        "from": 2167,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Measuring the horizontal and vertical growth rates of superficial spreading melanoma: a pilot study with sequential digital dermoscopy.\nPositions: \n#1 Vito Ingordo\n#6 Riccardo Sirna",
        "to": 2172
      },
      {
        "from": 2167,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Measuring the horizontal and vertical growth rates of superficial spreading melanoma: a pilot study with sequential digital dermoscopy.\nPositions: \n#1 Vito Ingordo\n#3 Simone Cazzaniga",
        "to": 52757
      },
      {
        "from": 118637,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Second neoplasm in cutaneous T-cell lymphoma patients: a marker of worse prognosis?\nPositions: \n#1 Alessandro Pileri\n#5 Annalisa Patrizi",
        "to": 146917
      },
      {
        "from": 118637,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Second neoplasm in cutaneous T-cell lymphoma patients: a marker of worse prognosis?\nPositions: \n#1 Alessandro Pileri\n#3 Fabio Fuligni",
        "to": 1668
      },
      {
        "from": 118637,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Second neoplasm in cutaneous T-cell lymphoma patients: a marker of worse prognosis?\nPositions: \n#1 Alessandro Pileri\n#7 Italian Lymphoma Foundation (FIL) - Cutaneous Lymphoma Task Force",
        "to": 1672
      },
      {
        "from": 118637,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Second neoplasm in cutaneous T-cell lymphoma patients: a marker of worse prognosis?\nPositions: \n#1 Alessandro Pileri\n#6 Nicola Pimpinelli",
        "to": 118647
      },
      {
        "from": 118637,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Second neoplasm in cutaneous T-cell lymphoma patients: a marker of worse prognosis?\nPositions: \n#1 Alessandro Pileri\n#2 Alba Guglielmo",
        "to": 67999
      },
      {
        "from": 118637,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Second neoplasm in cutaneous T-cell lymphoma patients: a marker of worse prognosis?\nPositions: \n#1 Alessandro Pileri\n#4 Irene Lastrucci",
        "to": 3847
      },
      {
        "from": 6390,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Atopic dermatitis and mycosis fungoides in a child: an overlooked association.\nPositions: \n#1 Andrea Sechi\n#4 Clara Bertuzzi",
        "to": 68000
      },
      {
        "from": 6390,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Atopic dermatitis and mycosis fungoides in a child: an overlooked association.\nPositions: \n#1 Andrea Sechi\n#5 Iria Neri",
        "to": 52368
      },
      {
        "from": 6390,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Atopic dermatitis and mycosis fungoides in a child: an overlooked association.\nPositions: \n#1 Andrea Sechi\n#2 Alba Guglielmo",
        "to": 67999
      },
      {
        "from": 6390,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Atopic dermatitis and mycosis fungoides in a child: an overlooked association.\nPositions: \n#1 Andrea Sechi\n#6 Alessandro Pileri",
        "to": 118637
      },
      {
        "from": 6390,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Atopic dermatitis and mycosis fungoides in a child: an overlooked association.\nPositions: \n#1 Andrea Sechi\n#3 Annalisa Patrizi",
        "to": 146917
      },
      {
        "from": 3830,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Basal cell carcinoma thickness evaluated by high-frequency ultrasounds and correlation with dermoscopic features.\nPositions: \n#1 Rosa Coppola\n#7 Michele Donati",
        "to": 67987
      },
      {
        "from": 3830,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Basal cell carcinoma thickness evaluated by high-frequency ultrasounds and correlation with dermoscopic features.\nPositions: \n#1 Rosa Coppola\n#9 Stefania Tenna",
        "to": 3838
      },
      {
        "from": 3830,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Basal cell carcinoma thickness evaluated by high-frequency ultrasounds and correlation with dermoscopic features.\nPositions: \n#1 Rosa Coppola\n#2 Mauro Barone",
        "to": 3831
      },
      {
        "from": 3830,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Basal cell carcinoma thickness evaluated by high-frequency ultrasounds and correlation with dermoscopic features.\nPositions: \n#1 Rosa Coppola\n#10 Paolo Persichetti",
        "to": 3839
      },
      {
        "from": 3830,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Basal cell carcinoma thickness evaluated by high-frequency ultrasounds and correlation with dermoscopic features.\nPositions: \n#1 Rosa Coppola\n#4 Valeria Devirgiliis",
        "to": 3833
      },
      {
        "from": 3830,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Basal cell carcinoma thickness evaluated by high-frequency ultrasounds and correlation with dermoscopic features.\nPositions: \n#1 Rosa Coppola\n#5 Vincenzo Roberti",
        "to": 3834
      },
      {
        "from": 3830,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Basal cell carcinoma thickness evaluated by high-frequency ultrasounds and correlation with dermoscopic features.\nPositions: \n#1 Rosa Coppola\n#6 Eleonora Perrella",
        "to": 3835
      },
      {
        "from": 3830,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Basal cell carcinoma thickness evaluated by high-frequency ultrasounds and correlation with dermoscopic features.\nPositions: \n#1 Rosa Coppola\n#8 Enzo Palese",
        "to": 3837
      },
      {
        "from": 3830,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Basal cell carcinoma thickness evaluated by high-frequency ultrasounds and correlation with dermoscopic features.\nPositions: \n#1 Rosa Coppola\n#11 Vincenzo Panasiti",
        "to": 3840
      },
      {
        "from": 3830,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Basal cell carcinoma thickness evaluated by high-frequency ultrasounds and correlation with dermoscopic features.\nPositions: \n#1 Rosa Coppola\n#3 Salvatore Zanframundo",
        "to": 3832
      },
      {
        "from": 5565,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Surgical procedures in melanoma: recommended deep and lateral margins, indications for sentinel lymph node biopsy, and complete lymph node dissection.\nPositions: \n#1 Eduardo Nagore\n#2 Ruggero Moro",
        "to": 56829
      },
      {
        "from": 1100,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Melanoma survival with Classification and Regression Trees Analysis: a complement for the communication of prognosis to patients.\nPositions: \n#1 Silvia Mancini\n#11 Fabio Falcini",
        "to": 1110
      },
      {
        "from": 1100,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Melanoma survival with Classification and Regression Trees Analysis: a complement for the communication of prognosis to patients.\nPositions: \n#1 Silvia Mancini\n#10 Ignazio Stanganelli",
        "to": 1109
      },
      {
        "from": 1100,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Melanoma survival with Classification and Regression Trees Analysis: a complement for the communication of prognosis to patients.\nPositions: \n#1 Silvia Mancini\n#3 Lauro Bucchi",
        "to": 151132
      },
      {
        "from": 1100,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Melanoma survival with Classification and Regression Trees Analysis: a complement for the communication of prognosis to patients.\nPositions: \n#1 Silvia Mancini\n#5 Rosa Vattiato",
        "to": 1104
      },
      {
        "from": 1100,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Melanoma survival with Classification and Regression Trees Analysis: a complement for the communication of prognosis to patients.\nPositions: \n#1 Silvia Mancini\n#2 Emanuele Crocetti",
        "to": 1101
      },
      {
        "from": 1100,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Melanoma survival with Classification and Regression Trees Analysis: a complement for the communication of prognosis to patients.\nPositions: \n#1 Silvia Mancini\n#7 Alessandra Ravaioli",
        "to": 1106
      },
      {
        "from": 1100,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Melanoma survival with Classification and Regression Trees Analysis: a complement for the communication of prognosis to patients.\nPositions: \n#1 Silvia Mancini\n#4 Nicola Pimpinelli",
        "to": 118647
      },
      {
        "from": 1100,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Melanoma survival with Classification and Regression Trees Analysis: a complement for the communication of prognosis to patients.\nPositions: \n#1 Silvia Mancini\n#6 Orietta Giuliani",
        "to": 1105
      },
      {
        "from": 1100,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Melanoma survival with Classification and Regression Trees Analysis: a complement for the communication of prognosis to patients.\nPositions: \n#1 Silvia Mancini\n#8 Flavia Baldacchini",
        "to": 1107
      },
      {
        "from": 1100,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Melanoma survival with Classification and Regression Trees Analysis: a complement for the communication of prognosis to patients.\nPositions: \n#1 Silvia Mancini\n#9 Chiara Balducci",
        "to": 1108
      },
      {
        "from": 163327,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:High melanoma risk in non-melanoma skin cancer patients under age 40: a large retrospective cohort study.\nPositions: \n#1 Francesco Ricci\n#8 Damiano Abeni",
        "to": 983
      },
      {
        "from": 163327,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:High melanoma risk in non-melanoma skin cancer patients under age 40: a large retrospective cohort study.\nPositions: \n#1 Francesco Ricci\n#2 Andrea Paradisi",
        "to": 977
      },
      {
        "from": 163327,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:High melanoma risk in non-melanoma skin cancer patients under age 40: a large retrospective cohort study.\nPositions: \n#1 Francesco Ricci\n#3 Luca Fania",
        "to": 978
      },
      {
        "from": 163327,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:High melanoma risk in non-melanoma skin cancer patients under age 40: a large retrospective cohort study.\nPositions: \n#1 Francesco Ricci\n#7 Annarita Panebianco",
        "to": 982
      },
      {
        "from": 163327,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:High melanoma risk in non-melanoma skin cancer patients under age 40: a large retrospective cohort study.\nPositions: \n#1 Francesco Ricci\n#4 Sabatino Pallotta",
        "to": 979
      },
      {
        "from": 163327,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:High melanoma risk in non-melanoma skin cancer patients under age 40: a large retrospective cohort study.\nPositions: \n#1 Francesco Ricci\n#5 Giovanni DI Lella",
        "to": 980
      },
      {
        "from": 163327,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:High melanoma risk in non-melanoma skin cancer patients under age 40: a large retrospective cohort study.\nPositions: \n#1 Francesco Ricci\n#6 Luciano Sobrino",
        "to": 981
      },
      {
        "from": 4827,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Dermoscopic features of a primary scalp melanoma and its cutaneous metastases.\nPositions: \n#1 Maria A Pizzichetta\n#6 Silvia Bolzonello",
        "to": 4832
      },
      {
        "from": 4827,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Dermoscopic features of a primary scalp melanoma and its cutaneous metastases.\nPositions: \n#1 Maria A Pizzichetta\n#7 Matteo Olivieri",
        "to": 4833
      },
      {
        "from": 4827,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Dermoscopic features of a primary scalp melanoma and its cutaneous metastases.\nPositions: \n#1 Maria A Pizzichetta\n#4 Eugenio Borsatti",
        "to": 153676
      },
      {
        "from": 4827,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Dermoscopic features of a primary scalp melanoma and its cutaneous metastases.\nPositions: \n#1 Maria A Pizzichetta\n#9 Giovanni Magaton-Rizzi",
        "to": 81146
      },
      {
        "from": 4827,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Dermoscopic features of a primary scalp melanoma and its cutaneous metastases.\nPositions: \n#1 Maria A Pizzichetta\n#10 Fabio Puglisi",
        "to": 4836
      },
      {
        "from": 4827,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Dermoscopic features of a primary scalp melanoma and its cutaneous metastases.\nPositions: \n#1 Maria A Pizzichetta\n#5 Giovanni Lo Re",
        "to": 4831
      },
      {
        "from": 4827,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Dermoscopic features of a primary scalp melanoma and its cutaneous metastases.\nPositions: \n#1 Maria A Pizzichetta\n#8 Caterina Pinzani",
        "to": 4834
      },
      {
        "from": 4827,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Dermoscopic features of a primary scalp melanoma and its cutaneous metastases.\nPositions: \n#1 Maria A Pizzichetta\n#2 Vincenzo Canzonieri",
        "to": 130133
      },
      {
        "from": 4827,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Dermoscopic features of a primary scalp melanoma and its cutaneous metastases.\nPositions: \n#1 Maria A Pizzichetta\n#11 Iris Zalaudek",
        "to": 81150
      },
      {
        "from": 4827,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Dermoscopic features of a primary scalp melanoma and its cutaneous metastases.\nPositions: \n#1 Maria A Pizzichetta\n#3 Loredana Militello",
        "to": 4829
      },
      {
        "from": 4721,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Becker's nevus onset in an adult man on the temporo-parietal-occipital region.\nPositions: \n#1 Si-Rui Hua\n#3 Lin Wang",
        "to": 241494
      },
      {
        "from": 4721,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Becker's nevus onset in an adult man on the temporo-parietal-occipital region.\nPositions: \n#1 Si-Rui Hua\n#2 Peng-Fei Wen",
        "to": 4722
      },
      {
        "from": 1655,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:The role of ultrasound examination for early identification of lymph-node metastasis of cutaneous squamous cell carcinoma: results from a single institutional center.\nPositions: \n#1 Riccardo Pampena\n#7 Francesca Peccerillo",
        "to": 1661
      },
      {
        "from": 1655,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:The role of ultrasound examination for early identification of lymph-node metastasis of cutaneous squamous cell carcinoma: results from a single institutional center.\nPositions: \n#1 Riccardo Pampena\n#4 Mara Lombardi",
        "to": 1658
      },
      {
        "from": 1655,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:The role of ultrasound examination for early identification of lymph-node metastasis of cutaneous squamous cell carcinoma: results from a single institutional center.\nPositions: \n#1 Riccardo Pampena\n#11 Caterina Longo",
        "to": 131246
      },
      {
        "from": 1655,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:The role of ultrasound examination for early identification of lymph-node metastasis of cutaneous squamous cell carcinoma: results from a single institutional center.\nPositions: \n#1 Riccardo Pampena\n#5 Simonetta Piana",
        "to": 148923
      },
      {
        "from": 1655,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:The role of ultrasound examination for early identification of lymph-node metastasis of cutaneous squamous cell carcinoma: results from a single institutional center.\nPositions: \n#1 Riccardo Pampena\n#9 Federico Garbarino",
        "to": 1663
      },
      {
        "from": 1655,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:The role of ultrasound examination for early identification of lymph-node metastasis of cutaneous squamous cell carcinoma: results from a single institutional center.\nPositions: \n#1 Riccardo Pampena\n#6 Athanassios Kyrgidis",
        "to": 1660
      },
      {
        "from": 1655,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:The role of ultrasound examination for early identification of lymph-node metastasis of cutaneous squamous cell carcinoma: results from a single institutional center.\nPositions: \n#1 Riccardo Pampena\n#10 Giovanni Pellacani",
        "to": 55516
      },
      {
        "from": 1655,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:The role of ultrasound examination for early identification of lymph-node metastasis of cutaneous squamous cell carcinoma: results from a single institutional center.\nPositions: \n#1 Riccardo Pampena\n#2 Margherita Raucci",
        "to": 1656
      },
      {
        "from": 1655,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:The role of ultrasound examination for early identification of lymph-node metastasis of cutaneous squamous cell carcinoma: results from a single institutional center.\nPositions: \n#1 Riccardo Pampena\n#8 Alessia Paganelli",
        "to": 1662
      },
      {
        "from": 1655,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:The role of ultrasound examination for early identification of lymph-node metastasis of cutaneous squamous cell carcinoma: results from a single institutional center.\nPositions: \n#1 Riccardo Pampena\n#3 Marica Mirra",
        "to": 1657
      },
      {
        "from": 3840,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Expression of estrogen receptors in Spitz and Reed nevi.\nPositions: \n#1 Vincenzo Panasiti\n#5 Vincenzo Roberti",
        "to": 3834
      },
      {
        "from": 3840,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Expression of estrogen receptors in Spitz and Reed nevi.\nPositions: \n#1 Vincenzo Panasiti\n#4 Valeria Devirgiliis",
        "to": 3833
      },
      {
        "from": 3840,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Expression of estrogen receptors in Spitz and Reed nevi.\nPositions: \n#1 Vincenzo Panasiti\n#2 Mauro Barone",
        "to": 3831
      },
      {
        "from": 3840,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Expression of estrogen receptors in Spitz and Reed nevi.\nPositions: \n#1 Vincenzo Panasiti\n#7 Simone Carotti",
        "to": 1202
      },
      {
        "from": 3840,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Expression of estrogen receptors in Spitz and Reed nevi.\nPositions: \n#1 Vincenzo Panasiti\n#3 Rosa Coppola",
        "to": 3830
      },
      {
        "from": 3840,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Expression of estrogen receptors in Spitz and Reed nevi.\nPositions: \n#1 Vincenzo Panasiti\n#8 Sergio Morini",
        "to": 97856
      },
      {
        "from": 3840,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Expression of estrogen receptors in Spitz and Reed nevi.\nPositions: \n#1 Vincenzo Panasiti\n#6 Paolo Persichetti",
        "to": 3839
      },
      {
        "from": 67987,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Personalized and targeted mutational analysis of multiple second primary melanomas under kinase inhibitors.\nPositions: \n#1 Michele Donati\n#7 Eleonora Perrella",
        "to": 3835
      },
      {
        "from": 67987,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Personalized and targeted mutational analysis of multiple second primary melanomas under kinase inhibitors.\nPositions: \n#1 Michele Donati\n#11 Vincenzo Panasiti",
        "to": 3840
      },
      {
        "from": 67987,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Personalized and targeted mutational analysis of multiple second primary melanomas under kinase inhibitors.\nPositions: \n#1 Michele Donati\n#6 Paolo Persichetti",
        "to": 3839
      },
      {
        "from": 67987,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Personalized and targeted mutational analysis of multiple second primary melanomas under kinase inhibitors.\nPositions: \n#1 Michele Donati\n#8 Valeria Devirgiliis",
        "to": 3833
      },
      {
        "from": 67987,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Personalized and targeted mutational analysis of multiple second primary melanomas under kinase inhibitors.\nPositions: \n#1 Michele Donati\n#4 Eleonora Cinelli",
        "to": 4713
      },
      {
        "from": 67987,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Personalized and targeted mutational analysis of multiple second primary melanomas under kinase inhibitors.\nPositions: \n#1 Michele Donati\n#3 Rosa Coppola",
        "to": 3830
      },
      {
        "from": 67987,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Personalized and targeted mutational analysis of multiple second primary melanomas under kinase inhibitors.\nPositions: \n#1 Michele Donati\n#9 Stefano Calvieri",
        "to": 64177
      },
      {
        "from": 67987,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Personalized and targeted mutational analysis of multiple second primary melanomas under kinase inhibitors.\nPositions: \n#1 Michele Donati\n#5 Martina Verri",
        "to": 1677
      },
      {
        "from": 67987,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Personalized and targeted mutational analysis of multiple second primary melanomas under kinase inhibitors.\nPositions: \n#1 Michele Donati\n#2 Giovanni Zelano",
        "to": 1674
      },
      {
        "from": 67987,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Personalized and targeted mutational analysis of multiple second primary melanomas under kinase inhibitors.\nPositions: \n#1 Michele Donati\n#10 Anna Crescenzi",
        "to": 1682
      },
      {
        "from": 1596,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Enlarging melanocytic lesions with peripheral globular pattern: a dermoscopic and confocal microscopy study.\nPositions: \n#1 Anna Carbone\n#5 Paolo Piemonte",
        "to": 1600
      },
      {
        "from": 1596,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Enlarging melanocytic lesions with peripheral globular pattern: a dermoscopic and confocal microscopy study.\nPositions: \n#1 Anna Carbone\n#2 Flavia Persechino",
        "to": 1597
      },
      {
        "from": 1596,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Enlarging melanocytic lesions with peripheral globular pattern: a dermoscopic and confocal microscopy study.\nPositions: \n#1 Anna Carbone\n#12 Marco Ardigò",
        "to": 1607
      },
      {
        "from": 1596,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Enlarging melanocytic lesions with peripheral globular pattern: a dermoscopic and confocal microscopy study.\nPositions: \n#1 Anna Carbone\n#8 Angela Ferrari",
        "to": 67988
      },
      {
        "from": 1596,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Enlarging melanocytic lesions with peripheral globular pattern: a dermoscopic and confocal microscopy study.\nPositions: \n#1 Anna Carbone\n#6 Chiara Franceschini",
        "to": 1601
      },
      {
        "from": 1596,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Enlarging melanocytic lesions with peripheral globular pattern: a dermoscopic and confocal microscopy study.\nPositions: \n#1 Anna Carbone\n#7 Laura Eibenschutz",
        "to": 1602
      },
      {
        "from": 1596,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Enlarging melanocytic lesions with peripheral globular pattern: a dermoscopic and confocal microscopy study.\nPositions: \n#1 Anna Carbone\n#11 Stefano Calvieri",
        "to": 64177
      },
      {
        "from": 1596,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Enlarging melanocytic lesions with peripheral globular pattern: a dermoscopic and confocal microscopy study.\nPositions: \n#1 Anna Carbone\n#3 Giovanni Paolino",
        "to": 57053
      },
      {
        "from": 1596,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Enlarging melanocytic lesions with peripheral globular pattern: a dermoscopic and confocal microscopy study.\nPositions: \n#1 Anna Carbone\n#10 Pasquale Frascione",
        "to": 1605
      },
      {
        "from": 1596,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Enlarging melanocytic lesions with peripheral globular pattern: a dermoscopic and confocal microscopy study.\nPositions: \n#1 Anna Carbone\n#9 Pierluigi Buccini",
        "to": 1604
      },
      {
        "from": 1596,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Enlarging melanocytic lesions with peripheral globular pattern: a dermoscopic and confocal microscopy study.\nPositions: \n#1 Anna Carbone\n#4 Carlo Cota",
        "to": 118635
      },
      {
        "from": 89713,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:A case of spontaneous regression of metastatic skin undifferentiated carcinoma.\nPositions: \n#1 Mauro Mazzeo\n#6 Cosimo DI Raimondo",
        "to": 89714
      },
      {
        "from": 89713,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:A case of spontaneous regression of metastatic skin undifferentiated carcinoma.\nPositions: \n#1 Mauro Mazzeo\n#4 Giulia Spallone",
        "to": 89711
      },
      {
        "from": 89713,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:A case of spontaneous regression of metastatic skin undifferentiated carcinoma.\nPositions: \n#1 Mauro Mazzeo\n#2 Dioniosio Silvaggio",
        "to": 4266
      },
      {
        "from": 89713,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:A case of spontaneous regression of metastatic skin undifferentiated carcinoma.\nPositions: \n#1 Mauro Mazzeo\n#8 Luca Bianchi",
        "to": 100838
      },
      {
        "from": 89713,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:A case of spontaneous regression of metastatic skin undifferentiated carcinoma.\nPositions: \n#1 Mauro Mazzeo\n#3 Flavia Lozzi",
        "to": 81137
      },
      {
        "from": 89713,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:A case of spontaneous regression of metastatic skin undifferentiated carcinoma.\nPositions: \n#1 Mauro Mazzeo\n#5 Paolo Lombardo",
        "to": 89715
      },
      {
        "from": 89713,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:A case of spontaneous regression of metastatic skin undifferentiated carcinoma.\nPositions: \n#1 Mauro Mazzeo\n#7 Lorenzo Cerroni",
        "to": 5571
      },
      {
        "from": 5578,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Dermatoscopy of melanoma according to type, anatomic site and stage.\nPositions: \n#1 Aimilios Lallas\n#9 Elizabeth Lazaridou",
        "to": 5586
      },
      {
        "from": 5578,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Dermatoscopy of melanoma according to type, anatomic site and stage.\nPositions: \n#1 Aimilios Lallas\n#4 Chryssoula Papageorgiou",
        "to": 5581
      },
      {
        "from": 5578,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Dermatoscopy of melanoma according to type, anatomic site and stage.\nPositions: \n#1 Aimilios Lallas\n#10 Zoe Apalla",
        "to": 5587
      },
      {
        "from": 5578,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Dermatoscopy of melanoma according to type, anatomic site and stage.\nPositions: \n#1 Aimilios Lallas\n#6 Konstantinos Liopyris",
        "to": 5583
      },
      {
        "from": 5578,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Dermatoscopy of melanoma according to type, anatomic site and stage.\nPositions: \n#1 Aimilios Lallas\n#8 Andreas Moutsoudis",
        "to": 5585
      },
      {
        "from": 5578,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Dermatoscopy of melanoma according to type, anatomic site and stage.\nPositions: \n#1 Aimilios Lallas\n#2 Eleni Paschou",
        "to": 5579
      },
      {
        "from": 5578,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Dermatoscopy of melanoma according to type, anatomic site and stage.\nPositions: \n#1 Aimilios Lallas\n#5 Ioannis Spyridis",
        "to": 5582
      },
      {
        "from": 5578,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Dermatoscopy of melanoma according to type, anatomic site and stage.\nPositions: \n#1 Aimilios Lallas\n#3 Sofia-Magdalini Manoli",
        "to": 5580
      },
      {
        "from": 5578,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Dermatoscopy of melanoma according to type, anatomic site and stage.\nPositions: \n#1 Aimilios Lallas\n#7 Mattheos Bobos",
        "to": 5584
      },
      {
        "from": 4260,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Role of in-vivo reflectance confocal microscopy in the diagnosis of a histopathologic difficult melanoma.\nPositions: \n#1 Graziella Babino\n#4 Roberto Alfano",
        "to": 60859
      },
      {
        "from": 4260,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Role of in-vivo reflectance confocal microscopy in the diagnosis of a histopathologic difficult melanoma.\nPositions: \n#1 Graziella Babino\n#5 Giuseppe Argenziano",
        "to": 60860
      },
      {
        "from": 4260,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Role of in-vivo reflectance confocal microscopy in the diagnosis of a histopathologic difficult melanoma.\nPositions: \n#1 Graziella Babino\n#3 Marina Agozzino",
        "to": 4262
      },
      {
        "from": 4260,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Role of in-vivo reflectance confocal microscopy in the diagnosis of a histopathologic difficult melanoma.\nPositions: \n#1 Graziella Babino\n#2 Elvira Moscarella",
        "to": 131240
      },
      {
        "from": 4237,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Cutaneous tricholemmal carcinoma: a 15-year single center experience.\nPositions: \n#1 Francesca L Boggio\n#4 Luigia Venegoni",
        "to": 52203
      },
      {
        "from": 4237,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Cutaneous tricholemmal carcinoma: a 15-year single center experience.\nPositions: \n#1 Francesca L Boggio\n#7 Antonella Coggi",
        "to": 52206
      },
      {
        "from": 4237,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Cutaneous tricholemmal carcinoma: a 15-year single center experience.\nPositions: \n#1 Francesca L Boggio\n#3 Marco Barella",
        "to": 4239
      },
      {
        "from": 4237,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Cutaneous tricholemmal carcinoma: a 15-year single center experience.\nPositions: \n#1 Francesca L Boggio\n#9 Alessandro Del Gobbo",
        "to": 52210
      },
      {
        "from": 4237,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Cutaneous tricholemmal carcinoma: a 15-year single center experience.\nPositions: \n#1 Francesca L Boggio\n#6 Stefano Ferrero",
        "to": 52207
      },
      {
        "from": 4237,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Cutaneous tricholemmal carcinoma: a 15-year single center experience.\nPositions: \n#1 Francesca L Boggio\n#2 Elena Guanziroli",
        "to": 52202
      },
      {
        "from": 4237,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Cutaneous tricholemmal carcinoma: a 15-year single center experience.\nPositions: \n#1 Francesca L Boggio\n#8 Raffaele Gianotti",
        "to": 52208
      },
      {
        "from": 4237,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Cutaneous tricholemmal carcinoma: a 15-year single center experience.\nPositions: \n#1 Francesca L Boggio\n#5 Emilio Berti",
        "to": 118615
      },
      {
        "from": 15129,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Clinical histopathological features and CDKN2A/CDK4/MITF mutational status of patients with multiple primary melanomas from Bologna: Italy is a fascinating but complex mosaic.\nPositions: \n#1 Emi Dika\n#3 Cesare Rossi",
        "to": 2324
      },
      {
        "from": 15129,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Clinical histopathological features and CDKN2A/CDK4/MITF mutational status of patients with multiple primary melanomas from Bologna: Italy is a fascinating but complex mosaic.\nPositions: \n#1 Emi Dika\n#7 Giulia Veronesi",
        "to": 2328
      },
      {
        "from": 15129,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Clinical histopathological features and CDKN2A/CDK4/MITF mutational status of patients with multiple primary melanomas from Bologna: Italy is a fascinating but complex mosaic.\nPositions: \n#1 Emi Dika\n#6 Manuela Ferracin",
        "to": 2327
      },
      {
        "from": 15129,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Clinical histopathological features and CDKN2A/CDK4/MITF mutational status of patients with multiple primary melanomas from Bologna: Italy is a fascinating but complex mosaic.\nPositions: \n#1 Emi Dika\n#5 Sara Miccoli",
        "to": 2326
      },
      {
        "from": 15129,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Clinical histopathological features and CDKN2A/CDK4/MITF mutational status of patients with multiple primary melanomas from Bologna: Italy is a fascinating but complex mosaic.\nPositions: \n#1 Emi Dika\n#4 Daniela Turchetti",
        "to": 2325
      },
      {
        "from": 15129,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Clinical histopathological features and CDKN2A/CDK4/MITF mutational status of patients with multiple primary melanomas from Bologna: Italy is a fascinating but complex mosaic.\nPositions: \n#1 Emi Dika\n#8 Federica Scarfì",
        "to": 203035
      },
      {
        "from": 15129,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Clinical histopathological features and CDKN2A/CDK4/MITF mutational status of patients with multiple primary melanomas from Bologna: Italy is a fascinating but complex mosaic.\nPositions: \n#1 Emi Dika\n#2 Annalisa Patrizi",
        "to": 146917
      },
      {
        "from": 15129,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Clinical histopathological features and CDKN2A/CDK4/MITF mutational status of patients with multiple primary melanomas from Bologna: Italy is a fascinating but complex mosaic.\nPositions: \n#1 Emi Dika\n#9 Martina Lambertini",
        "to": 2330
      },
      {
        "from": 4686,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Diagnosis and treatment of classic and iatrogenic Kaposi's sarcoma: Italian recommendations.\nPositions: \n#1 Lucia Brambilla\n#9 Roberta Mancuso",
        "to": 4694
      },
      {
        "from": 4686,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Diagnosis and treatment of classic and iatrogenic Kaposi's sarcoma: Italian recommendations.\nPositions: \n#1 Lucia Brambilla\n#2 Giovanni Genovese",
        "to": 4687
      },
      {
        "from": 4686,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Diagnosis and treatment of classic and iatrogenic Kaposi's sarcoma: Italian recommendations.\nPositions: \n#1 Lucia Brambilla\n#4 Ketty Peris",
        "to": 4689
      },
      {
        "from": 4686,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Diagnosis and treatment of classic and iatrogenic Kaposi's sarcoma: Italian recommendations.\nPositions: \n#1 Lucia Brambilla\n#6 Giuseppe Micali",
        "to": 132576
      },
      {
        "from": 4686,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Diagnosis and treatment of classic and iatrogenic Kaposi's sarcoma: Italian recommendations.\nPositions: \n#1 Lucia Brambilla\n#8 Silvia Della Bella",
        "to": 4693
      },
      {
        "from": 4686,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Diagnosis and treatment of classic and iatrogenic Kaposi's sarcoma: Italian recommendations.\nPositions: \n#1 Lucia Brambilla\n#10 Piergiacomo Calzavara Pinton",
        "to": 4695
      },
      {
        "from": 4686,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Diagnosis and treatment of classic and iatrogenic Kaposi's sarcoma: Italian recommendations.\nPositions: \n#1 Lucia Brambilla\n#7 Fabio Ayala",
        "to": 4692
      },
      {
        "from": 4686,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Diagnosis and treatment of classic and iatrogenic Kaposi's sarcoma: Italian recommendations.\nPositions: \n#1 Lucia Brambilla\n#3 Emilio Berti",
        "to": 118615
      },
      {
        "from": 4686,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Diagnosis and treatment of classic and iatrogenic Kaposi's sarcoma: Italian recommendations.\nPositions: \n#1 Lucia Brambilla\n#11 Athanasia Tourlaki",
        "to": 4696
      },
      {
        "from": 4686,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Diagnosis and treatment of classic and iatrogenic Kaposi's sarcoma: Italian recommendations.\nPositions: \n#1 Lucia Brambilla\n#5 Franco Rongioletti",
        "to": 4690
      },
      {
        "from": 178365,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:The importance of palpation in the skin cancer screening examination.\nPositions: \n#1 Benjamin G Gorman\n#3 Nahid Y Vidal",
        "to": 157918
      },
      {
        "from": 178365,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:The importance of palpation in the skin cancer screening examination.\nPositions: \n#1 Benjamin G Gorman\n#2 Jennifer Hanson",
        "to": 157917
      },
      {
        "from": 212184,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Cul4b Promotes Progression of Malignant Cutaneous Melanoma Patients by Regulating CDKN2A.\nPositions: \n#1 Chao Zhang\n#4 Tan Jun",
        "to": 195573
      },
      {
        "from": 212184,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Cul4b Promotes Progression of Malignant Cutaneous Melanoma Patients by Regulating CDKN2A.\nPositions: \n#1 Chao Zhang\n#3 Xiu-Li Liu",
        "to": 195572
      },
      {
        "from": 212184,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Cul4b Promotes Progression of Malignant Cutaneous Melanoma Patients by Regulating CDKN2A.\nPositions: \n#1 Chao Zhang\n#5 Pei Liu",
        "to": 204026
      },
      {
        "from": 212184,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Cul4b Promotes Progression of Malignant Cutaneous Melanoma Patients by Regulating CDKN2A.\nPositions: \n#1 Chao Zhang\n#2 Can Cao",
        "to": 195571
      },
      {
        "from": 79983,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:A multicentre review of the histology of 1012 periocular basal cell carcinomas.\nPositions: \n#1 Zhiheng Lin\n#4 Bridget Hemmant",
        "to": 79986
      },
      {
        "from": 79983,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:A multicentre review of the histology of 1012 periocular basal cell carcinomas.\nPositions: \n#1 Zhiheng Lin\n#3 Laszlo Igali",
        "to": 79985
      },
      {
        "from": 79983,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:A multicentre review of the histology of 1012 periocular basal cell carcinomas.\nPositions: \n#1 Zhiheng Lin\n#2 Umair Qidwai",
        "to": 79984
      },
      {
        "from": 93203,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Optical coherence tomography angiography in quiescent choroidal neovascularization associated with choroidal nevus: 5 years follow-up.\nPositions: \n#1 Gilda Cennamo\n#5 Raffaella Carandente",
        "to": 67121
      },
      {
        "from": 93203,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Optical coherence tomography angiography in quiescent choroidal neovascularization associated with choroidal nevus: 5 years follow-up.\nPositions: \n#1 Gilda Cennamo\n#2 Daniela Montorio",
        "to": 93204
      },
      {
        "from": 93203,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Optical coherence tomography angiography in quiescent choroidal neovascularization associated with choroidal nevus: 5 years follow-up.\nPositions: \n#1 Gilda Cennamo\n#4 Lidia Clemente",
        "to": 67120
      },
      {
        "from": 93203,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Optical coherence tomography angiography in quiescent choroidal neovascularization associated with choroidal nevus: 5 years follow-up.\nPositions: \n#1 Gilda Cennamo\n#6 Fausto Tranfa",
        "to": 67122
      },
      {
        "from": 93203,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Optical coherence tomography angiography in quiescent choroidal neovascularization associated with choroidal nevus: 5 years follow-up.\nPositions: \n#1 Gilda Cennamo\n#3 Federica Fossataro",
        "to": 67119
      },
      {
        "from": 131410,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Eruptive cherry angiomas and uveal melanoma: beyond a simple association.\nPositions: \n#1 G Paolino\n#12 S R Mercuri",
        "to": 131421
      },
      {
        "from": 131410,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Eruptive cherry angiomas and uveal melanoma: beyond a simple association.\nPositions: \n#1 G Paolino\n#7 F Bandello",
        "to": 131416
      },
      {
        "from": 131410,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Eruptive cherry angiomas and uveal melanoma: beyond a simple association.\nPositions: \n#1 G Paolino\n#5 A Bulotta",
        "to": 131414
      },
      {
        "from": 131410,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Eruptive cherry angiomas and uveal melanoma: beyond a simple association.\nPositions: \n#1 G Paolino\n#3 P Brianti",
        "to": 131412
      },
      {
        "from": 131410,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Eruptive cherry angiomas and uveal melanoma: beyond a simple association.\nPositions: \n#1 G Paolino\n#4 C Prezioso",
        "to": 131413
      },
      {
        "from": 131410,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Eruptive cherry angiomas and uveal melanoma: beyond a simple association.\nPositions: \n#1 G Paolino\n#9 C Federici",
        "to": 131418
      },
      {
        "from": 131410,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Eruptive cherry angiomas and uveal melanoma: beyond a simple association.\nPositions: \n#1 G Paolino\n#11 G M Modorati",
        "to": 131420
      },
      {
        "from": 131410,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Eruptive cherry angiomas and uveal melanoma: beyond a simple association.\nPositions: \n#1 G Paolino\n#10 V Gregorc",
        "to": 131419
      },
      {
        "from": 131410,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Eruptive cherry angiomas and uveal melanoma: beyond a simple association.\nPositions: \n#1 G Paolino\n#2 M V Cicinelli",
        "to": 131411
      },
      {
        "from": 131410,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Eruptive cherry angiomas and uveal melanoma: beyond a simple association.\nPositions: \n#1 G Paolino\n#6 N Rizzo",
        "to": 131415
      },
      {
        "from": 131410,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Eruptive cherry angiomas and uveal melanoma: beyond a simple association.\nPositions: \n#1 G Paolino\n#8 L Lugini",
        "to": 131417
      },
      {
        "from": 72108,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Multiple facial plaques of diffuse plane xanthoma arising from regressed tumours of folliculotropic mycosis fungoides.\nPositions: \n#1 K Kurihara\n#3 A Kasuya",
        "to": 72110
      },
      {
        "from": 72108,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Multiple facial plaques of diffuse plane xanthoma arising from regressed tumours of folliculotropic mycosis fungoides.\nPositions: \n#1 K Kurihara\n#6 Y Tokura",
        "to": 72113
      },
      {
        "from": 72108,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Multiple facial plaques of diffuse plane xanthoma arising from regressed tumours of folliculotropic mycosis fungoides.\nPositions: \n#1 K Kurihara\n#5 T Ito",
        "to": 72112
      },
      {
        "from": 72108,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Multiple facial plaques of diffuse plane xanthoma arising from regressed tumours of folliculotropic mycosis fungoides.\nPositions: \n#1 K Kurihara\n#2 T Shimauchi",
        "to": 72109
      },
      {
        "from": 72108,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Multiple facial plaques of diffuse plane xanthoma arising from regressed tumours of folliculotropic mycosis fungoides.\nPositions: \n#1 K Kurihara\n#4 T Yatagai",
        "to": 72111
      },
      {
        "from": 169498,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:\"Present and future of immunotherapy in Neuroendocrine Tumors\".\nPositions: \n#1 Manuela Albertelli\n#8 Mara Boschetti",
        "to": 169505
      },
      {
        "from": 169498,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:\"Present and future of immunotherapy in Neuroendocrine Tumors\".\nPositions: \n#1 Manuela Albertelli\n#4 Alessandro Veresani",
        "to": 169501
      },
      {
        "from": 169498,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:\"Present and future of immunotherapy in Neuroendocrine Tumors\".\nPositions: \n#1 Manuela Albertelli\n#2 Andrea Dotto",
        "to": 169499
      },
      {
        "from": 169498,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:\"Present and future of immunotherapy in Neuroendocrine Tumors\".\nPositions: \n#1 Manuela Albertelli\n#3 Federica Nista",
        "to": 169500
      },
      {
        "from": 169498,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:\"Present and future of immunotherapy in Neuroendocrine Tumors\".\nPositions: \n#1 Manuela Albertelli\n#9 Diego Ferone",
        "to": 169506
      },
      {
        "from": 169498,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:\"Present and future of immunotherapy in Neuroendocrine Tumors\".\nPositions: \n#1 Manuela Albertelli\n#5 Luca Patti",
        "to": 169502
      },
      {
        "from": 169498,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:\"Present and future of immunotherapy in Neuroendocrine Tumors\".\nPositions: \n#1 Manuela Albertelli\n#6 Stefano Gay",
        "to": 169503
      },
      {
        "from": 169498,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:\"Present and future of immunotherapy in Neuroendocrine Tumors\".\nPositions: \n#1 Manuela Albertelli\n#7 Stefania Sciallero",
        "to": 169504
      },
      {
        "from": 199099,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:The Importance of SPECT/CT in Preoperative Localization of Sentinel Lymph Nodes in 2 Patients With Acral Melanoma in the Foot.\nPositions: \n#1 Shu Zhang\n#4 Xiongfei Zou",
        "to": 199102
      },
      {
        "from": 199099,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:The Importance of SPECT/CT in Preoperative Localization of Sentinel Lymph Nodes in 2 Patients With Acral Melanoma in the Foot.\nPositions: \n#1 Shu Zhang\n#3 Surong Hua",
        "to": 199101
      },
      {
        "from": 199099,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:The Importance of SPECT/CT in Preoperative Localization of Sentinel Lymph Nodes in 2 Patients With Acral Melanoma in the Foot.\nPositions: \n#1 Shu Zhang\n#5 Yaping Luo",
        "to": 199103
      },
      {
        "from": 199099,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:The Importance of SPECT/CT in Preoperative Localization of Sentinel Lymph Nodes in 2 Patients With Acral Melanoma in the Foot.\nPositions: \n#1 Shu Zhang\n#2 Shikun Zhu",
        "to": 199100
      },
      {
        "from": 68998,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Reflectance confocal microscopy of solitary mastocytoma and correlation with horizontal histopathological sections.\nPositions: \n#1 Anna Elisa Verzì\n#2 Francesco Lacarrubba",
        "to": 68999
      },
      {
        "from": 68998,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Reflectance confocal microscopy of solitary mastocytoma and correlation with horizontal histopathological sections.\nPositions: \n#1 Anna Elisa Verzì\n#4 Franco Dinotta",
        "to": 69001
      },
      {
        "from": 68998,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Reflectance confocal microscopy of solitary mastocytoma and correlation with horizontal histopathological sections.\nPositions: \n#1 Anna Elisa Verzì\n#5 Giuseppe Micali",
        "to": 132576
      },
      {
        "from": 68998,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Reflectance confocal microscopy of solitary mastocytoma and correlation with horizontal histopathological sections.\nPositions: \n#1 Anna Elisa Verzì\n#3 Rosario Caltabiano",
        "to": 69000
      },
      {
        "from": 71759,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:\"Fake News'-5G mobile phones and skin cancer: A global analysis of concerns on social media.\nPositions: \n#1 Siobhán Rafferty\n#2 Cathal O'Connor",
        "to": 71760
      },
      {
        "from": 71759,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:\"Fake News'-5G mobile phones and skin cancer: A global analysis of concerns on social media.\nPositions: \n#1 Siobhán Rafferty\n#3 Michelle Murphy",
        "to": 71761
      },
      {
        "from": 215648,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Confluent and reticulated papillomatosis of Gougerot and Carteaud. A diagnostic and therapeutic challenge.\nPositions: \n#1 T Bernués-Bergua\n#2 J Monte-Serrano",
        "to": 220965
      },
      {
        "from": 215648,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Confluent and reticulated papillomatosis of Gougerot and Carteaud. A diagnostic and therapeutic challenge.\nPositions: \n#1 T Bernués-Bergua\n#3 L Prieto-Torres",
        "to": 215650
      },
      {
        "from": 110636,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Ungueal melanoma in situ.\nPositions: \n#1 J Fernández-Horcajuelo\n#2 P Espinosa-Lara",
        "to": 110637
      },
      {
        "from": 110636,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Ungueal melanoma in situ.\nPositions: \n#1 J Fernández-Horcajuelo\n#3 M Simón-Lázaro",
        "to": 110638
      },
      {
        "from": 95832,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Surgical Treatment of Brooke-Spiegler Syndrome.\nPositions: \n#1 Patricia Esther Engels\n#3 Gunther Pabst",
        "to": 95834
      },
      {
        "from": 95832,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Surgical Treatment of Brooke-Spiegler Syndrome.\nPositions: \n#1 Patricia Esther Engels\n#4 Urs Hug",
        "to": 95835
      },
      {
        "from": 95832,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Surgical Treatment of Brooke-Spiegler Syndrome.\nPositions: \n#1 Patricia Esther Engels\n#2 Elmar Fritsche",
        "to": 95833
      },
      {
        "from": 98106,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Idiopathic Auricular Calcinosis Cutis.\nPositions: \n#1 Halil Polat\n#2 Sercan Çikrikci",
        "to": 98107
      },
      {
        "from": 98106,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Idiopathic Auricular Calcinosis Cutis.\nPositions: \n#1 Halil Polat\n#3 Funda Erduran",
        "to": 98108
      },
      {
        "from": 98106,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Idiopathic Auricular Calcinosis Cutis.\nPositions: \n#1 Halil Polat\n#4 Halit Üner",
        "to": 98109
      },
      {
        "from": 95254,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Malignant Melanoma Arising From a Giant Congenital Melanocytic Nevus in a 3-Year Old: Review of Diagnosis and Management.\nPositions: \n#1 Meredith Kugar\n#5 Paul Googe",
        "to": 95258
      },
      {
        "from": 95254,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Malignant Melanoma Arising From a Giant Congenital Melanocytic Nevus in a 3-Year Old: Review of Diagnosis and Management.\nPositions: \n#1 Meredith Kugar\n#6 Julie Blatt",
        "to": 95259
      },
      {
        "from": 95254,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Malignant Melanoma Arising From a Giant Congenital Melanocytic Nevus in a 3-Year Old: Review of Diagnosis and Management.\nPositions: \n#1 Meredith Kugar\n#7 Jeyhan Wood",
        "to": 95260
      },
      {
        "from": 95254,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Malignant Melanoma Arising From a Giant Congenital Melanocytic Nevus in a 3-Year Old: Review of Diagnosis and Management.\nPositions: \n#1 Meredith Kugar\n#2 Arya Akhavan",
        "to": 95255
      },
      {
        "from": 95254,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Malignant Melanoma Arising From a Giant Congenital Melanocytic Nevus in a 3-Year Old: Review of Diagnosis and Management.\nPositions: \n#1 Meredith Kugar\n#3 Idorenyin Ndem",
        "to": 95256
      },
      {
        "from": 95254,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Malignant Melanoma Arising From a Giant Congenital Melanocytic Nevus in a 3-Year Old: Review of Diagnosis and Management.\nPositions: \n#1 Meredith Kugar\n#4 David Ollila",
        "to": 95257
      },
      {
        "from": 81682,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Esthetic Repair of Facial Skin Defect After Resection of Malignant Tumor With Lateral Maxillocervical-Island Fasciocutaneous Flap.\nPositions: \n#1 Zhongliang Lang\n#2 Liping Zhao",
        "to": 225285
      },
      {
        "from": 81682,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Esthetic Repair of Facial Skin Defect After Resection of Malignant Tumor With Lateral Maxillocervical-Island Fasciocutaneous Flap.\nPositions: \n#1 Zhongliang Lang\n#3 Yanjun Chu",
        "to": 81684
      },
      {
        "from": 111099,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Primary cutaneous gamma-delta T-cell lymphoma mimicking clinical amyopathic dermatomyositis: A case report.\nPositions: \n#1 Haijun Ma\n#2 Jinghang Zhang",
        "to": 111100
      },
      {
        "from": 111099,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Primary cutaneous gamma-delta T-cell lymphoma mimicking clinical amyopathic dermatomyositis: A case report.\nPositions: \n#1 Haijun Ma\n#3 Minghao Guo",
        "to": 111101
      },
      {
        "from": 134334,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Italian expert-based recommendations on the use of phototherapy in the management of mycosis fungoides: Results of an e-Delphi consensus.\nPositions: \n#1 Vieri Grandi\n#25 Alessandro Pileri",
        "to": 118637
      },
      {
        "from": 134334,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Italian expert-based recommendations on the use of phototherapy in the management of mycosis fungoides: Results of an e-Delphi consensus.\nPositions: \n#1 Vieri Grandi\n#13 Emanuele Cozzani",
        "to": 118625
      },
      {
        "from": 134334,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Italian expert-based recommendations on the use of phototherapy in the management of mycosis fungoides: Results of an e-Delphi consensus.\nPositions: \n#1 Vieri Grandi\n#3 Emilio Berti",
        "to": 118615
      },
      {
        "from": 134334,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Italian expert-based recommendations on the use of phototherapy in the management of mycosis fungoides: Results of an e-Delphi consensus.\nPositions: \n#1 Vieri Grandi\n#16 Daniele Gambini",
        "to": 118628
      },
      {
        "from": 134334,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Italian expert-based recommendations on the use of phototherapy in the management of mycosis fungoides: Results of an e-Delphi consensus.\nPositions: \n#1 Vieri Grandi\n#17 Paolo Iacovelli",
        "to": 118629
      },
      {
        "from": 134334,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Italian expert-based recommendations on the use of phototherapy in the management of mycosis fungoides: Results of an e-Delphi consensus.\nPositions: \n#1 Vieri Grandi\n#29 Annamaria Offidani",
        "to": 118641
      },
      {
        "from": 134334,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Italian expert-based recommendations on the use of phototherapy in the management of mycosis fungoides: Results of an e-Delphi consensus.\nPositions: \n#1 Vieri Grandi\n#27 Marco Simonacci",
        "to": 118639
      },
      {
        "from": 134334,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Italian expert-based recommendations on the use of phototherapy in the management of mycosis fungoides: Results of an e-Delphi consensus.\nPositions: \n#1 Vieri Grandi\n#10 Pier Luigi Bruni",
        "to": 118622
      },
      {
        "from": 134334,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Italian expert-based recommendations on the use of phototherapy in the management of mycosis fungoides: Results of an e-Delphi consensus.\nPositions: \n#1 Vieri Grandi\n#20 Giuseppe Monfrecola",
        "to": 118632
      },
      {
        "from": 134334,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Italian expert-based recommendations on the use of phototherapy in the management of mycosis fungoides: Results of an e-Delphi consensus.\nPositions: \n#1 Vieri Grandi\n#26 Paola Savoia",
        "to": 126568
      },
      {
        "from": 134334,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Italian expert-based recommendations on the use of phototherapy in the management of mycosis fungoides: Results of an e-Delphi consensus.\nPositions: \n#1 Vieri Grandi\n#2 Antonello Baldo",
        "to": 118614
      },
      {
        "from": 134334,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Italian expert-based recommendations on the use of phototherapy in the management of mycosis fungoides: Results of an e-Delphi consensus.\nPositions: \n#1 Vieri Grandi\n#31 Michele Pellegrino",
        "to": 118643
      },
      {
        "from": 134334,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Italian expert-based recommendations on the use of phototherapy in the management of mycosis fungoides: Results of an e-Delphi consensus.\nPositions: \n#1 Vieri Grandi\n#4 Pietro Quaglino",
        "to": 118616
      },
      {
        "from": 134334,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Italian expert-based recommendations on the use of phototherapy in the management of mycosis fungoides: Results of an e-Delphi consensus.\nPositions: \n#1 Vieri Grandi\n#24 Paolo Pigatto",
        "to": 118636
      },
      {
        "from": 134334,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Italian expert-based recommendations on the use of phototherapy in the management of mycosis fungoides: Results of an e-Delphi consensus.\nPositions: \n#1 Vieri Grandi\n#8 Paolo Amerio",
        "to": 118620
      },
      {
        "from": 134334,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Italian expert-based recommendations on the use of phototherapy in the management of mycosis fungoides: Results of an e-Delphi consensus.\nPositions: \n#1 Vieri Grandi\n#23 Carlo Cota",
        "to": 118635
      },
      {
        "from": 134334,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Italian expert-based recommendations on the use of phototherapy in the management of mycosis fungoides: Results of an e-Delphi consensus.\nPositions: \n#1 Vieri Grandi\n#11 Piergiacomo Calzavara-Pinton",
        "to": 118623
      },
      {
        "from": 134334,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Italian expert-based recommendations on the use of phototherapy in the management of mycosis fungoides: Results of an e-Delphi consensus.\nPositions: \n#1 Vieri Grandi\n#35 Nicola Pimpinelli",
        "to": 118647
      },
      {
        "from": 134334,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Italian expert-based recommendations on the use of phototherapy in the management of mycosis fungoides: Results of an e-Delphi consensus.\nPositions: \n#1 Vieri Grandi\n#6 Mauro Alaibac",
        "to": 118618
      },
      {
        "from": 134334,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Italian expert-based recommendations on the use of phototherapy in the management of mycosis fungoides: Results of an e-Delphi consensus.\nPositions: \n#1 Vieri Grandi\n#28 Marina Venturini",
        "to": 118640
      },
      {
        "from": 134334,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Italian expert-based recommendations on the use of phototherapy in the management of mycosis fungoides: Results of an e-Delphi consensus.\nPositions: \n#1 Vieri Grandi\n#33 Roberta Piccinno",
        "to": 118645
      },
      {
        "from": 134334,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Italian expert-based recommendations on the use of phototherapy in the management of mycosis fungoides: Results of an e-Delphi consensus.\nPositions: \n#1 Vieri Grandi\n#34 Karl Lawrence",
        "to": 118646
      },
      {
        "from": 134334,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Italian expert-based recommendations on the use of phototherapy in the management of mycosis fungoides: Results of an e-Delphi consensus.\nPositions: \n#1 Vieri Grandi\n#18 Alessia Pacifico",
        "to": 118630
      },
      {
        "from": 134334,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Italian expert-based recommendations on the use of phototherapy in the management of mycosis fungoides: Results of an e-Delphi consensus.\nPositions: \n#1 Vieri Grandi\n#19 Caterina Longo",
        "to": 131246
      },
      {
        "from": 134334,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Italian expert-based recommendations on the use of phototherapy in the management of mycosis fungoides: Results of an e-Delphi consensus.\nPositions: \n#1 Vieri Grandi\n#7 Silvia Alberti-Violetti",
        "to": 118619
      },
      {
        "from": 134334,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Italian expert-based recommendations on the use of phototherapy in the management of mycosis fungoides: Results of an e-Delphi consensus.\nPositions: \n#1 Vieri Grandi\n#30 Elisa Molinelli",
        "to": 118642
      },
      {
        "from": 134334,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Italian expert-based recommendations on the use of phototherapy in the management of mycosis fungoides: Results of an e-Delphi consensus.\nPositions: \n#1 Vieri Grandi\n#32 Emanuele Trovato",
        "to": 118644
      },
      {
        "from": 134334,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Italian expert-based recommendations on the use of phototherapy in the management of mycosis fungoides: Results of an e-Delphi consensus.\nPositions: \n#1 Vieri Grandi\n#5 Serena Rupoli",
        "to": 118617
      },
      {
        "from": 134334,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Italian expert-based recommendations on the use of phototherapy in the management of mycosis fungoides: Results of an e-Delphi consensus.\nPositions: \n#1 Vieri Grandi\n#14 Martina Burlando",
        "to": 118626
      },
      {
        "from": 134334,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Italian expert-based recommendations on the use of phototherapy in the management of mycosis fungoides: Results of an e-Delphi consensus.\nPositions: \n#1 Vieri Grandi\n#22 Giorgio Mozzicafreddo",
        "to": 118634
      },
      {
        "from": 134334,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Italian expert-based recommendations on the use of phototherapy in the management of mycosis fungoides: Results of an e-Delphi consensus.\nPositions: \n#1 Vieri Grandi\n#12 Aurora Parodi",
        "to": 118624
      },
      {
        "from": 134334,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Italian expert-based recommendations on the use of phototherapy in the management of mycosis fungoides: Results of an e-Delphi consensus.\nPositions: \n#1 Vieri Grandi\n#21 Alberico Motolese",
        "to": 118633
      },
      {
        "from": 134334,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Italian expert-based recommendations on the use of phototherapy in the management of mycosis fungoides: Results of an e-Delphi consensus.\nPositions: \n#1 Vieri Grandi\n#9 Valeria Brazzelli",
        "to": 118621
      },
      {
        "from": 134334,
        "title": "Mesh Heading:Skin Neoplasms\nArticle Name:Italian expert-based recommendations on the use of phototherapy in the management of mycosis fungoides: Results of an e-Delphi consensus.\nPositions: \n#1 Vieri Grandi\n#15 Maria Concetta Fargnoli",
        "to": 118627
      }
    ],
    "nodes": [
      {
        "id": 155119,
        "label": "Alessio Paone",
        "value": 1
      },
      {
        "id": 155120,
        "label": "Francesca Cutruzzolà",
        "value": 1
      },
      {
        "id": 155121,
        "label": "Tomasz Kobiela",
        "value": 1
      },
      {
        "id": 155118,
        "label": "Anna Sobiepanek",
        "value": 3
      },
      {
        "id": 119055,
        "label": "Tetsuya Isayama",
        "value": 1
      },
      {
        "id": 119056,
        "label": "Mitsuru Sekido",
        "value": 1
      },
      {
        "id": 119054,
        "label": "Takehiro Kasai",
        "value": 2
      },
      {
        "id": 205442,
        "label": "Natsuko Suzui",
        "value": 2
      },
      {
        "id": 205447,
        "label": "Mariko Seishima",
        "value": 2
      },
      {
        "id": 205444,
        "label": "Hiroyuki Tomita",
        "value": 2
      },
      {
        "id": 219112,
        "label": "Masayuki Matsuo",
        "value": 2
      },
      {
        "id": 219110,
        "label": "Hiroki Kato",
        "value": 2
      },
      {
        "id": 205443,
        "label": "Tatsuhiko Miyazaki",
        "value": 2
      },
      {
        "id": 205445,
        "label": "Akira Hara",
        "value": 2
      },
      {
        "id": 205446,
        "label": "Kanako Matsuyama",
        "value": 2
      },
      {
        "id": 205440,
        "label": "Masaya Kawaguchi",
        "value": 16
      },
      {
        "id": 196276,
        "label": "Talita Duarte-Salles",
        "value": 1
      },
      {
        "id": 196280,
        "label": "Anton Pottegård",
        "value": 1
      },
      {
        "id": 196282,
        "label": "Consuelo Huerta",
        "value": 1
      },
      {
        "id": 196277,
        "label": "Ana Llorente",
        "value": 1
      },
      {
        "id": 196281,
        "label": "Dolores Montero-Corominas",
        "value": 1
      },
      {
        "id": 196279,
        "label": "Diana Puente",
        "value": 1
      },
      {
        "id": 196278,
        "label": "Yesika Díaz",
        "value": 1
      },
      {
        "id": 196275,
        "label": "Luz M León-Muñoz",
        "value": 7
      },
      {
        "id": 156719,
        "label": "G Jenkins",
        "value": 1
      },
      {
        "id": 156721,
        "label": "J Adams",
        "value": 1
      },
      {
        "id": 156720,
        "label": "P Sloan",
        "value": 1
      },
      {
        "id": 156718,
        "label": "A S Tabaksert",
        "value": 3
      },
      {
        "id": 218176,
        "label": "C Ram-Wolff",
        "value": 1
      },
      {
        "id": 218179,
        "label": "M Battistella",
        "value": 1
      },
      {
        "id": 218174,
        "label": "A de Masson",
        "value": 1
      },
      {
        "id": 218180,
        "label": "N Ortonne",
        "value": 1
      },
      {
        "id": 218181,
        "label": "S Ingen-Housz-Oro",
        "value": 1
      },
      {
        "id": 218175,
        "label": "O Dereure",
        "value": 1
      },
      {
        "id": 220195,
        "label": "M Bagot",
        "value": 2
      },
      {
        "id": 218178,
        "label": "B Vergier",
        "value": 1
      },
      {
        "id": 218187,
        "label": "M Beylot-Barry",
        "value": 1
      },
      {
        "id": 218172,
        "label": "C Skayem",
        "value": 9
      },
      {
        "id": 204175,
        "label": "S Rosen",
        "value": 1
      },
      {
        "id": 204173,
        "label": "B Gorovitz-Haris",
        "value": 1
      },
      {
        "id": 204178,
        "label": "H Prag-Naveh",
        "value": 1
      },
      {
        "id": 220194,
        "label": "E Hodak",
        "value": 2
      },
      {
        "id": 204179,
        "label": "J Jacob-Hirsch",
        "value": 1
      },
      {
        "id": 204177,
        "label": "I Amitay-Laish",
        "value": 1
      },
      {
        "id": 204172,
        "label": "C Arkin",
        "value": 1
      },
      {
        "id": 204174,
        "label": "C Querfeld",
        "value": 1
      },
      {
        "id": 204176,
        "label": "J Knaneh",
        "value": 1
      },
      {
        "id": 204171,
        "label": "L Moyal",
        "value": 9
      },
      {
        "id": 218035,
        "label": "K Mosterd",
        "value": 1
      },
      {
        "id": 218031,
        "label": "P J Nelemans",
        "value": 1
      },
      {
        "id": 218032,
        "label": "N W J Kelleners-Smeets",
        "value": 1
      },
      {
        "id": 218034,
        "label": "T Brinkhuizen",
        "value": 1
      },
      {
        "id": 218033,
        "label": "J P H M Kessels",
        "value": 1
      },
      {
        "id": 218030,
        "label": "F Adan",
        "value": 5
      },
      {
        "id": 220189,
        "label": "C Vico",
        "value": 1
      },
      {
        "id": 220182,
        "label": "T Iliakis",
        "value": 1
      },
      {
        "id": 220192,
        "label": "R Guiron",
        "value": 1
      },
      {
        "id": 220181,
        "label": "V Nikolaou",
        "value": 1
      },
      {
        "id": 220196,
        "label": "J Scarisbrick",
        "value": 1
      },
      {
        "id": 220185,
        "label": "S Porkert",
        "value": 1
      },
      {
        "id": 220187,
        "label": "P Quaglino",
        "value": 1
      },
      {
        "id": 220190,
        "label": "A Cozzio",
        "value": 1
      },
      {
        "id": 220180,
        "label": "V Pappa",
        "value": 1
      },
      {
        "id": 220183,
        "label": "M Dalamaga",
        "value": 1
      },
      {
        "id": 220188,
        "label": "P L Ortiz-Romero",
        "value": 1
      },
      {
        "id": 220179,
        "label": "E Kapniari",
        "value": 1
      },
      {
        "id": 220184,
        "label": "C Jonak",
        "value": 12
      },
      {
        "id": 220186,
        "label": "S Engelina",
        "value": 1
      },
      {
        "id": 220193,
        "label": "E Guenova",
        "value": 1
      },
      {
        "id": 220191,
        "label": "F Dimitriou",
        "value": 1
      },
      {
        "id": 220178,
        "label": "E Papadavid",
        "value": 18
      },
      {
        "id": 203665,
        "label": "S Hoey",
        "value": 1
      },
      {
        "id": 203661,
        "label": "P Fairbrother",
        "value": 1
      },
      {
        "id": 203663,
        "label": "G Gupta",
        "value": 1
      },
      {
        "id": 203668,
        "label": "E Mallon",
        "value": 1
      },
      {
        "id": 203662,
        "label": "K Fife",
        "value": 1
      },
      {
        "id": 203671,
        "label": "J Newman",
        "value": 1
      },
      {
        "id": 203672,
        "label": "E V Pynn",
        "value": 1
      },
      {
        "id": 203673,
        "label": "N Shroff",
        "value": 1
      },
      {
        "id": 203669,
        "label": "R J Motley",
        "value": 1
      },
      {
        "id": 203660,
        "label": "P G Budny",
        "value": 1
      },
      {
        "id": 203676,
        "label": "M F Mohd Mustapa",
        "value": 1
      },
      {
        "id": 203657,
        "label": "C A Harwood",
        "value": 1
      },
      {
        "id": 203658,
        "label": "J Botting",
        "value": 1
      },
      {
        "id": 203677,
        "label": "M C Ezejimofor",
        "value": 1
      },
      {
        "id": 203674,
        "label": "D N Slater",
        "value": 1
      },
      {
        "id": 203659,
        "label": "P Buckley",
        "value": 1
      },
      {
        "id": 203678,
        "label": "British Association of Dermatologists’ Clinical Standards Unit",
        "value": 1
      },
      {
        "id": 203664,
        "label": "M Hashme",
        "value": 1
      },
      {
        "id": 203656,
        "label": "E J McGrath",
        "value": 1
      },
      {
        "id": 203670,
        "label": "C Newlands",
        "value": 1
      },
      {
        "id": 203675,
        "label": "L S Exton",
        "value": 1
      },
      {
        "id": 203666,
        "label": "J T Lear",
        "value": 1
      },
      {
        "id": 203667,
        "label": "R Mallipeddi",
        "value": 1
      },
      {
        "id": 203655,
        "label": "I Nasr",
        "value": 23
      },
      {
        "id": 186250,
        "label": "M Wakkee",
        "value": 1
      },
      {
        "id": 186252,
        "label": "T Nijsten",
        "value": 1
      },
      {
        "id": 186251,
        "label": "E C Kramer-Noels",
        "value": 1
      },
      {
        "id": 186253,
        "label": "M Lugtenberg",
        "value": 1
      },
      {
        "id": 186249,
        "label": "T E Sangers",
        "value": 4
      },
      {
        "id": 213511,
        "label": "C Nardin",
        "value": 1
      },
      {
        "id": 213509,
        "label": "D Popescu",
        "value": 1
      },
      {
        "id": 213508,
        "label": "E Puzenat",
        "value": 1
      },
      {
        "id": 213510,
        "label": "F Aubin",
        "value": 1
      },
      {
        "id": 213507,
        "label": "T Guillaume",
        "value": 4
      },
      {
        "id": 186245,
        "label": "H C Etchevers",
        "value": 1
      },
      {
        "id": 186246,
        "label": "M S van Kessel",
        "value": 1
      },
      {
        "id": 186244,
        "label": "W Oei",
        "value": 1
      },
      {
        "id": 186242,
        "label": "S G M A Pasmans",
        "value": 1
      },
      {
        "id": 186247,
        "label": "C M A M van der Horst",
        "value": 1
      },
      {
        "id": 220164,
        "label": "P I Spuls",
        "value": 1
      },
      {
        "id": 186243,
        "label": "A Wolkerstorfer",
        "value": 1
      },
      {
        "id": 186241,
        "label": "A C Fledderus",
        "value": 7
      },
      {
        "id": 196897,
        "label": "F Trautinger",
        "value": 1
      },
      {
        "id": 196902,
        "label": "P M Brunner",
        "value": 1
      },
      {
        "id": 196901,
        "label": "M Farlik",
        "value": 1
      },
      {
        "id": 196898,
        "label": "G Stingl",
        "value": 1
      },
      {
        "id": 196893,
        "label": "T B Rojahn",
        "value": 1
      },
      {
        "id": 196892,
        "label": "K Rindler",
        "value": 1
      },
      {
        "id": 196894,
        "label": "L E Shaw",
        "value": 1
      },
      {
        "id": 196900,
        "label": "L Cerroni",
        "value": 1
      },
      {
        "id": 196899,
        "label": "P Tschandl",
        "value": 1
      },
      {
        "id": 196896,
        "label": "W Weninger",
        "value": 1
      },
      {
        "id": 196891,
        "label": "N Alkon",
        "value": 1
      },
      {
        "id": 188068,
        "label": "Christian Tim Wilms",
        "value": 1
      },
      {
        "id": 188067,
        "label": "Nils Heim",
        "value": 1
      },
      {
        "id": 192890,
        "label": "J Salas Jarque",
        "value": 1
      },
      {
        "id": 192891,
        "label": "M A Pérez-Jacoiste Asín",
        "value": 1
      },
      {
        "id": 193076,
        "label": "I Solares",
        "value": 2
      },
      {
        "id": 204067,
        "label": "Laufey Tryggvadottir",
        "value": 1
      },
      {
        "id": 204064,
        "label": "Reid Waldman",
        "value": 1
      },
      {
        "id": 204065,
        "label": "Désirée Ratner",
        "value": 1
      },
      {
        "id": 212768,
        "label": "Hao Feng",
        "value": 1
      },
      {
        "id": 204068,
        "label": "Jon Gunnlaugur Jonasson",
        "value": 1
      },
      {
        "id": 204063,
        "label": "Jonas A Adalsteinsson",
        "value": 5
      },
      {
        "id": 74273,
        "label": "Simona Stolnicu",
        "value": 1
      },
      {
        "id": 56732,
        "label": "Adrian Naznean",
        "value": 1
      },
      {
        "id": 56731,
        "label": "Bogdan Dobrovat",
        "value": 1
      },
      {
        "id": 74272,
        "label": "Cristian Podoleanu",
        "value": 1
      },
      {
        "id": 74271,
        "label": "Anca Chiriac",
        "value": 4
      },
      {
        "id": 99524,
        "label": "Fatema A Al-Jaralla",
        "value": 1
      },
      {
        "id": 99526,
        "label": "Reem M Alhyali",
        "value": 1
      },
      {
        "id": 99525,
        "label": "Robert A Schwartz",
        "value": 1
      },
      {
        "id": 99523,
        "label": "Khalifa E Sharquie",
        "value": 3
      },
      {
        "id": 52196,
        "label": "Pietro Bearzi",
        "value": 1
      },
      {
        "id": 52199,
        "label": "Pietro Donati",
        "value": 1
      },
      {
        "id": 52197,
        "label": "Rowit Q Kumar",
        "value": 1
      },
      {
        "id": 52201,
        "label": "Santo R Mercuri",
        "value": 1
      },
      {
        "id": 52200,
        "label": "Chiara Panetta",
        "value": 1
      },
      {
        "id": 52198,
        "label": "Luigi Losco",
        "value": 1
      },
      {
        "id": 57053,
        "label": "Giovanni Paolino",
        "value": 7
      },
      {
        "id": 81138,
        "label": "Caterina Lanna",
        "value": 1
      },
      {
        "id": 81139,
        "label": "Augusto Orlandi",
        "value": 1
      },
      {
        "id": 100837,
        "label": "Elena Campione",
        "value": 1
      },
      {
        "id": 81136,
        "label": "Alessia Lanzillotta",
        "value": 1
      },
      {
        "id": 100838,
        "label": "Luca Bianchi",
        "value": 2
      },
      {
        "id": 81142,
        "label": "Stefano DI Girolamo",
        "value": 1
      },
      {
        "id": 81135,
        "label": "Rita DE Berardinis",
        "value": 1
      },
      {
        "id": 81137,
        "label": "Flavia Lozzi",
        "value": 1
      },
      {
        "id": 81134,
        "label": "Terenzio Cosio",
        "value": 1
      },
      {
        "id": 81133,
        "label": "Monia DI Prete",
        "value": 9
      },
      {
        "id": 81151,
        "label": "Nicola DI Meo",
        "value": 1
      },
      {
        "id": 81146,
        "label": "Giovanni Magaton-Rizzi",
        "value": 2
      },
      {
        "id": 81150,
        "label": "Iris Zalaudek",
        "value": 2
      },
      {
        "id": 81145,
        "label": "Roberta Vezzoni",
        "value": 1
      },
      {
        "id": 81149,
        "label": "Maria A Cova",
        "value": 1
      },
      {
        "id": 81147,
        "label": "Roberta Giuffrida",
        "value": 1
      },
      {
        "id": 81144,
        "label": "Chiara Retrosi",
        "value": 1
      },
      {
        "id": 81148,
        "label": "Ferruccio Degrassi",
        "value": 1
      },
      {
        "id": 81143,
        "label": "Claudio Conforti",
        "value": 8
      },
      {
        "id": 89697,
        "label": "Stefania Barruscotti",
        "value": 1
      },
      {
        "id": 89699,
        "label": "Carlo F Tomasini",
        "value": 1
      },
      {
        "id": 89698,
        "label": "Annalisa DE Silvestri",
        "value": 1
      },
      {
        "id": 118621,
        "label": "Valeria Brazzelli",
        "value": 2
      },
      {
        "id": 89696,
        "label": "Vittorio Bolcato",
        "value": 4
      },
      {
        "id": 81154,
        "label": "Marco Campoli",
        "value": 1
      },
      {
        "id": 86264,
        "label": "Elisa Cinotti",
        "value": 1
      },
      {
        "id": 86263,
        "label": "Pietro Rubegni",
        "value": 1
      },
      {
        "id": 81152,
        "label": "Luca Provvidenziale",
        "value": 3
      },
      {
        "id": 118615,
        "label": "Emilio Berti",
        "value": 4
      },
      {
        "id": 52207,
        "label": "Stefano Ferrero",
        "value": 2
      },
      {
        "id": 52210,
        "label": "Alessandro Del Gobbo",
        "value": 2
      },
      {
        "id": 52203,
        "label": "Luigia Venegoni",
        "value": 2
      },
      {
        "id": 52208,
        "label": "Raffaele Gianotti",
        "value": 2
      },
      {
        "id": 52205,
        "label": "Stefano Cavicchini",
        "value": 1
      },
      {
        "id": 52206,
        "label": "Antonella Coggi",
        "value": 2
      },
      {
        "id": 52204,
        "label": "Daniele Fanoni",
        "value": 1
      },
      {
        "id": 52202,
        "label": "Elena Guanziroli",
        "value": 9
      },
      {
        "id": 68002,
        "label": "Andrea Belluzzi",
        "value": 1
      },
      {
        "id": 68000,
        "label": "Clara Bertuzzi",
        "value": 2
      },
      {
        "id": 146917,
        "label": "Annalisa Patrizi",
        "value": 3
      },
      {
        "id": 68001,
        "label": "Eleonora Scaioli",
        "value": 1
      },
      {
        "id": 68003,
        "label": "Elena Sabattini",
        "value": 1
      },
      {
        "id": 118637,
        "label": "Alessandro Pileri",
        "value": 7
      },
      {
        "id": 67999,
        "label": "Alba Guglielmo",
        "value": 7
      },
      {
        "id": 89713,
        "label": "Mauro Mazzeo",
        "value": 3
      },
      {
        "id": 89712,
        "label": "Alessandra Ventura",
        "value": 1
      },
      {
        "id": 89714,
        "label": "Cosimo DI Raimondo",
        "value": 1
      },
      {
        "id": 100834,
        "label": "Dionisio Silvaggio",
        "value": 1
      },
      {
        "id": 89715,
        "label": "Paolo Lombardo",
        "value": 1
      },
      {
        "id": 89711,
        "label": "Giulia Spallone",
        "value": 6
      },
      {
        "id": 2168,
        "label": "Luca Feci",
        "value": 1
      },
      {
        "id": 2171,
        "label": "Irene Ingordo",
        "value": 1
      },
      {
        "id": 172767,
        "label": "Luigi Naldi",
        "value": 1
      },
      {
        "id": 2172,
        "label": "Riccardo Sirna",
        "value": 1
      },
      {
        "id": 52757,
        "label": "Simone Cazzaniga",
        "value": 1
      },
      {
        "id": 2167,
        "label": "Vito Ingordo",
        "value": 5
      },
      {
        "id": 1668,
        "label": "Fabio Fuligni",
        "value": 1
      },
      {
        "id": 1672,
        "label": "Italian Lymphoma Foundation (FIL) - Cutaneous Lymphoma Task Force",
        "value": 1
      },
      {
        "id": 118647,
        "label": "Nicola Pimpinelli",
        "value": 3
      },
      {
        "id": 3847,
        "label": "Irene Lastrucci",
        "value": 1
      },
      {
        "id": 52368,
        "label": "Iria Neri",
        "value": 1
      },
      {
        "id": 6390,
        "label": "Andrea Sechi",
        "value": 5
      },
      {
        "id": 67987,
        "label": "Michele Donati",
        "value": 6
      },
      {
        "id": 3838,
        "label": "Stefania Tenna",
        "value": 1
      },
      {
        "id": 3831,
        "label": "Mauro Barone",
        "value": 1
      },
      {
        "id": 3839,
        "label": "Paolo Persichetti",
        "value": 1
      },
      {
        "id": 3833,
        "label": "Valeria Devirgiliis",
        "value": 1
      },
      {
        "id": 3834,
        "label": "Vincenzo Roberti",
        "value": 1
      },
      {
        "id": 3835,
        "label": "Eleonora Perrella",
        "value": 1
      },
      {
        "id": 3837,
        "label": "Enzo Palese",
        "value": 1
      },
      {
        "id": 3840,
        "label": "Vincenzo Panasiti",
        "value": 3
      },
      {
        "id": 3832,
        "label": "Salvatore Zanframundo",
        "value": 1
      },
      {
        "id": 3830,
        "label": "Rosa Coppola",
        "value": 10
      },
      {
        "id": 56829,
        "label": "Ruggero Moro",
        "value": 1
      },
      {
        "id": 5565,
        "label": "Eduardo Nagore",
        "value": 1
      },
      {
        "id": 1110,
        "label": "Fabio Falcini",
        "value": 1
      },
      {
        "id": 1109,
        "label": "Ignazio Stanganelli",
        "value": 1
      },
      {
        "id": 151132,
        "label": "Lauro Bucchi",
        "value": 1
      },
      {
        "id": 1104,
        "label": "Rosa Vattiato",
        "value": 1
      },
      {
        "id": 1101,
        "label": "Emanuele Crocetti",
        "value": 1
      },
      {
        "id": 1106,
        "label": "Alessandra Ravaioli",
        "value": 1
      },
      {
        "id": 1105,
        "label": "Orietta Giuliani",
        "value": 1
      },
      {
        "id": 1107,
        "label": "Flavia Baldacchini",
        "value": 1
      },
      {
        "id": 1108,
        "label": "Chiara Balducci",
        "value": 1
      },
      {
        "id": 1100,
        "label": "Silvia Mancini",
        "value": 10
      },
      {
        "id": 983,
        "label": "Damiano Abeni",
        "value": 1
      },
      {
        "id": 977,
        "label": "Andrea Paradisi",
        "value": 1
      },
      {
        "id": 978,
        "label": "Luca Fania",
        "value": 1
      },
      {
        "id": 982,
        "label": "Annarita Panebianco",
        "value": 1
      },
      {
        "id": 979,
        "label": "Sabatino Pallotta",
        "value": 1
      },
      {
        "id": 980,
        "label": "Giovanni DI Lella",
        "value": 1
      },
      {
        "id": 981,
        "label": "Luciano Sobrino",
        "value": 1
      },
      {
        "id": 163327,
        "label": "Francesco Ricci",
        "value": 7
      },
      {
        "id": 4832,
        "label": "Silvia Bolzonello",
        "value": 1
      },
      {
        "id": 4833,
        "label": "Matteo Olivieri",
        "value": 1
      },
      {
        "id": 153676,
        "label": "Eugenio Borsatti",
        "value": 1
      },
      {
        "id": 4836,
        "label": "Fabio Puglisi",
        "value": 1
      },
      {
        "id": 4831,
        "label": "Giovanni Lo Re",
        "value": 1
      },
      {
        "id": 4834,
        "label": "Caterina Pinzani",
        "value": 1
      },
      {
        "id": 130133,
        "label": "Vincenzo Canzonieri",
        "value": 1
      },
      {
        "id": 4829,
        "label": "Loredana Militello",
        "value": 1
      },
      {
        "id": 4827,
        "label": "Maria A Pizzichetta",
        "value": 10
      },
      {
        "id": 241494,
        "label": "Lin Wang",
        "value": 1
      },
      {
        "id": 4722,
        "label": "Peng-Fei Wen",
        "value": 1
      },
      {
        "id": 4721,
        "label": "Si-Rui Hua",
        "value": 2
      },
      {
        "id": 1661,
        "label": "Francesca Peccerillo",
        "value": 1
      },
      {
        "id": 1658,
        "label": "Mara Lombardi",
        "value": 1
      },
      {
        "id": 131246,
        "label": "Caterina Longo",
        "value": 2
      },
      {
        "id": 148923,
        "label": "Simonetta Piana",
        "value": 1
      },
      {
        "id": 1663,
        "label": "Federico Garbarino",
        "value": 1
      },
      {
        "id": 1660,
        "label": "Athanassios Kyrgidis",
        "value": 1
      },
      {
        "id": 55516,
        "label": "Giovanni Pellacani",
        "value": 1
      },
      {
        "id": 1656,
        "label": "Margherita Raucci",
        "value": 1
      },
      {
        "id": 1662,
        "label": "Alessia Paganelli",
        "value": 1
      },
      {
        "id": 1657,
        "label": "Marica Mirra",
        "value": 1
      },
      {
        "id": 1655,
        "label": "Riccardo Pampena",
        "value": 10
      },
      {
        "id": 1202,
        "label": "Simone Carotti",
        "value": 1
      },
      {
        "id": 97856,
        "label": "Sergio Morini",
        "value": 1
      },
      {
        "id": 4713,
        "label": "Eleonora Cinelli",
        "value": 1
      },
      {
        "id": 64177,
        "label": "Stefano Calvieri",
        "value": 2
      },
      {
        "id": 1677,
        "label": "Martina Verri",
        "value": 1
      },
      {
        "id": 1674,
        "label": "Giovanni Zelano",
        "value": 1
      },
      {
        "id": 1682,
        "label": "Anna Crescenzi",
        "value": 1
      },
      {
        "id": 1600,
        "label": "Paolo Piemonte",
        "value": 1
      },
      {
        "id": 1597,
        "label": "Flavia Persechino",
        "value": 1
      },
      {
        "id": 1607,
        "label": "Marco Ardigò",
        "value": 1
      },
      {
        "id": 67988,
        "label": "Angela Ferrari",
        "value": 1
      },
      {
        "id": 1601,
        "label": "Chiara Franceschini",
        "value": 1
      },
      {
        "id": 1602,
        "label": "Laura Eibenschutz",
        "value": 1
      },
      {
        "id": 1605,
        "label": "Pasquale Frascione",
        "value": 1
      },
      {
        "id": 1604,
        "label": "Pierluigi Buccini",
        "value": 1
      },
      {
        "id": 118635,
        "label": "Carlo Cota",
        "value": 2
      },
      {
        "id": 1596,
        "label": "Anna Carbone",
        "value": 11
      },
      {
        "id": 4266,
        "label": "Dioniosio Silvaggio",
        "value": 1
      },
      {
        "id": 5571,
        "label": "Lorenzo Cerroni",
        "value": 1
      },
      {
        "id": 5586,
        "label": "Elizabeth Lazaridou",
        "value": 1
      },
      {
        "id": 5581,
        "label": "Chryssoula Papageorgiou",
        "value": 1
      },
      {
        "id": 5587,
        "label": "Zoe Apalla",
        "value": 1
      },
      {
        "id": 5583,
        "label": "Konstantinos Liopyris",
        "value": 1
      },
      {
        "id": 5585,
        "label": "Andreas Moutsoudis",
        "value": 1
      },
      {
        "id": 5579,
        "label": "Eleni Paschou",
        "value": 1
      },
      {
        "id": 5582,
        "label": "Ioannis Spyridis",
        "value": 1
      },
      {
        "id": 5580,
        "label": "Sofia-Magdalini Manoli",
        "value": 1
      },
      {
        "id": 5584,
        "label": "Mattheos Bobos",
        "value": 1
      },
      {
        "id": 5578,
        "label": "Aimilios Lallas",
        "value": 9
      },
      {
        "id": 60859,
        "label": "Roberto Alfano",
        "value": 1
      },
      {
        "id": 60860,
        "label": "Giuseppe Argenziano",
        "value": 1
      },
      {
        "id": 4262,
        "label": "Marina Agozzino",
        "value": 1
      },
      {
        "id": 131240,
        "label": "Elvira Moscarella",
        "value": 1
      },
      {
        "id": 4260,
        "label": "Graziella Babino",
        "value": 4
      },
      {
        "id": 4239,
        "label": "Marco Barella",
        "value": 1
      },
      {
        "id": 4237,
        "label": "Francesca L Boggio",
        "value": 8
      },
      {
        "id": 2324,
        "label": "Cesare Rossi",
        "value": 1
      },
      {
        "id": 2328,
        "label": "Giulia Veronesi",
        "value": 1
      },
      {
        "id": 2327,
        "label": "Manuela Ferracin",
        "value": 1
      },
      {
        "id": 2326,
        "label": "Sara Miccoli",
        "value": 1
      },
      {
        "id": 2325,
        "label": "Daniela Turchetti",
        "value": 1
      },
      {
        "id": 203035,
        "label": "Federica Scarfì",
        "value": 1
      },
      {
        "id": 2330,
        "label": "Martina Lambertini",
        "value": 1
      },
      {
        "id": 15129,
        "label": "Emi Dika",
        "value": 8
      },
      {
        "id": 4694,
        "label": "Roberta Mancuso",
        "value": 1
      },
      {
        "id": 4687,
        "label": "Giovanni Genovese",
        "value": 1
      },
      {
        "id": 4689,
        "label": "Ketty Peris",
        "value": 1
      },
      {
        "id": 132576,
        "label": "Giuseppe Micali",
        "value": 2
      },
      {
        "id": 4693,
        "label": "Silvia Della Bella",
        "value": 1
      },
      {
        "id": 4695,
        "label": "Piergiacomo Calzavara Pinton",
        "value": 1
      },
      {
        "id": 4692,
        "label": "Fabio Ayala",
        "value": 1
      },
      {
        "id": 4696,
        "label": "Athanasia Tourlaki",
        "value": 1
      },
      {
        "id": 4690,
        "label": "Franco Rongioletti",
        "value": 1
      },
      {
        "id": 4686,
        "label": "Lucia Brambilla",
        "value": 10
      },
      {
        "id": 157918,
        "label": "Nahid Y Vidal",
        "value": 1
      },
      {
        "id": 157917,
        "label": "Jennifer Hanson",
        "value": 1
      },
      {
        "id": 178365,
        "label": "Benjamin G Gorman",
        "value": 2
      },
      {
        "id": 195573,
        "label": "Tan Jun",
        "value": 1
      },
      {
        "id": 195572,
        "label": "Xiu-Li Liu",
        "value": 1
      },
      {
        "id": 204026,
        "label": "Pei Liu",
        "value": 1
      },
      {
        "id": 195571,
        "label": "Can Cao",
        "value": 1
      },
      {
        "id": 212184,
        "label": "Chao Zhang",
        "value": 4
      },
      {
        "id": 79986,
        "label": "Bridget Hemmant",
        "value": 1
      },
      {
        "id": 79985,
        "label": "Laszlo Igali",
        "value": 1
      },
      {
        "id": 79984,
        "label": "Umair Qidwai",
        "value": 1
      },
      {
        "id": 79983,
        "label": "Zhiheng Lin",
        "value": 3
      },
      {
        "id": 67121,
        "label": "Raffaella Carandente",
        "value": 1
      },
      {
        "id": 93204,
        "label": "Daniela Montorio",
        "value": 1
      },
      {
        "id": 67120,
        "label": "Lidia Clemente",
        "value": 1
      },
      {
        "id": 67122,
        "label": "Fausto Tranfa",
        "value": 1
      },
      {
        "id": 67119,
        "label": "Federica Fossataro",
        "value": 1
      },
      {
        "id": 93203,
        "label": "Gilda Cennamo",
        "value": 5
      },
      {
        "id": 131421,
        "label": "S R Mercuri",
        "value": 1
      },
      {
        "id": 131416,
        "label": "F Bandello",
        "value": 1
      },
      {
        "id": 131414,
        "label": "A Bulotta",
        "value": 1
      },
      {
        "id": 131412,
        "label": "P Brianti",
        "value": 1
      },
      {
        "id": 131413,
        "label": "C Prezioso",
        "value": 1
      },
      {
        "id": 131418,
        "label": "C Federici",
        "value": 1
      },
      {
        "id": 131420,
        "label": "G M Modorati",
        "value": 1
      },
      {
        "id": 131419,
        "label": "V Gregorc",
        "value": 1
      },
      {
        "id": 131411,
        "label": "M V Cicinelli",
        "value": 1
      },
      {
        "id": 131415,
        "label": "N Rizzo",
        "value": 1
      },
      {
        "id": 131417,
        "label": "L Lugini",
        "value": 1
      },
      {
        "id": 131410,
        "label": "G Paolino",
        "value": 11
      },
      {
        "id": 72110,
        "label": "A Kasuya",
        "value": 1
      },
      {
        "id": 72113,
        "label": "Y Tokura",
        "value": 1
      },
      {
        "id": 72112,
        "label": "T Ito",
        "value": 1
      },
      {
        "id": 72109,
        "label": "T Shimauchi",
        "value": 1
      },
      {
        "id": 72111,
        "label": "T Yatagai",
        "value": 1
      },
      {
        "id": 72108,
        "label": "K Kurihara",
        "value": 5
      },
      {
        "id": 169505,
        "label": "Mara Boschetti",
        "value": 1
      },
      {
        "id": 169501,
        "label": "Alessandro Veresani",
        "value": 1
      },
      {
        "id": 169499,
        "label": "Andrea Dotto",
        "value": 1
      },
      {
        "id": 169500,
        "label": "Federica Nista",
        "value": 1
      },
      {
        "id": 169506,
        "label": "Diego Ferone",
        "value": 1
      },
      {
        "id": 169502,
        "label": "Luca Patti",
        "value": 1
      },
      {
        "id": 169503,
        "label": "Stefano Gay",
        "value": 1
      },
      {
        "id": 169504,
        "label": "Stefania Sciallero",
        "value": 1
      },
      {
        "id": 169498,
        "label": "Manuela Albertelli",
        "value": 8
      },
      {
        "id": 199102,
        "label": "Xiongfei Zou",
        "value": 1
      },
      {
        "id": 199101,
        "label": "Surong Hua",
        "value": 1
      },
      {
        "id": 199103,
        "label": "Yaping Luo",
        "value": 1
      },
      {
        "id": 199100,
        "label": "Shikun Zhu",
        "value": 1
      },
      {
        "id": 199099,
        "label": "Shu Zhang",
        "value": 4
      },
      {
        "id": 68999,
        "label": "Francesco Lacarrubba",
        "value": 1
      },
      {
        "id": 69001,
        "label": "Franco Dinotta",
        "value": 1
      },
      {
        "id": 69000,
        "label": "Rosario Caltabiano",
        "value": 1
      },
      {
        "id": 68998,
        "label": "Anna Elisa Verzì",
        "value": 4
      },
      {
        "id": 71760,
        "label": "Cathal O'Connor",
        "value": 1
      },
      {
        "id": 71761,
        "label": "Michelle Murphy",
        "value": 1
      },
      {
        "id": 71759,
        "label": "Siobhán Rafferty",
        "value": 2
      },
      {
        "id": 220965,
        "label": "J Monte-Serrano",
        "value": 1
      },
      {
        "id": 215650,
        "label": "L Prieto-Torres",
        "value": 1
      },
      {
        "id": 215648,
        "label": "T Bernués-Bergua",
        "value": 2
      },
      {
        "id": 110637,
        "label": "P Espinosa-Lara",
        "value": 1
      },
      {
        "id": 110638,
        "label": "M Simón-Lázaro",
        "value": 1
      },
      {
        "id": 110636,
        "label": "J Fernández-Horcajuelo",
        "value": 2
      },
      {
        "id": 95834,
        "label": "Gunther Pabst",
        "value": 1
      },
      {
        "id": 95835,
        "label": "Urs Hug",
        "value": 1
      },
      {
        "id": 95833,
        "label": "Elmar Fritsche",
        "value": 1
      },
      {
        "id": 95832,
        "label": "Patricia Esther Engels",
        "value": 3
      },
      {
        "id": 98107,
        "label": "Sercan Çikrikci",
        "value": 1
      },
      {
        "id": 98108,
        "label": "Funda Erduran",
        "value": 1
      },
      {
        "id": 98109,
        "label": "Halit Üner",
        "value": 1
      },
      {
        "id": 98106,
        "label": "Halil Polat",
        "value": 3
      },
      {
        "id": 95258,
        "label": "Paul Googe",
        "value": 1
      },
      {
        "id": 95259,
        "label": "Julie Blatt",
        "value": 1
      },
      {
        "id": 95260,
        "label": "Jeyhan Wood",
        "value": 1
      },
      {
        "id": 95255,
        "label": "Arya Akhavan",
        "value": 1
      },
      {
        "id": 95256,
        "label": "Idorenyin Ndem",
        "value": 1
      },
      {
        "id": 95257,
        "label": "David Ollila",
        "value": 1
      },
      {
        "id": 95254,
        "label": "Meredith Kugar",
        "value": 6
      },
      {
        "id": 225285,
        "label": "Liping Zhao",
        "value": 1
      },
      {
        "id": 81684,
        "label": "Yanjun Chu",
        "value": 1
      },
      {
        "id": 81682,
        "label": "Zhongliang Lang",
        "value": 2
      },
      {
        "id": 111100,
        "label": "Jinghang Zhang",
        "value": 1
      },
      {
        "id": 111101,
        "label": "Minghao Guo",
        "value": 1
      },
      {
        "id": 111099,
        "label": "Haijun Ma",
        "value": 2
      },
      {
        "id": 118625,
        "label": "Emanuele Cozzani",
        "value": 1
      },
      {
        "id": 118628,
        "label": "Daniele Gambini",
        "value": 1
      },
      {
        "id": 118629,
        "label": "Paolo Iacovelli",
        "value": 1
      },
      {
        "id": 118641,
        "label": "Annamaria Offidani",
        "value": 1
      },
      {
        "id": 118639,
        "label": "Marco Simonacci",
        "value": 1
      },
      {
        "id": 118622,
        "label": "Pier Luigi Bruni",
        "value": 1
      },
      {
        "id": 118632,
        "label": "Giuseppe Monfrecola",
        "value": 1
      },
      {
        "id": 126568,
        "label": "Paola Savoia",
        "value": 1
      },
      {
        "id": 118614,
        "label": "Antonello Baldo",
        "value": 1
      },
      {
        "id": 118643,
        "label": "Michele Pellegrino",
        "value": 1
      },
      {
        "id": 118616,
        "label": "Pietro Quaglino",
        "value": 1
      },
      {
        "id": 118636,
        "label": "Paolo Pigatto",
        "value": 1
      },
      {
        "id": 118620,
        "label": "Paolo Amerio",
        "value": 1
      },
      {
        "id": 118623,
        "label": "Piergiacomo Calzavara-Pinton",
        "value": 1
      },
      {
        "id": 118618,
        "label": "Mauro Alaibac",
        "value": 1
      },
      {
        "id": 118640,
        "label": "Marina Venturini",
        "value": 1
      },
      {
        "id": 118645,
        "label": "Roberta Piccinno",
        "value": 1
      },
      {
        "id": 118646,
        "label": "Karl Lawrence",
        "value": 1
      },
      {
        "id": 118630,
        "label": "Alessia Pacifico",
        "value": 1
      },
      {
        "id": 118619,
        "label": "Silvia Alberti-Violetti",
        "value": 1
      },
      {
        "id": 118642,
        "label": "Elisa Molinelli",
        "value": 1
      },
      {
        "id": 118644,
        "label": "Emanuele Trovato",
        "value": 1
      },
      {
        "id": 118617,
        "label": "Serena Rupoli",
        "value": 1
      },
      {
        "id": 118626,
        "label": "Martina Burlando",
        "value": 1
      },
      {
        "id": 118634,
        "label": "Giorgio Mozzicafreddo",
        "value": 1
      },
      {
        "id": 118624,
        "label": "Aurora Parodi",
        "value": 1
      },
      {
        "id": 118633,
        "label": "Alberico Motolese",
        "value": 1
      },
      {
        "id": 118627,
        "label": "Maria Concetta Fargnoli",
        "value": 1
      },
      {
        "id": 134334,
        "label": "Vieri Grandi",
        "value": 34
      }
    ]
  };

  const [graphInfo, setGraphInfo] = useState({
    data: {
      nodes: json_data3.nodes,
      edges: json_data3.edges,
    },

    options: {
      nodes: {
        shape: 'dot',
      },
      interaction: {
        hover: true,
        tooltipDelay: 100,
      },
    },
  });

  const [loadingProgress, setLoadingProgress] = useState(0)

  // A reference to the div rendered by this component
  const domNode = useRef(null);

  useEffect(() => {
    let network = new Network(
        domNode.current,
        graphInfo.data,
        graphInfo.options
    );

    network.on("stabilizationProgress", function (params) {
      document.getElementById("visjs-loading-cover").style.opacity = 1;
      document.getElementById("visjs-loading-cover").style.display = "show";
      setLoadingProgress( 100 * params.iterations / params.total);
    });

    network.once("stabilizationIterationsDone", function () {
      setLoadingProgress(100);
      document.getElementById("visjs-loading-cover").style.opacity = 0;

      setTimeout(function () {
        document.getElementById("visjs-loading-cover").style.display = "none";
      }, 500);
    });

    domNode.current = network

  }, [domNode, graphInfo]);

  return <div>
    <div ref={domNode} />
    <div id="visjs-loading-cover">
      <div id="visjs-progress-container">
        <LinearProgress variant="determinate" value={loadingProgress} />
        <div id="visjs-progress-percentage">{loadingProgress}%</div>
      </div>
    </div>
  </div>;
};

export default Graph;
