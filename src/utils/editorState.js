/*
 This component will be used to maintain user edits.

 When a user edits a mindmap, they are performing an action (add, update, delete)
 on a node at a specific time.

 '/path/to/map': {
   edits: {
    'chronological-id': { id: , action: 'add | update | delete', time: 12345657890, node: {}, msg: 'reason for action' }
   }
 }

 all edits to a mindmap are saved to localstorage so work is retained across page loads.

 "pending" edits can be "deleted" or "submitted"

 "delete" removes the edit from localstorage

 "submit" fires the "submitted" event
 */

var React = require('react');
var LocalStorageMixin = require('react-localstorage');
import Form from "react-jsonschema-form";

var TestComponent = module.exports = React.createClass({
  displayName: 'TestComponent',
  // This is all you need to do
  mixins: [LocalStorageMixin],

  getInitialState: function() {
    return {counter: 0};
  },

  onClick: function() {
    this.setState({counter: this.state.counter + 1});
  },

  render: function() {
    return (<div>HI</div>);
  }
});