const api = {
  get(url) {
    switch (url) {
      case '/lots':
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve([
              {
                id: 1,
                name: 'Fender',
                description: 'Fender description',
                price: 1600
              },
              {
                id: 2,
                name: 'Gibson',
                description: 'Gibson description',
                price: 4100
              }
            ]);
          }, 1000);
        });
      default:
        throw new Error('Unknown endpoint');  
    }
  }
}

const stream = {
  subscribe(channel, listener) {
    const match = /price-(\d+)/.exec(channel);
    if (match) {
      setInterval(() => {
        listener({
          id: parseInt(match[1]),
          price: Math.round((Math.random() * 10000 + 820))
        })
      }, 4000);
    }
  }
}

let state = {
  time: new Date(),
  lots: null
}

function wrapper(props) {
  return {
    type: 'div',
    props: {
      className: props.className,
      children: props.children
    }
  }
}

function app({state}) {
  return {
    type: 'div',
    props: {
      className: 'app',
      children: [
        {
          type: header,
          props: {}
        },
        {
          type: main,
          props: {time: state.time, lots: state.lots}
        }
      ]
    }
  }
}

function header() {
  return {
    type: 'header',
    props: {
      className: 'header',
      children: [
        {
          type: wrapper,
          props: {
            className: 'header__container _container',
            children: [
              {
                type: headerLogo,
                props: {},
              }
            ]
          }
        }   
      ]
    }
  }
}

function headerLogo() {
  return {
    type: 'a',
    props: {
      href: '#',
      className: 'header__logo',
      children: [
        'Relvise'
      ]
    }
  }
}

function main(state) {
  return {
    type: 'main',
    props: {
      className: 'page',
      children: [
        {
          type: wrapper,
          props: {
            className: 'page__main-block main-block',
            children: [
              {
                type: wrapper,
                props: {
                  className: 'main-block__container _container',
                  children: [
                    {
                      type: wrapper,
                      props: {
                        className: 'main-block__body',
                        children: [
                          {
                            type: clock,
                            props: {time: state.time},
                          },
                          {
                            type: lots,
                            props: {lots: state.lots},
                          }
                        ]
                      }
                    }   
                  ]
                }
              }   
            ]
          }
        }   
      ]
    }
  }
}

function clock({time}) {
  const isDay = time.getHours() >= 7 && time.getHours() <= 21;
  return {
    type: 'div',
    props: {
      className: 'clock _inner-style',
      children: [
        {
          type: 'span',
          props: {
            className: 'value',
            children: [
              time.toLocaleTimeString()
            ]
          }
        },
        {
          type: 'span',
          props: {
            className: isDay ? 'icon day' : 'icon night',
          }
        }
      ]
    }
  }
} 

function loading() {
  return {
    type: 'p',
    props: {
      className: 'loading',
      children: [
        'Loading...'
      ]
    }
  }
}

function lots({lots}) {
  if (lots === null) {
    return {
      type: loading,
      props: {}
    }
  }

  return {
    type: 'div',
    props: {
      className: 'lots',
      children: lots.map((lot) => ({
        type: createLot,
        props: {lot}
      }))
    }
  }
}

function createLot({lot}) {
  return {
    type: 'article',
    key: lot.id,
    props: {
      className: 'lot _inner-style',
      children: [
        {
          type: 'div',
          props: {
            className: 'price',
            children: [
              lot.price
            ]
          },
        },
        {
          type: 'h1',
          props: {
            children: [
              lot.name
            ],
          },
        },
        {
          type: 'p',
          props: {
            children: [
              lot.description
            ],
          },
        }
      ]
    }
  }
}

function renderApp(state) {
  render(
    app({state}), 
    document.getElementById('root')
  );
}

renderApp(state);

// ------------- Dynamics-emulate ----------------

setInterval(() => {
  state = {
    ...state,
    time: new Date()
  }

  renderApp(state);
}, 1000);

api.get('/lots').then((lots) => {
  state = {
    ...state,
    lots
  }
  renderApp(state);

  const onPrice = (data) => {
    state = {
      ...state,
      lots: state.lots.map((lot) => {
        if (lot.id === data.id) {
          return {
            ...lot,
            price: data.price
          }
        }
        return lot;
      })
    }
    renderApp(state);
  }

  lots.forEach((lot) => {
    stream.subscribe(`price-${lot.id}`, onPrice);
  });
});

// ------------------- Render ---------------------

function render(virtualDom, realDomRoot) {
  const evaluatedVirtualDom = evaluate(virtualDom);

  const virtualDomRoot = {
    type: realDomRoot.tagName.toLowerCase(),
    props: {
      id: realDomRoot.id,
      children: [
        evaluatedVirtualDom
      ]
    },
  }

  sync(virtualDomRoot, realDomRoot);
}

function evaluate (virtualNode) {
  if (typeof virtualNode !== 'object') {
    return virtualNode;
  }

  if (typeof virtualNode.type === 'function') {
    return evaluate((virtualNode.type)(virtualNode.props));
  }

  const props = virtualNode.props || {};

  return {
    ...virtualNode,
    props: {
      ...props,
      children: Array.isArray(props.children) ? props.children.map(evaluate) : [evaluate(props.children)]
    }
  }
}

function sync(virtualNode, realNode) {

  // Sync elements
  if (virtualNode.props) {
    Object.entries(virtualNode.props).forEach(([name, value]) => {
      if (name === 'key' || name === 'children') {
        return
      }
      if (realNode[name] !== value) {
        realNode[name] = value;
      }
    });
  }

  if (virtualNode.key) {
    realNode.dataset.key = virtualNode.key;
  }

  if (typeof virtualNode !== 'object' && virtualNode !== realNode.nodeValue) {
    realNode.nodeValue = virtualNode;
  }

  // Sync child nodes
  const virtualChildren = virtualNode.props ? virtualNode.props.children || [] : [];
  const realChildren = realNode.childNodes;

  for (let i = 0; i < virtualChildren.length || i < realChildren.length; i++) {
    const virtual = virtualChildren[i];
    const real = realChildren[i];
    
    // Remove
    if (virtual === undefined && real !== undefined) {
      realNode.remove(real);
    }

    if (virtual !== undefined && real !== undefined && (virtual.type || '') === (real.tagName || '').toLowerCase()) {
      sync(virtual, real);
    }

    if (virtual !== undefined && real !== undefined && (virtual.type || '') !== (real.tagName || '').toLowerCase()) {
      const newReal = createRealNodeByVirtual(virtual);
      sync(virtual, newReal);
      realNode.replaceChild(newReal, real);
    }
    
    // Add
    if (virtual !== undefined && real === undefined) {
      const newReal = createRealNodeByVirtual(virtual);
      sync(virtual, newReal);
      realNode.appendChild(newReal);
    }
  }  
}

function createRealNodeByVirtual(virtual) {
  if (typeof virtual !== 'object') {
    return document.createTextNode('');
  }

  return document.createElement(virtual.type);
}