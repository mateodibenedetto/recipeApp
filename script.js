// Variables
const mealsEl = document.getElementById('meals');
const favoriteContainer = document.getElementById('fav-meals');
const searchTerm = document.getElementById('search-term');
const searchBtn = document.getElementById('search');
const mealPopup = document.getElementById('meal-popup');
const mealInfoEl = document.getElementById('meal-info');
const popupCloseBtn = document.getElementById('close-popup');


getRandomMeal();
fetchFavMeals();

// Obtiene una comida random con fetch de themealdb
async function getRandomMeal() {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
    const respData = await resp.json();
    const randomMeal = respData.meals[0]

    addMeal(randomMeal, true);
}

// Obtiene las comidas atravez de los id desde themealdb
async function getMealById(id) {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id);

    const respData = await resp.json();
    const meal = respData.meals[0];

    return meal;
}

// Al bucar por la barra de buscador va a buscar las comidas por term desde themealdb
async function getMealsBySearch(term) {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=" + term);

    const respData = await resp.json();
    const meals = respData.meals;

    return meals;
}

// Añanade comida random
function addMeal(mealData, random = false) {
    const meal = document.createElement('div');
    meal.classList.add('meal');

    meal.innerHTML = `
        <div class="meal-header">
            ${
                random 
                    ? `
            <span class="random"> Random Recipe
            </span>`
                    : ''
            }
            <img 
                src="${mealData.strMealThumb}"
                alt="${mealData.Meal}" 
            />
        </div>
        <div class="meal-body">
            <h4 class="h4">${mealData.strMeal}</h4>
            <button class="fav-btn">
                <i class="fas fa-heart"></i>
            </button>
        </div>
    `;

    const btn = meal.querySelector(".meal-body .fav-btn");
    const mealheader = meal.querySelector(".h4");

    // Se pone de color el corazon al darle click
    btn.addEventListener("click", () => {
        if(btn.classList.contains("active")) {
            removeMealLS(mealData.idMeal);
            btn.classList.remove("active");
        } else {
            addMealLS(mealData.idMeal);
            btn.classList.add("active");
        }

        fetchFavMeals();
    });

    mealheader.addEventListener('click', () => {
        showMealInfo(mealData);
    });

    mealsEl.appendChild(meal);
}

// Añade el id de la comida en el LocalStorage
function addMealLS(mealId) {
    const mealIds = getMealsLS();

    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]));
}

// Elimina el id de la comida del LocalStorage
function removeMealLS(mealId) {
    const mealIds = getMealsLS();

    localStorage.setItem(
        "mealIds",
        JSON.stringify(mealIds.filter((id) => id !== mealId))
    );    
}

// Obtiene la comida desde el LocalStorage
function getMealsLS() {
    const mealIds = JSON.parse(localStorage.getItem('mealIds'));

    return mealIds === null ? [] : mealIds;
}

// Hace un fecth de las comidas favoritas
async function fetchFavMeals() {
    // clean the container
    favoriteContainer.innerHTML = '';

    const mealIds = getMealsLS();

    for (let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i];
        meal = await getMealById(mealId);

        addMealFav(meal);
    }  
}

// Añanade las comidas favoritas al darle click al corazon
function addMealFav(mealData) {

    const favMeal = document.createElement('li');
    const btn2 = document.querySelector(".meal-body .fav-btn");

    favMeal.innerHTML = `
        <img class="img"
            src="${mealData.strMealThumb}"
            alt="${mealData.strMeal}"
        /><span>${mealData.strMeal}</span>
        <button class="clear"><i class="fas fa-times-circle"></i></button>
    `;
    
    const btn = favMeal.querySelector('.clear');
    const img = favMeal.querySelector('.img');


    btn.addEventListener('click', () => {
        removeMealLS(mealData.idMeal);
        btn2.classList.remove("active");
        fetchFavMeals();
    });

    img.addEventListener('click', () => {
        showMealInfo(mealData);
    });

    favoriteContainer.appendChild(favMeal);
}


// muesta la comida junto con la receta y los ingredientes
function showMealInfo(mealData) {
    // clean it up
    mealInfoEl.innerHTML = '';
    
    // update the meal info
    const mealEl = document.createElement('div');

    const ingredients = [];

    // get ingredients and measures
    for(let i = 1; i<20; i++) {
        if(mealData['strIngredient'+i]) {
            ingredients.push(`${mealData['strIngredient'+i]} - ${mealData['strMeasure'+i]}`);
        } else {
            break;
        }
    }

    mealEl.innerHTML = `
        <h1>${mealData.strMeal}</h1>
        <img 
           src="${mealData.strMealThumb}" 
           alt="${mealData.strMeal}">
        <p>
        ${mealData.strInstructions}
        </p>
        <h3>Ingredients:</h3>
        <ul>
            ${ingredients.map((ing) => `<li>${ing}</li>`).join("")}
        </ul>
    `;

    mealInfoEl.appendChild(mealEl);

    // show the popup
    mealPopup.classList.remove('hidden');

}


// Busca las comidas al darle click al boton de buscar
searchBtn.addEventListener('click', async () => {
    // clean container
    mealsEl.innerHTML = "";

    const search = searchTerm.value;
    const meals = await getMealsBySearch(search); 

    if(meals) {
        meals.forEach((meal) => {
            addMeal(meal);
        });
    }
});

// se cierra la ventana de la comida al darle click al boton de cerrar
popupCloseBtn.addEventListener('click', () => {
    mealPopup.classList.add('hidden');
});