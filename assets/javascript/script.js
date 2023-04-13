// ========== API KEY VARIABLES =========== //
let rainforestAPIKey;
let rawgAPIKey;

// ========== MIN/REC ARRAYS =========== //
const neededComponents = [
  'Processor',
  'Memory',
  'Graphics',
  'Storage'
];
let minComponentArray = [];
let recComponentArray = [];
let searchArray;
let searchHistoryLimit = 5;

// ========== ELEMENTS FROM PAGE =========== //
const datalist = document.querySelector('#search-options');
const inputField = document.querySelector('#search-bar input');
const searchButton = document.querySelector('#search-button');



//=====================================================================================
// ========== RAWG API KEY FUNCTION =========== //
// This calls the API, just update the url to have your key's name.
async function fetchKey1() {
  const url = 'https://yorkieportunus.herokuapp.com/store/brogrammers-rawg-api-key'
  const response = await fetch(url);
  const key1 = await response.json();
  return key1;
}
// Call this wherever you need your key.
fetchKey1().then((key1) => {
    rawgAPIKey = key1.apiKey;
});
// ========== RAINFOREST API KEY FUNCTION =========== //     
// This calls the API, just update the url to have your key's name.
 async function fetchKey2() {
   const url = 'https://yorkieportunus.herokuapp.com/store/brogrammers-rainforest -apikey2'
   const response = await fetch(url);
   const key2 = await response.json();
   return key2;
 }
 // Call this wherever you need your key.
 fetchKey2().then((key2) => {
     rainforestAPIKey = key2.apiKey; 
});


//=====================================================================================
// Check Storage/Build Array
function checkStorage() {
  if ( localStorage.getItem('searchHistory') ) {
    const stringArray = localStorage.getItem('searchHistory');
    searchArray = JSON.parse(stringArray);
  } else {
    searchArray = [];
  };
  searchHistoryArrray();
};
checkStorage();
//=========================
// Build From Array
function searchHistoryArrray() {
  const datalist = document.querySelector('#search-options');
  //loops through array from storage, builds options, inserts into database
  for (i=0; i<searchArray.length; i++) {
    const option = document.createElement("option");
    option.value = searchArray[i];
    option.text = searchArray[i];
    datalist.append(option);
  }
};
//=========================
// Add Input Search to History
function addSearchToHistory() {
  const searchTerm = inputField.value.trim();
  //check for duplicates in array
  const index = searchArray.indexOf(searchTerm);
  if (index > -1) {
    searchArray.splice(index, 1);
  };
  //sets input in array
  searchArray.unshift(searchTerm);
  // limit array to 5 items
  if (searchArray.length > searchHistoryLimit) {
    searchArray.pop(); // remove last item
  };

  //check for duplicates in database
  const options = datalist.options;
  for (let i = 0; i < options.length; i++) {
    if (options[i].value === searchTerm) {
      const datalist = document.querySelector('#search-options');
      const optionToRemove = datalist.querySelector(`option[value="${searchTerm}"]`);
      datalist.removeChild(optionToRemove);
      break;
    };
  };
  //builds option and insert into database
  const option = document.createElement("option");
  option.value = searchTerm;
  option.text = searchTerm;
  datalist.insertBefore(option, datalist.options[0]);  
  // limit database to 5 items
  if (datalist.options.length > searchHistoryLimit) {
    datalist.removeChild(datalist.lastElementChild);
  };

}
//=========================
// Send To Storage
function sendToStorage() {
  let arrayString = JSON.stringify(searchArray);
  localStorage.setItem('searchHistory', arrayString);
};





//===============================================================================================================================
// ========== SEARCH EVENT LISTENER =========== //
searchButton.addEventListener('click', function(event) {
  event.preventDefault(); // prevent form submission

  //breaks clickfunction if input is empty
  if (inputField.value == '') {
    return;
  };

  addSearchToHistory();
  sendToStorage();

  let gameName = inputField.value.trim().replace(/ /g, '-'); // Replace spaces with +
  const rawgApiUrl = `https://api.rawg.io/api/games/${gameName}?language=en&key=${rawgAPIKey}`;
  fetchRawgApi(rawgApiUrl);
});



