// import { getBgRectangleDimensions } from './miscUtils';

export const mahaClrLgnd = (selection, props) => {
  // console.log('colorLegend called');
  const { colorValues, // Array of colors
    colorLabels, //Tile labels array
    labelRectSize, //size of color tiles
    labelSpacing, //spacing between color tiles
    labelTextOffset, //spacing between tile and label text
    onColorClick,
    selectedColorValue, // selected color value
    selectedConstituency // selected constituency
  } = props;
  
  // remove all ticks
  selection.selectAll('.tick').remove();

  // Add elements in legend body
  const groups = selection.selectAll('.tick').data(colorValues);

  // remove previuosly added elements('tick')
  groups.exit().remove();

  // Create one group for each color
  const groupsEnter = groups.enter().append('g').attr('class', 'tick');

  // Append/Update the label/color groups
  groupsEnter
    .merge(groups)
    .attr('transform', (d, i) => `translate(0, ${i * labelSpacing})`)
    .attr('opacity', d => {
      return ((!selectedColorValue || d === selectedColorValue) || selectedConstituency)
        ? 1
        : 0.2
    })
    .on('click', d => onColorClick(
      d === selectedColorValue
        ? null
        : d
    ));

  // Add the tiles
  groupsEnter.append('rect')
    .merge(groups.select('rect'))
    .attr('fill', (d, i) => colorValues[i])
    .attr('width', labelRectSize)
    .attr('height', labelRectSize);

  // console.log({colorValues, labelRectSize})

  // Add the text
  groupsEnter.append('text')
    .merge(groups.select('text'))
    .text((d, i) => colorLabels[i])
    .attr('dy', '1.2em')
    .attr('x', labelTextOffset);
};