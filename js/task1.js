var t1_obj = {
  Restaurant: {},
  Pub: {},
  metric: "Revenue",
  name: "Restaurant",
  id: "445",
  color: {
    Restaurant: colorScheme.darkblue,
    Pub: colorScheme.orange,
    Violin: colorScheme.yellow,
    Title: colorScheme.gray,
    Stroke: colorScheme.black,
  },
  rID: new Set(),
  pID: new Set(),
};

// var timelineValues = { start: 1, end: 15 };

const chartconfig = {
  width: 700,
  height: 700,
  margin: { top: 50, right: 50, bottom: 50, left: 50 },
};

const _restaurantWrangle = (d) => {
  t1_obj.Restaurant[+d.Month].push(d);
  t1_obj.rID.add(d["RestaurantID"]);
};

const _pubWrangle = (d) => {
  t1_obj.Pub[+d.Month].push(d);
  t1_obj.pID.add(d["PubID"]);
};

const _init_charts = () => {
  for (i in [...Array(15).keys()]) {
    t1_obj.Restaurant[+i + 1] = [];
    t1_obj.Pub[+i + 1] = [];
  }

  document.getElementById("dataSelect").addEventListener("change", () => {
    const selectedValue = document.getElementById("dataSelect").value;
    t1_obj.metric = selectedValue;
    _redrawPieChart();
  });

  Promise.all([
    d3.csv("data/Restaurant_revenue_footfall.csv", _restaurantWrangle),
    d3.csv("data/Pub_revenue_footfall.csv", _pubWrangle),
  ]).then(function (values) {
    var data = _getPieData(timelineValues);
    createPieChart(data);
  });
};

const _getPieData = (timelineValues) => {
  var start = timelineValues.start;
  var end = timelineValues.end;
  var metric = t1_obj.metric;

  var counter = start;
  var totalRestaurantRevenueOrFootfall = 0,
    totalPubRevenueOrFootfall = 0;

  while (counter <= end) {
    t1_obj.Restaurant[counter].map((item) => {
      totalRestaurantRevenueOrFootfall += parseFloat(item[metric]);
    });
    counter += 1;
  }

  counter = start;
  while (counter <= end) {
    t1_obj.Pub[counter].map((item) => {
      totalPubRevenueOrFootfall += parseFloat(item[metric]);
    });
    counter += 1;
  }

  const dataset = [
    {
      name: "Restaurant",
      value: totalRestaurantRevenueOrFootfall,
      image: "data/Restaurant.png",
    },
    {
      name: "Pub",
      value: totalPubRevenueOrFootfall,
      image: "data/Pub.png",
    },
  ];

  return dataset;
};

const _getBarData = (timelineValues) => {
  var start = timelineValues.start;
  var end = timelineValues.end;
  var metric = t1_obj.metric || "Revenue";
  var name = t1_obj.name || "Restaurant";

  var dataMap = new Map();
  var counter = start;

  while (counter <= end) {
    var groupedData = t1_obj[name][counter];
    groupedData = d3.rollup(
      groupedData,
      (v) => d3.sum(v, (d) => d[metric]),
      (d) => d[`${name}ID`]
    );

    var dataForChart = Array.from(groupedData, ([key, value]) => ({
      ID: key,
      Value: value,
    }));

    dataForChart.forEach((item) => {
      if (dataMap.has(item.ID)) {
        var currentValue = dataMap.get(item.ID);
        currentValue += item.Value;
        dataMap.set(item.ID, currentValue);
      } else {
        dataMap.set(item.ID, item.Value);
      }
    });

    counter += 1;
  }

  var data = Array.from(dataMap, ([key, value]) => ({
    ID: key,
    Value: value,
  }));

  return data;
};

