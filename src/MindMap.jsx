import React, { Component, PropTypes } from 'react';
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  select,
  zoom,
  zoomIdentity,
} from 'd3';

import {
  d3Connections,
  d3Nodes,
  d3Drag,
  d3PanZoom,
  onTick,
} from './utils/d3';

import Form from "react-jsonschema-form";
import { getDimensions, getViewBox } from './utils/dimensions';
import subnodesToHTML from './utils/subnodesToHTML';
import nodeToHTML from './utils/nodeToHTML';
import '../sass/main.sass';

export class MindMapEditContainer extends React.Component {
  constructor(props) {
    super(props);
    //capture the original map input as base that all edits will be overlayed onto
    this.state = {
      connections: JSON.parse(JSON.stringify(props.connections)) || [],
      nodes: JSON.parse(JSON.stringify(props.nodes)) || [],
      subnodes: [],
      editable: props.editable,
      edits: []
    };

    //attach to the window (i know, i'm in a time crunch)
    window.MindMapEditor = this;
  }

  getEdits(){
    return JSON.parse(JSON.stringify(this.state.edits));
  }

  cleanNodes(fullNodes){
    if (fullNodes){
      const getSubnodes = (subnodes) => {
        if (subnodes){
          return subnodes.map((node) => {
            return {
              text: node.text,
              url: node.url,
              category: node.category,
              note: node.note
            };
          });
        }else{
          return [];
        }
      };
      return fullNodes.map((node) => {
        return {
          text: node.text,
          url: node.url,
          note: node.note,
          category: node.category,
          fx: node.fx,
          fy: node.fy,
          nodes: getSubnodes(node.nodes)
        };
      });
    }else{
      return [];
    }
  }

  cleanConnections(fullConns){
    if (fullConns){
      return fullConns.map((conn) => {
        return {
          source: conn.source.text,
          target: conn.target.text,
          curve: JSON.parse(JSON.stringify(conn.curve))
        };
      });
    }else{
      return [];
    }
  }

  handleUpdate(args){
    this.setState((prevState) => {
      //locate the node we're coming "from"
      var fromNodeIndex = -1;
      var index = 0;
      for (let node of prevState.nodes){
        if (node.text === args.from.text){
          fromNodeIndex = index;
          break;
        }
        index++;
      }
      if (fromNodeIndex != -1){
        //replace the "from" node with the "to" node
        var nodeTo = {};
        this.mergeFormData(nodeTo, args.to);
        var newNodes = this.cleanNodes(JSON.parse(JSON.stringify(prevState.nodes)));
        newNodes.splice(fromNodeIndex, 1, nodeTo);
        var newConnections = this.cleanConnections(JSON.parse(JSON.stringify(prevState.connections)));
        if (args.from.text != args.to.text){
          newConnections.forEach((conn) => {
            if (conn.source === args.from.text){
              conn.source = args.to.text;
            }
            if (conn.target === args.from.text){
              conn.target = args.to.text;
            }
          });
        }
        var newEdits = JSON.parse(JSON.stringify(prevState.edits));
        newEdits.push(args);
        this.props.onEdit &&
        this.props.onEdit(newEdits);
        return { nodes: newNodes, connections: newConnections, edits: newEdits, editDialog: false, lastEdit: new Date().getTime() };
      }
    });
  }

  handleAdd(args){
    this.setState((prevState, props) => {
      //create a new node
      var nodeTo = {};
      var nodeFrom = {};
      this.mergeFormData(nodeTo, args.to);
      this.mergeFormData(nodeFrom, args.from);
      var newNodes = this.cleanNodes(JSON.parse(JSON.stringify(prevState.nodes)));
      var newConnections = this.cleanConnections(JSON.parse(JSON.stringify(prevState.connections)));
      newNodes.push(nodeTo);
      newConnections.push(args.connection);
      var newEdits = JSON.parse(JSON.stringify(prevState.edits));
      newEdits.push(args);
      this.props.onEdit &&
      this.props.onEdit(newEdits);
      return { nodes: newNodes, connections: newConnections, edits: newEdits, editDialog: false, lastEdit: new Date().getTime() };
    });
  }

  handleDelete({ formData }){
    console.log('handleDelete: ', JSON.stringify(formData, null, 2));
  }

  handleSelect(args){
    this.setState({ editDialog: true });
  }

  handleCancel(args){
    this.setState({ editDialog: false });
  }

  mergeFormData(node, formData){
    node.text = formData.text;
    node.url = formData.url;
    node.note = formData.note;
    node.category = formData.category;
    node.nodes = [];
    for(var i = 0; i < formData.related.length; i++){
      var subnode = formData.related[i];
      node.nodes.push({
        text: subnode.text,
        url: subnode.url,
        note: subnode.note,
        category: subnode.category,
        // fx: null,
        // fy: null,
        nodes: []
      });
    }
  }

