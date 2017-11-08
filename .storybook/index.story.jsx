import React from 'react';
import { storiesOf } from '@kadira/storybook';
import { MindMap, MindMapEditContainer } from '../src/MindMap';

const render = (path, editable) => {
  const mapIn = require(`./maps-parsed/${path}`);
  var map = {
    id: mapIn.id,
    title: mapIn.title,
    tag: mapIn.tag,
    connections: [],
    nodes: []
  };
  Object.getOwnPropertyNames(mapIn.nodes).forEach(function(node){
    map.nodes.push(mapIn.nodes[node]);
  });
  Object.getOwnPropertyNames(mapIn.connections).forEach(function(conn){
    map.connections.push(mapIn.connections[conn]);
  });
  const handlers = {
    handleUpdate: function(props){
      console.log('external handleUpdate:', props);
    },
    handleAdd: function(props){
      console.log('external handleAdd:', props);
    },
    handleDelete: function(props){
      console.log('external handleDelete:', props);
    },
    handleSelect: function(props){
      console.log('external handleSelect:', props);
    }
  }
  if (editable){
    return (
      <MindMapEditContainer
        connections={map.connections}
        nodes={map.nodes}
        subnodes={map.subnodes}
        handlers={handlers}
      />
    );
  }else{
    return (
      <MindMap
        connections={map.connections}
        nodes={map.nodes}
        subnodes={map.subnodes}
        editable={false}
      />
    );
  }
};

storiesOf('examples', module)
  .add('map-edit-new-format', () => render('new-format.json', true));
  // .add('devops-readonly', () => render('programming/devops.json', false))
  // .add('devops-edit', () => render('programming/devops.json', true))
  // .add('interviews-readonly', () => render('programming/programming-interviews.json', false))
  // .add('interviews-edit', () => render('programming/programming-interviews.json', true))
  // .add('map-readonly', () => render('map.json', false))
  // .add('map-edit', () => render('map.json', true))
  // .add('python', () => render('python.json', false))
  // .add('python-edit', () => render('python.json', true));