const _getHistogramLineViolinData = (timelineValues) => {
  var start = timelineValues.start;
  var end = timelineValues.end;
  var metric = t1_obj.metric;
  var name = t1_obj.name;
  var selectedID = null;
  if (name === "Restaurant") {
    selectedID = (t1_obj.rID.has(t1_obj.id) ? t1_obj.id : "445") || "445";
  } else {
    selectedID = (t1_obj.pID.has(t1_obj.id) ? t1_obj.id : "442") || "442";
  }

  t1_obj.id = selectedID;

  var counter = start;
  var selectedData = [];
  var allData = [];

  while (counter <= end) {
    var tempList = t1_obj[name][counter].filter(
      (d) => d[`${name}ID`] === selectedID
    );

    tempList.forEach((item) => selectedData.push(item));

    var allList = t1_obj[name][counter];
    allList.forEach((item) => allData.push(item));

    counter += 1;
  }

  const parseDate = d3.timeParse("%Y-%m-%d");
  const formatMonth = d3.timeFormat("%b %Y");

  counter = start;

  var nestedData = [];
  var dataMap = new Map();
  while (counter <= end) {
    var tempList = Array.from(
      d3.rollup(
        t1_obj[name][counter],
        (v) => d3.mean(v, (d) => parseFloat(d[metric])),
        (d) => formatMonth(parseDate(d.Date))
      ),
      ([key, value]) => ({ key, value })
    );

    tempList.forEach((item) => nestedData.push(item));

    counter += 1;
  }

  var selectedNestedData = Array.from(
    d3.rollup(
      selectedData,
      (v) => d3.mean(v, (d) => parseFloat(d[metric])),
      (d) => formatMonth(parseDate(d.Date))
    ),
    ([key, value]) => ({ key, value })
  );

  var finalData = {
    histogramChart: nestedData,
    lineChart: selectedNestedData,
    violinChart: allData,
  };

  return finalData;
};

