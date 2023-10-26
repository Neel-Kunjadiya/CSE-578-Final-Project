var t31_margins = {
  line_width: 1500,
  line_height: 1200,
  line_margin: {
    top: 40,
    bottom: 10,
    right: 40,
    left: 40,
  },
};

var t31_width_height = {
  line_inner_width:
    t31_margins.line_width - t31_margins.line_margin.left - t31_margins.line_margin.right,
  line_inner_height:
    t31_margins.line_height - t31_margins.line_margin.top - t31_margins.line_margin.bottom,
};

var t31_obj = {
  xScale: d3.scaleLinear().range([0, t31_width_height.line_inner_width]),
  yScale: d3.scaleLinear().range([t31_width_height.line_inner_height, 0]),
  uniqueBuildings: {},
  selectedEmployers: new Set(),
  global_data: undefined,
  map_svg: undefined,
  colorScale: d3.scaleSequential(d3.interpolateYlOrBr),
  // colorScale: d3.scaleLinear().domain([1, 10]).range(['white', 'blue']),
  color: { start: '#FFFCD5', end: '#052D7A', highlight: '#3281BD' },
};

var t32_obj = {
  averageTurnover: [],
  // timelineValues: { start: 2, end: 14 },
  width: 900,
  height: 600,
  margin: { top: 50, right: 200, bottom: 100, left: 100 },
  // selectedIds: ["0","379", "381", "382", "384", "385", "386"],
  // color_scale: d3.scaleSequential(d3.interpolateBlues).domain([0, 5]),
  map_bar_svg: undefined,
  color: {
    bar: d3.scaleSequential(d3.interpolateBlues).domain([0, 35]),
    // bar: d3.scaleLinear().domain([0, 35]).range([colorScheme.yellowlight, colorScheme.darkblue]),
    line: colorScheme.darkblue,
  },
};

// var timelineValues = { start: 2, end: 12 };

// document.addEventListener('DOMContentLoaded', function () {
//   initMap();
// });

function drawt31() {
  drawMap(Object.values(t31_obj.uniqueBuildings), timelineValues, t31_obj.global_data);
  addBrushFunctionality();
}

function initMap() {
  // console.log('Inside initMap');
  t31_obj.map_svg = d3
    .select('#map_svg')
    .append('svg')
    .attr('width', t31_margins.line_width)
    .attr('height', t31_margins.line_height)
    .append('g')
    .attr('pointer-events', 'all')
    .attr(
      'transform',
      'translate(' + t31_margins.line_margin.left + ', ' + t31_margins.line_margin.top + ')'
    );

  t32_obj.map_bar_svg = d3
    .select('#map_bar_svg')
    .append('svg')
    .attr('width', t32_obj.width + t32_obj.margin.left + t32_obj.margin.right)
    .attr('height', t32_obj.height + t32_obj.margin.top + t32_obj.margin.bottom)
    .append('g')
    .attr('transform', `translate(${t32_obj.margin.left},${t32_obj.margin.top})`);
  // Replace the URL with your actual data file
  d3.csv('../data/nkumar82/final_4_1.csv').then(function (data) {
    // console.log('Loading combined data...', data);
    t31_obj.global_data = data;
    let uniqueBuildings = {};
    data.forEach(function (d) {
      if (!uniqueBuildings[d.buildingId]) {
        uniqueBuildings[d.buildingId] = {
          buildingId: +d.buildingId,
          location: parsePolygon(d.location),
          employer_id: +d.employer_id,
          average_hourly_rate: +d.average_hourly_rate,
          monthly_data: {},
          // turnover: +d.turnover
        };
      }
      if (!uniqueBuildings[d.buildingId].monthly_data[d.month]) {
        uniqueBuildings[d.buildingId].monthly_data[d.month] = {
          turnover: 0,
        };
      }

      uniqueBuildings[d.buildingId].monthly_data[d.month].turnover += +d.turnover;
    });
    // console.log('Unique buildings:', uniqueBuildings);

    // console.log('Unique buildings:', uniqueBuildings);
    t31_obj.uniqueBuildings = uniqueBuildings;
    drawt31();
  });
}

