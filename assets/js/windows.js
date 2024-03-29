let user_apps = JSON.parse(localStorage.getItem("installed_apps"));
let launchpad_trash_hovered = false;

if (user_apps == null) {
    user_apps = {};
}

let system_apps = {
    "hsys.systeminfo": {
        name: "About this computer",
        url: "apps/about/index.html",
        icon: "apps/about/icon.svg",
    },
    "hsys.daemon": {
        name: "System Daemon",
        url: "#",
        icon: "assets/icons/daemon.svg",
    },
    "sys.webbrowser": {
        name: "Browser",
        url: "apps/browser/index.html",
        icon: "apps/browser/icon.svg",
    },
    "sys.apilab": {
        name: "API Lab",
        url: "apps/apilab/index.html",
        icon: "apps/apilab/icon.svg",
    },
    "sys.timequick": {
        name: "TimeQuick",
        url: "apps/timequick/index.html",
        icon: "apps/timequick/icon.svg",
    },
    "sys.terminal": {
        name: "Terminal",
        url: "apps/terminal/index.html",
        icon: "apps/terminal/icon.png",
    },
};

function updateAppsList() {
    installed_apps = Object.assign({}, user_apps, system_apps);
}

updateAppsList();

let dock_apps = JSON.parse(localStorage.getItem("dock_apps"));

if (dock_apps == null) {
    dock_apps = {
        "sys.webbrowser": {
            name: "Browser",
            url: "apps/browser/index.html",
            icon: "apps/browser/icon.svg",
        },
        "sys.timequick": {
            name: "TimeQuick",
            url: "apps/timequick/index.html",
            icon: "apps/timequick/icon.svg",
        },
    };
}

function loadApps(apps_list) {
    for (let id in apps_list) {
        if (!id.startsWith("hsys")) {
            addToLaunchpad(id);
        }
    }
}

function loadDockApps(apps_list) {
    for (let id in apps_list) {
        if (!id.startsWith("hsys")) {
            addToDock(id);
        }
    }
}

loadApps(installed_apps);
loadDockApps(dock_apps);

let last_window = "";
let app_menu = document.getElementById("app-menu-container");
let current_z_index = 10;
let open_apps = [];
let minimized_apps = [];

function setLastAppOpen(elmnt) {
    last_window = elmnt.id;
    elmnt.style.zIndex = current_z_index;
    current_z_index += 1;
    app_menu.querySelector("#title").innerHTML =
        elmnt.querySelector("#title").innerHTML;
}

function makeResizableDiv(div) {
    const element = div;
    const resizers = div.querySelectorAll(".resizer");
    const minimum_size = 20;
    let original_width = 0;
    let original_height = 0;
    let original_x = 0;
    let original_y = 0;
    let original_mouse_x = 0;
    let original_mouse_y = 0;
    for (let i = 0; i < resizers.length; i++) {
        const currentResizer = resizers[i];
        currentResizer.addEventListener("mousedown", function (e) {
            e.preventDefault();
            original_width = parseFloat(
                getComputedStyle(element, null)
                    .getPropertyValue("width")
                    .replace("px", "")
            );
            original_height = parseFloat(
                getComputedStyle(element, null)
                    .getPropertyValue("height")
                    .replace("px", "")
            );
            original_x = element.getBoundingClientRect().left;
            original_y = element.getBoundingClientRect().top;
            original_mouse_x = e.pageX;
            original_mouse_y = e.pageY;
            window.addEventListener("mousemove", resize);
            window.addEventListener("mouseup", stopResize);
        });

        function resize(e) {
            if (currentResizer.classList.contains("bottom-right")) {
                const width = original_width + (e.pageX - original_mouse_x);
                const height = original_height + (e.pageY - original_mouse_y);
                if (width > minimum_size) {
                    element.style.width = width + "px";
                }
                if (height > minimum_size) {
                    element.style.height = height + "px";
                }
            } else if (currentResizer.classList.contains("bottom-left")) {
                const height = original_height + (e.pageY - original_mouse_y);
                const width = original_width - (e.pageX - original_mouse_x);
                if (height > minimum_size) {
                    element.style.height = height + "px";
                }
                if (width > minimum_size) {
                    element.style.width = width + "px";
                    element.style.left =
                        original_x + (e.pageX - original_mouse_x) + "px";
                }
            } else if (currentResizer.classList.contains("top-right")) {
                const width = original_width + (e.pageX - original_mouse_x);
                const height = original_height - (e.pageY - original_mouse_y);
                if (width > minimum_size) {
                    element.style.width = width + "px";
                }
                if (height > minimum_size) {
                    element.style.height = height + "px";
                    element.style.top =
                        original_y + (e.pageY - original_mouse_y) + "px";
                }
            } else {
                const width = original_width - (e.pageX - original_mouse_x);
                const height = original_height - (e.pageY - original_mouse_y);
                if (width > minimum_size) {
                    element.style.width = width + "px";
                    element.style.left =
                        original_x + (e.pageX - original_mouse_x) + "px";
                }
                if (height > minimum_size) {
                    element.style.height = height + "px";
                    element.style.top =
                        original_y + (e.pageY - original_mouse_y) + "px";
                }
            }
        }

        function stopResize() {
            window.removeEventListener("mousemove", resize);
        }
    }
}

