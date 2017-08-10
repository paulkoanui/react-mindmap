import React from 'react';
import { storiesOf } from '@kadira/storybook';
import { MindMap, MindMapEditContainer } from '../src/MindMap';

const render = (path, editable) => {
  const map = require(`./maps-parsed/${path}`);
  if (editable){
    return (
      <MindMapEditContainer
        connections={map.connections}
        nodes={map.nodes}
        subnodes={map.subnodes}
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
  .add('bnf', () => render('sample1.json', false))
  .add('no-xy', () => render('no-xy.json', false))
  .add('devops-readonly', () => render('programming/devops.json', false))
  .add('devops-edit', () => render('programming/devops.json', true))
  .add('interviews-readonly', () => render('programming/programming-interviews.json', false))
  .add('interviews-edit', () => render('programming/programming-interviews.json', true))
  .add('map-readonly', () => render('map.json', false))
  .add('map-edit', () => render('map.json', true))
  .add('python', () => render('python.json', false))
  .add('python-edit', () => render('python.json', true))
  .add('render-issue', () => render('render-issue.json', true));
