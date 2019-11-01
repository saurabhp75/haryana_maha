import {
  select,
  scaleThreshold,
  scaleOrdinal,
  json,
  zoom,
  event
} from 'd3';

// import { mahaLdNProcData } from './mahaLdNProcData';
import { LoadNProcData } from './miscUtils'
import { mahaClrLgnd } from './mahaClrLgnd';
import { mahaChoroMap } from './mahaChoroMap';
import { getSvgDimensions, getSvg } from './miscUtils';
import { mahaInfoPanel } from './mahaInfoPanel';
import { getBgRectangleDimensions } from './miscUtils';
import { mahaProcPartyFeatures } from './miscUtils';
import { dropDownMenu } from './miscUtils';
import { mahaProcEduFeatures } from './miscUtils';

// Set initial state of the app
let selectedFeature = 'Assets';
let selectedColorValue; // tracks selected color in legend bar
let features; // Globally (in the file) accessible feature array
let selectedConstituency; // tracks selected constituency in map
let colorDomain;
let colorValues;
let colorLabels;
let colorScale;

// constants for legend bar
const labelRectSize = 30;
const labelSpacing = 30;
const labelTextOffset = 40;
let legendTitle;
let partyMap;

let colorLegendG;
let legendTitleG;
let legendBodyG;
let backgroundRect;
let legendBodyGSelection;
let backgroundRectDimensions;

// Create complete legend bar 
const createLegendBar = (colorValues,
  colorLabels,
  labelRectSize,
  labelTextOffset,
  labelSpacing,
  legendTitle) => {

  // console.log(`createLegendBar called title: ${legendTitle}`);
  backgroundRectDimensions = getBgRectangleDimensions(colorValues,
    colorLabels,
    labelRectSize,
    labelTextOffset,
    labelSpacing,
    legendTitle);

  // Create Legend group and place in lower left of svg. 
  // This will appear over constituencyG group
  colorLegendG = mainCanvas.selectAll('.colorLegend').data([legendTitle]);

  // remove previuosly added colorLegendG
  colorLegendG.exit().remove();

  colorLegendG =  colorLegendG.enter().append('g')
    .merge(colorLegendG)
      .attr('class', 'colorLegend')
      .attr('transform', `translate(10, ${mainCanvasHeight - backgroundRectDimensions.height})`);

  // Background of legend bar, single item, special case
  backgroundRect = colorLegendG.selectAll('rect').data([legendTitle]);

  // remove previuosly added rectangle
  backgroundRect.exit().remove();

  // Background of legend
  backgroundRect.enter().append('rect')
    .merge(backgroundRect)
      .attr('x', -labelRectSize)
      .attr('y', -labelRectSize)
      .attr('width', backgroundRectDimensions.width)
      .attr('height', backgroundRectDimensions.height)
      .attr('fill', 'red')
      .attr('rx', labelRectSize)
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
      .attr('opacity', 0.3);

  // Append two groups to legend group, one for title (legendTitleG)
  // and other for body of legend bar (legendBodyG).
  legendTitleG = colorLegendG.selectAll('.legendTitle').data([legendTitle]);

  // remove previuosly added legendTitle
  legendTitleG.exit().remove();

  const legendTitleGMerge = legendTitleG.enter().append('g')
    .merge(legendTitleG)
      .attr("class", "legendTitle");

  const legendText = legendTitleGMerge.selectAll('text').data([legendTitle]);

  legendText.enter().append('text')
    .merge(legendText)
      .text(legendTitle);
  
  legendBodyG = colorLegendG.selectAll('.legendBody').data([legendTitle]);

  // remove previuosly added legend body
  legendBodyG.exit().remove();

  legendBodyGSelection = legendBodyG.enter()
    .append('g')
    .attr('transform', `translate(0, ${labelSpacing / 2})`)
    .attr("class", "legendBody")
    .merge(legendBodyG);
}// End of method createLegendBar

// Create drop down menu
select('#menus').call(dropDownMenu, {
  options: ['Assets', 'Criminal Case(s)', 'Education', 'Top parties'],
  onOptionClicked: val => {
    // set the appp state
    selectedConstituency = null;
    selectedColorValue = null;
    selectedFeature = val;

    createScaleAndLegend();

    // call render()
    render();
    // console.log(`Selected feature ${val}`);
  }
});

const div = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// Set domensions of root svg
const mainCanvas = select("svg");

const mainCanvasHeight = mainCanvas.attr('height');
const mainCanvasWidth = mainCanvas.attr('width');

// Constituency group
const constituencyG = mainCanvas.append('g');

// Information panel
const infoPanelG = mainCanvas.append('g').attr('transform', `translate(${mainCanvasWidth - 370 - 15},20)`);

// Background of info panel, single item, special case
const infoPanelGBackground = infoPanelG.selectAll('rect').data([null]);

// Background of info panel
infoPanelGBackground.enter().append('rect')
  .merge(infoPanelGBackground)
  .attr('width', 370)
  .attr('height', 170)
  .attr('fill', 'red')
  .attr('stroke', 'black')
  .attr('stroke-width', 1)
  .attr('rx', 10)
  .attr('opacity', 0.3);

// Add one time text element to Info Panel
const infoPanelGUpdate = infoPanelG.selectAll('text').data([null]);

// Add new text element
const infoPanelGMerge = infoPanelGUpdate.enter()
  .append('text')
  .attr('class', 'infoText')
  .attr('transform', 'translate(10,5)')
  .merge(infoPanelGUpdate);

