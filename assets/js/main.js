document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
});

function about() {
    openWindow("hsys.systeminfo");
}

if (typeof window.webkitConvertPointFromNodeToPage === 'function') {
    document.querySelector(".app .resizers").style.height = "0";
}