const state = {
  time: new Date(),
  lots: [
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
    },
  ]
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

function lots({lots}) {
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

const newDom = app({state});
const domRoot = document.getElementById('root');

render(newDom, domRoot);

function render(newDom, domRoot) {
  domRoot.append(newDom);
}

// ------------------------------------------------------------------
setInterval(() => {
  const time = new Date();

  // const clock = document
  // .getElementById('root')
  // .querySelector('.app > .page > .page__main-block > .main-block__container > .main-block__body > .clock');
  // clock.querySelector('.value').innerText = time.toLocaleTimeString();
  // if (time.getHours() >= 7 && time.getHours() <= 21) {
  //   clock.querySelector('.icon').className = 'icon day';
  // } else {
  //   clock.querySelector('.icon').className = 'icon night';
  // }

  const app = document
  .getElementById('root')
  .querySelector('.app > .page > .page__main-block > .main-block__container > .main-block__body');
  const curClock = app.querySelector('.clock');
  const newClock = clock({time});
  app.replaceChild(newClock, curClock);

}, 1000);