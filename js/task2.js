var t22_obj = {
  education: {},
  salary: {},
  edu_labels: ['Bachelors', 'Graduate', 'HighSchoolOrCollege', 'Low'],
  radar_values: ['Income', 'Savings', 'Expense'],
  salary_labels: ['1k-4.5k', '4.5k-8k', '8k-12k', '12k-18k', '18k-22k'],
  salary_range_map: {
    '[1284.661 - 4500.0)': '1k-4.5k',
    '[4500.0 - 8000.0)': '4.5k-8k',
    '[8000.0 - 12000.0)': '8k-12k',
    '[12000.0 - 18000.0)': '12k-18k',
    '[18000.0 - 21334.646)': '18k-22k',
  },
  color: { income: colorScheme.darkblue, savings: colorScheme.green, expenses: colorScheme.orange },
};

var t23_obj = {
  color: {
    Graduate: colorScheme.darkblue,
    Bachelors: colorScheme.orange,
    HighSchoolOrCollege: colorScheme.green,
    Low: colorScheme.yellow,
    one: colorScheme.lightblue,
    four: colorScheme.yellow,
    eight: colorScheme.green,
    tweleve: colorScheme.orange,
    eighteen: colorScheme.darkblue,
    stable: colorScheme.darkblue,
    unstable: colorScheme.green,
    unknown: colorScheme.orange,
  },
};

// Configuration for the Spider chart
const chartConfig = {
  width: 700,
  height: 700,
  margin: { top: 50, right: 50, bottom: 50, left: 50 },
  levels: 5,
  labelFactor: 1.15,
  opacityArea: 0.05,
};

const _educationWrangle = (d, index, attributes) => {
  t22_obj.education[+d.MonthNumber][d.educationLevel]['Income'] = Math.round(Math.abs(d.Income));
  t22_obj.education[+d.MonthNumber][d.educationLevel]['Expense'] = Math.round(Math.abs(d.Expense));
  t22_obj.education[+d.MonthNumber][d.educationLevel]['Savings'] = Math.round(Math.abs(d.Savings));
};
const _salaryWrangle = (d) => {
  t22_obj.salary[+d.MonthNumber][t22_obj.salary_range_map[d['Salary Range']]]['Income'] =
    Math.round(Math.abs(d.Income));
  t22_obj.salary[+d.MonthNumber][t22_obj.salary_range_map[d['Salary Range']]]['Expense'] =
    Math.round(Math.abs(d.Expense));
  t22_obj.salary[+d.MonthNumber][t22_obj.salary_range_map[d['Salary Range']]]['Savings'] =
    Math.round(Math.abs(d.Savings));
};

const _selectUpdate = () => {};
const _checkboxUpdate = () => {};

const _init_radarChart = () => {
  // defaults for global vars
  for (i in [...Array(15).keys()]) {
    t22_obj.education[+i + 1] = {
      Bachelors: { Income: 0, Savings: 0, Expense: 0 },
      Graduate: { Income: 0, Savings: 0, Expense: 0 },
      HighSchoolOrCollege: { Income: 0, Savings: 0, Expense: 0 },
      Low: { Income: 0, Savings: 0, Expense: 0 },
    };

    t22_obj.salary[+i + 1] = {
      '1k-4.5k': { Income: 0, Savings: 0, Expense: 0 },
      '4.5k-8k': { Income: 0, Savings: 0, Expense: 0 },
      '8k-12k': { Income: 0, Savings: 0, Expense: 0 },
      '12k-18k': { Income: 0, Savings: 0, Expense: 0 },
      '18k-22k': { Income: 0, Savings: 0, Expense: 0 },
    };
  }

  // Event Binding
  $('#select-from').on('change', () => {
    _handleLineVisibility();
  });

  $('#parallel-from').on('change', () => {
    _redrawParallelChart();
  });

  $('#radarSelector').on('change', () => {
    _redrawSpiderChart();
    _redrawParallelChart();
  });

  Promise.all([
    d3.csv('../data/t2_education.csv', _educationWrangle),
    d3.csv('../data/t2_salary.csv', _salaryWrangle),
  ]).then(function (values) {
    // Call the function to create the Spider chart
    var data = getDataChart5(timelineValues, true);
    createSpiderChart(data, chartConfig);
  });
};

let globalDataT21 = [];
let globalDataT23 = [];

const _init_streamGraph = () => {
  getDataT21().then((data) => {
    globalDataT21 = data;
    createStreamGraph(globalDataT21, timelineValues);
  });
};

async function getDataT21() {
  try {
    const employmentData = await d3.csv('data/t2_financialStatus.csv');
    return employmentData;
  } catch (e) {
    console.log('Error fetching CSV files : ' + e);
  }
}

const _init_parallelChart = () => {
  getDataT23().then((data) => {
    globalDataT23 = data;
    // console.log("here");
    // console.log(globalDataT23);
    createParallelChart(globalDataT23, timelineValues);
    // createParallelChart(globalDataT23);
  });
};

async function getDataT23() {
  try {
    const incomeData = await d3.csv('data/t2_monthlyIndividual.csv');
    return incomeData;
  } catch (e) {
    console.log('Error fetching CSV files : ' + e);
  }
}

