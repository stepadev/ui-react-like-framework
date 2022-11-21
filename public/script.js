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

function app({state}) {
  const app = document.createElement('div');
  app.className = 'app';
  
  app.append(header());
  app.append(main(state));
  
  return app;
}

function header() {
  const header = document.createElement('header');
  header.className = 'header';
  
  const headerContainer = document.createElement('div');
  headerContainer.classList.add('header__container', '_container');
  
  header.append(headerContainer);
  headerContainer.append(headerLogo());
 
  return header;
}

function headerLogo() {
  const headerLogo = document.createElement('a');
  headerLogo.href = '#';
  headerLogo.className = 'header__logo';
  headerLogo.innerText = 'Relvise';
  
  return headerLogo;
}

function main(state) {
  const main = document.createElement('main');
  main.className = 'page';
  
  const pageMainBlock = document.createElement('div');
  pageMainBlock.classList.add('page__main-block', 'main-block');
 
  const mainBlockContainer = document.createElement('div');
  mainBlockContainer.classList.add('main-block__container', '_container');
  
  const mainBlockBody = document.createElement('div');
  mainBlockBody.className = 'main-block__body';
  
  main.append(pageMainBlock);
  pageMainBlock.append(mainBlockContainer);
  mainBlockContainer.append(mainBlockBody);
  mainBlockBody.append(clock({time: state.time}));
  mainBlockBody.append(lots({lots: state.lots}));
  
  return main;
}

function clock({time}) {
  const node = document.createElement('div');
  node.classList.add('clock', '_inner-style');
  
  const value = document.createElement('span');
  value.className = 'value';
  value.innerText = time.toLocaleTimeString();
  node.append(value);

  const icon = document.createElement('span');
  if (time.getHours() >= 7 && time.getHours() <= 21) {
    icon.className = 'icon day';
  } else {
    icon.className = 'icon night';
  }
  node.append(icon);

  return node;
} 

function loading() {
  const node = document.createElement('p');
  node.className = 'loading';
  node.innerText = 'Loading...';
  return node;
}

function lots({lots}) {
  if (lots === null) {
    return loading();
  }

  const list = document.createElement('div');
  list.className = 'lots';
 
  lots.forEach(lot => {
    list.append(createLot({lot}))
  });
 
  return list;
}

function createLot({lot}) {
  const node = document.createElement('article');
  node.classList.add('lot', '_inner-style');
  
  const price = document.createElement('div');
  price.className = 'price';
  price.innerText = lot.price;
  node.append(price);
  
  const name = document.createElement('h1');
  name.innerText = lot.name;
  node.append(name);
  
  const description = document.createElement('p');
  description.innerText = lot.description;
  node.append(description);
  
  return node;
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

// newDomElements -> virtual DOM
// currentDomElements -> real DOM

function render(newDomElements, currentDomElements) {
  const newDomElementsRoot = document.createElement(currentDomElements.tagName);
  newDomElementsRoot.id = currentDomElements.id;
  newDomElementsRoot.append(newDomElements);

  sync(newDomElementsRoot, currentDomElements);
}

function sync(newNode, currentNode) {

  // Sync elements

  if (newNode.id !== currentNode.id) {
    currentNode.id = newNode.id;
  }

  if (newNode.className !== currentNode.className) {
    currentNode.className = newNode.className;
  }

  if (newNode.attributes) {
    Array.from(newNode.attributes).forEach((attr) => {
      currentNode[attr.name] = attr.value;
    });
  }

  if (newNode.nodeValue !== currentNode.nodeValue) {
    currentNode.nodeValue = newNode.nodeValue;
  }

  currentNode.innerHTML = '';

  // Sync child nodes

  const newChildren = newNode.childNodes;

  for (let i = 0; i < newChildren.length; i++) {
    const newElement = newChildren[i];

    // Add
    let curElement;
    if (newElement.nodeType === Node.TEXT_NODE) {
      curElement = document.createTextNode('');
    } else {
      curElement = document.createElement(newElement.tagName);
    }

    sync(newElement, curElement);

    currentNode.appendChild(curElement);
  }
  
}