const createPieChart = (data) => {
  const { width, height, margin } = chartconfig;
  const radius = Math.min(width, height) / 2;
  var metric = t1_obj.metric;
  const innerRadius = radius * 0.65;
  const iconWidth = 100;
  const iconHeight = 100;

  d3.select("#pieChart").selectAll("*").remove();

  const svg = d3
    .select("#pieChart")
    .append("svg")
    .attr("width", width)
    .attr("height", height + 100)
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  const pie = d3
    .pie()
    .value((d) => d.value)
    .sort(null);

  const arc = d3
    .arc()
    .innerRadius(radius * 0.65)
    .outerRadius(radius);

  const path = d3.arc().outerRadius(radius).innerRadius(innerRadius);

  svg
    .append("image")
    .attr("id", "Pub-image")
    .attr("class", "middle-image")
    .attr("xlink:href", `img/Pub.png`)
    .attr("x", -50)
    .attr("y", -60)
    .attr("width", iconWidth)
    .attr("height", iconHeight)
    .attr("opacity", 0);
  svg
    .append("image")
    .attr("id", "Restaurant-image")
    .attr("class", "middle-image")
    .attr("xlink:href", `img/Restaurant.png`)
    .attr("x", -50)
    .attr("y", -60)
    .attr("width", iconWidth)
    .attr("height", iconHeight)
    .attr("opacity", 0);

  svg
    .append("text")
    .attr("id", "middle-text")
    .attr("class", "middle-text")
    .attr("text-anchor", "middle")
    .attr("font-size", "25px")
    .attr("font-weight", "bold")
    .attr("fill", t1_obj.color.Stroke)
    .attr("y", 80)
    .attr("opacity", 0);

  const arcs = svg
    .selectAll("arc")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc")
    .on("click", handleClick)
    .on("mouseover", function (event, d) {
      d3.select(this)
        .select("path")
        .attr("stroke", t1_obj.color.Stroke)
        .attr("stroke-width", 4);

      svg
        .select(`#${d.data.name}-image`)
        .transition()
        .duration(500)
        .attr("opacity", 0.95);
      svg
        .select(`#middle-text`)
        .html(
          metric === "Revenue"
            ? `${d.data.name}: $${Math.round(d.data.value).toLocaleString()}`
            : `${d.data.name}: ${Math.round(d.data.value).toLocaleString()}`
        )
        .transition()
        .duration(500)
        .attr("opacity", 0.95);
    })
    .on("mouseout", function (event, d) {
      d3.select(this).select("path").attr("stroke-width", 0);
      // svg.select('.middle-text').transition().duration(100).attr('opacity', 0).remove().remove();
      svg.select(`#middle-text`).transition().duration(500).attr("opacity", 0);
      svg
        .select(`#${d.data.name}-image`)
        .transition()
        .duration(500)
        .attr("opacity", 0);
      // svg.select('.middle-image').transition().duration(100).attr('opacity', 0).remove();
    });

  arcs
    .append("path")
    .attr("d", arc)
    .attr("fill", (d) => t1_obj.color[d.data.name])
    .style("cursor", "pointer")
    .transition()
    .duration(750)
    .attrTween("d", function (d) {
      const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
      return function (t) {
        return path(i(t));
      };
    });

  svg
    .append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", innerRadius * 1.1)
    .attr("fill", "white")
    .style("pointer-events", "none")
    .attr("opacity", 0.5);

  // const legend = svg.append('g').attr('transform', `translate(0, ${chartconfig.height / 2 + 20})`);

  // legend
  //   .append("rect")
  //   .attr("width", 20)
  //   .attr("height", 20)
  //   .attr("fill", t1_obj.color.Restaurant)
  //   .attr("transform", "translate(-90, -3)");

  // legend.append('text').attr('x', -60).attr('y', 0).attr('dy', '0.8em').text('Restaurant');

  // legend
  //   .append("rect")
  //   .attr("width", 20)
  //   .attr("height", 20)
  //   .attr("fill", t1_obj.color.Pub)
  //   .attr("transform", "translate(50, -3)");

  // legend.append('text').attr('x', 80).attr('y', 0).attr('dy', '0.8em').text('Pub');

  svg
    .append("text")
    .attr("transform", `translate(0, ${radius + margin.bottom + 25})`)
    .style("text-anchor", "middle")
    .style("font-size", "1.5rem")
    .attr("fill", "gray")
    .text(`Total ${metric} by Businesses`);

  function handleClick(event, d) {
    const clickedData = data.find((item) => item.name === d.data.name);
    if (clickedData) {
      t1_obj.name = clickedData.name;
      var barData = _getBarData(timelineValues);
      createBarChart(barData);
    } else {
      console.log("clickedData is empty!");
    }
  }

  // arcs
  //   .append('path')
  //   .attr('d', path)
  //   .attr('fill', (d) => t1_obj.color[d.data.name])
  //   .style('cursor', 'pointer')
  //   .transition()
  //   .duration(750)
  //   .attrTween('d', function (d) {
  //     const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
  //     return function (t) {
  //       return path(i(t));
  //     };
  //   });

  // ------------------- Pie Chart Code --------------------

  // const path = d3
  //   .arc()
  //   .outerRadius(radius - 10)
  //   .innerRadius(0);

  // const arc = svg
  //   .selectAll('arc')
  //   .data(pie(data))
  //   .enter()
  //   .append('g')
  //   .on('click', handleClick)
  //   .on('mouseover', function () {
  //     d3.select(this).select('path').attr('stroke', 'black').attr('stroke-width', 4);
  //   })
  //   .on('mouseout', function () {
  //     d3.select(this).select('path').attr('stroke-width', 0);
  //   });

  // arc
  //   .append('path')
  //   .attr('d', path)
  //   .attr('fill', (d) => t1_obj.color[d.data.name])
  //   .style('cursor', 'pointer')
  //   .transition()
  //   .duration(750)
  //   .attrTween('d', function (d) {
  //     const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
  //     return function (t) {
  //       return path(i(t));
  //     };
  //   });

  // arc
  //   .append('text')
  //   .attr('transform', (d) => `translate(${path.centroid(d)})`)
  //   .attr('text-anchor', 'middle')
  //   // .attr('fill' , 'white')
  //   .html(
  //     (d) =>
  //       `${d.data.name}<tspan dy="1em" x="0" font-size="1.75rem">${
  //         metric === 'Revenue'
  //           ? `$${Math.round(d.data.value).toLocaleString()}`
  //           : `${Math.round(d.data.value).toLocaleString()}`
  //       }</tspan>`
  //   )
  //   .transition()
  //   .duration(750)
  //   .attr('transform', (d) => `translate(${path.centroid(d)})`);

  // svg
  //   .append('text')
  //   .attr('transform', `translate(0, ${radius + margin.bottom})`)
  //   .style('text-anchor', 'middle')
  //   .style('font-size', '1.5rem')
  //   .attr("fill" , "gray")
  //   .text(`Total ${metric} by Restaurant & Pub`);

  // function handleClick(event, d) {
  //   const clickedData = data.find((item) => item.name === d.data.name);
  //   if (clickedData) {
  //     t1_obj.name = clickedData.name;
  //     var barData = _getBarData(timelineValues);
  //     createBarChart(barData);
  //   } else {
  //     console.log('clickedData is empty!');
  //   }
  // }
};