function disableResizableDiv(div) {
    const element = document.querySelector(div);
    const resizers = document.querySelectorAll(div + " .resizer");
    for (let i = 0; i < resizers.length; i++) {
        const currentResizer = resizers[i];
        currentResizer.removeEventListener("mousedown", resizeFunction);
        window.removeEventListener("mousemove", resizeFunction);
        window.removeEventListener("mouseup", stopResizeFunction);
    }
}

// Make the DIV element draggable:

function dragElement(elmnt) {
    var pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;
    if (elmnt.querySelector("#titlebar")) {
        // if present, the header is where you move the DIV from:
        elmnt.querySelector("#titlebar").onmousedown = dragMouseDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = elmnt.offsetTop - pos2 + "px";
        elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

makeResizableDiv(".app");
dragElement(document.querySelector(".app"));

function expandButton(elmnt) {
    let app = elmnt.parentElement.parentElement.parentElement;
    app.style.transition = "250ms";
    app.classList.toggle("expanded");
    minimized_apps = minimized_apps.filter(
        (e) => e !== elmnt.parentElement.parentElement.parentElement.id
    );
    setTimeout(function () {
        app.style.transition = "0ms";
    }, 250);
    if (app.classList.contains("expanded")) {
        app.style.top = "35px";
        app.style.left = "5px";
        app.style.width = "calc(100vw - 10px)";
        app.style.height = "calc(100vh - 110px)";
    } else {
        app.style.top = "100px";
        app.style.left = "100px";
        app.style.width = "470px";
        app.style.height = "360px";
    }
}

function minimizeWindow(elmnt) {
    let app = elmnt.parentElement.parentElement.parentElement;
    app.classList.add("minimize_app_animation");
    minimized_apps.push(app.id);
    addDockIndicator(app.id);
    setTimeout(function () {
        app_menu.querySelector("#title").innerHTML = "";
    }, 2);
    setTimeout(function () {
        app.style.display = "none";
        app.classList.remove("minimize_app_animation");
    }, 1000);
}

function closeWindow(elmnt) {
    elmnt.parentElement.parentElement.parentElement.remove();
    open_apps = open_apps.filter(
        (e) => e !== elmnt.parentElement.parentElement.parentElement.id
    );
    minimized_apps = minimized_apps.filter(
        (e) => e !== elmnt.parentElement.parentElement.parentElement.id
    );
    try {
        removeDockIndicator(elmnt.parentElement.parentElement.parentElement.id);
    } catch (e) {
        console.log(e);
    }

    setTimeout(function () {
        app_menu.querySelector("#title").innerHTML = "";
    }, 2);
}

function openWindow(id) {
    closeLaunchpad();

    if (open_apps.includes(id)) {
        return;
    }

    title = installed_apps[id].name;
    url = installed_apps[id].url;
    icon = installed_apps[id].icon;

    let newWindow = document.getElementById("default-window").cloneNode(true);
    newWindow.id = id;
    newWindow.querySelector("#title").innerHTML = title;
    newWindow.querySelector("iframe").src = url;
    newWindow.style.display = "block";
    newWindow.style.zIndex = current_z_index;
    current_z_index += 1;
    last_window = id;
    app_menu.querySelector("#title").innerHTML =
        newWindow.querySelector("#title").innerHTML;
    document.getElementById("windows").appendChild(newWindow);
    dragElement(newWindow);
    makeResizableDiv(newWindow);
    open_apps.push(id);
}

function launchFromDock(elmnt, id) {
    if (open_apps.includes(id)) {
        return;
    }
    openWindow(id);
    elmnt.classList.add("dock_item_open_animation");
    setTimeout(function () {
        elmnt.classList.remove("dock_item_open_animation");
    }, 850);
}

function quitApp() {
    closeWindow(
        document
            .getElementById(last_window)
            .querySelector(".titlebar-close-button")
    );
}

function openLaunchpad() {
    document.getElementById("launchpad").style.display = "flex";
    document.getElementById("launchpad").style.opacity = 0;
    setTimeout(function () {
        document.getElementById("launchpad").style.opacity = 1;
    }, 1);
}

function closeLaunchpad() {
    document.getElementById("launchpad").style.opacity = 0;
    setTimeout(function () {
        document.getElementById("launchpad").style.display = "none";
    }, 300);
}

function addToLaunchpad(id) {
    title = installed_apps[id].name;
    icon = installed_apps[id].icon;

    let newEntry = document
        .getElementById("default-launchpad-app")
        .cloneNode(true);
    newEntry.id = id;
    newEntry.querySelector("#launchpad-app-title").innerHTML = title;
    newEntry.querySelector("#launchpad-app-icon").src = icon;

    document.getElementById("launchpad").appendChild(newEntry);
    newEntry.setAttribute("onclick", "openWindow('" + id + "')");
    newEntry.setAttribute(
        "oncontextmenu",
        "addToDock('" +
            id +
            "');saveApps();showNotification('hsys.daemon', 'Added to dock', 3000)"
    );
}

function addToDock(id) {
    title = installed_apps[id].name;
    icon = installed_apps[id].icon;
    url = installed_apps[id].url;

    let newEntry = document.getElementById("default-dock-app").cloneNode(true);
    newEntry.id = "dock-" + id;
    newEntry.src = icon;
    newEntry.setAttribute("onclick", "launchFromDock(this, '" + id + "')");
    newEntry.setAttribute(
        "oncontextmenu",
        "this.remove();saveApps();showNotification('hsys.daemon', 'Removed from dock', 3000)"
    );
    let dock = document.getElementById("dock");
    let dockItems = dock.getElementsByClassName("dock-item");
    let lastDockItem = dockItems[dockItems.length - 1];

    dock.insertBefore(newEntry, lastDockItem.nextSibling);
}

function addDockIndicator(id) {
    let separator = document.getElementById("dock-separator");
    separator.style.display = "block";

    title = installed_apps[id].name;
    icon = installed_apps[id].icon;
    url = installed_apps[id].url;

    let newEntry = document.getElementById("default-dock-app").cloneNode(true);
    newEntry.id = "dock-indicator-" + id;
    newEntry.src = icon;
    newEntry.setAttribute("onclick", "launchIndicator('" + id + "')");

    document.getElementById("dock").appendChild(newEntry);
}

function removeDockIndicator(id) {
    document.getElementById("dock-indicator-" + id).remove();
    if (minimized_apps.length == 0) {
        document.getElementById("dock-separator").style.display = "none";
    }
}

function launchIndicator(id) {
    app = document.getElementById(id);
    if (app.style.display == "none") {
        app.style.display = "block";
        app.classList.add("bring_app_animation");
        minimized_apps = minimized_apps.filter((e) => e !== id);
        removeDockIndicator(id);
        setTimeout(function () {
            app.classList.remove("bring_app_animation");
        }, 1000);
    } else {
        minimizeWindow(app.querySelector(".titlebar-minimize-button"));
    }
}

function hideNotification() {
    notification.classList.add("notification-hide-animation");
    setTimeout(function () {
        notification.style.display = "none";
        notification.classList.remove("notification-hide-animation");
    }, 250);
}

function showNotification(id, content = "Sent a notification", time = 3000) {
    let notification = document.getElementById("notification");
    notification.querySelector("strong").innerHTML = installed_apps[id].name;
    notification.querySelector("span").innerHTML = content;
    notification.querySelector("img").src = installed_apps[id].icon;
    notification.style.display = "flex";
    notification.classList.add("notification-show-animation");
    setTimeout(function () {
        notification.classList.remove("notification-show-animation");
        setTimeout(function () {
            hideNotification();
        }, time);
    }, 250);
}

function saveApps() {
    localStorage.setItem("installed_apps", JSON.stringify(user_apps));
    dock_apps = {};
    document.querySelectorAll(".dock-item").forEach((element) => {
        if (element.id.startsWith("dock-indicator-")) {
            return;
        }
        if (element.id == "default-dock-app") {
            return;
        }
        console.log(installed_apps[element.id.split("dock-")[1]]);
        dock_apps[element.id.split("dock-")[1]] =
            installed_apps[element.id.split("dock-")[1]];
    });
    localStorage.setItem("dock_apps", JSON.stringify(dock_apps));
}

function installUserApp(id, name, icon, url) {
    if (user_apps[id] != undefined) {
        showNotification("hsys.daemon", name + " is already installed", 3000);
        return;
    }
    user_apps[id] = {
        name: name,
        url: url,
        icon: icon,
    };
    updateAppsList();
    addToLaunchpad(id);
    showNotification("hsys.daemon", name + " installed successfully", 3000);
    saveApps();
}

function requestInstallApp(id, name, icon, url) {
    if (id.startsWith("hsys") || id.startsWith("sys")) {
        showNotification(
            "hsys.daemon",
            "You can't install system apps from untrusted sources",
            5000
        );
        return;
    }
    let app_alert = document.getElementById("alert");
    app_alert.style.display = "flex";
    app_alert.querySelector("strong").innerHTML =
        "Do you want to install the app “" + name + "”?";
    app_alert.querySelector("img").src = icon;
    app_alert
        .querySelector("#install-btn")
        .setAttribute(
            "onclick",
            "installUserApp('" +
                id +
                "', '" +
                name +
                "', '" +
                icon +
                "', '" +
                url +
                "');this.parentElement.parentElement.parentElement.style.display = 'none'"
        );
}

function uninstallUserApp(id) {
    if (id.startsWith("hsys") || id.startsWith("sys")) {
        showNotification(
            "hsys.daemon",
            "You can't uninstall system apps",
            3000
        );
        return;
    }
    delete user_apps[id];
    updateAppsList();
    closeWindow(
        document.getElementById(id).querySelector(".titlebar-close-button")
    );
    document.getElementById(id).remove();
    try {
        document.getElementById("dock-" + id).remove();
    } catch (e) {
        console.log(e);
    }
    saveApps();
}

function dragEnterLaunchpadApp() {
    launchpad_trash_hovered = true;
}
function dragLeaveLaunchpadApp() {
    setTimeout(function () {
        launchpad_trash_hovered = false;
    }, 100);
}
function trashLaunchpadApp(elmnt) {
    if (launchpad_trash_hovered) {
        console.log(elmnt.id);
        uninstallUserApp(elmnt.id);
    }
}