function drawMap(data, timelinedict, allData) {
  // console.log('Inside drawMap');
  // Clear the existing content in the SVG
  t31_obj.map_svg.selectAll('*').remove();
  selectedMonth = timelineValues.start; // Assuming this is needed elsewhere

  let allPoints = data.flatMap((d) => d.location);
  t31_obj.xScale.domain(d3.extent(allPoints, (d) => d[0])).nice();
  t31_obj.yScale.domain(d3.extent(allPoints, (d) => d[1])).nice();

  // Calculate sumTurnover for each data item and find the overall min and max
  let minSumTurnover = Infinity,
    maxSumTurnover = -Infinity;
  data.forEach((d) => {
    let sumTurnover = 0;
    for (let i = timelinedict.start; i <= timelinedict.end; i++) {
      const monthlyData = d.monthly_data[i];
      if (monthlyData) {
        sumTurnover += monthlyData.turnover;
      }
    }
    d.sumTurnover = sumTurnover;
    minSumTurnover = Math.min(minSumTurnover, sumTurnover);
    maxSumTurnover = Math.max(maxSumTurnover, sumTurnover);
  });

  // Adjust color scale to use sumTurnover
  t31_obj.colorScale = d3
    .scaleSequential()
    .interpolator(d3.interpolateYlOrBr)
    // .interpolator(d3.scaleSequential().range([t31_obj.color.start, t31_obj.color.end]))
    .domain([minSumTurnover, maxSumTurnover])
    .clamp(true);

  // Add polygons with color based on sumTurnover
  t31_obj.map_svg
    .selectAll('polygon')
    .data(data)
    .enter()
    .append('polygon')
    .attr('points', function (d) {
      return d.location
        .map((point) => {
          return [t31_obj.xScale(point[0]), t31_obj.yScale(point[1])].join(',');
        })
        .join(' ');
    })
    .style('fill', function (d) {
      return t31_obj.colorScale(d.sumTurnover);
    })
    .style('stroke', 'grey')
    .style('stroke-width', 0.5)
    .style('opacity', 0.8)
    .on('mouseenter', function (event, d) {
      // console.log('Mouseenter BuildingId:', d.buildingId);
      // console.log('Mouseenter Sum Turnover:', d.sumTurnover);
    })
    .on('mouseleave', function (d) {
      // console.log('Mouseout');
    });
  var legendWidth = 200; // Adjust the width as needed
  var legendSteps = 10; // Number of color steps in the legend
  var legendMarginTop = 20; // Top margin for the legend

  // Adjust the legend's position to the top right corner
  var legend = t31_obj.map_svg
    .append('g')
    .attr('class', 'legend')
    .attr(
      'transform',
      'translate(' +
        (t31_width_height.line_inner_width - legendWidth - 20) +
        ',' +
        legendMarginTop +
        ')'
    );

  // Create a scale for the horizontal legend
  var legendScale = d3.scaleLinear().domain(t31_obj.colorScale.domain()).range([0, legendWidth]);

  // Create a horizontal axis for the legend
  var legendAxis = d3
    .axisBottom(legendScale)
    .ticks(6) // Adjust the number of ticks as needed
    .tickFormat(d3.format('.2s')); // Format for turnover

  // Append the axis to the legend
  legend.call(legendAxis);

  // Calculate the width of each color band
  var stepWidth = legendWidth / legendSteps;

  // Add the colored rectangles to the legend
  legend
    .selectAll('rect')
    .data(d3.range(legendSteps))
    .enter()
    .append('rect')
    .attr('x', function (d, i) {
      return i * stepWidth;
    })
    .attr('y', -20) // Position of color bands relative to axis
    .attr('width', stepWidth)
    .attr('height', 20)
    .style('fill', function (d, i) {
      return t31_obj.colorScale(legendScale.invert(i * stepWidth + stepWidth / 2));
    });

  // Add the legend title just below the color bands
  // legend.append('text')
  //     .attr('x', legendWidth / 2)
  //     .attr('y', -400) // Position just below the color bands
  //     .attr('text-anchor', 'middle')
  //     .style('font-size', '12px') // Adjust the font size as needed
  //     .text('Turnover for Time Selected');

  t31_obj.map_svg
    .append('text')
    .attr('x', t31_width_height.line_inner_width - 112)
    .attr('y', 0 - t31_margins.line_margin.top / 2)
    .attr('text-anchor', 'middle')
    .style('font-size', '16px')
    .style('text-decoration', 'underline')
    .text('Agg. Turnover by Month(USD)');
}