  render() {
    return <MindMap
      connections={this.state.connections}
      nodes={this.state.nodes}
      subnodes={this.state.subnodes}
      editable={this.state.editable}
      editDialog={this.state.editDialog}
      lastEdit={this.state.lastEdit}
      onUpdate={this.handleUpdate.bind(this)}
      onAdd={this.handleAdd.bind(this)}
      onDelete={this.handleDelete.bind(this)}
      onCancel={this.handleCancel.bind(this)}
      onSelect={this.handleSelect.bind(this)}
    />
  }
}

export default class MindMap extends Component {
  constructor(props) {
    super(props);

    // Create force simulation to position nodes that have no coordinates,
    // and add it to the state.
    const simulation = forceSimulation()
      .force('link', forceLink().id(node => node.text))
      .force('charge', forceManyBody())
      .force('collide', forceCollide().radius(100));

    var editor = {
      formData: {},
      schema: {
        "title": "Topic: python",
        "type": "object",
        "required": [
          "text"
        ],
        "properties": {
          "text": {
            "type": "string",
            "title": "Name"
          },
          "url": {
            "type": "string",
            "title": "Resource URL"
          },
          "category": {
            "type": "string",
            "title": "Resource Category",
            "enum": [
              "",
              "mindmap",
              "wiki",
              "stack exchange",
              "course",
              "free book",
              "non-free book",
              "paper",
              "video",
              "article",
              "blog",
              "github",
              "interactive",
              "image",
              "podcast",
              "newsletter",
              "chat",
              "youtube",
              "reddit",
              "quora"
            ]
          },
          "note": {
            "type": "string",
            "title": "Note"
          },
          "related": {
            "type": "array",
            "title": "Related",
            "items": {
              "type": "object",
              "required": [
                "url",
              ],
              "properties": {
                "text": {
                  "type": "string",
                  "title": "Name"
                },
                "url": {
                  "type": "string",
                  "title": "URL"
                },
                "category": {
                  "type": "string",
                  "title": "Resource Category",
                  "enum": [
                    "",
                    "mindmap",
                    "wiki",
                    "stack exchange",
                    "course",
                    "free book",
                    "non-free book",
                    "paper",
                    "video",
                    "article",
                    "blog",
                    "github",
                    "interactive",
                    "image",
                    "podcast",
                    "newsletter",
                    "chat",
                    "youtube",
                    "reddit",
                    "quora"
                  ]
                },
                "note": {
                  "type": "string",
                  "title": "Note"
                }
              }
            }
          }
        }
      },
      uiSchema: {
        "note": {
          "ui:widget": "textarea"
        },
        "related": {
          "items": {
            "text": {
              "ui:autofocus": true,
              "ui:emptyValue": ""
            },
            "url": {
              "ui:emptyValue": ""
            },
            "category": {
              "ui:emptyValue": ""
            }
          }
        }
      }
    };
    this.state = { simulation, editor };
  }

  /* eslint-disable no-param-reassign */
  /*
   * Generates HTML and dimensions for nodes and subnodes.
   */
  prepareNodes(nodes) {
    const render = (node) => {
      node.html = nodeToHTML(node);
      node.nodesHTML = subnodesToHTML(node.nodes);

      const dimensions = getDimensions(node.html, {}, 'mindmap-node');
      node.width = dimensions.width;
      node.height = dimensions.height;

      const nodesDimensions = getDimensions(node.nodesHTML, {}, 'mindmap-subnode-text');
      node.nodesWidth = nodesDimensions.width;
      node.nodesHeight = nodesDimensions.height;

      node.fx = node.fx || node.x;
      node.fy = node.fy || node.y;
    };

    nodes.forEach(node => render(node))
  }

  onUpdate({formData}){
    var frmStr = JSON.stringify(formData);
    if (frmStr != this.state.editor.formDataOrig){
      this.props.onUpdate &&
      this.props.onUpdate({
        action: 'update',
        from: JSON.parse(this.state.editor.formDataOrig),
        to: formData
      });
    }
  }

  onCancel(){
    this.props.onCancel &&
    this.props.onCancel();
  }