async function createParallelChart(globalDataT23, timelineValues) {
  var edu = document.querySelector('#radarSelector').value;
  if (edu == 'edu') {
    var myDiv = document.getElementById('switch4.5');
    myDiv.style.visibility = 'hidden';

    var myLabel = document.getElementById('4.5');

    var myLabel1 = document.getElementById('Graduate');
    myLabel1.innerHTML = 'Graduate';

    var myLabel2 = document.getElementById('Bachelors');
    myLabel2.innerHTML = 'Bachelors';

    var myLabel3 = document.getElementById('HighSchool');
    myLabel3.innerHTML = 'HighSchool';

    var myLabel4 = document.getElementById('Low');
    myLabel4.innerHTML = 'Low';

    //niket
    var graduateVisible = $('#switchGraduate').is(':checked');
    var bachelorsVisible = $('#switchBachelors').is(':checked');
    var highSchoolVisible = $('#switchHighSchool').is(':checked');
    var lowVisible = $('#switchLow').is(':checked');

    /* incomeVisible
      ? d3.select('#income-line').transition().duration(500).style('opacity', 1)
      : d3.select('#income-line').transition().duration(500).style('opacity', 0);
    expenseVisible
      ? d3.select('#expense-line').transition().duration(500).style('opacity', 1)
      : d3.select('#expense-line').transition().duration(500).style('opacity', 0);
    savingsVisible
      ? d3.select('#savings-line').transition().duration(500).style('opacity', 1)
      : d3.select('#savings-line').transition().duration(500).style('opacity', 0);
*/

    // Change the label text
    myLabel.innerHTML = '';

    const participantData = {};

    const tooltip23 = d3.select('body').append('div').attr('class', 'tooltip').style('opacity', 0);

    globalDataT23.forEach((record) => {
      const participantId = Number(record.participantId);
      const educationLevel = record.educationLevel;
      const monthNumber = record.MonthNumber;
      const savings = record.Savings;

      // If the participantId is not in the participantData object, initialize it
      if (!participantData[participantId]) {
        participantData[participantId] = {
          participantId,
          educationLevel,
          savings: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Initialize savings for each month
        };
      }

      // Accumulate savings for each month
      participantData[participantId].savings[monthNumber - 1] += parseInt(savings, 10);
    });

    // console.log(participantData);

    // Convert the participantData object into an array of rows
    let resultArray = Object.values(participantData);

    if (graduateVisible == false) {
      resultArray = resultArray.filter((item) => item.educationLevel != 'Graduate');
    }

    if (bachelorsVisible == false) {
      resultArray = resultArray.filter((item) => item.educationLevel != 'Bachelors');
    }

    if (highSchoolVisible == false) {
      resultArray = resultArray.filter((item) => item.educationLevel != 'HighSchoolOrCollege');
    }

    if (lowVisible == false) {
      resultArray = resultArray.filter((item) => item.educationLevel != 'Low');
    }

    // Set up the dimensions of the chart
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Append an SVG element to the body
    const svg = d3
      .select('#ParallelChart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Extract education levels
    const educationLevels = Array.from(new Set(resultArray.map((d) => d.educationLevel)));

    // console.log(typeof educationLevels);
    // console.log(educationLevels);
    // Define scales for each axis
    const scales = {};

    // Assuming you have 15 months savings details
    const months = Array.from({ length: timelineValues.end + 1 }, (_, i) => `Month ${i + 1}`);

    months.splice(0, timelineValues.start);

    // console.log(months);

    // console.log('m' + months);

    months.forEach((month) => {
      scales[month] = d3.scaleLinear().domain([0, 20000]).range([height, 0]);
    });

    // Draw axes
    const axis = d3
      .axisLeft()
      .ticks(3) // Specify the number of ticks you want on the y-axis
      .tickFormat(d3.format('.2s'));
    // .tickFormat((d, i) => (i === 150 ? d3.format('.2s')(d) : ''));

    const ax = d3
      .axisLeft()
      .ticks(3) // Specify the number of ticks you want on the y-axis
      // .tickFormat(d3.format('.2s'));
      .tickFormat((d, i) => (i === 150 ? d3.format('.2s')(d) : ''));

    months.forEach((month, i) => {
      if (i == 0) {
        svg
          .append('g')
          .attr('class', 'axis')
          .attr('transform', `translate(${i * (width / (months.length - 1))},0)`)
          .call(axis.scale(scales[month]));

        svg
          .append('text')
          .attr('class', 'month-number')
          .attr('x', -35 + i * (width / (months.length - 1)) + width / (months.length - 1) / 2)
          .attr('y', -25)
          .style('text-anchor', 'middle')
          .text(`${i + timelineValues.start}`);
      } else {
        svg
          .append('g')
          .attr('class', 'axis')
          .attr('transform', `translate(${i * (width / (months.length - 1))},0)`)
          .call(ax.scale(scales[month]));

        svg
          .append('text')
          .attr('class', 'month-number')
          .attr('x', -35 + i * (width / (months.length - 1)) + width / (months.length - 1) / 2)
          .attr('y', -25)
          .style('text-anchor', 'middle')
          .text(`${i + timelineValues.start}`);
      }
    });

    svg
      .append('text')
      .attr('text-anchor', 'end')
      .attr('x', width - 300)
      .attr('y', height + 30)
      .text('Time (Months)');

    // Draw lines
    //const line = d3.line();

    const maxSavings = d3.max(resultArray, (d) => d3.max(d.savings));

    const xScale = d3.scalePoint().domain(months).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, 20000]).range([height, 0]);

    // const colorScale = d3.scaleOrdinal().domain(educationLevels).range(d3.schemeCategory10);

    const colorScale = d3
      .scaleOrdinal()
      .domain(educationLevels)
      .range(['#485578', '#3CA5A9', '#FFD66A', '#fa863d']);

    let originalColor;

    // Highlight the specie that is hovered
    const highlight = function (event, d) {
      let sum = 0;
      let count = 0;
      d.forEach((element) => {
        sum = sum + element.value;
        count = count + 1;
      });

      let avg = sum / count;
      // console.log(event);
      selected_specie = d[0].edu;

      const selectedLine = d3.select(this).classed('highlighted-line', true);

      // Save the original color
      originalColor = selectedLine.style('stroke');

      // Append a new line for the border
      /*selectedLine
  .append('path')
  .datum(d)
  .attr('class', 'line-border')
  .attr('d', line)
  .style('stroke', 'black') // Set the border color to black
  .style('stroke-width', 6);
*/

      /*
  d3.select(this).classed('highlighted-line', true);

  d3.select(this)
  .classed('highlighted-line', true)
 .style('stroke', 'black') // Change 'red' to your desired stroke color
  .style('stroke-width', 4); // Adjust the width as needed

*/

      if (d && d[0] && d[0].edu) {
        // Save the original color
        //  const originalColor = d3.select(this).style('stroke');

        //  d3.color(originalColor).darker(0.2)
        // Change color for lines with the same color
        d3.selectAll('.line')
          .filter((lineData) => lineData[0] && lineData[0].edu === d[0].edu)
          .style('stroke', (d) => {
            switch (d[0].edu) {
              case 'Low':
                return t23_obj.color.Low;
              case 'HighSchoolOrCollege':
                return t23_obj.color.HighSchoolOrCollege;
              case 'Bachelors':
                return t23_obj.color.Bachelors;
              case 'Graduate':
                return t23_obj.color.Graduate;

              default:
                return 'gray';
            }
          }); // Change 'red' to your desired hover color

        // Change color for other lines
        d3.selectAll('.line')
          .filter((lineData) => lineData[0] && lineData[0].edu !== d[0].edu)
          .style('stroke', '#80808026'); // Change 'grey' to your desired color for non-hovered lines
      }

      d3.select(this).classed('highlighted-line', true);

      const c = d3.select(this).style('stroke');
      const hoverColor = d3.color(c).darker(1.5);

      d3.select(this)
        .classed('highlighted-line', true)
        .style('stroke', hoverColor)
        .style('stroke-width', 3);

      tooltip23
        .transition()
        .duration(0)
        .style('border', 'solid')
        .style('border-width', '2px')
        .style('border-radius', '5px')
        .style('padding', '10px')
        .style('position', 'absolute')
        .style('opacity', '2.0')
        .style('text-align', 'left')
        .style('padding', '8px')
        .style('background', '#fff')
        .style('border', '1px solid #ccc')
        .style('border-radius', '4px')
        .style('pointer-events', 'none')
        .style('box-shadow', '0 0 10px rgba(0, 0, 0, 0.1)');

      tooltip23
        .html(
          `Participant ID: ${d[0].id}<br> Average Savings : ${avg.toFixed(
            2
          )} <br> Education Level : ${d[0].edu}`
        )
        .style('left', event.pageX + 'px')
        .style('top', event.pageY - 28 + 'px');

      tooltip23.transition().duration(4000).style('opacity', 0.0);
    };

    // Unhighlight
    const doNotHighlight = function (event, d) {
      //tooltip.remove();

      d3.selectAll('.line')
        .style('stroke', (d) => {
          if (d[0] && d[0].edu) {
            switch (d[0].edu) {
              case 'Low':
                return t23_obj.color.Low;
              case 'HighSchoolOrCollege':
                return t23_obj.color.HighSchoolOrCollege;
              case 'Bachelors':
                return t23_obj.color.Bachelors;
              case 'Graduate':
                return t23_obj.color.Graduate;

              default:
                return 'gray';
            }
          }
          return 'gray'; // Default color if itype is undefined
        })
        .selectAll('.line-border') // Remove the border line
        .remove();

      d3.select(this).classed('highlighted-line', false).style('stroke-width', 1);
    };

    const line = d3
      .line()
      .defined((d) => !isNaN(d.value))
      .x((d) => xScale(d.month))
      .y((d) => yScale(d.value));

    // console.log(months, months.index);

    resultArray.forEach((d) => {
      svg
        .append('path')
        .datum(
          months.map((month, index, edu, id) => ({
            month,
            value: d.savings[index + timelineValues.start - 1],
            edu: d.educationLevel,
            id: d.participantId,
          }))
        )
        .attr('class', 'line')
        .attr('d', line)
        .style('stroke', (d) => {
          switch (d[0].edu) {
            // Bachelors', 'Graduate', 'HighSchoolOrCollege', 'Low'
            case 'Low':
              return t23_obj.color.Low;
            case 'HighSchoolOrCollege':
              return t23_obj.color.HighSchoolOrCollege;
            case 'Bachelors':
              return t23_obj.color.Bachelors;
            case 'Graduate':
              return t23_obj.color.Graduate;

            default:
              return 'gray';
          }
        })
        .style('fill', 'none')
        .on('mouseover', highlight)
        .on('mouseleave', doNotHighlight);
    });
    /* // Draw legend
    const legend = svg
      .selectAll('.legend')
      .data(educationLevels)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => `translate(0,${i * 20})`);
  
    legend
      .append('rect')
      .attr('x', width + 18)
      .attr('width', 18)
      .attr('height', 18)
      .style('fill', colorScale);
  
    legend
      .append('text')
      .attr('x', width + 40)
      .attr('y', 9)
      .attr('dy', '.35em')
      .style('text-anchor', 'start')
      .text((d) => d);

*/
    //return _getDataEduction(timelineValues);
  } else {
    /*  
    '[1284.661 - 4500.0)': '1k-4.5k',
    '[4500.0 - 8000.0)': '4.5k-8k',
    '[8000.0 - 12000.0)': '8k-12k',
    '[12000.0 - 18000.0)': '12k-18k',
    '[18000.0 - 21334.646)': '18k-22k',
    */

    var myDiv = document.getElementById('switch4.5');
    myDiv.style.visibility = 'visible';

    var myLabel1 = document.getElementById('Graduate');
    myLabel1.innerHTML = '18k-22k';

    var myLabel2 = document.getElementById('Bachelors');
    myLabel2.innerHTML = '12k-18k';

    var myLabel3 = document.getElementById('HighSchool');
    myLabel3.innerHTML = '8k-12k';

    var myLabel4 = document.getElementById('Low');
    myLabel4.innerHTML = '4.5k-8k';

    var myLabel5 = document.getElementById('4.5');
    myLabel5.innerHTML = '1k-4.5k';

    //niket
    var eighteenkVisible = $('#switchGraduate').is(':checked');
    var twelevekVisible = $('#switchBachelors').is(':checked');
    var eightkVisible = $('#switchHighSchool').is(':checked');
    var fourkVisible = $('#switchLow').is(':checked');

    var checkboxElement = document.getElementById('switch4.5');
    var onekVisible = checkboxElement ? checkboxElement.checked : false;

    // console.log('yea');
    const participantData = {};

    const tooltip23 = d3.select('body').append('div').attr('class', 'tooltip').style('opacity', 0);

    globalDataT23.forEach((record) => {
      const participantId = Number(record.participantId);
      const educationLevel = record.educationLevel;
      const monthNumber = record.MonthNumber;
      const savings = record.Savings;
      const salary = record.Income;
      let itype = 'No type';

      if (Number(salary) < 4500) itype = '1k-4.5k';

      if (Number(salary) >= 4500 && Number(salary) < 8000) itype = '4.5k-8k';

      if (Number(salary) >= 8000 && Number(salary) < 12000) itype = '8k-12k';

      if (Number(salary) >= 12000 && Number(salary) < 18000) itype = '12k-18k';

      if (Number(salary) >= 18000) itype = '18k-22k';

      // If the participantId is not in the participantData object, initialize it
      if (!participantData[participantId]) {
        participantData[participantId] = {
          participantId,
          educationLevel,
          salary,
          itype,
          savings: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Initialize savings for each month
        };
        //console.log(itype);
      }

      // Accumulate savings for each month
      participantData[participantId].savings[monthNumber - 1] += parseInt(savings, 10);
      // participantData[salary] +=  parseInt(salary, 10);
      //console.log(participantId + monthNumber+" salr " + salary );
    });

    // Convert the participantData object into an array of rows
    let resultArray = Object.values(participantData);

    const itypes = Array.from(new Set(resultArray.map((d) => d.itype)));
    // console.log(resultArray);

    if (eighteenkVisible == false) {
      resultArray = resultArray.filter((item) => item.itype != '18k-22k');
    }

    if (twelevekVisible == false) {
      resultArray = resultArray.filter((item) => item.itype != '12k-18k');
    }

    if (eightkVisible == false) {
      resultArray = resultArray.filter((item) => item.itype != '8k-12k');
    }

    if (fourkVisible == false) {
      resultArray = resultArray.filter((item) => item.itype != '4.5k-8k');
    }

    if (onekVisible == false) {
      resultArray = resultArray.filter((item) => item.itype != '1k-4.5k');
    }

    // console.log(resultArray);

    // console.log(resultArray);

    // Set up the dimensions of the chart
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Append an SVG element to the body
    const svg = d3
      .select('#ParallelChart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Extract education levels

    // console.log(itypes);
    // console.log(typeof educationLevels);
    // console.log(educationLevels);
    // Define scales for each axis
    const scales = {};

    // Assuming you have 15 months savings details
    const months = Array.from({ length: timelineValues.end + 1 }, (_, i) => `Month ${i + 1}`);

    months.splice(0, timelineValues.start);

    // console.log(months);

    // console.log('m' + months);

    months.forEach((month) => {
      scales[month] = d3.scaleLinear().domain([0, 20000]).range([height, 0]);
    });

    // Draw axes
    const axis = d3
      .axisLeft()
      .ticks(3) // Specify the number of ticks you want on the y-axis
      .tickFormat(d3.format('.2s'));

    const ax = d3
      .axisLeft()
      .ticks(3) // Specify the number of ticks you want on the y-axis
      // .tickFormat(d3.format('.2s'));
      .tickFormat((d, i) => (i === 150 ? d3.format('.2s')(d) : ''));

    months.forEach((month, i) => {
      if (i == 0) {
        svg
          .append('g')
          .attr('class', 'axis')
          .attr('transform', `translate(${i * (width / (months.length - 1))},0)`)
          .call(axis.scale(scales[month]));

        svg
          .append('text')
          .attr('class', 'month-number')
          .attr('x', -35 + i * (width / (months.length - 1)) + width / (months.length - 1) / 2)
          .attr('y', -25)
          .style('text-anchor', 'middle')
          .text(`${i + timelineValues.start}`);
      } else {
        svg
          .append('g')
          .attr('class', 'axis')
          .attr('transform', `translate(${i * (width / (months.length - 1))},0)`)
          .call(ax.scale(scales[month]));

        svg
          .append('text')
          .attr('class', 'month-number')
          .attr('x', -35 + i * (width / (months.length - 1)) + width / (months.length - 1) / 2)
          .attr('y', -25)
          .style('text-anchor', 'middle')
          .text(`${i + timelineValues.start}`);
      }
    });

    svg
      .append('text')
      .attr('text-anchor', 'end')
      .attr('x', width - 300)
      .attr('y', height + 30)
      .text('Time (Months)');

    // Draw lines
    //const line = d3.line();

    const maxSavings = d3.max(resultArray, (d) => d3.max(d.savings));

    const xScale = d3.scalePoint().domain(months).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, 20000]).range([height, 0]);

    //const colorScale = d3.scaleOrdinal().domain(itypes).range(d3.schemeCategory10);

    //const color = d3.scaleOrdinal().domain(keys).range(d3.schemeDark2);
    const colorScale = d3
      .scaleOrdinal()
      .domain(itypes)
      .range(['#3CA5A9', '#5AC0DE', '#FFD66A', '#fa863d', '#485578']);

    // Highlight the specie that is hovered
    const highlight = function (event, d) {
      let sum = 0;
      let count = 0;
      d.forEach((element) => {
        sum = sum + element.value;
        count = count + 1;
      });

      let avg = sum / count;
      // console.log(event);
      selected_specie = d[0].edu;

      /*  tooltipb.style("opacity", 1)
      .html(
        `Participant ID: ${d[0].id}<br> Average Savings : ${avg.toFixed(
          2
        )} <br> Education Level : ${d[0].edu} <br> Income Type : ${d[0].itype}`
      )
      .style('left', event.pageX + 'px')
      .style('top', event.pageY + 'px')
      .style("z-index",'5');
      */

      tooltip23
        .transition()
        .duration(0)
        .style('border', 'solid')
        .style('border-width', '2px')
        .style('border-radius', '5px')
        .style('padding', '10px')
        .style('position', 'absolute')
        .style('opacity', 100.0)
        .style('text-align', 'left')
        .style('padding', '8px')
        .style('background', '#fff')
        .style('border', '1px solid #ccc')
        .style('border-radius', '4px')
        .style('pointer-events', 'none')
        .style('box-shadow', '0 0 10px rgba(0, 0, 0, 0.1)');
      if (d && d[0] && d[0].itype) {
        // Save the original color
        //  const originalColor = d3.select(this).style('stroke');
        //  d3.color(originalColor).darker(0.2)
        // Change color for lines with the same color
        d3.selectAll('.line')
          .filter((lineData) => lineData[0] && lineData[0].itype === d[0].itype)
          .style('stroke', (d) => {
            switch (d[0].itype) {
              case '1k-4.5k':
                return t23_obj.color.one;
              case '4.5k-8k':
                return t23_obj.color.four;
              case '8k-12k':
                return t23_obj.color.eight;
              case '12k-18k':
                return t23_obj.color.tweleve;
              case '18k-22k':
                return t23_obj.color.eighteen;
              default:
                return 'gray';
            }
          }); // Change 'red' to your desired hover color

        // Change color for other lines
        d3.selectAll('.line')
          .filter((lineData) => lineData[0] && lineData[0].itype !== d[0].itype)
          .style('stroke', '#80808026'); // Change 'grey' to your desired color for non-hovered lines
      }

      d3.select(this).classed('highlighted-line', true);

      const c = d3.select(this).style('stroke');
      const hoverColor = d3.color(c).darker(1.5);

      d3.select(this)
        .classed('highlighted-line', true)

        .style('stroke', hoverColor)
        //  .style('stroke', 'red') // Change 'red' to your desired stroke color
        .style('stroke-width', 3);

      tooltip23
        .html(
          `Participant ID: ${d[0].id}<br> Average Savings : ${avg.toFixed(
            2
          )} <br> Education Level : ${d[0].edu} <br> Income Type : ${d[0].itype}`
        )
        .style('left', event.pageX + 'px')
        .style('top', event.pageY - 28 + 'px');

      tooltip23.transition().duration(4000).style('opacity', 0.0);
    };

    // Unhighlight
    const doNotHighlight = function (event, d) {
      //tooltip.remove();
      d3.selectAll('.line')
        .style('stroke', (d) => {
          if (d[0] && d[0].itype) {
            switch (d[0].itype) {
              case '1k-4.5k':
                return t23_obj.color.one;
              case '4.5k-8k':
                return t23_obj.color.four;
              case '8k-12k':
                return t23_obj.color.eight;
              case '12k-18k':
                return t23_obj.color.tweleve;
              case '18k-22k':
                return t23_obj.color.eighteen;
              default:
                return 'gray';
            }
          }
          return 'gray'; // Default color if itype is undefined
        })
        .selectAll('.line-border') // Remove the border line
        .remove();

      d3.select(this).classed('highlighted-line', false).style('stroke-width', 1);
    };

    const line = d3
      .line()
      .defined((d) => !isNaN(d.value))
      .x((d) => xScale(d.month))
      .y((d) => yScale(d.value));

    // console.log(months, months.index);

    resultArray.forEach((d) => {
      svg
        .append('path')
        .datum(
          months.map((month, index, edu, itype, id) => ({
            month,
            value: d.savings[index + timelineValues.start - 1],
            edu: d.educationLevel,
            id: d.participantId,
            itype: d.itype,
          }))
        )
        .attr('class', 'line')
        .attr('d', line)
        .style('stroke', (d) => {
          switch (d[0].itype) {
            case '1k-4.5k':
              return t23_obj.color.one;
            case '4.5k-8k':
              return t23_obj.color.four;
            case '8k-12k':
              return t23_obj.color.eight;
            case '12k-18k':
              return t23_obj.color.tweleve;
            case '18k-22k':
              return t23_obj.color.eighteen;
            default:
              return 'gray';
          }
        })
        .style('fill', 'none')
        .on('mouseover', highlight)
        .on('mouseleave', doNotHighlight);
    });
    // Draw legend
    /*const legend = svg
      .selectAll('.legend')
      .data(itypes)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => `translate(0,${i * 20})`);
  
    legend
      .append('rect')
      .attr('x', width + 18)
      .attr('width', 18)
      .attr('height', 18)
      .style('fill', colorScale);
  
    legend
      .append('text')
      .attr('x', width + 40)
      .attr('y', 9)
      .attr('dy', '.35em')
      .style('text-anchor', 'start')
      .text((d) => d); */
  } //return _getDataSalary(timelineValues);
}