const createBarChart = (data) => {
  $("#barChart").removeClass("d-none");
  const { width, height, margin } = chartconfig;
  var metric = t1_obj.metric;
  var name = t1_obj.name;

  d3.select("#barChart").selectAll("*").remove();

  const svg = d3
    .select("#barChart")
    .append("svg")
    .attr("width", width + margin.left + margin.right + 70)
    .attr("height", height + margin.top + margin.bottom + 70)
    .append("g")
    .attr("transform", `translate(${margin.left + 30},${margin.top})`);

  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.ID))
    .range([0, width])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.Value)])
    .nice()
    .range([height, 0]);

  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-30)");

  svg.append("g").call(d3.axisLeft(y));

  svg
    .append("text")
    .attr("transform", `translate(${width / 2}, ${height + margin.bottom + 5})`)
    .style("text-anchor", "middle")
    .text(`${name}`);

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left - 30)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text(metric === "Revenue" ? "Revenue (in USD)" : "Footfall");

  svg
    .append("text")
    .attr(
      "transform",
      `translate(${width / 2}, ${height + margin.bottom + 50})`
    )
    .style("text-anchor", "middle")
    .style("font-size", "1.5rem")
    .attr("fill", "gray")
    .text(`${metric} generated by Individual ${name}s`);

  const bars = svg
    .selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d.ID))
    .attr("width", x.bandwidth())
    .attr("y", height)
    .attr("height", 0)
    .attr("fill", t1_obj.color[name])
    .attr("stroke", (d) =>
      d.ID === t1_obj.id
        ? name === "Restaurant"
          ? t1_obj.color.Pub
          : t1_obj.color.Restaurant
        : "none"
    )
    .style("cursor", "pointer")
    .attr("stroke-width", (d) => (d.ID === t1_obj.id ? 4 : 0))
    .on("click", (event, d) => {
      d3.selectAll(".bar").attr("stroke", "none");
      d3.select(event.currentTarget)
        .attr(
          "stroke",
          name === "Restaurant" ? t1_obj.color.Pub : t1_obj.color.Restaurant
        )
        .attr("stroke-width", 4);

      t1_obj.id = d.ID;
      var violinData = _getHistogramLineViolinData(timelineValues);
      createHistogramLineViolinChart(violinData);
    })
    .on("mouseover", function (event, d) {
      const tooltip = d3.select("#tooltip");
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(
          `<strong>ID</strong>: ${
            d.ID
          }<br/><strong>Value</strong>: ${Math.floor(d.Value)}`
        )
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 75 + "px");
    })
    .on("mouseout", function () {
      d3.select("#tooltip").transition().duration(500).style("opacity", 0);
    });

  bars
    .transition()
    .duration(1000)
    .attr("y", (d) => y(d.Value))
    .attr("height", (d) => height - y(d.Value));
};

