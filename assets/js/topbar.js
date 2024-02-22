let main_menu_html = "<button onclick='about()'>About this computer</button><button onclick='logout()'>Log Out</button><button onclick='restart()'>Restart</button>";
let app_menu_html = "<button onclick='quitApp()'>Quit</button>";
let main_menu = document.getElementById("main-menu");

function bodyClick() {
    setTimeout(function() {
        document.querySelectorAll('.menu').forEach(element => {
            element.style.display = "none";
        });
    }, 1)
}

let mousePos = {x: undefined, y: undefined};

window.addEventListener('mousemove', (event) => {
    mousePos = {x: event.clientX, y: event.clientY};
})

function openMenu(elmnt) {
    menu = elmnt.parentElement.querySelector(".menu");
    menu.innerHTML = main_menu_html;
    menu.style.left = mousePos.x + "px";
    setTimeout(function() {
        menu.style.display = "flex";
    }, 2)
}

function openAppMenu(elmnt) {
    menu = elmnt.parentElement.querySelector(".menu");
    menu.innerHTML = app_menu_html;
    menu.style.left = mousePos.x + "px";
    setTimeout(function() {
        menu.style.display = "flex";
    }, 2)
}