// $(document).ready(function () {
//   addTimelineSlider();
//   _init_streamGraph();
//   _init_radarChart();
//   _init_parallelChart();
// });

const getDataChart5 = (timelineValues) => {
  var edu = document.querySelector('#radarSelector').value;
  if (edu == 'edu') {
    return _getDataEduction(timelineValues);
  }
  return _getDataSalary(timelineValues);
};

const _getDataEduction = (timelineValues) => {
  var start = timelineValues.start;
  var end = timelineValues.end;
  var dataObj = [
    { category: 'Bachelors', Income: 0, Savings: 0, Expense: 0 },
    { category: 'Graduate', Income: 0, Savings: 0, Expense: 0 },
    { category: 'HighSchool Or College', Income: 0, Savings: 0, Expense: 0 },
    { category: 'Low', Income: 0, Savings: 0, Expense: 0 },
  ];

  var count = end - start + 1;

  while (start <= end) {
    dataObj[0]['Income'] += t22_obj.education[start]['Bachelors']['Income'];
    dataObj[0]['Expense'] += t22_obj.education[start]['Bachelors']['Expense'];
    dataObj[0]['Savings'] += t22_obj.education[start]['Bachelors']['Savings'];
    dataObj[1]['Income'] += t22_obj.education[start]['Graduate']['Income'];
    dataObj[1]['Expense'] += t22_obj.education[start]['Graduate']['Expense'];
    dataObj[1]['Savings'] += t22_obj.education[start]['Graduate']['Savings'];
    dataObj[2]['Income'] += t22_obj.education[start]['HighSchoolOrCollege']['Income'];
    dataObj[2]['Expense'] += t22_obj.education[start]['HighSchoolOrCollege']['Expense'];
    dataObj[2]['Savings'] += t22_obj.education[start]['HighSchoolOrCollege']['Savings'];
    dataObj[3]['Income'] += t22_obj.education[start]['Low']['Income'];
    dataObj[3]['Expense'] += t22_obj.education[start]['Low']['Expense'];
    dataObj[3]['Savings'] += t22_obj.education[start]['Low']['Savings'];
    start += 1;
  }
  dataObj[0]['Income'] = Math.floor(dataObj[0]['Income'] / count);
  dataObj[0]['Expense'] = Math.floor(dataObj[0]['Expense'] / count);
  dataObj[0]['Savings'] = Math.floor(dataObj[0]['Savings'] / count);
  dataObj[1]['Income'] = Math.floor(dataObj[1]['Income'] / count);
  dataObj[1]['Expense'] = Math.floor(dataObj[1]['Expense'] / count);
  dataObj[1]['Savings'] = Math.floor(dataObj[1]['Savings'] / count);
  dataObj[2]['Income'] = Math.floor(dataObj[2]['Income'] / count);
  dataObj[2]['Expense'] = Math.floor(dataObj[2]['Expense'] / count);
  dataObj[2]['Savings'] = Math.floor(dataObj[2]['Savings'] / count);
  dataObj[3]['Income'] = Math.floor(dataObj[3]['Income'] / count);
  dataObj[3]['Expense'] = Math.floor(dataObj[3]['Expense'] / count);
  dataObj[3]['Savings'] = Math.floor(dataObj[3]['Savings'] / count);
  // console.log(dataObj);

  return dataObj;
};

