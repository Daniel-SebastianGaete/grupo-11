function valToArr(value, dict) {
    let entries = Object.entries(dict);
    entries = entries.filter((d) => d[1] !== 'Sin info');
    const min = d3.min(entries, (d) => d[0]);
    const arr = new Array(entries.length).fill(0);
    if (min[0] == 0) {
        arr[value] = 1;
    } else if (min[0] == 1) {
        arr[value - 1] = 1;
    } else {
        console.log('ERROR');
    }
    return arr;
}

let rCoef = [];
let rConst = 0;
d3.json('regr.json')
    .then((data) => {
        rCoef = data.Coef;
        rConst = data.Beta;
    })
    .catch((err) => console.log(err));


const path = 'data.json';

const margin = {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50,
}

const
    WIDTH = 800,
    HEIGHT = 500;

const width = WIDTH - margin.left - margin.right,
    height = HEIGHT - margin.top - margin.bottom;

const colorMap = d3.scaleOrdinal(d3.schemeAccent);

const xVar = 'ASISTENCIA';
const yVar = 'PROM_GRAL';
const filterVars = [
    {
        name: 'COD_DEPE',
        text: 'Dependencia del colegio',
        dict: {
            1: 'Corporación Municipal',
            2: 'Municipal DAEM',
            3: 'Particular Subvencionado',
            4: 'Particular Pagado',
            5: 'Corporación de Administración Delegada',
            6: 'Servicio Local de Educación',
        }
    },
    {
        name: 'RURAL_RBD',
        text: 'Ruralidad',
        dict: {
            0: 'Urbano',
            1: 'Rural',
        },
    },
    {
        name: 'GEN_ALU',
        text: 'Sexo estudiante',
        dict: {
            0: 'Sin info',
            1: 'Masculino',
            2: 'Femenino',
        },
    },
    {
        name: 'COD_JOR',
        text: 'Jornada',
        dict: {
            1: 'Mañana',
            2: 'Tarde',
            3: 'Completa',
            4: 'Vespertina',
            5: 'Sin info',
        },
    },
    {
        name: 'SAME_COM',
        text: 'Comuna de residencia',
        dict: {
            0: 'No vive en comuna del colegio',
            1: 'Vive en comuna del colegio',
        },
    },
];

let currentAttr = 'COD_DEPE';

const svg = d3.select('#graph-container').append('svg');
svg
    .attr('height', HEIGHT)
    .attr('width', WIDTH)
    .attr('id', 'svg');

const container = svg.append('g')
    .attr('transform', `translate(${margin.left} ${margin.top})`);

const selectButton = d3.select('#buttons-container')
    .append('select').attr('id', 'select');

const options = selectButton
    .selectAll('option')
    .data(filterVars)
    .enter()
    .append('option')
    .attr('value', (d) => d.name)
    .text((d) => d.text);

const info = d3.select('#graph-container')
    .append('svg')
    .attr('width', WIDTH / 2)
    .attr('height', HEIGHT);

const infoContainer = info.append('g');
    
/////////////////////////////////////////////////////////////
/////////////////////// Display /////////////////////////////
/////////////////////////////////////////////////////////////

const display = (data) => {
    const xScale = d3
        .scaleLinear()
        .domain([0, 100])
        .range([0, width]);

    const yScale = d3
        .scaleLinear()
        .domain([0, 7.0])
        .range([height, 0]);
    
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);
    
    svg.append("g")
        .attr('transform', `translate(${margin.left}, ${margin.top + height})`)
        .call(xAxis);
    
    svg.append("g")
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
        .call(yAxis);

    svg
        .append("text")
        .attr(
          "transform",
          "translate(" + (width / 2 + margin.left) + " ," + margin.top / 2 + ")"
        )
        .style("text-anchor", "middle")
        .text(`Asistencia vs Promedio General`);
    
    svg
        .append("text")
        .attr(
          "transform",
          "translate(" +
            (width / 2 + margin.left) +
            " ," +
            (height + margin.top + margin.bottom / 2) +
            ")"
        )
        .style("text-anchor", "middle")
        .text('Asistencia');
    
    svg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", margin.left / 6)
        .attr("x", 0 - HEIGHT / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text('Promedio General');

    container
        .selectAll('circle')
        .data(data)
        .join(
            (enter) => {
                enter.append('circle')
                    .attr('fill', (d) => colorMap(d[currentAttr]))
                    .attr('cx', (d) => xScale(d.ASISTENCIA))
                    .attr('cy', (d) => yScale(d.PROM_GRAL))
                    .transition()
                    .duration(2000)
                    .attr('r', 4);   
            },
            (update) => {
                update
                    .transition()
                    .duration(2000)
                    .attr('fill', (d) => colorMap(d[currentAttr]));
            }
        )
}

