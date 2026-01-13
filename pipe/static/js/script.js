function toggleSections(idDeDeschis) {
    const sectiuni = document.querySelectorAll(".all-sections");

    sectiuni.forEach(div => {
        div.style.display = 'none';
    });

    const sectiuneaActiva = document.getElementById(idDeDeschis);
    if(sectiuneaActiva){
        sectiuneaActiva.style.display = 'block';
    }

    if (idDeDeschis === 'gallery-section') {
        $("#my-gallery").nanogallery2('resize');
    }
}

function toggleFilters() {
    let x = document.getElementById("filter-bar");

    if (x.style.display === "none"){
        x.style.display = "block";
    }else {
        x.style.display = "none";
    }

}