const _getDataSalary = (timelineValues) => {
  var start = timelineValues.start;
  var end = timelineValues.end;
  var dataObj = [
    { category: '1k-4.5k', Income: 0, Savings: 0, Expense: 0 },
    { category: '4.5k-8k', Income: 0, Savings: 0, Expense: 0 },
    { category: '8k-12k', Income: 0, Savings: 0, Expense: 0 },
    { category: '12k-18k', Income: 0, Savings: 0, Expense: 0 },
    { category: '18k-22k', Income: 0, Savings: 0, Expense: 0 },
  ];

  var count = end - start + 1;

  while (start <= end) {
    dataObj[0]['Income'] += t22_obj.salary[start]['1k-4.5k']['Income'];
    dataObj[0]['Expense'] += t22_obj.salary[start]['1k-4.5k']['Expense'];
    dataObj[0]['Savings'] += t22_obj.salary[start]['1k-4.5k']['Savings'];
    dataObj[1]['Income'] += t22_obj.salary[start]['4.5k-8k']['Income'];
    dataObj[1]['Expense'] += t22_obj.salary[start]['4.5k-8k']['Expense'];
    dataObj[1]['Savings'] += t22_obj.salary[start]['4.5k-8k']['Savings'];
    dataObj[2]['Income'] += t22_obj.salary[start]['8k-12k']['Income'];
    dataObj[2]['Expense'] += t22_obj.salary[start]['8k-12k']['Expense'];
    dataObj[2]['Savings'] += t22_obj.salary[start]['8k-12k']['Savings'];
    dataObj[3]['Income'] += t22_obj.salary[start]['12k-18k']['Income'];
    dataObj[3]['Expense'] += t22_obj.salary[start]['12k-18k']['Expense'];
    dataObj[3]['Savings'] += t22_obj.salary[start]['12k-18k']['Savings'];
    dataObj[4]['Income'] += t22_obj.salary[start]['18k-22k']['Income'];
    dataObj[4]['Expense'] += t22_obj.salary[start]['18k-22k']['Expense'];
    dataObj[4]['Savings'] += t22_obj.salary[start]['18k-22k']['Savings'];
    start += 1;
  }
  dataObj[0]['Income'] = Math.floor(dataObj[0]['Income'] / count);
  dataObj[0]['Expense'] = Math.floor(dataObj[0]['Expense'] / count);
  dataObj[0]['Savings'] = Math.floor(dataObj[0]['Savings'] / count);
  dataObj[1]['Income'] = Math.floor(dataObj[1]['Income'] / count);
  dataObj[1]['Expense'] = Math.floor(dataObj[1]['Expense'] / count);
  dataObj[1]['Savings'] = Math.floor(dataObj[1]['Savings'] / count);
  dataObj[2]['Income'] = Math.floor(dataObj[2]['Income'] / count);
  dataObj[2]['Expense'] = Math.floor(dataObj[2]['Expense'] / count);
  dataObj[2]['Savings'] = Math.floor(dataObj[2]['Savings'] / count);
  dataObj[3]['Income'] = Math.floor(dataObj[3]['Income'] / count);
  dataObj[3]['Expense'] = Math.floor(dataObj[3]['Expense'] / count);
  dataObj[3]['Savings'] = Math.floor(dataObj[3]['Savings'] / count);
  dataObj[4]['Income'] = Math.floor(dataObj[4]['Income'] / count);
  dataObj[4]['Expense'] = Math.floor(dataObj[4]['Expense'] / count);
  dataObj[4]['Savings'] = Math.floor(dataObj[4]['Savings'] / count);

  // console.log(dataObj);
  return dataObj;
};

