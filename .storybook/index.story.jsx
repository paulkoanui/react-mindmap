import React from 'react';
import { storiesOf } from '@kadira/storybook';
import { MindMapEditContainer } from '../src/MindMap';

const render = (path, editable) => {
  const map = require(`./maps-parsed/${path}`);

  return (
  <div>
    <MindMapEditContainer
      connections={map.connections}
      nodes={map.nodes}
      subnodes={map.subnodes}
      editable={editable}
    />
  </div>
  );
};

storiesOf('maps', module)
  .add('devops', () => render('programming/devops.json'))
  .add('interviews', () => render('programming/programming-interviews.json'))
  .add('map', () => render('map.json'))
  .add('python', () => render('python.json'));

storiesOf('editable', module)
  .add('true', () => render('python.json', true))
  .add('false', () => render('python.json', false));
