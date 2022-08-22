/**
 * Code Inspired from:
 		* https://stackoverflow.com/questions/40792649/rendering-vis-js-network-into-container-via-react-js

 * Data from:
 		* https://visjs.github.io/vis-network/examples/
		* https://visjs.github.io/vis-network/examples/static/codepen.03abfb6443c182fdd9fdb252aa1d7baab3900da615e980199e21189c8f7a41e4.html
 */

import React, { useEffect, useRef, useState } from 'react';
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
  }

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
  }

  const [graphInfo, setGraphInfo] = useState({
    data: {
      nodes: json_data2.nodes,
      edges: json_data2.edges,
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

  // A reference to the div rendered by this component
  const domNode = useRef(null);

  useEffect(() => {
    domNode.current = new Network(
      domNode.current,
      graphInfo.data,
      graphInfo.options
    );
  }, [domNode, graphInfo]);

  return <div ref={domNode} />;
};

export default Graph;