function parsePolygon(polygonStr) {
  var numericValues = polygonStr.match(/-?\d+\.\d+/g);

  if (numericValues && numericValues.length % 2 === 0) {
    var coordinates = [];
    for (var i = 0; i < numericValues.length; i += 2) {
      coordinates.push([parseFloat(numericValues[i]), parseFloat(numericValues[i + 1])]);
    }
    return coordinates;
  } else {
    console.error('Invalid polygon format:', polygonStr);
    return [];
  }
}

function addBrushFunctionality() {
  // console.log('Adding brush functionality...');

  // Define the brush
  const brush = d3
    .brush()
    .extent([
      [0, 0],
      [t31_width_height.line_inner_width, t31_width_height.line_inner_height],
    ])
    .on('start brush', brushed)
    .on('end', brushended);

  // Add the brush to the SVG
  t31_obj.map_svg.append('g').attr('class', 'brush').call(brush);

  t31_obj.selectedEmployers = new Set(); // To store selected building IDs

  function brushed(event) {
    const selection = event.selection;
    if (!selection) return;

    const [[x0, y0], [x1, y1]] = selection;

    t31_obj.selectedEmployers.clear(); // Clear previous selections

    t31_obj.map_svg.selectAll('polygon').each(function (d) {
      const polygonPoints = d.location.map((point) => [
        t31_obj.xScale(point[0]),
        t31_obj.yScale(point[1]),
      ]);
      const within = polygonPoints.some(
        (p) => p[0] >= x0 && p[0] <= x1 && p[1] >= y0 && p[1] <= y1
      );

      if (within) {
        d3.select(this).style('stroke', 'black');
        // console.log('d.employer_id', d.employer_id);
        // console.log('d.buildingId test for line', d.buildingId);
        t31_obj.selectedEmployers.add(d.employer_id);
      } else {
        d3.select(this).style('stroke', 'grey');
      }
    });
  }

  function brushended(event) {
    const selection = event.selection;
    if (!selection) {
      t31_obj.map_svg.selectAll('polygon').style('stroke', '#grey');
      t31_obj.selectedEmployers.clear(); // Clear selections if the brush is cleared
    }
    dhruvil_test_function(Array.from(t31_obj.selectedEmployers));
    highlightBuilding(Object.values(t31_obj.uniqueBuildings), '');
  }
}

function dhruvil_test_function() {
  // console.log('Inside dhruvil_test_function');
  //   console.log("Selected Employers:", selectedEmplyers);
  dhruvil_init();
}

function dhruvil_init() {
  getData();
}

// Function to get data from CSV file
function getData() {
  // console.log('getdata called');
  d3.csv('../data/dhruvil/merged_csv.csv').then((data) => {
    // Convert necessary columns to the appropriate types
    data.forEach((d) => {
      d.turnover = +d.turnover;
      d.average_hourly_rate = +d.average_hourly_rate;
      d.noOfJobs = +d.noOfJobs;
    });

    const myArray = Array.from(t31_obj.selectedEmployers);
    // console.log(myArray);
    const filteredIds = data.filter(
      (d) => d.employer_id !== '0' && myArray.includes(+d.employer_id)
    );
    // console.log(filteredIds);
    const timelineFilteredData = filteredIds.filter(
      (d) => d.month_year >= timelineValues.start && d.month_year <= timelineValues.end
    );

    t32_obj.averageTurnover = Array.from(
      d3.group(timelineFilteredData, (d) => d.employer_id),
      ([key, values]) => {
        const average_turnover = d3.mean(values, (d) => d.turnover);
        const { average_hourly_rate, noOfJobs } = values[0];
        return {
          employer_id: key,
          average_hourly_rate,
          average_turnover,
          noOfJobs,
        };
      }
    );
    plotChart();
  });
}