const _getMaxByData = (data) => {
  var arr = [];
  for (i in data) {
    arr.push(data[i]['Income']);
    arr.push(data[i]['Expense']);
    arr.push(data[i]['Savings']);
  }
  var nax = Math.max(...arr);
  if (nax == 0) {
    nax = 1000;
  } else {
    nax = nax + Math.floor(nax / 10);
  }
  return nax;
};

// Function to generate Spider chart
const createSpiderChart = (data, config) => {
  const { width, height, margin, levels, labelFactor, opacityArea } = config;
  var maxValue = _getMaxByData(data);

  const svg = d3
    .select('#chart-div')
    .append('svg')
    .attr('id', 'main-svg')
    .attr('opacity', '1')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('class', 'main-svg-g')
    .attr('opacity', '1')
    .attr('transform-origin', 'center')
    .attr('transform', `scale(0.75)`);

  // Create scales
  const radiusScale = d3
    .scaleLinear()
    .range([0, width / 2])
    .domain([0, maxValue]);

  // Draw background pentagons
  for (let j = 0; j < levels; j++) {
    const levelFactor = radiusScale((maxValue * (j + 1)) / levels);
    svg
      .append('g')
      .selectAll('.levels')
      .data(data)
      .enter()
      .append('svg:line')
      .attr('x1', (d, i) => levelFactor * (1 - Math.sin((i * 2 * Math.PI) / data.length)))
      .attr('y1', (d, i) => levelFactor * (1 - Math.cos((i * 2 * Math.PI) / data.length)))
      .attr('x2', (d, i) => levelFactor * (1 - Math.sin(((i + 1) * 2 * Math.PI) / data.length)))
      .attr('y2', (d, i) => levelFactor * (1 - Math.cos(((i + 1) * 2 * Math.PI) / data.length)))
      .attr('class', 'line')
      .style('stroke', 'gray')
      .style('stroke-opacity', '0.60')
      .style('stroke-width', '0.5px')
      .attr('transform', `translate(${width / 2 - levelFactor},${height / 2 - levelFactor})`);
  }

  // Draw axes
  const axis = svg.selectAll('.axis').data(data).enter().append('g').attr('class', 'axis');

  axis
    .append('line')
    .attr('x1', width / 2)
    .attr('y1', height / 2)
    .attr('x2', (d, i) => (width / 2) * (1 - Math.sin((i * 2 * Math.PI) / data.length)))
    .attr('y2', (d, i) => (height / 2) * (1 - Math.cos((i * 2 * Math.PI) / data.length)))
    .attr('class', 'line')
    .style('stroke', 'black')
    .style('stroke-opacity', '0.60')
    .style('stroke-width', '1px');

  // Draw labels
  axis
    .append('text')
    .attr('class', 'legend')
    .text((d) => d.category)
    .style('font-family', 'sans-serif')
    .style('font-size', '18px')
    .attr('text-anchor', 'middle')
    .attr('dy', '1.5em')
    .attr(
      'transform',
      (d, i) =>
        `translate(${
          (width / 2) *
          (1 - labelFactor * Math.sin(((data.length - i) * 2 * Math.PI) / data.length))
        },${
          (height / 2) *
          (1 - labelFactor * Math.cos(((data.length - i) * 2 * Math.PI) / data.length))
        })`
    );

  // Setting up tooltip div
  var divTooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'mytooltip')
    .style('opacity', 0)
    .style('top', height / 2 + 'px')
    .style('left', width / 2 + 'px');

  // Draw the radar chart
  const incomeLine = d3
    .lineRadial()
    .curve(d3.curveLinearClosed)
    .radius((d) => radiusScale(d.Income))
    .angle((d, i) => (i * 2 * Math.PI) / data.length);

  const expenseLine = d3
    .lineRadial()
    .curve(d3.curveLinearClosed)
    .radius((d) => radiusScale(d.Expense))
    .angle((d, i) => (i * 2 * Math.PI) / data.length);

  const savingsLine = d3
    .lineRadial()
    .curve(d3.curveLinearClosed)
    .radius((d) => radiusScale(d.Savings))
    .angle((d, i) => (i * 2 * Math.PI) / data.length);

  svg
    .selectAll('.income-line')
    .data([data])
    .enter()
    .append('path')
    .attr('id', 'income-line')
    .attr('d', incomeLine)
    .style('fill', t22_obj.color.income)
    .style('fill-opacity', opacityArea)
    .style('stroke-width', '2px')
    .style('transition', 'all 100ms')
    .style('stroke', t22_obj.color.income)
    .attr('transform', `translate(${width / 2},${height / 2})`)
    .on('mouseover', (event, i) => {
      d3.select(event.target).style('stroke-width', '4px');
      d3.select(event.target).style('fill-opacity', 0.1);
      divTooltip.html(_updateRadarToolTipText(i, event.target.id)); // update tooltip text
      divTooltip
        .transition()
        .duration(200)
        .style('opacity', 1)
        .style('top', i.y + 'px')
        .style('left', i.x + 'px'); // Display tooltip
    })
    .on('mousemove', (d) => {
      return divTooltip.style('top', d.pageY - 10 + 'px').style('left', d.pageX + 10 + 'px');
    })
    .on('mouseleave', (event) => {
      d3.select(event.target).style('stroke-width', '2px');
      d3.select(event.target).style('fill-opacity', 0.05);
      divTooltip.transition().duration(200).style('opacity', 0);
    });

  svg
    .selectAll('.savings-line')
    .data([data])
    .enter()
    .append('path')
    .attr('id', 'savings-line')
    .attr('d', savingsLine)
    .style('fill', t22_obj.color.savings)
    .style('fill-opacity', opacityArea)
    .style('stroke-width', '2px')
    .style('transition', 'all 100ms')
    .style('stroke', t22_obj.color.savings)
    .attr('transform', `translate(${width / 2},${height / 2})`)
    .on('mouseover', (event, i) => {
      d3.select(event.target).style('stroke-width', '4px');
      d3.select(event.target).style('fill-opacity', 0.1);
      divTooltip.html(_updateRadarToolTipText(i, event.target.id)); // update tooltip text
      divTooltip
        .transition()
        .duration(200)
        .style('opacity', 1)
        .style('top', i.y + 'px')
        .style('left', i.x + 'px'); // Display tooltip
    })
    .on('mousemove', (d) => {
      return divTooltip.style('top', d.pageY - 10 + 'px').style('left', d.pageX + 10 + 'px');
    })
    .on('mouseleave', (event) => {
      d3.select(event.target).style('stroke-width', '2px');
      d3.select(event.target).style('fill-opacity', 0.05);
      divTooltip.transition().duration(200).style('opacity', 0);
    });

  svg
    .selectAll('.expense-line')
    .data([data])
    .enter()
    .append('path')
    .attr('id', 'expense-line')
    .attr('d', expenseLine)
    .style('fill', t22_obj.color.expenses)
    .style('fill-opacity', opacityArea)
    .style('stroke-width', '2px')
    .style('transition', 'all 100ms')
    .style('stroke', t22_obj.color.expenses)
    .attr('transform', `translate(${width / 2},${height / 2})`)
    .on('mouseover', (event, i) => {
      d3.select(event.target).style('stroke-width', '4px');
      d3.select(event.target).style('fill-opacity', 0.1);
      divTooltip.html(_updateRadarToolTipText(i, event.target.id)); // update tooltip text
      divTooltip
        .transition()
        .duration(200)
        .style('opacity', 1)
        .style('top', i.y + 'px')
        .style('left', i.x + 'px'); // Display tooltip
    })
    .on('mousemove', (d) => {
      return divTooltip.style('top', d.pageY - 10 + 'px').style('left', d.pageX + 10 + 'px');
    })
    .on('mouseleave', (event) => {
      d3.select(event.target).style('stroke-width', '2px');
      d3.select(event.target).style('fill-opacity', 0.05);
      divTooltip.transition().duration(200).style('opacity', 0);
    });
};