const createHistogramLineViolinChart = (data) => {
  $("#histogramChart").removeClass("d-none");
  d3.select("#histogramChart").selectAll("*").remove();

  const { width, height, margin } = chartconfig;
  var metric = t1_obj.metric;
  var name = t1_obj.name;

  var histogramChartData = data["histogramChart"];
  var lineChartData = data["lineChart"];
  var violinChartData = data["violinChart"];

  const parseDate = d3.timeParse("%Y-%m-%d");
  const formatMonth = d3.timeFormat("%b %Y");

  const svg = d3
    .select("#histogramChart")
    .append("svg")
    .attr("width", width + margin.left + margin.right + 150)
    .attr("height", height + margin.top + margin.bottom + 150)
    .append("g")
    .attr("transform", `translate(${margin.left + 30},${margin.top + 40})`);

  const x = d3
    .scaleBand()
    .domain(histogramChartData.map((d) => d.key))
    .range([0, width])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([
      0,
      Math.max(
        ...histogramChartData.map((d) => d.value),
        ...lineChartData.map((d) => d.value)
      ),
    ])
    .nice()
    .range([height, 0]);

  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-30)");

  svg.append("g").call(d3.axisLeft(y));

  svg
    .append("text")
    .attr(
      "transform",
      `translate(${width / 2}, ${height + margin.bottom + 20})`
    )
    .style("text-anchor", "middle")
    .text("Months");

  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left - 20)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text(
      metric === "Revenue" ? "Average Revenue (in USD)" : "Average Footfall"
    );

  const bars = svg
    .selectAll(".bar")
    .data(histogramChartData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d.key))
    .attr("width", x.bandwidth())
    .attr("y", height)
    .attr("height", 0)
    .attr("fill", t1_obj.color[name])
    .attr("opacity", 0.5) // KANVI --> Testign Bar opacity fixes
    .on("mouseover", function (event, d) {
      svg.selectAll(".line").transition().duration(200).attr("opacity", 0.2);
      svg.selectAll("circle").transition().duration(200).attr("opacity", 0.2);
      svg.selectAll(".violin").transition().duration(200).attr("opacity", 0.5);
      svg.selectAll(".bar").transition().duration(200).attr("opacity", 1);

      const tooltip = d3.select("#tooltip");
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(
          `Average ${metric} of all ${name}s<br/><strong>Value</strong>: $${Math.floor(
            d.value
          )}`
        )
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 75 + "px");
    })
    .on("mouseout", function () {
      svg.selectAll(".line").transition().duration(200).attr("opacity", 1);
      svg.selectAll("circle").transition().duration(200).attr("opacity", 1);
      svg.selectAll(".violin").transition().duration(200).attr("opacity", 1);
      svg.selectAll(".bar").transition().duration(200).attr("opacity", 0.5);

      d3.select("#tooltip").transition().duration(500).style("opacity", 0);
    });

  bars
    .transition()
    .duration(1000)
    .attr("y", (d) => y(d.value))
    .attr("height", (d) => height - y(d.value));

  const line = d3
    .line()
    .x((d) => x(d.key) + x.bandwidth() / 2)
    .y((d) => y(d.value))
    .curve(d3.curveLinear);

  var histogram = d3
    .histogram()
    .domain(y.domain())
    .thresholds(y.ticks(20))
    .value((d) => d);

  var sumstat = new Map();

  d3.group(violinChartData, (d) => formatMonth(parseDate(d.Date))).forEach(
    (values, key) => {
      input = values.map((g) => g[metric]);
      bins = histogram(input);
      sumstat.set(key, bins);
    }
  );

  sumstat = Array.from(sumstat, ([key, value]) => ({ key, value }));

  var maxNum = 0;

  for (i in sumstat) {
    allBins = sumstat[i].value;
    lengths = allBins.map(function (a) {
      return a.length;
    });
    longuest = d3.max(lengths);
    if (longuest > maxNum) {
      maxNum = longuest;
    }
  }

  var xNum = d3
    .scaleLinear()
    .range([0, x.bandwidth()])
    .domain([-maxNum, maxNum]);

  svg
    .selectAll("violin")
    .data(sumstat)
    .enter()
    .append("g")
    .attr("transform", function (d) {
      return "translate(" + x(d.key) + " ,0)";
    })
    .append("path")
    .datum(function (d) {
      return d.value;
    })
    .style("stroke", "none")
    .attr("class", "violin")
    .style("fill", t1_obj.color.Violin)
    .attr(
      "d",
      d3
        .area()
        .x0(function (d) {
          return xNum(-d.length);
        })
        .x1(function (d) {
          return xNum(d.length);
        })
        .y(function (d) {
          return y(d.x0);
        })
        .curve(d3.curveCatmullRom)
    )
    .attr("opacity", 1) // KANVI --> Testing Violin opacity fixes
    .on("mouseover", function (event, d) {
      svg.selectAll(".line").transition().duration(200).attr("opacity", 0.2);
      svg.selectAll("circle").transition().duration(200).attr("opacity", 0.2);
      svg.selectAll(".bar").transition().duration(200).attr("opacity", 0.2);

      const tooltip = d3.select("#tooltip");
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(`Average ${metric} trend for all ${name}s`)
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 75 + "px");
    })
    .on("mouseout", function () {
      svg.selectAll(".line").transition().duration(200).attr("opacity", 1);
      svg.selectAll("circle").transition().duration(200).attr("opacity", 1);
      svg.selectAll(".bar").transition().duration(200).attr("opacity", 0.5);

      d3.select("#tooltip").transition().duration(500).style("opacity", 0);
    });

  svg
    .append("path")
    .datum(lineChartData)
    .attr("fill", "none")
    .attr("class", "line")
    .attr(
      "stroke",
      name === "Restaurant" ? t1_obj.color.Pub : t1_obj.color.Restaurant
    )
    .attr("stroke-width", 3)
    .attr("d", line)
    .on("mouseover", function (event, d) {
      // svg.selectAll('circle').attr('opacity', 0.2);
      svg.selectAll(".violin").transition().duration(200).attr("opacity", 0.5);
      svg.selectAll(".bar").transition().duration(200).attr("opacity", 0.2);

      const tooltip = d3.select("#tooltip");
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(`Average ${metric} of ${name}: ${t1_obj.id}`)
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 75 + "px");
    })
    .on("mouseout", function () {
      // svg.selectAll('circle').attr('opacity', 1);
      svg.selectAll(".violin").transition().duration(200).attr("opacity", 1);
      svg.selectAll(".bar").transition().duration(200).attr("opacity", 0.5);

      d3.select("#tooltip").transition().duration(500).style("opacity", 0);
    });

  svg
    .selectAll("circle")
    .data(lineChartData)
    .enter()
    .append("circle")
    .attr("class", "circle")
    .attr("cx", (d) => x(d.key) + x.bandwidth() / 2)
    .attr("cy", (d) => y(d.value))
    .attr("r", 6)
    .attr("fill", "white")
    .attr("stroke-width", "3px")
    .attr(
      "stroke",
      name === "Restaurant" ? t1_obj.color.Pub : t1_obj.color.Restaurant
    )
    .on("mouseover", function (event, d) {
      // svg.selectAll('.line').attr('opacity', 0.2);
      svg.selectAll(".violin").transition().duration(200).attr("opacity", 0.5);

      const tooltip = d3.select("#tooltip");
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(
          `<strong>${name}</strong>: ${
            t1_obj.id
          }<br/><strong>Value</strong>: $${Math.floor(d.value)}`
        )
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 75 + "px");
    })
    .on("mouseout", function (d) {
      // svg.selectAll('.line').attr('opacity', 1);
      svg.selectAll(".violin").transition().duration(200).attr("opacity", 1);

      d3.select("#tooltip").transition().duration(500).style("opacity", 0);
    });

  svg
    .append("text")
    .attr(
      "transform",
      `translate(${width / 2}, ${height + margin.bottom + 60})`
    )
    .style("text-anchor", "middle")
    .style("font-size", "1.5rem")
    .attr("fill", "gray")
    .text(`Month-wise ${metric} generated by ${name}`);

  const legendData = [
    {
      data: `Avg. ${metric} trend of all ${name}`,
      color: t1_obj.color.Violin,
    },
    {
      data: `Avg. ${metric} of ${name} : ${t1_obj.id}`,
      color: name === "Restaurant" ? t1_obj.color.Pub : t1_obj.color.Restaurant,
    },
    { 
      data: `Avg. ${metric} of all ${name}`, 
      color: t1_obj.color[name] 
    },
  ];

  const legend = svg
    .append("g")
    .attr("class", "legend-line")
    .attr("transform", `translate(-30,-30)`);

  legend
    .selectAll("circle")
    .data(legendData)
    .enter()
    .append("circle")
    .attr("cx", (d, i) => i * 270)
    .attr("cy", 0)
    .attr("r", 8)
    .style("fill", (d , i) => ((i == 1) ? "white" : d.color))
    .attr("stroke" , (d , i) => ((i == 1) ? d.color : "none"))
    .attr("stroke-width" , "3px")

  legend
    .append("line")
    .attr("class" , "legend-line")
    .attr('x1' , 255)
    .attr('y1' , 0)
    .attr('x2' , 262)
    .attr('y2' , 0)
    .attr("stroke" , name === "Restaurant" ? t1_obj.color.Pub : t1_obj.color.Restaurant)
    .attr("stroke-width" , "3px");

  legend
    .append("line")
    .attr("class" , "legend-line")
    .attr('x1' , 278)
    .attr('y1' , 0)
    .attr('x2' , 285)
    .attr('y2' , 0)
    .attr("stroke" , name === "Restaurant" ? t1_obj.color.Pub : t1_obj.color.Restaurant)
    .attr("stroke-width" , "3px");

  legend
    .selectAll("text")
    .data(legendData)
    .enter()
    .append("text")
    .attr("x", (d, i) => i * 270 + 20)
    .attr("y", 0)
    .attr("font-size", "0.8rem")
    .attr("dy", ".35em")
    .style("text-anchor", "start")
    .text((d) => d.data);
};

const _redrawPieChart = () => {
  var dataPieChart = _getPieData(timelineValues);
  createPieChart(dataPieChart);
  var dataBarChart = _getBarData(timelineValues);
  createBarChart(dataBarChart);
  var dataHistogramLineViolinChart = _getHistogramLineViolinData(
    timelineValues,
    t1_obj.id
  );
  createHistogramLineViolinChart(dataHistogramLineViolinChart);
};
