import {
  select,
  geoPath,
  geoMercator,
  format
  // format
} from 'd3';
import { getSvgDimensions } from './miscUtils';

// console.log(`${getSvgDimensions()}`)

//Set map and projection
const projection = geoMercator().scale(4500)
  .center([76.3, 19.8])
  .translate([getSvgDimensions().width / 2, getSvgDimensions().height / 2]);

const pathGenerator = geoPath().projection(projection);

const constituencyAssetsColor = (d, colorScale, selectedConstituency) => {
  let constColor;

  if (!d.properties.Assets_num) { constColor = "black"; }
  else if (selectedConstituency === d.properties.ASM_NAME) { constColor = 'yellow'; }
  else { constColor = colorScale(d.properties.Assets_num); }

  return constColor;
}

const constituencyAssetsOpacity = (d, selectedConstituency, selectedColorValue, colorScale) => {
  // If a color is selected and constituency color is not equal to selected color,
  // then reduce the opacity
  let opacity;

  if (selectedColorValue) {

    if (selectedColorValue != colorScale(d.properties.Assets_num)) {
      opacity = 0.2;
    }
    else opacity = 1;

    if (d.properties.Assets_num === null) {
      opacity = 0.2;
    }

  } else {
    opacity = 1;
  }

  return opacity;
}

const constituencyEducationColor = (d, colorScale, selectedConstituency) => {
  let constColor;

  // console.log({d})

  if (d.properties.Criminal_C === null) {
    // console.log(d.properties.PC_NAME_x, d.properties.Criminal_C);
    constColor = "black";
  }
  else if (selectedConstituency === d.properties.ASM_NAME) { constColor = 'yellow'; }
  else { constColor = colorScale(d.properties.edu); }

  return constColor;
}

const constituencyEducationOpacity = (d, selectedConstituency, selectedColorValue, colorScale) => {
  // If a color is selected and constituency color is not equal to selected color,
  // then reduce the opacity
  let opacity;

  if (selectedColorValue) {

    if (selectedColorValue != colorScale(d.properties.edu)) {
      opacity = 0.2;
    }
    else opacity = 1;

    if (d.properties.edu === 0) {
      opacity = 0.2;
    }

  } else {
    opacity = 1;
  }

  return opacity;
}

const constituencyCriminalColor = (d, colorScale, selectedConstituency) => {
  let constColor;

  // console.log({d})

  if (d.properties.Criminal_C === null) {
    // console.log(d.properties.PC_NAME_x, d.properties.Criminal_C);
    constColor = "black";
  }
  else if (selectedConstituency === d.properties.ASM_NAME) { constColor = 'yellow'; }
  else { constColor = colorScale(d.properties.Criminal_C); }

  return constColor;
}

const constituencyCriminalOpacity = (d, selectedConstituency, selectedColorValue, colorScale) => {
  // If a color is selected and constituency color is not equal to selected color,
  // then reduce the opacity
  let opacity;

  if (selectedColorValue) {

    if (selectedColorValue != colorScale(d.properties.Criminal_C)) {
      opacity = 0.2;
    }
    else opacity = 1;

    if (d.properties.Criminal_C === null) {
      opacity = 0.2;
    }

  } else {
    opacity = 1;
  }

  return opacity;
}

// function returning constituency color
const constituencyPartyColor = (d, colorScale, selectedConstituency, partyMap) => {
  let constColor;
  // console.log({d})

  if (d.properties.Party === null || d.properties.Party === "") {
    // console.log(d.properties.PC_NAME_x, d.properties.Criminal_C);
    // console.log({ d });
    constColor = "black";
  }
  else if (selectedConstituency === d.properties.ASM_NAME) { constColor = 'yellow'; }
  else if (partyMap.hasOwnProperty(d.properties.Party)) {
    console.log(d.properties.Party)
    constColor = colorScale(d.properties.Party);
  } else {
    // console.log({d})
    constColor = colorScale('Others');
  }

  return constColor;
}

const constituencyPartyOpacity = (d, selectedConstituency, selectedColorValue, colorScale, partyMap) => {
  let opacity;

  if (selectedColorValue) //color is selected
  {
    if (selectedColorValue != colorScale('Others')) // selected color is not other
    {
      if (partyMap.hasOwnProperty(d.properties.Party)) //if constituency's party is in list
      {
        if (selectedColorValue == colorScale(d.properties.Party)) {
          opacity = 1;
        }
        else {
          opacity = 0.2;
        }
      }
      else // if constituency's party is not in the list
      {
        opacity = 0.2
      }

    } // select color != "Other"
    else // selected color is "Other"
    {
      if (partyMap.hasOwnProperty(d.properties.Party)) {
        opacity = 0.2;
      }
      else {
        opacity = 1;
      }

      // handle missing values
      if (d.properties.Party === "") { opacity = 0.2; }
    }
  } // if color is selected
  else //no color selected
  {
    opacity = 1;
  }

  return opacity;
}

