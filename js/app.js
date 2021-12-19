(function (app) {
  const apiBaseUrl = 'https://www.swapi.tech/api/'
  const personProperties = {
    name: ["Name",""],
    gender: ["Gender",""],
    hair_color: ["Hair Color",""],
    eye_color: ["Eye Color",""],
    skin_color: ["Skin Color",""],
    height: ["Height","cm"],
    mass: ["Weight","kg"],
    birth_year: ["Birth Year",""]
  };
  app.pageVars = {}
  app.peopleStart = async function() {
    app.pageVars.params = new URLSearchParams(document.location.search);
    app.pageVars.loadingModal = document.getElementById('loadingModal');
    app.pageVars.contentContainer = document.getElementById('content-container');
    app.pageVars.detailsContainer = document.getElementById('details-container');

    const personCard = document.querySelectorAll('.person-card');

    if (!app.pageVars.params.get('page')) {
      document.location.search = 'page=1';
    }

    if (app.pageVars.params.get('page') === '1') {
      document.getElementById('back').style.visibility = 'hidden';
    }

    const pageNumber = parseInt(app.pageVars.params.get('page'));
    const people = await getList('people', pageNumber);
    for (let i = 0; i < personCard.length; i++) {
      personCard[i].innerText = people[i].name;
      personCard[i].id = people[i].uid;
      personCard[i].addEventListener('click', showDetails);
    }

    formatNamesWithBreaks(personCard);
    setupButtons();
    hideLoader();
  }

  async function showDetails(e) {
    app.pageVars.loadingModal.style.display = 'flex';
    app.pageVars.contentContainer.style.display = 'none';
    const uid = parseInt(e.target.id);
    const details = await getDetails('people', uid);
    getDetailsHtml(details);

    app.pageVars.loadingModal.style.display = 'none';
    app.pageVars.contentContainer.style.display = 'none';
    app.pageVars.detailsContainer.style.display = 'flex';
    setTimeout(() => {
      app.pageVars.detailsContainer.parentElement.addEventListener('click', hideDetails);
    }, 50);
  }

  function getDetailsHtml(details) {
    const fragment = document.createDocumentFragment();

    const h2 = document.createElement('h2');
    h2.innerText = details.properties.name;
    h2.classList.add('details-name');
    fragment.appendChild(h2);

    const table = document.createElement('table');
    const tbody = document.createElement('tbody');

    const properties = personProperties;

    for (const prop in properties) {
      console.log(prop);
      console.log(properties[prop][0])

      const tr = document.createElement('tr');
      const tdLabel = document.createElement('td');
      tdLabel.classList.add('label');
      tdLabel.innerText = properties[prop][0];
      tr.appendChild(tdLabel);

      const tdData = document.createElement('td');
      tdData.innerText = `${details.properties[prop]} ${properties[prop][1]}`
      tr.appendChild(tdData);
      tbody.appendChild(tr);
    }

    table.appendChild(tbody);
    fragment.appendChild(table);
    app.pageVars.detailsContainer.innerHTML = '';
    app.pageVars.detailsContainer.appendChild(fragment);
  }

  function hideLoader() {
    app.pageVars.loadingModal.style.display = 'none';
    app.pageVars.contentContainer.style.display = 'flex';
  }

  function hideDetails() {
    app.pageVars.detailsContainer.style.display = 'none';
    app.pageVars.contentContainer.style.display = 'flex';
    app.pageVars.detailsContainer.parentElement.removeEventListener('click', hideDetails);
  }

  function setupButtons() {
    const nextButton = document.getElementById('next');
    const previousButton = document.getElementById('back');
    nextButton.addEventListener('click', nextPage);
    previousButton.addEventListener('click', previousPage);
  }

  function nextPage(e) {
    const nextPageNum = parseInt(app.pageVars.params.get('page')) + 1;
    document.location.search = `page=${nextPageNum}`;
  }

  function previousPage(e) {
    const previousPageNum = parseInt(app.pageVars.params.get('page')) - 1;
    document.location.search = `page=${previousPageNum}`;
  }

  function formatNamesWithBreaks(elements) {
    elements.forEach((el) => {
      el.innerHTML = el.innerText.split(' ').join('<br>');
    });
  }
  
  async function getList(type, pageNumber) {
    if (sessionStorage.getItem(`${type}-${pageNumber}`)) {
      const data = sessionStorage.getItem(`${type}-${pageNumber}`);
      return JSON.parse(data);
    }

    const data = await getListFromApi(type, pageNumber);
    sessionStorage.setItem(`${type}-${pageNumber}`, JSON.stringify(data.results));
    return data.results;
  }

  async function getListFromApi(type, pageNumber) {
    return fetch(`${apiBaseUrl}${type}?page=${pageNumber}&limit=10`)
    .then(response => {
      return response.json();
    })
    .then(data => {
      return data;
    });
  }

  async function getDetails(type, uid) {
    if (sessionStorage.getItem(`${type}-uid${uid}`)) {
      const data = sessionStorage.getItem(`${type}-uid${uid}`);
      return JSON.parse(data);
    }

    const data = await getDetailsFromApi(type, uid);
    sessionStorage.setItem(`${type}-uid${uid}`, JSON.stringify(data.result));
    return data.result;
  }

  async function getDetailsFromApi(type, uid) {
    return fetch(`${apiBaseUrl}${type}/${uid}`)
    .then(response => {
      return response.json();
    })
    .then(data => {
      return data;
    });
  }
})(window.app = window.app || {});