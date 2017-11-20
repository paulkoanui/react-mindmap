// import { categoryToIMG } from '../parser/emojis';

/*
 * Return the HTML representation of a node.
 * The node is an object that has text, url, and category attributes;
 * all of them optional.
 */
export default (node, moveNode) => {
  let href = `href="${node.url}"`;
  // let emoji = categoryToIMG(node.category);

  // If url is not specified remove the emoji and the href attribute,
  // so that the node isn't clickable, and the user can see that without
  // having to hover the node.
  if (!node.url) {
    href = '';
    // emoji = '';
  }

  // return `<a id="node-${node.index}" ${href}>${node.title || ''} ${emoji}</a>`;

  // return `<div id="node-${node.index}" class="ref-el"><map-node></map-node></div>`;

  let title;
  if (href) {
    title = `<a ${href} title="Go to Link">${node.title || ''} <text class="ui small external icon">&#xf08e</text></a>`;
  } else {
    title = `${node.title || ''}`;
  }

  // node.dimmed = 'dimmed';
  // console.log('canMove: ' + (node.id == moveNode));

  return `
<div class="${['ui', (node.color || ''), 'message', (node.dimmed || '')].join(' ')}">
  <div class="">
    <div class="ui tiny header">
      ${title || ''}
    </div>
    <div class="ui top attached mini icon buttons" data-node-id="${node.text}">
      <div class="ui button explore-topic" title="Explore attached resources"><span><text class="ui expand icon">&#xf065</text></span></div>
      <div class="ui button like-topic" title="Like this topic"><span><text class="ui empty heart icon">&#xf08a</text></span></div>
      <div class="ui button share-topic" title="Share this topic"><span><text class="ui share alternate icon">&#xf1e0</text></span></div>
      <div class="ui button add-topic" title="Add a related topic"><span><text class="ui plus icon">&#xf067</text></span></div>
      <div class="ui ${(node.id === moveNode) ? 'primary' : ''} button move-node ${(node.isOwner) ? '' : 'no-move'}" title="Move this topic node"><span><text class="ui move icon">&#xf047</text></span></div>
    </div>
    <div class="ui primary bottom attached center aligned mini button ${(node.id === moveNode) ? '' : 'no-move'}" title="Move this topic node"><span><text class="ui move icon">&#xf047</text></span><span>&nbsp;&nbsp;move</span></div>
  </div>
</div>
`;

  // return title;
//   return `
//   <div style="display: block;">
//   <div class="ui tiny header">
//     <div class="inner">${title || ''}</div>
//   </div>
//   </div>
// `;
};