  addNew(){
    var newTopic = prompt("What is the new topic name? A good topic should be described in one or two words.");
    if (newTopic && newTopic.trim()) {

      /*
       when you add a new node, you are peforming an edit that produces a new node and a connection.

       we must record the selected node (this will be the parent)
       then we need to create a new blank node and add it to the
       */
      const conn = { source: this.state.editor.formData.text, target: newTopic, curve: {} };
      const from = JSON.parse(this.state.editor.formDataOrig);
      const to = {
        text: newTopic,
        url: '',
        note: '',
        category: '',
        related: []
      };
      this.props.onAdd &&
      this.props.onAdd({
        action: 'add',
        from: from,
        to: to,
        connection: conn
      });
    }
  }

  deleteSelected(){
    console.log('TODO');
  }

  getFormData(node){
    const getRelated = (subnodes) => {
      if (subnodes){
        return subnodes.map((node) => {
          return {
            text: node.text,
            url: node.url,
            category: node.category || undefined,
            note: node.note
          };
        });
      }else{
        return [];
      }
    };
    return {
      text: node.text,
      url: node.url,
      note: node.note,
      category: node.category || undefined,
      related: getRelated(node.nodes)
    };
  }
  /*
   * Add new class to nodes, attach drag behavior, and start simulation.
   */
  prepareEditor(svg, conns, nodes, subnodes) {
    nodes
      .attr('class', 'mindmap-node mindmap-node--editable')
      .on('dblclick', (node) => {
        node.fx = null;
        node.fy = null;
      })
      .on('click', (node) => {
        this.setState(function(prevState) {
          //build the formData that the user can edit
          var editor = prevState.editor;
          editor.formData = this.getFormData(node);
          editor.schema.title = `Topic: ${editor.formData.text}`;
          editor.formDataOrig = JSON.stringify(editor.formData);
          this.props.onSelect({ editing: true });
          return { editor: editor };
        });
      });

    nodes.call(d3Drag(this.state.simulation, svg, nodes));

    this.state.simulation
      .alphaTarget(0.5).on('tick', () => onTick(conns, nodes, subnodes));
  }
  /* eslint-enable no-param-reassign */

  /*
   * Render mind map using D3.
   */
  renderMap() {
    const svg = select(this.refs.mountPoint);

    // Clear the SVG in case there's stuff already there.
    svg.selectAll('*').remove();

    var connsCopy = this.props.connections;
    var nodesCopy = this.props.nodes;

    // Add subnode group
    svg.append('g').attr('id', 'mindmap-subnodes');
    this.prepareNodes(nodesCopy);

    // Bind data to SVG elements and set all the properties to render them.
    const connections = d3Connections(svg, connsCopy);
    const { nodes, subnodes } = d3Nodes(svg, nodesCopy);
    nodes.append('title').text(node => node.note);

    // Bind nodes and connections to the simulation.
    this.state.simulation
      .nodes(nodesCopy)
      .force('link').links(connsCopy);

    if (this.props.editable) {
      this.prepareEditor(svg, connections, nodes, subnodes);
    }


    // Add pan and zoom behavior and remove double click to zoom.
    if (!this.state.lastEdit || this.props.lastEdit != this.state.lastEdit){

      // Tick the simulation 100 times.
      for (let i = 0; i < 100; i += 1) {
        this.state.simulation.tick();
      }
      onTick(connections, nodes, subnodes);

      svg.attr('viewBox', getViewBox(nodes.data()))
        .call(d3PanZoom(svg))
        .on('dblclick.zoom', null);
      this.state.lastEdit = this.props.lastEdit || new Date().getTime();
    }

    if (this.wrapper){
      this.wrapper.scrollTop = 0;
    }

  }

  componentDidMount() {
    this.renderMap();
  }

  componentDidUpdate() {
    zoom().transform(select(this.refs.mountPoint), zoomIdentity);
    this.renderMap();
  }

  // eslint-disable-next-line class-methods-use-this
  render() {
    return (
      <div>
        <svg className="mindmap-svg" ref="mountPoint" />
        {this.props.editDialog &&
        <div className="mindmap-wrap" ref={(el) => { this.wrapper = el; }}>
          <div>
            <button type="button" onClick={this.addNew.bind(this)}>New Subtopic</button>
            {/*<button type="button" onClick={this.deleteSelected.bind(this)}>Delete this Topic</button>*/}
          </div>
          <Form schema={this.state.editor.schema} uiSchema={this.state.editor.uiSchema} formData={this.state.editor.formData}
                onSubmit={this.onUpdate.bind(this)}>
            <div>
              <button type="submit">Submit</button>
              <button type="button" onClick={this.onCancel.bind(this)}>Cancel</button>
            </div>
          </Form>
        </div>
        }
      </div>
    );
  }
}


MindMap.defaultProps = {
  nodes: [],
  connections: [],
  editable: false,
};

MindMap.propTypes = {
  nodes: PropTypes.array,
  connections: PropTypes.array,
  editable: PropTypes.bool,
};