const displayInfo = () => {
    const current = filterVars.filter((d) => d.name === currentAttr);

    const keys = Object.keys(current[0].dict);
    keys.reverse();
    const yScale = d3
        .scaleLinear()
        .domain([d3.min(keys), 6])
        .range([0, height / 2]);
    
    infoContainer
        .selectAll('circle')
        .data(keys)
        .join(
            (enter) => {
                enter.append('circle')
                    .attr('fill', (d) => colorMap(parseInt(d)))
                    .attr('cx', margin.left)
                    .attr('cy', (d) => yScale(d) + margin.top)
                    .transition()
                    .duration(2000)
                    .attr('r', 7);
            },
            (update) => {
                update
                    .transition()
                    .duration(2000)
                    .attr('cy', (d) => yScale(d) + margin.top)
                    .attr('fill', (d) => colorMap(parseInt(d)));
            },
            (exit) => {
                exit
                    .transition()
                    .duration(2000)
                    .attr('r', 0)
                    .remove();
            }
        )
    infoContainer
        .selectAll('text')
        .data(keys)
        .join(
            (enter) => {
                enter.append('text')
                    .attr('class', 'info')
                    .attr('x', margin.left * 2)
                    .attr('y', (d) => yScale(d) + margin.top)
                    .text((d) => current[0].dict[d]);
            },
            (update) => {
                update
                    .attr('y', (d) => yScale(d) + margin.top)
                    .text((d) => current[0].dict[d]);
            },
            (exit) => {
                exit
                    .remove();
            }
        )
}

// CALCULAR PROMEDIO
for (let i = 0; i < filterVars.length; i++) {
    const selectOption = d3.select('#form-container')
        .append('select').attr('id', `${filterVars[i].name}`)
        .selectAll("option")
        .data(Object.entries(filterVars[i].dict))
        .enter()
        .append("option")
        .attr("value", (d) => d[0])
        .text((d) => d[1]);
}

const attendanceOption = d3.select('#form-container')
    .append('input')
    .attr('type', 'range')
    .attr('id', 'attendance-option')
    .attr('min', 0)
    .attr('max', 100);

const formButton = d3.select('#form-button')
    .append('button')
    .text('Enviar')
    .on('click', () => {
        const dep = d3.select(`#${filterVars[0].name}`).property('value');
        const rur = d3.select(`#${filterVars[1].name}`).property('value');
        const gen = d3.select(`#${filterVars[2].name}`).property('value');
        const jor = d3.select(`#${filterVars[3].name}`).property('value');
        const com = d3.select(`#${filterVars[4].name}`).property('value');
        const asis = d3.select('#attendance-option').property('value');

        const arrDep = valToArr(dep, filterVars[0].dict);
        const arrJor = valToArr(jor, filterVars[3].dict);

        const arr = [rur].concat([asis], [gen], [com], arrDep, arrJor);

        let prom = 0;
        for (let i = 0; i < arr.length; i++) {
            prom += arr[i] * rCoef[i];
        }
        prom += rConst;

        d3.select('#prom').text(`Promedio final: ${prom}`);
    });

d3.json(path)
    .then((data) => {
        for (let i = 0; i < data.length; i++) {
            if (data.COD_JOR === 99) {
                data.COD_JOR = 5;
            }
        }

        display(data);
        displayInfo();
        selectButton.on('change', () => {
            currentAttr = d3.select('#select').property('value');
            display(data);
            displayInfo();
        })
    })
    .catch((err) => {
        console.log(err);
    })