function plotChart() {
  if (t31_obj.selectedEmployers.size > 20) {
    // Display a pop-up message
    // window.alert('Selected employers are more than 20. Cannot plot the chart.');
    showAlert();

    return; // Stop execution if there are more than 20 employers
  }

  if (t31_obj.selectedEmployers.size == 0) {
    showAlert1();
    return;
  }

  $('#last-chart-title').removeClass('d-none');

  t32_obj.map_bar_svg.selectAll('*').remove();

  const xScale = d3
    .scaleBand()
    .domain(t32_obj.averageTurnover.map((d) => d.employer_id))
    .range([0, t32_obj.width])
    .padding(0.1);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(t32_obj.averageTurnover, (d) => d.average_turnover)])
    .range([t32_obj.height, 100]);

  // console.log(t32_obj.map_bar_svg);
  // Add bars to the chart with color encoding and tooltips
  t32_obj.map_bar_svg
    .selectAll('rect')
    .data(t32_obj.averageTurnover)
    .enter()
    .append('rect')
    .attr('x', (d) => xScale(d.employer_id))
    .attr('y', (d) => yScale(d.average_turnover))
    .attr('width', xScale.bandwidth())
    .attr('height', (d) => t32_obj.height - yScale(d.average_turnover))
    .attr('fill', (d) => t32_obj.color.bar(d.average_hourly_rate))
    .on('mouseover', function (event, d) {
      // Show tooltip on mouseover
      const tooltip = d3.select('#tooltip');
      tooltip.transition().duration(200).style('opacity', 0.9);
      tooltip
        .html(
          `Turnover: ${d.average_turnover.toFixed(2)}<br>
          Hourly Rate: ${d.average_hourly_rate}<br>
          Number of Jobs: ${d.noOfJobs}`
        )
        .style('left', event.pageX + 'px')
        .style('top', event.pageY - 28 + 'px');
    })
    .on('mouseout', function () {
      // Hide tooltip on mouseout
      d3.select('#tooltip').transition().duration(500).style('opacity', 0);
    })
    .on('click', function (event, d) {
      // console.log('Clicked on employer ID:', d.employer_id);
      highlightedEmployeeId = d.employer_id;
      highlightBuilding(Object.values(t31_obj.uniqueBuildings), highlightedEmployeeId);
    });

  // Add x-axis
  t32_obj.map_bar_svg
    .append('g')
    .attr('transform', `translate(0, ${t32_obj.height})`)
    .call(d3.axisBottom(xScale));

  // Add y-axis (left)
  t32_obj.map_bar_svg.append('g').call(d3.axisLeft(yScale));

  // Add legend for color scale above the chart
  const legendColorScale = t32_obj.map_bar_svg
    .append('g')
    .attr('class', 'legend-color-scale')
    .attr('transform', `translate(${t32_obj.margin.left + 100}, ${t32_obj.margin.top - 60})`); // Adjust position as needed

  // Define the number of steps and the width of each step in the legend
  const legendWidth = 200;
  const legendSteps = 7;

  // Create a scale for the color legend
  const legendScaleColor = d3
    .scaleLinear()
    .domain(t32_obj.color.bar.domain())
    .range([0, legendWidth]);

  // Create an axis for the color legend
  const legendAxisColor = d3
    .axisBottom(legendScaleColor)
    .ticks(6) // Adjust the number of ticks as needed
    .tickFormat(d3.format('.2s')); // Format for turnover

  // Append the axis to the color legend
  legendColorScale.call(legendAxisColor);

  // Calculate the width of each color band
  const stepWidth = legendWidth / legendSteps;

  // Add the colored rectangles to the color legend
  legendColorScale
    .selectAll('rect')
    .data(d3.range(legendSteps))
    .enter()
    .append('rect')
    .attr('x', (d) => d * stepWidth)
    .attr('y', -20)
    .attr('width', stepWidth)
    .attr('height', 20)
    .style('fill', (d) =>
      t32_obj.color.bar(legendScaleColor.invert(d * stepWidth + stepWidth / 2))
    );

  // Add line chart y-scale (right) legend
  const yScaleLine = d3
    .scaleLinear()
    .domain([0, d3.max(t32_obj.averageTurnover, (d) => d.noOfJobs)])
    .range([t32_obj.height, 100]);

  // Add y-axis (right)
  t32_obj.map_bar_svg
    .append('g')
    .attr('transform', `translate(${t32_obj.width}, 0)`)
    .call(d3.axisRight(yScaleLine));

  // Define line function
  const line = d3
    .line()
    .x((d) => xScale(d.employer_id) + xScale.bandwidth() / 2)
    .y((d) => yScaleLine(d.noOfJobs));

  // Add line chart
  t32_obj.map_bar_svg
    .append('path')
    .datum(t32_obj.averageTurnover)
    .attr('class', 'line')
    .attr('d', line)
    .style('stroke', t32_obj.color.line) // Adjust line color
    .style('fill', 'none')
    .style('stroke-width', 2.5); // Adjust line thickness

  // Add points to the line chart
  t32_obj.map_bar_svg
    .selectAll('circle')
    .data(t32_obj.averageTurnover)
    .enter()
    .append('circle')
    .attr('cx', (d) => xScale(d.employer_id) + xScale.bandwidth() / 2)
    .attr('cy', (d) => yScaleLine(d.noOfJobs))
    .attr('r', 6) // Adjust the radius of the points
    .style('fill', t32_obj.color.line); // Adjust the color of the points

  // Add line chart y-axis (right) legend
  const legendLine = t32_obj.map_bar_svg
    .append('g')
    .attr('class', 'legend-line')
    .attr('transform', `translate(${t32_obj.margin.left + 480}, ${t32_obj.margin.top - 80})`);

  const lineX1 = 0;
  const lineX2 = 30;
  const circleRadius = 6;

  // Add line for the legend
  legendLine
    .append('line')
    .attr('x1', lineX1)
    .attr('y1', 9)
    .attr('x2', lineX2)
    .attr('y2', 9)
    .style('stroke', t32_obj.color.line)
    .style('stroke-width', 2.5); // Adjust line thickness

  // Add circle at the center of the line
  legendLine
    .append('circle')
    .attr('cx', (lineX1 + lineX2) / 2)
    .attr('cy', 9)
    .attr('r', circleRadius) // Adjust the radius of the circle
    .style('fill', t32_obj.color.line);

  legendLine
    .append('text')
    .attr('x', 35)
    .attr('y', 10)
    .attr('dy', '.35em')
    .style('text-anchor', 'start')
    .text('Number of Jobs');

  legendLine
    .append('text')
    .attr('x', -360)
    .attr('y', -20)
    .attr('dy', '.35em')
    .style('text-anchor', 'start')
    .text('Hourly Rate(in USD)');

  // Add x-axis legend
  t32_obj.map_bar_svg
    .append('text')
    .attr(
      'transform',
      `translate(${t32_obj.width / 2}, ${t32_obj.height + t32_obj.margin.top - 10})`
    )
    .style('text-anchor', 'middle')
    .text('Employer ID');

  // Add y-axis (left) legend
  t32_obj.map_bar_svg
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 0 - t32_obj.margin.left + 30)
    .attr('x', 0 - t32_obj.height / 2)
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .text('Turnover (in USD)');

  // Add line chart y-scale (right) legend
  t32_obj.map_bar_svg
    .append('text')
    .attr(
      'transform',
      `translate(${t32_obj.width + t32_obj.margin.right / 7}, ${t32_obj.height / 2}) rotate(90)`
    )
    .style('text-anchor', 'middle')
    .text('Number of Jobs');

  t32_obj.map_bar_svg.attr('transform', `translate(80, 80)`); // Adjust the vertical translation as needed
}

