import {
  format
} from 'd3';

// const numDifferentiation = (val) => {
//   if(val >= 10000000) val = (val/10000000).toFixed(2) + ' Cr';
//   else if(val >= 100000) val = (val/100000).toFixed(2) + ' Lac';
//   else if(val >= 1000) val = (val/1000).toFixed(2) + ' K';
//   return val;
// }

// Create data rows for infoPanel
const getInfoPanelData = (selectedConstituency, selectedColorValue, features, colorValues, colorLabels, selectedFeature) => {
  // console.log(`getInfoPanelData called::: ${selectedConstituency}:::${selectedColorValue}`);
  if (!selectedConstituency && !selectedColorValue) {
    return ['Click on legend bar or Map'];
  }
  else if (selectedConstituency) {

    const arrItem = features.filter(d => d.properties.ASM_NAME === selectedConstituency);

    const constituency = arrItem[0].properties.ASM_NAME;

    const candidate = arrItem[0].properties.Candidate === null ? "No data" : arrItem[0].properties.Candidate;
    const party = arrItem[0].properties.Party === null? "No data" : arrItem[0].properties.Party;
    const education = arrItem[0].properties.Education === null? "No data" : arrItem[0].properties.Education;
    const criminal = arrItem[0].properties.Criminal_C === null? "No data" : arrItem[0].properties.Criminal_C;
    const assets = arrItem[0].properties.Assets_num ? arrItem[0].properties.Assets_num : "No data";

    // console.log({constituency, candidate, party, assets});

    return ([

      'Constituency: ' + constituency,

      'MLA: ' + candidate,

      'Assets(Rs.): ' + format(",.2r")(assets),
      // 'Assets(Rs.): ' + assets,

      'Criminal case(s): ' + criminal,

      'Education: ' + education,

      'Party: ' + party
    ])
  }
  else if (selectedColorValue) {
    const assetsTextIndex = colorValues.indexOf(selectedColorValue);

    if (selectedFeature === 'Assets') {
      return [`MLA(s) with assets:  ${colorLabels[assetsTextIndex]}`];
    } else if (selectedFeature === 'Criminal Case(s)') {
      return [`MLAs with ${colorLabels[assetsTextIndex]} criminal case(s)`];
    } else if (selectedFeature === 'Education') {
      return [`MLAs with education:  ${colorLabels[assetsTextIndex]}`];
    } else if (selectedFeature === 'Top parties') {
      return [`Constituencies won by: ${colorLabels[assetsTextIndex]}`];
    } else return ['This should not be displayed'];   
    
  }  

}

// Create infoPanel
export const mahaInfoPanel = (selection, props) => {
  // console.log('infoPanel called');
  const {
    selectedConstituency,
    selectedColorValue,
    features,
    colorValues,
    colorLabels,
    selectedFeature
  } = props;

  // Get the data to display on panel
  const textData = getInfoPanelData(selectedConstituency, selectedColorValue, features, colorValues, colorLabels, selectedFeature);

   // remove all existing text
  selection.selectAll('tspan').remove();

  // Data join: tspan<=>textData
  const textRows = selection.selectAll('tspan').data(textData);

  textRows
    .enter()
    .append('tspan')
    .attr('x', '0')
    .attr('dy', '1.5rem')
    .text((d) => d);  

}