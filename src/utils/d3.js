import { drag, event, zoom } from 'd3';
import { getViewBox } from './dimensions';

/*
 * Bind data to a <TAG> tag, inside a G element, inside the given root element.
 * Root is a D3 selection, data is an object or array, tag is a string.
 */
const bindData = (root, data, tag) => (
  root.append('g')
    .selectAll(tag)
    .data(data)
    .enter()
    .append(tag)
);

/*
 * Bind connections to PATH tags on the given SVG.
 */
export const d3Connections = (svg, connections) => (
  bindData(svg, connections, 'path')
    .attr('class', 'mindmap-connection')
);

/* eslint-disable no-param-reassign */
/*
 * Bind nodes to FOREIGNOBJECT tags on the given SVG,
 * and set dimensions and html.
 */
export const d3Nodes = (svg, nodes) => {
  const selection = svg.append('g')
    .selectAll('foreignObject')
    .data(nodes)
    .enter();

  // const d3nodes = selection
  //   .append('foreignObject')
  //   .attr('class', 'mindmap-node')
  //   .attr('width', node => node.width + 4)
  //   .attr('height', node => node.height)
  //   .html(node => node.html);

  const d3nodes = selection
    .append('foreignObject')
    .attr('class', 'mindmap-node')
    .attr('width', node => node.width)
    .attr('height', node => node.height);

  d3nodes
    .append('xhtml:div')
    .attr('class', 'ref-el')
    // .attr('id', node => `node-${node.id}`)
    .html(node => node.html);

  const d3subnodes = selection.append('foreignObject')
    .attr('class', 'mindmap-subnodes')
    .attr('width', node => node.nodesWidth)
    .attr('height', node => node.nodesHeight)
    .html(subnode => subnode.nodesHTML);

  return {
    nodes: d3nodes,
    subnodes: d3subnodes,
  };
};

/*
 * Callback for forceSimulation tick event.
 */
export const onTick = (conns, nodes, subnodes) => {
  const d = (conn) => {
    conn.curve = conn.curve || {};
    return [
      'M',
      conn.source.x,
      conn.source.y,
      'Q',
      conn.source.x + (conn.curve.x || 0),
      conn.source.y + (conn.curve.y || 0),
      ',',
      conn.target.x,
      conn.target.y,
    ].join(' ');
  };

  // Set the connections path.
  conns.attr('d', d);

  // Set nodes position.
  nodes
    .attr('x', node => node.x - (node.width / 2))
    .attr('y', node => node.y - (node.height / 2));

  // Make sure all nodes have an fx/fy value (to prevent jitter movement of nodes)
  nodes.each((node) => {
    node.fx = (node.fx || node.x) || 0;
    node.fy = (node.fy || node.y) || 0;
  });

  // Set subnodes groups color and position.
  subnodes
    .attr('x', node => node.x + (node.width / 2))
    .attr('y', node => node.y - (node.nodesHeight / 2));
};


/*
 * Return drag behavior to use on d3.selection.call().
 */
export const d3Drag = (simulation, svg, nodes, onSelect, mindMap) => {
  Object.getOwnPropertyNames(nodes).forEach((i) => {
    const node = nodes[i];
    node.fx = node.x || node.fx;
    node.fy = node.y || node.fy;
  });
  const dragStart = (node) => {
    if (node.id === mindMap.state.moveNode) {
      if (!event.active) {
        simulation.alphaTarget(0.2).restart();
      }
      node.fx = node.x || node.fx;
      node.fy = node.y || node.fy;
    }
  };

  const dragged = (node) => {
    if (node.id === mindMap.state.moveNode) {
      node.fx = event.x || event.fx;
      node.fy = event.y || event.fy;
    }
  };

  const dragEnd = (node) => {
    if (node.id === mindMap.state.moveNode) {
      if (!event.active) {
        simulation.alphaTarget(0);
      }

      svg.attr('viewBox', getViewBox(nodes.data()));

      onSelect({
        action: 'move',
        nodeId: node.id,
        loc: { fx: node.fx, fy: node.fy, x: node.x, y: node.y },
      });
    }
  };

  return drag()
    .on('start', dragStart)
    .on('drag', dragged)
    .on('end', dragEnd);
};
/* eslint-enable no-param-reassign */


/*
 * Return pan and zoom behavior to use on d3.selection.call().
 */
/* eslint-disable arrow-parens */
export const d3PanZoom = (el, mindMap) => (zoom().scaleExtent([0.1, 10])
  .on('zoom', (() => {
    mindMap.setState((prevState) => {
      el.selectAll('svg > g').attr('transform', event.transform);
      // el.selectAll('svg > g').attr("transform-origin", "50% 50% 0");
      const editor = prevState.editor;
      editor.lastTransform = event.transform;
      return { editor };
    });
  })));