const _updateRadarToolTipText = (data, id) => {
  var s = '';
  switch (id) {
    case 'income-line':
      data.forEach(function (obj) {
        s += obj['category'] + ': $' + Intl.NumberFormat().format(+obj['Income']) + '<br>';
      });
      break;
    case 'savings-line':
      data.forEach(function (obj) {
        s += obj['category'] + ': $' + Intl.NumberFormat().format(+obj['Savings']) + '<br>';
      });
      break;
    case 'expense-line':
      data.forEach(function (obj) {
        s += obj['category'] + ': $' + Intl.NumberFormat().format(+obj['Expense']) + '<br>';
      });
      break;
    default:
      break;
  }
  return s;
};

const _handleLineVisibility = () => {
  // d3.select("#blueLine").style("opacity", newOpacity);
  var incomeVisible = $('#switchIncome').is(':checked');
  var expenseVisible = $('#switchExpenses').is(':checked');
  var savingsVisible = $('#switchSavings').is(':checked');

  incomeVisible
    ? d3.select('#income-line').transition().duration(500).style('opacity', 1)
    : d3.select('#income-line').transition().duration(500).style('opacity', 0);
  expenseVisible
    ? d3.select('#expense-line').transition().duration(500).style('opacity', 1)
    : d3.select('#expense-line').transition().duration(500).style('opacity', 0);
  savingsVisible
    ? d3.select('#savings-line').transition().duration(500).style('opacity', 1)
    : d3.select('#savings-line').transition().duration(500).style('opacity', 0);
};