// Add border to the main canvas
const borderPath = mainCanvas.append("rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("height", getSvgDimensions().height)
  .attr("width", getSvgDimensions().width)
  .style("stroke", 'black')
  .style("fill", "none")
  .style("stroke-width", 1);

// Add pannning and zooming to map
mainCanvas.call(zoom().on('zoom', () => {
  constituencyG.attr('transform', event.transform);
  div.attr('transform', event.transform);

}));

const createScaleAndLegend = () => {

  if (selectedFeature === 'Top parties') {

    colorDomain = [
      "BJP",
      "SHS",
      "NCP",
      "INC",
      "IND",
      "Bahujan Vikas Aaghadi",
      "Others"];

    colorValues = ['#edf8e9','#c7e9c0','#a1d99b','#74c476','#41ab5d','#238b45','#005a32'];
    
    colorLabels = colorDomain;

    // Define colorscale for constituencies, discrete input and discrete output
    colorScale = scaleOrdinal();

    // Set set domain and range of colorscale for constituencies
    colorScale.domain(colorDomain).range(colorValues);

    legendTitle = 'Top parties';

    createLegendBar(colorValues,
      colorLabels,
      labelRectSize,
      labelTextOffset,
      labelSpacing,
      legendTitle);

  }// End, if Top 10 parties
  else if (selectedFeature === 'Assets') {

    // Define colorscale for constituencies, continous input and discrete output
    colorScale = scaleThreshold();

    // min~8lacs, max ~ 100crores
    colorDomain = [10000000,
      200000000,
      500000000,
      1000000000];

    colorValues = ['#edf8e9','#bae4b3','#74c476','#31a354','#006d2c'];
  
    colorLabels = ["< 1 Crore",
      "1 - 20 Cr.",
      "20 - 50 Cr.",
      "50 - 100 Cr.",
      "> 100 Cr."];

    // Set set domain and range of colorscale for constituencies
    colorScale.domain(colorDomain).range(colorValues);

    // Invert the legend bar
    colorValues.reverse();
    colorLabels.reverse();

    legendTitle = 'Assets(Rs.)';

    createLegendBar(colorValues,
      colorLabels,
      labelRectSize,
      labelTextOffset,
      labelSpacing,
      legendTitle);

  }// End, if Assets
  else if (selectedFeature === 'Criminal Case(s)') {
    // console.log(`if called ${selectedFeature}`)

    // min-0, max=2
    colorDomain = [
      1,
      5,
      10];

    colorValues = ['#edf8e9','#bae4b3','#74c476','#31a354'];
    // colorValues = ['#f0f9e8','#bae4bc','#7bccc4','#2b8cbe']

    colorLabels = [
      "None",
      "1 to 4",
      "5 to 9",
      "10 or more"];

    // Define colorscale for constituencies
    colorScale = scaleThreshold();

    // Set set domain and range of colorscale for constituencies
    colorScale.domain(colorDomain).range(colorValues);

    // Invert the legend bar
    colorValues.reverse();
    colorLabels.reverse();

    legendTitle = 'Criminal Case(s)';

    createLegendBar(colorValues,
      colorLabels,
      labelRectSize,
      labelTextOffset,
      labelSpacing,
      legendTitle)

  }// End, if Criminal case(s)
  else if (selectedFeature === 'Education') {

    colorDomain = [
      1,
      2,
      3,
      4];

    colorValues = ['#edf8e9','#bae4b3','#74c476','#238b45'];

    colorLabels = [
      "Others",
      "School",
      "Graduate",
      "Post Graduate"];

    // Define colorscale for constituencies
    colorScale = scaleOrdinal();

    // Set set domain and range of colorscale for constituencies
    colorScale.domain(colorDomain).range(colorValues);

    // Invert the legend bar
    colorValues.reverse();
    colorLabels.reverse();

    legendTitle = 'Education';

    createLegendBar(colorValues,
      colorLabels,
      labelRectSize,
      labelTextOffset,
      labelSpacing,
      legendTitle)
  }// End, if Education
}// End, createScaleAndLegend()


// On click, legend bar
const onColorClick = d => {
  // console.log(d);
  // If constituency is selected, deselect it
  if (selectedConstituency) {
    selectedConstituency = null;
  }
  selectedColorValue = d;
  render();
};

// On click, constituency
const onConstituencyClick = d => {
  // console.log(`const clicked: ${d}`);
  // // If color is selected, deselect it
  if (selectedColorValue) {
    selectedColorValue = null;
  }
  selectedConstituency = d;
  render();
};

// Load external data and boot
LoadNProcData('https://raw.githubusercontent.com/saurabhp75/haryana_maha/master/data/merged_maha_2019.json').then((feature_array) => {
  features = feature_array;
  mahaProcEduFeatures(features);
  partyMap = mahaProcPartyFeatures(features);
  // console.log({partyMap});
  createScaleAndLegend();
  render();
});


const render = () => {
  console.log('render called')

  // Draw map
  constituencyG
    .call(mahaChoroMap, {
      features,
      colorScale,
      selectedColorValue,
      onConstituencyClick,
      selectedConstituency,
      div,
      partyMap,
      selectedFeature
    });

  // Draw legend bar
  legendBodyGSelection
    .call(mahaClrLgnd, {
      colorValues,
      colorLabels,
      labelRectSize,
      labelSpacing,
      labelTextOffset,
      onColorClick,
      selectedColorValue,
      selectedConstituency,
      selectedFeature
    });

  // Update info panel text
  infoPanelGMerge
    .call(mahaInfoPanel, {
      selectedConstituency,
      selectedColorValue,
      features,
      colorValues,
      colorLabels,
      selectedFeature
    });

} // End of render()


