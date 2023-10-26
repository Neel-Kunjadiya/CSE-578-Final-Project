var timelineValues = { start: 1, end: 15 };

//  Init
var _init_ = function () {
  // console.log('Running application!');
  // Addign timeline slider
  addTimelineSlider();
  addSoundOnClicks();

  // Task 1 charts
  _init_charts();

  // Task 2 charts
  _init_streamGraph();
  _init_radarChart();
  _init_parallelChart();

  // Task 3 charts
  initMap();
};

const _redrawAllCharts = () => {
  // Task 1
  _redrawPieChart();

  // Task 2
  _redrawSpiderChart();
  _redrawStreamGraph();
  _redrawParallelChart();

  drawt31();
};

// Setup on document ready
$(document).ready(function () {
  require('/js/task1.js');
  require('/js/task2.js');
  require('/js/task3.js');
  _init_();
});

function require(script) {
  $.ajax({
    url: script,
    dataType: 'script',
    async: false, // <-- This is the key
    success: function () {
      console.log('Loaded :' + script);
    },
    error: function () {
      throw new Error('Could not load script ' + script);
    },
  });
}

const addTimelineSlider = () => {
  // Define the slider
  const sliderRange = d3
    .sliderBottom()
    .min(1)
    .max(15)
    .step(1)
    .width(700)
    // .tickFormat(d3.timeFormat('%Y-%m-%d'))
    // .ticks(3)
    .default([0, 15])
    .fill(colorScheme.darkblue);

  sliderRange.on('onchange', (val) => {
    timelineValues.start = val[0];
    timelineValues.end = val[1];
    _redrawAllCharts();
  });

  // Add the slider to the DOM
  const gRange = d3
    .select('#slider-range')
    .append('svg')
    .attr('width', 800)
    .attr('height', 150)
    .attr('class', 'slider-group')
    .append('g')
    .attr('transform', 'translate(50,70)');

  d3.select('.slider-group')
    .append('text')
    .html('Timeline (by month)')
    .attr('text-anchor', 'middle')
    .attr('class', 'chart-title')
    .attr('transform', 'translate(400,48)');

  gRange.call(sliderRange);
};

const addSoundOnClicks = () => {
  $('body').on('click', () => {
    new Audio('./music/click-2.wav').play();
  });
};
