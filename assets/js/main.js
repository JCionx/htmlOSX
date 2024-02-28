document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
});

function about() {
    openWindow("hsys.systeminfo");
}

if (typeof window.webkitConvertPointFromNodeToPage === 'function') {
    document.querySelector(".app .resizers").style.height = "0";
}

window.addEventListener('message', (event) => {
    console.log(event.data);
    let content = event.data;
    if (content.action == "sendNotification") {
        showNotification(content.appId, content.content, content.time);
    }
    if (content.action == "installApp") {
        requestInstallApp(content.appId, content.name, content.icon, content.url);
    }
})