// Draw the map from constituencyG passed as 'selection'
export const mahaChoroMap = (selection, props) => {
  console.log('choroplethMap called');
  const {
    features,
    colorScale,
    selectedColorValue,
    onConstituencyClick,
    selectedConstituency,
    div,
    partyMap,
    selectedFeature
  } = props;

  const constituencyPaths = selection.selectAll("path").data(features, d => d.properties.ASM_NAME);
  // console.log({partyMap});

  const constituencyPathsEnter = constituencyPaths.enter()
    .append("path")
    .attr('class', 'constituency')
    .attr("d", pathGenerator)

  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  // @@@@@@@@@@ call appropriate method @@@@@@@@@@@@@@@@@@@@@@@@
  // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

  if (selectedFeature === 'Top parties') {

    // console.log('if: Party');

    constituencyPathsEnter.merge(constituencyPaths)
      .attr("fill", d => {
        return constituencyPartyColor(d, colorScale, selectedConstituency, partyMap)
      })
      .attr('opacity', d => constituencyPartyOpacity(d, selectedConstituency, selectedColorValue, colorScale, partyMap))
      .classed('highlighted', d =>
        (selectedColorValue && selectedColorValue === colorScale(d.properties.Party))
      )
      .on('click', d => onConstituencyClick(
        d.properties.ASM_NAME === selectedConstituency
          ? null
          : d.properties.ASM_NAME
      )
      )
      //Adding mouseevents
      .on("mouseover", (d) => {
        div.transition().duration(300)
          .style("opacity", 0.7)
        div.html(
          "<p><strong>" + d.properties.ASM_NAME + "</strong></p>" +
          "<table><tbody><tr><td class='wide'>MLA:</td><td>" + d.properties.Candidate + "</td></tr>" +
          "<tr><td>Party:</td><td>" + d.properties.Party + "</td></tr>" +
          "</td></tr></tbody></table>"
        )
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 30) + "px");
      })
      .on("mouseout", function () {
        div.transition().duration(300)
          .style("opacity", 0);
      });
  } // end if selectedFeature === 'Party'
  else if (selectedFeature === 'Assets') {
    // console.log('if: Assets');

    constituencyPathsEnter.merge(constituencyPaths)
      .attr("fill", d => constituencyAssetsColor(d, colorScale, selectedConstituency))
      .attr('opacity', d => constituencyAssetsOpacity(d, selectedConstituency, selectedColorValue, colorScale))
      .classed('highlighted', d =>
        (selectedColorValue && selectedColorValue === colorScale(d.properties.Assets_num))
      )
      .on('click', d => onConstituencyClick(
        d.properties.ASM_NAME === selectedConstituency
          ? null
          : d.properties.ASM_NAME
      )
      )
      //Adding mouseevents
      .on("mouseover", (d) => {
        div.transition().duration(300)
          .style("opacity", 0.7)
        div.html(
          "<p><strong>" + d.properties.ASM_NAME + "</strong></p>" +
          "<table><tbody><tr><td class='wide'>MLA:</td><td>" + d.properties.Candidate + "</td></tr>" +
          "<tr><td>Assets:</td><td>₹" + format(",.2r")(d.properties.Assets_num) + "</td></tr>" +
          "<tr><td>Party:</td><td>" + d.properties.Party + "</td></tr>" +
          "</td></tr></tbody></table>"
        )
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 30) + "px");
      })
      .on("mouseout", function () {
        div.transition().duration(300)
          .style("opacity", 0);
      });
  }
  else if (selectedFeature === 'Criminal Case(s)') {

    // console.log('if: Criminal case(s)');

    constituencyPathsEnter.merge(constituencyPaths)
      .attr("fill", d => {
        return constituencyCriminalColor(d, colorScale, selectedConstituency)
      })
      .attr('opacity', d => constituencyCriminalOpacity(d, selectedConstituency, selectedColorValue, colorScale))
      .classed('highlighted', d =>
        (selectedColorValue && selectedColorValue === colorScale(d.properties.Criminal_C))
      )
      .on('click', d => onConstituencyClick(
        d.properties.ASM_NAME === selectedConstituency
          ? null
          : d.properties.ASM_NAME
      )
      )
      //Adding mouseevents
      .on("mouseover", (d) => {
        div.transition().duration(300)
          .style("opacity", 0.7)
        div.html(
          "<p><strong>" + d.properties.ASM_NAME + "</strong></p>" +
          "<table><tbody><tr><td class='wide'>MLA:</td><td>" + d.properties.Candidate + "</td></tr>" +
          "<tr><td>Criminal case(s):</td><td>" + d.properties.Criminal_C + "</td></tr>" +
          "<tr><td>Party:</td><td>" + d.properties.Party + "</td></tr>" +
          "</td></tr></tbody></table>"
        )
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 30) + "px");
      })
      .on("mouseout", function () {
        div.transition().duration(300)
          .style("opacity", 0);
      });

  } //If criminal case(s)
  else if (selectedFeature === 'Education') {

    // constituencyPathsEnter.append('title').text(hoverText);
    constituencyPathsEnter.merge(constituencyPaths)
      .attr("fill", d => {
        return constituencyEducationColor(d, colorScale, selectedConstituency)
      })
      .attr('opacity', d => constituencyEducationOpacity(d, selectedConstituency, selectedColorValue, colorScale))
      .classed('highlighted', d =>
        (selectedColorValue && selectedColorValue === colorScale(d.properties.edu))
      )
      .on('click', d => onConstituencyClick(
        d.properties.ASM_NAME === selectedConstituency
          ? null
          : d.properties.ASM_NAME
      )
      )
      //Adding mouseevents
      .on("mouseover", (d) => {
        div.transition().duration(300)
          .style("opacity", 0.7)
        div.html(
          "<p><strong>" + d.properties.ASM_NAME + "</strong></p>" +
          "<table><tbody><tr><td class='wide'>MLA:</td><td>" + d.properties.Candidate + "</td></tr>" +
          "<tr><td>Education:</td><td>" + d.properties.Education + "</td></tr>" +
          "<tr><td>Party:</td><td>" + d.properties.Party + "</td></tr>" +
          "</td></tr></tbody></table>"
        )
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 30) + "px");
      })
      .on("mouseout", function () {
        div.transition().duration(300)
          .style("opacity", 0);
      });
  } // If Education
}