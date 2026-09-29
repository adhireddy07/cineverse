const container = document.getElementById("favoriteContainer");

const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

if(favorites.length===0){

    container.innerHTML="<h3>No Favorite Movies Yet <i class="bi bi-heart-fill text-danger me-1"></i></h3>";

}else{

favorites.forEach(movie=>{

const poster=movie.poster
?`https://image.tmdb.org/t/p/w500${movie.poster}`
:"https://via.placeholder.com/300x450";

container.innerHTML+=`

<div class="col-md-3 mb-4">

<div class="card text-white">

<img src="${poster}" class="card-img-top">

<div class="card-body">

<h5>${movie.title}</h5>

<button
class="btn btn-danger w-100 mt-2"
onclick="removeFavorite(${movie.id})">
Remove
</button>

</div>

`;

});

}
function removeFavorite(id){

    let favorites =
    JSON.parse(localStorage.getItem("favorites")) || [];

    favorites = favorites.filter(movie => movie.id !== id);

    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );

    location.reload();

}