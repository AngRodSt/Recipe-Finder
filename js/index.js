function startAplication() {

    const menuButton = document.querySelector('#menu-button');
    menuButton.addEventListener('click', ShowMenu)

    const result = document.querySelector('#result')
    const selectCategory = document.querySelector('#category')
    const modal = new bootstrap.Modal('#modal', {})
    const favoritesDiv= document.querySelector('.favorite');

    if (selectCategory) {
        selectCategory.addEventListener('change', selectionCategory)
        SearchCategory();
    }
    
    if(favoritesDiv){
        getFavorites();
    }

    function SearchCategory() {
        url = 'https://www.themealdb.com/api/json/v1/1/categories.php'

        fetch(url)
            .then(answer => answer.json())
            .then(result => showCategory(result.categories))
    }

    function selectionCategory(e) {
        const categoryName = e.target.value
        url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoryName}`
        fetch(url)
            .then(answer => answer.json())
            .then(result => showCategoryMeals(result.meals))
    }

    function selectMeal(id) {
        url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`
        fetch(url)
            .then(answer => answer.json())
            .then(result => showMeal(result.meals[0]))
    }

    function showCategory(categories = []) {
        categories.forEach(category => {
            const { strCategory } = category
            const opction = document.createElement('OPTION');
            opction.textContent = strCategory;
            opction.value = strCategory;
            selectCategory.appendChild(opction)
        });
    }

    function showCategoryMeals(meals = []) {
        cleanHTML(result)
        meals.forEach(meal => {
            const { idMeal, strMeal, strMealThumb } = meal
            const divContainer = document.createElement('DIV');
            divContainer.className = 'm-3 border rounded-md border-gray-300'
            divContainer.innerHTML = `
                <img class="w-full" src="${strMealThumb ?? meal.img}" alt = "${strMeal}">
            `
            const divBody = document.createElement('DIV');
            divBody.className = 'mx-2 flex flex-col gap-2 my-2';
            divBody.innerHTML = `
             <h3 class="text-3xl font-bold pb-3 ">${strMeal ?? meal.title}</h3>
            `
            buttonDescription = document.createElement('BUTTON');
            buttonDescription.className = 'rounded-md bg-purple-800 py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-purple-700 focus:shadow-none active:bg-purple-700 hover:bg-purple-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none ml-2';
            buttonDescription.textContent = 'Description'
            buttonDescription.setAttribute('data-toggle', 'modal')
            buttonDescription.onclick = () => {
                selectMeal(idMeal ?? meal.id)
            }

            divBody.appendChild(buttonDescription)
            divContainer.appendChild(divBody)
            result.appendChild(divContainer)
        });
    }
    function showMeal(recipe = []) {

        const {idMeal, strInstructions, strMeal, strMealThumb} = recipe;
        const modalTitle = document.querySelector('.modal .modal-title')
        const modalBody = document.querySelector('.modal .modal-body');

        modalTitle.textContent = strMeal;
        modalBody.innerHTML = `
            <img class="img-fluid" src="${strMealThumb}" alt="recipe ${strMeal}"/>
            <h3 class="my-3">Instructions</h3>
            <p>${strInstructions}</p>
            <h3 class="my-3">Ingredient and Measure</h3>
        `
        const listGroup = document.createElement('UL');
        listGroup.classList.add('list-group');

        for(let i = 1; i<=20; i++){
            if(recipe[`strIngredient${i}`]){
                const ingredients = recipe[`strIngredient${i}`]
                const amount = recipe[`strMeasure${i}`]

                const ingredientsLi = document.createElement('LI');
                ingredientsLi.classList.add('list-group-item');
                ingredientsLi.textContent = `${ingredients} - ${amount}`

                listGroup.appendChild(ingredientsLi)
            }
        }
        modalBody.appendChild(listGroup);

        const modalFooter = document.querySelector('.modal-footer');
        cleanHTML(modalFooter)

        const btnFavorite = document.createElement('BUTTON');
        btnFavorite.classList.add('btn', 'bg-purple-700', 'hover:bg-purple-600', 'text-white', 'col');
        btnFavorite.textContent = existeStorage(idMeal) ? 'Delete Favorite':'Save Favorite' 

        //LocalStorage
        btnFavorite.onclick = function(){

            if(existeStorage(idMeal)){
                DeleteFavorite(idMeal)

                btnFavorite.textContent = 'Save Favorite'
                showToast('Successfully Deleted ')
                return;
                
            }

            addFavorite({
                id: idMeal,
                title: strMeal,
                img:strMealThumb
            })
            btnFavorite.textContent = 'Delete Favorite'
            showToast('Successfully Saved')
        }

        const btnCloseModal = document.createElement('BUTTON');
        btnCloseModal.classList.add('btn', 'btn-secondary', 'col');
        btnCloseModal.textContent = 'Close';
        btnCloseModal.onclick = function(){
            modal.hide()
        }

        modalFooter.appendChild(btnFavorite);
        modalFooter.appendChild(btnCloseModal);

        modal.show()

    }

    function DeleteFavorite(id){
        const favorites = JSON.parse(localStorage.getItem('favorites')) ?? [];
        const nuevofavorite = favorites.filter(favorite => favorite.id !==id);
        localStorage.setItem('favorites', JSON.stringify(nuevofavorite))
    }

    function addFavorite(recipe){
        const favorites = JSON.parse(localStorage.getItem('favorites')) ?? [];
        localStorage.setItem('favorites', JSON.stringify([...favorites, recipe]))
    }

    function existeStorage(id){
        const favorites = JSON.parse(localStorage.getItem('favorites')) ?? [];
        return favorites.some(favorite => favorite.id === id);
    }

    function showToast(messege){
       const toastDiv = document.querySelector('#toast');
       const toastBody = document.querySelector('.toast-body');
        const toast = new bootstrap.Toast(toastDiv);
        toastBody.textContent = messege;
        toast.show()
        setTimeout(() => {
            toast.hide()
        }, 3000);

    }

    function getFavorites(){
        const favorites = JSON.parse(localStorage.getItem('favorites'))?? [];
        if(favorites.length){
            showCategoryMeals(favorites)
            return
        }
        const noFavorites = document.createElement('P');
        noFavorites.textContent = 'Add favorites here';
        noFavorites.classList.add('fs4', 'text-ceneter', 'font-bold', 'mt-5')
        favoritesDiv.appendChild(noFavorites);
    }
    function cleanHTML(selector){
        while(selector.firstChild){
            selector.removeChild(selector.firstChild)
        }
    }

    function ShowMenu(){
        const elements = document.querySelector('#menu-element')
        if(elements.classList.contains('hidden')){
            elements.classList.remove('hidden')
        }
        else{
            elements.classList.add('hidden')
        }
        
    }   
}
document.addEventListener('DOMContentLoaded', startAplication)