// function utl() {
//   timelineValues.start = start;
//   timelineValues.end = end;

//   var data = getDataChart5(timelineValues);
//   createSpiderChart(data, chartConfig);
// }

const _redrawSpiderChart = () => {
  // d3.select('#chart-div').transition().duration(5000).style('opacity', 0);
  // d3.select('#main-svg').transition().delay(500).remove();
  d3.select('#main-svg').remove();
  // window.setTimeout(() => {
  var data = getDataChart5(timelineValues);
  createSpiderChart(data, chartConfig);
  // }, 500);
  // d3.select('#chart-div').transition().duration(5000).style('opacity', 1);
};

const _redrawStreamGraph = () => {
  let div21 = document.getElementById('streamGraph');
  div21.replaceChildren();

  // window.setTimeout(() => {
  //var data = getDataChart4(timelineValues);
  createStreamGraph(globalDataT21, timelineValues);
};

const _redrawParallelChart = () => {
  let div23 = document.getElementById('ParallelChart');
  div23.replaceChildren();
  //tooltip23.html(``);

  // window.setTimeout(() => {
  //var data = getDataChart4(timelineValues);
  createParallelChart(globalDataT23, timelineValues);
};

function createStreamGraph(data, timelineValues) {
  const margin = { top: 20, right: 30, bottom: 0, left: 10 },
    width = 700 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  const svg = d3
    .select('#streamGraph')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  // Parse the Data
  d3.csv('data/t2_financialStatus.csv').then(function (data) {
    //console.log(data.columns);
    //console.log(typeof data);
    //  data = data.filter(element => element.Month >= timelineValues.start && element.Month<=timelineValues.end);

    let start21 = 0;
    let end21 = data.length;

    //console.log("yp"+end21);
    for (let i21 = 0; i21 < data.length; i21++) {
      if (data[i21]['Month'] < timelineValues.start) {
        start21++;
      }
    }

    for (let i21 = data.length - 1; i21 >= 0; i21--) {
      /// console.log(data[i21]);
      if (data[i21]['Month'] > timelineValues.end) {
        end21--;
      }
    }

    //console.log(start21 + " " + end21);

    data.splice(0, start21);
    data.splice(end21, 450);
    //console.log("h");
    ///console.log(data);
    // console.log(typeof data);
    // console.log(data.columns);
    // List of groups = header of the csv files

    const keys = data.columns.slice(2);

    // console.log(keys);

    // Add X axis
    const x = d3
      .scaleLinear()
      .domain([start21, end21]) // Assuming your months range from 1 to 15
      .range([0, width + margin.left + margin.right]); // Adjust the width of your chart

    svg
      .append('g')
      .attr('transform', `translate(0, ${height * 0.8})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(timelineValues.end - timelineValues.start + 1)
          .tickSize(-height * 0.6)
      )
      .select('.domain') // Select the axis line element
      .remove();

    // Customization
    svg.selectAll('.tick line').attr('stroke', '#b8b8b8');

    const xs = d3
      .scaleLinear()
      .domain(
        d3.extent(data, function (d) {
          return d.Date;
        })
      )
      .range([0, end21 - start21]);

    /*  const x = d3.scaleLinear()
    .domain(d3.extent(data, function(d) { return d.Month; }))
    .range([ 0, 15 ]);
  svg.append("g")
    .attr("transform", `translate(0, ${height*0.8})`)
    .call(d3.axisBottom(x).tickSize(-height*.6).tickValues([1,2,3,4,5,6,7,8,9,10,11,12,13,14,100]))
    .select(".domain").remove()
  // Customization
  svg.selectAll(".tick line").attr("stroke", "#b8b8b8")*/

    // Add X axis label:
    svg
      .append('text')
      .attr('text-anchor', 'end')
      .attr('x', width)
      .attr('y', height - 90)
      .text('Time (Days)');

    // Add Y axis
    const y = d3.scaleLinear().domain([-1000, 1000]).range([height, 0]);

    // color palette
    const color = d3.scaleOrdinal().domain(keys).range(d3.schemeDark2);
    var myColor2 = d3.scaleOrdinal().domain(keys).range(['#3CA5A9', '#fa863d', '#485578']);

    //stack the data?
    const stackedData = d3.stack().offset(d3.stackOffsetSilhouette).keys(keys)(data);

    // console.log(stackedData);
    // create a tooltip
    const Tooltip = svg
      .append('text')
      .attr('x', 0)
      .attr('y', 100)
      .style('opacity', 0)
      .style('font-size', 17);

    const yLine = svg
      .append('line')
      .attr('class', 'y-line')
      .attr('stroke', 'black')
      .style('stroke-dasharray', '3,3')
      .attr('y1', 0)
      .attr('y2', height);

    const tooltipa = d3.select('#tooltip');

    // Three function that change the tooltip when user hover / move / leave a cell
    const mouseover = function (event, d) {
      Tooltip.style('opacity', 1);
      d3.selectAll('.myArea').style('opacity', 0.2);
      d3.select(this).style('stroke', 'black').style('opacity', 1);
    };
    const mousemove = function (event, d, i) {
      grp = d.key;
      //Tooltip.text(grp);

      const mouseX = d3.pointer(event)[0];
      // console.log(mouseX);

      // const mouseX = d3.pointer(event)[0];

      const xValue = Math.floor(x.invert(mouseX));
      //Tooltip.text(grp);
      // console.log(Math.floor(xValue));

      //console.log(data);

      let valu = data[xValue - 1];

      // console.log(valu);

      yLine.attr('x1', mouseX).attr('x2', mouseX);

      tooltipa
        .style('opacity', 1)
        .html(
          `Stables: ${valu['Stable']} <br> Unstables: ${valu['Unstable']}  <br> Unknown: ${valu['Unknown']}`
        )
        .style('left', event.pageX + 10 + 'px')
        .style('z-index', '5')
        .style('top', event.pageY - 20 + 'px');
    };
    const mouseleave = function (event, d) {
      tooltipa.style('opacity', 0);
      d3.selectAll('.myArea').style('opacity', 1).style('stroke', 'none');
    };

    // Area generator
    const area = d3
      .area()
      .x(function (d) {
        return x(d.data.Date);
      })
      .y0(function (d) {
        return y(d[0]);
      })
      .y1(function (d) {
        return y(d[1]);
      });

    // Show the areas
    svg
      .selectAll('mylayers')
      .data(stackedData)
      .join('path')
      .attr('class', 'myArea')
      .style('fill', function (d) {
        return myColor2(d.key);
      })
      .attr('d', area)
      .on('mouseover', mouseover)
      .on('mousemove', mousemove)
      .on('mouseleave', mouseleave);
  });
}