// ========== RAWG API REQUEST =========== //
function fetchRawgApi(rawgApiUrl) {
  const searchQuery = inputField.value;
  // perform search with searchQuery
  console.log(`Searching for ${searchQuery}`);
  // make a request to the RAWG API
  fetch(rawgApiUrl)
    .then(response => response.json())
    .then(data => {
      const pcPlatforms = data.platforms.filter(platform => platform.platform.name === "PC");
      const minimumRequirements = pcPlatforms[0].requirements.minimum;
      const recommendedRequirements = pcPlatforms[0].requirements.recommended;
      console.log(minimumRequirements);
      console.log(recommendedRequirements);

      if (data.results) {
        const filteredGames = data.results.filter(game => game.rating > 4.5); // or any other condition
        console.log(filteredGames);
      }

      //run useInfo function when data is fetched
      useInfo(minimumRequirements, recommendedRequirements);
    })
    .catch(error => console.log(error));
}



// ========== USE RAWG DATA FUNCTION =========== //
function useInfo(minimumRequirements, recommendedRequirements) {
  //surrounded in an if to only build arrays if there are min or rec requirements
  if (minimumRequirements) {
    //split minReq strings into array
    let minReqArray = minimumRequirements.split('\n');
    console.log(minReqArray);
    //loop through neededComponents array, and build min components array
    for (i=0; i<neededComponents.length; i++) {
      let minComponentString = minReqArray.find(str => str.startsWith(neededComponents[i]));
      let minCompArray = minComponentString.split(':')[1].split(' or ');
      minComponentArray.push(minCompArray);
    };
    console.log(minComponentArray);
  }
  if (recommendedRequirements) {
    //split recReq strings into array
    let recReqArray = recommendedRequirements.split('\n');
    console.log(recReqArray);
    //loop through neededComponents array, and build rec components array
    for (i=0; i<neededComponents.length; i++) {
      let recComponentString = recReqArray.find(str => str.startsWith(neededComponents[i]));
      let recCompArray = recComponentString.split(':')[1].split(' or ');
      recComponentArray.push(recCompArray);
    };
    console.log(recComponentArray);
  }
  console.log(minComponentArray[0][0]);

  fetchRainforestApi();
};


// ========== RAINFOREST API REQUEST =========== //
function fetchRainforestApi() {
  let rfApiUrl = [`https://api.rainforestapi.com/request?api_key=${rainforestAPIKey}&type=search&amazon_domain=amazon.com&sort_by=featured&search_term=${minComponentArray[0][0]}`, `https://api.rainforestapi.com/request?api_key=${rainforestAPIKey}&type=search&amazon_domain=amazon.com&sort_by=featured&search_term=${minComponentArray[1][0]}`, `https://api.rainforestapi.com/request?api_key=${rainforestAPIKey}&type=search&amazon_domain=amazon.com&sort_by=featured&search_term=${minComponentArray[2][0]}`, `https://api.rainforestapi.com/request?api_key=${rainforestAPIKey}&type=search&amazon_domain=amazon.com&sort_by=featured&search_term=${minComponentArray[3][0]}`];
  let results = [];

  for (let i = 0; i < rfApiUrl.length; i++) {
    
   
 fetch(rfApiUrl[i])
  .then(response => response.json())
  .then(data => {
    console.log(data);
    try {
      const result1 = data.search_results[0].title ;
      const result2 = data.search_results[0].link;
      const result3 = data.search_results[0].image;
      const result4 = data.search_results[0].price.raw;
      
      const item = {
        title: result1,
        link: result2,
        image: result3,
        price: result4
      };
    
      results.push(item);
      console.log(results);
    } catch (error) {
      // Modify the value of result4 if it caused an error
      if (error instanceof TypeError || error.message.includes("cannot read property 'raw' of undefined")) {
        item.price = '';
      }
    }
  })
  .catch(error => console.log(error));

  // Clears array from previous search
}
  minComponentArray = [];
  recComponentArray = [];
};

function displayProductinfo() {
  const processorSpan = document.getElementById("processorspan");
  const memorySpan = document.getElementById("memoryspan");
  const graphicsSpan = document.getElementById("graphicsspan");
  const storageSpan = document.getElementById("storagespan");
  
  processorSpan.innerHTML = `${cpuResult1}, ${cpuLink1}, ${cpuimg1}, ${cpuPrice1}`;
  memorySpan.innerHTML = ``;
  graphicsSpan.innerHTML = ``;
  storageSpan.innerHTML = ``;

};