function highlightBuilding(data, highlightedEmployeeId) {
  // console.log('Inside highlightBuilding', highlightedEmployeeId, typeof highlightedEmployeeId);
  // console.log('Inside highlightBuilding data', data[0].employer_id, typeof data[0].employer_id);
  t31_obj.map_svg
    .selectAll('polygon')
    .data(data)
    .style('fill', function (d) {
      if (d.employer_id.toString() === highlightedEmployeeId) {
        // console.log('Inside if, found building');
        return t31_obj.color.highlight;
      } else {
        return t31_obj.colorScale(d.sumTurnover);
      }
    });
}

function showAlert() {
  new Audio('./music/error.wav').play();
  Swal.fire({
    title: 'Uh-Oh!',
    html: 'Selected region has more than 20 employers. <br> Please select a smaller region to plot the bar chart.',
    icon: 'error',
    confirmButtonText: 'Okay',
    width: 600,
    position: 'bottom-end',
  });
}

function showAlert1() {
  new Audio('./music/error.wav').play();
  Swal.fire({
    title: 'Uh-Oh!',
    html: 'Selected region has no employers. <br> Please select a region to plot the bar chart.',
    icon: 'error',
    confirmButtonText: 'Okay',
    width: 600,
    position: 'bottom-end',
  });
}
